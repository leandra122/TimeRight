package com.alimentandoofuturo.controller;

import com.alimentandoofuturo.entity.Professional;
import com.alimentandoofuturo.repository.ProfessionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professionals")
@CrossOrigin(origins = "*")
public class ProfessionalController {
    
    @Autowired
    private ProfessionalRepository professionalRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<Professional> professionals = professionalRepository.findByActiveTrue();
        return ResponseEntity.ok(Map.of("professionals", professionals));
    }
    
    @PostMapping
    public ResponseEntity<Professional> create(@RequestBody Professional professional) {
        Professional saved = professionalRepository.save(professional);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Professional> update(@PathVariable Long id, @RequestBody Professional professional) {
        professional.setId(id);
        Professional updated = professionalRepository.save(professional);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        professionalRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}