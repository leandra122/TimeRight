// Componente de rota administrativa - protege páginas exclusivas para admins
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Exibe loading enquanto verifica autenticação
  if (loading) return <div>Carregando...</div>;
  
  // Se usuário é admin, renderiza conteúdo; senão redireciona para home
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

export default AdminRoute;