package com.alimentandoofuturo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    @GetMapping
    public ResponseEntity<?> getReports(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "month") String period) {
        
        // Dados mockados para demonstração
        Map<String, Object> reportData = new HashMap<>();
        reportData.put("appointments", 45);
        reportData.put("cancellations", 8);
        reportData.put("clients", 37);
        reportData.put("revenue", 2850.00);
        
        List<Map<String, Object>> appointmentsList = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> appointment = new HashMap<>();
            appointment.put("date", LocalDate.now().minusDays(i).toString());
            appointment.put("clientName", "Cliente " + i);
            appointment.put("serviceName", "Corte de Cabelo");
            appointment.put("professionalName", "Profissional " + i);
            appointment.put("status", i % 2 == 0 ? "confirmed" : "cancelled");
            appointment.put("value", 50.00 + (i * 10));
            appointmentsList.add(appointment);
        }
        
        reportData.put("appointmentsList", appointmentsList);
        
        return ResponseEntity.ok(reportData);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPDF(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "month") String period) {
        
        // Mock PDF content
        String pdfContent = "Relatório TimeRight - " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        byte[] pdfBytes = pdfContent.getBytes();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "relatorio-" + LocalDate.now() + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "month") String period) {
        
        // Mock Excel content
        String excelContent = "Relatório TimeRight Excel - " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        byte[] excelBytes = excelContent.getBytes();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "relatorio-" + LocalDate.now() + ".xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
}