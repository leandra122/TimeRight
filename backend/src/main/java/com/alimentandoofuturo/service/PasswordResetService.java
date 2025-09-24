package com.alimentandoofuturo.service;

import com.alimentandoofuturo.entity.Admin;
import com.alimentandoofuturo.entity.PasswordResetToken;
import com.alimentandoofuturo.repository.AdminRepository;
import com.alimentandoofuturo.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class PasswordResetService {
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Transactional
    public boolean requestPasswordReset(String email) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isEmpty()) {
            return false;
        }
        
        // Remove tokens antigos
        tokenRepository.deleteByEmail(email);
        
        // Gera novo token
        String token = generateToken();
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        tokenRepository.save(resetToken);
        
        // Envia e-mail
        emailService.sendPasswordResetToken(email, token);
        return true;
    }
    
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenAndUsedFalse(token);
        
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (resetToken.isExpired()) {
            return false;
        }
        
        Optional<Admin> adminOpt = adminRepository.findByEmail(resetToken.getEmail());
        if (adminOpt.isEmpty()) {
            return false;
        }
        
        Admin admin = adminOpt.get();
        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
        
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        return true;
    }
    
    private String generateToken() {
        SecureRandom random = new SecureRandom();
        int token = 100000 + random.nextInt(900000);
        return String.valueOf(token);
    }
}