import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import VoltarPerfilSalao from '../components/VoltarPerfilSalao';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, BriefcaseBusiness, Clock3, CircleDollarSign, UserRound, LoaderCircle, AlertCircle } from 'lucide-react';
import {
  listarFuncionariosGlobais, listarMeusFuncionarios, cadastrarFuncionario,
  atualizarFuncionario, atualizarStatusFuncionario, excluirFuncionario,
  listarMeusSaloes,
  listarMeusServicos, listarServicosFuncionario, salvarServicosFuncionario,
} from '../service/api';
import './DashboardAdmin.css';

const formVazio = { nome: '', email: '', senha: '', funcao: '', observacoes: '', salaoId: '' };

const GerenciarFuncionarios = () => {
  const [params] = useSearchParams();
  return <EquipeSalao key={JSON.stringify(params.get('salaoId'))} />;
};

const EquipeSalao = () => {
  const { user } = useAuth();
  const podeGerenciar = user?.tipo === 'manager';
  const [params, setParams] = useSearchParams();
  const salaoFiltro = podeGerenciar ? params.get('salaoId') || '' : '';
  const [funcionarios, setFuncionarios] = useState([]);
  const [saloes, setSaloes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [cadastrando, setCadastrando] = useState(false);
  const [novoForm, setNovoForm] = useState(formVazio);
  const [confirmarExcluir, setConfirmarExcluir] = useState(null);
  const [gerenciandoServicos, setGerenciandoServicos] = useState(null);
  const [servicosDoFuncionario, setServicosDoFuncionario] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState(new Set());
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [erroServicos, setErroServicos] = useState('');
  const [funcionarioCarregado, setFuncionarioCarregado] = useState(null);
  const [salvandoAssociacoes, setSalvandoAssociacoes] = useState(false);
  const consultaServicos = useRef(0);
  const envioAssociacoes = useRef(false);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const funcionariosVisiveis = salaoFiltro ? funcionarios.filter(f => String(f.salao?.id) === salaoFiltro) : funcionarios;

  const exibirMensagem = (msg, tipo = 'sucesso') => {
    if (tipo === 'sucesso') { setMensagem(msg); setErro(null); }
    else { setErro(msg); setMensagem(null); }
    setTimeout(() => { setMensagem(null); setErro(null); }, 3500);
  };

  const carregar = useCallback(async () => {
    try {
      if (podeGerenciar) {
        const [{ data: funcs }, { data: sal }, { data: serv }] = await Promise.all([
          listarMeusFuncionarios(), listarMeusSaloes(), listarMeusServicos(),
        ]);
        setFuncionarios(funcs);
        setSaloes(sal);
        setServicosDoFuncionario(serv);
      } else {
        const { data } = await listarFuncionariosGlobais();
        setFuncionarios(data);
        setSaloes([]);
      }
    } catch { exibirMensagem('Erro ao carregar dados.', 'erro'); }
    finally { setCarregando(false); }
  }, [podeGerenciar]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => () => { consultaServicos.current += 1; }, []);

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

  const abrirGerenciarServicos = async (funcionario) => {
    if (envioAssociacoes.current) return;
    const consulta = ++consultaServicos.current;
    setGerenciandoServicos(funcionario);
    setFuncionarioCarregado(null);
    setServicosSelecionados(new Set());
    setCarregandoServicos(true);
    setErroServicos('');
    try {
      const { data } = await listarServicosFuncionario(funcionario.id);
      if (consulta !== consultaServicos.current) return;
      setServicosSelecionados(new Set((data.servicos || []).map(servico => servico.id)));
      setFuncionarioCarregado(funcionario.id);
    } catch (err) {
      if (consulta !== consultaServicos.current) return;
      setErroServicos(err.response?.data?.error || 'Não foi possível carregar os serviços deste funcionário.');
    } finally { if (consulta === consultaServicos.current) setCarregandoServicos(false); }
  };

  const fecharServicos = () => {
    if (envioAssociacoes.current) return;
    consultaServicos.current += 1;
    setGerenciandoServicos(null);
    setFuncionarioCarregado(null);
    setServicosSelecionados(new Set());
  };

  const alternarServico = (servicoId) => {
    if (envioAssociacoes.current || funcionarioCarregado !== gerenciandoServicos?.id) return;
    setServicosSelecionados(atual => {
      const proximo = new Set(atual);
      if (proximo.has(servicoId)) proximo.delete(servicoId); else proximo.add(servicoId);
      return proximo;
    });
  };

  const salvarAssociacoes = async () => {
    if (envioAssociacoes.current || !gerenciandoServicos || carregandoServicos || erroServicos
      || funcionarioCarregado !== gerenciandoServicos.id) return;
    const consulta = consultaServicos.current;
    const funcionarioId = gerenciandoServicos.id;
    const selecao = [...servicosSelecionados];
    envioAssociacoes.current = true;
    setSalvandoAssociacoes(true);
    try {
      await salvarServicosFuncionario(funcionarioId, selecao);
      if (consulta !== consultaServicos.current) return;
      consultaServicos.current += 1;
      setGerenciandoServicos(null);
      setFuncionarioCarregado(null);
      exibirMensagem('Serviços do funcionário atualizados com sucesso.');
    } catch (err) {
      if (consulta === consultaServicos.current) exibirMensagem(err.response?.data?.error || 'Erro ao salvar serviços.', 'erro');
    } finally {
      envioAssociacoes.current = false;
      setSalvandoAssociacoes(false);
    }
  };

  const servicosAtivosDoSalao = gerenciandoServicos
    ? servicosDoFuncionario.filter(servico => servico.salao?.id === gerenciandoServicos.salao?.id && servico.status === 'ATIVO')
    : [];

  const formatarPreco = (preco) => Number(preco || 0).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
  });

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
        {podeGerenciar && <VoltarPerfilSalao salaoId={saloes.some(s => String(s.id) === salaoFiltro) ? salaoFiltro : ''} />}
        <div className="admin-boas-vindas">
          <h1>Gerenciar Equipe</h1>
          <p>{podeGerenciar
            ? 'Cadastre, edite, inative ou exclua funcionários dos seus salões.'
            : 'Consulte os funcionários cadastrados na plataforma.'}</p>
        </div>

        {mensagem && <div className="msg-sucesso">{mensagem}</div>}
        {erro && <div className="msg-erro">{erro}</div>}

        {podeGerenciar && saloes.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div className="form-group"><label htmlFor="equipe-salao">Salão</label>
              <select id="equipe-salao" value={salaoFiltro} disabled={salvandoAssociacoes} onChange={event => {
                const id = event.target.value;
                if (id && !saloes.some(s => String(s.id) === id)) return;
                setParams(atuais => { const proximos = new URLSearchParams(atuais); if (id) proximos.set('salaoId', id); else proximos.delete('salaoId'); return proximos; });
              }}>
                <option value="">Todos os meus salões</option>
                {salaoFiltro && !saloes.some(s => String(s.id) === salaoFiltro) && <option value={salaoFiltro} disabled>Salão indisponível</option>}
                {saloes.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={() => { setNovoForm({ ...formVazio, salaoId: saloes.some(s => String(s.id) === salaoFiltro) ? salaoFiltro : '' }); setCadastrando(true); }}>
              <Plus size={16} />Novo Funcionário
            </button>
          </div>
        )}

        {podeGerenciar && !carregando && saloes.length === 0 && (
          <div className="aviso-unico-cadastro">
            Cadastre um salão antes de adicionar funcionários.
          </div>
        )}

        {carregando ? (
          <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>Carregando...</p>
        ) : (
          <div className="card admin-card">
            <div className="agenda-tabela">
              <div className="tabela-header" style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.8fr' }}>
                <span>Nome</span><span>Email</span><span>Função</span><span>Status</span><span>Ações</span>
              </div>

              {funcionariosVisiveis.length === 0 && (
                <p style={{ padding: '24px 20px', color: 'var(--text-soft)', fontSize: 13 }}>Nenhum funcionário cadastrado.</p>
              )}

              {funcionariosVisiveis.map(f => (
                <div key={f.id} className="tabela-linha" style={{ gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1.8fr' }}>
                  {podeGerenciar && editando === f.id ? (
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
                        <button className="btn-acao" onClick={() => podeGerenciar && alternarStatus(f)} disabled={!podeGerenciar} title={podeGerenciar ? (f.status === 'ATIVO' ? 'Inativar' : 'Ativar') : 'Somente consulta'} style={{ width: 'auto', padding: '4px 10px', gap: 5, fontSize: 12, fontWeight: 600, color: f.status === 'ATIVO' ? '#16a34a' : '#d93025', borderColor: f.status === 'ATIVO' ? '#bbf7d0' : '#ffc9c9', background: f.status === 'ATIVO' ? '#f0fdf4' : '#fff0f0' }}>
                          {f.status === 'ATIVO' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {f.status}
                        </button>
                      </span>
                      <div className="acoes-btns">
                        {podeGerenciar && (
                          <>
                            <button className="btn-acao" onClick={() => iniciarEdicao(f)} title="Editar"><Pencil size={13} /></button>
                            <button className="btn-acao" onClick={() => abrirGerenciarServicos(f)} title="Gerenciar serviços"><BriefcaseBusiness size={13} /></button>
                            <button className="btn-acao cancelar-acao" onClick={() => setConfirmarExcluir(f)} title="Excluir"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {podeGerenciar && cadastrando && (
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

      {podeGerenciar && gerenciandoServicos && (
        <div className="modal-overlay" onClick={fecharServicos}>
          <div className="modal-card card modal-servicos" onClick={e => e.stopPropagation()}>
            <div className="modal-servicos-cabecalho">
              <div className="modal-servicos-icone"><BriefcaseBusiness size={20} /></div>
              <div>
                <h3>Gerenciar serviços</h3>
                <div className="modal-servicos-funcionario"><UserRound size={14} />{gerenciandoServicos.nome}</div>
              </div>
            </div>
            <p className="modal-servicos-apoio">Selecione os serviços que este funcionário está habilitado a realizar.</p>

            <div className="modal-servicos-lista" aria-live="polite">
              {carregandoServicos ? (
                <div className="modal-servicos-estado"><LoaderCircle size={20} className="modal-servicos-spinner" />Carregando serviços...</div>
              ) : erroServicos ? (
                <div className="modal-servicos-estado erro"><AlertCircle size={20} />{erroServicos}</div>
              ) : servicosAtivosDoSalao.length === 0 ? (
                <div className="modal-servicos-estado">Nenhum serviço ativo disponível neste salão.</div>
              ) : servicosAtivosDoSalao.map(servico => {
                const selecionado = servicosSelecionados.has(servico.id);
                return (
                  <label key={servico.id} className={`modal-servico-item ${selecionado ? 'selecionado' : ''}`}>
                    <span className="modal-servico-check"><input type="checkbox" checked={selecionado} disabled={salvandoAssociacoes} onChange={() => alternarServico(servico.id)} /></span>
                    <span className="modal-servico-conteudo">
                      <span className="modal-servico-nome">{servico.nome}</span>
                      <span className="modal-servico-meta"><span><CircleDollarSign size={14} />{formatarPreco(servico.preco)}</span><span><Clock3 size={14} />{servico.duracao} min</span></span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="modal-botoes modal-servicos-rodape">
              <button className="btn-secondary" disabled={salvandoAssociacoes} onClick={fecharServicos}>Cancelar</button>
              <button className="btn-primary" onClick={salvarAssociacoes} disabled={salvandoAssociacoes || carregandoServicos || !!erroServicos || funcionarioCarregado !== gerenciandoServicos.id}>{salvandoAssociacoes ? 'Salvando...' : 'Salvar alterações'}</button>
            </div>
          </div>
        </div>
      )}

      {podeGerenciar && confirmarExcluir && (
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
