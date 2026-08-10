package com.timeright.tcc.dto;

public class SalaoStatsDTO {
    public Long salaoId;
    public String nome;
    public Double mediaAvaliacoes;
    public long totalAvaliacoes;
    public long totalFuncionariosAtivos;
    public long totalServicosAtivos;

    public SalaoStatsDTO(Long salaoId, String nome, Double mediaAvaliacoes,
                          long totalAvaliacoes, long totalFuncionariosAtivos,
                          long totalServicosAtivos) {
        this.salaoId = salaoId;
        this.nome = nome;
        this.mediaAvaliacoes = mediaAvaliacoes;
        this.totalAvaliacoes = totalAvaliacoes;
        this.totalFuncionariosAtivos = totalFuncionariosAtivos;
        this.totalServicosAtivos = totalServicosAtivos;
    }
}
