
import { useEffect, useRef } from 'react';

const vertexSource = `
  attribute vec3 position;

  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentSource = `
  precision highp float;

  uniform vec2 resolution;
  uniform float time;
  uniform float xScale;
  uniform float yScale;
  uniform float distortion;

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution)
      / min(resolution.x, resolution.y);

    float d = length(p) * distortion;

    float rx = p.x * (1.0 + d);
    float gx = p.x;
    float bx = p.x * (1.0 - d);

    float r = 0.05 / abs(
      p.y + sin((rx + time) * xScale) * yScale
    );

    float g = 0.05 / abs(
      p.y + sin((gx + time) * xScale) * yScale
    );

    float b = 0.05 / abs(
      p.y + sin((bx + time) * xScale) * yScale
    );

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

function WebGLBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    function crearShader(tipo, codigo) {
      const shader = gl.createShader(tipo);
      if (!shader) return null;

      gl.shaderSource(shader, codigo);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    const vertexShader = crearShader(
      gl.VERTEX_SHADER,
      vertexSource
    );

    const fragmentShader = crearShader(
      gl.FRAGMENT_SHADER,
      fragmentSource
    );

    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();

    if (!positionBuffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0,
         1, -1, 0,
        -1,  1, 0,

        -1,  1, 0,
         1, -1, 0,
         1,  1, 0
      ]),
      gl.STATIC_DRAW
    );

    const position = gl.getAttribLocation(
      program,
      'position'
    );

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
      position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    const resolution = gl.getUniformLocation(
      program,
      'resolution'
    );

    const time = gl.getUniformLocation(
      program,
      'time'
    );

    const xScale = gl.getUniformLocation(
      program,
      'xScale'
    );

    const yScale = gl.getUniformLocation(
      program,
      'yScale'
    );

    const distortion = gl.getUniformLocation(
      program,
      'distortion'
    );

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    window.addEventListener('resize', resize);
    resize();

    let animationId;

    function render(now) {
      gl.uniform2f(
        resolution,
        canvas.width,
        canvas.height
      );

      gl.uniform1f(time, now * 0.001);
      gl.uniform1f(xScale, 2.5);
      gl.uniform1f(yScale, 0.15);
      gl.uniform1f(distortion, 0.05);

      gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
      );

      animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="webgl-background"
      aria-hidden="true"
    />
  );
}

export default WebGLBackground;
