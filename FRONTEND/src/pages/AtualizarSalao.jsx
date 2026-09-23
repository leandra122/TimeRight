import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VoltarPerfilSalao from '../components/VoltarPerfilSalao';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { atualizarSalao, listarMeusSaloes, listarSaloes } from '../service/api';
import { Save } from 'lucide-react';
import './DashboardAdmin.css';

const campos = [
  ['logradouro', 'Endereço (rua ou avenida, sem número)', 150],
  ['numero', 'Número', 20],
  ['complemento', 'Complemento (opcional)', 100],
  ['bairro', 'Bairro', 100],
  ['cidade', 'Cidade', 100],
  ['uf', 'UF', 2],
  ['cep', 'CEP', 9],
  ['pontoReferencia', 'Ponto de referência (opcional)', 150],
];
const formulario = (salao) => Object.fromEntries(campos.map(([nome]) => [nome, salao[nome] || '']));
const informacoes = [['nome', 'Nome do salão', 100], ['email', 'E-mail', 100], ['telefone', 'Telefone', 20]];
const formularioCompleto = salao => ({ ...formulario(salao), ...Object.fromEntries(informacoes.map(([nome]) => [nome, salao[nome] || ''])) });
const completo = (form) => [
  form.logradouro, form.numero, form.complemento, form.bairro, form.cidade, form.uf,
  form.pontoReferencia.trim() ? 'Referência: ' + form.pontoReferencia.trim() : '',
].map(valor => valor.trim()).filter(Boolean).join(', ');
const mensagem = (error) => {
  const data = error.response?.data;
  return typeof data === 'string' ? data : data?.error || data?.message || 'Não foi possível salvar. Tente novamente.';
};

export default function AtualizarSalao() {
  const [params] = useSearchParams();
  return <EdicaoSalao key={JSON.stringify(params.get('salaoId'))} />;
}

function EdicaoSalao() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const salaoSolicitado = params.get('salaoId');
  const [saloes, setSaloes] = useState([]);
  const [selecionado, setSelecionado] = useState('');
  const [form, setForm] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const enviando = useRef(false);
  const ativo = useRef(false);

  useEffect(() => {
    let cancelado = false;
    ativo.current = true;
    setCarregando(true);
    setErro('');
    setForm(null);
    setSaloes([]);
    setSelecionado('');
    const listar = user.tipo === 'manager' ? listarMeusSaloes : listarSaloes;
    listar().then(({ data }) => {
      if (cancelado) return;
      setSaloes(data);
      const inicial = salaoSolicitado !== null ? data.find(item => String(item.id) === salaoSolicitado) : data[0];
      if (inicial && salaoSolicitado === null) {
        setParams(atuais => { const proximos = new URLSearchParams(atuais); proximos.set('salaoId', String(inicial.id)); return proximos; }, { replace: true });
      }
      setSelecionado(inicial ? String(inicial.id) : '');
      setForm(inicial ? formularioCompleto(inicial) : null);
    }).catch(() => {
      if (!cancelado) setErro('Não foi possível carregar os salões. Tente novamente.');
    }).finally(() => {
      if (!cancelado) setCarregando(false);
    });
    return () => { cancelado = true; ativo.current = false; };
  }, [user.tipo, tentativa, salaoSolicitado]);

  function selecionar(event) {
    const id = event.target.value;
    if (enviando.current || !saloes.some(item => String(item.id) === id)) return;
    setParams(atuais => { const proximos = new URLSearchParams(atuais); proximos.set('salaoId', id); return proximos; });
  }

  async function salvar(event) {
    event.preventDefault();
    if (enviando.current || !form || !selecionado) return;
    setErro('');
    setSucesso('');
    if (user.tipo === 'manager' && informacoes.some(([nome]) => !form[nome].trim())) {
      setErro('Preencha nome, e-mail e telefone do salão.');
      return;
    }
    if (!form.logradouro.trim()) {
      setErro('Informe o logradouro do salão.');
      return;
    }
    if (completo(form).length > 200) {
      setErro('O endereço completo deve ter no máximo 200 caracteres. Abrevie as informações.');
      return;
    }
    enviando.current = true;
    setSalvando(true);
    try {
      const camposEditaveis = user.tipo === 'manager' ? [...informacoes, ...campos] : campos;
      const dados = Object.fromEntries(camposEditaveis.map(([chave]) => [chave, form[chave].trim()]));
      const { data } = await atualizarSalao(selecionado, dados);
      if (!ativo.current) return;
      setSaloes(atuais => atuais.map(item => String(item.id) === selecionado ? data : item));
      setForm(formularioCompleto(data));
      setSucesso('Informações atualizadas com sucesso.');
    } catch (error) {
      if (ativo.current) setErro(mensagem(error));
    } finally {
      enviando.current = false;
      if (ativo.current) setSalvando(false);
    }
  }

  const salao = saloes.find(item => String(item.id) === selecionado);
  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        {user.tipo === 'manager' && <VoltarPerfilSalao salaoId={selecionado} />}
        <div className="admin-header">
          <h1>Atualizar Salão</h1>
          <p>Consulte e edite as informações do seu estabelecimento.</p>
        </div>
        {erro && <div className="msg-erro" role="alert">{erro}</div>}
        {sucesso && <div className="msg-sucesso" role="status">{sucesso}</div>}
        {carregando ? <p role="status">Carregando salões...</p> : !form ? (
          erro ? <button className="btn-secondary" onClick={() => setTentativa(valor => valor + 1)}>Tentar novamente</button>
            : <p className="aviso-unico-cadastro">{salaoSolicitado !== null ? 'Salão indisponível para edição. Volte à lista de salões.' : 'Nenhum salão disponível para edição.'}</p>
        ) : (
          <div className="card admin-card">
            <div className="form-group">
              <label htmlFor="salao-edicao">Salão</label>
              <select id="salao-edicao" value={selecionado} onChange={selecionar} disabled={salvando}>
                {saloes.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
            </div>
            <p><strong>Endereço cadastrado:</strong> {salao.endereco}</p>
            {!salao.logradouro && <p className="aviso-unico-cadastro">Este endereço foi cadastrado em texto livre. Confira o endereço acima e preencha rua, número e demais campos separadamente para atualizá-lo.</p>}
            <form onSubmit={salvar} className="salao-form">
              {user.tipo === 'manager' && informacoes.map(([nome, label, limite]) => <div className="form-group" key={nome}>
                <label htmlFor={'informacao-' + nome}>{label}</label>
                <input id={'informacao-' + nome} name={nome} type={nome === 'email' ? 'email' : 'text'} value={form[nome]} maxLength={limite}
                  required disabled={salvando} onChange={event => { setForm(atual => ({ ...atual, [nome]: event.target.value })); setSucesso(''); }} />
              </div>)}
              {campos.map(([nome, label, limite]) => (
                <div className="form-group" key={nome}>
                  <label htmlFor={'endereco-' + nome}>{label}</label>
                  <input id={'endereco-' + nome} name={nome} value={form[nome]} maxLength={limite}
                    required={nome === 'logradouro'} disabled={salvando}
                    onChange={event => { setForm(atual => ({ ...atual, [nome]: event.target.value })); setSucesso(''); }} />
                </div>
              ))}
              <p aria-live="polite"><strong>Endereço completo:</strong> {completo(form) || 'Preencha o endereço'} ({completo(form).length}/200)</p>
              <button type="submit" className="btn-primary" disabled={salvando}>
                <Save size={16} />{salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
