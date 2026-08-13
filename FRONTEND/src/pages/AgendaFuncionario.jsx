import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, History } from 'lucide-react';
import Navbar from '../components/Navbar';
import { listarMinhaAgendaFuncionario } from '../service/api';
import './DashboardAdmin.css';

const AgendaFuncionario = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarMinhaAgendaFuncionario()
      .then(({ data }) => { if (ativo) setAgendamentos(data); })
      .catch((error) => {
        if (ativo) setErro(error.response?.data?.error || 'Não foi possível carregar sua agenda.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const agora = new Date();
  const { proximos, historico } = useMemo(() => ({
    proximos: agendamentos.filter((item) => new Date(item.dataHora) >= agora),
    historico: agendamentos.filter((item) => new Date(item.dataHora) < agora).reverse(),
  }), [agendamentos]);

  const formatarData = (valor) => new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short',
  }).format(new Date(valor));

  const lista = (itens, vazio) => (
    itens.length === 0 ? <p style={{ padding: 20, color: 'var(--text-soft)' }}>{vazio}</p> : (
      <div className="agenda-tabela">
        <div className="tabela-header">
          <span>Data e hora</span><span>Cliente</span><span>Serviço</span>
          <span>Salão</span><span>Status</span>
        </div>
        {itens.map((item) => (
          <div className="tabela-linha" key={item.id}>
            <span>{formatarData(item.dataHora)} · {item.duracao} min</span>
            <span>{item.clienteNome}</span>
            <span>{item.servicoNome}</span>
            <span>{item.salaoNome}</span>
            <span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span>
            {item.observacoes && <small style={{ gridColumn: '1 / -1' }}>{item.observacoes}</small>}
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-container">
        <div className="admin-header">
          <h1><Calendar size={26} /> Minha agenda</h1>
          <p>Consulte seus atendimentos em modo somente leitura.</p>
        </div>
        {carregando && <p>Carregando sua agenda...</p>}
        {erro && <div className="msg-erro">{erro}</div>}
        {!carregando && !erro && (
          <>
            <section className="card admin-card">
              <h2><Clock size={20} /> Próximos agendamentos</h2>
              {lista(proximos, 'Nenhum próximo agendamento.')}
            </section>
            <section className="card admin-card" style={{ marginTop: 24 }}>
              <h2><History size={20} /> Histórico</h2>
              {lista(historico, 'Nenhum atendimento no histórico.')}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AgendaFuncionario;
