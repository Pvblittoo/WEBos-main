
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/registro.css";

const regiones = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica", "Huara"],
  "Antofagasta": ["Antofagasta", "Calama", "Mejillones", "Tocopilla", "San Pedro de Atacama"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Vallenar", "Chañaral"],
  "Coquimbo": ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Vicuña"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio", "Quillota"],
  "Metropolitana": [
    "Santiago", "La Pintana", "Puente Alto", "La Florida",
    "Maipú", "San Bernardo", "La Granja", "El Bosque",
    "La Cisterna", "San Ramón", "Ñuñoa", "Providencia",
    "Las Condes", "Pudahuel", "Estación Central",
    "Peñalolén", "Recoleta", "Independencia", "Quilicura"
  ],
  "O'Higgins": ["Rancagua", "Machalí", "Rengo", "San Fernando", "Santa Cruz"],
  "Maule": ["Talca", "Curicó", "Linares", "Cauquenes", "Constitución"],
  "Ñuble": ["Chillán", "Chillán Viejo", "San Carlos", "Bulnes", "Quirihue"],
  "Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "Coronel", "San Pedro de la Paz"],
  "La Araucanía": ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol"],
  "Los Ríos": ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"],
  "Los Lagos": ["Puerto Montt", "Puerto Varas", "Osorno", "Castro", "Ancud"],
  "Aysén": ["Coyhaique", "Puerto Aysén", "Chile Chico", "Cochrane"],
  "Magallanes": ["Punta Arenas", "Puerto Natales", "Porvenir", "Puerto Williams"]
};

const regionIds = {
  "Arica y Parinacota": "arica-y-parinacota",
  "Tarapacá": "tarapaca",
  "Antofagasta": "antofagasta",
  "Atacama": "atacama",
  "Coquimbo": "coquimbo",
  "Valparaíso": "valparaiso",
  "Metropolitana": "rm",
  "O'Higgins": "ohiggins",
  "Maule": "maule",
  "Ñuble": "nuble",
  "Biobío": "biobio",
  "La Araucanía": "araucania",
  "Los Ríos": "los-rios",
  "Los Lagos": "los-lagos",
  "Aysén": "aysen",
  "Magallanes": "magallanes"
};

const formularioInicial = {
  nombre: "",
  correo: "",
  confirmarCorreo: "",
  password: "",
  confirmarPassword: "",
  telefono: "",
  region: "",
  comuna: ""
};

