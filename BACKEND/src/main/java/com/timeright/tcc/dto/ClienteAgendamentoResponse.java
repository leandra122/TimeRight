package com.timeright.tcc.dto;

import java.time.LocalDateTime;

public record ClienteAgendamentoResponse(
        Long id,
        LocalDateTime dataHora,
        Integer duracao,
        String status,
        String observacoes,
        SalaoResumo salao,
        ServicoResumo servico,
        FuncionarioResumo funcionario) {

    public record SalaoResumo(Long id, String nome) {
    }

    public record ServicoResumo(Long id, String nome, Double preco) {
    }

    public record FuncionarioResumo(Long id, String nome, String funcao) {
    }
}
