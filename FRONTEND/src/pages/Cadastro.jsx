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
    senha: '',
    tipo: 'manager'
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

  const handleTipo = (tipo) => {
    setForm({
      ...form,
      tipo
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro('');
    setLoading(true);

    // IDs corretos do banco
    // 1 = adm
    // 2 = manager
    // 3 = user

    const nivelAcessoId =
      form.tipo === 'admin'
        ? 1
        : form.tipo === 'manager'
        ? 2
        : 3;

    const payload = {
      nome: form.nome,
      username: form.email,
      password: form.senha,
      statusUsuario: "ATIVO",
      nivelAcesso: {
        id: nivelAcessoId
      }
    };

    console.log("Enviando:", payload);

    try {
      const response = await fetch("http://localhost:8080/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      console.log("Resposta:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Erro ao cadastrar usuário."
        );
      }

      if (form.tipo === "admin") {
        navigate("/admin");
      } else {
        navigate("/manager");
      }

    } catch (err) {
      console.error(err);
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tipos = [
    { key: "manager", label: "Gerente" },
    { key: "admin", label: "Administrador" }
  ];

  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-container">
        <div className="auth-card card">

          <div className="auth-header">
            <div className="auth-logo">
              <Scissors size={24} />
            </div>

            <h2>Criar sua conta</h2>
            <p>Preencha os dados abaixo para começar</p>
          </div>

          <div className="tipo-selector">
            {tipos.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`tipo-btn ${form.tipo === t.key ? "ativo" : ""}`}
                onClick={() => handleTipo(t.key)}
              >
                {t.label}
              </button>
            ))}
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
              {loading
                ? "Criando conta..."
                : `Criar conta como ${
                    form.tipo === "admin"
                      ? "Administrador"
                      : form.tipo === "manager"
                      ? "Gerente"
                      : "Cliente"
                  }`}
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