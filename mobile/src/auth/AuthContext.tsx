import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { authService } from '@/services/authService';
import type { AuthStatus, LoginCredentials } from '@/types/auth';
import type { User } from '@/types/user';

import { tokenStorage } from './tokenStorage';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  // Inicia sesión contra Laravel y guarda el token. Lanza el error de la API si falla.
  signIn: (credentials: LoginCredentials) => Promise<User>;
  // Cierra la sesión en el servidor (best effort) y en el teléfono.
  signOut: () => Promise<void>;
  // Vuelve a pedir /me (p. ej., después de editar el propio usuario).
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setStatus('unauthenticated');
    await tokenStorage.remove();
  }, []);

  // Al abrir la app: si hay un token guardado, se valida con /me.
  useEffect(() => {
    let cancelado = false;

    async function restaurarSesion() {
      const token = await tokenStorage.get();
      if (!token) {
        if (!cancelado) setStatus('unauthenticated');
        return;
      }

      setAuthToken(token);
      try {
        const me = await authService.me();
        if (!cancelado) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        // Token inválido o servidor caído: se pide iniciar sesión de nuevo.
        if (!cancelado) await clearSession();
      }
    }

    restaurarSesion();
    return () => {
      cancelado = true;
    };
  }, [clearSession]);

  // Si cualquier petición devuelve 401, la sesión ya no sirve.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const { token, user: usuario } = await authService.login(credentials);
    await tokenStorage.set(token);
    setAuthToken(token);
    setUser(usuario);
    setStatus('authenticated');
    return usuario;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Aunque falle la red, la sesión local se cierra igual.
    }
    await clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const me = await authService.me();
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signOut, refreshUser }),
    [status, user, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return context;
}
