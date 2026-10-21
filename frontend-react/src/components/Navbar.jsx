
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/navbar.css";

function Navbar({ usuario, cerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const perfilRef = useRef(null);

  // CERRAR LOS MENÚS
  const cerrarMenu = () => {
    setMenuAbierto(false);
    setPerfilAbierto(false);
  };

  // CERRAR SESIÓN
  const handleCerrarSesion = async () => {
    cerrarMenu();
    await cerrarSesion();
  };

  // CERRAR EL PERFIL AL HACER CLIC FUERA
  useEffect(() => {
    const cerrarAlHacerClicFuera = (event) => {
      if (
        perfilRef.current &&
        !perfilRef.current.contains(event.target)
      ) {
        setPerfilAbierto(false);
      }
    };

    // CERRAR CON ESCAPE
    const cerrarConEscape = (event) => {
      if (event.key === "Escape") {
        setPerfilAbierto(false);
      }
    };

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClicFuera
    );

    document.addEventListener(
      "keydown",
      cerrarConEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClicFuera
      );

      document.removeEventListener(
        "keydown",
        cerrarConEscape
      );
    };
  }, []);

  return (
    <header id="site-navbar">
      <div className="site-navbar-inner">

        {/* LOGO ORIGINAL */}
        <Link
          className="site-navbar-brand"
          to="/"
          onClick={cerrarMenu}
        >
          <img
            src="/img/logo/lgo.png"
            alt="Facture Sneakers"
          />
        </Link>

        {/* BOTÓN PARA CELULARES */}
        <button
          type="button"
          className="site-navbar-toggle"
          aria-label="Abrir o cerrar menú"
          aria-expanded={menuAbierto}
          aria-controls="site-menu"
          onClick={() => {
            setMenuAbierto(!menuAbierto);
            setPerfilAbierto(false);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* MENÚ PRINCIPAL */}
        <nav
          id="site-menu"
          className={`site-navbar-menu ${
            menuAbierto ? "is-open" : ""
          }`}
        >

          {/* INICIO */}
          <NavLink
            to="/"
            end
            onClick={cerrarMenu}
          >
            Inicio
          </NavLink>

          {/* NOSOTROS */}
          <NavLink
            to="/nosotros"
            onClick={cerrarMenu}
          >
            Nosotros
          </NavLink>

          {/* BLOGS */}
          <NavLink
            to="/blogs"
            onClick={cerrarMenu}
          >
            Blogs
          </NavLink>

          {/* CONTACTO */}
          <NavLink
            to="/contacto"
            onClick={cerrarMenu}
          >
            Contacto
          </NavLink>

          {/* CATÁLOGO */}
          <NavLink
            to="/catalogo"
            onClick={cerrarMenu}
          >
            Catálogo
          </NavLink>

          {/* CARRITO */}
          <NavLink
            to="/carrito"
            className="site-navbar-cart"
            onClick={cerrarMenu}
          >
            Carrito
          </NavLink>

          {/* USUARIO CON SESIÓN INICIADA */}
          {usuario ? (
            <div
              className="site-navbar-profile"
              ref={perfilRef}
            >

              {/* BOTÓN DEL PERFIL */}
              <button
                type="button"
                className="site-navbar-profile-button"
                aria-expanded={perfilAbierto}
                aria-haspopup="true"
                onClick={() => {
                  setPerfilAbierto(!perfilAbierto);
                }}
              >
                <span className="site-navbar-profile-icon">
                  👤
                </span>

                <span>
                  Hola, {usuario.nombre || "Cliente"}
                </span>

                <span aria-hidden="true">
                  {perfilAbierto ? "▴" : "▾"}
                </span>
              </button>

              {/* MENÚ DESPLEGABLE */}
              {perfilAbierto && (
                <div className="site-navbar-dropdown">

                  {/* ENCABEZADO */}
                  <div className="site-navbar-dropdown-header">
                    <strong>MI CUENTA</strong>

                    <small>
                      {usuario.email ||
                        "Facture Sneakers"}
                    </small>
                  </div>

                  {/* MI PERFIL */}
                  <Link
                    to="/mi-perfil"
                    onClick={cerrarMenu}
                  >
                    👤 Mi perfil
                  </Link>

                  {/* MIS COMPRAS */}
                  <Link
                    to="/mis-pedidos"
                    onClick={cerrarMenu}
                  >
                    📦 Mis compras
                  </Link>

                  {/* SOLO ADMINISTRADORES */}
                  {usuario.rol === "ADMIN" && (
                    <Link
                      to="/admin"
                      onClick={cerrarMenu}
                    >
                      ⚙️ Panel administrador
                    </Link>
                  )}

                  {/* SEPARADOR */}
                  <div className="site-navbar-dropdown-divider" />

                  {/* CERRAR SESIÓN */}
                  <button
                    type="button"
                    className="site-navbar-dropdown-logout"
                    onClick={handleCerrarSesion}
                  >
                    🚪 Cerrar sesión
                  </button>

                </div>
              )}
            </div>
          ) : (

            /* USUARIO SIN SESIÓN */
            <NavLink
              to="/acceso"
              onClick={cerrarMenu}
            >
              Iniciar sesión
            </NavLink>

          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
