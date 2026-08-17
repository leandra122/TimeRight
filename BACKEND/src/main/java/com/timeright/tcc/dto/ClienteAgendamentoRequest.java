package com.timeright.tcc.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ClienteAgendamentoRequest(
        @NotNull(message = "Funcionário é obrigatório") Long funcionarioId,
        @NotNull(message = "Serviço é obrigatório") Long servicoId,
        @NotNull(message = "Data e hora são obrigatórias") LocalDateTime dataHora,
        @Size(max = 255, message = "Observações devem ter no máximo 255 caracteres")
        String observacoes) {
}
