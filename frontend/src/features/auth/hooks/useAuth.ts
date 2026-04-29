import { useState, useCallback } from "react";
import * as authApi from "../api/auth.api";
import type { UserPublic, UserIn } from "../types";

interface UseAuthReturn {
  // State
  user: UserPublic | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: UserIn) => Promise<void>;
  register: (data: UserIn) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const login = useCallback(async (credentials: UserIn) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.login(credentials);
      setError(null);
    } catch (err) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: UserIn) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}