package com.timeright.tcc.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class LoginRequest {

    private String username;

    // Aceita tanto { "senha": "..." } quanto { "password": "..." } no JSON do frontend.
    // Isso evita erro quando a tela de login usa o nome password, mas o backend esperava senha.
    @JsonAlias("password")
    private String senha;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public void setPassword(String password) {
        this.senha = password;
    }
}
