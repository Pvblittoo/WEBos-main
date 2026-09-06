document.addEventListener('DOMContentLoaded', () => {
    const role = String(JSON.parse(localStorage.getItem('usuarioSesion') || 'null')?.rol || JSON.parse(localStorage.getItem('usuarioSesion') || 'null')?.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'VENDEDOR') { window.location.replace('acceso.html'); return; }
    const apiBase = 'http://localhost:8080/api/productos';
    const form = document.getElementById('product-form');
    const tableBody = document.getElementById('products-table-body');
    const tableMessage = document.getElementById('table-message');
    const formMessage = document.getElementById('form-message');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const cancelButton = document.getElementById('cancel-edit');
    const idField = document.getElementById('product-id');
    const sizesList = document.getElementById('sizes-list');
    const sizesMessage = document.getElementById('sizes-message');
    const fields = ['nombreModelo', 'tipoCategoria', 'precio', 'linkImagen', 'descripcion'];
    const getField = name => document.getElementById(name);
    const money = value => `$ ${Number(value || 0).toLocaleString('es-CL')}`;
    const categoryName = value => ({ jordan: 'Jordan', sports: 'Nike Sports', urban: 'Nike Urban' }[String(value || '').toLowerCase()] || value || 'Sin categoría');

    function showMessage(element, message, isError = false) { element.textContent = message; element.classList.toggle('error', isError); }
    function addSizeRow(size = '', stock = '') {
        const row = document.createElement('div');
        row.className = 'size-row';
        row.innerHTML = `<input class="size-input" type="number" min="1" max="60" step="0.5" placeholder="Talla" aria-label="Talla" value="${size}"><input class="stock-input" type="number" min="0" step="1" placeholder="Stock" aria-label="Stock para la talla" value="${stock}"><button class="remove-size" type="button" aria-label="Eliminar talla">×</button>`;
        row.querySelector('.remove-size').addEventListener('click', () => { row.remove(); validateSizes(); });
        sizesList.appendChild(row);
    }
    function validateSizes() {
        const rows = [...sizesList.querySelectorAll('.size-row')];
        const sizes = rows.map(row => row.querySelector('.size-input').value.trim());
        const hasInvalidRow = rows.some(row => {
            const size = Number(row.querySelector('.size-input').value);
            const stock = Number(row.querySelector('.stock-input').value);
            return !Number.isFinite(size) || size < 1 || size > 60 || !Number.isInteger(stock) || stock < 0;
        });
        const hasDuplicates = sizes.some((size, index) => size && sizes.indexOf(size) !== index);
        const message = !rows.length ? 'Añade al menos una talla.' : hasInvalidRow ? 'Completa cada talla y usa un stock entero igual o mayor que 0.' : hasDuplicates ? 'No puedes repetir una talla.' : '';
        showMessage(sizesMessage, message, Boolean(message));
        return !message;
    }
    function getSizes() {
        return [...sizesList.querySelectorAll('.size-row')].reduce((sizes, row) => {
            const size = row.querySelector('.size-input').value.trim();
            const stock = Number(row.querySelector('.stock-input').value);
            if (size) sizes[size] = stock;
            return sizes;
        }, {});
    }
    function resetForm() {
        form.reset(); idField.value = ''; sizesList.replaceChildren(); addSizeRow(); formTitle.textContent = 'Nueva zapatilla'; submitButton.textContent = 'Guardar producto'; cancelButton.classList.add('hidden'); showMessage(formMessage, ''); showMessage(sizesMessage, '');
    }
    function fillForm(product) {
        if (!product) return;
        idField.value = product.id;
        fields.forEach(field => { getField(field).value = product[field] ?? ''; });
        sizesList.replaceChildren();
        Object.entries(product.tallasDisponibles || {}).forEach(([size, stock]) => addSizeRow(size, stock));
        if (!sizesList.children.length) addSizeRow();
        formTitle.textContent = 'Editar zapatilla'; submitButton.textContent = 'Actualizar producto'; cancelButton.classList.remove('hidden'); showMessage(formMessage, 'Editando el producto seleccionado.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function renderProducts(products) {
        tableBody.innerHTML = products.length ? products.map(product => `
                <tr><td><div class="product-cell"><img src="${product.linkImagen || ''}" alt="${product.nombreModelo || 'Producto'}" onerror="this.style.visibility='hidden'"><div><p class="product-name">${product.nombreModelo || 'Sin nombre'}</p><p class="product-id">ID: ${product.id}</p></div></div></td><td><span class="category">${categoryName(product.tipoCategoria)}</span></td><td class="price">${money(product.precio)}<small class="stock-summary">${sizeSummary(product.tallasDisponibles)}</small></td><td><div class="actions"><button class="action-button" type="button" data-action="edit" data-id="${product.id}">Editar</button><button class="action-button delete" type="button" data-action="delete" data-id="${product.id}">Eliminar</button></div></td></tr>`).join('') : '<tr><td colspan="4">No hay productos registrados.</td></tr>';
    }
            function sizeSummary(sizes = {}) {
            const entries = Object.entries(sizes);
            return entries.length ? `${entries.length} talla${entries.length === 1 ? '' : 's'} / ${entries.reduce((total, [, stock]) => total + Number(stock || 0), 0)} uds.` : 'Sin stock configurado';
            }
    async function loadProducts() {
        showMessage(tableMessage, 'Cargando productos...');
        try {
            const response = await fetch(apiBase);
            if (!response.ok) throw new Error('No se pudo obtener el inventario.');
            const products = await response.json(); renderProducts(products);
            showMessage(tableMessage, `${products.length} producto${products.length === 1 ? '' : 's'} registrado${products.length === 1 ? '' : 's'}.`);
        } catch (error) { renderProducts([]); showMessage(tableMessage, `${error.message} Verifica que el backend esté encendido.`, true); }
    }
    function productPayload() {
        const payload = fields.reduce((result, field) => {
            result[field] = field === 'precio' ? Number(getField(field).value) : getField(field).value.trim();
            return result;
        }, {});
        payload.tallasDisponibles = getSizes();
        return payload;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        if (!validateSizes()) return;
        const id = idField.value; submitButton.disabled = true; showMessage(formMessage, id ? 'Actualizando producto...' : 'Guardando producto...');
        try {
            const response = await fetch(id ? `${apiBase}/${id}` : apiBase, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productPayload()) });
            if (!response.ok) throw new Error(await response.text() || 'La operación no pudo completarse.');
            resetForm(); await loadProducts(); showMessage(formMessage, id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
        } catch (error) { showMessage(formMessage, error.message, true); } finally { submitButton.disabled = false; }
    });
    tableBody.addEventListener('click', async event => {
        const button = event.target.closest('[data-action]'); if (!button) return;
        const productId = button.dataset.id;
        if (button.dataset.action === 'edit') {
            try { const response = await fetch(apiBase); const products = await response.json(); fillForm(products.find(product => String(product.id) === productId)); } catch (error) { showMessage(tableMessage, 'No se pudo cargar el producto para editar.', true); }
            return;
        }
        if (button.dataset.action === 'delete' && window.confirm('¿Eliminar esta zapatilla? Esta acción no se puede deshacer.')) {
            button.disabled = true;
            try { const response = await fetch(`${apiBase}/${productId}`, { method: 'DELETE' }); if (!response.ok) throw new Error(await response.text() || 'No se pudo eliminar el producto.'); await loadProducts(); showMessage(formMessage, 'Producto eliminado correctamente.'); } catch (error) { showMessage(tableMessage, error.message, true); button.disabled = false; }
        }
    });
    cancelButton.addEventListener('click', resetForm);
    document.getElementById('add-size').addEventListener('click', () => { addSizeRow(); sizesList.lastElementChild.querySelector('.size-input').focus(); });
    sizesList.addEventListener('input', validateSizes);
    document.getElementById('refresh-products').addEventListener('click', loadProducts);
    addSizeRow();
    loadProducts();
});
