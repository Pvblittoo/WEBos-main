document.addEventListener('DOMContentLoaded', () => {
    const productId = new URLSearchParams(window.location.search).get('id');
    const sizePicker = document.getElementById('size-picker');
    const quantityInput = document.getElementById('cantidad');
    const orderForm = document.querySelector('.order-form');
    let availableSizes = {};

    if (!sizePicker) return;

    const showMessage = message => {
        sizePicker.textContent = message;
    };

    if (!productId) {
        showMessage('Producto no seleccionado.');
        return;
    }

    fetch('http://localhost:8080/api/productos')
        .then(response => {
            if (!response.ok) throw new Error('No se pudieron cargar los productos');
            return response.json();
        })
        .then(products => {
            const product = products.find(item => String(item.id) === String(productId));
            availableSizes = product?.tallasDisponibles || {};
            const sizes = Object.entries(availableSizes)
                .filter(([, stock]) => Number(stock) > 0)
                .sort(([firstSize], [secondSize]) => Number(firstSize) - Number(secondSize));

            if (!product || sizes.length === 0) {
                showMessage('No hay tallas disponibles para este producto.');
                return;
            }

            document.title = `Comprar ${product.nombreModelo}`;
            sizePicker.replaceChildren();

            sizes.forEach(([size, stock], index) => {
                const input = document.createElement('input');
                const inputId = `size-${String(size).replace('.', '-')}`;
                input.type = 'radio';
                input.name = 'size';
                input.id = inputId;
                input.value = size;
                input.required = true;
                input.checked = index === 0;

                const label = document.createElement('label');
                label.htmlFor = inputId;
                label.textContent = `${size} (${stock} disponibles)`;

                sizePicker.append(input, label);
            });

            orderForm?.addEventListener('submit', async event => {
                event.preventDefault();

                const session = JSON.parse(localStorage.getItem('usuarioSesion') || 'null');
                const customerId = session?.id;
                const selectedSize = document.querySelector('input[name="size"]:checked')?.value;
                const quantity = Number(quantityInput?.value);

                if (!customerId) {
                    alert('Debes iniciar sesión para agregar productos al carrito.');
                    window.location.href = 'login.html';
                    return;
                }

                const stock = Number(availableSizes[selectedSize]);
                if (!selectedSize || !Number.isInteger(quantity) || quantity < 1 || quantity > stock) {
                    alert(`La cantidad debe estar entre 1 y ${stock || 0} para la talla seleccionada.`);
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:8080/api/clientes/${customerId}/carrito/items`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productoId: Number(productId), talla: selectedSize, cantidad: quantity })
                    });

                    if (!response.ok) throw new Error(await response.text());
                    window.location.href = 'carrito.html';
                } catch (error) {
                    console.error('Hubo un problema al agregar al carrito:', error);
                    alert(error.message || 'No se pudo agregar el producto al carrito.');
                }
            });
        })
        .catch(error => {
            console.error('Hubo un problema al cargar las tallas:', error);
            showMessage('No se pudieron cargar las tallas. Verifica que el servidor backend esté encendido.');
        });
});