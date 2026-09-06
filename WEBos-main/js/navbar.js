document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('usuarioSesion') || 'null');
    const role = String(session?.rol || session?.role || '').toUpperCase();
    const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'portada.html';
    const adminPages = ['admin.html', 'adminproductos.html', 'adminusuarios.html'];
    const isAdminPage = adminPages.includes(currentPage);

    if (isAdminPage && role !== 'ADMIN' && !(role === 'VENDEDOR' && currentPage === 'adminproductos.html')) {
        window.location.replace(role === 'VENDEDOR' ? 'adminProductos.html' : 'acceso.html');
        return;
    }

    document.querySelectorAll('body > nav, body > .top-navbar, body > .nav-container').forEach(element => element.remove());
    const isAdminNavbar = document.body.dataset.navbar === 'admin';

    document.body.insertAdjacentHTML('afterbegin', `
        <nav id="site-navbar" class="site-navbar">
            <div class="site-navbar-inner">
                <a class="site-navbar-brand" href="index.html">
                    <img src="img/logo/logoo.png" alt="Facture Sneakers">
                </a>
                <button class="site-navbar-toggle" type="button" aria-controls="site-navbar-menu" aria-expanded="false" aria-label="Abrir menú">
                    <span></span><span></span><span></span>
                </button>
                <div id="site-navbar-menu" class="site-navbar-menu">
                    ${isAdminNavbar ? `
                        ${role === 'ADMIN' ? '<a href="adminUsuarios.html">Gestionar clientes</a>' : ''}
                        <a href="adminProductos.html">Gestionar productos</a>
                        <a href="index.html" id="logout-btn">Cerrar sesión</a>
                    ` : `
                        <a href="portada.html">Inicio</a>
                        <a href="index.html">Productos</a>
                        <a href="nosotros.html">Nosotros</a>
                        <a href="blogs.html">Blogs</a>
                        <a href="contacto.html">Contacto</a>
                        <a href="acceso.html" id="nav-login-item">Iniciar Sesión</a>
                        <div class="site-navbar-account d-none" id="nav-user-dropdown">
                            <button type="button" id="account-toggle" aria-expanded="false">Mi Cuenta</button>
                            <div class="site-navbar-account-menu">
                                <a href="#">Perfil</a>
                                <a href="#" id="logout-btn">Cerrar Sesión</a>
                            </div>
                        </div>
                        <a class="site-navbar-cart" href="carrito.html">Cart (<span id="cart-count">0</span>)</a>
                    `}
                </div>
            </div>
        </nav>
    `);

    if (isAdminNavbar) {
        const adminPage = window.location.pathname.split('/').pop().toLowerCase();
        document.querySelectorAll('#site-navbar-menu > a').forEach(link => {
            const linkPage = link.getAttribute('href')?.split('#')[0].toLowerCase();
            if (linkPage === adminPage) link.classList.add('active');
        });
    }

    const activePage = currentPage === 'carrito.html'
        ? 'carrito.html'
        : currentPage === 'blogs.html'
        ? 'blogs.html'
        : currentPage === 'nosotros.html'
            ? 'nosotros.html'
            : currentPage === 'contacto.html'
                ? 'contacto.html'
                : ['acceso.html', 'login.html', 'registro.html'].includes(currentPage)
                    ? 'acceso.html'
                    : ['compra.html', 'carrito.html', 'comprartarjeta.html'].includes(currentPage)
                        ? 'compra.html'
                        : ['index.html', 'listarproductos.html', 'detalle.html', 'catjordan.html', 'catnikesports.html', 'catnikeurban.html', 'jordan.html', 'nike.html', 'nike.sports.html'].includes(currentPage)
                            ? 'index.html'
                            : 'portada.html';

    document.querySelectorAll('#site-navbar-menu > a').forEach(link => {
        if (link.getAttribute('href') === activePage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    const toggle = document.querySelector('.site-navbar-toggle');
    const menu = document.getElementById('site-navbar-menu');
    toggle?.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('is-open', !expanded);
    });

    const accountToggle = document.getElementById('account-toggle');
    accountToggle?.addEventListener('click', () => {
        const account = document.getElementById('nav-user-dropdown');
        account.classList.toggle('is-open');
        accountToggle.setAttribute('aria-expanded', String(account.classList.contains('is-open')));
    });

    const usuarioActivo = localStorage.getItem('usuarioActivo');
    if (usuarioActivo) {
        document.getElementById('nav-login-item')?.classList.add('d-none');
        document.getElementById('nav-user-dropdown')?.classList.remove('d-none');
    }

    document.getElementById('logout-btn')?.addEventListener('click', event => {
        event.preventDefault();
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('usuarioSesion');
        window.location.href = isAdminNavbar ? 'index.html' : window.location.href;
    });

    if (session?.id) {
        fetch(`http://localhost:8080/api/clientes/${session.id}/carrito`)
            .then(response => response.ok ? response.json() : null)
            .then(cart => {
                const count = (cart?.items || []).reduce((total, item) => total + Number(item.cantidad || 0), 0);
                const cartCount = document.getElementById('cart-count');
                if (cartCount) cartCount.textContent = count;
            })
            .catch(() => {});
    }
});
