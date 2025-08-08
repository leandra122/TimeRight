import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ backgroundColor: 'var(--primary-color)', padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '600' }}>
          La Belle Vie
        </Link>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
          <Link to="/sobre" style={{ color: 'white', textDecoration: 'none' }}>Sobre</Link>
          <Link to="/servicos" style={{ color: 'white', textDecoration: 'none' }}>Serviços</Link>
          <Link to="/profissionais" style={{ color: 'white', textDecoration: 'none' }}>Profissionais</Link>
          <Link to="/contato" style={{ color: 'white', textDecoration: 'none' }}>Contato</Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
              )}
              <Link to="/perfil" style={{ color: 'white', textDecoration: 'none' }}>Perfil</Link>
              <button onClick={handleLogout} className="btn btn-primary">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/cadastro" className="btn btn-primary">Cadastro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;