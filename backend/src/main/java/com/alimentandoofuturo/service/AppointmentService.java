package com.alimentandoofuturo.service;

import com.alimentandoofuturo.entity.Appointment;
import com.alimentandoofuturo.entity.Category;
import com.alimentandoofuturo.entity.Client;
import com.alimentandoofuturo.entity.Professional;
import com.alimentandoofuturo.repository.AppointmentRepository;
import com.alimentandoofuturo.repository.CategoryRepository;
import com.alimentandoofuturo.repository.ClientRepository;
import com.alimentandoofuturo.repository.ProfessionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private ProfessionalRepository professionalRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private EmailService emailService;
    
    public Appointment createAppointment(String clientEmail, Long professionalId, Long categoryId, 
                                       LocalDateTime appointmentDate, String notes) {
        
        Optional<Client> clientOpt = clientRepository.findByEmailAndActiveTrue(clientEmail);
        if (clientOpt.isEmpty()) {
            throw new RuntimeException("Cliente não encontrado");
        }
        
        Optional<Professional> professionalOpt = professionalRepository.findByIdAndActiveTrue(professionalId);
        if (professionalOpt.isEmpty()) {
            throw new RuntimeException("Profissional não encontrado");
        }
        
        Optional<Category> categoryOpt = categoryRepository.findByIdAndActiveTrue(categoryId);
        if (categoryOpt.isEmpty()) {
            throw new RuntimeException("Categoria não encontrada");
        }
        
        Appointment appointment = new Appointment();
        appointment.setClient(clientOpt.get());
        appointment.setProfessional(professionalOpt.get());
        appointment.setCategory(categoryOpt.get());
        appointment.setAppointmentDate(appointmentDate);
        appointment.setNotes(notes);
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Enviar confirmação por e-mail
        sendAppointmentConfirmation(savedAppointment);
        
        return savedAppointment;
    }
    
    public List<Appointment> getClientAppointments(String clientEmail) {
        Optional<Client> clientOpt = clientRepository.findByEmailAndActiveTrue(clientEmail);
        if (clientOpt.isEmpty()) {
            throw new RuntimeException("Cliente não encontrado");
        }
        
        return appointmentRepository.findByClientOrderByAppointmentDateDesc(clientOpt.get());
    }
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public Appointment updateAppointmentStatus(Long appointmentId, String status) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) {
            throw new RuntimeException("Agendamento não encontrado");
        }
        
        Appointment appointment = appointmentOpt.get();
        appointment.setStatus(status);
        
        return appointmentRepository.save(appointment);
    }
    
    private void sendAppointmentConfirmation(Appointment appointment) {
        try {
            emailService.sendAppointmentConfirmation(appointment);
        } catch (Exception e) {
            // Log error but don't fail the appointment creation
            System.err.println("Erro ao enviar confirmação de agendamento: " + e.getMessage());
        }
    }
}