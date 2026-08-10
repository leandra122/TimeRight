package com.timeright.tcc.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.timeright.tcc.dto.AvaliacaoDTO;
import com.timeright.tcc.model.entity.Avaliacao;
import com.timeright.tcc.services.AvaliacaoService;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) {
        this.service = service;
    }

    @GetMapping("/salao/{salaoId}")
    public ResponseEntity<List<Avaliacao>> porSalao(@PathVariable Long salaoId) {
        return ResponseEntity.ok(service.listarPorSalao(salaoId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Avaliacao>> porUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.listarPorUsuario(usuarioId));
    }

    @PostMapping
    public ResponseEntity<Object> avaliar(@RequestBody AvaliacaoDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.avaliar(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
