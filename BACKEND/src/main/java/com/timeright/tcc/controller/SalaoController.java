package com.timeright.tcc.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.dto.SalaoServicosDTO;
import com.timeright.tcc.dto.ConfiguracaoAgendamentoSalaoRequest;
import com.timeright.tcc.dto.ConfiguracaoAgendamentoSalaoResponse;
import com.timeright.tcc.integration.CnpjConsultaException;
import com.timeright.tcc.integration.CnpjConsultaGateway;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.services.SalaoService;

@RestController
@RequestMapping("/saloes")
@CrossOrigin(origins = "http://localhost:3000")
public class SalaoController {

    private final SalaoService salaoService;
    private final CnpjConsultaGateway cnpjGateway;

    public SalaoController(SalaoService salaoService, CnpjConsultaGateway cnpjGateway) {
        this.salaoService = salaoService;
        this.cnpjGateway = cnpjGateway;
    }

    // =========================
    // CONSULTAR CNPJ
    // =========================
    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<Object> consultarCnpj(@PathVariable String cnpj) {
        try {
            return ResponseEntity.ok(cnpjGateway.consultar(cnpj));
        } catch (CnpjConsultaException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // =========================
    // 🔥 CADASTRAR SALÃO + SERVIÇOS
    // =========================
    @PostMapping("/com-servicos")
    public ResponseEntity<Object> salvarComServicos(@RequestBody SalaoServicosDTO dto) {
        Salao salao = salaoService.salvarComServicos(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Salão criado com sucesso",
                    "data", salao
                )
            );
    }

    // =========================
    // 📌 LISTAR SALÕES
    // =========================
    @GetMapping
    public ResponseEntity<List<Salao>> listarTodos() {
        return ResponseEntity.ok(salaoService.listarTodos());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Salao>> listarMeusSaloes() {
        return ResponseEntity.ok(salaoService.listarMeusSaloes());
    }

    // =========================
    // 📌 BUSCAR POR ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(salaoService.buscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // =========================
    // 📌 ATUALIZAR
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id, @RequestBody Salao salao) {
        return ResponseEntity.ok(salaoService.atualizar(id, salao));
    }

    // =========================
    // 📌 DELETAR
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        salaoService.deletar(id);
        return ResponseEntity.ok(Map.of("message", "Salão deletado com sucesso"));
    }

    @GetMapping("/{id}/configuracao-agendamento")
    public ResponseEntity<ConfiguracaoAgendamentoSalaoResponse> buscarConfiguracaoAgendamento(
            @PathVariable Long id) {
        return ResponseEntity.ok(salaoService.buscarConfiguracaoAgendamento(id));
    }

    @PutMapping("/{id}/configuracao-agendamento")
    public ResponseEntity<ConfiguracaoAgendamentoSalaoResponse> atualizarConfiguracaoAgendamento(
            @PathVariable Long id,
            @RequestBody ConfiguracaoAgendamentoSalaoRequest configuracao) {
        return ResponseEntity.ok(
                salaoService.atualizarConfiguracaoAgendamento(id, configuracao));
    }
}
