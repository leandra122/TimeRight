package com.timeright.tcc.dto;

public record LocalizacaoResponse(String status, String enderecoConsultado,
        String enderecoEncontrado, Double latitude, Double longitude) {
    public static LocalizacaoResponse semPonto(String status, String endereco) {
        return new LocalizacaoResponse(status, endereco, null, null, null);
    }
}
