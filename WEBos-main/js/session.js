document.addEventListener('DOMContentLoaded', () => {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const loginItem = document.getElementById('nav-login-item');
    const userDropdown = document.getElementById('nav-user-dropdown');
    const welcome = document.getElementById('mensaje-bienvenida');
    const name = document.getElementById('nombre-usuario');
    const logout = document.getElementById('logout-btn');

    if (usuarioActivo) {
        loginItem?.classList.add('d-none');
        userDropdown?.classList.remove('d-none');
        welcome?.classList.remove('d-none');
        if (name) name.textContent = usuarioActivo;
    }

    logout?.addEventListener('click', event => {
        event.preventDefault();
        localStorage.removeItem('usuarioActivo');
        window.location.reload();
    });
});
