import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import {
  apiFetch,
  renovarToken,
  guardarUsuario,
  limpiarSesion,
} from "./api.js";
import RutaProtegida from "./components/RutaProtegida.jsx";

import Navbar from "./components/Navbar.jsx";
import MarcaCard from "./components/MarcaCard.jsx";
import Portada from "./pages/Portada.jsx";

import NikeUrban from "./pages/nikeUrban.jsx";
import NikeSports from "./pages/nikeSports.jsx";
import Jordan from "./pages/jordan.jsx";

import Detalle from "./pages/detalle.jsx";
import Compra from "./pages/compra.jsx";
import Carrito from "./pages/carrito.jsx";

import Acceso from "./pages/acceso.jsx";
import Login from "./pages/login.jsx";
import Registro from "./pages/registro.jsx";

import Checkout from "./pages/checkout.jsx";
import CompraExitosa from "./pages/compraExitosa.jsx";
import MisPedidos from "./pages/misPedidos.jsx";

// NUEVA PÁGINA DE PERFIL
import MiPerfil from "./pages/miPerfil.jsx";

import Nosotros from "./pages/nosotros.jsx";
import Catalogo from "./pages/catalogo.jsx";
import Contacto from "./pages/contacto.jsx";
import Blogs from "./pages/blogs.jsx";

import AdminProductos from "./pages/adminProducto.jsx";
import AdminPedidos from "./pages/adminPedidos.jsx";
import AdminUsuarios from "./pages/adminUsuarios.jsx";

import "./styles/colecciones.css";

// NORMALIZAR DATOS DEL USUARIO
function normalizarUsuario(cliente) {
  return {
    id: cliente.id,
    nombre:
      cliente.nombre ??
      cliente.nombreCompleto ??
      "Cliente",
    email: cliente.email ?? "",
    rol: cliente.rol ?? "CLIENTE",
  };
}

