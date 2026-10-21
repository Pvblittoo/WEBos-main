
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login({ onLogin }) {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setExito(false);
    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://localhost:8080/api/clientes/login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            contrasena: contrasena,
          }),
        }
      );

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error(
            "Correo o contraseña incorrectos."
          );
        }

        throw new Error(
          "No se pudo iniciar sesión. Inténtalo nuevamente."
        );
      }

      const cliente = await respuesta.json();

      // Guardar datos básicos del usuario
      const usuario = {
        id: cliente.id,
        nombre: cliente.nombreCompleto,
        email: cliente.email,
        rol: cliente.rol,
      };

      sessionStorage.setItem(
        "facture_usuario",
        JSON.stringify(usuario)
      );

      // Actualizar estado global de App.jsx
      if (typeof onLogin === "function") {
        onLogin(cliente);
      }

      setExito(true);
      setMensaje("¡Inicio de sesión exitoso!");

      setTimeout(() => {
        if (cliente.rol === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1000);

    } catch (error) {

      setExito(false);

      if (error instanceof TypeError) {
        setMensaje(
          "No se pudo conectar con Spring Boot. Revisa que esté encendido."
        );
      } else {
        setMensaje(error.message);
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="main-wrapper">

      {/* LOGO Y NOMBRE */}
      <div className="brand-header">
        <div className="brand-logo-box">
          <img
            src="/img/logo/lgo.png"
            alt="Logo Facture Sneakers"
            className="brand-logo-img"
          />
        </div>

        <h1 className="brand-name">
          Facture Sneakers
        </h1>
      </div>

      {/* TARJETA DE INICIO DE SESIÓN (grid de Bootstrap) */}
      <div className="container">
      <div className="row justify-content-center">
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <div className="custom-card mx-auto">

        <h2 className="form-title">
          INICIO DE SESIÓN
        </h2>

        <form onSubmit={handleSubmit}>

          {/* CORREO */}
          <div className="field-group">
            <label htmlFor="correo">
              CORREO
            </label>

            <input
              type="email"
              id="correo"
              className="form-control custom-input"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Ingresa tu correo"
              autoComplete="email"
              required
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="field-group">
            <label htmlFor="password">
              CONTRASEÑA
            </label>

            <input
              type="password"
              id="password"
              className="form-control custom-input"
              value={contrasena}
              onChange={(e) =>
                setContrasena(e.target.value)
              }
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          {/* BOTONES */}
          <div className="d-grid gap-2 mt-4">

            <button
              type="submit"
              className="btn-red-submit"
              disabled={cargando}
            >
              {cargando
                ? "INICIANDO SESIÓN..."
                : "INICIAR SESIÓN"}
            </button>

            <Link
              to="/acceso"
              className="btn-back"
            >
              ← VOLVER ATRÁS
            </Link>
          </div>

          {/* MENSAJES */}
          {mensaje && (
            <p
              role="status"
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontWeight: "bold",
                color: exito
                  ? "#00e676"
                  : "#ff4444",
              }}
            >
              {mensaje}
            </p>
          )}

        </form>
      </div>
      </div>
      </div>
      </div>
    </main>
  );
}
