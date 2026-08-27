package com.timeright.tcc.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FuncionarioServicosRequest(List<Long> servicoIds) {
}
