import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MarcaCard from "../src/components/MarcaCard.jsx";

// Props de ejemplo que recibe el componente desde App.jsx
const props = {
  nombre: "NIKE URBAN",
  imagen: "/img/logo/urb.jpg",
  fondo: "/img/logo/fondo-urban.jpg",
  ruta: "/nike-urban",
};

function mostrarCard(propsCard = props) {
  return render(
    <MemoryRouter>
      <MarcaCard {...propsCard} />
    </MemoryRouter>
  );
}

describe("Facture Sneakers - MarcaCard (props)", () => {
  afterEach(() => {
    cleanup();
  });

  it("debe mostrar el nombre de la marca recibido por props", () => {
    mostrarCard();

    expect(
      screen.getByRole("heading", { name: "NIKE URBAN" })
    ).not.toBeNull();
  });

  it("debe mostrar el logo con el alt generado desde el nombre", () => {
    mostrarCard();

    const logo = screen.getByAltText("Logo NIKE URBAN");

    expect(logo.getAttribute("src")).toBe("/img/logo/urb.jpg");
  });

  it("debe enlazar a la ruta recibida por props", () => {
    mostrarCard();

    const enlace = screen.getByRole("link", { name: /Ver Colección/ });

    expect(enlace.getAttribute("href")).toBe("/nike-urban");
  });

  it("debe aplicar la imagen de fondo recibida por props", () => {
    const { container } = mostrarCard();

    const tarjeta = container.querySelector(".brand-card");

    expect(tarjeta.style.backgroundImage).toContain("fondo-urban.jpg");
  });

  it("debe usar el grid de Bootstrap (col-md-4) para ser responsivo", () => {
    const { container } = mostrarCard();

    expect(container.querySelector(".col-md-4")).not.toBeNull();
  });

  it("debe personalizarse al cambiar las props", () => {
    mostrarCard({
      nombre: "JORDAN",
      imagen: "/img/logo/ljordan.jpg",
      fondo: "/img/logo/njor.jpg",
      ruta: "/jordan",
    });

    expect(screen.getByRole("heading", { name: "JORDAN" })).not.toBeNull();
    expect(
      screen.getByRole("link", { name: /Ver Colección/ }).getAttribute("href")
    ).toBe("/jordan");
  });
});
