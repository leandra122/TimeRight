package com.alimentandoofuturo.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AppointmentRequest {
    @NotNull(message = "ID do profissional é obrigatório")
    private Long professionalId;
    
    @NotNull(message = "ID da categoria é obrigatório")
    private Long categoryId;
    
    @NotNull(message = "Data do agendamento é obrigatória")
    private LocalDateTime appointmentDate;
    
    private String notes;
    
    // Getters and Setters
    public Long getProfessionalId() { return professionalId; }
    public void setProfessionalId(Long professionalId) { this.professionalId = professionalId; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}