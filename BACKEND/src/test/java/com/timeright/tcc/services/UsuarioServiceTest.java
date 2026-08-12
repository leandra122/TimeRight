package com.timeright.tcc.services;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private NivelAcessoRepository nivelAcessoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void salvarIgnoraNivelAdminEnviadoEUsaManagerDoRepositorio() {
        NivelAcesso adminEnviado = novoNivel(1L, "ADMIN");
        NivelAcesso managerDoRepositorio = novoNivel(2L, "manager");

        Usuario usuarioEnviado = new Usuario();
        usuarioEnviado.setNome("Gerente Teste");
        usuarioEnviado.setUsername("gerente@teste.com");
        usuarioEnviado.setPassword("senha-original");
        usuarioEnviado.setNivelAcesso(adminEnviado);

        when(usuarioRepository.findByUsername("gerente@teste.com")).thenReturn(Optional.empty());
        when(nivelAcessoRepository.findByNomeIgnoreCase("manager"))
                .thenReturn(Optional.of(managerDoRepositorio));
        when(passwordEncoder.encode("senha-original")).thenReturn("senha-codificada");
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Usuario resultado = usuarioService.salvar(usuarioEnviado);

        ArgumentCaptor<Usuario> usuarioSalvoCaptor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuarioSalvoCaptor.capture());
        verify(nivelAcessoRepository).findByNomeIgnoreCase("manager");

        Usuario usuarioSalvo = usuarioSalvoCaptor.getValue();
        assertAll(
                () -> assertSame(usuarioSalvo, resultado),
                () -> assertSame(managerDoRepositorio, usuarioSalvo.getNivelAcesso()),
                () -> assertNotSame(adminEnviado, usuarioSalvo.getNivelAcesso()),
                () -> assertEquals("manager", usuarioSalvo.getNivelAcesso().getNome()),
                () -> assertEquals("senha-codificada", usuarioSalvo.getPassword()),
                () -> assertEquals("ATIVO", usuarioSalvo.getStatusUsuario()),
                () -> assertNotNull(usuarioSalvo.getDataCadastro()));
    }

    @Test
    void salvarNormalizaNomeEEmail() {
        NivelAcesso manager = novoNivel(2L, "manager");
        Usuario usuario = new Usuario();
        usuario.setNome("  Gerente Teste  ");
        usuario.setUsername("  GERENTE@TESTE.COM  ");
        usuario.setPassword("123456");

        when(usuarioRepository.findByUsername("gerente@teste.com")).thenReturn(Optional.empty());
        when(nivelAcessoRepository.findByNomeIgnoreCase("manager")).thenReturn(Optional.of(manager));
        when(passwordEncoder.encode("123456")).thenReturn("senha-codificada");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Usuario resultado = usuarioService.salvar(usuario);

        assertAll(
                () -> assertEquals("Gerente Teste", resultado.getNome()),
                () -> assertEquals("gerente@teste.com", resultado.getUsername()));
    }

    @Test
    void salvarRejeitaSenhaCurtaAntesDeConsultarRepositorio() {
        Usuario usuario = new Usuario();
        usuario.setNome("Gerente Teste");
        usuario.setUsername("gerente@teste.com");
        usuario.setPassword("12345");

        RuntimeException erro = assertThrows(RuntimeException.class,
                () -> usuarioService.salvar(usuario));

        assertEquals("A senha deve ter no mínimo 6 caracteres", erro.getMessage());
        verifyNoInteractions(usuarioRepository, nivelAcessoRepository, passwordEncoder);
    }

    private NivelAcesso novoNivel(Long id, String nome) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setId(id);
        nivel.setNome(nome);
        nivel.setStatusNivelAcesso("ATIVO");
        return nivel;
    }
}
