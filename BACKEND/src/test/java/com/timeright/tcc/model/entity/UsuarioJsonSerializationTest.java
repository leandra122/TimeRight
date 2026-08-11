package com.timeright.tcc.model.entity;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class UsuarioJsonSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void serializacaoNaoExpoeSenhaNemTokensDeRecuperacao() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setNome("Usuario Teste");
        usuario.setUsername("usuario@teste.com");
        usuario.setPassword("senha-secreta");
        usuario.setResetToken("token-secreto");
        usuario.setResetTokenExpiracao(LocalDateTime.of(2026, 8, 11, 12, 0));

        JsonNode json = objectMapper.readTree(objectMapper.writeValueAsString(usuario));

        assertAll(
                () -> assertFalse(json.has("password")),
                () -> assertFalse(json.has("resetToken")),
                () -> assertFalse(json.has("resetTokenExpiracao")),
                () -> assertEquals("Usuario Teste", json.get("nome").asText()),
                () -> assertEquals("usuario@teste.com", json.get("username").asText()));
    }
}
