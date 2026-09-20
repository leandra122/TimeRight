import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import CalendarioAgenda from '../components/CalendarioAgenda';
import { listarMinhaAgendaFuncionario, concluirAtendimentoFuncionario } from '../service/api';
import './DashboardAdmin.css';

const AgendaFuncionario = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [confirmarConclusao, setConfirmarConclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarMinhaAgendaFuncionario().then(({ data }) => { if (ativo) setAgendamentos(data); })
      .catch((error) => { if (ativo) setErro(error.response?.data?.error || 'Não foi possível carregar sua agenda.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const formatarData = (valor) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
  const formatarHorario = (valor) => new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(valor));
  const podeConcluir = (item) => {
    const inicio = new Date(item?.dataHora);
    return Boolean(item?.id)
      && String(item?.status || '').trim().toUpperCase() === 'AGENDADO'
      && !Number.isNaN(inicio.getTime())
      && inicio.getTime() <= Date.now();
  };
  const fim = selecionado ? new Date(new Date(selecionado.dataHora).getTime() + (selecionado.duracao || 0) * 60000) : null;
  const concluir = async () => {
    if (!selecionado) return;
    setSalvando(true);
    try { const { data } = await concluirAtendimentoFuncionario(selecionado.id); setAgendamentos(atual => atual.map(item => item.id === data.id ? data : item)); setSelecionado(data); setConfirmarConclusao(false); }
    catch (error) { setErro(error.response?.data?.error || 'Não foi possível concluir o atendimento.'); setConfirmarConclusao(false); }
    finally { setSalvando(false); }
  };

  return <div className="admin-page"><Navbar /><main className="admin-container">
    <div className="admin-header"><h1><Calendar size={26} /> Minha agenda</h1><p>Consulte seus atendimentos e registre os serviços realizados.</p></div>
    {carregando && <p>Carregando sua agenda...</p>}{erro && <div className="msg-erro">{erro}</div>}
    {!carregando && !erro && <CalendarioAgenda agendamentos={agendamentos} onSelecionar={setSelecionado} />}
  </main>
  {selecionado && <div className="modal-overlay" onClick={() => setSelecionado(null)}><div className="modal-card card" onClick={event => event.stopPropagation()}>
    <h3>Detalhes do atendimento</h3><p className="modal-subtitulo">Confira as informações antes de atualizar a situação.</p>
    <div className="detalhes-atendimento"><p><strong>Cliente</strong><span>{selecionado.clienteNome}</span></p><p><strong>Serviço</strong><span>{selecionado.servicoNome}</span></p><p><strong>Profissional</strong><span>Você</span></p><p><strong>Salão</strong><span>{selecionado.salaoNome}</span></p><p><strong>Data</strong><span>{formatarData(selecionado.dataHora)}</span></p><p><strong>Horário</strong><span>{formatarHorario(selecionado.dataHora)} – {formatarHorario(fim)}</span></p><p><strong>Duração</strong><span>{selecionado.duracao} min</span></p><p><strong>Status</strong><span className={`status-badge ${selecionado.status?.toLowerCase()}`}>{selecionado.status}</span></p></div>
    {podeConcluir(selecionado) && !confirmarConclusao && <button className="btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={() => setConfirmarConclusao(true)}><CheckCircle2 size={16} />Marcar como concluído</button>}
    {confirmarConclusao && <div className="confirmar-conclusao"><p>Confirmar que este atendimento foi realizado?</p><div className="modal-botoes"><button className="btn-secondary" onClick={() => setConfirmarConclusao(false)} disabled={salvando}>Voltar</button><button className="btn-primary" onClick={concluir} disabled={salvando}>{salvando ? 'Salvando...' : 'Confirmar conclusão'}</button></div></div>}
    {!confirmarConclusao && <div className="modal-botoes"><button className="btn-secondary" onClick={() => setSelecionado(null)}><X size={15} />Fechar</button></div>}
  </div></div>}
  </div>;
};

export default AgendaFuncionario;
