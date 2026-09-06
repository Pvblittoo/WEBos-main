document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('cart-content');
    const session = JSON.parse(localStorage.getItem('usuarioSesion') || 'null');
    const customerId = session?.id;
    const apiBase = customerId ? `http://localhost:8080/api/clientes/${customerId}/carrito` : null;

    if (!customerId) {
        content.innerHTML = '<p class="cart-status">Debes iniciar sesión para ver tu carrito.</p>';
        return;
    }

    const money = value => `$${Number(value || 0).toLocaleString('es-CL')}`;

    const sendReceipt = async cart => {
        const email = session.email || session.correo;
        if (!email) {
            alert('No encontramos el correo del cliente en la sesión.');
            return false;
        }

        const address = session.direccion || [session.region, session.comuna]
            .filter(Boolean)
            .join(', ') || 'Por confirmar';

        try {
            const response = await fetch(`http://localhost:8080/api/clientes/${customerId}/boletas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metodoPago: 'Pendiente',
                    direccion: address
                })
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'No se pudo crear la boleta.');
            }

            const boleta = await response.json();
            const total = boleta.total ?? cart.items.reduce((sum, item) => sum + item.subtotal, 0);
            const boletaNumber = boleta.id ? `N° ${boleta.id}` : '';
            const details = cart.items.map(item => [
                `Producto: ${item.nombre}`,
                `Talla: ${item.talla}`,
                `Cantidad: ${item.cantidad}`,
                `Precio unitario: ${money(item.precioUnitario)}`,
                `Subtotal: ${money(item.subtotal)}`
            ].join('\n')).join('\n\n');
            const body = [
                `BOLETA DE COMPRA - SNEAKERS STORE ${boletaNumber}`,
                '',
                details,
                '',
                `TOTAL GENERAL: ${money(total)}`,
                `Dirección: ${address}`,
                '',
                'Gracias por tu compra.'
            ].join('\n');

            const clearResponse = await fetch(apiBase, { method: 'DELETE' });
            if (!clearResponse.ok) {
                throw new Error(await clearResponse.text() || 'La compra se creó, pero no se pudo vaciar el carrito.');
            }

            alert('Compra realizada con éxito');
            window.location.reload();
            return true;
        } catch (error) {
            console.error('Hubo un problema al crear la boleta:', error);
            alert(error.message);
            return false;
        }
    };

    const getCart = async () => {
        const [cartResponse, productsResponse] = await Promise.all([
            fetch(apiBase),
            fetch('http://localhost:8080/api/productos')
        ]);
        if (!cartResponse.ok) throw new Error('No se pudo cargar el carrito.');
        const cart = await cartResponse.json();
        const products = productsResponse.ok ? await productsResponse.json() : [];
        const productMap = new Map(products.map(product => [String(product.id), product]));

        return {
            items: (cart.items || []).map(item => {
                const productId = item.productoId ?? item.producto?.id ?? item.product?.id;
                const product = item.producto || item.product || productMap.get(String(productId)) || {};
                const quantity = Number(item.cantidad || 0);
                const unitPrice = Number(item.precioUnitario ?? item.precio ?? product.precio ?? 0);
                return {
                    ...item,
                    productoId: productId,
                    nombre: item.nombreProducto || product.nombreModelo || 'Producto',
                    imagen: item.imagen || item.linkImagen || product.linkImagen || '',
                    talla: item.talla ?? item.size ?? '',
                    cantidad: quantity,
                    precioUnitario: unitPrice,
                    subtotal: Number(item.subtotal ?? unitPrice * quantity),
                    stock: Number(product.tallasDisponibles?.[String(item.talla ?? item.size)] ?? Infinity)
                };
            })
        };
    };

    const updateItem = async (item, quantity) => {
        const response = await fetch(`${apiBase}/items/${item.productoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ talla: item.talla, cantidad: quantity })
        });
        if (!response.ok) throw new Error(await response.text() || 'No se pudo actualizar el producto.');
    };

    const deleteItem = async item => {
        const size = encodeURIComponent(item.talla);
        const response = await fetch(`${apiBase}/items/${item.productoId}?talla=${size}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(await response.text() || 'No se pudo eliminar el producto.');
    };

    const render = cart => {
        if (!cart.items.length) {
            content.innerHTML = '<p class="empty-message">Tu carrito está vacío.</p>';
            return;
        }

        const total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        content.innerHTML = `
            <div class="cart-layout">
                <div class="cart-items">
                    ${cart.items.map((item, index) => `
                        <article class="cart-item">
                            <img class="cart-item-image" src="${item.imagen}" alt="${item.nombre}">
                            <div class="cart-item-info">
                                <h2>${item.nombre}</h2>
                                <p>Talla: ${item.talla}</p>
                                <p class="cart-item-price">Precio unitario: ${money(item.precioUnitario)}</p>
                                <div class="quantity-control" data-index="${index}">
                                    <button type="button" data-action="decrease" aria-label="Disminuir cantidad">-</button>
                                    <span class="quantity-value">${item.cantidad}</span>
                                    <button type="button" data-action="increase" aria-label="Aumentar cantidad">+</button>
                                </div>
                            </div>
                            <div class="cart-item-total">
                                <strong>${money(item.subtotal)}</strong>
                                <button type="button" class="remove-item" data-index="${index}">Eliminar</button>
                            </div>
                        </article>
                    `).join('')}
                </div>
                <aside class="cart-summary">
                    <h2>Resumen</h2>
                    <div class="summary-row">
                        <span>Total general</span>
                        <strong class="summary-total">${money(total)}</strong>
                    </div>
                    <button type="button" class="pay-cart" id="pay-cart">Pagar y enviar boleta</button>
                    <button type="button" class="empty-cart" id="empty-cart">Vaciar carrito</button>
                </aside>
            </div>`;

        content.querySelectorAll('.quantity-control button').forEach(button => {
            button.addEventListener('click', async () => {
                const item = cart.items[Number(button.parentElement.dataset.index)];
                const nextQuantity = item.cantidad + (button.dataset.action === 'increase' ? 1 : -1);
                if (nextQuantity < 1) return;
                if (nextQuantity > item.stock) {
                    alert(`Solo hay ${item.stock} unidades disponibles para la talla ${item.talla}.`);
                    return;
                }
                try {
                    await updateItem(item, nextQuantity);
                    render(await getCart());
                } catch (error) {
                    alert(error.message);
                }
            });
        });

        content.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', async () => {
                try {
                    await deleteItem(cart.items[Number(button.dataset.index)]);
                    render(await getCart());
                } catch (error) {
                    alert(error.message);
                }
            });
        });

        document.getElementById('empty-cart').addEventListener('click', async () => {
            try {
                const response = await fetch(apiBase, { method: 'DELETE' });
                if (!response.ok) throw new Error(await response.text() || 'No se pudo vaciar el carrito.');
                render(await getCart());
            } catch (error) {
                alert(error.message);
            }
        });

        document.getElementById('pay-cart').addEventListener('click', async event => {
            const button = event.currentTarget;
            button.disabled = true;
            button.textContent = 'Procesando...';
            const completed = await sendReceipt(cart);
            if (completed) {
                render(await getCart());
                return;
            }
            button.disabled = false;
            button.textContent = 'Pagar y enviar boleta';
        });
    };

    getCart().then(render).catch(error => {
        console.error('Hubo un problema con el carrito:', error);
        content.innerHTML = `<p class="cart-status">${error.message}</p>`;
    });
});
