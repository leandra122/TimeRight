import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  listarFuncionarios, cadastrarFuncionario, atualizarFuncionario,
  atualizarStatusFuncionario, excluirFuncionario, listarSaloes,
} from '../service/api';
import './DashboardAdmin.css';

const formVazio = { nome: '', email: '', senha: '', funcao: '', observacoes: '', salaoId: '' };

const GerenciarFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [saloes, setSaloes] = useState([]);
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
      const [{ data: funcs }, { data: sal }] = await Promise.all([listarFuncionarios(), listarSaloes()]);
      setFuncionarios(funcs); setSaloes(sal);
    } catch { exibirMensagem('Erro ao carregar dados.', 'erro'); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const iniciarEdicao = (f) => {
    setEditando(f.id);
    setEditForm({ nome: f.nome, email: f.email, funcao: f.funcao, observacoes: f.observacoes || '' });
  };

  const salvarEdicao = async (id) => {
    try { await atualizarFuncionario(id, editForm); setEditando(null); exibirMensagem('Funcionário atualizado com sucesso.'); carregar(); }
    catch { exibirMensagem('Erro ao atualizar funcionário.', 'erro'); }
  };

  const alternarStatus = async (f) => {
    const novoStatus = f.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    try { await atualizarStatusFuncionario(f.id, novoStatus); exibirMensagem(`Funcionário ${novoStatus === 'INATIVO' ? 'inativado' : 'ativado'} com sucesso.`); carregar(); }
    catch { exibirMensagem('Erro ao alterar status.', 'erro'); }
  };

  const confirmarEExcluir = async (id) => {
    try { await excluirFuncionario(id); setConfirmarExcluir(null); exibirMensagem('Funcionário excluído com sucesso.'); carregar(); }
    catch (err) { setConfirmarExcluir(null); exibirMensagem(err.response?.data?.error || 'Não é possível excluir: funcionário possui vínculos.', 'erro'); }
  };

  const salvarNovo = async (e) => {
    e.preventDefault();
    try {
      await cadastrarFuncionario(novoForm.salaoId, { nome: novoForm.nome, email: novoForm.email, senha: novoForm.senha, funcao: novoForm.funcao, observacoes: novoForm.observacoes });
      setCadastrando(false); setNovoForm(formVazio);
      exibirMensagem('Funcionário cadastrado com sucesso.'); carregar();
    } catch (err) { exibirMensagem(err.response?.data?.error || 'Erro ao cadastrar funcionário.', 'erro'); }
  };

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-boas-vindas">
          <h1>Gerenciar Equipe</h1>
          <p>Cadastre, edite, inative ou exclua funcionários do salão.</p>
        </div>

        {mensagem && <div className="msg-sucesso">{mensagem}</div>}
        {erro && <div className="msg-erro">{erro}</div>}

        <div style={{ marginBottom: 20 }}>
          <button className="btn-primary" onClick={() => setCadastrando(true)}>
            <Plus size={16} />Novo Funcionário
          </button>
        </div>

        {carregando ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p>
        ) : (
          <div className="card admin-card">
            <div className="agenda-tabela">
              <div className="tabela-header" style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.2fr' }}>
                <span>Nome</span><span>Email</span><span>Função</span><span>Status</span><span>Ações</span>
              </div>

              {funcionarios.length === 0 && (
                <p style={{ padding: '24px 20px', color: 'var(--text-soft)', fontSize: 13 }}>Nenhum funcionário cadastrado.</p>
              )}

              {funcionarios.map(f => (
                <div key={f.id} className="tabela-linha" style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.2fr' }}>
                  {editando === f.id ? (
                    <>
                      <input className="input-hora" value={editForm.nome} onChange={e => setEditForm(ef => ({ ...ef, nome: e.target.value }))} />
                      <input className="input-hora" value={editForm.email} onChange={e => setEditForm(ef => ({ ...ef, email: e.target.value }))} />
                      <input className="input-hora" value={editForm.funcao} onChange={e => setEditForm(ef => ({ ...ef, funcao: e.target.value }))} />
                      <span />
                      <div className="acoes-btns">
                        <button className="btn-acao salvar" onClick={() => salvarEdicao(f.id)} title="Salvar"><Check size={13} /></button>
                        <button className="btn-acao cancelar-acao" onClick={() => setEditando(null)} title="Cancelar"><X size={13} /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{f.nome}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{f.email}</span>
                      <span style={{ fontSize: 13 }}>{f.funcao}</span>
                      <span>
                        <button className="btn-acao" onClick={() => alternarStatus(f)} title={f.status === 'ATIVO' ? 'Inativar' : 'Ativar'} style={{ width: 'auto', padding: '4px 10px', gap: 5, fontSize: 12, fontWeight: 600, color: f.status === 'ATIVO' ? '#16a34a' : '#d93025', borderColor: f.status === 'ATIVO' ? '#bbf7d0' : '#ffc9c9', background: f.status === 'ATIVO' ? '#f0fdf4' : '#fff0f0' }}>
                          {f.status === 'ATIVO' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {f.status}
                        </button>
                      </span>
                      <div className="acoes-btns">
                        <button className="btn-acao" onClick={() => iniciarEdicao(f)} title="Editar"><Pencil size={13} /></button>
                        <button className="btn-acao cancelar-acao" onClick={() => setConfirmarExcluir(f)} title="Excluir"><Trash2 size={13} /></button>
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
            <h3>Novo Funcionário</h3>
            <p className="modal-subtitulo">Preencha os dados do funcionário</p>
            <form onSubmit={salvarNovo}>
              <div className="form-group">
                <label>Salão</label>
                <select value={novoForm.salaoId} onChange={e => setNovoForm(f => ({ ...f, salaoId: e.target.value }))} required>
                  <option value="">Selecione um salão</option>
                  {saloes.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Nome</label>
                <input type="text" value={novoForm.nome} onChange={e => setNovoForm(f => ({ ...f, nome: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={novoForm.email} onChange={e => setNovoForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input type="password" value={novoForm.senha} onChange={e => setNovoForm(f => ({ ...f, senha: e.target.value }))} minLength={6} required />
              </div>
              <div className="form-group">
                <label>Função</label>
                <input type="text" value={novoForm.funcao} onChange={e => setNovoForm(f => ({ ...f, funcao: e.target.value }))} placeholder="Ex: Cabeleireiro, Manicure" required />
              </div>
              <div className="form-group">
                <label>Observações</label>
                <input type="text" value={novoForm.observacoes} onChange={e => setNovoForm(f => ({ ...f, observacoes: e.target.value }))} />
              </div>
              <div className="modal-botoes">
                <button type="button" className="btn-secondary" onClick={() => setCadastrando(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmarExcluir && (
        <div className="modal-overlay" onClick={() => setConfirmarExcluir(null)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Excluir Funcionário</h3>
            <p className="modal-subtitulo">
              Deseja excluir <strong>{confirmarExcluir.nome}</strong>? Esta ação não pode ser desfeita.<br />
              <small>Só é possível excluir funcionários sem agendamentos vinculados.</small>
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

export default GerenciarFuncionarios;
