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
import com.timeright.tcc.dto.EmployeeAgendamentoDTO;
import com.timeright.tcc.dto.FuncionarioServicosRequest;
import com.timeright.tcc.dto.FuncionarioServicosResponse;
import com.timeright.tcc.services.EmployeeAgendaService;
import com.timeright.tcc.services.FuncionarioServicoService;
import com.timeright.tcc.services.FuncionarioService;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;
    private final EmployeeAgendaService employeeAgendaService;
    private final FuncionarioServicoService funcionarioServicoService;

    public FuncionarioController(FuncionarioService funcionarioService,
                                 EmployeeAgendaService employeeAgendaService,
                                 FuncionarioServicoService funcionarioServicoService) {
        this.funcionarioService = funcionarioService;
        this.employeeAgendaService = employeeAgendaService;
        this.funcionarioServicoService = funcionarioServicoService;
    }

    @GetMapping("/me/agendamentos")
    public ResponseEntity<List<EmployeeAgendamentoDTO>> listarMinhaAgenda() {
        return ResponseEntity.ok(employeeAgendaService.listarAgendaPropria());
    }

    // LISTAR
    @GetMapping
    public ResponseEntity<List<Funcionario>> listar() {
        return ResponseEntity.ok(funcionarioService.listarGlobal());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Funcionario>> listarMeus() {
        return ResponseEntity.ok(funcionarioService.listarMeus());
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Object> findById(@PathVariable Long id) {
        return ResponseEntity.ok(funcionarioService.buscarAutorizado(id));
    }

    @GetMapping("/{funcionarioId}/servicos")
    public ResponseEntity<FuncionarioServicosResponse> consultarServicos(
            @PathVariable Long funcionarioId) {
        return ResponseEntity.ok(funcionarioServicoService.consultar(funcionarioId));
    }

    @PutMapping("/{funcionarioId}/servicos")
    public ResponseEntity<FuncionarioServicosResponse> substituirServicos(
            @PathVariable Long funcionarioId,
            @RequestBody FuncionarioServicosRequest request) {
        return ResponseEntity.ok(funcionarioServicoService.substituir(funcionarioId, request));
    }

    // CADASTRAR (DONO DO SALÃO)
    @PostMapping("/{salaoId}")
    public ResponseEntity<Object> salvar(@PathVariable Long salaoId,
                                         @RequestBody Funcionario funcionario) {
        return ResponseEntity.ok(funcionarioService.salvar(funcionario, salaoId));
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable Long id,
                                           @RequestBody Funcionario funcionario) {
        return ResponseEntity.ok(funcionarioService.atualizar(id, funcionario));
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
        return ResponseEntity.ok(Map.of("message", "Funcionário inativado; histórico preservado"));
    }
}
