# Facture Sneakers — Frontend (React + Vite) 👟

Tienda online de zapatillas desarrollada para **DSY1104 Desarrollo Fullstack II** (Duoc UC).
Este es el **frontend**. El backend Spring Boot está en la rama [`Backend`](https://github.com/Pvblittoo/WEBos-main/tree/Backend).

## Tecnologías

React 19, React Router 7, Bootstrap 5 y Vite.

## Requisitos

- Node.js 20 o superior
- Backend corriendo en `http://localhost:8080`

## Cómo ejecutar

```bash
cd frontend-react
npm install
npm run dev
```

Abrir `http://localhost:5173`.

Si el backend corre en otra dirección, crear un archivo `.env` dentro de `frontend-react` con:

```
VITE_API_URL=http://otra-direccion:8080
```

## Estructura

```
frontend-react/src
├── api.js                     # Cliente HTTP central: token JWT, renovación automática y errores
├── App.jsx                    # Rutas, restauración de sesión y cierre de sesión
├── components/
│   ├── Navbar.jsx             # Menú según sesión y rol (opciones ADMIN ocultas a clientes)
│   └── RutaProtegida.jsx      # Guardia de rutas por sesión y por rol
└── pages/                     # Catálogo, detalle, carrito, checkout, pedidos, perfil y panel admin
```

## Integración con el backend

Todas las páginas se comunican con la API REST a través de `apiFetch` (en `api.js`), que:

1. Agrega el header `Authorization: Bearer <token>` a cada petición.
2. Si el backend responde 401 porque el token expiró, pide uno nuevo a `/api/clientes/refresh` y repite la petición automáticamente.
3. Si la sesión ya no se puede renovar, cierra la sesión local y avisa a la aplicación.

## Gestión de sesión

- El **accessToken (JWT)** se guarda **solo en memoria**, nunca en `localStorage` ni en `sessionStorage`, para que un script malicioso no pueda robarlo.
- El **refreshToken** lo guarda el navegador en una cookie **HttpOnly** que JavaScript no puede leer.
- Al **recargar la página**, `App.jsx` restaura la sesión pidiendo un token nuevo con esa cookie, así que el usuario sigue conectado.
- Al **cerrar sesión**, el backend revoca todos los tokens del usuario.

## Restricciones de acceso

| Ruta | Requisito |
|---|---|
| `/admin`, `/admin/productos`, `/admin/pedidos`, `/admin/usuarios` | Rol **ADMIN** |
| `/checkout`, `/compra-exitosa`, `/mis-pedidos`, `/mi-perfil` | Sesión iniciada |
| Catálogo, detalle, blogs, contacto | Público |

- Sin sesión, `RutaProtegida` redirige al login y después devuelve al usuario a la página que intentaba abrir.
- Con sesión pero sin el rol necesario, muestra **ACCESO DENEGADO**.
- El menú oculta las opciones de administración a los clientes.

La seguridad real está en el backend, que valida el token y el rol en cada petición: las restricciones del frontend mejoran la experiencia, pero no son la única protección.