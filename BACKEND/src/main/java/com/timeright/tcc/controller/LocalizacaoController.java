package com.timeright.tcc.controller;

import org.springframework.web.bind.annotation.*;
import com.timeright.tcc.dto.LocalizacaoResponse;
import com.timeright.tcc.services.GeocodingService;
import com.timeright.tcc.services.SalaoService;

@RestController
@RequestMapping("/saloes")
public class LocalizacaoController {
    private final SalaoService saloes;
    private final GeocodingService geocoding;
    public LocalizacaoController(SalaoService saloes, GeocodingService geocoding) {
        this.saloes = saloes;
        this.geocoding = geocoding;
    }
    @GetMapping("/{id}/localizacao")
    public LocalizacaoResponse localizar(@PathVariable Long id) {
        return geocoding.localizar(saloes.buscarPorId(id));
    }
}
