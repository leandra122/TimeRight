import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Cadastro = lazy(() => import('./pages/Cadastro'));
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'));
const Painel = lazy(() => import('./pages/Painel'));
const DashboardCliente = lazy(() => import('./pages/DashboardCliente'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Historico = lazy(() => import('./pages/Historico'));
const AtualizarSalao = lazy(() => import('./pages/AtualizarSalao'));
const GerenciarUsuarios = lazy(() => import('./pages/GerenciarUsuarios'));
const GerenciarFuncionarios = lazy(() => import('./pages/GerenciarFuncionarios'));
const CadastroSalaoGerente = lazy(() => import('./pages/CadastroSalaoGerente'));

const RotaProtegida = ({ children, tipo }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // USER não acessa o sistema WEB
  if (user.tipo === 'cliente') return <Navigate to="/login" replace />;
  if (tipo && user.tipo !== tipo) return <Navigate to="/admin" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            <Route path="/admin" element={<RotaProtegida tipo="admin"><DashboardAdmin /></RotaProtegida>} />
            <Route path="/admin/painel" element={<RotaProtegida tipo="admin"><Painel /></RotaProtegida>} />
            <Route path="/admin/atualizar-salao" element={<RotaProtegida tipo="admin"><AtualizarSalao /></RotaProtegida>} />
            <Route path="/admin/usuario" element={<RotaProtegida tipo="admin"><GerenciarUsuarios /></RotaProtegida>} />
            <Route path="/admin/funcionarios" element={<RotaProtegida tipo="admin"><GerenciarFuncionarios /></RotaProtegida>} />

            <Route path="/manager" element={<RotaProtegida tipo="manager"><DashboardAdmin /></RotaProtegida>} />
            <Route path="/manager/cadastro-salao" element={<RotaProtegida tipo="manager"><CadastroSalaoGerente /></RotaProtegida>} />
            <Route path="/manager/painel" element={<RotaProtegida tipo="manager"><Painel /></RotaProtegida>} />
            <Route path="/manager/funcionarios" element={<RotaProtegida tipo="manager"><GerenciarFuncionarios /></RotaProtegida>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
