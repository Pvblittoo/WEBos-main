document.getElementById('form-contacto')?.addEventListener('submit', event => {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contenido = document.getElementById('contenido').value;
    const asunto = encodeURIComponent('Nuevo contacto desde Sneakers Store');
    const cuerpo = encodeURIComponent(`Nombre: ${nombre}\nCorreo de contacto: ${correo}\n\nMensaje:\n${contenido}`);
    const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=se.balladares@duocuc.cl&su=${asunto}&body=${cuerpo}`;
    window.open(urlGmail, '_blank');
});
