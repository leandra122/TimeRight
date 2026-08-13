package com.timeright.tcc.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.integration.CnpjConsultaGateway;
import com.timeright.tcc.integration.CnpjConsultaResultado;
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
class SalaoOwnershipIntegrationTest {

    private static final String CNPJ_UM = "04.252.011/0001-10";
    private static final String CNPJ_DOIS = "40.688.134/0001-61";

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;

    @MockBean private CnpjConsultaGateway cnpjGateway;

    private Usuario manager;
    private Usuario outroManager;
    private Usuario admin;
    private Usuario user;
    private Usuario employee;

    @BeforeEach
    void setup() {
        manager = salvarUsuario("MANAGER", "manager@teste.com");
        outroManager = salvarUsuario("MANAGER", "outro-manager@teste.com");
        admin = salvarUsuario("ADM", "admin@teste.com");
        user = salvarUsuario("USER", "user@teste.com");
        employee = salvarUsuario("EMPLOYEE", "employee@teste.com");

        when(cnpjGateway.consultar(anyString())).thenAnswer(invocation -> {
            String cnpj = invocation.getArgument(0);
            return new CnpjConsultaResultado(cnpj.replaceAll("\\D", ""),
                    "Razão Teste", "Salão Teste", "ATIVA");
        });
    }

    @Test
    void managerCriaSalaoEViraProprietarioAutomaticamente() throws Exception {
        mockMvc.perform(post("/saloes/com-servicos")
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(CNPJ_UM, null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.gerente").doesNotExist());

        Salao criado = salaoRepository.findAll().get(0);
        org.junit.jupiter.api.Assertions.assertEquals(manager.getId(), criado.getGerente().getId());
    }

    @Test
    void managerPodeCriarDoisSaloes() throws Exception {
        criarSalao(manager, CNPJ_UM);
        criarSalao(manager, CNPJ_DOIS);

        org.junit.jupiter.api.Assertions.assertEquals(2,
                salaoRepository.findByGerenteId(manager.getId()).size());
    }

    @Test
    void managerNaoDefineOutroProprietarioPeloPayload() throws Exception {
        mockMvc.perform(post("/saloes/com-servicos")
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(CNPJ_UM, outroManager.getId())))
                .andExpect(status().isCreated());

        Salao criado = salaoRepository.findAll().get(0);
        org.junit.jupiter.api.Assertions.assertEquals(manager.getId(), criado.getGerente().getId());
    }

    @Test
    void listarMeusSaloesRetornaSomenteSaloesDoJwt() throws Exception {
        salvarSalao("Meu salão", CNPJ_UM, manager);
        salvarSalao("Salão alheio", CNPJ_DOIS, outroManager);

        mockMvc.perform(get("/saloes/me").header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome").value("Meu salão"))
                .andExpect(jsonPath("$[0].gerente").doesNotExist());
    }

    @Test
    void listarMeusSaloesSemTokenRetorna401() throws Exception {
        mockMvc.perform(get("/saloes/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void listarMeusSaloesNegaAdminUserEEmployee() throws Exception {
        mockMvc.perform(get("/saloes/me").header("Authorization", bearer(admin)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/saloes/me").header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/saloes/me").header("Authorization", bearer(employee)))
                .andExpect(status().isForbidden());
    }

    @Test
    void managerAtualizaSalaoProprioENaoAlheio() throws Exception {
        Salao proprio = salvarSalao("Próprio", CNPJ_UM, manager);
        Salao alheio = salvarSalao("Alheio", CNPJ_DOIS, outroManager);

        mockMvc.perform(put("/saloes/{id}", proprio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Atualizado\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Atualizado"));
        mockMvc.perform(put("/saloes/{id}", alheio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Acesso negado"));
    }

    @Test
    void managerExcluiSalaoProprioENaoAlheio() throws Exception {
        Salao proprio = salvarSalao("Próprio", CNPJ_UM, manager);
        Salao alheio = salvarSalao("Alheio", CNPJ_DOIS, outroManager);

        mockMvc.perform(delete("/saloes/{id}", alheio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/saloes/{id}", proprio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk());

        org.junit.jupiter.api.Assertions.assertTrue(salaoRepository.existsById(alheio.getId()));
        org.junit.jupiter.api.Assertions.assertFalse(salaoRepository.existsById(proprio.getId()));
    }

    @Test
    void adminAtualizaEExcluiQualquerSalao() throws Exception {
        Salao alheio = salvarSalao("Alheio", CNPJ_UM, outroManager);

        mockMvc.perform(put("/saloes/{id}", alheio.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Administrado\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/saloes/{id}", alheio.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void dashboardPorSalaoRespeitaPropriedadeEPermiteAdmin() throws Exception {
        Salao proprio = salvarSalao("Próprio", CNPJ_UM, manager);
        Salao alheio = salvarSalao("Alheio", CNPJ_DOIS, outroManager);

        mockMvc.perform(get("/dashboard/stats/salao/{id}", proprio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/dashboard/stats/salao/{id}", alheio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/dashboard/stats/salao/{id}", alheio.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void salaoSemGerenteSomenteAdminPodeAdministrar() throws Exception {
        Salao legado = salvarSalao("Legado", CNPJ_UM, null);

        mockMvc.perform(put("/saloes/{id}", legado.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/saloes/{id}", legado.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Legado administrado\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void salaoInexistenteContinuaRetornando404() throws Exception {
        mockMvc.perform(put("/saloes/999999")
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Inexistente\"}"))
                .andExpect(status().isNotFound());
    }

    private void criarSalao(Usuario usuario, String cnpj) throws Exception {
        mockMvc.perform(post("/saloes/com-servicos")
                        .header("Authorization", bearer(usuario))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(cnpj, null)))
                .andExpect(status().isCreated());
    }

    private String payload(String cnpj, Long gerenteId) {
        String gerente = gerenteId == null ? "" : ",\"gerente\":{\"id\":" + gerenteId + "}";
        return "{\"nome\":\"Salão Novo\",\"cnpj\":\"" + cnpj
                + "\",\"email\":\"salao@teste.com\",\"telefone\":\"11999999999\""
                + ",\"endereco\":\"Rua Teste, 1\"" + gerente + "}";
    }

    private Salao salvarSalao(String nome, String cnpj, Usuario gerente) {
        Salao salao = new Salao();
        salao.setNome(nome);
        salao.setCnpj(cnpj.replaceAll("\\D", ""));
        salao.setEmail(nome.toLowerCase().replace(" ", "") + "@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        salao.setGerente(gerente);
        return salaoRepository.saveAndFlush(salao);
    }

    private Usuario salvarUsuario(String role, String username) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(role);
        nivel.setStatusNivelAcesso("ATIVO");
        nivel = nivelAcessoRepository.save(nivel);

        Usuario usuario = new Usuario();
        usuario.setNome(username);
        usuario.setUsername(username);
        usuario.setPassword("senha-teste");
        usuario.setStatusUsuario("ATIVO");
        usuario.setNivelAcesso(nivel);
        return usuarioRepository.save(usuario);
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
