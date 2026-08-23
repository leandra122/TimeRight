package com.timeright.tcc.dto;

import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HorariosFuncionamentoSalaoRequest(List<DiaRequest> dias) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DiaRequest(Integer diaSemana, List<PeriodoRequest> periodos) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PeriodoRequest(LocalTime horaInicio, LocalTime horaFim) {
    }
}
