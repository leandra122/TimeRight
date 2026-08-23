package com.timeright.tcc.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import com.timeright.tcc.model.entity.HorarioFuncionamentoSalao;
import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.HorarioFuncionamentoSalaoRepository;
import com.timeright.tcc.model.repository.NivelAcessoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;
import com.timeright.tcc.services.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class HorarioFuncionamentoSalaoIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private NivelAcessoRepository nivelAcessoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SalaoRepository salaoRepository;
    @SpyBean private HorarioFuncionamentoSalaoRepository horarioRepository;

    private Usuario manager;
    private Usuario outroManager;
    private Usuario admin;
    private Usuario user;
    private Usuario employee;
    private Salao salao;
    private Salao salaoAlheio;

    @BeforeEach
    void setup() {
        manager = usuario("MANAGER", "manager-horarios@teste.com");
        outroManager = usuario("MANAGER", "outro-manager-horarios@teste.com");
        admin = usuario("ADM", "admin-horarios@teste.com");
        user = usuario("USER", "user-horarios@teste.com");
        employee = usuario("EMPLOYEE", "employee-horarios@teste.com");
        salao = salao("Salao Horarios", "04252011000110", manager);
        salaoAlheio = salao("Salao Alheio", "40688134000161", outroManager);
    }

    @Test
    void gerenteProprietarioConsultaSemanaFechadaSemDadosPresumidos() throws Exception {
        mockMvc.perform(get(url(salao)).header("Authorization", bearer(manager)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.salaoId").value(salao.getId()))
                .andExpect(jsonPath("$.dias.length()").value(7))
                .andExpect(jsonPath("$.dias[0].diaSemana").value(1))
                .andExpect(jsonPath("$.dias[0].periodos.length()").value(0))
                .andExpect(jsonPath("$.dias[6].diaSemana").value(7))
                .andExpect(jsonPath("$.dias[6].periodos.length()").value(0));
    }

    @Test
    void gerenteAtualizaMultiplosPeriodosDiaFechadoERecebeOrdenacaoDeterministica()
            throws Exception {
        String segundaForaDeOrdem = periodos(
                periodo("13:00", "18:00"), periodo("09:00", "12:00"));
        mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(semana(segundaForaDeOrdem, "[]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dias[0].periodos.length()").value(2))
                .andExpect(jsonPath("$.dias[0].periodos[0].horaInicio").value("09:00:00"))
                .andExpect(jsonPath("$.dias[0].periodos[1].horaInicio").value("13:00:00"))
                .andExpect(jsonPath("$.dias[1].periodos.length()").value(0));

        var persistidos = horarioRepository
                .findBySalaoIdOrderByDiaSemanaAscHoraInicioAscIdAsc(salao.getId());
        assertEquals(2, persistidos.size());
        assertEquals(LocalTime.of(9, 0), persistidos.get(0).getHoraInicio());
        assertEquals(LocalTime.of(13, 0), persistidos.get(1).getHoraInicio());
    }

    @Test
    void periodosEncostadosSaoAceitos() throws Exception {
        mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(semana(periodos(
                                periodo("09:00", "12:00"),
                                periodo("12:00", "18:00")), "[]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dias[0].periodos.length()").value(2));
    }

    @Test
    void gerenteDeOutroSalaoRecebeForbidden() throws Exception {
        mockMvc.perform(get(url(salaoAlheio)).header("Authorization", bearer(manager)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put(url(salaoAlheio)).header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON).content(semana("[]", "[]")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminConsultaEAtualiza() throws Exception {
        mockMvc.perform(get(url(salaoAlheio)).header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        mockMvc.perform(put(url(salaoAlheio)).header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(semana(periodos(periodo("08:00", "17:00")), "[]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dias[0].periodos[0].horaInicio").value("08:00:00"));
    }

    @Test
    void userEEmployeeRecebemForbidden() throws Exception {
        for (Usuario bloqueado : new Usuario[] {user, employee}) {
            mockMvc.perform(get(url(salao)).header("Authorization", bearer(bloqueado)))
                    .andExpect(status().isForbidden());
            mockMvc.perform(put(url(salao)).header("Authorization", bearer(bloqueado))
                            .contentType(MediaType.APPLICATION_JSON).content(semana("[]", "[]")))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void tokenAusenteOuInvalidoRecebeUnauthorized() throws Exception {
        mockMvc.perform(get(url(salao))).andExpect(status().isUnauthorized());
        mockMvc.perform(get(url(salao)).header("Authorization", "Bearer token-invalido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void diasForaDoIntervaloSaoRejeitados() throws Exception {
        for (int invalido : new int[] {0, 8}) {
            String payload = semana("[]", "[]").replaceFirst("\"diaSemana\":1",
                    "\"diaSemana\":" + invalido);
            mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON).content(payload))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void inicioIgualOuPosteriorAoFimSaoRejeitados() throws Exception {
        for (String invalido : new String[] {
                periodo("09:00", "09:00"), periodo("10:00", "09:00")}) {
            mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(semana(periodos(invalido), "[]")))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void horasAusentesSaoRejeitadas() throws Exception {
        for (String invalido : new String[] {
                "{\"horaInicio\":null,\"horaFim\":\"18:00\"}",
                "{\"horaInicio\":\"09:00\",\"horaFim\":null}"}) {
            mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(semana(periodos(invalido), "[]")))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void diasOuPeriodosNulosSaoRejeitados() throws Exception {
        String periodosNulos = semana("[]", "[]")
                .replaceFirst("\"periodos\":\\[\\]", "\"periodos\":null");
        for (String payload : new String[] {"{\"dias\":null}", periodosNulos}) {
            mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON).content(payload))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void horarioFracionarioEhNormalizadoAntesDeValidarPersistirEResponder() throws Exception {
        mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(semana(periodos(
                                periodo("09:00:00.500", "18:00:00.900")), "[]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dias[0].periodos[0].horaInicio").value("09:00:00"))
                .andExpect(jsonPath("$.dias[0].periodos[0].horaFim").value("18:00:00"));

        HorarioFuncionamentoSalao persistido = horarioRepository
                .findBySalaoIdOrderByDiaSemanaAscHoraInicioAscIdAsc(salao.getId()).get(0);
        assertEquals(0, persistido.getHoraInicio().getNano());
        assertEquals(0, persistido.getHoraFim().getNano());
        assertEquals(LocalTime.of(9, 0), persistido.getHoraInicio());
        assertEquals(LocalTime.of(18, 0), persistido.getHoraFim());
    }

    @Test
    void intervaloQueFicaIgualAposTruncamentoEhRejeitado() throws Exception {
        mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(semana(periodos(
                                periodo("09:00:00.100", "09:00:00.900")), "[]")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sobreposicaoRejeitadaPreservaIntegralmenteConfiguracaoAnterior() throws Exception {
        salvarHorario(salao, 1, "08:00", "12:00");
        salvarHorario(salao, 3, "14:00", "18:00");

        mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(semana(periodos(
                                periodo("12:00", "18:00"), periodo("09:00", "13:00")), "[]")))
                .andExpect(status().isBadRequest());

        var preservados = horarioRepository
                .findBySalaoIdOrderByDiaSemanaAscHoraInicioAscIdAsc(salao.getId());
        assertEquals(2, preservados.size());
        assertEquals(1, preservados.get(0).getDiaSemana());
        assertEquals(LocalTime.of(8, 0), preservados.get(0).getHoraInicio());
        assertEquals(3, preservados.get(1).getDiaSemana());
    }

    @Test
    void exclusaoFisicaDoSalaoRemoveHorariosDependentes() throws Exception {
        salvarHorario(salao, 1, "09:00", "18:00");

        mockMvc.perform(delete("/saloes/{id}", salao.getId())
                        .header("Authorization", bearer(manager)))
                .andExpect(status().isOk());
        salaoRepository.flush();

        assertFalse(salaoRepository.existsById(salao.getId()));
        assertTrue(horarioRepository
                .findBySalaoIdOrderByDiaSemanaAscHoraInicioAscIdAsc(salao.getId()).isEmpty());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void falhaNaPersistenciaDepoisDaExclusaoInternaRestauraConfiguracaoAnterior() {
        salvarHorario(salao, 1, "08:00", "12:00");
        salvarHorario(salao, 3, "14:00", "18:00");
        doThrow(new DataIntegrityViolationException("falha controlada no teste"))
                .when(horarioRepository).saveAll(anyList());

        assertThrows(Exception.class, () -> mockMvc.perform(put(url(salao))
                .header("Authorization", bearer(manager))
                .contentType(MediaType.APPLICATION_JSON)
                .content(semana(periodos(periodo("09:00", "17:00")), "[]"))));
        reset(horarioRepository);

        var preservados = horarioRepository
                .findBySalaoIdOrderByDiaSemanaAscHoraInicioAscIdAsc(salao.getId());
        assertEquals(2, preservados.size());
        assertEquals(LocalTime.of(8, 0), preservados.get(0).getHoraInicio());
        assertEquals(LocalTime.of(14, 0), preservados.get(1).getHoraInicio());
    }

    @Test
    void semanaAmbiguaComDiaRepetidoOuAusenteEhRejeitada() throws Exception {
        String repetido = semana("[]", "[]").replace("\"diaSemana\":7", "\"diaSemana\":6");
        String incompleto = "{\"dias\":[{\"diaSemana\":1,\"periodos\":[]}]}";
        for (String payload : new String[] {repetido, incompleto}) {
            mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON).content(payload))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void payloadMaliciosoNaoAlteraSalaoGerenteStatusNemExpoeDadosSensiveis() throws Exception {
        String payload = semana(periodos(periodo("09:00", "17:00")), "[]")
                .replaceFirst("\\}$", ",\"salaoId\":999,\"status\":\"INATIVO\"," +
                        "\"gerente\":{\"id\":" + outroManager.getId() + "}}" );

        mockMvc.perform(put(url(salao)).header("Authorization", bearer(manager))
                        .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.salaoId").value(salao.getId()))
                .andExpect(jsonPath("$.gerente").doesNotExist())
                .andExpect(jsonPath("$.usuario").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.token").doesNotExist());

        Salao inalterado = salaoRepository.findById(salao.getId()).orElseThrow();
        assertEquals("ATIVO", inalterado.getStatus());
        assertEquals(manager.getId(), inalterado.getGerente().getId());
    }

    @Test
    void catalogosPublicosContinuamLivresERotasAntigasDeEscritaContinuamBloqueadas()
            throws Exception {
        mockMvc.perform(get("/saloes")).andExpect(status().isOk());
        mockMvc.perform(get("/servicos/salao/{id}", salao.getId())).andExpect(status().isOk());
        mockMvc.perform(get("/catalogo/saloes/{id}/funcionarios", salao.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/agendamentos").contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/agendamentos").header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    private String url(Salao item) {
        return "/saloes/" + item.getId() + "/horarios-funcionamento";
    }

    private String semana(String segunda, String terca) {
        return "{\"dias\":["
                + dia(1, segunda) + "," + dia(2, terca) + "," + dia(3, "[]") + ","
                + dia(4, "[]") + "," + dia(5, "[]") + "," + dia(6, "[]") + ","
                + dia(7, "[]") + "]}";
    }

    private String dia(int numero, String periodos) {
        return "{\"diaSemana\":" + numero + ",\"periodos\":" + periodos + "}";
    }

    private String periodos(String... itens) {
        return "[" + String.join(",", itens) + "]";
    }

    private String periodo(String inicio, String fim) {
        return "{\"horaInicio\":\"" + inicio + "\",\"horaFim\":\"" + fim + "\"}";
    }

    private Usuario usuario(String role, String username) {
        NivelAcesso nivel = new NivelAcesso();
        nivel.setNome(role);
        nivel.setStatusNivelAcesso("ATIVO");
        nivel = nivelAcessoRepository.save(nivel);
        Usuario item = new Usuario();
        item.setNome(username);
        item.setUsername(username);
        item.setPassword("hash-teste");
        item.setStatusUsuario("ATIVO");
        item.setNivelAcesso(nivel);
        return usuarioRepository.save(item);
    }

    private Salao salao(String nome, String cnpj, Usuario gerente) {
        Salao item = new Salao();
        item.setNome(nome);
        item.setCnpj(cnpj);
        item.setEmail(cnpj + "@teste.com");
        item.setEndereco("Rua Teste, 1");
        item.setTelefone("11999999999");
        item.setStatus("ATIVO");
        item.setGerente(gerente);
        return salaoRepository.saveAndFlush(item);
    }

    private void salvarHorario(Salao item, int dia, String inicio, String fim) {
        HorarioFuncionamentoSalao horario = new HorarioFuncionamentoSalao();
        horario.setSalao(item);
        horario.setDiaSemana(dia);
        horario.setHoraInicio(LocalTime.parse(inicio));
        horario.setHoraFim(LocalTime.parse(fim));
        horarioRepository.saveAndFlush(horario);
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.emitirToken(usuario);
    }
}
