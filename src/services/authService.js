// Simple auth service to handle login against backend API
const API_BASE = ""; // use CRA proxy in development

async function login(usuario, contrasena) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ usuario, contrasena }),
  });
  if (!res.ok) {
    let message = "Error de autenticación";
    try {
      const data = await res.json();
      if (data && (data.detail || data.message))
        message = data.detail || data.message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  const data = await res.json();
  // Expected: { id_negocio: number, nombre: string }
  if (!data || typeof data.id_negocio === "undefined") {
    throw new Error("Respuesta inválida del servidor");
  }
  return data;
}

const authService = { login };
export default authService;
