export const API_URL =
  import.meta.env?.VITE_API_URL ?? "http://localhost:8080";

const CLAVE_USUARIO = "facture_usuario";

let accessToken = null;
let renovacionEnCurso = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

// Datos NO sensibles del usuario (id, nombre, email, rol) para la interfaz
export function guardarUsuario(usuario) {
  sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function leerUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_USUARIO) || "null");
  } catch {
    return null;
  }
}

export function limpiarSesion() {
  accessToken = null;
  sessionStorage.removeItem(CLAVE_USUARIO);
}

function construirUrl(ruta) {
  return /^https?:\/\//.test(ruta) ? ruta : `${API_URL}${ruta}`;
}

/**
 * Pide un accessToken nuevo usando la cookie HttpOnly de refresh.
 * Si varias peticiones fallan a la vez, comparten una sola renovación.
 */
export function renovarToken() {
  if (!renovacionEnCurso) {
    renovacionEnCurso = fetch(construirUrl("/api/clientes/refresh"), {
      method: "POST",
      credentials: "include",
    })
      .then(async (respuesta) => {
        if (!respuesta || !respuesta.ok) {
          throw new Error("No se pudo renovar la sesión");
        }
        const datos = await respuesta.json();
        setAccessToken(datos.accessToken);
        return datos;
      })
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

/**
 * fetch con autenticación: agrega "Authorization: Bearer <token>" y
 * renueva el token automáticamente ante un 401.
 */
export async function apiFetch(ruta, opciones = {}, reintentar = true) {
  const url = construirUrl(ruta);
  const headers = { ...(opciones.headers || {}) };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const respuesta = await fetch(url, {
    ...opciones,
    headers,
    credentials: "include",
  });

  const esRutaDeAutenticacion =
    url.includes("/api/clientes/login") ||
    url.includes("/api/clientes/refresh");

  if (respuesta?.status === 401 && reintentar && !esRutaDeAutenticacion) {
    try {
      await renovarToken();
      return apiFetch(ruta, opciones, false);
    } catch {
      limpiarSesion();
      window.dispatchEvent(new Event("sesion-expirada"));
    }
  }

  return respuesta;
}

/** Extrae el campo "mensaje" de un cuerpo de error ya leído como texto. */
export function extraerMensaje(texto) {
  if (!texto) return "";
  try {
    const json = JSON.parse(texto);
    return json.mensaje || json.error || "";
  } catch {
    return texto.length < 200 ? texto : "";
  }
}