import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Camera, Clock, MapPin, Pencil, Users, Calendar, PowerOff } from 'lucide-react';
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
    { titulo: 'Funcionários', texto: 'Equipe deste estabelecimento', icone: Users, to: '/manager/funcionarios' + query },
    { titulo: 'Horários de funcionamento', texto: 'Dias e períodos de funcionamento', icone: Clock, to: '/manager/horarios' + query },
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
        <header className="saloes-perfil-capa"><div className="saloes-perfil-imagem"><FotoPrincipalSalao salao={salao} /><Link className="saloes-galeria-link" to={'/manager/fotos' + query}><Camera size={17} />Gerenciar foto principal e galeria</Link></div>
          <div className="saloes-perfil-titulo"><span className="saloes-sobretitulo">Perfil do estabelecimento</span>
            <h1>{salao.nome}</h1><StatusSalao status={salao.status} />
            <p className="saloes-endereco"><MapPin size={17} aria-hidden="true" /><span>{enderecoResumido(salao)}</span></p>
            <div className="saloes-perfil-acoes"><Link className="btn-primary" to={'/manager/painel' + query}><Calendar size={17} />Abrir agenda do salão</Link><Link className="btn-secondary" to={'/manager' + query}>Ver indicadores</Link></div>
          </div></header>
        <nav className="saloes-perfil-nav" aria-label="Seções do perfil"><a href="#dados-salao">Informações cadastrais</a><a href="#servicos-salao">Serviços</a><a href="#gerenciar-salao">Equipe e funcionamento</a></nav>
        <section className="saloes-dados" aria-labelledby="dados-salao"><div className="gerente-secao-cabecalho"><div><h2 id="dados-salao">Informações cadastrais</h2><p>Dados e endereço do estabelecimento.</p></div><Link className="btn-secondary" to={'/manager/atualizar-salao' + query}><Pencil size={16} />Editar informações</Link></div>
          <dl>{campos.map(([campo, label]) => <div key={campo}><dt>{label}</dt><dd>{campo === 'situacaoCadastral' ? 'Não verificada em fonte externa' : salao[campo] || 'Não informado'}</dd></div>)}</dl>
        </section>
        <section id="servicos-salao" aria-label="Serviços do salão"><ServicosSalao key={salao.id} salaoId={salao.id} salaoNome={salao.nome} onSalvandoChange={noop} onSalvo={noop} /></section>
        <section className="saloes-perfil-gestao" aria-labelledby="gerenciar-salao"><div className="gerente-secao-cabecalho"><div><h2 id="gerenciar-salao">Equipe e funcionamento</h2><p>Organize os profissionais e os horários deste salão.</p></div></div>
          <div className="saloes-acessos">{acessos.map(({ titulo, texto, icone: Icon, to }) =>
            <Link key={titulo} to={to} className="saloes-acesso"><Icon size={22} aria-hidden="true" /><span><strong>{titulo}</strong><small>{texto}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}
          </div>
        </section>
        <div className="saloes-desativacao"><div><strong>Status do estabelecimento</strong><p>Indisponível: o fluxo de reativação ainda não está disponível.</p></div><button className="btn-secondary" disabled><PowerOff size={16} />Desativar Salão</button></div>
      </>}
  </main></div>;
}
