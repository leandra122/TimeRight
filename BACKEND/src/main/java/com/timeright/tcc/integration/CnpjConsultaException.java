package com.timeright.tcc.integration;

/**
 * Lançada quando a consulta de CNPJ falha (não encontrado, serviço indisponível, etc.).
 */
public class CnpjConsultaException extends RuntimeException {

    public CnpjConsultaException(String message) {
        super(message);
    }

    public CnpjConsultaException(String message, Throwable cause) {
        super(message, cause);
    }
}
