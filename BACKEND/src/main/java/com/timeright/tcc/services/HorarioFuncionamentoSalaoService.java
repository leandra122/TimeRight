package com.timeright.tcc.services;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.HorariosFuncionamentoSalaoRequest;
import com.timeright.tcc.dto.HorariosFuncionamentoSalaoResponse;
import com.timeright.tcc.model.entity.HorarioFuncionamentoSalao;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.repository.HorarioFuncionamentoSalaoRepository;

@Service
public class HorarioFuncionamentoSalaoService {

    private final HorarioFuncionamentoSalaoRepository horarioRepository;
    private final SalaoService salaoService;

    public HorarioFuncionamentoSalaoService(
            HorarioFuncionamentoSalaoRepository horarioRepository,
            SalaoService salaoService) {
        this.horarioRepository = horarioRepository;
        this.salaoService = salaoService;
    }

    @Transactional(readOnly = true)
    public HorariosFuncionamentoSalaoResponse buscar(Long salaoId) {
        salaoService.buscarAutorizado(salaoId);
        return montarResposta(salaoId,
                horarioRepository.findBySalaoIdOrderByDiaSemanaAscHoraInicioAscIdAsc(salaoId));
    }

    @Transactional
    public HorariosFuncionamentoSalaoResponse atualizar(
            Long salaoId, HorariosFuncionamentoSalaoRequest request) {
        Salao salao = salaoService.buscarAutorizado(salaoId);
        List<PeriodoValidado> periodos = validarSemana(request);

        horarioRepository.deleteBySalaoId(salaoId);
        horarioRepository.flush();

        List<HorarioFuncionamentoSalao> novos = periodos.stream().map(periodo -> {
            HorarioFuncionamentoSalao horario = new HorarioFuncionamentoSalao();
            horario.setSalao(salao);
            horario.setDiaSemana(periodo.diaSemana());
            horario.setHoraInicio(periodo.horaInicio());
            horario.setHoraFim(periodo.horaFim());
            return horario;
        }).toList();

        List<HorarioFuncionamentoSalao> salvos = horarioRepository.saveAll(novos);
        horarioRepository.flush();
        return montarResposta(salaoId, salvos);
    }

    private List<PeriodoValidado> validarSemana(HorariosFuncionamentoSalaoRequest request) {
        if (request == null || request.dias() == null || request.dias().size() != 7) {
            throw new IllegalArgumentException("A configuração deve informar os sete dias da semana");
        }

        Set<Integer> diasEncontrados = new HashSet<>();
        List<PeriodoValidado> resultado = new ArrayList<>();
        for (HorariosFuncionamentoSalaoRequest.DiaRequest dia : request.dias()) {
            if (dia == null || dia.diaSemana() == null
                    || dia.diaSemana() < 1 || dia.diaSemana() > 7) {
                throw new IllegalArgumentException("Dia da semana deve estar entre 1 e 7");
            }
            if (!diasEncontrados.add(dia.diaSemana())) {
                throw new IllegalArgumentException("Cada dia da semana deve aparecer exatamente uma vez");
            }
            if (dia.periodos() == null) {
                throw new IllegalArgumentException("A lista de períodos é obrigatória para todos os dias");
            }

            List<PeriodoValidado> periodosDoDia = new ArrayList<>();
            for (HorariosFuncionamentoSalaoRequest.PeriodoRequest periodo : dia.periodos()) {
                if (periodo == null || periodo.horaInicio() == null || periodo.horaFim() == null) {
                    throw new IllegalArgumentException("Hora inicial e final são obrigatórias");
                }
                LocalTime horaInicio = normalizarHorario(periodo.horaInicio());
                LocalTime horaFim = normalizarHorario(periodo.horaFim());
                if (!horaInicio.isBefore(horaFim)) {
                    throw new IllegalArgumentException("Hora inicial deve ser anterior à hora final");
                }
                periodosDoDia.add(new PeriodoValidado(
                        dia.diaSemana(), horaInicio, horaFim));
            }
            periodosDoDia.sort(Comparator.comparing(PeriodoValidado::horaInicio)
                    .thenComparing(PeriodoValidado::horaFim));
            for (int i = 1; i < periodosDoDia.size(); i++) {
                PeriodoValidado anterior = periodosDoDia.get(i - 1);
                PeriodoValidado atual = periodosDoDia.get(i);
                if (atual.horaInicio().isBefore(anterior.horaFim())) {
                    throw new IllegalArgumentException("Períodos do mesmo dia não podem se sobrepor");
                }
            }
            resultado.addAll(periodosDoDia);
        }
        return resultado;
    }

    private HorariosFuncionamentoSalaoResponse montarResposta(
            Long salaoId, List<HorarioFuncionamentoSalao> horarios) {
        Map<Integer, List<HorariosFuncionamentoSalaoResponse.PeriodoResponse>> porDia =
                horarios.stream()
                        .sorted(Comparator.comparing(HorarioFuncionamentoSalao::getDiaSemana)
                                .thenComparing(HorarioFuncionamentoSalao::getHoraInicio)
                                .thenComparing(HorarioFuncionamentoSalao::getId,
                                        Comparator.nullsLast(Comparator.naturalOrder())))
                        .collect(Collectors.groupingBy(
                                HorarioFuncionamentoSalao::getDiaSemana,
                                Collectors.mapping(horario ->
                                        new HorariosFuncionamentoSalaoResponse.PeriodoResponse(
                                                normalizarHorario(horario.getHoraInicio()),
                                                normalizarHorario(horario.getHoraFim())),
                                        Collectors.toList())));

        List<HorariosFuncionamentoSalaoResponse.DiaResponse> dias = IntStream.rangeClosed(1, 7)
                .mapToObj(dia -> new HorariosFuncionamentoSalaoResponse.DiaResponse(
                        dia, porDia.getOrDefault(dia, List.of())))
                .toList();
        return new HorariosFuncionamentoSalaoResponse(salaoId, dias);
    }

    private LocalTime normalizarHorario(LocalTime horario) {
        return horario.truncatedTo(ChronoUnit.SECONDS);
    }

    private record PeriodoValidado(Integer diaSemana, LocalTime horaInicio, LocalTime horaFim) {
    }
}
