package com.timeright.tcc.services;

import java.io.*;
import java.util.*;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import com.timeright.tcc.model.entity.*;
import com.timeright.tcc.model.repository.SalaoFotoRepository;
import com.timeright.tcc.security.AuthenticatedUserService;
import com.timeright.tcc.exception.ResourceNotFoundException;

@Service
public class SalaoFotoService {
    private final SalaoFotoRepository repository;
    private final SalaoService saloes;
    private final AuthenticatedUserService auth;
    private final EntityManager em;
    private final boolean habilitado;
    public record Foto(Long id, boolean principal, String url) {}
    private record Imagem(byte[] bytes, String tipo) {}
    public SalaoFotoService(SalaoFotoRepository repository, SalaoService saloes,
            AuthenticatedUserService auth, EntityManager em,
            @Value("${app.fotos.enabled:false}") boolean habilitado) {
        this.repository = repository; this.saloes = saloes; this.auth = auth;
        this.em = em; this.habilitado = habilitado;
    }
    private void verificar() {
        if (!habilitado) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Fotos ainda não habilitadas neste ambiente.");
    }
    private void autorizar(Long salaoId) {
        verificar();
        if (!"MANAGER".equals(auth.getCurrentUser().role())) throw new AccessDeniedException("Acesso negado");
        saloes.buscarAutorizado(salaoId);
        em.find(Salao.class, salaoId, LockModeType.PESSIMISTIC_WRITE);
    }
    private List<Foto> resposta(Long id) {
        return repository.findBySalaoIdOrderByIdAsc(id).stream()
            .map(f -> new Foto(f.getId(), f.isPrincipal(), "/saloes/" + id + "/fotos/" + f.getId() + "/imagem"))
            .toList();
    }
    @Transactional(readOnly = true)
    public List<Foto> listar(Long id) {
        verificar(); saloes.buscarPorId(id); return resposta(id);
    }
    @Transactional(readOnly = true)
    public SalaoFoto imagem(Long id, Long fotoId) {
        verificar(); return buscar(id, fotoId);
    }
    private SalaoFoto buscar(Long id, Long fotoId) {
        return repository.findById(fotoId).filter(f -> f.getSalaoId().equals(id))
            .orElseThrow(() -> new ResourceNotFoundException("Foto não encontrada"));
    }
    @Transactional
    public List<Foto> enviar(Long id, List<MultipartFile> arquivos) {
        autorizar(id);
        var existentes = repository.findBySalaoIdOrderByIdAsc(id);
        int total = existentes.size() + arquivos.size();
        if (arquivos.isEmpty() || total < 3 || total > 10)
            throw new IllegalArgumentException("A galeria deve ter entre 3 e 10 fotos. No primeiro envio, selecione pelo menos 3.");
        List<Imagem> imagens = arquivos.stream().map(this::validar).toList();
        boolean primeira = existentes.isEmpty();
        for (Imagem imagem : imagens) {
            SalaoFoto foto = new SalaoFoto();
            foto.setSalaoId(id); foto.setConteudo(imagem.bytes()); foto.setTipo(imagem.tipo());
            foto.setPrincipal(primeira); primeira = false; repository.save(foto);
        }
        return resposta(id);
    }
    @Transactional
    public List<Foto> substituir(Long id, Long fotoId, MultipartFile arquivo) {
        autorizar(id);
        SalaoFoto foto = buscar(id, fotoId);
        Imagem imagem = validar(arquivo);
        foto.setConteudo(imagem.bytes()); foto.setTipo(imagem.tipo());
        repository.save(foto); return resposta(id);
    }
    @Transactional
    public List<Foto> principal(Long id, Long fotoId) {
        autorizar(id);
        SalaoFoto escolhida = buscar(id, fotoId);
        for (SalaoFoto foto : repository.findBySalaoIdOrderByIdAsc(id)) foto.setPrincipal(false);
        repository.flush();
        escolhida.setPrincipal(true); repository.save(escolhida);
        return resposta(id);
    }
    @Transactional
    public List<Foto> remover(Long id, Long fotoId) {
        autorizar(id);
        SalaoFoto foto = buscar(id, fotoId);
        var todas = repository.findBySalaoIdOrderByIdAsc(id);
        if (todas.size() <= 3) throw new IllegalArgumentException("Mantenha pelo menos 3 fotos. Use Substituir para trocar uma imagem.");
        repository.delete(foto); repository.flush();
        if (foto.isPrincipal()) {
            SalaoFoto outra = todas.stream().filter(f -> !f.getId().equals(fotoId)).findFirst().orElseThrow();
            outra.setPrincipal(true); repository.save(outra);
        }
        return resposta(id);
    }
    private Imagem validar(MultipartFile arquivo) {
        if (arquivo.isEmpty() || arquivo.getSize() > 5 * 1024 * 1024)
            throw new IllegalArgumentException("Cada foto deve ter até 5 MB e não pode estar vazia.");
        try {
            byte[] bytes = arquivo.getBytes();
            try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
                var leitores = ImageIO.getImageReaders(input);
                if (!leitores.hasNext()) throw new IllegalArgumentException("Envie uma imagem JPEG ou PNG válida.");
                ImageReader reader = leitores.next();
                try {
                    reader.setInput(input);
                    String formato = reader.getFormatName().toLowerCase(Locale.ROOT);
                    if (!List.of("jpeg", "jpg", "png").contains(formato))
                        throw new IllegalArgumentException("Formatos aceitos: JPEG e PNG.");
                    int largura = reader.getWidth(0), altura = reader.getHeight(0);
                    if (largura <= 0 || altura <= 0 || (long) largura * altura > 16000000)
                        throw new IllegalArgumentException("A foto deve ter no máximo 16 megapixels.");
                    // Decodifica e regrava: não confia em extensão/MIME nem conserva conteúdo anexado.
                    var imagem = reader.read(0);
                    ByteArrayOutputStream output = new ByteArrayOutputStream();
                    String tipo = formato.equals("png") ? "png" : "jpeg";
                    if (!ImageIO.write(imagem, tipo, output)) throw new IOException();
                    if (output.size() > 5 * 1024 * 1024)
                        throw new IllegalArgumentException("A imagem processada excede 5 MB. Reduza a resolução.");
                    return new Imagem(output.toByteArray(), "image/" + tipo);
                } finally { reader.dispose(); }
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException("Não foi possível ler a foto. Envie um JPEG ou PNG válido.");
        }
    }
}
