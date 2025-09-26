package com.alimentandoofuturo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*")
public class ClientAuthController {
    

    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of(
            "message", "Cliente cadastrado com sucesso!",
            "client", Map.of(
                "id", 1,
                "name", request.get("name"),
                "email", request.get("email"),
                "phone", request.get("phone")
            )
        ));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String token = java.util.UUID.randomUUID().toString();
        return ResponseEntity.ok(Map.of(
            "message", "Login realizado com sucesso",
            "token", token,
            "client", Map.of(
                "id", 1,
                "name", "Cliente Teste",
                "email", request.get("email"),
                "phone", "11999999999"
            )
        ));
    }
}