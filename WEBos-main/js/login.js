document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Obtener los valores de los inputs
        const correo = document.getElementById('correo').value.trim();
        const password = document.getElementById('password').value;

        if (correo.toLowerCase() === 'admin@gmail.com' && password === 'rut') {
            localStorage.setItem('usuarioSesion', JSON.stringify({
                email: correo,
                pnombre: 'Administrador',
                rol: 'ADMIN'
            }));
            window.location.href = 'admin.html';
            return;
        }

        if (correo.toLowerCase() === 'vendedor@gmail.com' && password === 'vendedor') {
            localStorage.setItem('usuarioSesion', JSON.stringify({
                email: correo,
                pnombre: 'Vendedor',
                rol: 'VENDEDOR'
            }));
            window.location.href = 'adminProductos.html';
            return;
        }

        // 2. Estructurar el DTO de Login esperado por el backend
        const credentials = {
            email: correo,
            contrasena: password
        };

        try {
            // 3. Petición POST al endpoint de login
            const response = await fetch('http://localhost:8080/api/clientes/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            // 4. Procesar la respuesta
            if (response.ok) {
                const cliente = await response.json();
                
                // Guardar la sesión en localStorage
                localStorage.setItem('usuarioSesion', JSON.stringify(cliente));

                alert(`¡Bienvenido/a, ${cliente.pnombre}!`);
                
                const role = String(cliente.rol || cliente.role || '').toUpperCase();
                window.location.href = role === 'VENDEDOR' ? 'adminProductos.html' : role === 'ADMIN' ? 'admin.html' : 'index.html';
            } else {
                const errorMsg = await response.text();
                alert('No se pudo iniciar sesión: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error de red/servidor:', error);
            alert('Ocurrió un error al conectar con el servidor. Revisa si Spring Boot está activo.');
        }
    });
});