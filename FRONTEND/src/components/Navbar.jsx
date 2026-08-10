import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Menu, X, ChevronDown, LogOut, User, Calendar, LayoutDashboard, Users, Store, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon"><Scissors size={16} strokeWidth={2.5} /></div>
          <span>TimeRight</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Entrar</Link>
              <Link to="/cadastro" className="btn-primary nav-cta">Começar grátis</Link>
            </>
          ) : (
            <>
              {user.tipo === 'admin' && (
                <>
                  <Link to="/admin" className="nav-link"><LayoutDashboard size={14} />Início</Link>
                  <Link to="/admin/cadastro-salao" className="nav-link"><Store size={14} />Salões</Link>
                  <Link to="/admin/painel" className="nav-link"><Calendar size={14} />Painel</Link>
                  <Link to="/admin/funcionarios" className="nav-link"><Users size={14} />Equipe</Link>
                  <Link to="/admin/usuario" className="nav-link"><User size={14} />Usuários</Link>
                </>
              )}
              {user.tipo === 'manager' && (
                <>
                  <Link to="/manager" className="nav-link"><LayoutDashboard size={14} />Início</Link>
                  <Link to="/manager/cadastro-salao" className="nav-link"><Store size={14} />Salões</Link>
                  <Link to="/manager/painel" className="nav-link"><Calendar size={14} />Painel</Link>
                  <Link to="/manager/funcionarios" className="nav-link"><Users size={14} />Equipe</Link>
                </>
              )}
              <div className="nav-user">
                <div className="nav-avatar">{user.nome?.charAt(0).toUpperCase()}</div>
                <span className="nav-name">{user.nome?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="nav-logout" title="Sair">
                  <LogOut size={15} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="navbar-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile">
          {!user ? (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link to="/cadastro" className="btn-primary" onClick={() => setMenuOpen(false)}>Começar grátis</Link>
            </>
          ) : (
            <>
              <div className="mobile-user">
                <div className="nav-avatar">{user.nome?.charAt(0).toUpperCase()}</div>
                <span>{user.nome?.split(' ')[0]}</span>
              </div>
              {user.tipo === 'admin' && (
                <>
                  <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Início</Link>
                  <Link to="/admin/cadastro-salao" className="mobile-link" onClick={() => setMenuOpen(false)}>Salões</Link>
                  <Link to="/admin/painel" className="mobile-link" onClick={() => setMenuOpen(false)}>Painel</Link>
                  <Link to="/admin/funcionarios" className="mobile-link" onClick={() => setMenuOpen(false)}>Equipe</Link>
                  <Link to="/admin/usuario" className="mobile-link" onClick={() => setMenuOpen(false)}>Usuários</Link>
                </>
              )}
              {user.tipo === 'manager' && (
                <>
                  <Link to="/manager" className="mobile-link" onClick={() => setMenuOpen(false)}>Início</Link>
                  <Link to="/manager/cadastro-salao" className="mobile-link" onClick={() => setMenuOpen(false)}>Salões</Link>
                  <Link to="/manager/painel" className="mobile-link" onClick={() => setMenuOpen(false)}>Painel</Link>
                  <Link to="/manager/funcionarios" className="mobile-link" onClick={() => setMenuOpen(false)}>Equipe</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%' }}>
                <LogOut size={15} /> Sair
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
