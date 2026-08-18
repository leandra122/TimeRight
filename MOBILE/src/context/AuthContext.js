import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/services';
import { setUnauthorizedHandler } from '../api/client';
import { clearSession, loadSession, saveSession } from '../storage/sessionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  useEffect(() => {
    let active = true;
    loadSession().then(async (stored) => {
      const valid = stored?.token && stored?.user?.role === 'USER' && stored.expiresAt > Date.now();
      if (active) setSession(valid ? stored : null);
      if (!valid && stored) await clearSession();
    }).finally(() => active && setRestoring(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login(email.trim().toLowerCase(), password);
    if (data.role !== 'USER') {
      await clearSession();
      throw new Error('Este aplicativo é exclusivo para clientes.');
    }
    const next = {
      token: data.token,
      expiresAt: Date.now() + Number(data.expiresIn || 0) * 1000,
      user: { id: data.userId, nome: data.nome, email: data.username, role: data.role },
    };
    await saveSession(next);
    setSession(next);
  }, []);

  const value = useMemo(() => ({ session, restoring, login, logout }), [session, restoring, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
