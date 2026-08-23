package com.timeright.tcc.dto;

import java.time.LocalTime;
import java.util.List;

public record HorariosFuncionamentoSalaoResponse(Long salaoId, List<DiaResponse> dias) {

    public record DiaResponse(Integer diaSemana, List<PeriodoResponse> periodos) {
    }

    public record PeriodoResponse(LocalTime horaInicio, LocalTime horaFim) {
    }
}
