import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';
import './DashboardAdmin.css';

const AtualizarSalao = () => {
  const { salao, atualizarSalao } = useAuth();
  const [form, setForm] = useState({
    nome: salao?.nome || '',
    endereco: salao?.endereco || '',
    cidade: salao?.cidade || '',
    telefone: salao?.telefone || '',
    descricao: salao?.descricao || '',
    servicos: salao?.servicos || '',
    horario: salao?.horario || '',
  });
  const [salvo, setSalvo] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSalvar = (e) => {
    e.preventDefault();
    atualizarSalao(form);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Atualizar Salão</h1>
          <p>Edite as informações do seu estabelecimento</p>
        </div>

        {!salao && (
          <div className="aviso-unico-cadastro">Nenhum salão cadastrado ainda. Cadastre primeiro em "Cadastrar Salão".</div>
        )}

        {salvo && <div className="msg-sucesso">Dados do salão atualizados com sucesso!</div>}

        <div className="card admin-card">
          <form onSubmit={handleSalvar} className="salao-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nome do Salão</label>
                <input type="text" name="nome" placeholder="Ex: Salão da Maria" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="tel" name="telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input type="text" name="endereco" placeholder="Rua, número, bairro" value={form.endereco} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cidade</label>
                <input type="text" name="cidade" placeholder="Sua cidade" value={form.cidade} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Horário de Funcionamento</label>
                <input type="text" name="horario" placeholder="Ex: Seg-Sex 9h às 19h" value={form.horario} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Serviços Oferecidos</label>
              <input type="text" name="servicos" placeholder="Ex: Corte, Escova, Manicure" value={form.servicos} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Descrição do Salão</label>
              <textarea name="descricao" placeholder="Conte um pouco sobre seu salão..." value={form.descricao} onChange={handleChange} rows={3} />
            </div>
            <button type="submit" className="btn-primary">
              <Save size={16} />Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AtualizarSalao;
