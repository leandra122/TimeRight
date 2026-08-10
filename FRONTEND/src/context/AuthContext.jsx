import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// --- Reducer ---
const initialState = {
  user: (() => {
    const salvo = localStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  })(),
  salao: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ATUALIZAR_PERFIL':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'LOGOUT':
      return { ...state, user: null };
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
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { user, salao } = state;

  useEffect(() => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user));
    } else {
      localStorage.removeItem('usuario');
    }
  }, [user]);

  const setUser = (usuario) => dispatch({ type: 'SET_USER', payload: usuario });
  const login = (usuario) => dispatch({ type: 'SET_USER', payload: usuario });
  const logout = () => dispatch({ type: 'LOGOUT' });
  const atualizarPerfil = (dados) => dispatch({ type: 'ATUALIZAR_PERFIL', payload: dados });
  const salvarSalao = (dados) => dispatch({ type: 'SALVAR_SALAO', payload: dados });
  const atualizarSalao = (dados) => dispatch({ type: 'ATUALIZAR_SALAO', payload: dados });
  const desativarSalao = () => dispatch({ type: 'DESATIVAR_SALAO' });

  return (
    <AuthContext.Provider
      value={{
        user,
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