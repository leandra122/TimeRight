package com.timeright.tcc.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
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
class EmployeeAgendaIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private ServicoRepository servicoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private AgendamentoRepository agendamentoRepository;

    private NivelAcesso employeeRole;
    private Salao salao;
    private Servico servico;
    private Usuario employee;
    private Funcionario funcionario;

    @BeforeEach
    void setup() {
        employeeRole = nivel("EMPLOYEE");
        Usuario manager = usuario("MANAGER", nivel("MANAGER"));
        salao = salao("Salao Principal", "04252011000110", manager);
        servico = servico("Corte", salao);
        employee = usuario("EMPLOYEE", employeeRole);
        funcionario = funcionario("Funcionario Um", employee, salao);
    }

    @Test
    void employeeAtivoVeSomenteAgendaPropriaOrdenadaESemDadosSensiveis() throws Exception {
        Usuario cliente = usuario("USER", nivel("USER"));
        Agendamento segundo = agendamento(funcionario, servico, cliente, LocalDateTime.of(2030, 2, 2, 14, 0));
        Agendamento primeiro = agendamento(funcionario, servico, cliente, LocalDateTime.of(2030, 1, 1, 9, 0));

        Usuario outroEmployee = usuario("EMPLOYEE", employeeRole);
        Funcionario outro = funcionario("Funcionario Dois", outroEmployee, salao);
        agendamento(outro, servico, cliente, LocalDateTime.of(2030, 1, 1, 8, 0));

        mockMvc.perform(get("/funcionarios/me/agendamentos").header("Authorization", bearer(employee)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(primeiro.getId()))
                .andExpect(jsonPath("$[1].id").value(segundo.getId()))
                .andExpect(jsonPath("$[0].clienteNome").value(cliente.getNome()))
                .andExpect(jsonPath("$[0].servicoNome").value("Corte"))
                .andExpect(jsonPath("$[0].salaoNome").value("Salao Principal"))
                .andExpect(content().string(not(containsString("username"))))
                .andExpect(content().string(not(containsString("password"))))
                .andExpect(content().string(not(containsString("senha"))))
                .andExpect(content().string(not(containsString("resetToken"))))
                .andExpect(content().string(not(containsString("funcionario"))))
                .andExpect(content().string(not(containsString("cnpj"))));
    }

    @Test
    void agendaVaziaRetornaListaVazia() throws Exception {
        mockMvc.perform(get("/funcionarios/me/agendamentos").header("Authorization", bearer(employee)))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void empateDeDataHoraEOrdenadoPeloMenorIdSemExporOutroFuncionario() throws Exception {
        Usuario cliente = usuario("USER", nivel("USER"));
        LocalDateTime mesmoHorario = LocalDateTime.of(2030, 3, 10, 10, 30);
        Agendamento menorId = agendamento(funcionario, servico, cliente, mesmoHorario);
        Agendamento maiorId = agendamento(funcionario, servico, cliente, mesmoHorario);

        Usuario outroEmployee = usuario("EMPLOYEE", employeeRole);
        Funcionario outroFuncionario = funcionario("Funcionario Alheio", outroEmployee, salao);
        Agendamento alheio = agendamento(outroFuncionario, servico, cliente, mesmoHorario);

        mockMvc.perform(get("/funcionarios/me/agendamentos").header("Authorization", bearer(employee)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(menorId.getId()))
                .andExpect(jsonPath("$[1].id").value(maiorId.getId()))
                .andExpect(content().string(not(containsString("\"id\":" + alheio.getId()))));
    }

    @Test
    void jwtAnteriorNaoFuncionaAposInativarFuncionarioOuUsuario() throws Exception {
        String tokenFuncionario = bearer(employee);
        funcionario.setStatus("INATIVO");
        funcionarioRepository.save(funcionario);
        mockMvc.perform(get("/funcionarios/me/agendamentos").header("Authorization", tokenFuncionario))
                .andExpect(status().isForbidden());

        funcionario.setStatus("ATIVO");
        funcionarioRepository.save(funcionario);
        String tokenUsuario = bearer(employee);
        employee.setStatusUsuario("INATIVO");
        usuarioRepository.save(employee);
        mockMvc.perform(get("/funcionarios/me/agendamentos").header("Authorization", tokenUsuario))
                .andExpect(status().isForbidden());
    }

    @Test
    void employeeSemFuncionarioRecebeRespostaSegura() throws Exception {
        Usuario semVinculo = usuario("EMPLOYEE", employeeRole);
        mockMvc.perform(get("/funcionarios/me/agendamentos").header("Authorization", bearer(semVinculo)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Funcionário vinculado não encontrado"));
    }

    @Test
    void perfisIncorretosSemTokenETokenInvalidoSaoRejeitados() throws Exception {
        for (String role : new String[] {"ADMIN", "MANAGER", "USER"}) {
            mockMvc.perform(get("/funcionarios/me/agendamentos")
                            .header("Authorization", bearer(usuario(role, nivel(role)))))
                    .andExpect(status().isForbidden());
        }
        mockMvc.perform(get("/funcionarios/me/agendamentos")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/funcionarios/me/agendamentos")
                        .header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void agendamentoComServicoDeOutroSalaoNaoAparece() throws Exception {
        Usuario cliente = usuario("USER", nivel("USER"));
        Salao outroSalao = salao("Outro Salao", "40688134000161", usuario("MANAGER", nivel("MANAGER")));
        Servico inconsistente = servico("Servico alheio", outroSalao);
        agendamento(funcionario, inconsistente, cliente, LocalDateTime.of(2030, 1, 1, 9, 0));

        mockMvc.perform(get("/funcionarios/me/agendamentos").header("Authorization", bearer(employee)))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    private NivelAcesso nivel(String nome) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(nome);
        nivel.setStatusNivelAcesso("ATIVO");
        return nivelAcessoRepository.save(nivel);
    }

    private Usuario usuario(String role, NivelAcesso nivel) {
        Usuario usuario = new Usuario();
        usuario.setNome("Usuario " + role + " " + System.nanoTime());
        usuario.setUsername(role.toLowerCase() + System.nanoTime() + "@teste.com");
        usuario.setPassword(passwordEncoder.encode("senha123"));
        usuario.setStatusUsuario("ATIVO");
        usuario.setNivelAcesso(nivel);
        return usuarioRepository.save(usuario);
    }

    private Salao salao(String nome, String cnpj, Usuario manager) {
        Salao item = new Salao();
        item.setNome(nome); item.setCnpj(cnpj); item.setEmail(cnpj + "@teste.com");
        item.setEndereco("Rua Teste, 1"); item.setTelefone("11999999999"); item.setStatus("ATIVO");
        item.setGerente(manager);
        return salaoRepository.save(item);
    }

    private Servico servico(String nome, Salao salaoItem) {
        Servico item = new Servico();
        item.setNome(nome); item.setDescricao("Descricao"); item.setPreco(50.0);
        item.setDuracao(30); item.setStatus("ATIVO"); item.setSalao(salaoItem);
        return servicoRepository.save(item);
    }

    private Funcionario funcionario(String nome, Usuario conta, Salao salaoItem) {
        Funcionario item = new Funcionario();
        item.setNome(nome); item.setEmail(conta.getUsername()); item.setSenha(conta.getPassword());
        item.setFuncao("Cabeleireiro"); item.setStatus("ATIVO"); item.setSalao(salaoItem); item.setUsuario(conta);
        return funcionarioRepository.save(item);
    }

    private Agendamento agendamento(Funcionario profissional, Servico servicoItem,
                                    Usuario cliente, LocalDateTime dataHora) {
        Agendamento item = new Agendamento();
        item.setDataHora(dataHora); item.setDuracao(servicoItem.getDuracao()); item.setStatus("CONFIRMADO");
        item.setObservacoes("Preparar materiais"); item.setUsuario(cliente);
        item.setFuncionario(profissional); item.setServico(servicoItem);
        return agendamentoRepository.save(item);
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
