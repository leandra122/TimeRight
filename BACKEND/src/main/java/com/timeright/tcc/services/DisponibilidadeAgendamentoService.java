package com.timeright.tcc.services;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.TreeSet;

import org.springframework.stereotype.Service;

import com.timeright.tcc.dto.ClienteDisponibilidadeResponse;
import com.timeright.tcc.exception.ConflictException;
import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.model.entity.HorarioFuncionamentoSalao;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.model.repository.AgendamentoRepository;
import com.timeright.tcc.model.repository.HorarioFuncionamentoSalaoRepository;

@Service
public class DisponibilidadeAgendamentoService {

    private static final int INTERVALO_MINUTOS = 30;
    private static final String FUSO_HORARIO = "America/Sao_Paulo";

    private final HorarioFuncionamentoSalaoRepository horarioRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final Clock clock;

    public DisponibilidadeAgendamentoService(
            HorarioFuncionamentoSalaoRepository horarioRepository,
            AgendamentoRepository agendamentoRepository,
            Clock clock) {
        this.horarioRepository = horarioRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.clock = clock;
    }

    public ClienteDisponibilidadeResponse consultar(
            Funcionario funcionario, Servico servico, LocalDate data) {
        Salao salao = funcionario.getSalao();
        validarDataConsultada(data, salao);
        List<LocalTime> horarios = gerarHorarios(funcionario, servico, data);
        return new ClienteDisponibilidadeResponse(
                salao.getId(), funcionario.getId(), servico.getId(), data,
                FUSO_HORARIO, INTERVALO_MINUTOS, horarios);
    }

    public LocalDateTime validarParaCriacao(
            Funcionario funcionario, Servico servico, LocalDateTime recebido) {
        LocalDateTime normalizado = normalizar(recebido);
        try {
            validarDataConsultada(normalizado.toLocalDate(), funcionario.getSalao());
        } catch (IllegalArgumentException exception) {
            throw new ConflictException("Horário indisponível");
        }
        if (!gerarHorarios(funcionario, servico, normalizado.toLocalDate())
                .contains(normalizado.toLocalTime())) {
            throw new ConflictException("Horário indisponível");
        }
        return normalizado;
    }

    private List<LocalTime> gerarHorarios(
            Funcionario funcionario, Servico servico, LocalDate data) {
        int duracao = servico.getDuracao();
        LocalDateTime agora = agora();
        Salao salao = funcionario.getSalao();
        LocalDateTime minimo = agora.plusMinutes(salao.getAntecedenciaMinimaMinutos());
        LocalDateTime maximo = agora.plusDays(salao.getLimiteAgendamentoDias());
        TreeSet<LocalTime> horarios = new TreeSet<>();

        List<HorarioFuncionamentoSalao> periodos =
                horarioRepository.findBySalaoIdAndDiaSemanaOrderByHoraInicioAscIdAsc(
                        salao.getId(), data.getDayOfWeek().getValue());
        for (HorarioFuncionamentoSalao periodo : periodos) {
            LocalTime inicioPeriodo = normalizar(periodo.getHoraInicio());
            LocalTime fimPeriodo = normalizar(periodo.getHoraFim());
            for (LocalDateTime candidato = LocalDateTime.of(data, inicioPeriodo);
                    !candidato.plusMinutes(duracao).isAfter(LocalDateTime.of(data, fimPeriodo));
                    candidato = candidato.plusMinutes(INTERVALO_MINUTOS)) {
                LocalDateTime inicio = normalizar(candidato);
                LocalDateTime fim = normalizar(inicio.plusMinutes(duracao));
                if (inicio.isBefore(agora) || inicio.isBefore(minimo) || inicio.isAfter(maximo)) {
                    continue;
                }
                if (agendamentoRepository.contarConflitosCliente(
                        funcionario.getId(), inicio, fim) == 0) {
                    horarios.add(inicio.toLocalTime());
                }
            }
        }
        return List.copyOf(horarios);
    }

    private void validarDataConsultada(LocalDate data, Salao salao) {
        if (data == null) {
            throw new IllegalArgumentException("Data é obrigatória");
        }
        Integer antecedencia = salao.getAntecedenciaMinimaMinutos();
        Integer limiteDias = salao.getLimiteAgendamentoDias();
        if (antecedencia == null || antecedencia < 0 || antecedencia > 10080
                || limiteDias == null || limiteDias < 1 || limiteDias > 365) {
            throw new IllegalArgumentException("Configuração de agendamento inválida");
        }
        LocalDateTime agora = agora();
        if (data.isBefore(agora.toLocalDate())
                || data.isAfter(agora.plusDays(limiteDias).toLocalDate())) {
            throw new IllegalArgumentException("Data fora da janela de agendamento");
        }
    }

    private LocalDateTime agora() {
        return normalizar(LocalDateTime.now(clock));
    }

    private LocalDateTime normalizar(LocalDateTime valor) {
        return valor.truncatedTo(ChronoUnit.SECONDS);
    }

    private LocalTime normalizar(LocalTime valor) {
        return valor.truncatedTo(ChronoUnit.SECONDS);
    }
}
