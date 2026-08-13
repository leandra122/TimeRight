package com.timeright.tcc.services;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.timeright.tcc.model.entity.Usuario;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final Duration expiration;

    public JwtService(JwtEncoder jwtEncoder,
                      @Value("${app.jwt.expiration-minutes:60}") long expirationMinutes) {
        this.jwtEncoder = jwtEncoder;
        this.expiration = Duration.ofMinutes(expirationMinutes);
    }

    public String emitirToken(Usuario usuario) {
        Instant issuedAt = Instant.now();
        String role = normalizarRole(usuario.getNivelAcesso().getNome());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(usuario.getUsername().trim().toLowerCase(Locale.ROOT))
                .claim("userId", usuario.getId())
                .claim("role", role)
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(expiration))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long getExpiresInSeconds() {
        return expiration.toSeconds();
    }

    public String normalizarRole(String role) {
        String normalizada = role.trim().toUpperCase(Locale.ROOT);
        return "ADM".equals(normalizada) ? "ADMIN" : normalizada;
    }
}
