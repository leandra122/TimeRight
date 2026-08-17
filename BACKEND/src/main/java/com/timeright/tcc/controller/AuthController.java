package com.timeright.tcc.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.dto.ClienteCadastroRequest;
import com.timeright.tcc.dto.ClienteCadastroResponse;
import com.timeright.tcc.dto.LoginRequest;
import com.timeright.tcc.dto.LoginResponse;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.services.JwtService;
import com.timeright.tcc.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    public AuthController(UsuarioService usuarioService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register/client")
    public ResponseEntity<ClienteCadastroResponse> cadastrarCliente(
            @Valid @RequestBody ClienteCadastroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioService.cadastrarCliente(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.validarLogin(request.getUsername(), request.getSenha());

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "E-mail ou senha inválidos"));
        }

        String role = jwtService.normalizarRole(usuario.getNivelAcesso().getNome());
        LoginResponse response = new LoginResponse(
                jwtService.emitirToken(usuario),
                "Bearer",
                jwtService.getExpiresInSeconds(),
                usuario.getId(),
                usuario.getNome(),
                usuario.getUsername(),
                role);

        return ResponseEntity.ok(response);
    }
}
