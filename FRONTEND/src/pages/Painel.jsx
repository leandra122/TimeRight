import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { listarAgendamentosGlobais, listarMeusAgendamentos } from '../service/api';
import './DashboardAdmin.css';

const Painel = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const role = user?.nivelAcesso?.nome?.toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ADM';

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const { data } = await (isAdmin
        ? listarAgendamentosGlobais()
        : listarMeusAgendamentos());
      setAgendamentos(data);
    } catch {
      setErro('Erro ao carregar agendamentos.');
    } finally {
      setCarregando(false);
    }
  }, [isAdmin]);

  useEffect(() => { carregar(); }, [carregar]);

  const formatarData = (dataHora) => dataHora
    ? dataHora.replace('T', ' ').substring(0, 16)
    : '';

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Painel de Agendamentos</h1>
          <p>Acompanhe a agenda em modo somente leitura</p>
        </div>

        {erro && <div className="msg-erro">{erro}</div>}

        {carregando ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p>
        ) : (
          <div className="card admin-card">
            <div className="agenda-tabela">
              <div className="tabela-header">
                <span>Cliente</span><span>Serviço</span><span>Funcionário</span>
                <span>Data/Hora</span><span>Status</span>
              </div>

              {agendamentos.length === 0 && (
                <p style={{ padding: '24px 20px', color: 'var(--text-soft)', fontSize: 13 }}>
                  Nenhum agendamento encontrado.
                </p>
              )}

              {agendamentos.map((agendamento) => (
                <div key={agendamento.id} className="tabela-linha">
                  <span style={{ fontSize: 13 }}>{agendamento.usuario?.nome}</span>
                  <span style={{ fontSize: 13 }}>{agendamento.servico?.nome}</span>
                  <span style={{ fontSize: 13 }}>{agendamento.funcionario?.nome}</span>
                  <span style={{ fontSize: 12 }}>{formatarData(agendamento.dataHora)}</span>
                  <span className={`status-badge ${agendamento.status?.toLowerCase()}`}>
                    {agendamento.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Painel;
