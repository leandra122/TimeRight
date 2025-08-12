import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">TimeRight</Link>
        
        <div className="nav-links">
          <Link to="/">Home</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <span>Olá, {user.name}</span>
              <button onClick={logout} className="btn-logout">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Cadastro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;