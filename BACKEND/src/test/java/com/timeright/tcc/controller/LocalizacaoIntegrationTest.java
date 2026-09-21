package com.timeright.tcc.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.timeright.tcc.dto.LocalizacaoResponse;
import com.timeright.tcc.integration.GeocodingGateway;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.services.SalaoService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LocalizacaoIntegrationTest {
    @Autowired MockMvc mvc;
    @MockitoBean SalaoService saloes;
    @MockitoBean GeocodingGateway gateway;

    @Test void publicLocationUsesStoredAddressAllowsExpoAndFailureDoesNotBreakDetails() throws Exception {
        var salon = new Salao();
        salon.setId(42L); salon.setNome("Salão de teste");
        salon.setLogradouro("Rua cadastrada"); salon.setNumero("100"); salon.setCidade("Barueri"); salon.setUf("SP");
        when(saloes.buscarPorId(42L)).thenReturn(salon);
        when(gateway.consultar(anyString())).thenAnswer(inv -> new LocalizacaoResponse("FOUND", inv.getArgument(0), "Endereço do provedor", -23.5, -46.6));
        mvc.perform(get("/saloes/42/localizacao").header("Origin", "http://localhost:8081"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8081"))
                .andExpect(jsonPath("$.status").value("FOUND"))
                .andExpect(jsonPath("$.enderecoConsultado").value("Rua cadastrada, 100, Barueri, SP"));
        salon.setNumero("200");
        when(gateway.consultar(anyString())).thenThrow(new java.io.IOException("offline"));
        mvc.perform(get("/saloes/42/localizacao")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNAVAILABLE"))
                .andExpect(jsonPath("$.latitude").isEmpty());
        mvc.perform(get("/saloes/42")).andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Salão de teste"));
        verify(gateway, times(2)).consultar(anyString());
    }
}
