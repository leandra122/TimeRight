import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Auth.css';

const Cadastro = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro('');
    setLoading(true);

    const payload = {
      nome: form.nome,
      username: form.email,
      password: form.senha
    };


    try {
      const response = await fetch("http://localhost:8080/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Erro ao cadastrar usuário."
        );
      }

      navigate("/login");

    } catch (err) {
      setErro(err.message);
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
            <div className="auth-logo">
              <Scissors size={24} />
            </div>

            <h2>Criar conta de gerente</h2>
            <p>Preencha os dados abaixo para começar</p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Nome completo</label>

              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />

                <input
                  type="text"
                  name="nome"
                  placeholder="Seu nome completo"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>E-mail</label>

              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />

                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha</label>

              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />

                <input
                  type={showPass ? "text" : "password"}
                  name="senha"
                  placeholder="Mínimo de 6 caracteres"
                  value={form.senha}
                  onChange={handleChange}
                  minLength={6}
                  required
                  style={{
                    paddingLeft: 42,
                    paddingRight: 42
                  }}
                />

                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <p className="auth-erro">
                {erro}
              </p>
            )}

            <button
              className="btn-primary auth-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta como Gerente"}
            </button>

          </form>

          <p className="auth-link">
            Já possui conta? <Link to="/login">Entrar</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Cadastro;
