package com.alimentandoofuturo.controller;

import com.alimentandoofuturo.dto.LoginRequest;
import com.alimentandoofuturo.dto.LoginResponse;
import com.alimentandoofuturo.entity.Admin;
import com.alimentandoofuturo.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Backend funcionando!");
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(new LoginResponse("Login realizado com sucesso", "fake-token", 
            new LoginResponse.AdminDto(1L, "Admin", "admin@timeright.com")));
    }
    
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
}