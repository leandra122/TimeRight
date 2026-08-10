package com.timeright.tcc.controller;

import java.util.List;
import java.util.Map;

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

import com.timeright.tcc.model.entity.Funcionario;
import com.timeright.tcc.services.FuncionarioService;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;

    public FuncionarioController(FuncionarioService funcionarioService) {
        this.funcionarioService = funcionarioService;
    }

    // LISTAR
    @GetMapping
    public ResponseEntity<List<Funcionario>> listar() {
        return ResponseEntity.ok(funcionarioService.listar());
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(funcionarioService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // CADASTRAR (DONO DO SALÃO)
    @PostMapping("/{salaoId}")
    public ResponseEntity<Object> salvar(@PathVariable Long salaoId,
                                         @RequestBody Funcionario funcionario) {
        try {
            return ResponseEntity.ok(funcionarioService.salvar(funcionario, salaoId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id,
                                           @RequestBody Funcionario funcionario) {
        try {
            return ResponseEntity.ok(funcionarioService.atualizar(id, funcionario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> status(@PathVariable Long id,
                                         @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                funcionarioService.atualizarStatus(id, body.get("status"))
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        funcionarioService.deletar(id);
        return ResponseEntity.ok(Map.of("message", "Funcionário removido"));
    }
}