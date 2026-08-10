import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Store, Calendar, PenLine, Users, UserCog, PowerOff,
  TrendingUp, Clock, CheckCircle, Star, Scissors
} from 'lucide-react';
import { getDashboardStats, atualizarSalao } from '../service/api';
import './DashboardAdmin.css';

const atalhosAdmin = [
  { to: '/admin/cadastro-salao', icon: <Store size={24} />, titulo: 'Cadastrar Salão', desc: 'Adicione as informações do seu salão' },
  { to: '/admin/painel', icon: <Calendar size={24} />, titulo: 'Painel', desc: 'Veja e edite os agendamentos' },
  { to: '/admin/atualizar-salao', icon: <PenLine size={24} />, titulo: 'Atualizar Salão', desc: 'Edite os dados do seu salão' },
  { to: '/admin/usuario', icon: <Users size={24} />, titulo: 'Gerenciar Usuários', desc: 'Inclua, edite ou exclua perfis' },
  { to: '/admin/funcionarios', icon: <UserCog size={24} />, titulo: 'Gerenciar Equipe', desc: 'Cadastre e gerencie funcionários' },
];

const atalhosManager = [
  { to: '/manager/painel', icon: <Calendar size={24} />, titulo: 'Painel', desc: 'Veja e edite os agendamentos' },
  { to: '/manager/funcionarios', icon: <UserCog size={24} />, titulo: 'Gerenciar Equipe', desc: 'Cadastre e gerencie funcionários' },
];

const DashboardAdmin = () => {
  const { user, salao, desativarSalao } = useAuth();
  const atalhos = user?.tipo === 'manager' ? atalhosManager : atalhosAdmin;
  const [confirmDesativar, setConfirmDesativar] = useState(false);
  const [desativado, setDesativado] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  const handleDesativar = () => {
    desativarSalao();
    setConfirmDesativar(false);
    setDesativado(true);
    setTimeout(() => setDesativado(false), 3000);
  };

  const fmt = (val) => (loadingStats ? '...' : val ?? '0');

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

        {desativado && <div className="msg-sucesso">Salão desativado com sucesso.</div>}

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
                {loadingStats ? '...' : stats?.mediaAvaliacoes != null
                  ? Number(stats.mediaAvaliacoes).toFixed(1)
                  : 'Sem avaliações'}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-section-title">Acesso rápido</div>
        <div className="admin-atalhos">
          {atalhos.map((a, i) => (
            <Link key={i} to={a.to} className="atalho-card">
              <div className="atalho-icon">{a.icon}</div>
              <div>
                <strong>{a.titulo}</strong>
                <span>{a.desc}</span>
              </div>
            </Link>
          ))}

          <button
            className="atalho-card atalho-card--danger"
            onClick={() => setConfirmDesativar(true)}
            disabled={salao && !salao.ativo}
          >
            <div className="atalho-icon atalho-icon--danger"><PowerOff size={24} /></div>
            <div>
              <strong>Desativar Salão</strong>
              <span>{salao && !salao.ativo ? 'Salão já desativado' : 'Suspenda temporariamente'}</span>
            </div>
          </button>
        </div>
      </div>

      {confirmDesativar && (
        <div className="modal-overlay" onClick={() => setConfirmDesativar(false)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Desativar Salão</h3>
            <p className="modal-subtitulo">Tem certeza? Seu salão ficará invisível para os clientes.</p>
            <div className="modal-botoes">
              <button className="btn-secondary" onClick={() => setConfirmDesativar(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDesativar}>Desativar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
