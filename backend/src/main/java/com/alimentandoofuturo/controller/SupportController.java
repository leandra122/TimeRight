package com.alimentandoofuturo.controller;

import com.alimentandoofuturo.dto.SupportRequest;
import com.alimentandoofuturo.entity.Support;
import com.alimentandoofuturo.repository.SupportRepository;
import com.alimentandoofuturo.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {
    
    @Autowired
    private SupportRepository supportRepository;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping
    public ResponseEntity<?> createSupportRequest(@Valid @RequestBody SupportRequest request) {
        try {
            // Salvar no banco
            Support support = new Support();
            support.setName(request.getName());
            support.setEmail(request.getEmail());
            support.setSubject(request.getSubject());
            support.setMessage(request.getMessage());
            supportRepository.save(support);
            
            // Enviar e-mail para o administrador
            emailService.sendSupportRequest(
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage()
            );
            
            return ResponseEntity.ok(Map.of("message", "Solicitação enviada com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erro ao enviar solicitação"));
        }
    }
}