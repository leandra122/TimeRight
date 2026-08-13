package com.timeright.tcc.security;

public class InvalidAuthenticatedUserException extends RuntimeException {

    public InvalidAuthenticatedUserException() {
        super("Autenticação necessária ou token inválido");
    }
}
