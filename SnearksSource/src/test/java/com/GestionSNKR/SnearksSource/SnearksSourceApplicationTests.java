package com.GestionSNKR.SnearksSource;

import com.GestionSNKR.SnearksSource.model.Cliente;
import com.GestionSNKR.SnearksSource.model.Rol;
import com.GestionSNKR.SnearksSource.repository.ClienteRepository;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integración de la API: levantan la aplicación completa
 * (controladores + seguridad JWT + servicios + H2 en memoria) y verifican
 * autenticación, roles, CRUD y reglas de negocio de punta a punta.
 */
@SpringBootTest
@AutoConfigureMockMvc
class IntegracionApiTests {

	private static final AtomicInteger SECUENCIA = new AtomicInteger();

	@Autowired private MockMvc mvc;
	@Autowired private ClienteRepository clienteRepository;
	@Autowired private PasswordEncoder passwordEncoder;

	// ---------------------------------------------------------------
	// Autenticación JWT
	// ---------------------------------------------------------------

	@Test
	void loginEntregaAccessTokenYCookieDeRefreshHttpOnly() throws Exception {
		String email = registrarCliente();

		MvcResult res = mvc.perform(post("/api/clientes/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(credenciales(email)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken").isNotEmpty())
				.andExpect(jsonPath("$.rol").value("CLIENTE"))
				.andExpect(jsonPath("$.contrasena").doesNotExist())
				.andReturn();

		String setCookie = res.getResponse().getHeader("Set-Cookie");
		assertThat(setCookie).contains("refresh_token=").contains("HttpOnly").contains("SameSite=Strict");
	}

