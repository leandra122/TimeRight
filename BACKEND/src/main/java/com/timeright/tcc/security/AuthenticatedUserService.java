package com.timeright.tcc.security;

import java.math.BigDecimal;
import java.util.Locale;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    public AuthenticatedUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)
                || !authentication.isAuthenticated()) {
            throw new InvalidAuthenticatedUserException();
        }

        Long userId = convertUserId(jwtAuthentication.getToken().getClaim("userId"));
        String role = normalizeRole(jwtAuthentication.getToken().getClaimAsString("role"));
        return new AuthenticatedUser(userId, role);
    }

    private Long convertUserId(Object claim) {
        try {
            long userId;
            if (claim instanceof Number number) {
                userId = new BigDecimal(number.toString()).longValueExact();
            } else if (claim instanceof String value && !value.isBlank()) {
                userId = Long.parseLong(value);
            } else {
                throw new InvalidAuthenticatedUserException();
            }
            if (userId <= 0) {
                throw new InvalidAuthenticatedUserException();
            }
            return userId;
        } catch (NumberFormatException | ArithmeticException ignored) {
            // Claim inválido é tratado como autenticação inválida sem expor detalhes.
        }
        throw new InvalidAuthenticatedUserException();
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            throw new InvalidAuthenticatedUserException();
        }
        String normalized = role.trim().toUpperCase(Locale.ROOT);
        return "ADM".equals(normalized) ? "ADMIN" : normalized;
    }
}
