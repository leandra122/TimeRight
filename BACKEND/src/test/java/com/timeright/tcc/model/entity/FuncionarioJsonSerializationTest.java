package com.timeright.tcc.model.entity;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class FuncionarioJsonSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void serializacaoNaoExpoeSenhaEMantemCamposPublicos() throws Exception {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Funcionaria Teste");
        funcionario.setEmail("funcionaria@teste.com");
        funcionario.setSenha("senha-secreta");
        funcionario.setFuncao("Cabeleireira");
        funcionario.setStatus("ATIVO");
        funcionario.setObservacoes("Especialista em cortes");

        JsonNode json = objectMapper.readTree(objectMapper.writeValueAsString(funcionario));

        assertAll(
                () -> assertFalse(json.has("senha")),
                () -> assertEquals("Funcionaria Teste", json.get("nome").asText()),
                () -> assertEquals("funcionaria@teste.com", json.get("email").asText()),
                () -> assertEquals("Cabeleireira", json.get("funcao").asText()),
                () -> assertEquals("ATIVO", json.get("status").asText()),
                () -> assertEquals("Especialista em cortes", json.get("observacoes").asText()));
    }
}
