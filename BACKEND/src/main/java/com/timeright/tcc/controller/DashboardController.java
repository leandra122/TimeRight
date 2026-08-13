package com.timeright.tcc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.timeright.tcc.services.DashboardService;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    public ResponseEntity<Object> stats() {
        try {
            return ResponseEntity.ok(service.getStats());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats/plataforma")
    public ResponseEntity<Object> statsPlataforma() {
        try {
            return ResponseEntity.ok(service.getStatsPlataforma());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats/salao/{salaoId}")
    public ResponseEntity<Object> statsSalao(@PathVariable Long salaoId) {
        return ResponseEntity.ok(service.getStatsSalao(salaoId));
    }
}
