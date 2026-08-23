package com.timeright.tcc.model.entity;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "HorarioFuncionamentoSalao", uniqueConstraints = @UniqueConstraint(
        name = "UX_HorarioFuncionamentoSalao_Periodo",
        columnNames = {"salao_id", "dia_semana", "hora_inicio", "hora_fim"}))
public class HorarioFuncionamentoSalao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salao_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Salao salao;

    @Column(name = "dia_semana", nullable = false)
    private Integer diaSemana;

    @Column(name = "hora_inicio", nullable = false, columnDefinition = "TIME(0)")
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false, columnDefinition = "TIME(0)")
    private LocalTime horaFim;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Salao getSalao() { return salao; }
    public void setSalao(Salao salao) { this.salao = salao; }
    public Integer getDiaSemana() { return diaSemana; }
    public void setDiaSemana(Integer diaSemana) { this.diaSemana = diaSemana; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFim() { return horaFim; }
    public void setHoraFim(LocalTime horaFim) { this.horaFim = horaFim; }
}
