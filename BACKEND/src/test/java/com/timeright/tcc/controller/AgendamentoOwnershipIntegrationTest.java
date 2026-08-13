package com.timeright.tcc.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.model.entity.Agendamento;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.AgendamentoRepository;
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
class AgendamentoOwnershipIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private ServicoRepository servicoRepository;
    @Autowired private AgendamentoRepository agendamentoRepository;

    private Usuario manager;
    private Usuario outroManager;
    private Usuario admin;
    private Usuario cliente;
    private Usuario employeeUser;
    private Salao salaoUm;
    private Salao salaoDois;
    private Salao salaoAlheio;
    private Salao salaoLegado;
    private int sequencia;

    @BeforeEach
    void setup() {
        manager = usuario("MANAGER", "manager-agenda@teste.com");
        outroManager = usuario("MANAGER", "outro-manager-agenda@teste.com");
        admin = usuario("ADM", "admin-agenda@teste.com");
        cliente = usuario("USER", "cliente-secreto@teste.com");
        employeeUser = usuario("EMPLOYEE", "employee-agenda@teste.com");
        salaoUm = salao("Salão Um", "04252011000110", manager);
        salaoDois = salao("Salão Dois", "40688134000161", manager);
        salaoAlheio = salao("Salão Alheio", "11222333000181", outroManager);
        salaoLegado = salao("Salão Legado", "19131243000197", null);
    }

    @Test
    void listaGlobalExigeAdminEAdminVeTudo() throws Exception {
        agendamento(salaoUm, salaoUm);
        agendamento(salaoAlheio, salaoAlheio);

        mockMvc.perform(get("/agendamentos")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/agendamentos").header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void gerenteListaDoisSaloesPropriosSemAlheiosOuInconsistentes() throws Exception {
        agendamento(salaoUm, salaoUm);
        agendamento(salaoDois, salaoDois);
        agendamento(salaoAlheio, salaoAlheio);
        agendamento(salaoUm, salaoDois);

        mockMvc.perform(get("/agendamentos/me").header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void buscaPorIdDistingueInexistenteAlheioEProprio() throws Exception {
        Agendamento proprio = agendamento(salaoUm, salaoUm);
        Agendamento alheio = agendamento(salaoAlheio, salaoAlheio);
        Agendamento inconsistente = agendamento(salaoUm, salaoDois);

        mockMvc.perform(get("/agendamentos/{id}", proprio.getId()).header("Authorization", bearer(manager)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/agendamentos/{id}", alheio.getId()).header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos/{id}", inconsistente.getId()).header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos/{id}", 999999L).header("Authorization", bearer(manager)))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/agendamentos/{id}", alheio.getId()).header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void userEEmployeeNaoAcessamEndpointsGenericos() throws Exception {
        Agendamento agendamento = agendamento(salaoUm, salaoUm);
        for (Usuario usuario : new Usuario[] {cliente, employeeUser}) {
            mockMvc.perform(get("/agendamentos").header("Authorization", bearer(usuario)))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/agendamentos/me").header("Authorization", bearer(usuario)))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/agendamentos/{id}", agendamento.getId())
                            .header("Authorization", bearer(usuario)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void mutacoesSaoNegadasParaAdminEGerente() throws Exception {
        Agendamento agendamento = agendamento(salaoUm, salaoUm);
        for (Usuario usuario : new Usuario[] {admin, manager}) {
            String auth = bearer(usuario);
            mockMvc.perform(post("/agendamentos").header("Authorization", auth)
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isForbidden());
            mockMvc.perform(put("/agendamentos/{id}", agendamento.getId()).header("Authorization", auth)
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isForbidden());
            mockMvc.perform(patch("/agendamentos/{id}/cancelar", agendamento.getId())
                            .header("Authorization", auth)).andExpect(status().isForbidden());
            mockMvc.perform(delete("/agendamentos/{id}", agendamento.getId())
                            .header("Authorization", auth)).andExpect(status().isForbidden());
        }
    }

    @Test
    void clientesGlobaisSaoNegadosAoGerenteEUsuarioIdFicaRestritoAoAdmin() throws Exception {
        mockMvc.perform(get("/usuarios/clientes").header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos/usuario/{id}", cliente.getId())
                        .header("Authorization", bearer(manager))).andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos/usuario/{id}", cliente.getId())
                        .header("Authorization", bearer(admin))).andExpect(status().isOk());
    }

    @Test
    void jsonPreservaNomeEIdSemDadosSensiveis() throws Exception {
        Agendamento agendamento = agendamento(salaoUm, salaoUm);
        mockMvc.perform(get("/agendamentos/{id}", agendamento.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.id").value(cliente.getId()))
                .andExpect(jsonPath("$.usuario.nome").value(cliente.getNome()))
                .andExpect(jsonPath("$.usuario.username").doesNotExist())
                .andExpect(jsonPath("$.usuario.password").doesNotExist())
                .andExpect(jsonPath("$.usuario.resetToken").doesNotExist())
                .andExpect(jsonPath("$.funcionario.email").doesNotExist())
                .andExpect(jsonPath("$.funcionario.senha").doesNotExist())
                .andExpect(jsonPath("$.funcionario.usuario").doesNotExist());
    }

    @Test
    void salaoSemGerenteFicaSomenteParaAdmin() throws Exception {
        Agendamento legado = agendamento(salaoLegado, salaoLegado);
        mockMvc.perform(get("/agendamentos/me").header("Authorization", bearer(manager)))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
        mockMvc.perform(get("/agendamentos/{id}", legado.getId()).header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/agendamentos/{id}", legado.getId()).header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    private Agendamento agendamento(Salao salaoFuncionario, Salao salaoServico) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Funcionário " + ++sequencia);
        funcionario.setEmail("func-agenda-" + sequencia + "@teste.com");
        funcionario.setSenha("hash-funcionario-secreto");
        funcionario.setFuncao("Cabeleireiro");
        funcionario.setStatus("ATIVO");
        funcionario.setSalao(salaoFuncionario);
        funcionario.setUsuario(usuario("EMPLOYEE", "func-user-" + sequencia + "@teste.com"));
        funcionario = funcionarioRepository.save(funcionario);

        Servico servico = new Servico();
        servico.setNome("Serviço " + sequencia);
        servico.setDescricao("Descrição");
        servico.setPreco(50.0);
        servico.setDuracao(30);
        servico.setStatus("ATIVO");
        servico.setSalao(salaoServico);
        servico = servicoRepository.save(servico);

        Agendamento agendamento = new Agendamento();
        agendamento.setUsuario(cliente);
        agendamento.setFuncionario(funcionario);
        agendamento.setServico(servico);
        agendamento.setDataHora(LocalDateTime.now().plusDays(2).plusMinutes(sequencia));
        agendamento.setDuracao(servico.getDuracao());
        agendamento.setStatus("AGENDADO");
        return agendamentoRepository.save(agendamento);
    }

    private Usuario usuario(String role, String username) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(role);
        nivel.setStatusNivelAcesso("ATIVO");
        nivel = nivelAcessoRepository.save(nivel);

        Usuario usuario = new Usuario();
        usuario.setNome("Usuário " + role);
        usuario.setUsername(username);
        usuario.setPassword("hash-cliente-secreto");
        usuario.setResetToken("token-secreto");
        usuario.setResetTokenExpiracao(LocalDateTime.now().plusHours(1));
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario("ATIVO");
        return usuarioRepository.save(usuario);
    }

    private Salao salao(String nome, String cnpj, Usuario gerente) {
        Salao salao = new Salao();
        salao.setNome(nome);
        salao.setCnpj(cnpj);
        salao.setEmail(nome.replace(" ", "").toLowerCase() + "@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        salao.setGerente(gerente);
        return salaoRepository.save(salao);
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
