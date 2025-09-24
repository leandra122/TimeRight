package com.alimentandoofuturo.controller;

import com.alimentandoofuturo.dto.AppointmentRequest;
import com.alimentandoofuturo.entity.Appointment;
import com.alimentandoofuturo.service.AppointmentService;
import com.alimentandoofuturo.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @PostMapping
    public ResponseEntity<?> createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @RequestHeader("X-Client-Email") String clientEmail) {
        try {
            Appointment appointment = appointmentService.createAppointment(
                clientEmail,
                request.getProfessionalId(),
                request.getCategoryId(),
                request.getAppointmentDate(),
                request.getNotes()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Agendamento criado com sucesso!",
                "appointment", Map.of(
                    "id", appointment.getId(),
                    "professional", appointment.getProfessional().getName(),
                    "category", appointment.getCategory().getName(),
                    "date", appointment.getAppointmentDate(),
                    "status", appointment.getStatus()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/my-appointments")
    public ResponseEntity<?> getMyAppointments(@RequestHeader("X-Client-Email") String clientEmail) {
        try {
            List<Appointment> appointments = appointmentService.getClientAppointments(clientEmail);
            return ResponseEntity.ok(Map.of("appointments", appointments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(Map.of("appointments", appointments));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno do servidor"));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Appointment appointment = appointmentService.updateAppointmentStatus(id, status);
            
            return ResponseEntity.ok(Map.of(
                "message", "Status atualizado com sucesso",
                "appointment", appointment
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}