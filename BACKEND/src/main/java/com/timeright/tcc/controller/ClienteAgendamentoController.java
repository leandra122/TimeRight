package com.timeright.tcc.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.dto.ClienteAgendamentoRequest;
import com.timeright.tcc.dto.ClienteAgendamentoResponse;
import com.timeright.tcc.services.ClienteAgendamentoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/client/agendamentos")
public class ClienteAgendamentoController {

    private final ClienteAgendamentoService clienteAgendamentoService;

    public ClienteAgendamentoController(ClienteAgendamentoService clienteAgendamentoService) {
        this.clienteAgendamentoService = clienteAgendamentoService;
    }

    @PostMapping
    public ResponseEntity<ClienteAgendamentoResponse> criar(
            @Valid @RequestBody ClienteAgendamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteAgendamentoService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<ClienteAgendamentoResponse>> listar() {
        return ResponseEntity.ok(clienteAgendamentoService.listarProprios());
    }

    @PatchMapping("/{agendamentoId}/cancelar")
    public ResponseEntity<ClienteAgendamentoResponse> cancelar(@PathVariable Long agendamentoId) {
        return ResponseEntity.ok(clienteAgendamentoService.cancelar(agendamentoId));
    }
}
