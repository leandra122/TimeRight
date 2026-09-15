import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { atualizarServico, cadastrarServico, listarServicosPorSalao } from '../service/api';

const vazio = { nome: '', descricao: '', preco: '', duracao: '' };
const mensagemErro = (error, padrao) => {
  const data = error.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  return data?.error || data?.message || padrao;
};

export default function ServicosSalao({ salaoId, salaoNome, onSalvandoChange, onSalvo }) {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregado, setCarregado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const ativo = useRef(false);
  const enviando = useRef(false);
  const consulta = useRef(0);

  const carregar = useCallback(async () => {
    const sequencia = ++consulta.current;
    setCarregando(true);
    setCarregado(false);
    setErro('');
    try {
      const { data } = await listarServicosPorSalao(salaoId);
      if (!ativo.current || sequencia !== consulta.current) return;
      setServicos(data);
      setCarregado(true);
    } catch (error) {
      if (ativo.current && sequencia === consulta.current) setErro(mensagemErro(error, 'Não foi possível carregar os serviços. Tente atualizar a lista.'));
    } finally {
      if (ativo.current && sequencia === consulta.current) setCarregando(false);
    }
  }, [salaoId]);

  useEffect(() => {
    ativo.current = true;
    carregar();
    return () => { ativo.current = false; consulta.current += 1; };
  }, [carregar]);

  const abrir = (servico = vazio) => {
    setErro('');
    setSucesso('');
    setForm({ ...servico, descricao: servico.descricao || '' });
  };

  const salvar = async (event) => {
    event.preventDefault();
    if (enviando.current || !form || !carregado) return;
    const dados = { nome: form.nome.trim(), descricao: form.descricao.trim(), preco: Number(form.preco), duracao: Number(form.duracao) };
    if (!dados.nome || String(form.preco).trim() === '' || !Number.isFinite(dados.preco)
      || dados.preco < 0 || !Number.isInteger(dados.duracao)
      || dados.duracao <= 0 || dados.duracao > 2147483647) {
      setErro('Informe nome, preço não negativo e duração inteira positiva em minutos.');
      return;
    }
    enviando.current = true;
    setSalvando(true);
    onSalvandoChange(true);
    setErro('');
    setSucesso('');
    try {
      if (form.id) await atualizarServico(form.id, dados);
      else await cadastrarServico({ ...dados, salao: { id: Number(salaoId) } });
      if (!ativo.current) return;
      setForm(null);
      setSucesso(form.id ? 'Serviço atualizado com sucesso.' : 'Serviço cadastrado com sucesso.');
      await carregar();
      if (ativo.current) onSalvo();
    } catch (error) {
      if (ativo.current) setErro(mensagemErro(error, 'Não foi possível salvar o serviço.'));
    } finally {
      enviando.current = false;
      if (ativo.current) { setSalvando(false); onSalvandoChange(false); }
    }
  };

  const alterar = (event) => setForm((atual) => ({ ...atual, [event.target.name]: event.target.value }));

  return (
    <section className="card admin-card" aria-labelledby="servicos-titulo">
      <div className="servicos-header">
        <h2 id="servicos-titulo">Serviços de {salaoNome}</h2>
        <button type="button" className="btn-primary" disabled={carregando || salvando || !carregado || !!form} onClick={() => abrir()}>
          <Plus size={16} /> Novo serviço
        </button>
      </div>
      {erro && <div className="msg-erro" role="alert">{erro}</div>}
      {sucesso && <div className="msg-sucesso" role="status">{sucesso}</div>}
      {carregando && <p role="status">Carregando serviços...</p>}
      {!carregando && !carregado && <button type="button" className="btn-secondary" disabled={salvando} onClick={carregar}>Atualizar lista</button>}
      {!carregando && carregado && (
        <div className="servicos-lista">
          {!servicos.length && <p>Nenhum serviço cadastrado neste salão.</p>}
          {servicos.map((servico) => (
            <div className="servico-item" key={servico.id}>
              <div>
                <strong>{servico.nome}</strong>
                <span>{Number(servico.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {servico.duracao} min · {servico.status}</span>
                {servico.descricao && <p>{servico.descricao}</p>}
              </div>
              <button type="button" className="btn-secondary" disabled={salvando || !!form} onClick={() => abrir(servico)} aria-label={'Editar ' + servico.nome}>
                <Pencil size={14} /> Editar
              </button>
            </div>
          ))}
        </div>
      )}
      {form && (
        <form className="salao-form servicos-section-admin" onSubmit={salvar}>
          <h3>{form.id ? 'Editar serviço' : 'Novo serviço'}</h3>
          <div className="form-group">
            <label htmlFor="servico-nome">Nome</label>
            <input id="servico-nome" name="nome" value={form.nome} onChange={alterar} maxLength={100} required disabled={salvando} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="servico-preco">Preço (R$)</label>
              <input id="servico-preco" name="preco" type="number" min="0" step="0.01" value={form.preco} onChange={alterar} required disabled={salvando} />
            </div>
            <div className="form-group">
              <label htmlFor="servico-duracao">Duração (minutos)</label>
              <input id="servico-duracao" name="duracao" type="number" min="1" max="2147483647" step="1" value={form.duracao} onChange={alterar} required disabled={salvando} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="servico-descricao">Descrição (opcional)</label>
            <input id="servico-descricao" name="descricao" value={form.descricao} onChange={alterar} maxLength={255} disabled={salvando} />
          </div>
          <div className="modal-botoes">
            <button type="button" className="btn-secondary" disabled={salvando} onClick={() => { setForm(null); setErro(''); }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando || !carregado}>{salvando ? 'Salvando...' : 'Salvar serviço'}</button>
          </div>
        </form>
      )}
    </section>
  );
}
