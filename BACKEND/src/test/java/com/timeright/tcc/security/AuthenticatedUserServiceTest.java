package com.timeright.tcc.security;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class AuthenticatedUserServiceTest {

    private final AuthenticatedUserService service = new AuthenticatedUserService();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void converteUserIdNumericoENormalizaAdm() {
        authenticate(Jwt.withTokenValue("ficticio")
                .header("alg", "none")
                .claim("userId", 42)
                .claim("role", "adm")
                .build());

        AuthenticatedUser user = service.getCurrentUser();

        assertEquals(42L, user.userId());
        assertEquals("ADMIN", user.role());
    }

    @Test
    void converteUserIdTextualSeguro() {
        authenticate(Jwt.withTokenValue("ficticio")
                .header("alg", "none")
                .claim("userId", "73")
                .claim("role", "manager")
                .build());

        assertEquals(73L, service.getCurrentUser().userId());
    }

    @Test
    void rejeitaTokenSemUserId() {
        authenticate(Jwt.withTokenValue("ficticio")
                .header("alg", "none")
                .claim("role", "MANAGER")
                .build());

        assertThrows(InvalidAuthenticatedUserException.class, service::getCurrentUser);
    }

    @Test
    void rejeitaUserIdFracionario() {
        authenticate(Jwt.withTokenValue("ficticio")
                .header("alg", "none")
                .claim("userId", 42.5)
                .claim("role", "MANAGER")
                .build());

        assertThrows(InvalidAuthenticatedUserException.class, service::getCurrentUser);
    }

    private void authenticate(Jwt jwt) {
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(
                jwt, List.of(new SimpleGrantedAuthority("ROLE_MANAGER"))));
    }
}
