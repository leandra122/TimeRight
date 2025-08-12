import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>TimeRight</h1>
          <p>Seu tempo, nossa prioridade</p>
          
          {isAuthenticated ? (
            <div>
              <h2>Bem-vindo, {user.name}!</h2>
              <Link to="/dashboard" className="btn btn-primary">
                Ir para Dashboard
              </Link>
            </div>
          ) : (
            <div>
              <Link to="/register" className="btn btn-primary">
                Começar Agora
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Fazer Login
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Por que escolher o TimeRight?</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>Simples</h3>
              <p>Interface intuitiva e fácil de usar</p>
            </div>
            <div className="feature">
              <h3>Rápido</h3>
              <p>Cadastro e login em segundos</p>
            </div>
            <div className="feature">
              <h3>Seguro</h3>
              <p>Seus dados protegidos com criptografia</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;