package com.alimentandoofuturo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class ForgotPasswordController {
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        // Mock response simples
        return ResponseEntity.ok(Map.of(
            "message", "Código enviado para seu e-mail! Verifique sua caixa de entrada."
        ));
    }
}