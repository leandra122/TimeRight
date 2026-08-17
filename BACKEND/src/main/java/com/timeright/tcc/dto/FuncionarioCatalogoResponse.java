package com.timeright.tcc.dto;

public record FuncionarioCatalogoResponse(
        Long id,
        String nome,
        String funcao,
        Long salaoId) {
}
