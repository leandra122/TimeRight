package com.timeright.tcc.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.model.entity.NivelAcesso;
import com.timeright.tcc.services.NivelAcessoService;

@RestController
@RequestMapping("/niveis-acesso")
public class NivelAcessoController {

    private final NivelAcessoService nivelAcessoService;

    public NivelAcessoController(NivelAcessoService nivelAcessoService) {
        this.nivelAcessoService = nivelAcessoService;
    }

    @GetMapping
    public ResponseEntity<List<NivelAcesso>> listarTodos() {
        return ResponseEntity.ok(nivelAcessoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(nivelAcessoService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
