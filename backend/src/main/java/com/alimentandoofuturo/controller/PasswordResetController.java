package com.alimentandoofuturo.controller;

import com.alimentandoofuturo.dto.ForgotPasswordRequest;
import com.alimentandoofuturo.dto.ResetPasswordRequest;
import com.alimentandoofuturo.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/password")
@CrossOrigin(origins = "*")
public class PasswordResetController {
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            boolean success = passwordResetService.requestPasswordReset(request.getEmail());
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Código enviado para seu e-mail"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "E-mail não encontrado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno do servidor"));
        }
    }
    
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            boolean success = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Token inválido ou expirado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno do servidor"));
        }
    }
}