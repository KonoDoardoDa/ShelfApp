import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./auth-context";
import { authService } from "../services/authService";
import type { User, LoginCredentials } from "../types/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
    setToken(null);
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, []);

  // Verificar validade do token ao inicializar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
        authService.setSession(storedToken, currentUser);
      } catch (err) {
        console.warn("Sessão expirada ou token inválido:", err);
        authService.clearSession();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(credentials);
      setUser(authData.usuario);
      setToken(authData.token);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
