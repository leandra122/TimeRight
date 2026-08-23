package com.timeright.tcc.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.dto.ClienteDisponibilidadeResponse;
import com.timeright.tcc.services.ClienteAgendamentoService;

@RestController
public class ClienteDisponibilidadeController {

    private final ClienteAgendamentoService clienteAgendamentoService;

    public ClienteDisponibilidadeController(ClienteAgendamentoService clienteAgendamentoService) {
        this.clienteAgendamentoService = clienteAgendamentoService;
    }

    @GetMapping("/api/client/disponibilidade")
    public ResponseEntity<ClienteDisponibilidadeResponse> consultar(
            @RequestParam Long funcionarioId,
            @RequestParam Long servicoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(
                clienteAgendamentoService.consultarDisponibilidade(funcionarioId, servicoId, data));
    }
}
