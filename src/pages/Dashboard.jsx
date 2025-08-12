import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usersAPI } from '../api/api';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Dashboard</h1>
        
        <div className="welcome-section">
          <h2>Bem-vindo, {user.name}!</h2>
          <p>Email: {user.email}</p>
          <p>Tipo: {user.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
        </div>

        {isAdmin && (
          <div className="admin-section">
            <h3>Painel Administrativo</h3>
            
            <div className="users-section">
              <h4>Usuários Cadastrados</h4>
              
              {loading ? (
                <p>Carregando usuários...</p>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Data de Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="user-section">
            <h3>Área do Usuário</h3>
            <p>Funcionalidades básicas disponíveis em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;