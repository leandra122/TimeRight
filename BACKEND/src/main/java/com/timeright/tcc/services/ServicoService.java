package com.timeright.tcc.services;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final SalaoRepository salaoRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public ServicoService(ServicoRepository servicoRepository,
                          SalaoRepository salaoRepository,
                          AuthenticatedUserService authenticatedUserService) {
        this.servicoRepository = servicoRepository;
        this.salaoRepository = salaoRepository;
        this.authenticatedUserService = authenticatedUserService;
    }

    public List<Servico> listarTodos() {
        return servicoRepository.findAll();
    }

    public List<Servico> listarPorSalao(Long salaoId) {
        return servicoRepository.findBySalaoId(salaoId);
    }

    public List<Servico> listarMeus() {
        AuthenticatedUser user = requireManager();
        return servicoRepository.findBySalaoGerenteId(user.userId());
    }

    public Servico findById(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
    }

    @Transactional
    public Servico salvar(Servico servico) {
        AuthenticatedUser user = requireManager();
        if (servico.getSalao() == null || servico.getSalao().getId() == null) {
            throw new IllegalArgumentException("Salão é obrigatório");
        }
        Long salaoId = servico.getSalao().getId();
        Salao salao = salaoRepository.findById(salaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Salão não encontrado"));
        if (!salaoRepository.existsByIdAndGerenteId(salaoId, user.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        validarCampos(servico, true);

        Servico novo = new Servico();
        novo.setNome(servico.getNome().trim());
        novo.setDescricao(servico.getDescricao());
        novo.setPreco(servico.getPreco());
        novo.setDuracao(servico.getDuracao());
        novo.setStatus("ATIVO");
        novo.setSalao(salao);
        return servicoRepository.save(novo);
    }

    @Transactional
    public Servico atualizar(Long id, Servico dados) {
        Servico existente = buscarParaMutacao(id);
        validarCampos(dados, false);

        if (dados.getNome() != null) existente.setNome(dados.getNome().trim());
        if (dados.getDescricao() != null) existente.setDescricao(dados.getDescricao());
        if (dados.getPreco() != null) existente.setPreco(dados.getPreco());
        if (dados.getDuracao() != null) existente.setDuracao(dados.getDuracao());
        return servicoRepository.save(existente);
    }

    @Transactional
    public Servico atualizarStatus(Long id, String status) {
        validarStatus(status);
        Servico existente = buscarParaMutacao(id);
        existente.setStatus(status.toUpperCase());
        return servicoRepository.save(existente);
    }

    @Transactional
    public void deletar(Long id) {
        Servico servico = buscarParaMutacao(id);
        servico.setStatus("INATIVO");
        servicoRepository.save(servico);
    }

    private Servico buscarParaMutacao(Long id) {
        Servico servico = findById(id);
        AuthenticatedUser user = requireManager();
        if (!servicoRepository.existsByIdAndSalaoGerenteId(id, user.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return servico;
    }

    private AuthenticatedUser requireManager() {
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(user.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return user;
    }

    private void validarCampos(Servico servico, boolean criacao) {
        if ((criacao || servico.getNome() != null)
                && (servico.getNome() == null || servico.getNome().isBlank())) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if ((criacao || servico.getPreco() != null)
                && (servico.getPreco() == null || servico.getPreco() < 0)) {
            throw new IllegalArgumentException("Preço não pode ser negativo");
        }
        if ((criacao || servico.getDuracao() != null)
                && (servico.getDuracao() == null || servico.getDuracao() <= 0)) {
            throw new IllegalArgumentException("Duração deve ser positiva");
        }
    }

    private void validarStatus(String status) {
        if (status == null
                || !("ATIVO".equalsIgnoreCase(status) || "INATIVO".equalsIgnoreCase(status))) {
            throw new IllegalArgumentException("Status inválido. Use ATIVO ou INATIVO.");
        }
    }
}
