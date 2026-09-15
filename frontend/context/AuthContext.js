"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMe = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  const register = async (data) => {
    const response = await api.post("/auth/register", data);
    setUser(response.data.user);
    return response.data;
  };

  const login = async (data) => {
    const response = await api.post("/auth/login", data);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);