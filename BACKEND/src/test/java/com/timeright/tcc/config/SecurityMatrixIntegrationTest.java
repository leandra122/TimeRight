package com.timeright.tcc.config;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.services.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityMatrixIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void loginPermanecePublico() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"inexistente@teste.com\",\"senha\":\"invalida\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("E-mail ou senha inválidos"));
    }

    @Test
    void catalogoDeSaloesEServicosPermanecePublico() throws Exception {
        mockMvc.perform(get("/saloes")).andExpect(status().isOk());
        mockMvc.perform(get("/servicos")).andExpect(status().isOk());
    }

    @Test
    void rotaPrivadaSemTokenRetornaNaoAutorizado() throws Exception {
        mockMvc.perform(get("/funcionarios"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error")
                        .value("Autenticação necessária ou token inválido"));
    }

    @Test
    void tokenInvalidoRetornaNaoAutorizado() throws Exception {
        mockMvc.perform(get("/funcionarios")
                        .header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error")
                        .value("Autenticação necessária ou token inválido"));
    }

    @Test
    void adminAcessaUsuariosEDashboardGlobal() throws Exception {
        String token = token("ADMIN");
        mockMvc.perform(get("/usuarios").header("Authorization", bearer(token)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/dashboard/stats").header("Authorization", bearer(token)))
                .andExpect(status().isOk());
    }

    @Test
    void managerNaoAcessaUsuariosNemDashboardGlobal() throws Exception {
        String token = token("MANAGER");
        mockMvc.perform(get("/usuarios").header("Authorization", bearer(token)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Acesso negado"));
        mockMvc.perform(get("/dashboard/stats").header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());
    }

    @Test
    void managerNaoAcessaClientesNemAgendaGlobaisMasAcessaRecursosProprios() throws Exception {
        String authorization = bearer(token("MANAGER"));
        mockMvc.perform(get("/usuarios/clientes").header("Authorization", authorization))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/funcionarios/me").header("Authorization", authorization))
                .andExpect(status().isOk());
        mockMvc.perform(get("/agendamentos").header("Authorization", authorization))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos/me").header("Authorization", authorization))
                .andExpect(status().isOk());
    }

    @Test
    void employeeEUserNaoAcessamRotasPrivadasGenericas() throws Exception {
        mockMvc.perform(get("/funcionarios")
                        .header("Authorization", bearer(token("EMPLOYEE"))))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos/usuario/1")
                        .header("Authorization", bearer(token("USER"))))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/funcionarios/me/agendamentos")
                        .header("Authorization", bearer(token("ADMIN"))))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/funcionarios/me/agendamentos")
                        .header("Authorization", bearer(token("MANAGER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void somenteUserAcessaRotasDeAgendamentoDoCliente() throws Exception {
        mockMvc.perform(get("/api/client/agendamentos"))
                .andExpect(status().isUnauthorized());
        for (String role : new String[] {"ADMIN", "MANAGER", "EMPLOYEE"}) {
            mockMvc.perform(get("/api/client/agendamentos")
                            .header("Authorization", bearer(token(role))))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/api/client/disponibilidade")
                            .param("funcionarioId", "1")
                            .param("servicoId", "1")
                            .param("data", "2026-08-25")
                            .header("Authorization", bearer(token(role))))
                    .andExpect(status().isForbidden());
        }
        mockMvc.perform(get("/api/client/disponibilidade")
                        .param("funcionarioId", "1")
                        .param("servicoId", "1")
                        .param("data", "2026-08-25"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/client/disponibilidade")
                        .param("funcionarioId", "1")
                        .param("servicoId", "1")
                        .param("data", "2026-08-25")
                        .header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cadastroClienteECatalogoDeFuncionariosSaoPublicos() throws Exception {
        mockMvc.perform(post("/api/auth/register/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/catalogo/saloes/999999/funcionarios"))
                .andExpect(status().isNotFound());
    }

    @Test
    void endpointNaoClassificadoENegado() throws Exception {
        mockMvc.perform(get("/endpoint-nao-classificado")
                        .header("Authorization", bearer(token("ADMIN"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Acesso negado"));
    }

    @Test
    void gerenteDoSalaoNaoApareceNoJson() throws Exception {
        Salao salao = new Salao();
        salao.setNome("Salao Teste");
        salao.setGerente(usuario("MANAGER"));

        JsonNode json = objectMapper.readTree(objectMapper.writeValueAsString(salao));

        assertFalse(json.has("gerente"));
    }

    private String token(String role) {
        return jwtService.emitirToken(usuario(role));
    }

    private Usuario usuario(String role) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(role);
        nivel.setStatusNivelAcesso("ATIVO");

        Usuario usuario = new Usuario();
        usuario.setId(99L);
        usuario.setNome("Usuario " + role);
        usuario.setUsername(role.toLowerCase() + "@teste.com");
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario("ATIVO");
        return usuario;
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
