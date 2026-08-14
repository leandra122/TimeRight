package com.timeright.tcc.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.services.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SalaoConfiguracaoAgendamentoIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;

    private Usuario manager;
    private Usuario outroManager;
    private Usuario admin;
    private Usuario user;
    private Usuario employee;
    private Salao salao;
    private Salao salaoAlheio;

    @BeforeEach
    void setup() {
        manager = usuario("MANAGER", "manager-config@teste.com");
        outroManager = usuario("MANAGER", "outro-manager-config@teste.com");
        admin = usuario("ADM", "admin-config@teste.com");
        user = usuario("USER", "user-config@teste.com");
        employee = usuario("EMPLOYEE", "employee-config@teste.com");
        salao = salao("Salao proprio", "04252011000110", manager);
        salaoAlheio = salao("Salao alheio", "40688134000161", outroManager);
    }

    @Test
    void novosSaloesRecebemValoresPadrao() {
        assertEquals(120, salao.getAntecedenciaMinimaMinutos());
        assertEquals(60, salao.getLimiteAgendamentoDias());
    }

    @Test
    void gerenteProprietarioConsultaEAtualizaConfiguracao() throws Exception {
        mockMvc.perform(get("/saloes/{id}/configuracao-agendamento", salao.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.salaoId").value(salao.getId()))
                .andExpect(jsonPath("$.antecedenciaMinimaMinutos").value(120))
                .andExpect(jsonPath("$.limiteAgendamentoDias").value(60))
                .andExpect(jsonPath("$.fusoHorario").value("America/Sao_Paulo"));

        mockMvc.perform(put("/saloes/{id}/configuracao-agendamento", salao.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(180, 90)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.antecedenciaMinimaMinutos").value(180))
                .andExpect(jsonPath("$.limiteAgendamentoDias").value(90));

        Salao persistido = salaoRepository.findById(salao.getId()).orElseThrow();
        assertEquals(180, persistido.getAntecedenciaMinimaMinutos());
        assertEquals(90, persistido.getLimiteAgendamentoDias());
    }

    @Test
    void gerenteNaoConsultaNemAtualizaSalaoAlheio() throws Exception {
        mockMvc.perform(get("/saloes/{id}/configuracao-agendamento", salaoAlheio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/saloes/{id}/configuracao-agendamento", salaoAlheio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON).content(payload(30, 10)))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminMantemAcessoAdministrativoEquivalente() throws Exception {
        mockMvc.perform(get("/saloes/{id}/configuracao-agendamento", salaoAlheio.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        mockMvc.perform(put("/saloes/{id}/configuracao-agendamento", salaoAlheio.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON).content(payload(240, 30)))
                .andExpect(status().isOk());
    }

    @Test
    void userEEmployeeRecebemForbidden() throws Exception {
        for (Usuario usuario : new Usuario[] {user, employee}) {
            mockMvc.perform(get("/saloes/{id}/configuracao-agendamento", salao.getId())
                            .header("Authorization", bearer(usuario)))
                    .andExpect(status().isForbidden());
            mockMvc.perform(put("/saloes/{id}/configuracao-agendamento", salao.getId())
                            .header("Authorization", bearer(usuario))
                            .contentType(MediaType.APPLICATION_JSON).content(payload(120, 60)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void valoresForaDosLimitesSaoRejeitados() throws Exception {
        for (String invalido : new String[] {
                payload(-1, 60), payload(10081, 60), payload(120, 0), payload(120, 366)}) {
            mockMvc.perform(put("/saloes/{id}/configuracao-agendamento", salao.getId())
                            .header("Authorization", bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON).content(invalido))
                    .andExpect(status().isBadRequest());
        }
        Salao inalterado = salaoRepository.findById(salao.getId()).orElseThrow();
        assertEquals(120, inalterado.getAntecedenciaMinimaMinutos());
        assertEquals(60, inalterado.getLimiteAgendamentoDias());
    }

    @Test
    void payloadMaliciosoNaoAlteraGerenteStatusOuIdentidade() throws Exception {
        mockMvc.perform(put("/saloes/{id}/configuracao-agendamento", salao.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"antecedenciaMinimaMinutos\":60,\"limiteAgendamentoDias\":15,"
                                + "\"id\":999,\"status\":\"INATIVO\","
                                + "\"gerente\":{\"id\":" + outroManager.getId() + "}}"))
                .andExpect(status().isOk());

        Salao persistido = salaoRepository.findById(salao.getId()).orElseThrow();
        assertEquals(salao.getId(), persistido.getId());
        assertEquals("ATIVO", persistido.getStatus());
        assertEquals(manager.getId(), persistido.getGerente().getId());
    }

    @Test
    void catalogoPublicoPermanecePublico() throws Exception {
        mockMvc.perform(get("/saloes")).andExpect(status().isOk());
        mockMvc.perform(get("/saloes/{id}", salao.getId())).andExpect(status().isOk());
    }

    private String payload(int antecedencia, int limite) {
        return "{\"antecedenciaMinimaMinutos\":" + antecedencia
                + ",\"limiteAgendamentoDias\":" + limite + "}";
    }

    private Usuario usuario(String role, String username) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(role); nivel.setStatusNivelAcesso("ATIVO");
        nivel = nivelAcessoRepository.save(nivel);
        Usuario item = new Usuario();
        item.setNome(username); item.setUsername(username); item.setPassword("hash-teste");
        item.setStatusUsuario("ATIVO"); item.setNivelAcesso(nivel);
        return usuarioRepository.save(item);
    }

    private Salao salao(String nome, String cnpj, Usuario gerente) {
        Salao item = new Salao();
        item.setNome(nome); item.setCnpj(cnpj); item.setEmail(cnpj + "@teste.com");
        item.setEndereco("Rua Teste, 1"); item.setTelefone("11999999999");
        item.setStatus("ATIVO"); item.setGerente(gerente);
        return salaoRepository.saveAndFlush(item);
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
