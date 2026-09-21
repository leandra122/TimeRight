package com.timeright.tcc.integration;

import com.timeright.tcc.dto.LocalizacaoResponse;

public interface GeocodingGateway {
    LocalizacaoResponse consultar(String endereco) throws Exception;
}
