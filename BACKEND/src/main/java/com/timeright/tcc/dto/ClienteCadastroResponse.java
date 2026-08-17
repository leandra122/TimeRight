package com.timeright.tcc.dto;

public record ClienteCadastroResponse(
        Long id,
        String nome,
        String email,
        String role,
        String status) {
}
