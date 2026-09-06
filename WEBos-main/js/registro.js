        const regionesData = [
            { id: "arica", nombre: "Región de Arica y Parinacota" },
            { id: "tarapaca", nombre: "Región de Tarapacá" },
            { id: "antofagasta", nombre: "Región de Antofagasta" },
            { id: "atacama", nombre: "Región de Atacama" },
            { id: "coquimbo", nombre: "Región de Coquimbo" },
            { id: "valparaiso", nombre: "Región de Valparaíso" },
            { id: "rm", nombre: "Región Metropolitana de Santiago" },
            { id: "ohiggins", nombre: "Región del Libertador Gral. Bernardo O'Higgins" },
            { id: "maule", nombre: "Región del Maule" },
            { id: "nuble", nombre: "Región de Ñuble" },
            { id: "biobio", nombre: "Región del Biobío" },
            { id: "araucania", nombre: "Región de la Araucanía" },
            { id: "rios", nombre: "Región de Los Ríos" },
            { id: "lagos", nombre: "Región de Los Lagos" },
            { id: "aysen", nombre: "Región de Aysén del G. Carlos Ibáñez del Campo" },
            { id: "magallanes", nombre: "Región de Magallanes y de la Antártica Chilena" }
        ];

        const comunasPorRegion = {
            arica: ["Arica", "Camarones", "Putre", "General Lagos"],
            tarapaca: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
            antofagasta: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
            atacama: ["Copiapó", "Caldera", "Tierra Amarilla", "Vallenar", "Alto del Carmen", "Freirina", "Huasco", "Chañaral", "Diego de Almagro"],
            coquimbo: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
            valparaiso: ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "El Quisco", "El Tabo", "Cartagena", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
            rm: ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
            ohiggins: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
            maule: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
            nuble: ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ranquil", "Treguaco", "San Carlos", "Coihueco", "San Fabián", "San Nicolás", "Ñiquén"],
            biobio: ["Concepción", "Coronel", "Chiguayante", "Florida", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lota", "Penco", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa"],
            araucania: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
            rios: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
            lagos: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
            aysen: ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
            magallanes: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
        };

        const btnRegion = document.getElementById('btn-region');
        const menuRegion = document.getElementById('menu-region');
        const inputRegion = document.getElementById('region');

        const btnComuna = document.getElementById('btn-comuna');
        const menuComuna = document.getElementById('menu-comuna');
        const inputComuna = document.getElementById('comuna');

        // Cargar Regiones
        regionesData.forEach(r => {
            const item = document.createElement('div');
            item.className = 'custom-option';
            item.textContent = r.nombre;
            item.addEventListener('click', () => seleccionarRegion(r));
            menuRegion.appendChild(item);
        });

        // Abrir/cerrar menú región
        btnRegion.addEventListener('click', (e) => {
            e.stopPropagation();
            menuComuna.classList.remove('show');
            menuRegion.classList.toggle('show');
        });

        // Abrir/cerrar menú comuna
        btnComuna.addEventListener('click', (e) => {
            e.stopPropagation();
            menuRegion.classList.remove('show');
            menuComuna.classList.toggle('show');
        });

        function seleccionarRegion(region) {
            btnRegion.textContent = region.nombre;
            inputRegion.value = region.id;
            menuRegion.classList.remove('show');

            btnComuna.textContent = '-- Seleccione la comuna --';
            btnComuna.disabled = false;
            inputComuna.value = '';
            menuComuna.innerHTML = '';

            if (comunasPorRegion[region.id]) {
                comunasPorRegion[region.id].forEach(comuna => {
                    const item = document.createElement('div');
                    item.className = 'custom-option';
                    item.textContent = comuna;
                    item.addEventListener('click', () => seleccionarComuna(comuna));
                    menuComuna.appendChild(item);
                });
            }
        }

        function seleccionarComuna(comuna) {
            btnComuna.textContent = comuna;
            inputComuna.value = comuna.toLowerCase().replace(/\s+/g, '-');
            menuComuna.classList.remove('show');
        }

        // Cerrar desplegables al hacer clic en cualquier parte fuera
        document.addEventListener('click', () => {
            menuRegion.classList.remove('show');
            menuComuna.classList.remove('show');
        });

        document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Captura de datos desde el formulario
    const nombreCompleto = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const confirmarCorreo = document.getElementById('confirmar-correo').value.trim();
    const password = document.getElementById('password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;
    const telefono = document.getElementById('telefono').value.trim();
    const region = document.getElementById('region').value;
    const comuna = document.getElementById('comuna').value;

    const dominiosPermitidos = /^[a-zA-Z0-9._%+-]+@(gmail\.com|duocuc\.cl|profesorduoc\.cl)$/i;

    if (!dominiosPermitidos.test(correo)) {
        alert('El correo debe pertenecer a uno de los siguientes dominios: @gmail.com, @duocuc.cl o @profesorduoc.cl');
        return;
    }

    // Validaciones en el cliente
    if (correo !== confirmarCorreo) {
        alert('Los correos electrónicos no coinciden.');
        return;
    }

    if (password !== confirmarPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    if (password.length > 10) {
        alert('La contraseña no puede exceder los 10 caracteres.');
        return;
    }

    if (!region || !comuna) {
        alert('Debes seleccionar una región y una comuna.');
        return;
    }

    // Estructura adaptada al modelo Java (Cliente)
    const nuevoCliente = {
        nombreCompleto,
        email: correo,
        contrasena: password,
        numero: telefono,
        region: region,
        comuna: comuna
    };

    try {
        const response = await fetch('http://localhost:8080/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoCliente)
        });

        if (response.ok) {
            alert('¡Registro exitoso! Redirigiendo al inicio de sesión...');
            window.location.href = 'login.html';
        } else {
            const errorMsg = await response.text();
            alert('Error al registrar el cliente: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error de red/servidor:', error);
        alert('Ocurrió un error al conectar con el servidor.');
    }
});