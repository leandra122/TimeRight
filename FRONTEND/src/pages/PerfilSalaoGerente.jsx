import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Camera, Clock, MapPin, Pencil, Scissors, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import ServicosSalao from '../components/ServicosSalao';
import { FotoPrincipalSalao, StatusSalao, enderecoResumido } from '../components/SalaoResumo';
import { listarMeusSaloes } from '../service/api';
import './DashboardAdmin.css';
import './SaloesGerente.css';

const campos = [
  ['nome', 'Nome do salão'], ['nomeFantasia', 'Nome fantasia'], ['razaoSocial', 'Razão social'],
  ['cnpj', 'CNPJ'], ['situacaoCadastral', 'Situação cadastral do CNPJ'], ['email', 'E-mail'],
  ['telefone', 'Telefone'], ['endereco', 'Endereço completo'], ['cep', 'CEP'],
  ['complemento', 'Complemento'], ['pontoReferencia', 'Ponto de referência'],
];
const noop = () => {};

export default function PerfilSalaoGerente() {
  const { salaoId } = useParams();
  const location = useLocation();
  const [salao, setSalao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let ativo = true;
    setCarregando(true); setErro(false); setSalao(null);
    listarMeusSaloes().then(({ data }) => {
      if (ativo) setSalao(data.find(item => String(item.id) === salaoId) || null);
    }).catch(() => { if (ativo) setErro(true); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [salaoId, tentativa]);

  const query = `?salaoId=${encodeURIComponent(salaoId)}`;
  const acessos = [
    { titulo: 'Editar informações', texto: 'Nome, contato e endereço', icone: Pencil, to: '/manager/atualizar-salao' + query },
    { titulo: 'Fotos', texto: 'Galeria e foto principal', icone: Camera, to: '/manager/fotos' + query },
    { titulo: 'Funcionários', texto: 'Equipe deste estabelecimento', icone: Users, to: '/manager/funcionarios' + query },
    { titulo: 'Horários', texto: 'Dias e períodos de funcionamento', icone: Clock, to: '/manager/horarios' + query },
  ];
  return <div className="admin-page"><Navbar /><main className="admin-container saloes-page">
    <Link to="/manager/saloes" className="saloes-voltar"><ArrowLeft size={16} />Meus salões</Link>
    {carregando ? <div className="saloes-estado" role="status">Carregando perfil…</div>
      : erro ? <div className="saloes-estado" role="alert"><h1>Não foi possível carregar o perfil</h1>
        <button className="btn-secondary" onClick={() => setTentativa(v => v + 1)}>Tentar novamente</button></div>
      : !salao ? <div className="saloes-estado"><h1>Salão não encontrado</h1><p>Este estabelecimento não está disponível entre os seus salões.</p>
        <Link className="btn-secondary" to="/manager/saloes">Voltar para meus salões</Link></div>
      : <>
        {location.state?.cadastrado && <div className="msg-sucesso" role="status">Salão cadastrado com sucesso! Agora você pode completar o perfil do seu estabelecimento.</div>}
        <header className="saloes-perfil-capa"><FotoPrincipalSalao salao={salao} />
          <div className="saloes-perfil-titulo"><span className="saloes-sobretitulo">Perfil do estabelecimento</span>
            <h1>{salao.nome}</h1><StatusSalao status={salao.status} />
            <p className="saloes-endereco"><MapPin size={17} aria-hidden="true" /><span>{enderecoResumido(salao)}</span></p>
          </div></header>
        <section aria-labelledby="gerenciar-salao"><h2 id="gerenciar-salao" className="saloes-secao-titulo">Gerenciar salão</h2>
          <div className="saloes-acessos">{acessos.map(({ titulo, texto, icone: Icon, to }) =>
            <Link key={titulo} to={to} className="saloes-acesso"><Icon size={22} aria-hidden="true" /><span><strong>{titulo}</strong><small>{texto}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}
            <a href="#servicos-salao" className="saloes-acesso"><Scissors size={22} aria-hidden="true" /><span><strong>Serviços</strong><small>Adicionar e editar serviços</small></span><ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </section>
        <section className="saloes-dados" aria-labelledby="dados-salao"><h2 id="dados-salao">Informações cadastradas</h2>
          <dl>{campos.map(([campo, label]) => <div key={campo}><dt>{label}</dt><dd>{campo === 'situacaoCadastral' ? 'Não verificada em fonte externa' : salao[campo] || 'Não informado'}</dd></div>)}</dl>
        </section>
        <div id="servicos-salao"><ServicosSalao key={salao.id} salaoId={salao.id} salaoNome={salao.nome} onSalvandoChange={noop} onSalvo={noop} /></div>
      </>}
  </main></div>;
}
