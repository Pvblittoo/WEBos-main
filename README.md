# Facture Sneakers — Backend (Spring Boot) 👟

API REST de la tienda online de zapatillas para **DSY1104 Desarrollo Fullstack II** (Duoc UC).
El frontend React está en la rama [`Frontend`](https://github.com/Pvblittoo/WEBos-main/tree/Frontend).

## Tecnologías

Java 21, Spring Boot 4.1, Spring Data JPA, Spring Security, JWT (jjwt 0.12), Swagger (springdoc-openapi 3), H2 y Gradle.

## Cómo ejecutar

1. Abrir la carpeta `SnearksSource` en IntelliJ IDEA y esperar a que Gradle descargue las dependencias.
2. Ejecutar `SnearksSourceApplication`, o desde la terminal:

```bash
cd SnearksSource
./gradlew bootRun        # Windows: gradlew.bat bootRun
```

El servidor queda en `http://localhost:8080`. La base de datos H2 se crea sola en la carpeta `data/` y al primer arranque se precargan los productos y blogs.

| Recurso | URL |
|---|---|
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Especificación OpenAPI | http://localhost:8080/v3/api-docs |
| Consola H2 | http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/facturedb`, usuario `sa`, sin clave) |

## Modelo de datos

| Entidad | Descripción |
|---|---|
| `Cliente` | Usuario con nombre, correo, contraseña cifrada (BCrypt), rol (`CLIENTE` o `ADMIN`) y versión de token |
| `Producto` | Zapatilla con precio, categoría (Jordan, Nike Sports, Nike Urban) y stock por talla |
| `Carrito` / `ItemCarrito` | Carrito de cada cliente con sus productos, talla, cantidad y totales |
| `Boleta` | Compra confirmada con sus ítems, método de pago, dirección y estado (CREADA, PAGADA, ENVIADA) |
| `Blogs` | Noticias de la tienda |

## Lógica de negocio

- El **registro** siempre crea cuentas con rol `CLIENTE`, aunque se envíe otro rol.
- **Stock por talla:** no se puede agregar al carrito ni comprar más unidades de las disponibles.
- **Checkout transaccional:** al confirmar la compra se valida y descuenta el stock, se crea la boleta y se vacía el carrito en una sola transacción. Si algo falla, no se aplica ningún cambio.
- Al comprar se envía la boleta por correo. Si el correo falla, la compra igual queda registrada.

## Endpoints principales

Todos están documentados en Swagger.

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/clientes` | Público (registro) |
| POST | `/api/clientes/login` · `/refresh` · `/logout` | Público |
| GET | `/api/clientes/me` | Autenticado |
| GET | `/api/productos` · `/api/productos/{id}` · `/api/productos/categoria/...` | Público |
| POST · PUT · DELETE | `/api/productos/...` | ADMIN |
| GET | `/api/blogs` · `/api/blogs/{id}` | Público |
| POST · PUT · DELETE | `/api/blogs/...` | ADMIN |
| GET · POST · PUT · DELETE | `/api/clientes/{id}/carrito/...` | Dueño del carrito o ADMIN |
| GET · POST | `/api/clientes/{id}/boletas` | Dueño de las boletas o ADMIN |
| GET · POST · PUT | `/api/admin/...` | ADMIN |

## Seguridad (JWT)

- **Login:** `POST /api/clientes/login` devuelve un `accessToken` (dura 15 minutos) y guarda un `refreshToken` (dura 7 días) en una cookie **HttpOnly** con **SameSite=Strict**.
- **Uso:** cada petición protegida envía `Authorization: Bearer <accessToken>`. El filtro `JwtAuthFilter` valida la firma, la expiración y el tipo del token, y carga el rol desde la base de datos.
- **Renovación:** `POST /api/clientes/refresh` entrega un token nuevo usando la cookie.
- **Cierre de sesión:** `POST /api/clientes/logout` revoca todos los tokens del usuario de inmediato, aunque no hayan expirado.
- **Sin sesiones en el servidor** (`STATELESS`).
- **Roles:** las rutas `/api/admin/**` y la escritura de productos y blogs son solo para ADMIN.
- **Control por usuario:** `VerificadorAcceso` impide que un cliente vea o modifique el carrito o las boletas de otro (responde 403).
- **Errores:** todas las respuestas de error usan el mismo formato JSON `{ fecha, status, mensaje }`.

### Variables de entorno

| Variable | Uso |
|---|---|
| `JWT_SECRET` | Clave Base64 para firmar los JWT. En desarrollo hay una por defecto; en producción debe definirse. |
| `MAIL_PASSWORD` | Contraseña de aplicación de Gmail para enviar boletas. Opcional. |

## Cuentas de administrador

Las cuentas nuevas siempre son `CLIENTE`. Para tener un administrador:

1. Registrar la cuenta desde el frontend o con `POST /api/clientes`.
2. Agregar ese correo a la lista de la clase `ActivarAdmin`.
3. Ejecutar el backend con el perfil `activar-admin-local` (en `application.properties`: `spring.profiles.active=activar-admin-local`).

Un administrador también puede promover a otros usuarios desde el panel **Usuarios** del frontend.

## Pruebas de integración

```bash
cd SnearksSource
./gradlew test           # Windows: gradlew.bat test
```

`IntegracionApiTests` levanta la aplicación completa con una base de datos H2 en memoria (no toca la base real) y verifica:

- Login con JWT y cookie HttpOnly de refresh
- Rechazo de credenciales incorrectas, de peticiones sin token y de tokens alterados
- Renovación del token y revocación al cerrar sesión
- Que un CLIENTE no pueda crear productos ni blogs, ni entrar a la administración
- Que un cliente no pueda ver el carrito de otro
- El CRUD completo de productos como ADMIN
- La validación de stock y su descuento al comprar