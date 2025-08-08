// Componente de rota privada - protege páginas que requerem autenticação
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Exibe loading enquanto verifica autenticação
  if (loading) return <div>Carregando...</div>;
  
  // Se usuário logado, renderiza conteúdo; senão redireciona para login
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;