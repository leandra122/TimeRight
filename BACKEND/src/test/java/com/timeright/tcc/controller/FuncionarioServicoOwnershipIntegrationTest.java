package com.timeright.tcc.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.services.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FuncionarioServicoOwnershipIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private ServicoRepository servicoRepository;

    private Usuario manager;
    private Usuario outroManager;
    private Usuario admin;
    private Salao salaoUm;
    private Salao salaoDois;
    private Salao salaoAlheio;
    private Salao salaoLegado;
    private int employeeSequence;

    @BeforeEach
    void setup() {
        nivelAcessoRepository.save(nivel("EMPLOYEE"));
        manager = usuario("MANAGER", "manager-ownership@teste.com");
        outroManager = usuario("MANAGER", "outro-ownership@teste.com");
        admin = usuario("ADM", "admin-ownership@teste.com");
        salaoUm = salao("Salão Um", "04252011000110", manager);
        salaoDois = salao("Salão Dois", "40688134000161", manager);
        salaoAlheio = salao("Salão Alheio", "11222333000181", outroManager);
        salaoLegado = salao("Salão Legado", "19131243000197", null);
    }

    private NivelAcesso nivel(String role) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(role);
        nivel.setStatusNivelAcesso("ATIVO");
        return nivel;
    }

    @Test
    void gerenteListaFuncionariosDeTodosESomenteDosSeusSaloes() throws Exception {
        funcionario("Funcionário Um", "func1@teste.com", salaoUm);
        funcionario("Funcionário Dois", "func2@teste.com", salaoDois);
        funcionario("Funcionário Alheio", "func3@teste.com", salaoAlheio);

        mockMvc.perform(get("/funcionarios/me").header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].senha").doesNotExist());
    }

    @Test
    void gerenteCadastraSomenteEmSalaoProprioESenhaNaoAparece() throws Exception {
        mockMvc.perform(post("/funcionarios/{id}", salaoUm.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(funcionarioPayload(null, salaoAlheio.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.salao.id").value(salaoUm.getId()));

        Funcionario criado = funcionarioRepository.findByEmail("novo-funcionario@teste.com").orElseThrow();
        assertEquals(salaoUm.getId(), criado.getSalao().getId());
        org.junit.jupiter.api.Assertions.assertNotNull(criado.getUsuario());
        assertEquals("EMPLOYEE", criado.getUsuario().getNivelAcesso().getNome());

        mockMvc.perform(post("/funcionarios/{id}", salaoAlheio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(funcionarioPayload("outro@teste.com", null)))
                .andExpect(status().isForbidden());
    }

    @Test
    void gerenteBuscaEAtualizaSomenteFuncionarioProprioSemTransferirSalao() throws Exception {
        Funcionario proprio = funcionario("Próprio", "proprio@teste.com", salaoUm);
        Funcionario alheio = funcionario("Alheio", "alheio@teste.com", salaoAlheio);

        mockMvc.perform(get("/funcionarios/{id}", proprio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senha").doesNotExist());
        mockMvc.perform(get("/funcionarios/{id}", alheio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/funcionarios/{id}", proprio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Atualizado\",\"salao\":{\"id\":"
                                + salaoDois.getId() + "}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Atualizado"));
        assertEquals(salaoUm.getId(), funcionarioRepository.findById(proprio.getId())
                .orElseThrow().getSalao().getId());

        mockMvc.perform(put("/funcionarios/{id}", alheio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void gerenteAlteraStatusEExcluiSomenteFuncionarioProprio() throws Exception {
        Funcionario proprio = funcionario("Próprio", "status-proprio@teste.com", salaoUm);
        Funcionario alheio = funcionario("Alheio", "status-alheio@teste.com", salaoAlheio);

        mockMvc.perform(patch("/funcionarios/{id}/status", proprio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INATIVO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INATIVO"));
        mockMvc.perform(patch("/funcionarios/{id}/status", alheio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INATIVO\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/funcionarios/{id}", alheio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/funcionarios/{id}", proprio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk());
    }

    @Test
    void adminListaEBuscaMasNaoModificaFuncionarios() throws Exception {
        Funcionario alheio = funcionario("Global", "global@teste.com", salaoAlheio);
        mockMvc.perform(get("/funcionarios").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/funcionarios/{id}", alheio.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/funcionarios/{id}", salaoUm.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(funcionarioPayload("admin-novo@teste.com", null)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/funcionarios/{id}", alheio.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void funcionarioDeSalaoLegadoNaoPodeSerAdministradoPorGerente() throws Exception {
        Funcionario legado = funcionario("Legado", "legado@teste.com", salaoLegado);
        mockMvc.perform(put("/funcionarios/{id}", legado.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void catalogoDeServicosContinuaPublicoEMeExigeToken() throws Exception {
        Servico servico = servico("Corte", salaoUm);
        mockMvc.perform(get("/servicos")).andExpect(status().isOk());
        mockMvc.perform(get("/servicos/{id}", servico.getId())).andExpect(status().isOk());
        mockMvc.perform(get("/servicos/salao/{id}", salaoUm.getId())).andExpect(status().isOk());
        mockMvc.perform(get("/servicos/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void gerenteListaSomenteServicosDosSeusSaloes() throws Exception {
        servico("Corte", salaoUm);
        servico("Manicure", salaoDois);
        servico("Alheio", salaoAlheio);
        mockMvc.perform(get("/servicos/me").header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void gerenteCadastraServicoSomenteEmSalaoProprio() throws Exception {
        mockMvc.perform(post("/servicos")
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(servicoPayload("Novo", salaoUm.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.salao.id").value(salaoUm.getId()));
        mockMvc.perform(post("/servicos")
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(servicoPayload("Alheio", salaoAlheio.getId())))
                .andExpect(status().isForbidden());
    }

    @Test
    void gerenteAtualizaServicoProprioSemTransferirENaoAtualizaAlheio() throws Exception {
        Servico proprio = servico("Próprio", salaoUm);
        Servico alheio = servico("Alheio", salaoAlheio);
        mockMvc.perform(put("/servicos/{id}", proprio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Atualizado\",\"salao\":{\"id\":"
                                + salaoDois.getId() + "}}"))
                .andExpect(status().isOk());
        assertEquals(salaoUm.getId(), servicoRepository.findById(proprio.getId())
                .orElseThrow().getSalao().getId());
        mockMvc.perform(put("/servicos/{id}", alheio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void gerenteAlteraStatusEExcluiSomenteServicoProprio() throws Exception {
        Servico proprio = servico("Próprio", salaoUm);
        Servico alheio = servico("Alheio", salaoAlheio);
        mockMvc.perform(patch("/servicos/{id}/status", proprio.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"INATIVO\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/servicos/{id}", alheio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/servicos/{id}", proprio.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk());
        assertFalse(servicoRepository.existsById(proprio.getId()));
        assertTrue(servicoRepository.existsById(alheio.getId()));
    }

    @Test
    void adminNaoExecutaMutacoesDeServico() throws Exception {
        Servico servico = servico("Global", salaoUm);
        mockMvc.perform(post("/servicos").header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(servicoPayload("Novo", salaoUm.getId())))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/servicos/{id}", servico.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void servicoDeSalaoLegadoNaoPodeSerAdministradoPorGerente() throws Exception {
        Servico legado = servico("Legado", salaoLegado);
        mockMvc.perform(put("/servicos/{id}", legado.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Indevido\"}"))
                .andExpect(status().isForbidden());
    }

    private Usuario usuario(String role, String email) {
        NivelAcesso nivel = nivelAcessoRepository.findByNomeIgnoreCase(role)
                .orElseGet(() -> nivelAcessoRepository.save(nivel(role)));
        Usuario usuario = new Usuario();
        usuario.setNome(email);
        usuario.setUsername(email);
        usuario.setPassword("senha-teste");
        usuario.setStatusUsuario("ATIVO");
        usuario.setNivelAcesso(nivel);
        return usuarioRepository.save(usuario);
    }

    private Salao salao(String nome, String cnpj, Usuario gerente) {
        Salao salao = new Salao();
        salao.setNome(nome);
        salao.setCnpj(cnpj);
        salao.setEmail(cnpj + "@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        salao.setGerente(gerente);
        return salaoRepository.save(salao);
    }

    private Funcionario funcionario(String nome, String email, Salao salao) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha("hash-ficticio");
        funcionario.setFuncao("Cabeleireiro");
        funcionario.setStatus("ATIVO");
        funcionario.setSalao(salao);
        funcionario.setUsuario(usuario("EMPLOYEE",
                "employee-fixture-" + (++employeeSequence) + "@teste.com"));
        return funcionarioRepository.save(funcionario);
    }

    private Servico servico(String nome, Salao salao) {
        Servico servico = new Servico();
        servico.setNome(nome);
        servico.setDescricao("Descrição");
        servico.setPreco(50.0);
        servico.setDuracao(30);
        servico.setStatus("ATIVO");
        servico.setSalao(salao);
        return servicoRepository.save(servico);
    }

    private String funcionarioPayload(String email, Long salaoId) {
        String payloadEmail = email == null ? "novo-funcionario@teste.com" : email;
        String salao = salaoId == null ? "" : ",\"salao\":{\"id\":" + salaoId + "}"
                + ",\"usuario\":{\"id\":" + outroManager.getId() + "}";
        return "{\"nome\":\"Novo Funcionário\",\"email\":\"" + payloadEmail
                + "\",\"senha\":\"senha123\",\"funcao\":\"Barbeiro\"" + salao + "}";
    }

    private String servicoPayload(String nome, Long salaoId) {
        return "{\"nome\":\"" + nome + "\",\"descricao\":\"Descrição\","
                + "\"preco\":50.0,\"duracao\":30,\"salao\":{\"id\":" + salaoId + "}}";
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
