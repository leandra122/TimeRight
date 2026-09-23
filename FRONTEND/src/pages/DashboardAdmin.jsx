import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ServicosSalao from '../components/ServicosSalao';
import LocalizacaoSalao from '../components/LocalizacaoSalao';
import {
  Store, Calendar, PenLine, Users, UserCog, PowerOff,
  TrendingUp, Clock, CheckCircle, Star, Scissors
} from 'lucide-react';
import { getDashboardStats, getSalaoStats, listarMeusSaloes } from '../service/api';
import './DashboardAdmin.css';

const atalhosAdmin = [
  { to: '/admin/painel', icon: <Calendar size={24} />, titulo: 'Painel', desc: 'Veja e edite os agendamentos' },
  { to: '/admin/atualizar-salao', icon: <PenLine size={24} />, titulo: 'Atualizar Salão', desc: 'Edite os dados do seu salão' },
  { to: '/admin/usuario', icon: <Users size={24} />, titulo: 'Gerenciar Usuários', desc: 'Inclua, edite ou exclua perfis' },
  { to: '/admin/funcionarios', icon: <UserCog size={24} />, titulo: 'Gerenciar Equipe', desc: 'Cadastre e gerencie funcionários' },
];

const atalhosManager = [
  { to: '/manager/fotos', icon: <Store size={24} />, titulo: 'Fotos do salão', desc: 'Envie fotos e escolha a principal' },
  { to: '/manager/atualizar-salao', icon: <PenLine size={24} />, titulo: 'Atualizar Salão', desc: 'Consulte e edite o endereço dos seus salões' },
  { to: '/manager/horarios', icon: <Clock size={24} />, titulo: 'Horários de funcionamento', desc: 'Configure a semana de cada salão' },
  { to: '/manager/cadastro-salao', icon: <Store size={24} />, titulo: 'Cadastrar Salão', desc: 'Adicione um novo estabelecimento' },
  { to: '/manager/painel', icon: <Calendar size={24} />, titulo: 'Painel', desc: 'Veja e edite os agendamentos' },
  { to: '/manager/funcionarios', icon: <UserCog size={24} />, titulo: 'Gerenciar Equipe', desc: 'Cadastre e gerencie funcionários' },
];

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const salaoSolicitado = params.get('salaoId');
  const atalhos = user?.tipo === 'manager' ? atalhosManager : atalhosAdmin;
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [saloes, setSaloes] = useState([]);
  const [salvandoServico, setSalvandoServico] = useState(false);
  const [revisaoServicos, setRevisaoServicos] = useState(0);
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
    setSalvandoServico(false);
  }, [salaoSolicitado]);

  useEffect(() => {
    let ativo = true;
    if (user?.tipo !== 'manager') {
      getDashboardStats()
        .then(({ data }) => { if (ativo) setStats(data); })
        .catch(() => { if (ativo) { setStats(null); setErroStats('Não foi possível carregar os indicadores.'); } })
        .finally(() => { if (ativo) setLoadingStats(false); });
      return () => { ativo = false; };
    }

    listarMeusSaloes()
      .then(({ data }) => {
        if (!ativo) return;
        setSaloes(data);
        setLoadingStats(false);
      })
      .catch((error) => {
        if (!ativo) return;
        setErroSaloes(error.response?.data?.error || error.response?.data?.message || 'Não foi possível carregar seus salões.');
        setSaloes([]);
        setStats(null);
        setLoadingStats(false);
      });
    return () => { ativo = false; };
  }, [user?.tipo]);

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
  }, [salaoSelecionadoId, user?.tipo, revisaoServicos]);

  const fmt = (val) => (carregandoStatsAtuais ? '...' : !statsAtuais || erroStats || (user?.tipo === 'manager' && !salaoSelecionadoId) ? '—' : val ?? '0');

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

        {user?.tipo === 'manager' && saloes.length > 0 && (
          <div className="form-group">
            <label htmlFor="salao-dashboard">Salão exibido no painel</label>
            <select
              disabled={salvandoServico}
              id="salao-dashboard"
              value={salaoSelecionadoId}
              onChange={(event) => setParams(atuais => { const proximos = new URLSearchParams(atuais); proximos.set('salaoId', event.target.value); return proximos; })}
            >
              {!salaoSelecionadoId && <option value="" disabled>Selecione um dos seus salões</option>}
              {saloes.map((item) => (
                <option key={item.id} value={item.id}>{item.nome}</option>
              ))}
            </select>
          </div>
        )}

        {erroSaloes && <div className="msg-erro" role="alert">{erroSaloes}</div>}
        {salaoSolicitado !== null && saloes.length > 0 && !salaoSelecionadoId && <div className="msg-erro" role="alert">Salão indisponível entre os seus estabelecimentos.</div>}
        {statsAtuais && erroStats && <div className="msg-erro" role="alert">{erroStats}</div>}
        {user?.tipo === 'manager' && !erroSaloes && !loadingStats && saloes.length === 0 && (
          <div className="aviso-unico-cadastro">
            Nenhum salão cadastrado. Use o atalho abaixo para criar seu primeiro estabelecimento.
          </div>
        )}

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

        {user?.tipo === 'manager' && salaoSelecionadoId && saloes.some((item) => String(item.id) === salaoSelecionadoId) && (
          <ServicosSalao
            key={salaoSelecionadoId}
            salaoId={salaoSelecionadoId}
            salaoNome={saloes.find((item) => String(item.id) === salaoSelecionadoId)?.nome}
            onSalvandoChange={setSalvandoServico}
            onSalvo={() => setRevisaoServicos((valor) => valor + 1)}
          />
        )}
        {user?.tipo === 'manager' && saloes.filter(item => String(item.id) === salaoSelecionadoId).map(item => (
          <LocalizacaoSalao key={item.id} salao={item} onSalvo={updated => setSaloes(current => current.map(s => s.id === updated.id ? updated : s))} />
        ))}
        <div className="admin-section-title">Acesso rápido</div>
        <div className="admin-atalhos">
          {atalhos.filter(a => user?.tipo !== 'manager' || salaoSelecionadoId || a.to === '/manager/cadastro-salao').map((a, i) => (
            <Link key={i} to={user?.tipo === 'manager' && a.to !== '/manager/cadastro-salao' ? `${a.to}?salaoId=${encodeURIComponent(salaoSelecionadoId)}` : a.to} className="atalho-card">
              <div className="atalho-icon">{a.icon}</div>
              <div>
                <strong>{a.titulo}</strong>
                <span>{a.desc}</span>
              </div>
            </Link>
          ))}

          {user?.tipo === 'manager' && <button
            className="atalho-card atalho-card--danger"
            disabled
          >
            <div className="atalho-icon atalho-icon--danger"><PowerOff size={24} /></div>
            <div>
              <strong>Desativar Salão</strong>
              <span>Indisponível: o fluxo de reativação ainda não está disponível.</span>
            </div>
          </button>}
        </div>
      </div>

    </div>
  );
};

export default DashboardAdmin;
