package com.timeright.tcc.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
            Pattern.CASE_INSENSITIVE);

    private final UsuarioRepository usuarioRepository;
    private final NivelAcessoRepository nivelAcessoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          NivelAcessoRepository nivelAcessoRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.nivelAcessoRepository = nivelAcessoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // LISTAR
    // =========================
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAllExcludingUsers();
    }

    public List<Usuario> listarClientes() {
        return usuarioRepository.findAllUsers();
    }

    // =========================
    // BUSCAR POR ID
    // =========================
    public Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com id " + id));
    }

    // =========================
    // CADASTRAR (CORRIGIDO)
    // =========================
    @Transactional
    public Usuario salvar(Usuario usuario) {

        validarCadastro(usuario);

        String username = usuario.getUsername().trim().toLowerCase();

        if (usuarioRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        NivelAcesso nivel = nivelAcessoRepository.findByNomeIgnoreCase("manager")
                .orElseThrow(() -> new RuntimeException("Nível de acesso manager não encontrado."));

        Usuario novo = new Usuario();
        novo.setNome(usuario.getNome().trim());
        novo.setUsername(username);
        novo.setPassword(passwordEncoder.encode(usuario.getPassword()));
        novo.setNivelAcesso(nivel);
        novo.setStatusUsuario("ATIVO");
        novo.setDataCadastro(LocalDateTime.now());

        return usuarioRepository.save(novo);
    }

    private void validarCadastro(Usuario usuario) {
        if (usuario == null) {
            throw new RuntimeException("Dados do cadastro são obrigatórios");
        }
        if (usuario.getNome() == null || usuario.getNome().isBlank()) {
            throw new RuntimeException("Nome é obrigatório");
        }
        if (usuario.getUsername() == null
                || !EMAIL_PATTERN.matcher(usuario.getUsername().trim()).matches()) {
            throw new RuntimeException("E-mail inválido");
        }
        if (usuario.getPassword() == null || usuario.getPassword().length() < 6) {
            throw new RuntimeException("A senha deve ter no mínimo 6 caracteres");
        }
    }

    // =========================
    // ATUALIZAR
    // =========================
    @Transactional
    public Usuario atualizar(Long id, Usuario usuario) {

        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (usuario.getNome() != null && !usuario.getNome().isBlank())
            existente.setNome(usuario.getNome());

        if (usuario.getUsername() != null && !usuario.getUsername().isBlank())
            existente.setUsername(usuario.getUsername());

        if (usuario.getPassword() != null && !usuario.getPassword().isBlank())
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));

        existente.setDataAtualizacao(LocalDateTime.now());

        return usuarioRepository.save(existente);
    }

    // =========================
    // STATUS
    // =========================
    @Transactional
    public Usuario atualizarStatus(Long id, String novoStatus) {

        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        existente.setStatusUsuario(novoStatus);
        existente.setDataAtualizacao(LocalDateTime.now());

        return usuarioRepository.save(existente);
    }

    // =========================
    // DELETAR
    // =========================
    @Transactional
    public void deletar(Long id) {
        usuarioRepository.delete(findById(id));
    }

    // =========================
    // RECUPERAÇÃO DE SENHA
    // =========================
    @Transactional
    public void solicitarResetSenha(String username) {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        String token = UUID.randomUUID().toString();

        usuario.setResetToken(token);
        usuario.setResetTokenExpiracao(LocalDateTime.now().plusHours(1));

        usuarioRepository.save(usuario);

    }

    @Transactional
    public void redefinirSenha(String token, String novaSenha) {

        Usuario usuario = usuarioRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido."));

        if (usuario.getResetTokenExpiracao() == null ||
                LocalDateTime.now().isAfter(usuario.getResetTokenExpiracao())) {
            throw new RuntimeException("Token expirado.");
        }

        usuario.setPassword(passwordEncoder.encode(novaSenha));
        usuario.setResetToken(null);
        usuario.setResetTokenExpiracao(null);
        usuario.setDataAtualizacao(LocalDateTime.now());

        usuarioRepository.save(usuario);
    }

    // =========================
    // LOGIN (CORRIGIDO)
    // =========================
    public Usuario validarLogin(String username, String password) {

        // Evita erro quando o frontend envia campos vazios ou com nome diferente.
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return null;
        }

        String usernameNormalizado = username.trim().toLowerCase(Locale.ROOT);
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(usernameNormalizado);

        if (usuarioOpt.isPresent()) {

            Usuario usuario = usuarioOpt.get();

            if (!passwordEncoder.matches(password, usuario.getPassword())) {
                return null;
            }

            if (usuario.getStatusUsuario() == null ||
                    !"ATIVO".equalsIgnoreCase(usuario.getStatusUsuario())) {
                return null;
            }

            // O controle de tela/permissão deve ser feito pelo nivelAcesso no frontend.
            // Aqui o login só valida usuário, senha e status.
            return usuario;
        }

        return null;
    }
}
