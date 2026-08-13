package com.timeright.tcc.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.model.entity.Servico;
import com.timeright.tcc.services.ServicoService;

@RestController
@RequestMapping("/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    public ResponseEntity<List<Servico>> findAll() {
        return ResponseEntity.ok(servicoService.listarTodos());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Servico>> findMine() {
        return ResponseEntity.ok(servicoService.listarMeus());
    }

    @GetMapping("/salao/{salaoId}")
    public ResponseEntity<List<Servico>> findBySalao(@PathVariable Long salaoId) {
        return ResponseEntity.ok(servicoService.listarPorSalao(salaoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servico> findById(@PathVariable Long id) {
        return ResponseEntity.ok(servicoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Servico> save(@RequestBody Servico servico) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicoService.salvar(servico));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servico> atualizar(@PathVariable Long id, @RequestBody Servico servico) {
        return ResponseEntity.ok(servicoService.atualizar(id, servico));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Servico> atualizarStatus(@PathVariable Long id,
                                                    @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(servicoService.atualizarStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletar(@PathVariable Long id) {
        servicoService.deletar(id);
        return ResponseEntity.ok(Map.of("message", "Serviço deletado com sucesso"));
    }
}
