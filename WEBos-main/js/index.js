const cards = document.querySelectorAll('.brand-card');
const body = document.getElementById('page-body');

if (body) {
    // Aseguramos que el fondo por defecto sea un color negro plano
    body.style.backgroundImage = 'none';
    body.style.backgroundColor = '#050505';

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const background = card.getAttribute('data-bg');
            if (!background) return;
            body.style.backgroundImage = `url('${background}')`;
            body.style.backgroundSize = '280px';
            body.style.backgroundRepeat = 'repeat';
        });

        card.addEventListener('mouseleave', () => {
            // Al quitar el mouse, vuelve a ser negro plano en vez de cargar la imagen previa
            body.style.backgroundImage = 'none';
            body.style.backgroundColor = '#050505';
        });
    });
}