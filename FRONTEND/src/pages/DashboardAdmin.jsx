import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { StatusSalao, enderecoResumido } from '../components/SalaoResumo';
import {
  Store, Calendar, PenLine, Users, UserCog,
  TrendingUp, Clock, CheckCircle, Star, Scissors
} from 'lucide-react';
import { getDashboardStats, getSalaoStats, listarMeusSaloes } from '../service/api';
import './DashboardAdmin.css';
import './SaloesGerente.css';

const atalhosAdmin = [
  { to: '/admin/painel', icon: <Calendar size={24} />, titulo: 'Painel', desc: 'Veja e edite os agendamentos' },
  { to: '/admin/atualizar-salao', icon: <PenLine size={24} />, titulo: 'Atualizar Salão', desc: 'Edite os dados do seu salão' },
  { to: '/admin/usuario', icon: <Users size={24} />, titulo: 'Gerenciar Usuários', desc: 'Inclua, edite ou exclua perfis' },
  { to: '/admin/funcionarios', icon: <UserCog size={24} />, titulo: 'Gerenciar Equipe', desc: 'Cadastre e gerencie funcionários' },
];

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const salaoSolicitado = params.get('salaoId');

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [saloes, setSaloes] = useState([]);
  const [carregandoSaloes, setCarregandoSaloes] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const [tentativaStats, setTentativaStats] = useState(0);
  const [erroSaloes, setErroSaloes] = useState('');
  const [statsPara, setStatsPara] = useState(null);
  const [erroStats, setErroStats] = useState('');
  const salaoSelecionado = saloes.find(item => String(item.id) === salaoSolicitado);
  const salaoSelecionadoId = salaoSelecionado ? String(salaoSelecionado.id) : '';
  const statsAtuais = user?.tipo !== 'manager' || statsPara === salaoSelecionadoId;
  const carregandoStatsAtuais = user?.tipo === 'manager'
    ? !!salaoSelecionadoId && (loadingStats || !statsAtuais)
    : loadingStats;

  useEffect(() => {
    if (user?.tipo === 'manager' && salaoSolicitado === null && saloes.length) {
      setParams(atuais => {
        const proximos = new URLSearchParams(atuais);
        proximos.set('salaoId', String(saloes[0].id));
        return proximos;
      }, { replace: true });
    }
  }, [user?.tipo, salaoSolicitado, saloes, setParams]);

  useEffect(() => {
    let ativo = true;
    if (user?.tipo !== 'manager') {
      getDashboardStats()
        .then(({ data }) => { if (ativo) setStats(data); })
        .catch(() => { if (ativo) { setStats(null); setErroStats('Não foi possível carregar os indicadores.'); } })
        .finally(() => { if (ativo) setLoadingStats(false); });
      return () => { ativo = false; };
    }

    setCarregandoSaloes(true);
    setErroSaloes('');
    listarMeusSaloes()
      .then(({ data }) => {
        if (!ativo) return;
        setSaloes(data);
        setCarregandoSaloes(false);
        setLoadingStats(false);
      })
      .catch((error) => {
        if (!ativo) return;
        setErroSaloes(error.response?.data?.error || error.response?.data?.message || 'Não foi possível carregar seus salões.');
        setSaloes([]);
        setCarregandoSaloes(false);
        setStats(null);
        setLoadingStats(false);
      });
    return () => { ativo = false; };
  }, [user?.tipo, tentativa]);

  useEffect(() => {
    if (user?.tipo !== 'manager' || !salaoSelecionadoId) return;
    let ativo = true;

    const carregarStatsSalao = async () => {
      setLoadingStats(true);
      setErroStats('');
      setStats(null);
      try {
        const { data } = await getSalaoStats(salaoSelecionadoId);
        if (!ativo) return;
        setStats(data);
      } catch {
        if (!ativo) return;
        setStats(null);
        setErroStats('Não foi possível carregar os indicadores deste salão.');
      } finally {
        if (ativo) { setStatsPara(salaoSelecionadoId); setLoadingStats(false); }
      }
    };

    carregarStatsSalao();
    return () => { ativo = false; };
  }, [salaoSelecionadoId, user?.tipo, tentativaStats]);

  const fmt = (val) => (carregandoStatsAtuais ? '...' : !statsAtuais || erroStats || (user?.tipo === 'manager' && !salaoSelecionadoId) ? '—' : val ?? '—');

  if (user?.tipo === 'manager') {
    const disponivel = statsAtuais && !carregandoStatsAtuais && !erroStats && stats;
    const numero = campo => disponivel && Number.isFinite(stats[campo]) ? stats[campo] : '—';
    const indicadores = [
      { titulo: 'Funcionários ativos', valor: numero('totalFuncionariosAtivos'), Icone: UserCog },
      { titulo: 'Serviços ativos', valor: numero('totalServicosAtivos'), Icone: Scissors },
    ];
    return <div className="admin-page"><Navbar /><main className="admin-container saloes-page gerente-inicio">
      <header className="saloes-cabecalho"><div><span className="saloes-sobretitulo">Visão geral</span>
        <h1>Olá, {user.nome?.split(' ')[0]}!</h1><p>Acompanhe os indicadores do seu salão. Para administrar o estabelecimento, abra o perfil.</p>
      </div><Link className="btn-secondary" to="/manager/saloes"><Store size={17} />Meus salões</Link></header>
      {carregandoSaloes ? <div className="saloes-estado" role="status">Carregando seus salões…</div>
        : erroSaloes ? <div className="saloes-estado" role="alert"><h2>Não foi possível carregar seus salões</h2><button className="btn-secondary" onClick={() => setTentativa(v => v + 1)}>Tentar novamente</button></div>
        : saloes.length === 0 ? <div className="saloes-estado"><Store size={32} /><h2>Seu primeiro salão começa aqui</h2><p>Cadastre um estabelecimento para acompanhar seus indicadores e organizar sua equipe.</p><Link className="btn-primary" to="/manager/cadastro-salao">Cadastrar salão</Link></div>
        : <>
          <div className="gerente-contexto">
            <div className="form-group"><label htmlFor="salao-dashboard">Salão selecionado</label>
              <select id="salao-dashboard" value={salaoSelecionadoId} onChange={event => setParams(atuais => { const proximos = new URLSearchParams(atuais); proximos.set('salaoId', event.target.value); return proximos; })}>
                {!salaoSelecionadoId && <option value="" disabled>Selecione um dos seus salões</option>}
                {saloes.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
            </div>
            {salaoSelecionado && <div className="gerente-contexto-resumo"><StatusSalao status={salaoSelecionado.status} /><p>{enderecoResumido(salaoSelecionado)}</p></div>}
          </div>
          {!salaoSelecionado ? <p className="msg-erro" role="alert">Salão indisponível entre os seus estabelecimentos.</p> : <>
            <section aria-labelledby="indicadores-salao" aria-busy={carregandoStatsAtuais}>
              <div className="gerente-secao-cabecalho"><div><h2 id="indicadores-salao">Resumo de {salaoSelecionado.nome}</h2><p>Equipe e serviços deste estabelecimento.</p></div></div>
              {carregandoStatsAtuais ? <p className="gerente-indicadores-estado" role="status">Carregando indicadores…</p>
                : erroStats ? <div className="msg-erro" role="alert">{erroStats} <button className="btn-secondary" onClick={() => setTentativaStats(v => v + 1)}>Tentar novamente</button></div>
                : <p className="gerente-indicadores-estado">{!stats || indicadores.some(item => item.valor === '—') ? 'Alguns indicadores estão indisponíveis. — indica um dado não informado.' : 'Dados do salão selecionado.'}</p>}
              <div className="admin-stats">{indicadores.map(({ titulo, valor, Icone }) => <div className="stat-card" key={titulo}><div className="stat-icon stat-icon--pink"><Icone size={20} /></div><div><p className="stat-label">{titulo}</p><p className="stat-value">{carregandoStatsAtuais ? '…' : valor}</p></div></div>)}</div>
            </section>
            <div className="gerente-proximos-passos">
              <Link className="atalho-card" to={'/manager/painel?salaoId=' + encodeURIComponent(salaoSelecionadoId)}><div className="atalho-icon"><Calendar size={24} /></div><div><strong>Abrir agenda</strong><span>Consulte os atendimentos de {salaoSelecionado.nome}.</span></div></Link>
              <Link className="atalho-card" to={'/manager/saloes/' + encodeURIComponent(salaoSelecionadoId)}><div className="atalho-icon"><Store size={24} /></div><div><strong>Gerenciar salão</strong><span>Informações, fotos, serviços, equipe e horários.</span></div></Link>
            </div>
          </>}
        </>}
    </main></div>;
  }

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">

        <div className="admin-welcome">
          <div className="admin-welcome-avatar">{user.nome?.charAt(0).toUpperCase()}</div>
          <div>
            <h1>Olá, {user.nome?.split(' ')[0]}!</h1>
            <p>Gerencie seu salão com facilidade</p>
          </div>
        </div>

        {erroStats && <p className="msg-erro" role="alert">{erroStats}</p>}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon--blue"><Calendar size={20} /></div>
            <div>
              <p className="stat-label">Agendamentos hoje</p>
              <p className="stat-value">{fmt(stats?.agendamentosHoje)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--green"><CheckCircle size={20} /></div>
            <div>
              <p className="stat-label">Confirmados</p>
              <p className="stat-value">{fmt(stats?.agendamentosConfirmados)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--pink"><TrendingUp size={20} /></div>
            <div>
              <p className="stat-label">Este mês</p>
              <p className="stat-value">{fmt(stats?.agendamentosMes)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--orange"><Clock size={20} /></div>
            <div>
              <p className="stat-label">Pendentes</p>
              <p className="stat-value">{fmt(stats?.agendamentosPendentes)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--purple"><Users size={20} /></div>
            <div>
              <p className="stat-label">Clientes</p>
              <p className="stat-value">{fmt(stats?.totalClientes)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--pink"><UserCog size={20} /></div>
            <div>
              <p className="stat-label">Funcionários ativos</p>
              <p className="stat-value">{fmt(stats?.totalFuncionariosAtivos)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--blue"><Scissors size={20} /></div>
            <div>
              <p className="stat-label">Serviços</p>
              <p className="stat-value">{fmt(stats?.totalServicos)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon--orange"><Star size={20} /></div>
            <div>
              <p className="stat-label">Avaliação média</p>
              <p className="stat-value">
                {carregandoStatsAtuais ? '...' : !statsAtuais || erroStats || (user?.tipo === 'manager' && !salaoSelecionadoId) ? '—' : stats?.mediaAvaliacoes != null
                  ? Number(stats.mediaAvaliacoes).toFixed(1)
                  : 'Sem avaliações'}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-section-title">Acesso rápido</div>
        <div className="admin-atalhos">
          {atalhosAdmin.map((a, i) => (
            <Link key={i} to={a.to} className="atalho-card">
              <div className="atalho-icon">{a.icon}</div>
              <div>
                <strong>{a.titulo}</strong>
                <span>{a.desc}</span>
              </div>
            </Link>
          ))}


        </div>
      </div>

    </div>
  );
};

export default DashboardAdmin;
