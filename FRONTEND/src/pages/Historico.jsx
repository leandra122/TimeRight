import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { MapPin, Scissors, Calendar, Clock, X, Star } from 'lucide-react';
import { listarAgendamentosPorUsuario, cancelarAgendamento, criarAvaliacao } from '../service/api';
import './Historico.css';

const statusConfig = {
  AGENDADO: { label: 'Agendado', cls: 'status-badge agendado' },
  CONFIRMADO: { label: 'Confirmado', cls: 'status-badge confirmado' },
  CONCLUIDO: { label: 'Concluído', cls: 'status-badge confirmado' },
  CANCELADO: { label: 'Cancelado', cls: 'status-badge cancelado' },
};

const Historico = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [avaliacaoModal, setAvaliacaoModal] = useState(null);
  const [avaliacaoForm, setAvaliacaoForm] = useState({ nota: 5, comentario: '' });
  const [loadingAvaliar, setLoadingAvaliar] = useState(false);

  const exibir = (msg, tipo = 'ok') => {
    if (tipo === 'ok') { setMensagem(msg); setErro(''); }
    else { setErro(msg); setMensagem(''); }
    setTimeout(() => { setMensagem(''); setErro(''); }, 3500);
  };

  const carregar = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await listarAgendamentosPorUsuario(user.id);
      setAgendamentos(data);
    } catch {
      exibir('Erro ao carregar agendamentos.', 'erro');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleCancelar = async (id) => {
    try {
      await cancelarAgendamento(id);
      exibir('Agendamento cancelado com sucesso.');
      carregar();
    } catch (err) {
      exibir(err.response?.data?.message || 'Erro ao cancelar agendamento.', 'erro');
    }
  };

  const handleAvaliar = async (e) => {
    e.preventDefault();
    setLoadingAvaliar(true);
    try {
      await criarAvaliacao({
        usuarioId: user.id,
        salaoId: avaliacaoModal.funcionario?.salao?.id,
        agendamentoId: avaliacaoModal.id,
        nota: avaliacaoForm.nota,
        comentario: avaliacaoForm.comentario,
      });
      setAvaliacaoModal(null);
      exibir('Avaliação enviada com sucesso!');
      carregar();
    } catch (err) {
      exibir(err.response?.data?.error || 'Erro ao enviar avaliação.', 'erro');
    } finally {
      setLoadingAvaliar(false);
    }
  };

  const formatarData = (dataHora) => {
    if (!dataHora) return '';
    const d = new Date(dataHora);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="historico-page">
      <Navbar />
      <div className="historico-container">
        <div className="historico-header">
          <h1>Meus Agendamentos</h1>
          <p>Histórico e próximos horários marcados</p>
        </div>

        {mensagem && <div className="msg-sucesso">{mensagem}</div>}
        {erro && <div className="msg-erro">{erro}</div>}

        {loading ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p>
        ) : agendamentos.length === 0 ? (
          <div className="historico-vazio">
            <Scissors size={40} strokeWidth={1} color="var(--brand)" />
            <p>Nenhum agendamento encontrado.</p>
            <span>Que tal agendar seu primeiro horário?</span>
          </div>
        ) : (
          <div className="historico-lista">
            {agendamentos.map(ag => {
              const cfg = statusConfig[ag.status] || { label: ag.status, cls: 'status-badge' };
              const podeCancelar = (ag.status === 'AGENDADO' || ag.status === 'CONFIRMADO');
              const podeAvaliar = ag.status === 'CONCLUIDO';

              return (
                <div key={ag.id} className="historico-card">
                  <div className="historico-card-left">
                    <div className="historico-avatar"><Scissors size={18} strokeWidth={1.5} /></div>
                    <div className="historico-info">
                      <h3>{ag.funcionario?.salao?.nome || 'Salão'}</h3>
                      {ag.funcionario?.salao?.endereco && (
                        <span className="historico-local">
                          <MapPin size={12} />{ag.funcionario.salao.endereco}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="historico-detalhes">
                    <span><Scissors size={13} />{ag.servico?.nome}</span>
                    <span><Calendar size={13} />{formatarData(ag.dataHora)}</span>
                    {ag.funcionario?.nome && (
                      <span><Clock size={13} />{ag.funcionario.nome}</span>
                    )}
                  </div>

                  <div className="historico-actions">
                    <span className={cfg.cls}>{cfg.label}</span>
                    {podeCancelar && (
                      <button
                        className="btn-secondary btn-cancelar"
                        onClick={() => handleCancelar(ag.id)}
                      >
                        <X size={13} />Cancelar
                      </button>
                    )}
                    {podeAvaliar && (
                      <button
                        className="btn-secondary"
                        style={{ gap: 5, fontSize: 12 }}
                        onClick={() => { setAvaliacaoModal(ag); setAvaliacaoForm({ nota: 5, comentario: '' }); }}
                      >
                        <Star size={13} />Avaliar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {avaliacaoModal && (
        <div className="modal-overlay" onClick={() => setAvaliacaoModal(null)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Avaliar atendimento</h3>
            <p className="modal-subtitulo">{avaliacaoModal.funcionario?.salao?.nome}</p>
            <form onSubmit={handleAvaliar}>
              <div className="form-group">
                <label>Nota (1 a 5)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAvaliacaoForm(f => ({ ...f, nota: n }))}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        border: '1.5px solid',
                        borderColor: avaliacaoForm.nota >= n ? '#f59e0b' : 'var(--border)',
                        background: avaliacaoForm.nota >= n ? '#fef3c7' : 'var(--white)',
                        cursor: 'pointer', fontSize: 18,
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comentário (opcional)</label>
                <textarea
                  rows={3}
                  value={avaliacaoForm.comentario}
                  onChange={e => setAvaliacaoForm(f => ({ ...f, comentario: e.target.value }))}
                  placeholder="Conte como foi sua experiência..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'Poppins, sans-serif', fontSize: 13, resize: 'vertical' }}
                />
              </div>
              <div className="modal-botoes">
                <button type="button" className="btn-secondary" onClick={() => setAvaliacaoModal(null)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loadingAvaliar}>
                  {loadingAvaliar ? 'Enviando...' : 'Enviar avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historico;
