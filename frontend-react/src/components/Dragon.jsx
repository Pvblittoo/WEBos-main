
import { useEffect, useRef } from 'react';

function Dragon() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const xmlns = 'http://www.w3.org/2000/svg';

    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const moverPuntero = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };

    window.addEventListener('pointermove', moverPuntero);

    const n = 50;
    const elements = [];

    // Crear los 50 segmentos originales
    for (let i = 0; i < n; i++) {
      const scale = 1 - (i / n) * 0.7;
      const id = i === 0 ? '#head' : '#aleta';

      const node = document.createElementNS(xmlns, 'use');
      node.setAttribute('href', id);

      scene.prepend(node);

      elements.push({
        node,
        x: pointer.x,
        y: pointer.y,
        scale,
        angle: 0,
      });
    }

    let animationId;

    const run = () => {
      const leader = elements[0];

      leader.x += (pointer.x - leader.x) * 0.15;
      leader.y += (pointer.y - leader.y) * 0.15;

      for (let i = 1; i < n; i++) {
        const current = elements[i];
        const previous = elements[i - 1];

        const dx = previous.x - current.x;
        const dy = previous.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const spacing = 8 * current.scale;

        if (dist > spacing) {
          current.x = previous.x - (dx / dist) * spacing;
          current.y = previous.y - (dy / dist) * spacing;
        }

        current.angle =
          Math.atan2(dy, dx) * (180 / Math.PI);
      }

      if (elements.length > 1) {
        const dx = elements[0].x - elements[1].x;
        const dy = elements[0].y - elements[1].y;

        elements[0].angle =
          Math.atan2(dy, dx) * (180 / Math.PI);
      }

      for (const el of elements) {
        el.node.setAttribute(
          'transform',
          `translate(${el.x}, ${el.y}) rotate(${el.angle}) scale(${el.scale})`
        );
      }

      animationId = requestAnimationFrame(run);
    };

    run();

    // Limpiar al salir de la portada
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('pointermove', moverPuntero);
      scene.replaceChildren();
    };
  }, []);

  return (
    <div className="dragon-container">
      <svg id="svg" width="100%" height="100%">
        <defs>
          {/* CABEZA ORIGINAL */}
          <g id="head">
            <path
              fill="#111"
              stroke="#FF0033"
              strokeWidth="1"
              d="M-13.4-9.5c0,0-5.8,5.4-5.8,9.5s5.8,9.5,5.8,9.5l8.7-3.1l6.1,3.1c0,0,4.2-6.5,4.2-9.5s-4.2-9.5-4.2-9.5l-6.1,3.1L-13.4-9.5z"
            />
            <circle cx="-11" cy="-4" r="1.5" fill="#FF0033" />
            <circle cx="-11" cy="4" r="1.5" fill="#FF0033" />
          </g>

          {/* ALETAS ORIGINALES */}
          <g id="aleta">
            <path
              fill="url(#linearGradient_1)"
              d="M0,0 c10,-15 30,-20 50,-10 c-15,-5 -35,-2 -50,10 Z"
            />
            <path
              fill="url(#linearGradient_1)"
              d="M0,0 c10,15 30,20 50,10 c-15,5 -35,2 -50,-10 Z"
            />
          </g>

          {/* GRADIENTE ORIGINAL */}
          <linearGradient
            id="linearGradient_1"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
          >
            <stop offset="0" stopColor="#FF0033" stopOpacity="0.8" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g id="scene" ref={sceneRef}></g>
      </svg>
    </div>
  );
}

export default Dragon;
