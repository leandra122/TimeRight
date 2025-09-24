package com.alimentandoofuturo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @ManyToOne
    @JoinColumn(name = "professional_id", nullable = false)
    private Professional professional;
    
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;
    
    @Column(nullable = false)
    private String status = "AGENDADO"; // AGENDADO, CONFIRMADO, CANCELADO, CONCLUIDO
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    
    public Professional getProfessional() { return professional; }
    public void setProfessional(Professional professional) { this.professional = professional; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}