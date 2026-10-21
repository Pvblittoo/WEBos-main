
import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

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

const API = "http://localhost:8080";

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

// ACCESO DENEGADO
function AccesoDenegado() {
  return (
    <main
      className="container py-5 text-white"
      style={{ minHeight: "70vh" }}
    >
      <h2 style={{ color: "#ff1744" }}>
        ACCESO DENEGADO
      </h2>

      <p>
        No tienes permisos para entrar a esta página.
      </p>

      <Link to="/" style={{ color: "#ff1744" }}>
        VOLVER AL INICIO
      </Link>
    </main>
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

  // COMPROBAR SESIÓN REAL AL ABRIR LA APP
  useEffect(() => {
    let activo = true;

    const comprobarSesion = async () => {
      try {
        const respuesta = await fetch(
          `${API}/api/clientes/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!respuesta.ok) {
          throw new Error("Sesión no válida");
        }

        const cliente = await respuesta.json();

        const usuarioSeguro =
          normalizarUsuario(cliente);

        if (activo) {
          sessionStorage.setItem(
            "facture_usuario",
            JSON.stringify(usuarioSeguro)
          );

          setUsuario(usuarioSeguro);
        }
      } catch {
        if (activo) {
          sessionStorage.removeItem(
            "facture_usuario"
          );

          setUsuario(null);
        }
      } finally {
        if (activo) {
          setVerificandoSesion(false);
        }
      }
    };

    comprobarSesion();

    return () => {
      activo = false;
    };
  }, []);

  // INICIAR SESIÓN
  const iniciarSesion = (cliente) => {
    const usuarioSeguro =
      normalizarUsuario(cliente);

    sessionStorage.setItem(
      "facture_usuario",
      JSON.stringify(usuarioSeguro)
    );

    setUsuario(usuarioSeguro);
  };

  // CERRAR SESIÓN
  const cerrarSesion = async () => {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);

    try {
      const respuesta = await fetch(
        `${API}/api/clientes/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo cerrar la sesión"
        );
      }

      sessionStorage.removeItem(
        "facture_usuario"
      );

      setUsuario(null);

      window.location.assign("/");
    } catch (error) {
      alert(
        "No se pudo cerrar la sesión en el servidor. " +
        "Inténtalo nuevamente."
      );
    } finally {
      setCerrandoSesion(false);
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

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* COMPRA EXITOSA */}
        <Route
          path="/compra-exitosa"
          element={<CompraExitosa />}
        />

        {/* MIS PEDIDOS */}
        <Route
          path="/mis-pedidos"
          element={
            usuario ? (
              <MisPedidos />
            ) : (
              <AccesoDenegado />
            )
          }
        />

        {/* NUEVO: MI PERFIL */}
        <Route
          path="/mi-perfil"
          element={
            usuario ? (
              <MiPerfil />
            ) : (
              <AccesoDenegado />
            )
          }
        />

        {/* PANEL ADMINISTRADOR */}
        <Route
          path="/admin"
          element={
            usuario?.rol === "ADMIN" ? (
              <PanelAdmin />
            ) : (
              <AccesoDenegado />
            )
          }
        />

        {/* GESTIÓN DE PRODUCTOS */}
        <Route
          path="/admin/productos"
          element={
            usuario?.rol === "ADMIN" ? (
              <AdminProductos />
            ) : (
              <AccesoDenegado />
            )
          }
        />

        {/* GESTIÓN DE PEDIDOS */}
        <Route
          path="/admin/pedidos"
          element={
            usuario?.rol === "ADMIN" ? (
              <AdminPedidos />
            ) : (
              <AccesoDenegado />
            )
          }
        />

        {/* GESTIÓN DE USUARIOS */}
        <Route
          path="/admin/usuarios"
          element={
            usuario?.rol === "ADMIN" ? (
              <AdminUsuarios />
            ) : (
              <AccesoDenegado />
            )
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
