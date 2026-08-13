package com.timeright.tcc.services;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final SalaoRepository salaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticatedUserService authenticatedUserService;

    public FuncionarioService(FuncionarioRepository funcionarioRepository,
                              SalaoRepository salaoRepository,
                              PasswordEncoder passwordEncoder,
                              AuthenticatedUserService authenticatedUserService) {
        this.funcionarioRepository = funcionarioRepository;
        this.salaoRepository = salaoRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticatedUserService = authenticatedUserService;
    }

    public List<Funcionario> listarGlobal() {
        return funcionarioRepository.findAll();
    }

    public List<Funcionario> listarMeus() {
        AuthenticatedUser user = requireManager();
        return funcionarioRepository.findBySalaoGerenteId(user.userId());
    }

    public Funcionario buscarAutorizado(Long id) {
        Funcionario funcionario = buscarExistente(id);
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        if ("ADMIN".equals(user.role())) {
            return funcionario;
        }
        if (!"MANAGER".equals(user.role())
                || !funcionarioRepository.existsByIdAndSalaoGerenteId(id, user.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return funcionario;
    }

    @Transactional
    public Funcionario salvar(Funcionario funcionario, Long salaoId) {
        AuthenticatedUser user = requireManager();
        Salao salao = salaoRepository.findById(salaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Salão não encontrado"));
        if (!salaoRepository.existsByIdAndGerenteId(salaoId, user.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        if (funcionarioRepository.findByEmail(funcionario.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        if (funcionario.getSenha() == null || funcionario.getSenha().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória");
        }

        Funcionario novo = new Funcionario();
        novo.setNome(funcionario.getNome());
        novo.setEmail(funcionario.getEmail());
        novo.setSenha(passwordEncoder.encode(funcionario.getSenha()));
        novo.setObservacoes(funcionario.getObservacoes());
        novo.setFuncao(funcionario.getFuncao());
        novo.setStatus("ATIVO");
        novo.setSalao(salao);
        novo.setUsuario(null);
        return funcionarioRepository.save(novo);
    }

    @Transactional
    public Funcionario atualizar(Long id, Funcionario dados) {
        Funcionario existente = buscarParaMutacao(id);
        if (dados.getNome() != null) existente.setNome(dados.getNome());
        if (dados.getEmail() != null) existente.setEmail(dados.getEmail());
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            existente.setSenha(passwordEncoder.encode(dados.getSenha()));
        }
        if (dados.getFuncao() != null) existente.setFuncao(dados.getFuncao());
        if (dados.getObservacoes() != null) existente.setObservacoes(dados.getObservacoes());
        return funcionarioRepository.save(existente);
    }

    @Transactional
    public Funcionario atualizarStatus(Long id, String status) {
        validarStatus(status);
        Funcionario funcionario = buscarParaMutacao(id);
        funcionario.setStatus(status.toUpperCase());
        return funcionarioRepository.save(funcionario);
    }

    @Transactional
    public void deletar(Long id) {
        funcionarioRepository.delete(buscarParaMutacao(id));
    }

    private Funcionario buscarParaMutacao(Long id) {
        Funcionario funcionario = buscarExistente(id);
        AuthenticatedUser user = requireManager();
        if (!funcionarioRepository.existsByIdAndSalaoGerenteId(id, user.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return funcionario;
    }

    private Funcionario buscarExistente(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));
    }

    private AuthenticatedUser requireManager() {
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(user.role())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return user;
    }

    private void validarStatus(String status) {
        if (status == null
                || !("ATIVO".equalsIgnoreCase(status) || "INATIVO".equalsIgnoreCase(status))) {
            throw new IllegalArgumentException("Status inválido. Use ATIVO ou INATIVO.");
        }
    }
}
