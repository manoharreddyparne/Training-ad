// AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/profile")
      .then((response) => {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
        setLoading(false);
      });
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const loggedInUser = response.data.user;
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    const role = loggedInUser.role.trim().toLowerCase();
    navigate(role === "admin" ? "/admin" : "/dashboard");
    return response.data;
  };

  const logout = async () => {
    await api.get("/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
