
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../src/components/Navbar.jsx";

const cliente = {
  id: 1,
  nombre: "Juana",
  email: "cliente@ejemplo.com",
  rol: "CLIENTE",
};

const administrador = {
  id: 2,
  nombre: "Administrador",
  email: "admin@ejemplo.com",
  rol: "ADMIN",
};

function mostrarNavbar(usuario = null, cerrarSesion = async () => {}) {
  return render(
    <MemoryRouter>
      <Navbar
        usuario={usuario}
        cerrarSesion={cerrarSesion}
      />
    </MemoryRouter>
  );
}

describe("Facture Sneakers - Navbar", () => {
  afterEach(() => {
    cleanup();
  });

  // PRUEBA 1
  it("debe mostrar el logo de Facture Sneakers", () => {
    mostrarNavbar();

    const logo = screen.getByAltText("Facture Sneakers");

    expect(logo).not.toBeNull();
    expect(logo.getAttribute("src")).toBe("/img/logo/lgo.png");
  });

  // PRUEBA 2
  it("debe mostrar los enlaces principales", () => {
    mostrarNavbar();

    expect(screen.getByText("Inicio")).not.toBeNull();
    expect(screen.getByText("Nosotros")).not.toBeNull();
    expect(screen.getByText("Blogs")).not.toBeNull();
    expect(screen.getByText("Contacto")).not.toBeNull();
    expect(screen.getByText("Catálogo")).not.toBeNull();
    expect(screen.getByText("Carrito")).not.toBeNull();
  });

  // PRUEBA 3
  it("debe mostrar iniciar sesión si no hay usuario", () => {
    mostrarNavbar();

    expect(screen.getByText("Iniciar sesión")).not.toBeNull();
  });

  // PRUEBA 4
  it("debe mostrar el nombre del cliente conectado", () => {
    mostrarNavbar(cliente);

    expect(screen.getByText(/Hola, Juana/)).not.toBeNull();
  });

  // PRUEBA 5
  it("debe abrir el menú del perfil al hacer clic", () => {
    mostrarNavbar(cliente);

    const boton = screen.getByRole("button", {
      name: /Hola, Juana/,
    });

    expect(boton.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(boton);

    expect(boton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("MI CUENTA")).not.toBeNull();
  });

  // PRUEBA 6
  it("debe mostrar el enlace Mi perfil", () => {
    mostrarNavbar(cliente);

    fireEvent.click(
      screen.getByRole("button", { name: /Hola, Juana/ })
    );

    const enlace = screen.getByRole("link", {
      name: /Mi perfil/,
    });

    expect(enlace.getAttribute("href")).toBe("/mi-perfil");
  });

  // PRUEBA 7
  it("debe mostrar el enlace Mis compras", () => {
    mostrarNavbar(cliente);

    fireEvent.click(
      screen.getByRole("button", { name: /Hola, Juana/ })
    );

    const enlace = screen.getByRole("link", {
      name: /Mis compras/,
    });

    expect(enlace.getAttribute("href")).toBe("/mis-pedidos");
  });

  // PRUEBA 8
  it("no debe mostrar el panel administrador a un cliente", () => {
    mostrarNavbar(cliente);

    fireEvent.click(
      screen.getByRole("button", { name: /Hola, Juana/ })
    );

    expect(
      screen.queryByText(/Panel administrador/)
    ).toBeNull();
  });

  // PRUEBA 9
  it("debe mostrar el panel a un administrador", () => {
    mostrarNavbar(administrador);

    fireEvent.click(
      screen.getByRole("button", { name: /Hola, Administrador/ })
    );

    const enlace = screen.getByRole("link", {
      name: /Panel administrador/,
    });

    expect(enlace.getAttribute("href")).toBe("/admin");
  });

  // PRUEBA 10 (MOCK con jasmine.createSpy)
  it("debe ejecutar cerrarSesion al hacer clic", async () => {
    const cerrarSesion = jasmine
      .createSpy("cerrarSesion")
      .and.resolveTo();

    mostrarNavbar(cliente, cerrarSesion);

    fireEvent.click(
      screen.getByRole("button", { name: /Hola, Juana/ })
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Cerrar sesión/ })
    );

    expect(cerrarSesion).toHaveBeenCalledTimes(1);
  });

  // PRUEBA 11
  it("debe abrir y cerrar el menú móvil con el botón hamburguesa", () => {
    const { container } = mostrarNavbar();

    const toggle = screen.getByRole("button", {
      name: "Abrir o cerrar menú",
    });
    const menu = container.querySelector("#site-menu");

    expect(menu.classList.contains("is-open")).toBeFalse();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(menu.classList.contains("is-open")).toBeTrue();

    fireEvent.click(toggle);
    expect(menu.classList.contains("is-open")).toBeFalse();
  });

  // PRUEBA 12
  it("debe cerrar el menú del perfil con la tecla Escape", () => {
    mostrarNavbar(cliente);

    const boton = screen.getByRole("button", { name: /Hola, Juana/ });
    fireEvent.click(boton);
    expect(boton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(boton.getAttribute("aria-expanded")).toBe("false");
  });

  // PRUEBA 13
  it("debe cerrar el menú del perfil al hacer clic fuera", () => {
    mostrarNavbar(cliente);

    const boton = screen.getByRole("button", { name: /Hola, Juana/ });
    fireEvent.click(boton);

    fireEvent.mouseDown(document.body);

    expect(boton.getAttribute("aria-expanded")).toBe("false");
  });
});
