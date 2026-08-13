package com.timeright.tcc.dto;

import java.time.LocalDateTime;

public record EmployeeAgendamentoDTO(
        Long id,
        LocalDateTime dataHora,
        Integer duracao,
        String status,
        String observacoes,
        Long clienteId,
        String clienteNome,
        Long servicoId,
        String servicoNome,
        Long salaoId,
        String salaoNome) {
}
