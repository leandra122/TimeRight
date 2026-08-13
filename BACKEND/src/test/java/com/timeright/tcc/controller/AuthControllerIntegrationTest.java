package com.timeright.tcc.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtDecoder jwtDecoder;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    private Usuario usuarioAtivo;

    @BeforeEach
    void prepararUsuario() {
        NivelAcesso manager = new NivelAcesso();
        manager.setNome("manager");
        manager.setStatusNivelAcesso("ATIVO");
        manager = nivelAcessoRepository.save(manager);

        usuarioAtivo = novoUsuario("Gerente Teste", "gerente@teste.com", "senha-correta", "ATIVO", manager);
    }

    @Test
    void loginValidoRetornaDtoSeguroETokenValidavel() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"gerente@teste.com\",\"senha\":\"senha-correta\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andExpect(jsonPath("$.userId").value(usuarioAtivo.getId()))
                .andExpect(jsonPath("$.nome").value("Gerente Teste"))
                .andExpect(jsonPath("$.username").value("gerente@teste.com"))
                .andExpect(jsonPath("$.role").value("MANAGER"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.resetToken").doesNotExist())
                .andExpect(jsonPath("$.resetTokenExpiracao").doesNotExist())
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        Jwt jwt = jwtDecoder.decode(response.get("token").asText());

        assertThat(jwt.getSubject()).isEqualTo("gerente@teste.com");
        assertThat(jwt.getClaimAsString("role")).isEqualTo("MANAGER");
        assertThat(jwt.getClaimAsString("userId")).isEqualTo(usuarioAtivo.getId().toString());
        assertThat(jwt.getIssuedAt()).isNotNull();
        assertThat(jwt.getExpiresAt()).isAfter(jwt.getIssuedAt());
    }

    @Test
    void loginNormalizaEmailComEspacosEMaiusculas() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"  GERENTE@TESTE.COM  \",\"senha\":\"senha-correta\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("gerente@teste.com"));
    }

    @Test
    void senhaIncorretaRetornaNaoAutorizado() throws Exception {
        esperarNaoAutorizado("gerente@teste.com", "senha-incorreta");
    }

    @Test
    void usuarioInexistenteRetornaNaoAutorizado() throws Exception {
        esperarNaoAutorizado("inexistente@teste.com", "senha-correta");
    }

    @Test
    void usuarioInativoRetornaNaoAutorizado() throws Exception {
        usuarioAtivo.setStatusUsuario("INATIVO");
        usuarioRepository.saveAndFlush(usuarioAtivo);

        esperarNaoAutorizado("gerente@teste.com", "senha-correta");
    }

    private void esperarNaoAutorizado(String username, String senha) throws Exception {
        String body = objectMapper.writeValueAsString(new LoginPayload(username, senha));
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("E-mail ou senha inválidos"));
    }

    private Usuario novoUsuario(String nome, String username, String senha,
                                String status, NivelAcesso nivel) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(senha));
        usuario.setDataCadastro(LocalDateTime.now());
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario(status);
        return usuarioRepository.saveAndFlush(usuario);
    }

    private record LoginPayload(String username, String senha) {
    }
}
