package com.timeright.tcc.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.HorarioFuncionamentoSalao;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.AgendamentoRepository;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.HorarioFuncionamentoSalaoRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.services.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClienteAgendamentoConcurrencyIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private HorarioFuncionamentoSalaoRepository horarioRepository;
    @Autowired private ServicoRepository servicoRepository;
    @Autowired private AgendamentoRepository agendamentoRepository;

    @AfterEach
    void limpar() {
        agendamentoRepository.deleteAll();
        funcionarioRepository.deleteAll();
        servicoRepository.deleteAll();
        salaoRepository.deleteAll();
        usuarioRepository.deleteAll();
        nivelAcessoRepository.deleteAll();
    }

    @Test
    void duasRequisicoesConcorrentesCriamApenasUmaReserva() throws Exception {
        NivelAcesso userRole = nivel("USER");
        NivelAcesso employeeRole = nivel("EMPLOYEE");
        Usuario cliente = usuario("Cliente concorrente", "concorrente@teste.com", userRole);
        Salao salao = salao();
        Usuario contaFuncionario = usuario("Funcionario", "func.concorrente@teste.com", employeeRole);
        Funcionario funcionario = funcionario(salao, contaFuncionario);
        Servico servico = servico(salao);
        LocalDateTime horario = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"))
                .plusDays(1).withMinute(0).withSecond(0).withNano(0);
        funcionamento(salao, horario.getDayOfWeek().getValue());
        String token = jwtService.emitirToken(cliente);
        String body = objectMapper.writeValueAsString(new Payload(
                funcionario.getId(), servico.getId(), horario, "Concorrência"));

        CountDownLatch inicio = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> primeira = executor.submit(() -> requisitar(inicio, token, body));
            Future<Integer> segunda = executor.submit(() -> requisitar(inicio, token, body));
            inicio.countDown();

            List<Integer> resultados = List.of(primeira.get(), segunda.get()).stream().sorted().toList();
            assertThat(resultados).containsExactly(201, 409);
            assertThat(agendamentoRepository.count()).isEqualTo(1);
        } finally {
            executor.shutdownNow();
        }
    }

    private int requisitar(CountDownLatch inicio, String token, String body) throws Exception {
        inicio.await();
        return mockMvc.perform(post("/api/client/agendamentos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn().getResponse().getStatus();
    }

    private NivelAcesso nivel(String nome) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(nome);
        nivel.setStatusNivelAcesso("ATIVO");
        return nivelAcessoRepository.saveAndFlush(nivel);
    }

    private Usuario usuario(String nome, String email, NivelAcesso nivel) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setUsername(email);
        usuario.setPassword(passwordEncoder.encode("123456"));
        usuario.setDataCadastro(LocalDateTime.now());
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario("ATIVO");
        return usuarioRepository.saveAndFlush(usuario);
    }

    private Salao salao() {
        Salao salao = new Salao();
        salao.setNome("Salao concorrente");
        salao.setCnpj("98765432000199");
        salao.setEmail("salao.concorrente@teste.com");
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus("ATIVO");
        salao.setAntecedenciaMinimaMinutos(0);
        salao.setLimiteAgendamentoDias(60);
        return salaoRepository.saveAndFlush(salao);
    }

    private Funcionario funcionario(Salao salao, Usuario conta) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Funcionario");
        funcionario.setEmail(conta.getUsername());
        funcionario.setSenha(conta.getPassword());
        funcionario.setFuncao("Profissional");
        funcionario.setStatus("ATIVO");
        funcionario.setSalao(salao);
        funcionario.setUsuario(conta);
        return funcionarioRepository.saveAndFlush(funcionario);
    }

    private Servico servico(Salao salao) {
        Servico servico = new Servico();
        servico.setNome("Servico");
        servico.setPreco(50.0);
        servico.setDuracao(30);
        servico.setStatus("ATIVO");
        servico.setSalao(salao);
        return servicoRepository.saveAndFlush(servico);
    }

    private void funcionamento(Salao salao, int diaSemana) {
        HorarioFuncionamentoSalao horario = new HorarioFuncionamentoSalao();
        horario.setSalao(salao);
        horario.setDiaSemana(diaSemana);
        horario.setHoraInicio(LocalTime.MIN);
        horario.setHoraFim(LocalTime.of(23, 59, 59));
        horarioRepository.saveAndFlush(horario);
    }

    private record Payload(Long funcionarioId, Long servicoId,
                           LocalDateTime dataHora, String observacoes) {
    }
}