// COLECCIONES DE ZAPATILLAS
function Inicio() {
  const marcas = [
    {
      nombre: "NIKE URBAN",
      imagen: "/img/logo/urb.jpg",
      fondo: "/img/logo/urb.jpg",
      ruta: "/nike-urban",
    },
    {
      nombre: "NIKE SPORTS",
      imagen: "/img/logo/descarga.jpg",
      fondo: "/img/logo/ney.jpg",
      ruta: "/nike-sports",
    },
    {
      nombre: "JORDAN",
      imagen: "/img/logo/ljordan.jpg",
      fondo: "/img/logo/njor.jpg",
      ruta: "/jordan",
    },
  ];

  return (
    <section
      id="colecciones"
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('/img/620e1b32aeecf.r_d.583-284-0.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px 0",
      }}
    >
      <div className="container my-5 text-center">
        <h2 className="fw-bold mb-5">
          Selecciona Cuál de Nuestras Marcas Quieres Ver
        </h2>

        <div className="row g-4 colecciones-react">
          {marcas.map((marca) => (
            <MarcaCard
              key={marca.nombre}
              nombre={marca.nombre}
              imagen={marca.imagen}
              fondo={marca.fondo}
              ruta={marca.ruta}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// PORTADA + COLECCIONES
function PaginaPrincipal({ usuario }) {
  return (
    <>
      <Portada usuario={usuario} />
      <Inicio />
    </>
  );
}

// PANEL PRINCIPAL DEL ADMINISTRADOR
function PanelAdmin() {
  const tarjetaBase = {
    display: "block",
    width: "260px",
    padding: "35px",
    background: "#171717",
    border: "1px solid #333",
    borderRadius: "12px",
    color: "#fff",
    textDecoration: "none",
    textAlign: "center",
  };

  return (
    <main
      style={{
        minHeight: "75vh",
        background: "#080808",
        color: "#fff",
        padding: "70px 20px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "#ff1744",
          letterSpacing: "3px",
          fontWeight: "bold",
        }}
      >
        FACTURE SNEAKERS
      </p>

      <h1
        style={{
          fontSize: "clamp(30px, 5vw, 48px)",
          fontWeight: "900",
          margin: "20px 0",
        }}
      >
        PANEL{" "}
        <span style={{ color: "#ff1744" }}>
          ADMINISTRADOR
        </span>
      </h1>

      <p
        style={{
          color: "#aaa",
          marginBottom: "40px",
        }}
      >
        Bienvenido al centro de administración
        de Facture Sneakers.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {/* PRODUCTOS */}
        <Link
          to="/admin/productos"
          style={{
            ...tarjetaBase,
            borderColor: "#ff1744",
          }}
        >
          <div style={{ fontSize: "38px" }}>👟</div>

          <h2
            style={{
              fontSize: "21px",
              margin: "15px 0",
            }}
          >
            PRODUCTOS
          </h2>

          <p style={{ color: "#bbb" }}>
            Agregar, editar y eliminar zapatillas.
          </p>

          <strong style={{ color: "#ff1744" }}>
            ADMINISTRAR →
          </strong>
        </Link>

        {/* PEDIDOS */}
        <Link
          to="/admin/pedidos"
          style={{
            ...tarjetaBase,
            borderColor: "#ff1744",
          }}
        >
          <div style={{ fontSize: "38px" }}>📦</div>

          <h2
            style={{
              fontSize: "21px",
              margin: "15px 0",
            }}
          >
            PEDIDOS
          </h2>

          <p style={{ color: "#bbb" }}>
            Consultar las compras de los clientes.
          </p>

          <strong style={{ color: "#ff1744" }}>
            ADMINISTRAR →
          </strong>
        </Link>

        {/* USUARIOS */}
        <Link
          to="/admin/usuarios"
          style={{
            ...tarjetaBase,
            borderColor: "#ff1744",
          }}
        >
          <div style={{ fontSize: "38px" }}>👥</div>

          <h2
            style={{
              fontSize: "21px",
              margin: "15px 0",
            }}
          >
            USUARIOS
          </h2>

          <p style={{ color: "#bbb" }}>
            Consultar clientes y administradores.
          </p>

          <strong style={{ color: "#ff1744" }}>
            ADMINISTRAR →
          </strong>
        </Link>
      </div>
    </main>
  );
}

// APLICACIÓN PRINCIPAL
function App() {
  const [usuario, setUsuario] = useState(null);

  const [verificandoSesion, setVerificandoSesion] =
    useState(true);

  const [cerrandoSesion, setCerrandoSesion] =
    useState(false);

  // RESTAURAR SESIÓN AL ABRIR O RECARGAR LA PÁGINA
  // El accessToken vive solo en memoria y se pierde al recargar. Con la
  // cookie HttpOnly de refresh se pide uno nuevo al backend; si la cookie
  // no existe o expiró, el usuario queda como visitante.
  useEffect(() => {
    let activo = true;

    renovarToken()
      .then((datos) => {
        if (!activo) return;
        const usuarioSeguro = normalizarUsuario(datos);
        guardarUsuario(usuarioSeguro);
        setUsuario(usuarioSeguro);
      })
      .catch(() => {
        if (!activo) return;
        limpiarSesion();
        setUsuario(null);
      })
      .finally(() => {
        if (activo) setVerificandoSesion(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // SI EL TOKEN NO SE PUEDE RENOVAR EN MEDIO DE LA NAVEGACIÓN
  useEffect(() => {
    const alExpirar = () => setUsuario(null);
    window.addEventListener("sesion-expirada", alExpirar);
    return () => window.removeEventListener("sesion-expirada", alExpirar);
  }, []);

  // INICIAR SESIÓN (el token ya fue guardado en memoria por login.jsx)
  const iniciarSesion = (cliente) => {
    const usuarioSeguro = normalizarUsuario(cliente);
    guardarUsuario(usuarioSeguro);
    setUsuario(usuarioSeguro);
  };

  // CERRAR SESIÓN: el backend revoca todos los tokens y borra la cookie
  const cerrarSesion = async () => {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);

    try {
      await apiFetch("/api/clientes/logout", { method: "POST" });
    } catch {
      // Aunque el servidor no responda, la sesión local se cierra igual
    } finally {
      limpiarSesion();
      setUsuario(null);
      setCerrandoSesion(false);
      window.location.assign("/");
    }
  };

  // PANTALLA DE CARGA
  if (verificandoSesion) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Verificando sesión...</p>
      </main>
    );
  }

  return (
    <>
      {/* BARRA DE NAVEGACIÓN */}
      <Navbar
        usuario={usuario}
        cerrarSesion={cerrarSesion}
      />

      <Routes>
        {/* INICIO */}
        <Route
          path="/"
          element={
            <PaginaPrincipal usuario={usuario} />
          }
        />

        {/* PORTADA */}
        <Route
          path="/portada"
          element={
            <Portada usuario={usuario} />
          }
        />

        {/* COLECCIONES */}
        <Route
          path="/nike-urban"
          element={<NikeUrban />}
        />

        <Route
          path="/nike-sports"
          element={<NikeSports />}
        />

        <Route
          path="/jordan"
          element={<Jordan />}
        />

        {/* CATÁLOGO */}
        <Route
          path="/catalogo"
          element={<Catalogo />}
        />

        {/* CARRITO */}
        <Route
          path="/carrito"
          element={<Carrito />}
        />

        {/* ACCESO */}
        <Route
          path="/acceso"
          element={<Acceso />}
        />

        <Route
          path="/login"
          element={
            <Login onLogin={iniciarSesion} />
          }
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        {/* NOSOTROS */}
        <Route
          path="/nosotros"
          element={<Nosotros />}
        />

        {/* CONTACTO */}
        <Route
          path="/contacto"
          element={<Contacto />}
        />

        {/* BLOGS */}
        <Route
          path="/blogs"
          element={<Blogs />}
        />

        {/* DETALLE */}
        <Route
          path="/detalle"
          element={<Detalle />}
        />

        {/* COMPRA */}
        <Route
          path="/compra"
          element={<Compra />}
        />

        {/* CHECKOUT: requiere sesión */}
        <Route
          path="/checkout"
          element={
            <RutaProtegida usuario={usuario}>
              <Checkout />
            </RutaProtegida>
          }
        />

        {/* COMPRA EXITOSA: requiere sesión */}
        <Route
          path="/compra-exitosa"
          element={
            <RutaProtegida usuario={usuario}>
              <CompraExitosa />
            </RutaProtegida>
          }
        />

        {/* MIS PEDIDOS: requiere sesión */}
        <Route
          path="/mis-pedidos"
          element={
            <RutaProtegida usuario={usuario}>
              <MisPedidos />
            </RutaProtegida>
          }
        />

        {/* MI PERFIL: requiere sesión */}
        <Route
          path="/mi-perfil"
          element={
            <RutaProtegida usuario={usuario}>
              <MiPerfil />
            </RutaProtegida>
          }
        />

        {/* PANEL ADMINISTRADOR: requiere rol ADMIN */}
        <Route
          path="/admin"
          element={
            <RutaProtegida usuario={usuario} rol="ADMIN">
              <PanelAdmin />
            </RutaProtegida>
          }
        />

        {/* GESTIÓN DE PRODUCTOS: requiere rol ADMIN */}
        <Route
          path="/admin/productos"
          element={
            <RutaProtegida usuario={usuario} rol="ADMIN">
              <AdminProductos />
            </RutaProtegida>
          }
        />

        {/* GESTIÓN DE PEDIDOS: requiere rol ADMIN */}
        <Route
          path="/admin/pedidos"
          element={
            <RutaProtegida usuario={usuario} rol="ADMIN">
              <AdminPedidos />
            </RutaProtegida>
          }
        />

        {/* GESTIÓN DE USUARIOS: requiere rol ADMIN */}
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida usuario={usuario} rol="ADMIN">
              <AdminUsuarios />
            </RutaProtegida>
          }
        />
      </Routes>

      {/* PIE DE PÁGINA */}
      <footer className="bg-dark text-white text-center py-3">
        <p className="mb-0">
          © 2026 FACTURE SNEAKERS.
          TODOS LOS DERECHOS RESERVADOS.
        </p>
      </footer>
    </>
  );
}

export default App;