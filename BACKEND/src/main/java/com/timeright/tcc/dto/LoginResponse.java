package com.timeright.tcc.dto;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn,
        Long userId,
        String nome,
        String username,
        String role) {
}
