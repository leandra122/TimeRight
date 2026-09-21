import React, { useEffect, useRef, useState } from 'react';
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
const completo = (form) => [
  form.logradouro, form.numero, form.complemento, form.bairro, form.cidade, form.uf,
  form.pontoReferencia.trim() ? 'Referência: ' + form.pontoReferencia.trim() : '',
].map(valor => valor.trim()).filter(Boolean).join(', ');
const mensagem = (error) => {
  const data = error.response?.data;
  return typeof data === 'string' ? data : data?.error || data?.message || 'Não foi possível salvar. Tente novamente.';
};

export default function AtualizarSalao() {
  const { user } = useAuth();
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
      setSelecionado(data[0] ? String(data[0].id) : '');
      setForm(data[0] ? formulario(data[0]) : null);
    }).catch(() => {
      if (!cancelado) setErro('Não foi possível carregar os salões. Tente novamente.');
    }).finally(() => {
      if (!cancelado) setCarregando(false);
    });
    return () => { cancelado = true; ativo.current = false; };
  }, [user.tipo, tentativa]);

  function selecionar(event) {
    const id = event.target.value;
    setSelecionado(id);
    setForm(formulario(saloes.find(item => String(item.id) === id)));
    setErro('');
    setSucesso('');
  }

  async function salvar(event) {
    event.preventDefault();
    if (enviando.current || !form || !selecionado) return;
    setErro('');
    setSucesso('');
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
      const dados = Object.fromEntries(Object.entries(form).map(([chave, valor]) => [chave, valor.trim()]));
      const { data } = await atualizarSalao(selecionado, dados);
      if (!ativo.current) return;
      setSaloes(atuais => atuais.map(item => String(item.id) === selecionado ? data : item));
      setForm(formulario(data));
      setSucesso('Endereço atualizado com sucesso.');
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
        <div className="admin-header">
          <h1>Atualizar Salão</h1>
          <p>Consulte e edite o endereço do seu estabelecimento.</p>
        </div>
        {erro && <div className="msg-erro" role="alert">{erro}</div>}
        {sucesso && <div className="msg-sucesso" role="status">{sucesso}</div>}
        {carregando ? <p role="status">Carregando salões...</p> : !form ? (
          erro ? <button className="btn-secondary" onClick={() => setTentativa(valor => valor + 1)}>Tentar novamente</button>
            : <p className="aviso-unico-cadastro">Nenhum salão disponível para edição.</p>
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