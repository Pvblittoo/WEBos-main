"use strict";

const screen = document.getElementById("scene");
const svg = document.getElementById("svg");
const xmlns = "http://www.w3.org/2000/svg";
const xlinkns = "http://www.w3.org/1999/xlink";

let width, height;
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// Rastrear el movimiento del ratón/táctil
window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
}, false);

// Ajustar el tamaño del lienzo de movimiento
const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
};
window.addEventListener("resize", resize, false);
resize();

// Función para clonar las piezas del SVG (cabeza y aletas)
const prepend = (id, scale) => {
    const elem = document.createElementNS(xmlns, "use");
    elem.setAttributeNS(xlinkns, "href", id);
    elem.setAttribute("transform", `scale(${scale})`);
    screen.prepend(elem);
    return elem;
};

// Configuración de los segmentos del cuerpo
const n = 50; 
const elements = [];

// Crear el cuerpo del dragón
for (let i = 0; i < n; i++) {
    const scale = 1 - (i / n) * 0.7; 
    const id = i === 0 ? "#head" : "#aleta"; // El primer segmento es la cabeza, los demás aletas
    const node = prepend(id, scale);
    
    elements.push({
        node: node,
        x: pointer.x,
        y: pointer.y,
        scale: scale,
        angle: 0
    });
}

// Bucle de animación (Cinemática Inversa)
const run = () => {
    requestAnimationFrame(run);

    let leader = elements[0];
    
    // La cabeza persigue el cursor
    leader.x += (pointer.x - leader.x) * 0.15;
    leader.y += (pointer.y - leader.y) * 0.15;

    // Los segmentos del cuerpo siguen al segmento anterior
    for (let i = 1; i < n; i++) {
        let current = elements[i];
        let previous = elements[i - 1];
        
        let dx = previous.x - current.x;
        let dy = previous.y - current.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        const spacing = 8 * current.scale;
        
        if (dist > spacing) {
            current.x = previous.x - (dx / dist) * spacing;
            current.y = previous.y - (dy / dist) * spacing;
        }
        
        // Calcular ángulo para cada aleta
        current.angle = Math.atan2(dy, dx) * (180 / Math.PI);
    }
    
    // Ajustar el ángulo específico de la cabeza
    if (elements.length > 1) {
        let dx = elements[0].x - elements[1].x;
        let dy = elements[0].y - elements[1].y;
        elements[0].angle = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    // Aplicar las coordenadas y rotaciones a los elementos en el DOM
    for (let i = 0; i < n; i++) {
        let el = elements[i];
        el.node.setAttribute("transform", `translate(${el.x}, ${el.y}) rotate(${el.angle}) scale(${el.scale})`);
    }
};

// Iniciar la animación
run();