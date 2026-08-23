package com.timeright.tcc.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ClienteDisponibilidadeResponse(
        Long salaoId,
        Long funcionarioId,
        Long servicoId,
        LocalDate data,
        String fusoHorario,
        Integer intervaloMinutos,
        List<LocalTime> horarios) {
}
