package com.timeright.tcc.dto;

public class PlataformaStatsDTO {
    public long totalAgendamentos;
    public long totalSaloes;
    public Double mediaAvaliacoes;
    public long totalAvaliacoes;
    public long totalClientes;

    public PlataformaStatsDTO(long totalAgendamentos, long totalSaloes,
                               Double mediaAvaliacoes, long totalAvaliacoes,
                               long totalClientes) {
        this.totalAgendamentos = totalAgendamentos;
        this.totalSaloes = totalSaloes;
        this.mediaAvaliacoes = mediaAvaliacoes;
        this.totalAvaliacoes = totalAvaliacoes;
        this.totalClientes = totalClientes;
    }
}
