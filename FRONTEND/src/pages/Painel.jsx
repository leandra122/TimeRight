import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import CalendarioAgenda from '../components/CalendarioAgenda';
import { listarAgendamentosGlobais, listarMeusAgendamentos, listarMeusSaloes, listarMeusFuncionarios } from '../service/api';
import './DashboardAdmin.css';

const Painel = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [saloesCadastrados, setSaloesCadastrados] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salaoId, setSalaoId] = useState('');
  const [funcionarioId, setFuncionarioId] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const role = user?.nivelAcesso?.nome?.toUpperCase();
  const isAdmin = user?.tipo === 'admin' || role === 'ADMIN' || role === 'ADM';
  const carregar = useCallback(async () => {
    setCarregando(true); setErro(null);
    try {
      if (isAdmin) {
        const { data } = await listarAgendamentosGlobais();
        setAgendamentos(data);
      } else {
        const [agenda, saloes, profissionais] = await Promise.all([
          listarMeusAgendamentos(), listarMeusSaloes(), listarMeusFuncionarios(),
        ]);
        setAgendamentos(agenda.data);
        setSaloesCadastrados(saloes.data);
        setEquipe(profissionais.data);
      }
    } catch { setErro('Erro ao carregar agenda e profissionais. Tente novamente.'); }
    finally { setCarregando(false); }
  }, [isAdmin]);
  useEffect(() => { carregar(); }, [carregar]);
  const saloes = useMemo(() => saloesCadastrados.map(item => [item.id, item.nome]), [saloesCadastrados]);
  const funcionarios = useMemo(() => equipe.filter(item => !salaoId || String(item.salao?.id) === salaoId)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')), [equipe, salaoId]);
  const profissionaisVisiveis = useMemo(() => funcionarios.filter(item => !funcionarioId || String(item.id) === funcionarioId), [funcionarios, funcionarioId]);
  const filtrados = useMemo(() => agendamentos.filter(item => (!salaoId || String(item.funcionario?.salao?.id) === salaoId) && (!funcionarioId || String(item.funcionario?.id) === funcionarioId)), [agendamentos, salaoId, funcionarioId]);
  const data = (valor) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(valor));
  const horario = (valor) => new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(valor));
  const fim = selecionado ? new Date(new Date(selecionado.dataHora).getTime() + (selecionado.duracao || 0) * 60000) : null;

  return <div className="admin-page"><Navbar /><div className="admin-container"><div className="admin-header"><h1><Calendar size={26} /> Agenda de atendimentos</h1><p>Acompanhe os atendimentos dos seus salões.</p></div>{erro && <div className="msg-erro" role="alert">{erro} <button className="btn-secondary" onClick={carregar}>Tentar novamente</button></div>}{!isAdmin && !carregando && <div className="cal-filtros"><select aria-label="Filtrar por salão" value={salaoId} onChange={event => { setSalaoId(event.target.value); setFuncionarioId(''); }}><option value="">Todos os salões</option>{saloes.map(([id, nome]) => <option value={id} key={id}>{nome}</option>)}</select><select aria-label="Filtrar por profissional" value={funcionarioId} onChange={event => setFuncionarioId(event.target.value)}><option value="">Todos os profissionais</option>{funcionarios.map(({id, nome}) => <option value={id} key={id}>{nome}</option>)}</select></div>}{carregando ? <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p> : !erro && <CalendarioAgenda agendamentos={filtrados} profissionais={isAdmin ? undefined : profissionaisVisiveis} onSelecionar={setSelecionado} />}</div>
  {selecionado && <div className="modal-overlay" onClick={() => setSelecionado(null)}><div className="modal-card card" onClick={event => event.stopPropagation()}><h3>Detalhes do atendimento</h3><div className="detalhes-atendimento"><p><strong>Cliente</strong><span>{selecionado.usuario?.nome}</span></p><p><strong>Serviço</strong><span>{selecionado.servico?.nome}</span></p><p><strong>Profissional</strong><span>{selecionado.funcionario?.nome}</span></p><p><strong>Salão</strong><span>{selecionado.funcionario?.salao?.nome}</span></p><p><strong>Data</strong><span>{data(selecionado.dataHora)}</span></p><p><strong>Horário</strong><span>{horario(selecionado.dataHora)} – {horario(fim)}</span></p><p><strong>Duração</strong><span>{selecionado.duracao} min</span></p><p><strong>Status</strong><span className={`status-badge ${selecionado.status?.toLowerCase()}`}>{selecionado.status}</span></p></div><div className="modal-botoes"><button className="btn-secondary" onClick={() => setSelecionado(null)}><X size={15} />Fechar</button></div></div></div>}</div>;
};

export default Painel;
