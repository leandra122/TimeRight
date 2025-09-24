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
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            
            Admin admin = (Admin) authentication.getPrincipal();
            String token = jwtUtil.generateToken(admin);
            
            LoginResponse.AdminDto adminDto = new LoginResponse.AdminDto(
                admin.getId(), admin.getName(), admin.getEmail()
            );
            
            return ResponseEntity.ok(new LoginResponse("Login realizado com sucesso", token, adminDto));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Credenciais inválidas"));
        }
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