import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Scissors, Calendar, Star, Users, Clock, CheckCircle,
  ArrowRight, Sparkles, Shield, Zap, Heart, MapPin, Phone, Mail
} from 'lucide-react';
import { getPlataformaStats } from '../service/api';
import './Home.css';

const beneficios = [
  { icon: <Calendar size={22} />, titulo: 'Agendamento online', desc: 'Marque seu horário em segundos, sem precisar ligar.' },
  { icon: <Clock size={22} />, titulo: 'Sem filas', desc: 'Chegue no horário certo e seja atendido na hora.' },
  { icon: <Shield size={22} />, titulo: 'Confirmação imediata', desc: 'Receba confirmação instantânea do seu agendamento.' },
  { icon: <Zap size={22} />, titulo: 'Rápido e simples', desc: 'Interface intuitiva para agendar em poucos cliques.' },
  { icon: <Users size={22} />, titulo: 'Escolha o profissional', desc: 'Selecione o profissional de sua preferência.' },
  { icon: <Heart size={22} />, titulo: 'Para todos', desc: 'Salões de beleza e barbearias em um só lugar.' },
];

const comoFunciona = [
  { num: '01', titulo: 'Crie sua conta', desc: 'Cadastre-se gratuitamente em menos de 1 minuto.' },
  { num: '02', titulo: 'Encontre um salão', desc: 'Busque por nome, cidade ou bairro.' },
  { num: '03', titulo: 'Escolha o serviço', desc: 'Selecione o serviço e o profissional desejado.' },
  { num: '04', titulo: 'Confirme o horário', desc: 'Agende e receba a confirmação na hora.' },
];

const servicos = [
  { icon: '✂️', nome: 'Corte de Cabelo', desc: 'Feminino, masculino e infantil' },
  { icon: '💅', nome: 'Manicure & Pedicure', desc: 'Unhas impecáveis sempre' },
  { icon: '🎨', nome: 'Coloração', desc: 'Mechas, luzes e coloração completa' },
  { icon: '💆', nome: 'Tratamentos', desc: 'Hidratação, botox e reconstrução' },
  { icon: '🪒', nome: 'Barba', desc: 'Barba tradicional e modelagem' },
  { icon: '✨', nome: 'Estética', desc: 'Sobrancelha, cílios e depilação' },
];

const Home = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPlataformaStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  const fmtAgendamentos = () => {
    if (!stats) return '...';
    if (stats.totalAgendamentos === 0) return 'Seja o primeiro!';
    return `${stats.totalAgendamentos}+`;
  };

  const fmtSaloes = () => {
    if (!stats) return '...';
    if (stats.totalSaloes === 0) return 'Em breve';
    return `${stats.totalSaloes}+`;
  };

  const fmtMedia = () => {
    if (!stats) return '...';
    if (!stats.mediaAvaliacoes || stats.totalAvaliacoes === 0) return 'Sem avaliações';
    return `${Number(stats.mediaAvaliacoes).toFixed(1)} ⭐`;
  };

  return (
    <div className="home">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content animate-in">
          <div className="hero-badge">
            <Sparkles size={13} />
            <span>Plataforma para salões e barbearias</span>
          </div>
          <h1 className="hero-title">
            Agende seu horário<br />
            <span className="hero-highlight">com elegância</span>
          </h1>
          <p className="hero-sub">
            Encontre os melhores salões de beleza e barbearias da sua região.
            Agende online em segundos, sem filas e sem complicação.
          </p>
          <div className="hero-actions">
            <Link to="/cadastro" className="btn-primary hero-btn">
              Agendar agora <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary hero-btn">
              Conhecer serviços
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>{fmtAgendamentos()}</strong><span>Agendamentos</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>{fmtSaloes()}</strong><span>Salões parceiros</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>{fmtMedia()}</strong><span>Avaliação média</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-float hero-card-1">
            <div className="float-avatar">A</div>
            <div>
              <p className="float-name">Agendamento</p>
              <p className="float-info">Confirmado ✓</p>
            </div>
            <span className="float-badge">✓ Online</span>
          </div>

          <div className="hero-circle">
            <div className="hero-circle-inner">
              <Scissors size={40} strokeWidth={1.5} color="#FFA1BA" />
              <span>TimeRight</span>
            </div>
          </div>

          <div className="hero-card-float hero-card-2">
            <Calendar size={18} color="#FFA1BA" />
            <div>
              <p className="float-name">Próximo horário</p>
              <p className="float-info">Aguardando agendamento</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="section beneficios">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-tag">Por que TimeRight?</p>
            <h2>Tudo que você precisa<br />em um só lugar</h2>
          </div>
          <div className="grid-3">
            {beneficios.map((b, i) => (
              <div key={i} className="benefit-card">
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.titulo}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="section como-funciona">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-tag">Simples assim</p>
            <h2>Como funciona</h2>
          </div>
          <div className="grid-4">
            {comoFunciona.map((p, i) => (
              <div key={i} className="step-card">
                <span className="step-num">{p.num}</span>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="section servicos-section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-tag">O que oferecemos</p>
            <h2>Serviços disponíveis</h2>
          </div>
          <div className="grid-3">
            {servicos.map((s, i) => (
              <div key={i} className="service-card">
                <span className="service-emoji">{s.icon}</span>
                <h3>{s.nome}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="section-inner cta-inner">
          <div>
            <h2>Pronto para começar?</h2>
            <p>Cadastre-se gratuitamente e agende seu primeiro horário hoje.</p>
          </div>
          <div className="cta-actions">
            <Link to="/cadastro" className="btn-primary">Criar conta<ArrowRight size={16} /></Link>
            <Link to="/login" className="btn-secondary cta-btn-sec">Já tenho conta</Link>
          </div>
        </div>
      </section>

      {/* Avaliações — só exibe se houver dados reais */}
      {stats && stats.totalAvaliacoes > 0 && (
        <section className="section avaliacoes-section">
          <div className="section-inner">
            <div className="section-header">
              <p className="section-tag">Avaliações</p>
              <h2>O que dizem nossos usuários</h2>
            </div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--brand-dark)' }}>
                {Number(stats.mediaAvaliacoes).toFixed(1)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '8px 0' }}>
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={20}
                    fill={n <= Math.round(stats.mediaAvaliacoes) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>
                Baseado em {stats.totalAvaliacoes} avaliação(ões)
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Contato */}
      <section className="section contato-section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-tag">Fale conosco</p>
            <h2>Entre em contato</h2>
          </div>
          <div className="contato-grid">
            <div className="contato-info">
              <div className="contato-item"><MapPin size={18} color="#FFA1BA" /><span>Brasil</span></div>
              <div className="contato-item"><Mail size={18} color="#FFA1BA" /><span>contato@timeright.com.br</span></div>
            </div>
            <form className="contato-form card" onSubmit={e => e.preventDefault()}>
              <div className="form-group">
                <label>Nome</label>
                <input type="text" placeholder="Seu nome" />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" placeholder="seu@email.com" />
              </div>
              <div className="form-group">
                <label>Mensagem</label>
                <textarea rows={4} placeholder="Como podemos ajudar?" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Enviar mensagem</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo-icon" style={{ width: 30, height: 30 }}><Scissors size={14} strokeWidth={2.5} color="#fff" /></div>
            <span>TimeRight</span>
          </div>
          <p className="footer-copy">© 2025 TimeRight — Agendamento online para salões e barbearias</p>
          <div className="footer-links">
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
