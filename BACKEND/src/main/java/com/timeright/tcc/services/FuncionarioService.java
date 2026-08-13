package com.timeright.tcc.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.exception.ConflictException;
import com.timeright.tcc.exception.ResourceNotFoundException;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.security.AuthenticatedUser;
import com.timeright.tcc.security.AuthenticatedUserService;

@Service
public class FuncionarioService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", Pattern.CASE_INSENSITIVE);

    private final FuncionarioRepository funcionarioRepository;
    private final SalaoRepository salaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NivelAcessoRepository nivelAcessoRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticatedUserService authenticatedUserService;

    public FuncionarioService(FuncionarioRepository funcionarioRepository,
                              SalaoRepository salaoRepository,
                              UsuarioRepository usuarioRepository,
                              NivelAcessoRepository nivelAcessoRepository,
                              PasswordEncoder passwordEncoder,
                              AuthenticatedUserService authenticatedUserService) {
        this.funcionarioRepository = funcionarioRepository;
        this.salaoRepository = salaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.nivelAcessoRepository = nivelAcessoRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticatedUserService = authenticatedUserService;
    }

    public List<Funcionario> listarGlobal() { return funcionarioRepository.findAll(); }

    public List<Funcionario> listarMeus() {
        return funcionarioRepository.findBySalaoGerenteId(requireManager().userId());
    }

    public Funcionario buscarAutorizado(Long id) {
        Funcionario funcionario = buscarExistente(id);
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        if ("ADMIN".equals(user.role())) return funcionario;
        if (!"MANAGER".equals(user.role())
                || !funcionarioRepository.existsByIdAndSalaoGerenteId(id, user.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        return funcionario;
    }

    @Transactional
    public Funcionario salvar(Funcionario dados, Long salaoId) {
        AuthenticatedUser gerente = requireManager();
        Salao salao = salaoRepository.findById(salaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Salão não encontrado"));
        if (!salaoRepository.existsByIdAndGerenteId(salaoId, gerente.userId())) {
            throw new AccessDeniedException("Acesso negado");
        }

        String nome = validarNome(dados.getNome());
        String email = normalizarEValidarEmail(dados.getEmail());
        validarSenha(dados.getSenha());
        validarEmailDisponivel(email, null);

        NivelAcesso nivel = nivelAcessoRepository.findByNomeIgnoreCase("employee")
                .filter(item -> "ATIVO".equalsIgnoreCase(item.getStatusNivelAcesso()))
                .orElseThrow(() -> new IllegalArgumentException("Perfil employee ativo não encontrado"));
        String hash = passwordEncoder.encode(dados.getSenha());

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setUsername(email);
        usuario.setPassword(hash);
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario("ATIVO");
        usuario.setDataCadastro(LocalDateTime.now());
        usuario = usuarioRepository.save(usuario);

        Funcionario novo = new Funcionario();
        novo.setNome(nome);
        novo.setEmail(email);
        novo.setSenha(hash);
        novo.setObservacoes(dados.getObservacoes());
        novo.setFuncao(dados.getFuncao());
        novo.setStatus("ATIVO");
        novo.setSalao(salao);
        novo.setUsuario(usuario);
        return funcionarioRepository.save(novo);
    }

    @Transactional
    public Funcionario atualizar(Long id, Funcionario dados) {
        Funcionario existente = buscarParaMutacao(id);
        Usuario usuario = exigirUsuarioVinculado(existente);

        if (dados.getNome() != null) {
            String nome = validarNome(dados.getNome());
            existente.setNome(nome);
            usuario.setNome(nome);
        }
        if (dados.getEmail() != null) {
            String email = normalizarEValidarEmail(dados.getEmail());
            validarEmailDisponivel(email, existente.getId());
            existente.setEmail(email);
            usuario.setUsername(email);
        }
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            validarSenha(dados.getSenha());
            String hash = passwordEncoder.encode(dados.getSenha());
            existente.setSenha(hash);
            usuario.setPassword(hash);
        }
        if (dados.getFuncao() != null) existente.setFuncao(dados.getFuncao());
        if (dados.getObservacoes() != null) existente.setObservacoes(dados.getObservacoes());
        usuario.setDataAtualizacao(LocalDateTime.now());
        usuarioRepository.save(usuario);
        return funcionarioRepository.save(existente);
    }

    @Transactional
    public Funcionario atualizarStatus(Long id, String status) {
        validarStatus(status);
        Funcionario funcionario = buscarParaMutacao(id);
        Usuario usuario = exigirUsuarioVinculado(funcionario);
        String normalizado = status.toUpperCase(Locale.ROOT);
        funcionario.setStatus(normalizado);
        usuario.setStatusUsuario(normalizado);
        usuario.setDataAtualizacao(LocalDateTime.now());
        usuarioRepository.save(usuario);
        return funcionarioRepository.save(funcionario);
    }

    @Transactional
    public void deletar(Long id) {
        Funcionario funcionario = buscarParaMutacao(id);
        Usuario usuario = exigirUsuarioVinculado(funcionario);
        funcionario.setStatus("INATIVO");
        usuario.setStatusUsuario("INATIVO");
        usuario.setDataAtualizacao(LocalDateTime.now());
        usuarioRepository.save(usuario);
        funcionarioRepository.save(funcionario);
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

    private Usuario exigirUsuarioVinculado(Funcionario funcionario) {
        if (funcionario.getUsuario() == null) {
            throw new ConflictException("Funcionário legado sem conta de usuário vinculada");
        }
        return funcionario.getUsuario();
    }

    private AuthenticatedUser requireManager() {
        AuthenticatedUser user = authenticatedUserService.getCurrentUser();
        if (!"MANAGER".equals(user.role())) throw new AccessDeniedException("Acesso negado");
        return user;
    }

    private void validarEmailDisponivel(String email, Long funcionarioId) {
        boolean usadoNoFuncionario = funcionarioId == null
                ? funcionarioRepository.existsByEmail(email)
                : funcionarioRepository.existsByEmailAndIdNot(email, funcionarioId);
        Usuario usuarioAtual = funcionarioId == null ? null
                : funcionarioRepository.findById(funcionarioId).map(Funcionario::getUsuario).orElse(null);
        boolean usadoNoUsuario = usuarioRepository.findByUsername(email)
                .filter(item -> usuarioAtual == null || !item.getId().equals(usuarioAtual.getId()))
                .isPresent();
        if (usadoNoFuncionario || usadoNoUsuario) throw new ConflictException("Email já cadastrado");
    }

    private String validarNome(String nome) {
        if (nome == null || nome.isBlank()) throw new IllegalArgumentException("Nome é obrigatório");
        return nome.trim();
    }

    private String normalizarEValidarEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("E-mail inválido");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.length() < 6) {
            throw new IllegalArgumentException("A senha deve ter no mínimo 6 caracteres");
        }
    }

    private void validarStatus(String status) {
        if (status == null || !("ATIVO".equalsIgnoreCase(status) || "INATIVO".equalsIgnoreCase(status))) {
            throw new IllegalArgumentException("Status inválido. Use ATIVO ou INATIVO.");
        }
    }
}