	@Test
	void loginConClaveIncorrectaResponde401() throws Exception {
		String email = registrarCliente();
		mvc.perform(post("/api/clientes/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"" + email + "\",\"contrasena\":\"otra\"}"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void endpointProtegidoSinTokenResponde401() throws Exception {
		mvc.perform(get("/api/clientes/me")).andExpect(status().isUnauthorized());
	}

	@Test
	void tokenAlteradoEsRechazado() throws Exception {
		String token = login(registrarCliente()).token();
		String alterado = token.substring(0, token.length() - 3) + "abc";

		mvc.perform(get("/api/clientes/me").header("Authorization", "Bearer " + alterado))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void refreshEntregaNuevoTokenYLogoutLosRevoca() throws Exception {
		Sesion sesion = login(registrarCliente());

		mvc.perform(get("/api/clientes/me").header("Authorization", "Bearer " + sesion.token()))
				.andExpect(status().isOk());

		// Renovación con la cookie HttpOnly
		MvcResult refresh = mvc.perform(post("/api/clientes/refresh").cookie(sesion.refresh()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken").isNotEmpty())
				.andReturn();
		Cookie refreshNuevo = refresh.getResponse().getCookie("refresh_token");

		// Logout: incrementa la versión de token del usuario
		mvc.perform(post("/api/clientes/logout").cookie(refreshNuevo))
				.andExpect(status().isOk());

		// El access token anterior queda revocado aunque no haya expirado
		mvc.perform(get("/api/clientes/me").header("Authorization", "Bearer " + sesion.token()))
				.andExpect(status().isUnauthorized());

		// Y el refresh tampoco sirve
		mvc.perform(post("/api/clientes/refresh").cookie(refreshNuevo))
				.andExpect(status().isUnauthorized());
	}

	// ---------------------------------------------------------------
	// Roles y permisos
	// ---------------------------------------------------------------

	@Test
	void clienteNoPuedeCrearProductosNiBlogsNiEntrarAAdmin() throws Exception {
		String token = login(registrarCliente()).token();

		mvc.perform(post("/api/productos").header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON).content(productoJson(5)))
				.andExpect(status().isForbidden());

		mvc.perform(post("/api/blogs").header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON).content("{\"titulo\":\"x\"}"))
				.andExpect(status().isForbidden());

		mvc.perform(get("/api/admin/clientes").header("Authorization", "Bearer " + token))
				.andExpect(status().isForbidden());
	}

	@Test
	void clienteNoPuedeVerElCarritoDeOtroCliente() throws Exception {
		Sesion a = login(registrarCliente());
		Sesion b = login(registrarCliente());

		mvc.perform(get("/api/clientes/" + b.id() + "/carrito").header("Authorization", "Bearer " + a.token()))
				.andExpect(status().isForbidden());

		mvc.perform(get("/api/clientes/" + a.id() + "/carrito").header("Authorization", "Bearer " + a.token()))
				.andExpect(status().isOk());
	}

	// ---------------------------------------------------------------
	// CRUD de productos (ADMIN)
	// ---------------------------------------------------------------

	@Test
	void adminRealizaCrudCompletoDeProductos() throws Exception {
		String token = login(crearAdmin()).token();

		// CREATE
		MvcResult creado = mvc.perform(post("/api/productos").header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON).content(productoJson(5)))
				.andExpect(status().isCreated())
				.andReturn();
		Number id = JsonPath.read(creado.getResponse().getContentAsString(), "$.id");

		// READ
		mvc.perform(get("/api/productos/" + id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nombreModelo").value("Zapatilla de prueba"));

		// UPDATE
		mvc.perform(put("/api/productos/" + id).header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(productoJson(5).replace("Zapatilla de prueba", "Modelo editado")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nombreModelo").value("Modelo editado"));

		// DELETE
		mvc.perform(delete("/api/productos/" + id).header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());

		mvc.perform(get("/api/productos/" + id)).andExpect(status().isNotFound());
	}

	// ---------------------------------------------------------------
	// Reglas de negocio: stock y checkout
	// ---------------------------------------------------------------

	@Test
	void noSePuedeAgregarMasQueElStockYCheckoutDescuentaStock() throws Exception {
		String admin = login(crearAdmin()).token();
		MvcResult creado = mvc.perform(post("/api/productos").header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON).content(productoJson(2)))
				.andExpect(status().isCreated()).andReturn();
		Number productoId = JsonPath.read(creado.getResponse().getContentAsString(), "$.id");

		Sesion cliente = login(registrarCliente());
		String carrito = "/api/clientes/" + cliente.id() + "/carrito/items";

		// Pide 3 unidades con stock 2 -> 400
		mvc.perform(post(carrito).header("Authorization", "Bearer " + cliente.token())
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"productoId\":" + productoId + ",\"cantidad\":3,\"talla\":\"40\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("Stock insuficiente")));

		// Pide 2 -> OK
		mvc.perform(post(carrito).header("Authorization", "Bearer " + cliente.token())
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"productoId\":" + productoId + ",\"cantidad\":2,\"talla\":\"40\"}"))
				.andExpect(status().isCreated());

		// Checkout -> crea la boleta y vacía el carrito
		mvc.perform(post("/api/clientes/" + cliente.id() + "/boletas")
						.header("Authorization", "Bearer " + cliente.token())
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"metodoPago\":\"TARJETA\",\"direccion\":\"Av. Siempre Viva 123\"}"))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.estado").value("CREADA"));

		// El stock de la talla 40 quedó en 0
		mvc.perform(get("/api/productos/" + productoId))
				.andExpect(jsonPath("$.tallasDisponibles['40']").value(0));
	}

	// ---------------------------------------------------------------
	// Apoyo
	// ---------------------------------------------------------------

	private record Sesion(Long id, String token, Cookie refresh) {}

	private String registrarCliente() throws Exception {
		String email = "cliente" + SECUENCIA.incrementAndGet() + "@test.cl";
		mvc.perform(post("/api/clientes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"nombreCompleto\":\"Cliente Test\",\"email\":\"" + email
								+ "\",\"contrasena\":\"Clave123\",\"rol\":\"ADMIN\"}"))
				.andExpect(status().isOk())
				// Aunque se envíe rol ADMIN, el registro siempre crea CLIENTE
				.andExpect(jsonPath("$.rol").value("CLIENTE"));
		return email;
	}

	private String crearAdmin() {
		String email = "admin" + SECUENCIA.incrementAndGet() + "@test.cl";
		Cliente admin = new Cliente();
		admin.setNombreCompleto("Admin Test");
		admin.setEmail(email);
		admin.setContrasena(passwordEncoder.encode("Clave123"));
		admin.setRol(Rol.ADMIN);
		clienteRepository.save(admin);
		return email;
	}

	private Sesion login(String email) throws Exception {
		MvcResult res = mvc.perform(post("/api/clientes/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(credenciales(email)))
				.andExpect(status().isOk())
				.andReturn();
		String json = res.getResponse().getContentAsString();
		Number id = JsonPath.read(json, "$.id");
		String token = JsonPath.read(json, "$.accessToken");
		return new Sesion(id.longValue(), token, res.getResponse().getCookie("refresh_token"));
	}

	private static String credenciales(String email) {
		return "{\"email\":\"" + email + "\",\"contrasena\":\"Clave123\"}";
	}

	private static String productoJson(int stockTalla40) {
		return "{\"nombreModelo\":\"Zapatilla de prueba\",\"precio\":49990,"
				+ "\"descripcion\":\"Test\",\"linkImagen\":\"/img/test.png\","
				+ "\"tipoCategoria\":\"Jordan\",\"tallasDisponibles\":{\"40\":" + stockTalla40 + "}}";
	}
}
