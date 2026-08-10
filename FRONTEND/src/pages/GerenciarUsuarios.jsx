import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { listarUsuario, atualizarStatusUsuario, excluirUsuario, atualizarUsuario } from '../service/api';
import './DashboardAdmin.css';

const GerenciarUsuarios = () => {
  const [usuario, setUsuario] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
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
    try { const { data } = await listarUsuario(); setUsuario(data); }
    catch { exibirMensagem('Erro ao carregar usuários.', 'erro'); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const iniciarEdicao = (u) => { setEditando(u.id); setEditForm({ nome: u.nome, username: u.username || '' }); };

  const salvarEdicao = async (id) => {
    try { await atualizarUsuario(id, { nome: editForm.nome, username: editForm.username }); setEditando(null); exibirMensagem('Usuário atualizado com sucesso.'); carregar(); }
    catch { exibirMensagem('Erro ao atualizar usuário.', 'erro'); }
  };

  const alternarStatus = async (u) => {
    const novoStatus = u.statusUsuario === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    try { await atualizarStatusUsuario(u.id, novoStatus); exibirMensagem(`Usuário ${novoStatus === 'INATIVO' ? 'inativado' : 'ativado'} com sucesso.`); carregar(); }
    catch { exibirMensagem('Erro ao alterar status.', 'erro'); }
  };

  const confirmarEExcluir = async (id) => {
    try { await excluirUsuario(id); setConfirmarExcluir(null); exibirMensagem('Usuário excluído com sucesso.'); carregar(); }
    catch (err) { setConfirmarExcluir(null); exibirMensagem(err.response?.data?.mensagem || 'Não é possível excluir: usuário possui vínculos.', 'erro'); }
  };

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-boas-vindas">
          <h1>Gerenciar Usuários</h1>
          <p>Inclua, edite, inative ou exclua perfis de usuários.</p>
        </div>

        {mensagem && <div className="msg-sucesso">{mensagem}</div>}
        {erro && <div className="msg-erro">{erro}</div>}

        {carregando ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p>
        ) : (
          <div className="card admin-card">
            <div className="agenda-tabela">
              <div className="tabela-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 1.2fr' }}>
                <span>Nome</span><span>Username</span><span>Status</span><span>Ações</span>
              </div>

              {usuario.length === 0 && (
                <p style={{ padding: '24px 20px', color: 'var(--text-soft)', fontSize: 13 }}>Nenhum usuário encontrado.</p>
              )}

              {usuario.map(u => (
                <div key={u.id} className="tabela-linha" style={{ gridTemplateColumns: '2fr 2fr 1fr 1.2fr' }}>
                  {editando === u.id ? (
                    <>
                      <input className="input-hora" value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
                      <input className="input-hora" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} />
                      <span />
                      <div className="acoes-btns">
                        <button className="btn-acao salvar" onClick={() => salvarEdicao(u.id)} title="Salvar"><Check size={13} /></button>
                        <button className="btn-acao cancelar-acao" onClick={() => setEditando(null)} title="Cancelar"><X size={13} /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{u.nome}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{u.username}</span>
                      <span>
                        <button className="btn-acao" onClick={() => alternarStatus(u)} title={u.statusUsuario === 'ATIVO' ? 'Inativar' : 'Ativar'} style={{ width: 'auto', padding: '4px 10px', gap: 5, fontSize: 12, fontWeight: 600, color: u.statusUsuario === 'ATIVO' ? '#16a34a' : '#d93025', borderColor: u.statusUsuario === 'ATIVO' ? '#bbf7d0' : '#ffc9c9', background: u.statusUsuario === 'ATIVO' ? '#f0fdf4' : '#fff0f0' }}>
                          {u.statusUsuario === 'ATIVO' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {u.statusUsuario}
                        </button>
                      </span>
                      <div className="acoes-btns">
                        <button className="btn-acao" onClick={() => iniciarEdicao(u)} title="Editar"><Pencil size={13} /></button>
                        <button className="btn-acao cancelar-acao" onClick={() => setConfirmarExcluir(u)} title="Excluir"><Trash2 size={13} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmarExcluir && (
        <div className="modal-overlay" onClick={() => setConfirmarExcluir(null)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Excluir Usuário</h3>
            <p className="modal-subtitulo">
              Deseja excluir <strong>{confirmarExcluir.nome}</strong>? Esta ação não pode ser desfeita.<br />
              <small>Só é possível excluir usuários sem vínculos com salões ou agendamentos.</small>
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

export default GerenciarUsuarios;
