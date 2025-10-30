import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        dataCadastro: new Date().toISOString().split('T')[0],
        codStatus: true
      };

      const response = await fetch('http://localhost:8080/api/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Erro no cadastro');
      }

      navigate('/login');
    } catch (err) {
      setError(err.message || 'Erro no cadastro');
    } finally {
      setLoading(false);
    }
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
          <h2>Cadastro</h2>
          
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

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
                minLength="6"
              />
              <small>Mínimo 6 caracteres</small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p className="auth-link">
            Já tem conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;