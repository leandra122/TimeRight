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

    // 🔹 LISTAR TODOS
    @GetMapping
    public ResponseEntity<List<Servico>> findAll() {
        return ResponseEntity.ok(servicoService.listarTodos());
    }

    // 🔹 LISTAR POR SALÃO
    @GetMapping("/salao/{salaoId}")
    public ResponseEntity<List<Servico>> findBySalao(@PathVariable Long salaoId) {
        return ResponseEntity.ok(servicoService.listarPorSalao(salaoId));
    }

    // 🔹 BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable String id) {
        try {
            Long idLong = Long.parseLong(id);
            return ResponseEntity.ok(servicoService.findById(idLong));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("status", 400, "error", "Bad Request", "message", "O id informado não é válido: " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("status", 404, "error", "Not Found", "message", "Serviço não encontrado com o id: " + id));
        }
    }

    // 🔹 SALVAR
    @PostMapping
    public ResponseEntity<Object> save(@RequestBody Servico servico) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(servicoService.salvar(servico));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("status", 500, "error", "Internal Server Error", "message", "Erro ao salvar serviço: " + e.getMessage()));
        }
    }

    // 🔹 ATUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable String id, @RequestBody Servico servico) {
        try {
            Long idLong = Long.parseLong(id);
            return ResponseEntity.ok(servicoService.atualizar(idLong, servico));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("status", 400, "error", "Bad Request", "message", "O id informado não é válido: " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("status", 404, "error", "Not Found", "message", "Serviço não encontrado com o id: " + id));
        }
    }

    // 🔹 ATUALIZAR STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> atualizarStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            Long idLong = Long.parseLong(id);
            String novoStatus = body.get("status");
            if (novoStatus == null || (!novoStatus.equals("ATIVO") && !novoStatus.equals("INATIVO"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Status inválido. Use ATIVO ou INATIVO."));
            }
            return ResponseEntity.ok(servicoService.atualizarStatus(idLong, novoStatus));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Id inválido: " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", "Serviço não encontrado com id: " + id));
        }
    }

    // 🔹 DELETAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable String id) {
        try {
            Long idLong = Long.parseLong(id);
            servicoService.deletar(idLong);
            return ResponseEntity.ok(Map.of("status", 200, "message", "Serviço deletado com sucesso!"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("status", 400, "error", "Bad Request", "message", "O id informado não é válido: " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("status", 404, "error", "Not Found", "message", "Serviço não encontrado com o id " + id));
        }
    }
}
