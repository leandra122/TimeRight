package com.timeright.tcc.config;

import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register/client").permitAll()
                .requestMatchers(HttpMethod.POST,
                        "/usuarios",
                        "/usuarios/esqueci-senha",
                        "/usuarios/redefinir-senha").permitAll()
                .requestMatchers(HttpMethod.GET,
                        "/saloes",
                        "/avaliacoes/salao/**",
                        "/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/catalogo/saloes/*/funcionarios").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/client/disponibilidade").hasRole("USER")
                .requestMatchers("/api/client/agendamentos/**").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/servicos/me")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET,
                        "/servicos",
                        "/servicos/{id}",
                        "/servicos/salao/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/saloes/me")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET, "/saloes/*/configuracao-agendamento")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/saloes/*/horarios-funcionamento")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/saloes/*/horarios-funcionamento")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/saloes/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/usuarios/clientes")
                    .hasRole("ADMIN")
                .requestMatchers("/niveis-acesso/**", "/usuarios/**")
                    .hasRole("ADMIN")
                .requestMatchers("/dashboard/stats/salao/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/dashboard/stats", "/dashboard/stats/plataforma")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/funcionarios")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/funcionarios/me/agendamentos")
                    .hasRole("EMPLOYEE")
                .requestMatchers(HttpMethod.GET, "/funcionarios/me")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET, "/funcionarios/*/servicos")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET, "/funcionarios/{id}")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/funcionarios/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT, "/funcionarios/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/funcionarios/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/funcionarios/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET, "/agendamentos")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/agendamentos/me")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.GET, "/agendamentos/usuario/**")
                    .hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/agendamentos/{id}")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/agendamentos/**").denyAll()
                .requestMatchers(HttpMethod.PUT, "/agendamentos/**").denyAll()
                .requestMatchers(HttpMethod.PATCH, "/agendamentos/**").denyAll()
                .requestMatchers(HttpMethod.DELETE, "/agendamentos/**").denyAll()
                .requestMatchers(HttpMethod.GET, "/saloes/cnpj/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/saloes/com-servicos")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT, "/saloes/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/saloes/**")
                    .hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.POST, "/servicos/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.PUT, "/servicos/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/servicos/**")
                    .hasRole("MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/servicos/**")
                    .hasRole("MANAGER")
                .anyRequest().denyAll())
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"error\":\"Autenticação necessária ou token inválido\"}");
                })
                .accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Acesso negado\"}");
                }))
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"error\":\"Autenticação necessária ou token inválido\"}");
                }));

        return http.build();
    }

    @Bean
    public JwtEncoder jwtEncoder(@Value("${app.jwt.secret}") String secret) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey(secret)));
    }

    @Bean
    public JwtDecoder jwtDecoder(@Value("${app.jwt.secret}") String secret) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey(secret))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return authenticationConverter;
    }

    private SecretKey jwtSecretKey(String secret) {
        return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173"));
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
