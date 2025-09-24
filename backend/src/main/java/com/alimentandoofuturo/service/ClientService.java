package com.alimentandoofuturo.service;

import com.alimentandoofuturo.entity.Client;
import com.alimentandoofuturo.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ClientService {
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public Client registerClient(String name, String email, String password, String phone) {
        // Verifica se já existe cliente com este email
        if (clientRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
        }
        
        Client client = new Client();
        client.setName(name);
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(password));
        client.setPhone(phone);
        
        return clientRepository.save(client);
    }
    
    public Optional<Client> authenticateClient(String email, String password) {
        Optional<Client> clientOpt = clientRepository.findByEmailAndActiveTrue(email);
        
        if (clientOpt.isPresent()) {
            Client client = clientOpt.get();
            if (passwordEncoder.matches(password, client.getPassword())) {
                return Optional.of(client);
            }
        }
        
        return Optional.empty();
    }
    
    public Optional<Client> findByEmail(String email) {
        return clientRepository.findByEmailAndActiveTrue(email);
    }
}