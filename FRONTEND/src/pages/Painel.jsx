import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { Plus, Pencil, Ban, Trash2, Check, X } from 'lucide-react';
import {
  listarAgendamentos, cadastrarAgendamento, atualizarAgendamento,
  cancelarAgendamento, excluirAgendamento, listarClientes,
  listarFuncionarios, listarServicos,
} from '../service/api';
import './DashboardAdmin.css';

const formVazio = { usuarioId: '', funcionarioId: '', servicoId: '', dataHora: '', observacoes: '' };

const getDataMinima = () => {
  const agora = new Date();
  agora.setHours(agora.getHours() + 12);
  return agora.toISOString().slice(0, 16);
};

const Painel = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [cadastrando, setCadastrando] = useState(false);
  const [novoForm, setNovoForm] = useState(formVazio);
  const [confirmarExcluir, setConfirmarExcluir] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const exibirMensagem = (msg, tipo = 'sucesso') => {
    if (tipo === 'sucesso') { setMensagem(msg); setErro(null); }
    else { setErro(msg); setMensagem(null); }
    setTimeout(() => { setMensagem(null); setErro(null); }, 3500);
  };

  const carregar = useCallback(async () => {
    try {
      const [{ data: ags }, { data: users }, { data: funcs }, { data: servs }] = await Promise.all([
        listarAgendamentos(), listarClientes(), listarFuncionarios(), listarServicos(),
      ]);
      setAgendamentos(ags); setUsuarios(users); setFuncionarios(funcs); setServicos(servs);
    } catch { exibirMensagem('Erro ao carregar agendamentos.', 'erro'); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const formatarData = (dataHora) => dataHora ? dataHora.replace('T', ' ').substring(0, 16) : '';

  const iniciarEdicao = (ag) => {
    setEditando(ag.id);
    setEditForm({
      dataHora: ag.dataHora ? ag.dataHora.substring(0, 16) : '',
      observacoes: ag.observacoes || '',
      funcionarioId: ag.funcionario?.id || '',
      servicoId: ag.servico?.id || '',
    });
  };

  const salvarEdicao = async (id) => {
    if (editForm.dataHora) {
      const dataSelecionada = new Date(editForm.dataHora);
      const minimo = new Date();
      minimo.setHours(minimo.getHours() + 12);
      if (dataSelecionada < minimo) { exibirMensagem('A remarcação deve ser feita com no mínimo 12 horas de antecedência.', 'erro'); return; }
    }
    try {
      await atualizarAgendamento(id, {
        dataHora: editForm.dataHora, observacoes: editForm.observacoes,
        funcionario: { id: Number(editForm.funcionarioId) }, servico: { id: Number(editForm.servicoId) },
      });
      setEditando(null);
      exibirMensagem('Agendamento atualizado com sucesso.');
      carregar();
    } catch (err) { exibirMensagem(err.response?.data?.message || 'Erro ao atualizar agendamento.', 'erro'); }
  };

  const handleCancelar = async (id) => {
    try { await cancelarAgendamento(id); exibirMensagem('Agendamento cancelado.'); carregar(); }
    catch (err) { exibirMensagem(err.response?.data?.message || 'Erro ao cancelar agendamento.', 'erro'); }
  };

  const confirmarEExcluir = async (id) => {
    try { await excluirAgendamento(id); setConfirmarExcluir(null); exibirMensagem('Agendamento excluído com sucesso.'); carregar(); }
    catch { setConfirmarExcluir(null); exibirMensagem('Erro ao excluir agendamento.', 'erro'); }
  };

  const salvarNovo = async (e) => {
    e.preventDefault();
    const dataSelecionada = new Date(novoForm.dataHora);
    const minimo = new Date();
    minimo.setHours(minimo.getHours() + 12);
    if (dataSelecionada < minimo) { exibirMensagem('O agendamento deve ser feito com no mínimo 12 horas de antecedência.', 'erro'); return; }
    try {
      await cadastrarAgendamento({
        dataHora: novoForm.dataHora, observacoes: novoForm.observacoes,
        usuario: { id: Number(novoForm.usuarioId) }, funcionario: { id: Number(novoForm.funcionarioId) },
        servico: { id: Number(novoForm.servicoId) },
      });
      setCadastrando(false); setNovoForm(formVazio);
      exibirMensagem('Agendamento criado com sucesso.'); carregar();
    } catch (err) { exibirMensagem(err.response?.data?.message || 'Erro ao criar agendamento.', 'erro'); }
  };

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Painel de Agendamentos</h1>
          <p>Acompanhe e gerencie os agendamentos dos seus clientes</p>
        </div>

        {mensagem && <div className="msg-sucesso">{mensagem}</div>}
        {erro && <div className="msg-erro">{erro}</div>}

        <div style={{ marginBottom: 20 }}>
          <button className="btn-primary" onClick={() => setCadastrando(true)}>
            <Plus size={16} />Novo Agendamento
          </button>
        </div>

        {carregando ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p>
        ) : (
          <div className="card admin-card">
            <div className="agenda-tabela">
              <div className="tabela-header tabela-header-acoes">
                <span>Cliente</span><span>Serviço</span><span>Funcionário</span>
                <span>Data/Hora</span><span>Status</span><span>Ações</span>
              </div>

              {agendamentos.length === 0 && (
                <p style={{ padding: '24px 20px', color: 'var(--text-soft)', fontSize: 13 }}>Nenhum agendamento encontrado.</p>
              )}

              {agendamentos.map(ag => (
                <div key={ag.id} className="tabela-linha tabela-linha-acoes">
                  {editando === ag.id ? (
                    <>
                      <span style={{ fontSize: 13 }}>{ag.usuario?.nome}</span>
                      <select className="select-status" value={editForm.servicoId} onChange={e => setEditForm(f => ({ ...f, servicoId: e.target.value }))}>
                        {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                      </select>
                      <select className="select-status" value={editForm.funcionarioId} onChange={e => setEditForm(f => ({ ...f, funcionarioId: e.target.value }))}>
                        {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                      </select>
                      <input type="datetime-local" className="input-hora" value={editForm.dataHora} min={getDataMinima()} onChange={e => setEditForm(f => ({ ...f, dataHora: e.target.value }))} />
                      <span />
                      <div className="acoes-btns">
                        <button className="btn-acao salvar" onClick={() => salvarEdicao(ag.id)} title="Salvar"><Check size={13} /></button>
                        <button className="btn-acao cancelar-acao" onClick={() => setEditando(null)} title="Cancelar"><X size={13} /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 13 }}>{ag.usuario?.nome}</span>
                      <span style={{ fontSize: 13 }}>{ag.servico?.nome}</span>
                      <span style={{ fontSize: 13 }}>{ag.funcionario?.nome}</span>
                      <span style={{ fontSize: 12 }}>{formatarData(ag.dataHora)}</span>
                      <span className={`status-badge ${ag.status?.toLowerCase()}`}>{ag.status}</span>
                      <div className="acoes-btns">
                        <button className="btn-acao" onClick={() => iniciarEdicao(ag)} title="Editar"><Pencil size={13} /></button>
                        {ag.status !== 'CANCELADO' && (
                          <button className="btn-acao" onClick={() => handleCancelar(ag.id)} title="Cancelar"><Ban size={13} /></button>
                        )}
                        <button className="btn-acao cancelar-acao" onClick={() => setConfirmarExcluir(ag)} title="Excluir"><Trash2 size={13} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {cadastrando && (
        <div className="modal-overlay" onClick={() => setCadastrando(false)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Novo Agendamento</h3>
            <p className="modal-subtitulo">Preencha os dados do agendamento</p>
            <form onSubmit={salvarNovo}>
              <div className="form-group">
                <label>Cliente</label>
                <select value={novoForm.usuarioId} onChange={e => setNovoForm(f => ({ ...f, usuarioId: e.target.value }))} required>
                  <option value="">Selecione um cliente</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Funcionário</label>
                <select value={novoForm.funcionarioId} onChange={e => setNovoForm(f => ({ ...f, funcionarioId: e.target.value }))} required>
                  <option value="">Selecione um funcionário</option>
                  {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Serviço</label>
                <select value={novoForm.servicoId} onChange={e => setNovoForm(f => ({ ...f, servicoId: e.target.value }))} required>
                  <option value="">Selecione um serviço</option>
                  {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.duracao} min)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Data e Hora</label>
                <input type="datetime-local" value={novoForm.dataHora} min={getDataMinima()} onChange={e => setNovoForm(f => ({ ...f, dataHora: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Observações</label>
                <input type="text" value={novoForm.observacoes} onChange={e => setNovoForm(f => ({ ...f, observacoes: e.target.value }))} />
              </div>
              <div className="modal-botoes">
                <button type="button" className="btn-secondary" onClick={() => setCadastrando(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmarExcluir && (
        <div className="modal-overlay" onClick={() => setConfirmarExcluir(null)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Excluir Agendamento</h3>
            <p className="modal-subtitulo">
              Deseja excluir o agendamento de <strong>{confirmarExcluir.usuario?.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="modal-botoes">
              <button className="btn-secondary" onClick={() => setConfirmarExcluir(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => confirmarEExcluir(confirmarExcluir.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Painel;
