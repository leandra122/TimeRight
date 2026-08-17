package com.timeright.tcc.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.lang.reflect.Method;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeright.tcc.config.TimeConfig;
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

import jakarta.persistence.LockModeType;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ClienteAgendamentoIntegrationTest {

    private static final ZoneId ZONE = TimeConfig.MVP_ZONE;
    private static final Instant FIXED_INSTANT = Instant.parse("2026-08-17T15:00:00.487Z");
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 8, 17, 12, 0);
    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @Autowired private FuncionarioRepository funcionarioRepository;
    @Autowired private ServicoRepository servicoRepository;
    @Autowired private AgendamentoRepository agendamentoRepository;
    @MockBean private Clock clock;

    private NivelAcesso userRole;
    private NivelAcesso employeeRole;
    private Usuario cliente;
    private Salao salao;
    private Funcionario funcionario;
    private Servico servico;

    @BeforeEach
    void preparar() {
        when(clock.instant()).thenReturn(FIXED_INSTANT);
        when(clock.getZone()).thenReturn(ZONE);
        userRole = nivel("USER", "ATIVO");
        employeeRole = nivel("EMPLOYEE", "ATIVO");
        cliente = usuario("Cliente", email("cliente"), userRole, "ATIVO");
        salao = salao("Salao Principal", "ATIVO", 120, 60);
        funcionario = funcionario("Ana", salao, "ATIVO");
        servico = servico("Corte", salao, "ATIVO", 45);
    }

    @Test
    void criaParaUsuarioDoJwtIgnoraEscopoMaliciosoEUsaDadosPersistidos() throws Exception {
        Usuario outro = usuario("Outro", email("outro"), userRole, "ATIVO");
        String body = objectMapper.writeValueAsString(Map.of(
                "funcionarioId", funcionario.getId(),
                "servicoId", servico.getId(),
                "dataHora", NOW.plusMinutes(120).toString(),
                "observacoes", "  Preferência discreta  ",
                "usuarioId", outro.getId(), "salaoId", 999, "duracao", 999,
                "status", "CONCLUIDO", "preco", 1));

        String response = criar(token(cliente), body, 201);
        JsonNode json = objectMapper.readTree(response);
        Agendamento salvo = agendamentoRepository.findById(json.get("id").asLong()).orElseThrow();

        assertThat(salvo.getUsuario().getId()).isEqualTo(cliente.getId());
        assertThat(salvo.getDuracao()).isEqualTo(45);
        assertThat(salvo.getStatus()).isEqualTo("AGENDADO");
        assertThat(salvo.getObservacoes()).isEqualTo("Preferência discreta");
        assertThat(json.has("usuario")).isFalse();
        assertThat(json.has("usuarioId")).isFalse();
        assertThat(json.at("/servico/preco").asDouble()).isEqualTo(80.0);
    }

    @Test
    void validaPerfilPersistidoContaAtivaEPayload() throws Exception {
        mockMvc.perform(post("/api/client/agendamentos")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());

        cliente.setStatusUsuario("INATIVO");
        usuarioRepository.saveAndFlush(cliente);
        criar(token(cliente), request(funcionario, servico, NOW.plusHours(3), null), 403);
    }

    @Test
    void rejeitaVinculosInativosInconsistentesEDuracaoInvalida() throws Exception {
        funcionario.setStatus("INATIVO");
        funcionarioRepository.saveAndFlush(funcionario);
        criar(token(cliente), request(funcionario, servico, NOW.plusHours(3), null), 400);

        funcionario.setStatus("ATIVO");
        funcionarioRepository.saveAndFlush(funcionario);
        servico.setStatus("INATIVO");
        servicoRepository.saveAndFlush(servico);
        criar(token(cliente), request(funcionario, servico, NOW.plusHours(4), null), 400);

        servico.setStatus("ATIVO");
        servicoRepository.saveAndFlush(servico);
        salao.setStatus("INATIVO");
        salaoRepository.saveAndFlush(salao);
        criar(token(cliente), request(funcionario, servico, NOW.plusHours(5), null), 400);

        salao.setStatus("ATIVO");
        salaoRepository.saveAndFlush(salao);
        Salao outroSalao = salao("Outro Salao", "ATIVO", 120, 60);
        Servico externo = servico("Outro servico", outroSalao, "ATIVO", 30);
        criar(token(cliente), request(funcionario, externo, NOW.plusHours(6), null), 400);

        servico.setDuracao(0);
        servicoRepository.saveAndFlush(servico);
        criar(token(cliente), request(funcionario, servico, NOW.plusHours(7), null), 400);
    }

    @Test
    void aplicaLimitesTemporaisInclusivosNoFusoDoMvp() throws Exception {
        criar(token(cliente), request(funcionario, servico, NOW.plusMinutes(120), null), 201);
        criar(token(cliente), request(funcionario, servico, NOW.plusMinutes(119), null), 400);

        Funcionario segundo = funcionario("Bia", salao, "ATIVO");
        criar(token(cliente), request(segundo, servico, NOW.plusDays(60), null), 201);
        criar(token(cliente), request(segundo, servico, NOW.plusDays(60).plusSeconds(1), null), 400);
        criar(token(cliente), request(segundo, servico, NOW.minusSeconds(1), null), 400);
    }

    @Test
    void truncaPayloadParaSegundosNaValidacaoPersistenciaEResposta() throws Exception {
        Funcionario segundo = funcionario("Precisao", salao, "ATIVO");
        LocalDateTime recebido = NOW.plusMinutes(120).plusNanos(999_000_000);

        String response = criar(token(cliente), request(segundo, servico, recebido, null), 201);
        JsonNode json = objectMapper.readTree(response);
        LocalDateTime retornado = LocalDateTime.parse(json.get("dataHora").asText());
        Agendamento salvo = agendamentoRepository.findById(json.get("id").asLong()).orElseThrow();

        assertThat(retornado).isEqualTo(NOW.plusMinutes(120));
        assertThat(retornado.getNano()).isZero();
        assertThat(salvo.getDataHora()).isEqualTo(retornado);
        assertThat(salvo.getDataHora().getNano()).isZero();

        Funcionario anterior = funcionario("Anterior", salao, "ATIVO");
        criar(token(cliente), request(
                anterior, servico, NOW.plusMinutes(119).plusNanos(999_000_000), null), 400);
    }

    @Test
    void detectaSobreposicoesEPreservaHorariosEncostados() throws Exception {
        LocalDateTime inicio = NOW.plusHours(4);
        agendamento(cliente, funcionario, servico, inicio, 45, "AGENDADO");

        criar(token(cliente), request(funcionario, servico, inicio, null), 409);
        criar(token(cliente), request(funcionario, servico, inicio.plusMinutes(20), null), 409);

        Funcionario encaixeAntes = funcionario("Daniela", salao, "ATIVO");
        agendamento(cliente, encaixeAntes, servico, inicio, 45, "AGENDADO");
        criar(token(cliente), request(encaixeAntes, servico, inicio.minusMinutes(45), null), 201);

        Servico longo = servico("Longo", salao, "ATIVO", 120);
        criar(token(cliente), request(funcionario, longo, inicio.minusMinutes(30), null), 409);
        criar(token(cliente), request(funcionario, servico, inicio.plusMinutes(45), null), 201);

        Funcionario outroFuncionario = funcionario("Carlos", salao, "ATIVO");
        criar(token(cliente), request(outroFuncionario, servico, inicio, null), 201);
    }

    @Test
    void canceladoNaoBloqueiaERegistroLegadoInvalidoBloqueiaConservadoramente() throws Exception {
        LocalDateTime inicio = NOW.plusHours(5);
        agendamento(cliente, funcionario, servico, inicio, 45, "CANCELADO");
        criar(token(cliente), request(funcionario, servico, inicio, null), 201);

        Funcionario legado = funcionario("Legado", salao, "ATIVO");
        agendamento(cliente, legado, servico, inicio, 0, "AGENDADO");
        criar(token(cliente), request(legado, servico, inicio.plusHours(12), null), 409);
    }

    @Test
    void listaSomentePropriosEmOrdemDeterministicaComJsonSeguro() throws Exception {
        Usuario outro = usuario("Outro cliente", email("outro-cliente"), userRole, "ATIVO");
        LocalDateTime empate = NOW.plusDays(2);
        Agendamento menor = agendamento(cliente, funcionario, servico, empate, 45, "AGENDADO");
        Agendamento maior = agendamento(cliente, funcionario, servico, empate, 45, "AGENDADO");
        agendamento(outro, funcionario, servico, NOW.plusDays(3), 45, "AGENDADO");
        Salao salaoInconsistente = salao("Salao inconsistente", "ATIVO", 120, 60);
        Servico servicoInconsistente = servico("Servico inconsistente", salaoInconsistente, "ATIVO", 30);
        agendamento(cliente, funcionario, servicoInconsistente, NOW.plusDays(4), 30, "AGENDADO");

        mockMvc.perform(get("/api/client/agendamentos").header("Authorization", bearer(token(cliente))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(maior.getId()))
                .andExpect(jsonPath("$[1].id").value(menor.getId()))
                .andExpect(jsonPath("$[0].usuario").doesNotExist())
                .andExpect(jsonPath("$[0].email").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist())
                .andExpect(jsonPath("$[0].nivelAcesso").doesNotExist())
                .andExpect(jsonPath("$[0].funcionario.usuario").doesNotExist())
                .andExpect(jsonPath("$[0].salao.gerente").doesNotExist());
    }

    @Test
    void cancelaSomenteProprioFuturoEPreservaRegistro() throws Exception {
        Agendamento proprio = agendamento(cliente, funcionario, servico, NOW.plusDays(1), 45, "AGENDADO");
        mockMvc.perform(patch("/api/client/agendamentos/{id}/cancelar", proprio.getId())
                        .header("Authorization", bearer(token(cliente))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADO"));
        assertThat(agendamentoRepository.findById(proprio.getId())).get()
                .extracting(Agendamento::getStatus).isEqualTo("CANCELADO");

        Usuario outro = usuario("Outro", email("cancel-outro"), userRole, "ATIVO");
        Agendamento alheio = agendamento(outro, funcionario, servico, NOW.plusDays(2), 45, "AGENDADO");
        cancelar(cliente, alheio.getId(), 403);
        cancelar(cliente, 999999L, 404);
        cancelar(cliente, proprio.getId(), 409);

        Agendamento concluido = agendamento(cliente, funcionario, servico, NOW.plusDays(3), 45, "CONCLUIDO");
        cancelar(cliente, concluido.getId(), 409);
        Agendamento passado = agendamento(cliente, funcionario, servico, NOW.minusMinutes(1), 45, "AGENDADO");
        cancelar(cliente, passado.getId(), 409);

        Agendamento mesmoSegundo = agendamento(
                cliente, funcionario, servico, NOW.plusNanos(999_000_000), 45, "AGENDADO");
        cancelar(cliente, mesmoSegundo.getId(), 200);
    }

    @Test
    void repositorioBloqueiaFuncionarioAntesDaVerificacaoDeConflito() throws Exception {
        Method method = FuncionarioRepository.class.getMethod("findByIdForUpdate", Long.class);
        Lock lock = method.getAnnotation(Lock.class);
        assertThat(lock).isNotNull();
        assertThat(lock.value()).isEqualTo(LockModeType.PESSIMISTIC_WRITE);
    }

    private String criar(String token, String body, int expectedStatus) throws Exception {
        return mockMvc.perform(post("/api/client/agendamentos")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().is(expectedStatus))
                .andReturn().getResponse().getContentAsString();
    }

    private void cancelar(Usuario user, Long id, int expectedStatus) throws Exception {
        mockMvc.perform(patch("/api/client/agendamentos/{id}/cancelar", id)
                        .header("Authorization", bearer(token(user))))
                .andExpect(status().is(expectedStatus));
    }

    private String request(Funcionario f, Servico s, LocalDateTime dataHora,
                           String observacoes) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "funcionarioId", f.getId(), "servicoId", s.getId(),
                "dataHora", dataHora.toString(), "observacoes", observacoes == null ? "" : observacoes));
    }

    private String token(Usuario user) {
        return jwtService.emitirToken(user);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private NivelAcesso nivel(String nome, String status) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(nome);
        nivel.setStatusNivelAcesso(status);
        return nivelAcessoRepository.saveAndFlush(nivel);
    }

    private Usuario usuario(String nome, String email, NivelAcesso nivel, String status) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setUsername(email);
        usuario.setPassword(passwordEncoder.encode("123456"));
        usuario.setDataCadastro(LocalDateTime.now());
        usuario.setNivelAcesso(nivel);
        usuario.setStatusUsuario(status);
        return usuarioRepository.saveAndFlush(usuario);
    }

    private Salao salao(String nome, String status, int antecedencia, int limite) {
        int id = SEQUENCE.incrementAndGet();
        Salao salao = new Salao();
        salao.setNome(nome);
        salao.setCnpj(String.format("%014d", id));
        salao.setEmail(email("salao"));
        salao.setEndereco("Rua Teste, 1");
        salao.setTelefone("11999999999");
        salao.setStatus(status);
        salao.setAntecedenciaMinimaMinutos(antecedencia);
        salao.setLimiteAgendamentoDias(limite);
        return salaoRepository.saveAndFlush(salao);
    }

    private Funcionario funcionario(String nome, Salao salao, String status) {
        String email = email("funcionario");
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(nome);
        funcionario.setEmail(email);
        funcionario.setSenha(passwordEncoder.encode("123456"));
        funcionario.setFuncao("Profissional");
        funcionario.setStatus(status);
        funcionario.setSalao(salao);
        funcionario.setUsuario(usuario(nome, email, employeeRole, status));
        return funcionarioRepository.saveAndFlush(funcionario);
    }

    private Servico servico(String nome, Salao salao, String status, int duracao) {
        Servico servico = new Servico();
        servico.setNome(nome);
        servico.setDescricao("Descrição");
        servico.setPreco(80.0);
        servico.setDuracao(duracao);
        servico.setStatus(status);
        servico.setSalao(salao);
        return servicoRepository.saveAndFlush(servico);
    }

    private Agendamento agendamento(Usuario user, Funcionario f, Servico s,
                                    LocalDateTime inicio, int duracao, String status) {
        Agendamento agendamento = new Agendamento();
        agendamento.setUsuario(user);
        agendamento.setFuncionario(f);
        agendamento.setServico(s);
        agendamento.setDataHora(inicio);
        agendamento.setDuracao(duracao);
        agendamento.setStatus(status);
        agendamento.setObservacoes("Teste");
        return agendamentoRepository.saveAndFlush(agendamento);
    }

    private String email(String prefixo) {
        return prefixo + SEQUENCE.incrementAndGet() + "@teste.com";
    }
}
