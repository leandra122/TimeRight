package com.alimentandoofuturo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "message", "Time Right API funcionando!",
            "documentation", "/swagger-ui.html",
            "health", "/health"
        );
    }
    
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "OK",
            "timestamp", LocalDateTime.now()
        );
    }
}