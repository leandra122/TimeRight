package com.timeright.tcc.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.timeright.tcc.dto.DashboardStatsDTO;
import com.timeright.tcc.dto.PlataformaStatsDTO;
import com.timeright.tcc.dto.SalaoStatsDTO;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.repository.AgendamentoRepository;
import com.timeright.tcc.model.repository.AvaliacaoRepository;
import com.timeright.tcc.model.repository.FuncionarioRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.ServicoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;

@Service
public class DashboardService {

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ServicoRepository servicoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final SalaoRepository salaoRepository;
    private final SalaoService salaoService;

    public DashboardService(AgendamentoRepository agendamentoRepository,
                             UsuarioRepository usuarioRepository,
                             FuncionarioRepository funcionarioRepository,
                             ServicoRepository servicoRepository,
                             AvaliacaoRepository avaliacaoRepository,
                             SalaoRepository salaoRepository,
                             SalaoService salaoService) {
        this.agendamentoRepository = agendamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.servicoRepository = servicoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.salaoRepository = salaoRepository;
        this.salaoService = salaoService;
    }

    public DashboardStatsDTO getStats() {
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioDia = hoje.atStartOfDay();
        LocalDateTime fimDia = hoje.plusDays(1).atStartOfDay();

        WeekFields semana = WeekFields.of(Locale.getDefault());
        LocalDate inicioSemana = hoje.with(semana.dayOfWeek(), 1);
        LocalDate fimSemana = inicioSemana.plusDays(7);

        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDate fimMes = inicioMes.plusMonths(1);

        // nivel_acesso_id = 3 = USER (cliente) — gerenciado pelo Mobile
        long totalClientes = usuarioRepository.countByNivelAcessoIdAndStatusAtivo(3L);
        long totalFuncionariosAtivos = funcionarioRepository.countByStatus("ATIVO");
        long totalServicos = servicoRepository.count();
        long agendamentosHoje = agendamentoRepository.countByDataHoraBetween(inicioDia, fimDia);
        long agendamentosSemana = agendamentoRepository.countByDataHoraBetween(
                inicioSemana.atStartOfDay(), fimSemana.atStartOfDay());
        long agendamentosMes = agendamentoRepository.countByDataHoraBetween(
                inicioMes.atStartOfDay(), fimMes.atStartOfDay());
        long pendentes = agendamentoRepository.countByStatus("AGENDADO");
        long confirmados = agendamentoRepository.countByStatus("CONFIRMADO");
        long cancelados = agendamentoRepository.countByStatus("CANCELADO");
        Double media = avaliacaoRepository.mediaGeralNotas();
        long totalAvaliacoes = avaliacaoRepository.totalAvaliacoes();

        return new DashboardStatsDTO(totalClientes, totalFuncionariosAtivos, totalServicos,
                agendamentosHoje, agendamentosSemana, agendamentosMes,
                pendentes, confirmados, cancelados, media, totalAvaliacoes);
    }

    public PlataformaStatsDTO getStatsPlataforma() {
        long totalAgendamentos = agendamentoRepository.count();
        long totalSaloes = salaoRepository.count();
        Double media = avaliacaoRepository.mediaGeralNotas();
        long totalAvaliacoes = avaliacaoRepository.totalAvaliacoes();
        long totalClientes = usuarioRepository.countByNivelAcessoIdAndStatusAtivo(3L);

        return new PlataformaStatsDTO(totalAgendamentos, totalSaloes, media, totalAvaliacoes, totalClientes);
    }

    public SalaoStatsDTO getStatsSalao(Long salaoId) {
        Salao salao = salaoService.buscarAutorizado(salaoId);

        Double media = avaliacaoRepository.mediaNotasBySalaoId(salaoId);
        long totalAvaliacoes = avaliacaoRepository.totalAvaliacoesBySalaoId(salaoId);
        long funcionariosAtivos = funcionarioRepository.countBySalaoIdAndStatus(salaoId, "ATIVO");
        long servicosAtivos = servicoRepository.countBySalaoIdAndStatus(salaoId, "ATIVO");

        return new SalaoStatsDTO(salaoId, salao.getNome(), media, totalAvaliacoes,
                funcionariosAtivos, servicosAtivos);
    }
}
