import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Catalogo from "../src/pages/catalogo.jsx";

function mostrarCatalogo() {
  return render(
    <MemoryRouter>
      <Catalogo />
    </MemoryRouter>
  );
}

describe("Facture Sneakers - Catálogo (Bootstrap responsivo)", () => {
  afterEach(() => {
    cleanup();
  });

  it("debe mostrar el título del catálogo", () => {
    mostrarCatalogo();

    const titulo = screen.getByRole("heading", { level: 1 });

    expect(titulo.textContent).toBe("NUESTRO CATÁLOGO");
  });

  it("debe mostrar una tarjeta por cada colección", () => {
    mostrarCatalogo();

    expect(screen.getByRole("heading", { name: "NIKE URBAN" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "NIKE SPORTS" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "JORDAN" })).not.toBeNull();
  });

  it("debe enlazar cada tarjeta a su colección", () => {
    mostrarCatalogo();

    const enlaces = screen
      .getAllByRole("link", { name: /VER ZAPATILLAS/ })
      .map((enlace) => enlace.getAttribute("href"));

    expect(enlaces).toEqual(["/nike-urban", "/nike-sports", "/jordan"]);
  });

  it("debe mostrar la imagen de cada colección con su alt", () => {
    mostrarCatalogo();

    expect(screen.getByAltText("NIKE URBAN").getAttribute("src")).toBe(
      "/img/logo/urb.jpg"
    );
    expect(screen.getByAltText("JORDAN")).not.toBeNull();
  });

  it("debe usar columnas responsivas de Bootstrap (1, 2 y 3 por fila)", () => {
    const { container } = mostrarCatalogo();

    const columnas = container.querySelectorAll(
      ".row > .col-12.col-md-6.col-lg-4"
    );

    expect(columnas.length).toBe(3);
  });

  it("debe usar tarjetas de Bootstrap con la misma altura", () => {
    const { container } = mostrarCatalogo();

    expect(container.querySelectorAll(".card.h-100").length).toBe(3);
  });
});
