package com.timeright.tcc.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timeright.tcc.dto.FuncionarioCatalogoResponse;
import com.timeright.tcc.services.CatalogoFuncionarioService;

@RestController
@RequestMapping("/catalogo")
public class CatalogoController {

    private final CatalogoFuncionarioService catalogoFuncionarioService;

    public CatalogoController(CatalogoFuncionarioService catalogoFuncionarioService) {
        this.catalogoFuncionarioService = catalogoFuncionarioService;
    }

    @GetMapping("/saloes/{salaoId}/funcionarios")
    public ResponseEntity<List<FuncionarioCatalogoResponse>> listarFuncionarios(
            @PathVariable Long salaoId) {
        return ResponseEntity.ok(catalogoFuncionarioService.listarAtivosPorSalao(salaoId));
    }
}
