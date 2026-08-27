package com.timeright.tcc.dto;

import java.util.List;

public record FuncionarioServicosResponse(
        Long funcionarioId,
        Long salaoId,
        List<ServicoResumo> servicos) {

    public record ServicoResumo(
            Long id,
            String nome,
            Double preco,
            Integer duracao,
            String status) {
    }
}
