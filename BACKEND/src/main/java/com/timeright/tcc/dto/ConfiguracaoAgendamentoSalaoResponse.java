package com.timeright.tcc.dto;

public record ConfiguracaoAgendamentoSalaoResponse(
        Long salaoId,
        Integer antecedenciaMinimaMinutos,
        Integer limiteAgendamentoDias,
        String fusoHorario) {
}
