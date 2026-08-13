import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { login as autenticar } from '../service/api';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      const { data } = await autenticar(form);
      const role = data.role?.toUpperCase();

      if (role === 'USER') {
        throw new Error('Acesso não permitido. Utilize o aplicativo mobile.');
      }

      const tipos = { ADM: 'admin', ADMIN: 'admin', MANAGER: 'manager', EMPLOYEE: 'employee' };
      const tipo = tipos[role];
      if (!tipo) throw new Error('Perfil de acesso não reconhecido.');

      const usuario = {
        id: data.userId,
        nome: data.nome,
        username: data.username,
        role,
        tipo,
      };
      login(usuario, data.token);
      navigate(tipo === 'admin' ? '/admin' : tipo === 'manager' ? '/manager' : '/');
    } catch (err) {
      setErro(err.response?.data?.error || err.message || 'E-mail ou senha inválidos');
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
