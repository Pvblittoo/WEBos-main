import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Carrito from "../src/pages/carrito.jsx";

const BASE = "http://localhost:8080/api/clientes/5/carrito";

const item = {
  productoId: 10,
  nombreProducto: "Air Jordan 1",
  talla: "42",
  precioUnitario: 49990,
  cantidad: 2,
};

const carritoConItems = {
  items: [item],
  subtotal: 99980,
  impuestos: 18996,
  total: 118976,
};

// MOCK de respuestas HTTP del backend Spring Boot
function respuesta(cuerpo, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => cuerpo,
    text: async () => (typeof cuerpo === "string" ? cuerpo : ""),
  };
}

function iniciarSesion() {
  sessionStorage.setItem("facture_usuario", JSON.stringify({ id: 5 }));
}

function mostrarCarrito() {
  return render(
    <MemoryRouter>
      <Carrito />
    </MemoryRouter>
  );
}

describe("Facture Sneakers - Carrito (estado, mocks y Bootstrap)", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("debe pedir iniciar sesión si no hay usuario y no llamar al backend", () => {
    const espiaFetch = spyOn(window, "fetch");
    mostrarCarrito();

    expect(screen.getByText(/Debes iniciar sesión/)).not.toBeNull();
    expect(
      screen.getByRole("link", { name: "INICIAR SESIÓN" }).getAttribute("href")
    ).toBe("/login");
    expect(espiaFetch).not.toHaveBeenCalled();
  });

  it("debe cargar el carrito del cliente con fetch (spy)", async () => {
    const espiaFetch = spyOn(window, "fetch").and.resolveTo(
      respuesta(carritoConItems)
    );
    iniciarSesion();
    mostrarCarrito();

    await screen.findByText("Air Jordan 1");

    const [url, opciones] = espiaFetch.calls.mostRecent().args;
    expect(url).toBe(BASE);
    expect(opciones.method).toBe("GET");
  });

  it("debe mostrar mensaje de carrito vacío", async () => {
    spyOn(window, "fetch").and.resolveTo(
      respuesta({ items: [], subtotal: 0, impuestos: 0, total: 0 })
    );
    iniciarSesion();
    mostrarCarrito();

    expect(await screen.findByText(/Tu carrito está vacío/)).not.toBeNull();
  });

  it("debe mostrar producto, talla y subtotal calculado", async () => {
    spyOn(window, "fetch").and.resolveTo(respuesta(carritoConItems));
    iniciarSesion();
    mostrarCarrito();

    expect(await screen.findByText("Air Jordan 1")).not.toBeNull();
    expect(screen.getByText(/Talla: 42/)).not.toBeNull();
    // 49.990 x 2 = 99.980
    expect(screen.getByText(/Subtotal:\s*\$?\s*99\.980/)).not.toBeNull();
  });

  it("debe mostrar error si la sesión no es válida (401)", async () => {
    spyOn(window, "fetch").and.resolveTo(respuesta("", { ok: false, status: 401 }));
    iniciarSesion();
    mostrarCarrito();

    expect(
      await screen.findByText(/Tu sesión no está activa/)
    ).not.toBeNull();
  });

  it("debe usar el grid responsivo de Bootstrap (lista 8 + resumen 4)", async () => {
    spyOn(window, "fetch").and.resolveTo(respuesta(carritoConItems));
    iniciarSesion();
    const { container } = mostrarCarrito();

    await screen.findByText("Air Jordan 1");

    expect(container.querySelector(".row > .col-12.col-lg-8")).not.toBeNull();
    expect(container.querySelector(".row > .col-12.col-lg-4")).not.toBeNull();
  });

  it("debe aumentar la cantidad con PUT y mostrar confirmación", async () => {
    const espiaFetch = spyOn(window, "fetch").and.returnValues(
      Promise.resolve(respuesta(carritoConItems)),
      Promise.resolve(
        respuesta({
          ...carritoConItems,
          items: [{ ...item, cantidad: 3 }],
        })
      )
    );
    iniciarSesion();
    mostrarCarrito();

    await screen.findByText("Air Jordan 1");
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    expect(
      await screen.findByText("Carrito actualizado correctamente.")
    ).not.toBeNull();

    const [url, opciones] = espiaFetch.calls.mostRecent().args;
    expect(url).toBe(`${BASE}/items/10`);
    expect(opciones.method).toBe("PUT");
    expect(JSON.parse(opciones.body)).toEqual({
      productoId: 10,
      cantidad: 3,
      talla: "42",
    });
  });

  it("debe deshabilitar el botón menos cuando la cantidad es 1", async () => {
    spyOn(window, "fetch").and.resolveTo(
      respuesta({ ...carritoConItems, items: [{ ...item, cantidad: 1 }] })
    );
    iniciarSesion();
    mostrarCarrito();

    await screen.findByText("Air Jordan 1");

    expect(screen.getByRole("button", { name: "−" }).disabled).toBeTrue();
  });

  it("debe eliminar un producto con DELETE incluyendo la talla", async () => {
    const espiaFetch = spyOn(window, "fetch").and.returnValues(
      Promise.resolve(respuesta(carritoConItems)),
      Promise.resolve(respuesta({ items: [], subtotal: 0, impuestos: 0, total: 0 }))
    );
    iniciarSesion();
    mostrarCarrito();

    await screen.findByText("Air Jordan 1");
    fireEvent.click(screen.getByRole("button", { name: "ELIMINAR" }));

    await screen.findByText("Carrito actualizado correctamente.");

    const [url, opciones] = espiaFetch.calls.mostRecent().args;
    expect(url).toBe(`${BASE}/items/10?talla=42`);
    expect(opciones.method).toBe("DELETE");
  });

  it("no debe vaciar el carrito si el usuario cancela la confirmación", async () => {
    const espiaFetch = spyOn(window, "fetch").and.resolveTo(
      respuesta(carritoConItems)
    );
    spyOn(window, "confirm").and.returnValue(false);
    iniciarSesion();
    mostrarCarrito();

    await screen.findByText("Air Jordan 1");
    fireEvent.click(screen.getByRole("button", { name: "VACIAR CARRITO" }));

    expect(espiaFetch).toHaveBeenCalledTimes(1); // solo la carga inicial
  });
});