function Registro() {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("error");
  const [cargando, setCargando] = useState(false);

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "region" ? { comuna: "" } : {})
    }));
  }

  function mostrarError(texto) {
    setTipoMensaje("error");
    setMensaje(texto);
  }

  async function registrarUsuario(evento) {
    evento.preventDefault();
    setMensaje("");

    const correo = formulario.correo.trim().toLowerCase();
    const confirmarCorreo = formulario.confirmarCorreo.trim().toLowerCase();

    if (!formulario.nombre.trim()) {
      mostrarError("Debes ingresar tu nombre completo.");
      return;
    }

    if (correo !== confirmarCorreo) {
      mostrarError("Los correos electrónicos no coinciden.");
      return;
    }

    if (formulario.password !== formulario.confirmarPassword) {
      mostrarError("Las contraseñas no coinciden.");
      return;
    }

    if (
      formulario.password.length < 8 ||
      formulario.password.length > 10
    ) {
      mostrarError("La contraseña debe tener entre 8 y 10 caracteres.");
      return;
    }

    if (!formulario.region || !formulario.comuna) {
      mostrarError("Debes seleccionar una región y una comuna.");
      return;
    }

    const comunaId = formulario.comuna
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    const nuevoCliente = {
      nombreCompleto: formulario.nombre.trim(),
      email: correo,
      contrasena: formulario.password,
      numero: formulario.telefono.trim(),
      region: regionIds[formulario.region],
      comuna: comunaId
    };

    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://localhost:8080/api/clientes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(nuevoCliente)
        }
      );

      if (!respuesta.ok) {
        let detalle = "";

        try {
          const respuestaError = await respuesta.json();
          detalle =
            respuestaError.message ||
            respuestaError.error ||
            "";
        } catch {
          // El backend no devolvió un JSON de error.
        }

        throw new Error(
          detalle || `Error del servidor (${respuesta.status})`
        );
      }

      setTipoMensaje("exito");
      setMensaje("¡Registro exitoso! Ya puedes iniciar sesión.");
      setFormulario({ ...formularioInicial });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      mostrarError(
        error.message === "Failed to fetch"
          ? "No se pudo conectar con Spring Boot. Revisa el backend o la configuración CORS."
          : error.message
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="registro-page">
      <div className="main-wrapper">
        <div className="custom-card">
          <h2 className="form-title">
            REGISTRO DE USUARIO
          </h2>

          <form id="form-registro" onSubmit={registrarUsuario}>
            <div className="field-group">
              <label htmlFor="nombre">NOMBRE COMPLETO</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="custom-input"
                placeholder="Ej. Juan Pérez"
                value={formulario.nombre}
                onChange={actualizarCampo}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="correo">CORREO</label>
              <input
                type="email"
                id="correo"
                name="correo"
                className="custom-input"
                placeholder="usuario@dominio.com"
                value={formulario.correo}
                onChange={actualizarCampo}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="confirmar-correo">
                CONFIRMAR CORREO
              </label>
              <input
                type="email"
                id="confirmar-correo"
                name="confirmarCorreo"
                className="custom-input"
                placeholder="Reingresa tu correo"
                value={formulario.confirmarCorreo}
                onChange={actualizarCampo}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">CONTRASEÑA</label>
              <input
                type="password"
                id="password"
                name="password"
                className="custom-input"
                placeholder="Entre 8 y 10 caracteres"
                minLength={8}
                maxLength={10}
                value={formulario.password}
                onChange={actualizarCampo}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="confirmar-password">
                CONFIRMAR CONTRASEÑA
              </label>
              <input
                type="password"
                id="confirmar-password"
                name="confirmarPassword"
                className="custom-input"
                placeholder="Reingresa tu contraseña"
                minLength={8}
                maxLength={10}
                value={formulario.confirmarPassword}
                onChange={actualizarCampo}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="telefono">
                TELÉFONO (OPCIONAL)
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                className="custom-input"
                placeholder="+56 9 1234 5678"
                value={formulario.telefono}
                onChange={actualizarCampo}
              />
            </div>

            <div className="row-selects">
              <div className="select-box">
                <label htmlFor="region">REGIÓN</label>
                <select
                  id="region"
                  name="region"
                  className="btn-red-select"
                  value={formulario.region}
                  onChange={actualizarCampo}
                  required
                >
                  <option value="">
                    -- Selecciona una región --
                  </option>

                  {Object.keys(regiones).map((region) => (
                    <option key={region} value={region}>
                      {region === "Metropolitana"
                        ? "Región Metropolitana de Santiago"
                        : region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-box">
                <label htmlFor="comuna">COMUNA</label>
                <select
                  id="comuna"
                  name="comuna"
                  className="btn-red-select"
                  value={formulario.comuna}
                  onChange={actualizarCampo}
                  disabled={!formulario.region}
                  required
                >
                  <option value="">
                    -- Selecciona una comuna --
                  </option>

                  {formulario.region &&
                    regiones[formulario.region].map((comuna) => (
                      <option key={comuna} value={comuna}>
                        {comuna}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {mensaje && (
              <p
                role="alert"
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color:
                    tipoMensaje === "exito"
                      ? "#22c55e"
                      : "#ff4444"
                }}
              >
                {mensaje}
              </p>
            )}

            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn-red-submit"
                disabled={cargando}
              >
                {cargando ? "REGISTRANDO..." : "REGISTRAR"}
              </button>

              <Link to="/acceso" className="btn-back">
                ← VOLVER ATRÁS
              </Link>

              {tipoMensaje === "exito" && mensaje && (
                <p style={{ marginTop: "16px" }}>
                  <Link to="/login" style={{ color: "#ff3333" }}>
                    Ir a iniciar sesión
                  </Link>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Registro;

