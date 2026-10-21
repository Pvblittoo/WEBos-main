import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../src/pages/login.jsx";

const clienteOk = {
  id: 7,
  nombreCompleto: "Juana Pérez",
  email: "juana@ejemplo.com",
  rol: "CLIENTE",
};

// MOCK de la respuesta HTTP que entregaría Spring Boot
function respuestaMock({ ok = true, status = 200, cuerpo = clienteOk } = {}) {
  return { ok, status, json: async () => cuerpo };
}

function mostrarLogin(onLogin) {
  return render(
    <MemoryRouter>
      <Login onLogin={onLogin} />
    </MemoryRouter>
  );
}

function escribirYEnviar(email, contrasena) {
  fireEvent.change(screen.getByLabelText("CORREO"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("CONTRASEÑA"), {
    target: { value: contrasena },
  });
  fireEvent.submit(screen.getByLabelText("CORREO").closest("form"));
}

describe("Facture Sneakers - Login (estado, validación y mocks)", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("debe renderizar los campos y el botón de inicio de sesión", () => {
    mostrarLogin();

    expect(screen.getByLabelText("CORREO")).not.toBeNull();
    expect(screen.getByLabelText("CONTRASEÑA")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "INICIAR SESIÓN" })
    ).not.toBeNull();
  });

  it("debe marcar correo y contraseña como obligatorios (validación)", () => {
    mostrarLogin();

    const correo = screen.getByLabelText("CORREO");
    const clave = screen.getByLabelText("CONTRASEÑA");

    expect(correo.required).toBeTrue();
    expect(correo.type).toBe("email");
    expect(clave.required).toBeTrue();
    expect(clave.type).toBe("password");
  });

  it("debe actualizar el estado al escribir en los campos", () => {
    mostrarLogin();

    const correo = screen.getByLabelText("CORREO");
    fireEvent.change(correo, { target: { value: "a@b.cl" } });

    expect(correo.value).toBe("a@b.cl");
  });

  it("debe enviar las credenciales al backend con fetch (spy)", async () => {
    const espiaFetch = spyOn(window, "fetch").and.resolveTo(respuestaMock());
    mostrarLogin();

    escribirYEnviar("  juana@ejemplo.com  ", "clave123");
    await screen.findByText("¡Inicio de sesión exitoso!");

    expect(espiaFetch).toHaveBeenCalledTimes(1);

    const [url, opciones] = espiaFetch.calls.mostRecent().args;

    expect(url).toBe("http://localhost:8080/api/clientes/login");
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body)).toEqual({
      email: "juana@ejemplo.com", // el correo se envía sin espacios
      contrasena: "clave123",
    });
  });

  it("debe avisar a App con onLogin y guardar la sesión", async () => {
    spyOn(window, "fetch").and.resolveTo(respuestaMock());
    const onLogin = jasmine.createSpy("onLogin");
    mostrarLogin(onLogin);

    escribirYEnviar("juana@ejemplo.com", "clave123");
    await screen.findByText("¡Inicio de sesión exitoso!");

    expect(onLogin).toHaveBeenCalledOnceWith(clienteOk);

    const guardado = JSON.parse(sessionStorage.getItem("facture_usuario"));
    expect(guardado).toEqual({
      id: 7,
      nombre: "Juana Pérez",
      email: "juana@ejemplo.com",
      rol: "CLIENTE",
    });
  });

  it("debe mostrar error si las credenciales son incorrectas (401)", async () => {
    spyOn(window, "fetch").and.resolveTo(
      respuestaMock({ ok: false, status: 401 })
    );
    const onLogin = jasmine.createSpy("onLogin");
    mostrarLogin(onLogin);

    escribirYEnviar("juana@ejemplo.com", "mala");

    expect(
      await screen.findByText("Correo o contraseña incorrectos.")
    ).not.toBeNull();
    expect(onLogin).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("facture_usuario")).toBeNull();
  });

  it("debe mostrar un error genérico ante otro fallo del servidor (500)", async () => {
    spyOn(window, "fetch").and.resolveTo(
      respuestaMock({ ok: false, status: 500 })
    );
    mostrarLogin();

    escribirYEnviar("juana@ejemplo.com", "clave123");

    expect(
      await screen.findByText(
        "No se pudo iniciar sesión. Inténtalo nuevamente."
      )
    ).not.toBeNull();
  });

  it("debe informar si no hay conexión con el backend", async () => {
    spyOn(window, "fetch").and.rejectWith(new TypeError("Failed to fetch"));
    mostrarLogin();

    escribirYEnviar("juana@ejemplo.com", "clave123");

    expect(
      await screen.findByText(/No se pudo conectar con Spring Boot/)
    ).not.toBeNull();
  });

  it("debe deshabilitar el botón mientras carga", async () => {
    // Promesa que nunca se resuelve: simula una petición en curso
    spyOn(window, "fetch").and.returnValue(new Promise(() => {}));
    mostrarLogin();

    escribirYEnviar("juana@ejemplo.com", "clave123");

    const boton = await screen.findByRole("button", {
      name: "INICIANDO SESIÓN...",
    });

    expect(boton.disabled).toBeTrue();
  });
});
