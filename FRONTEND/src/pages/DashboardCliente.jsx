import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Search, MapPin, Star, Clock, Scissors, ChevronRight } from 'lucide-react';
import {
  listarSaloes, listarServicos, listarFuncionarios,
  cadastrarAgendamento, getSalaoStats
} from '../service/api';
import './DashboardCliente.css';

const DashboardCliente = () => {
  const { user } = useAuth();
  const [busca, setBusca] = useState('');
  const [saloes, setSaloes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [salaoSelecionado, setSalaoSelecionado] = useState(null);
  const [salaoStats, setSalaoStats] = useState(null);
  const [agendamento, setAgendamento] = useState({ servicoId: '', funcionarioId: '', dataHora: '' });
  const [agendado, setAgendado] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAgendar, setLoadingAgendar] = useState(false);

  useEffect(() => {
    Promise.all([listarSaloes(), listarServicos(), listarFuncionarios()])
      .then(([{ data: s }, { data: sv }, { data: f }]) => {
        setSaloes(s.filter(s => s.status === 'ATIVO'));
        setServicos(sv);
        setFuncionarios(f);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const abrirSalao = async (salao) => {
    setSalaoSelecionado(salao);
    setAgendado(false);
    setErro('');
    setAgendamento({ servicoId: '', funcionarioId: '', dataHora: '' });
    setSalaoStats(null);
    try {
      const { data } = await getSalaoStats(salao.id);
      setSalaoStats(data);
    } catch {}
  };

  const servicosDeSalao = salaoSelecionado
    ? servicos.filter(s => s.salao?.id === salaoSelecionado.id && s.status === 'ATIVO')
    : [];

  const funcionariosDeSalao = salaoSelecionado
    ? funcionarios.filter(f => f.salao?.id === salaoSelecionado.id && f.status === 'ATIVO')
    : [];

  const getDataMinima = () => {
    const d = new Date();
    d.setHours(d.getHours() + 12);
    return d.toISOString().slice(0, 16);
  };

  const handleAgendar = async (e) => {
    e.preventDefault();
    setErro('');
    setLoadingAgendar(true);
    try {
      await cadastrarAgendamento({
        dataHora: agendamento.dataHora,
        usuario: { id: user.id },
        funcionario: { id: Number(agendamento.funcionarioId) },
        servico: { id: Number(agendamento.servicoId) },
      });
      setAgendado(true);
      setTimeout(() => {
        setAgendado(false);
        setSalaoSelecionado(null);
      }, 3000);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao realizar agendamento.');
    } finally {
      setLoadingAgendar(false);
    }
  };

  const saloesFiltrados = saloes.filter(s =>
    s.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (s.endereco || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="cliente-page">
      <Navbar />
      <div className="cliente-container">

        <div className="cliente-header">
          <div>
            <h1>Olá, {user.nome?.split(' ')[0]}!</h1>
            <p>Encontre o salão perfeito para você</p>
          </div>
        </div>

        <div className="busca-wrapper">
          <Search size={18} className="busca-icon" />
          <input
            type="text"
            className="busca-input"
            placeholder="Busque por nome ou endereço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14, padding: '24px 0' }}>Carregando salões...</p>
        ) : (
          <div className="saloes-grid">
            {saloesFiltrados.length === 0 ? (
              <p className="sem-resultados">
                {busca ? `Nenhum salão encontrado para "${busca}"` : 'Nenhum salão disponível no momento.'}
              </p>
            ) : (
              saloesFiltrados.map(salao => (
                <div key={salao.id} className="salao-card">
                  <div className="salao-card-header">
                    <div className="salao-avatar"><Scissors size={20} strokeWidth={1.5} /></div>
                    <div className="salao-info">
                      <h3>{salao.nome}</h3>
                      {salao.endereco && (
                        <span className="salao-local"><MapPin size={12} />{salao.endereco}</span>
                      )}
                    </div>
                  </div>

                  {salao.email && (
                    <p className="salao-descricao" style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                      {salao.email}
                    </p>
                  )}

                  <div className="salao-footer">
                    {salao.telefone && (
                      <span className="salao-horario"><Clock size={13} />{salao.telefone}</span>
                    )}
                    <button
                      className="btn-primary salao-btn"
                      onClick={() => abrirSalao(salao)}
                    >
                      Agendar <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {salaoSelecionado && (
        <div className="modal-overlay" onClick={() => setSalaoSelecionado(null)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Agendar em {salaoSelecionado.nome}</h3>

            {salaoStats && (
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  {salaoStats.mediaAvaliacoes != null
                    ? `${Number(salaoStats.mediaAvaliacoes).toFixed(1)} (${salaoStats.totalAvaliacoes} avaliações)`
                    : 'Ainda sem avaliações'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                  {salaoStats.totalFuncionariosAtivos} profissional(is) ativo(s)
                </span>
              </div>
            )}

            <p className="modal-subtitulo">Escolha o serviço, profissional e horário</p>

            {agendado ? (
              <div className="msg-sucesso" style={{ textAlign: 'center', padding: 24 }}>
                Agendamento confirmado! Até logo, {user.nome?.split(' ')[0]}!
              </div>
            ) : (
              <form onSubmit={handleAgendar}>
                <div className="form-group">
                  <label>Serviço</label>
                  <select
                    value={agendamento.servicoId}
                    onChange={e => setAgendamento({ ...agendamento, servicoId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {servicosDeSalao.length === 0
                      ? <option disabled>Nenhum serviço disponível</option>
                      : servicosDeSalao.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.nome} — R$ {Number(s.preco).toFixed(2)} ({s.duracao} min)
                          </option>
                        ))
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label>Profissional</label>
                  <select
                    value={agendamento.funcionarioId}
                    onChange={e => setAgendamento({ ...agendamento, funcionarioId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um profissional</option>
                    {funcionariosDeSalao.length === 0
                      ? <option disabled>Nenhum profissional disponível</option>
                      : funcionariosDeSalao.map(f => (
                          <option key={f.id} value={f.id}>{f.nome} — {f.funcao}</option>
                        ))
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label>Data e Hora</label>
                  <input
                    type="datetime-local"
                    value={agendamento.dataHora}
                    min={getDataMinima()}
                    onChange={e => setAgendamento({ ...agendamento, dataHora: e.target.value })}
                    required
                  />
                </div>
                {erro && <p className="msg-erro">{erro}</p>}
                <div className="modal-botoes">
                  <button type="button" className="btn-secondary" onClick={() => setSalaoSelecionado(null)}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={loadingAgendar}>
                    {loadingAgendar ? 'Agendando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCliente;
