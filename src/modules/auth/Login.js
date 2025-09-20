import React, { useState } from "react";
import authService from "../../services/authService";
import "./Login.css";

const Login = ({ onSuccess }) => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!usuario.trim() || !contrasena.trim()) {
      setError("Por favor ingresa usuario y contraseña");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(usuario.trim(), contrasena.trim());
      if (typeof onSuccess === "function") {
        onSuccess(data);
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">🍽️ Restaurante - Acceso</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Usuario</label>
          <input
            className="login-input"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            disabled={loading}
            placeholder="tu_usuario"
          />

          <label className="login-label">Contraseña</label>
          <input
            className="login-input"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
            placeholder="••••••••"
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
