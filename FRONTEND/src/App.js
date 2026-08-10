import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import DashboardAdmin from './pages/DashboardAdmin';
import CadastroSalao from './pages/CadastroSalao';
import Painel from './pages/Painel';
import DashboardCliente from './pages/DashboardCliente';
import Perfil from './pages/Perfil';
import Historico from './pages/Historico';
import AtualizarSalao from './pages/AtualizarSalao';
import GerenciarUsuarios from './pages/GerenciarUsuarios';

// 🔐 Rota protegida
const RotaProtegida = ({ children, tipo }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (tipo && user.tipo !== tipo) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Público */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RotaProtegida tipo="admin">
                <DashboardAdmin />
              </RotaProtegida>
            }
          />

          <Route
            path="/admin/cadastro-salao"
            element={
              <RotaProtegida tipo="admin">
                <CadastroSalao />
              </RotaProtegida>
            }
          />

          <Route
            path="/admin/painel"
            element={
              <RotaProtegida tipo="admin">
                <Painel />
              </RotaProtegida>
            }
          />

          <Route
            path="/admin/atualizar-salao"
            element={
              <RotaProtegida tipo="admin">
                <AtualizarSalao />
              </RotaProtegida>
            }
          />

          <Route
            path="/admin/usuario"
            element={
              <RotaProtegida tipo="admin">
                <GerenciarUsuarios />
              </RotaProtegida>
            }
          />

          {/* CLIENTE */}
          <Route
            path="/cliente"
            element={
              <RotaProtegida tipo="cliente">
                <DashboardCliente />
              </RotaProtegida>
            }
          />

          <Route
            path="/perfil"
            element={
              <RotaProtegida tipo="cliente">
                <Perfil />
              </RotaProtegida>
            }
          />

          <Route
            path="/historico"
            element={
              <RotaProtegida tipo="cliente">
                <Historico />
              </RotaProtegida>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;