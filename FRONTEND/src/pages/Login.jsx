import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ username: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const erroResponse = await response.json();
        throw new Error(erroResponse.message || 'Erro ao fazer login');
      }
      const usuario = await response.json();
      const nivelId = usuario.nivelAcesso?.id;
      const nomeNivel = usuario.nivelAcesso?.nomeNivelAcesso?.toLowerCase();

      // USER (nivel 3) não acessa o sistema WEB
      if (nivelId === 3 || nomeNivel === 'user') {
        throw new Error('Acesso não permitido. Utilize o aplicativo mobile.');
      }

      const tipo = (nivelId === 1 || nomeNivel === 'adm' || nomeNivel === 'admin') ? 'admin' : 'manager';
      const usuarioComTipo = { ...usuario, tipo };
      setUser(usuarioComTipo);
      localStorage.setItem('usuario', JSON.stringify(usuarioComTipo));
      navigate(tipo === 'admin' ? '/admin' : '/manager');
    } catch (err) {
      setErro(err.message || 'E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <div className="auth-logo"><Scissors size={24} strokeWidth={2} /></div>
            <h2>Bem-vindo(a) de volta</h2>
            <p>Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-mail</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  name="username"
                  placeholder="seu@email.com"
                  value={form.username}
                  onChange={handleChange}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="senha"
                  placeholder="Sua senha"
                  value={form.senha}
                  onChange={handleChange}
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  required
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && <p className="auth-erro">{erro}</p>}

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth-link">
            Não tem conta? <Link to="/cadastro">Cadastre-se grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
