package com.timeright.tcc.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timeright.tcc.dto.AvaliacaoDTO;
import com.timeright.tcc.model.entity.Agendamento;
import com.timeright.tcc.model.entity.Avaliacao;
import com.timeright.tcc.model.entity.Salao;
import com.timeright.tcc.model.entity.Usuario;
import com.timeright.tcc.model.repository.AgendamentoRepository;
import com.timeright.tcc.model.repository.AvaliacaoRepository;
import com.timeright.tcc.model.repository.SalaoRepository;
import com.timeright.tcc.model.repository.UsuarioRepository;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SalaoRepository salaoRepository;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                             AgendamentoRepository agendamentoRepository,
                             UsuarioRepository usuarioRepository,
                             SalaoRepository salaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.salaoRepository = salaoRepository;
    }

    public List<Avaliacao> listarPorSalao(Long salaoId) {
        return avaliacaoRepository.findBySalaoId(salaoId);
    }

    public List<Avaliacao> listarPorUsuario(Long usuarioId) {
        return avaliacaoRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public Avaliacao avaliar(AvaliacaoDTO dto) {
        if (dto.nota < 1 || dto.nota > 5)
            throw new RuntimeException("A nota deve ser entre 1 e 5.");

        Agendamento agendamento = agendamentoRepository.findById(dto.agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado."));

        if (!"CONCLUIDO".equals(agendamento.getStatus()))
            throw new RuntimeException("Só é possível avaliar agendamentos concluídos.");

        if (avaliacaoRepository.existsByAgendamentoId(dto.agendamentoId))
            throw new RuntimeException("Este agendamento já foi avaliado.");

        Usuario usuario = usuarioRepository.findById(dto.usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        Salao salao = salaoRepository.findById(dto.salaoId)
                .orElseThrow(() -> new RuntimeException("Salão não encontrado."));

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(usuario);
        avaliacao.setSalao(salao);
        avaliacao.setAgendamento(agendamento);
        avaliacao.setNota(dto.nota);
        avaliacao.setComentario(dto.comentario);
        avaliacao.setDataAvaliacao(LocalDateTime.now());

        return avaliacaoRepository.save(avaliacao);
    }

    public Double mediaNotasSalao(Long salaoId) {
        return avaliacaoRepository.mediaNotasBySalaoId(salaoId);
    }

    public Long totalAvaliacoesSalao(Long salaoId) {
        return avaliacaoRepository.totalAvaliacoesBySalaoId(salaoId);
    }
}
