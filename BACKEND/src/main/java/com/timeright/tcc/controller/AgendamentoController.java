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

import com.timeright.tcc.model.entity.Agendamento;
import com.timeright.tcc.services.AgendamentoService;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    private final AgendamentoService service;

    public AgendamentoController(AgendamentoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Agendamento>> findAll() {
        return ResponseEntity.ok(service.listarGlobal());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Agendamento>> findMine() {
        return ResponseEntity.ok(service.listarMeus());
    }
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Agendamento>> findByUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.listarPorUsuario(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarAutorizado(id));
    }

    @PostMapping
    public ResponseEntity<Object> save(@RequestBody Agendamento agendamento) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(service.salvar(agendamento));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Long id,
                                         @RequestBody Agendamento agendamento) {
        try {
            return ResponseEntity.ok(service.atualizar(id, agendamento));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Object> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.ok(Map.of("message", "Deletado com sucesso"));
    }
}