package com.alimentandoofuturo.repository;

import com.alimentandoofuturo.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmailAndActiveTrue(String email);
    Optional<Admin> findByEmail(String email);
}