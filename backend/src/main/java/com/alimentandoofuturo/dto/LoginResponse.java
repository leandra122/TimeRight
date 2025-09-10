package com.alimentandoofuturo.dto;

public class LoginResponse {
    private String message;
    private String token;
    private AdminDto admin;
    
    public LoginResponse(String message, String token, AdminDto admin) {
        this.message = message;
        this.token = token;
        this.admin = admin;
    }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public AdminDto getAdmin() { return admin; }
    public void setAdmin(AdminDto admin) { this.admin = admin; }
    
    public static class AdminDto {
        private Long id;
        private String name;
        private String email;
        
        public AdminDto(Long id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}