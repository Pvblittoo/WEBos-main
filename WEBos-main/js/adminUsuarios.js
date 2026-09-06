document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('usuarioSesion') || 'null');
    if (String(session?.rol || session?.role || '').toUpperCase() !== 'ADMIN') { window.location.replace('adminProductos.html'); return; }
    const apiBase = 'http://localhost:8080/api/clientes';
    const form = document.getElementById('user-form');
    const tableBody = document.getElementById('users-table-body');
    const tableMessage = document.getElementById('users-table-message');
    const formMessage = document.getElementById('user-form-message');
    const formTitle = document.getElementById('user-form-title');
    const submitButton = document.getElementById('user-submit-button');
    const cancelButton = document.getElementById('cancel-user-edit');
    const idField = document.getElementById('user-id');
    const fields = ['nombreCompleto', 'email', 'contrasena', 'numero', 'region', 'comuna'];
    const getField = name => document.getElementById(name);
    const userId = user => user.id ?? user.idCliente;
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

    function showMessage(element, message, isError = false) { element.textContent = message; element.classList.toggle('error', isError); }
    function resetForm() {
        form.reset(); idField.value = ''; formTitle.textContent = 'Nuevo usuario'; submitButton.textContent = 'Guardar usuario'; cancelButton.classList.add('hidden'); showMessage(formMessage, '');
    }
    function fillForm(user) {
        idField.value = userId(user);
        fields.forEach(field => { if (field !== 'contrasena') getField(field).value = user[field] ?? ''; });
        getField('contrasena').value = '';
        formTitle.textContent = 'Editar usuario'; submitButton.textContent = 'Actualizar usuario'; cancelButton.classList.remove('hidden'); showMessage(formMessage, 'Editando el usuario seleccionado.');
        window.scrollTo({ top: document.querySelector('.users-admin').offsetTop, behavior: 'smooth' });
    }
    function renderUsers(users) {
        tableBody.innerHTML = users.length ? users.map(user => `
            <tr><td><p class="product-name">${escapeHtml(user.nombreCompleto || user.pnombre || 'Sin nombre')}</p><p class="product-id">ID: ${escapeHtml(userId(user))}</p></td><td>${escapeHtml(user.email || 'Sin correo')}<br><span class="product-id">${escapeHtml(user.numero || 'Sin teléfono')}</span></td><td>${escapeHtml(user.comuna || 'Sin comuna')}<br><span class="product-id">${escapeHtml(user.region || 'Sin región')}</span></td><td><div class="actions"><button class="action-button" type="button" data-user-action="edit" data-id="${escapeHtml(userId(user))}">Editar</button><button class="action-button delete" type="button" data-user-action="delete" data-id="${escapeHtml(userId(user))}">Eliminar</button></div></td></tr>`).join('') : '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
    }
    async function loadUsers() {
        showMessage(tableMessage, 'Cargando usuarios...');
        try {
            const response = await fetch(apiBase);
            if (!response.ok) throw new Error('No se pudo obtener la lista de usuarios.');
            const users = await response.json(); renderUsers(users);
            showMessage(tableMessage, `${users.length} usuario${users.length === 1 ? '' : 's'} registrado${users.length === 1 ? '' : 's'}.`);
        } catch (error) { renderUsers([]); showMessage(tableMessage, `${error.message} Verifica que el backend esté encendido.`, true); }
    }
    function userPayload() {
        return fields.reduce((payload, field) => {
            const value = getField(field).value.trim();
            if (field !== 'contrasena' || value) payload[field] = value;
            return payload;
        }, {});
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const id = idField.value; const payload = userPayload();
        if (!id && !payload.contrasena) { showMessage(formMessage, 'La contraseña es obligatoria para crear un usuario.', true); return; }
        submitButton.disabled = true; showMessage(formMessage, id ? 'Actualizando usuario...' : 'Guardando usuario...');
        try {
            const response = await fetch(id ? `${apiBase}/${id}` : apiBase, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(await response.text() || 'La operación no pudo completarse.');
            resetForm(); await loadUsers(); showMessage(formMessage, id ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        } catch (error) { showMessage(formMessage, error.message, true); } finally { submitButton.disabled = false; }
    });
    tableBody.addEventListener('click', async event => {
        const button = event.target.closest('[data-user-action]'); if (!button) return;
        const selectedId = button.dataset.id;
        if (button.dataset.userAction === 'edit') {
            try { const response = await fetch(apiBase); const users = await response.json(); fillForm(users.find(user => String(userId(user)) === selectedId)); } catch (error) { showMessage(tableMessage, 'No se pudo cargar el usuario para editar.', true); }
            return;
        }
        if (button.dataset.userAction === 'delete' && window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
            button.disabled = true;
            try { const response = await fetch(`${apiBase}/${selectedId}`, { method: 'DELETE' }); if (!response.ok) throw new Error(await response.text() || 'No se pudo eliminar el usuario.'); await loadUsers(); showMessage(formMessage, 'Usuario eliminado correctamente.'); } catch (error) { showMessage(tableMessage, error.message, true); button.disabled = false; }
        }
    });
    cancelButton.addEventListener('click', resetForm);
    document.getElementById('refresh-users').addEventListener('click', loadUsers);
    loadUsers();
});
