package com.timeright.tcc.security;

public record AuthenticatedUser(Long userId, String role) {
}
