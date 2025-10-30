import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/usuario/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha
        })
      });

      if (!response.ok) {
        throw new Error('Email ou senha inválidos');
      }

      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Erro no login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form">
          <h2>Login</h2>
          
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha:</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
              />
            </div>

            {user ? (
              <div className="user-info">
                <span>Bem-vindo, {user.nome}!</span>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            )}
          </form>

          {!user && (
            <p className="auth-link">
              Não tem conta? <Link to="/register">Cadastre-se</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;