import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// --- Reducer ---
function initialState() {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('usuario'));
    if (token && ['admin', 'manager', 'employee'].includes(user?.tipo)) {
      return { user, token, salao: null };
    }
  } catch { /* Invalid local session must allow public access. */ }
  return { user: null, token: null, salao: null };
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.user, token: action.payload.token };
    case 'ATUALIZAR_PERFIL':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      return { ...state, user: null, token: null, salao: null };
    case 'SALVAR_SALAO':
      return { ...state, salao: { ...action.payload, ativo: true } };
    case 'ATUALIZAR_SALAO':
      return { ...state, salao: { ...state.salao, ...action.payload } };
    case 'DESATIVAR_SALAO':
      return { ...state, salao: state.salao ? { ...state.salao, ativo: false } : null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, initialState);
  const { user, token, salao } = state;

  useEffect(() => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
    } else {
      localStorage.removeItem('usuario');
    }
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [user, token]);

  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('timeright:session-expired', handleSessionExpired);
    return () => window.removeEventListener('timeright:session-expired', handleSessionExpired);
  }, []);

  const setUser = (usuario, authToken = token) => dispatch({
    type: 'SET_USER',
    payload: { user: usuario, token: authToken },
  });
  const login = (usuario, authToken) => {
    // Disponível para as requisições da página de destino antes dos efeitos React.
    localStorage.setItem('token', authToken);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    dispatch({ type: 'SET_USER', payload: { user: usuario, token: authToken } });
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    dispatch({ type: 'LOGOUT' });
  };
  const atualizarPerfil = (dados) => dispatch({ type: 'ATUALIZAR_PERFIL', payload: dados });
  const salvarSalao = (dados) => dispatch({ type: 'SALVAR_SALAO', payload: dados });
  const atualizarSalao = (dados) => dispatch({ type: 'ATUALIZAR_SALAO', payload: dados });
  const desativarSalao = () => dispatch({ type: 'DESATIVAR_SALAO' });

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        login,
        logout,
        atualizarPerfil,
        salao,
        salvarSalao,
        atualizarSalao,
        desativarSalao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
