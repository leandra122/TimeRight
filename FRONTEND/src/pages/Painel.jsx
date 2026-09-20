import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import CalendarioAgenda from '../components/CalendarioAgenda';
import { listarAgendamentosGlobais, listarMeusAgendamentos } from '../service/api';
import './DashboardAdmin.css';

const Painel = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salaoId, setSalaoId] = useState('');
  const [funcionarioId, setFuncionarioId] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const role = user?.nivelAcesso?.nome?.toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ADM';
  const carregar = useCallback(async () => { setCarregando(true); setErro(null); try { const { data } = await (isAdmin ? listarAgendamentosGlobais() : listarMeusAgendamentos()); setAgendamentos(data); } catch { setErro('Erro ao carregar agendamentos.'); } finally { setCarregando(false); } }, [isAdmin]);
  useEffect(() => { carregar(); }, [carregar]);
  const saloes = useMemo(() => [...new Map(agendamentos.map(item => [item.funcionario?.salao?.id, item.funcionario?.salao?.nome])).entries()].filter(([id]) => id), [agendamentos]);
  const funcionarios = useMemo(() => [...new Map(agendamentos.filter(item => !salaoId || String(item.funcionario?.salao?.id) === salaoId).map(item => [item.funcionario?.id, item.funcionario?.nome])).entries()].filter(([id]) => id), [agendamentos, salaoId]);
  const filtrados = useMemo(() => agendamentos.filter(item => (!salaoId || String(item.funcionario?.salao?.id) === salaoId) && (!funcionarioId || String(item.funcionario?.id) === funcionarioId)), [agendamentos, salaoId, funcionarioId]);
  const data = (valor) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(valor));
  const horario = (valor) => new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(valor));
  const fim = selecionado ? new Date(new Date(selecionado.dataHora).getTime() + (selecionado.duracao || 0) * 60000) : null;

  return <div className="admin-page"><Navbar /><div className="admin-container"><div className="admin-header"><h1><Calendar size={26} /> Agenda de atendimentos</h1><p>Acompanhe os atendimentos dos seus salões.</p></div>{erro && <div className="msg-erro">{erro}</div>}{!isAdmin && !carregando && <div className="cal-filtros"><select value={salaoId} onChange={event => { setSalaoId(event.target.value); setFuncionarioId(''); }}><option value="">Todos os salões</option>{saloes.map(([id, nome]) => <option value={id} key={id}>{nome}</option>)}</select><select value={funcionarioId} onChange={event => setFuncionarioId(event.target.value)}><option value="">Todos os profissionais</option>{funcionarios.map(([id, nome]) => <option value={id} key={id}>{nome}</option>)}</select></div>}{carregando ? <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p> : <CalendarioAgenda agendamentos={filtrados} onSelecionar={setSelecionado} />}</div>
  {selecionado && <div className="modal-overlay" onClick={() => setSelecionado(null)}><div className="modal-card card" onClick={event => event.stopPropagation()}><h3>Detalhes do atendimento</h3><div className="detalhes-atendimento"><p><strong>Cliente</strong><span>{selecionado.usuario?.nome}</span></p><p><strong>Serviço</strong><span>{selecionado.servico?.nome}</span></p><p><strong>Profissional</strong><span>{selecionado.funcionario?.nome}</span></p><p><strong>Salão</strong><span>{selecionado.funcionario?.salao?.nome}</span></p><p><strong>Data</strong><span>{data(selecionado.dataHora)}</span></p><p><strong>Horário</strong><span>{horario(selecionado.dataHora)} – {horario(fim)}</span></p><p><strong>Duração</strong><span>{selecionado.duracao} min</span></p><p><strong>Status</strong><span className={`status-badge ${selecionado.status?.toLowerCase()}`}>{selecionado.status}</span></p></div><div className="modal-botoes"><button className="btn-secondary" onClick={() => setSelecionado(null)}><X size={15} />Fechar</button></div></div></div>}</div>;
};

export default Painel;
