package com.alimentandoofuturo.controller;

import com.alimentandoofuturo.repository.CategoryRepository;
import com.alimentandoofuturo.repository.ProfessionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ProfessionalRepository professionalRepository;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalCategories = categoryRepository.count();
        long totalProfessionals = professionalRepository.count();
        long activeCategories = categoryRepository.findByActiveTrue().size();
        long activeProfessionals = professionalRepository.findByActiveTrue().size();
        
        return ResponseEntity.ok(Map.of(
            "totalCategories", totalCategories,
            "totalProfessionals", totalProfessionals,
            "activeCategories", activeCategories,
            "activeProfessionals", activeProfessionals
        ));
    }
}