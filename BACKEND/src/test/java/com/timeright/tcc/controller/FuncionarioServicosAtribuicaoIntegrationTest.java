package com.timeright.tcc.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.lang.reflect.Method;
import java.util.List;

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
import com.timeright.tcc.model.entity.FuncionarioServico;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.FuncionarioServicoRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.services.JwtService;

import jakarta.persistence.LockModeType;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FuncionarioServicosAtribuicaoIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private ServicoRepository servicoRepository;
    @Autowired private FuncionarioServicoRepository funcionarioServicoRepository;

    private Usuario manager;
    private Usuario outroManager;
    private Usuario admin;
    private Usuario user;
    private Usuario employee;
    private Salao salao;
    private Salao outroSalao;
    private Funcionario funcionario;
    private Servico corte;
    private Servico barba;

    @BeforeEach
    void setup() {
        manager = usuario("MANAGER", "manager-atribuicao@teste.com");
        outroManager = usuario("MANAGER", "outro-atribuicao@teste.com");
        admin = usuario("ADM", "admin-atribuicao@teste.com");
        user = usuario("USER", "user-atribuicao@teste.com");
        employee = usuario("EMPLOYEE", "employee-auth-atribuicao@teste.com");
        salao = salao("Salao Principal", "11111111000111", manager);
        outroSalao = salao("Salao Alheio", "22222222000122", outroManager);
        funcionario = funcionario("Ana", "ana-atribuicao@teste.com", salao, "ATIVO");
        corte = servico("Corte", salao, "ATIVO");
        barba = servico("Barba", salao, "ATIVO");
    }

    @Test
    void managerProprietarioEAdminConsultamInclusiveServicoInativoSemDadosSensiveis() throws Exception {
        Servico inativo = servico("Coloracao", salao, "INATIVO");
        atribuir(corte, inativo);

        for (Usuario autorizado : List.of(manager, admin)) {
            mockMvc.perform(get("/funcionarios/{id}/servicos", funcionario.getId())
                            .header("Authorization", bearer(autorizado)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.funcionarioId").value(funcionario.getId()))
                    .andExpect(jsonPath("$.salaoId").value(salao.getId()))
                    .andExpect(jsonPath("$.servicos", hasSize(2)))
                    .andExpect(jsonPath("$.servicos[?(@.status == 'INATIVO')]").exists())
                    .andExpect(jsonPath("$.email").doesNotExist())
                    .andExpect(jsonPath("$.senha").doesNotExist())
                    .andExpect(jsonPath("$.gerente").doesNotExist())
                    .andExpect(jsonPath("$.servicos[0].salao").doesNotExist())
                    .andExpect(jsonPath("$.servicos[0].descricao").doesNotExist());
        }
    }

    @Test
    void managerDeOutroSalaoNaoConsulta() throws Exception {
        mockMvc.perform(get("/funcionarios/{id}/servicos", funcionario.getId())
                        .header("Authorization", bearer(outroManager)))
                .andExpect(status().isForbidden());
    }

    @Test
    void userEEmployeeNaoConsultam() throws Exception {
        for (Usuario negado : List.of(user, employee)) {
            mockMvc.perform(get("/funcionarios/{id}/servicos", funcionario.getId())
                            .header("Authorization", bearer(negado)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void managerProprietarioSubstituiMultiplosEliminaDuplicadosEIgnoraAutoridadeDoPayload()
            throws Exception {
        mockMvc.perform(put("/funcionarios/{id}/servicos", funcionario.getId())
                        .header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"servicoIds\":[" + corte.getId() + "," + barba.getId()
                                + "," + corte.getId() + "],\"gerenteId\":" + outroManager.getId()
                                + ",\"salaoId\":" + outroSalao.getId() + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.funcionarioId").value(funcionario.getId()))
                .andExpect(jsonPath("$.salaoId").value(salao.getId()))
                .andExpect(jsonPath("$.servicos", hasSize(2)));

        assertEquals(2, funcionarioServicoRepository
                .findByIdFuncionarioId(funcionario.getId()).size());
    }

    @Test
    void somenteManagerProprietarioAltera() throws Exception {
        for (Usuario negado : List.of(outroManager, admin, user, employee)) {
            mockMvc.perform(put("/funcionarios/{id}/servicos", funcionario.getId())
                            .header("Authorization", bearer(negado))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"servicoIds\":[]}"))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void listaVaziaRemoveTodasAsAtribuicoes() throws Exception {
        atribuir(corte, barba);

        substituir("[]").andExpect(status().isOk())
                .andExpect(jsonPath("$.servicos", hasSize(0)));

        assertTrue(funcionarioServicoRepository
                .findByIdFuncionarioId(funcionario.getId()).isEmpty());
    }

    @Test
    void substituiConfiguracaoAnteriorPorNovoConjunto() throws Exception {
        atribuir(corte);

        substituir("[" + barba.getId() + "]").andExpect(status().isOk())
                .andExpect(jsonPath("$.servicos", hasSize(1)))
                .andExpect(jsonPath("$.servicos[0].id").value(barba.getId()));

        List<FuncionarioServico> atuais = funcionarioServicoRepository
                .findByIdFuncionarioId(funcionario.getId());
        assertEquals(1, atuais.size());
        assertEquals(barba.getId(), atuais.get(0).getId().getServicoId());
    }

    @Test
    void idNuloERejeitadoEPreservaConfiguracaoAnterior() throws Exception {
        atribuir(corte);
        substituir("[null," + barba.getId() + "]").andExpect(status().isBadRequest());
        assertSomenteCorte();
    }

    @Test
    void servicoInexistenteERejeitadoEPreservaConfiguracaoAnterior() throws Exception {
        atribuir(corte);
        substituir("[" + barba.getId() + ",999999]").andExpect(status().isNotFound());
        assertSomenteCorte();
    }

    @Test
    void servicoInativoERejeitadoEPreservaConfiguracaoAnterior() throws Exception {
        atribuir(corte);
        Servico inativo = servico("Inativo", salao, "INATIVO");
        substituir("[" + barba.getId() + "," + inativo.getId() + "]")
                .andExpect(status().isBadRequest());
        assertSomenteCorte();
    }

    @Test
    void servicoDeOutroSalaoERejeitadoEPreservaConfiguracaoAnterior() throws Exception {
        atribuir(corte);
        Servico alheio = servico("Alheio", outroSalao, "ATIVO");
        substituir("[" + barba.getId() + "," + alheio.getId() + "]")
                .andExpect(status().isBadRequest());
        assertSomenteCorte();
    }

    @Test
    void funcionarioInativoNaoPodeTerAtribuicoesSubstituidas() throws Exception {
        atribuir(corte);
        funcionario.setStatus("INATIVO");
        funcionarioRepository.saveAndFlush(funcionario);

        substituir("[" + barba.getId() + "]").andExpect(status().isBadRequest());
        assertSomenteCorte();
    }

    @Test
    void substituicaoUsaBloqueioPessimistaDoFuncionario() throws Exception {
        Method metodo = FuncionarioRepository.class.getMethod("findByIdForUpdate", Long.class);
        org.springframework.data.jpa.repository.Lock lock = metodo.getAnnotation(
                org.springframework.data.jpa.repository.Lock.class);
        assertEquals(LockModeType.PESSIMISTIC_WRITE, lock.value());
    }

    private org.springframework.test.web.servlet.ResultActions substituir(String ids) throws Exception {
        return mockMvc.perform(put("/funcionarios/{id}/servicos", funcionario.getId())
                .header("Authorization", bearer(manager))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"servicoIds\":" + ids + "}"));
    }

    private void atribuir(Servico... servicos) {
        funcionarioServicoRepository.saveAllAndFlush(List.of(servicos).stream()
                .map(servico -> new FuncionarioServico(funcionario, servico)).toList());
    }

    private void assertSomenteCorte() {
        List<FuncionarioServico> atuais = funcionarioServicoRepository
                .findByIdFuncionarioId(funcionario.getId());
        assertEquals(1, atuais.size());
        assertEquals(corte.getId(), atuais.get(0).getId().getServicoId());
    }

    private Usuario usuario(String role, String email) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(role);
        nivel.setStatusNivelAcesso("ATIVO");
        nivel = nivelAcessoRepository.save(nivel);
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

    private Funcionario funcionario(String nome, String email, Salao salao, String status) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha("hash");
        funcionario.setFuncao("Cabeleireira");
        funcionario.setStatus(status);
        funcionario.setSalao(salao);
        funcionario.setUsuario(usuario("EMPLOYEE", "conta-" + email));
        return funcionarioRepository.save(funcionario);
    }

    private Servico servico(String nome, Salao salao, String status) {
        Servico servico = new Servico();
        servico.setNome(nome);
        servico.setDescricao("Nao expor");
        servico.setPreco(50.0);
        servico.setDuracao(60);
        servico.setStatus(status);
        servico.setSalao(salao);
        return servicoRepository.save(servico);
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
