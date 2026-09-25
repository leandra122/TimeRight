import CamposValorServico from '../components/CamposValorServico';
import { converterDuracao, converterPreco } from '../utils/servicoForm';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Store, Plus, Trash2, CheckCircle, XCircle, Loader } from 'lucide-react';
import { cadastrarSalaoComServicos, consultarCnpj } from '../service/api';
import './DashboardAdmin.css';

const CNPJ_VAZIO = {
  nome: '', cnpj: '', razaoSocial: '', nomeFantasia: '', situacaoCadastral: '',
  email: '', endereco: '', cep: '', logradouro: '', numero: '', complemento: '',
  bairro: '', cidade: '', uf: '', pontoReferencia: '', telefone: '',
  servicos: [],
};

const comporEndereco = (dados) => [
  dados.logradouro,
  dados.numero,
  dados.complemento,
  dados.bairro,
  dados.cidade,
  dados.uf,
  dados.pontoReferencia?.trim() ? 'Referência: ' + dados.pontoReferencia.trim() : '',
].map((parte) => (parte == null ? '' : String(parte).trim()))
  .filter((parte) => parte.length > 0)
  .join(', ');

const mascararCnpj = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2)  return d;
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
};

const apenasDigitos = (v) => v.replace(/\D/g, '');

const CadastroSalaoGerente = () => {
  const navigate = useNavigate();
  const [salao, setSalao] = useState(CNPJ_VAZIO);
  const [cnpjStatus, setCnpjStatus] = useState('idle');
  const [cnpjErro, setCnpjErro] = useState('');
  const [camposDoServico, setCamposDoServico] = useState({ razaoSocial: false, nomeFantasia: false });
  const [salvando, setSalvando] = useState(false);
  const enviando = useRef(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [erroServico, setErroServico] = useState('');
  const [servicoTemp, setServicoTemp] = useState({ nome: '', descricao: '', preco: '', horas: '0', minutos: '0' });
  const debounceRef = useRef(null);

  useEffect(() => {
    let ativa = true;
    const digits = apenasDigitos(salao.cnpj);

    if (digits.length < 14) {
      setCnpjStatus('idle');
      setCnpjErro('');
      setCamposDoServico({ razaoSocial: false, nomeFantasia: false });
      return;
    }

    clearTimeout(debounceRef.current);
    setCnpjStatus('consultando');
    setCnpjErro('');

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await consultarCnpj(digits);
        if (!ativa) return;
        setCnpjStatus('valido');
        setCamposDoServico({
          razaoSocial: !!data.razaoSocial,
          nomeFantasia: !!data.nomeFantasia,
        });
        setSalao(prev => ({
          ...prev,
          razaoSocial:       data.razaoSocial       ?? prev.razaoSocial,
          nomeFantasia:      data.nomeFantasia       ?? prev.nomeFantasia,
          situacaoCadastral: data.situacaoCadastral ?? '',
        }));
      } catch (err) {
        if (!ativa) return;
        setCnpjStatus('invalido');
        setCnpjErro([400, 409].includes(err.response?.status) ? (err.response?.data?.error || 'Confira o CNPJ informado.') : 'Não foi possível validar o CNPJ. Tente novamente.');
        setCamposDoServico({ razaoSocial: false, nomeFantasia: false });
      }
    }, 600);

    return () => { ativa = false; clearTimeout(debounceRef.current); };
  }, [salao.cnpj]);

  const handleChange = (e) => setSalao(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCnpj = (e) => {
    setCnpjStatus('idle');
    setSalao(prev => ({ ...prev, cnpj: mascararCnpj(e.target.value), situacaoCadastral: '' }));
  };

  const buscarCEP = async (valor) => {
    const cep = valor.replace(/\D/g, '');
    setSalao(prev => ({ ...prev, cep }));
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setSalao(prev => ({
        ...prev, cep,
        logradouro: data.logradouro || '',
        bairro:     data.bairro     || '',
        cidade:     data.localidade || '',
        uf:         data.uf         || '',
        endereco:   `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
      }));
    } catch {}
  };

  const handleServicoChange = (e) => setServicoTemp(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const adicionarServico = () => {
    const preco = converterPreco(servicoTemp.preco);
    const duracao = converterDuracao(servicoTemp.horas, servicoTemp.minutos);
    if (!servicoTemp.nome.trim() || !Number.isFinite(preco) || !Number.isFinite(duracao)) {
      setErroServico('Informe nome, preço válido (ex.: 35,00) e duração maior que zero, com horas inteiras e minutos de 0 a 59.');
      return;
    }
    setErroServico('');
    setSalao(prev => ({
      ...prev,
      servicos: [...prev.servicos, {
        ...servicoTemp,
        preco,
        duracao,
      }],
    }));
    setServicoTemp({ nome: '', descricao: '', preco: '', horas: '0', minutos: '0' });
    setModalAberto(false);
  };

  const removerServico = (i) =>
    setSalao(prev => ({ ...prev, servicos: prev.servicos.filter((_, idx) => idx !== i) }));

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (enviando.current) return;
    setErroSalvar('');

    if (cnpjStatus !== 'valido') {
      setErroSalvar('Aguarde a validação do CNPJ antes de salvar.');
      return;
    }

    enviando.current = true;
    setSalvando(true);
    try {
      const { data } = await cadastrarSalaoComServicos({
          nome:              salao.nome,
          cnpj:              apenasDigitos(salao.cnpj),
          razaoSocial:       salao.razaoSocial,
          nomeFantasia:      salao.nomeFantasia,
          situacaoCadastral: salao.situacaoCadastral,
          email:             salao.email,
          telefone:          salao.telefone,
          cep:               salao.cep,
          logradouro:        salao.logradouro,
          numero:            salao.numero,
          complemento:       salao.complemento,
          bairro:            salao.bairro,
          cidade:            salao.cidade,
          uf:                salao.uf,
          pontoReferencia:   salao.pontoReferencia,
          endereco:          comporEndereco(salao) || salao.endereco,
          status:            'ATIVO',
          servicos: salao.servicos.map(s => ({
            nome: s.nome, descricao: s.descricao,
            preco: Number(s.preco) || 0, duracao: Number(s.duracao) || 0,
          })),
      });

      navigate(`/manager/saloes/${data.data.id}`, { replace: true, state: { cadastrado: true } });
    } catch (err) {
      setErroSalvar([400, 409].includes(err.response?.status) ? (err.response?.data?.error || 'Confira os dados informados.') : 'Não foi possível cadastrar o salão. Tente novamente.');
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  };

  const cnpjIcone = {
    idle:        null,
    consultando: <Loader size={15} className="cnpj-spin" color="var(--text-soft)" />,
    valido:      <CheckCircle size={15} color="#16a34a" />,
    invalido:    <XCircle size={15} color="#d93025" />,
  }[cnpjStatus];

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <Link to="/manager/saloes" className="btn-secondary" style={{ marginBottom: 24 }}>Voltar para meus salões</Link>
        <div className="admin-header">
          <h1>Cadastrar Salão</h1>
          <p>Preencha as informações do seu estabelecimento</p>
        </div>

        {erroSalvar  && <div className="msg-erro" role="alert">{erroSalvar}</div>}

        <div className="card admin-card">
          <form onSubmit={handleSalvar}>
            <div className="salao-form">

              <div className="form-group">
                <label>CNPJ</label>
                <div className="input-icon-wrap">
                  <input
                    name="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={salao.cnpj}
                    onChange={handleCnpj}
                    maxLength={18}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  {cnpjIcone && (
                    <span className="input-icon-right" style={{ pointerEvents: 'none' }}>
                      {cnpjIcone}
                    </span>
                  )}
                </div>
                {cnpjStatus === 'invalido' && (
                  <p style={{ fontSize: 12, color: '#d93025', marginTop: 5 }}>{cnpjErro}</p>
                )}
                {cnpjStatus === 'valido' && (
                  <p style={{ fontSize: 12, color: '#16a34a', marginTop: 5 }}>
                    Formato e dígitos verificadores válidos. CNPJ disponível no TimeRight no momento da validação. Situação cadastral externa não consultada.
                  </p>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Razão Social
                    {camposDoServico.razaoSocial && (
                      <span style={{ fontSize: 11, color: '#16a34a', marginLeft: 6 }}>✓ preenchido automaticamente</span>
                    )}
                  </label>
                  <input
                    name="razaoSocial"
                    placeholder="Razão social"
                    value={salao.razaoSocial}
                    onChange={handleChange}
                    disabled={camposDoServico.razaoSocial}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Nome Fantasia
                    {camposDoServico.nomeFantasia && (
                      <span style={{ fontSize: 11, color: '#16a34a', marginLeft: 6 }}>✓ preenchido automaticamente</span>
                    )}
                  </label>
                  <input
                    name="nomeFantasia"
                    placeholder="Nome fantasia"
                    value={salao.nomeFantasia}
                    onChange={handleChange}
                    disabled={camposDoServico.nomeFantasia}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nome do salão</label>
                  <input name="nome" placeholder="Ex: Salão da Maria" value={salao.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input name="email" type="email" placeholder="contato@salao.com" value={salao.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input name="telefone" placeholder="(00) 00000-0000" value={salao.telefone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>CEP</label>
                  <input name="cep" placeholder="00000-000" value={salao.cep} onChange={e => buscarCEP(e.target.value)} maxLength={9} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Logradouro</label>
                  <input name="logradouro" placeholder="Rua / Avenida" value={salao.logradouro} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ maxWidth: 160 }}>
                  <label>Número</label>
                  <input name="numero" placeholder="Ex: 123" value={salao.numero} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Complemento</label>
                  <input name="complemento" placeholder="Sala, bloco, andar (opcional)" value={salao.complemento} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Bairro</label>
                  <input name="bairro" placeholder="Bairro" value={salao.bairro} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade</label>
                  <input name="cidade" placeholder="Cidade" value={salao.cidade} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ maxWidth: 120 }}>
                  <label>UF</label>
                  <input name="uf" placeholder="SP" value={salao.uf} onChange={handleChange} maxLength={2} />
                </div>
              </div>

              <div className="form-group">
                <label>Ponto de referência</label>
                <input name="pontoReferencia" placeholder="Ex: ao lado da praça central" value={salao.pontoReferencia} onChange={handleChange} />
              </div>
            </div>

            <div className="servicos-section-admin">
              <div className="servicos-header">
                <h4>Serviços</h4>
                <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setModalAberto(true)}>
                  <Plus size={14} />Adicionar
                </button>
              </div>
              {salao.servicos.length > 0 && (
                <div className="servicos-lista">
                  {salao.servicos.map((s, i) => (
                    <div key={i} className="servico-item">
                      <div>
                        <strong>{s.nome}</strong>
                        <span>R$ {Number(s.preco).toFixed(2)} · {s.duracao} min</span>
                      </div>
                      <button type="button" className="btn-acao cancelar-acao" onClick={() => removerServico(i)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: 24 }}
              disabled={salvando || cnpjStatus === 'consultando'}
            >
              <Store size={16} />
              {salvando ? 'Cadastrando...' : cnpjStatus === 'consultando' ? 'Validando CNPJ...' : 'Cadastrar Salão'}
            </button>
          </form>
        </div>
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <h3>Novo Serviço</h3>
            <p className="modal-subtitulo">Preencha os dados do serviço</p>
            <div className="form-group">
              <label>Nome</label>
              <input name="nome" placeholder="Ex: Corte feminino" value={servicoTemp.nome} onChange={handleServicoChange} />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <input name="descricao" placeholder="Descrição breve" value={servicoTemp.descricao} onChange={handleServicoChange} />
            </div>
            <CamposValorServico form={servicoTemp} onChange={handleServicoChange} />
            {erroServico && <p className="msg-erro" role="alert">{erroServico}</p>}
            <div className="modal-botoes">
              <button type="button" className="btn-secondary" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={adicionarServico}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastroSalaoGerente;
