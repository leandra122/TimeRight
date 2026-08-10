package com.timeright.tcc.dto;

public class DashboardStatsDTO {
    public long totalClientes;
    public long totalFuncionariosAtivos;
    public long totalServicos;
    public long agendamentosHoje;
    public long agendamentosSemana;
    public long agendamentosMes;
    public long agendamentosPendentes;
    public long agendamentosConfirmados;
    public long agendamentosCancelados;
    public Double mediaAvaliacoes;
    public long totalAvaliacoes;

    public DashboardStatsDTO(long totalClientes, long totalFuncionariosAtivos,
                              long totalServicos, long agendamentosHoje,
                              long agendamentosSemana, long agendamentosMes,
                              long agendamentosPendentes, long agendamentosConfirmados,
                              long agendamentosCancelados, Double mediaAvaliacoes,
                              long totalAvaliacoes) {
        this.totalClientes = totalClientes;
        this.totalFuncionariosAtivos = totalFuncionariosAtivos;
        this.totalServicos = totalServicos;
        this.agendamentosHoje = agendamentosHoje;
        this.agendamentosSemana = agendamentosSemana;
        this.agendamentosMes = agendamentosMes;
        this.agendamentosPendentes = agendamentosPendentes;
        this.agendamentosConfirmados = agendamentosConfirmados;
        this.agendamentosCancelados = agendamentosCancelados;
        this.mediaAvaliacoes = mediaAvaliacoes;
        this.totalAvaliacoes = totalAvaliacoes;
    }
}
