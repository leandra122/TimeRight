package com.alimentandoofuturo.controller;

import com.alimentandoofuturo.dto.ClientLoginRequest;
import com.alimentandoofuturo.dto.ClientRegisterRequest;
import com.alimentandoofuturo.entity.Client;
import com.alimentandoofuturo.security.JwtUtil;
import com.alimentandoofuturo.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*")
public class ClientAuthController {
    
    @Autowired
    private ClientService clientService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody ClientRegisterRequest request) {
        try {
            Client client = clientService.registerClient(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Cliente cadastrado com sucesso!",
                "client", Map.of(
                    "id", client.getId(),
                    "name", client.getName(),
                    "email", client.getEmail(),
                    "phone", client.getPhone()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody ClientLoginRequest request) {
        try {
            Optional<Client> clientOpt = clientService.authenticateClient(request.getEmail(), request.getPassword());
            
            if (clientOpt.isPresent()) {
                Client client = clientOpt.get();
                
                // Criar UserDetails para JWT
                User userDetails = new User(client.getEmail(), "", java.util.Collections.emptyList());
                String token = jwtUtil.generateToken(userDetails);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Login realizado com sucesso",
                    "token", token,
                    "client", Map.of(
                        "id", client.getId(),
                        "name", client.getName(),
                        "email", client.getEmail(),
                        "phone", client.getPhone()
                    )
                ));
            } else {
                return ResponseEntity.status(401).body(Map.of("error", "Credenciais inválidas"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno do servidor"));
        }
    }
}