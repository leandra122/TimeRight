import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Plus, Store } from 'lucide-react';
import Navbar from '../components/Navbar';
import { FotoPrincipalSalao, StatusSalao, enderecoResumido } from '../components/SalaoResumo';
import { listarMeusSaloes } from '../service/api';
import './DashboardAdmin.css';
import './SaloesGerente.css';

export default function MeusSaloes() {
  const [saloes, setSaloes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let ativo = true;
    setCarregando(true); setErro(false);
    listarMeusSaloes().then(({ data }) => { if (ativo) setSaloes(data); })
      .catch(() => { if (ativo) setErro(true); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativa]);

  return <div className="admin-page"><Navbar />
    <main className="admin-container saloes-page">
      <header className="saloes-cabecalho">
        <div><span className="saloes-sobretitulo">Seus estabelecimentos</span><h1>Meus salões</h1>
          <p>Tudo o que você precisa para cuidar de cada salão, em um só lugar.</p></div>
        <Link className="btn-primary" to="/manager/cadastro-salao"><Plus size={18} />Cadastrar novo salão</Link>
      </header>
      {carregando ? <div className="saloes-estado" role="status">Carregando seus salões…</div>
        : erro ? <div className="saloes-estado" role="alert"><h2>Não foi possível carregar seus salões</h2>
          <p>Tente novamente para visualizar seus estabelecimentos.</p>
          <button className="btn-secondary" onClick={() => setTentativa(v => v + 1)}>Tentar novamente</button></div>
        : !saloes.length ? <div className="saloes-estado"><Store size={40} aria-hidden="true" />
          <h2>Seu primeiro salão começa aqui</h2><p>Cadastre seu estabelecimento para organizar informações, fotos e equipe.</p>
          <Link className="btn-primary" to="/manager/cadastro-salao"><Plus size={18} />Cadastrar novo salão</Link></div>
        : <><p className="saloes-contagem">{saloes.length} {saloes.length === 1 ? 'estabelecimento cadastrado' : 'estabelecimentos cadastrados'}</p>
          <div className="saloes-grid">{saloes.map(salao => <article className="saloes-card" key={salao.id}>
            <FotoPrincipalSalao salao={salao} />
            <div className="saloes-card-corpo"><StatusSalao status={salao.status} /><h2>{salao.nome}</h2>
              <p className="saloes-endereco"><MapPin size={16} aria-hidden="true" /><span>{enderecoResumido(salao)}</span></p>
              <Link className="btn-secondary" to={`/manager/saloes/${salao.id}`} aria-label={`Ver perfil de ${salao.nome}`}>Ver perfil<ArrowRight size={16} /></Link>
            </div>
          </article>)}</div></>}
    </main>
  </div>;
}
