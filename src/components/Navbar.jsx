// Componente de navegação principal - barra superior com menu e autenticação
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth(); // Obtém dados do usuário e função de logout
  const navigate = useNavigate();

  // Função para fazer logout e redirecionar
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ backgroundColor: 'var(--primary-color)', padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo/Título do site */}
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '600', fontFamily: 'Voga, serif' }}>
          TimeRight
        </Link>
        
        {/* Menu de navegação */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
          <Link to="/servicos" style={{ color: 'white', textDecoration: 'none' }}>Serviços</Link>
          <Link to="/contato" style={{ color: 'white', textDecoration: 'none' }}>Contato</Link>
          
          {/* Menu condicional baseado no estado de autenticação */}
          {user ? (
            <>
              {/* Link admin apenas para administradores */}
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
              )}
              <Link to="/perfil" style={{ color: 'white', textDecoration: 'none' }}>Perfil</Link>
              <button onClick={handleLogout} className="btn btn-primary">Sair</button>
            </>
          ) : (
            // Botões de login/cadastro para usuários não logados
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