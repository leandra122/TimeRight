package com.timeright.tcc.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import jakarta.persistence.EntityManager;
import com.timeright.tcc.model.entity.*;
import com.timeright.tcc.model.repository.*;
import com.timeright.tcc.services.JwtService;

@SpringBootTest(properties = "app.fotos.enabled=true")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SalaoFotoIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired UsuarioRepository usuarios;
    @Autowired NivelAcessoRepository niveis;
    @Autowired SalaoRepository saloes;
    @Autowired SalaoFotoRepository fotos;
    @Autowired EntityManager em;
    Usuario gerente, outro;
    Salao salao;
    @BeforeEach void setup() {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome("MANAGER"); nivel.setStatusNivelAcesso("ATIVO"); niveis.save(nivel);
        gerente = usuario(nivel, "dono@fotos.test");
        outro = usuario(nivel, "outro@fotos.test");
        salao = new Salao();
        salao.setNome("Salão real"); salao.setCnpj("04252011000110");
        salao.setEmail("salao@fotos.test"); salao.setTelefone("11999999999");
        salao.setEndereco("Rua Teste, 12"); salao.setStatus("ATIVO"); salao.setGerente(gerente);
        saloes.saveAndFlush(salao);
    }
    Usuario usuario(NivelAcesso nivel, String email) {
        Usuario u = new Usuario(); u.setNome(email); u.setUsername(email);
        u.setPassword("teste"); u.setStatusUsuario("ATIVO"); u.setNivelAcesso(nivel);
        return usuarios.save(u);
    }
    String token(Usuario u) { return "Bearer " + jwt.emitirToken(u); }
    String base() { return "/saloes/" + salao.getId() + "/fotos"; }
    MockMultipartFile arquivo(String campo) throws Exception {
        var out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", out);
        return new MockMultipartFile(campo, "foto.png", "image/png", out.toByteArray());
    }
    void enviarTres() throws Exception {
        mvc.perform(multipart(base()).file(arquivo("arquivos")).file(arquivo("arquivos")).file(arquivo("arquivos"))
            .header("Authorization", token(gerente))).andExpect(status().isOk());
    }
    @Test void persisteBytesEVinculoEEntregaImagemPublica() throws Exception {
        enviarTres();
        Long id = salao.getId();
        em.flush(); em.clear();
        var lista = fotos.findBySalaoIdOrderByIdAsc(id);
        assertEquals(3, lista.size());
        assertEquals(1, lista.stream().filter(SalaoFoto::isPrincipal).count());
        assertTrue(lista.get(0).getConteudo().length > 0);
        mvc.perform(get(base())).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(3));
        mvc.perform(get(base() + "/" + lista.get(0).getId() + "/imagem"))
            .andExpect(status().isOk()).andExpect(content().contentType("image/png"))
            .andExpect(content().bytes(lista.get(0).getConteudo()));
    }
    @Test void trocaPrincipalSubstituiERemoveExcedente() throws Exception {
        enviarTres();
        var lista = fotos.findBySalaoIdOrderByIdAsc(salao.getId());
        Long escolhida = lista.get(1).getId();
        mvc.perform(patch(base() + "/" + escolhida + "/principal").header("Authorization", token(gerente)))
            .andExpect(status().isOk());
        assertTrue(fotos.findById(escolhida).orElseThrow().isPrincipal());
        mvc.perform(multipart(base() + "/" + escolhida).file(arquivo("arquivo"))
            .with(r -> { r.setMethod("PUT"); return r; }).header("Authorization", token(gerente)))
            .andExpect(status().isOk());
        mvc.perform(multipart(base()).file(arquivo("arquivos")).header("Authorization", token(gerente)))
            .andExpect(status().isOk());
        mvc.perform(delete(base() + "/" + escolhida).header("Authorization", token(gerente)))
            .andExpect(status().isOk());
        em.flush(); em.clear();
        var restantes = fotos.findBySalaoIdOrderByIdAsc(salao.getId());
        assertEquals(3, restantes.size());
        assertEquals(1, restantes.stream().filter(SalaoFoto::isPrincipal).count());
    }
    @Test void impedeRemoverAbaixoDeTres() throws Exception {
        enviarTres();
        Long id = fotos.findBySalaoIdOrderByIdAsc(salao.getId()).get(0).getId();
        mvc.perform(delete(base() + "/" + id).header("Authorization", token(gerente)))
            .andExpect(status().isBadRequest());
    }
    @Test void exigeTresFotosNoPrimeiroEnvio() throws Exception {
        mvc.perform(multipart(base()).file(arquivo("arquivos")).header("Authorization", token(gerente)))
            .andExpect(status().isBadRequest());
        assertEquals(0, fotos.count());
    }
    @Test void rejeitaConteudoFalsoSemSalvarLoteParcial() throws Exception {
        mvc.perform(multipart(base()).file(arquivo("arquivos")).file(arquivo("arquivos"))
            .file(new MockMultipartFile("arquivos", "falsa.png", "image/png", "nao e imagem".getBytes()))
            .header("Authorization", token(gerente))).andExpect(status().isBadRequest());
        assertEquals(0, fotos.count());
    }
    @Test void rejeitaArquivoMaiorQueCincoMB() throws Exception {
        mvc.perform(multipart(base()).file(arquivo("arquivos")).file(arquivo("arquivos"))
            .file(new MockMultipartFile("arquivos", "grande.png", "image/png", new byte[5 * 1024 * 1024 + 1]))
            .header("Authorization", token(gerente))).andExpect(status().isBadRequest());
        assertEquals(0, fotos.count());
    }
    @Test void outroGerenteNaoPodeAlterarFotos() throws Exception {
        enviarTres();
        Long id = fotos.findBySalaoIdOrderByIdAsc(salao.getId()).get(0).getId();
        mvc.perform(multipart(base()).file(arquivo("arquivos")).header("Authorization", token(outro)))
            .andExpect(status().isForbidden());
        mvc.perform(patch(base() + "/" + id + "/principal").header("Authorization", token(outro)))
            .andExpect(status().isForbidden());
        mvc.perform(delete(base() + "/" + id).header("Authorization", token(outro)))
            .andExpect(status().isForbidden());
        mvc.perform(multipart(base() + "/" + id).file(arquivo("arquivo"))
            .with(r -> { r.setMethod("PUT"); return r; }).header("Authorization", token(outro)))
            .andExpect(status().isForbidden());
    }
    @Test void exigeAutenticacaoParaEnviar() throws Exception {
        mvc.perform(multipart(base()).file(arquivo("arquivos"))).andExpect(status().isUnauthorized());
    }
    @Test void fotoNaoPodeSerLidaPorIdDeOutroSalao() throws Exception {
        enviarTres();
        Long id = fotos.findBySalaoIdOrderByIdAsc(salao.getId()).get(0).getId();
        mvc.perform(get("/saloes/999999/fotos/" + id + "/imagem")).andExpect(status().isNotFound());
    }
}
