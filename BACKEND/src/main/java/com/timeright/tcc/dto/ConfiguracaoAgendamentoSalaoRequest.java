package com.timeright.tcc.dto;

public record ConfiguracaoAgendamentoSalaoRequest(
        Integer antecedenciaMinimaMinutos,
        Integer limiteAgendamentoDias) {
}
