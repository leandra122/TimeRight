package com.alimentandoofuturo.config;

import com.alimentandoofuturo.entity.Admin;
import com.alimentandoofuturo.entity.Category;
import com.alimentandoofuturo.entity.Professional;
import com.alimentandoofuturo.repository.AdminRepository;
import com.alimentandoofuturo.repository.CategoryRepository;
import com.alimentandoofuturo.repository.ProfessionalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ProfessionalRepository professionalRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Admin padrão
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setEmail("admin@timeright.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Administrador Time Right");
            admin.setActive(true);
            adminRepository.save(admin);
        }
        
        // Categorias de exemplo
        if (categoryRepository.count() == 0) {
            Category cat1 = new Category();
            cat1.setName("Cortes de Cabelo");
            cat1.setDescription("Cortes modernos e clássicos");
            categoryRepository.save(cat1);
            
            Category cat2 = new Category();
            cat2.setName("Coloração");
            cat2.setDescription("Tintura e mechas profissionais");
            categoryRepository.save(cat2);
            
            Category cat3 = new Category();
            cat3.setName("Tratamentos");
            cat3.setDescription("Hidratação e reconstrução capilar");
            categoryRepository.save(cat3);
        }
        
        // Profissionais de exemplo
        if (professionalRepository.count() == 0) {
            Professional prof1 = new Professional();
            prof1.setName("Maria Silva");
            prof1.setSpecialty("Colorista");
            prof1.setPhone("(11) 99999-1111");
            prof1.setEmail("maria@timeright.com");
            professionalRepository.save(prof1);
            
            Professional prof2 = new Professional();
            prof2.setName("João Santos");
            prof2.setSpecialty("Cabeleireiro");
            prof2.setPhone("(11) 99999-2222");
            prof2.setEmail("joao@timeright.com");
            professionalRepository.save(prof2);
        }
    }
}