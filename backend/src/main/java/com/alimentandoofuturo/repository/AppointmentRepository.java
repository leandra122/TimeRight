package com.alimentandoofuturo.repository;

import com.alimentandoofuturo.entity.Appointment;
import com.alimentandoofuturo.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClientOrderByAppointmentDateDesc(Client client);
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByStatusOrderByAppointmentDateAsc(String status);
}