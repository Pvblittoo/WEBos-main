document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('webgl-canvas');
    const vertexSource = document.getElementById('js-vertex-shader')?.textContent;
    const fragmentSource = document.getElementById('js-fragment-shader')?.textContent;
    const gl = canvas?.getContext('webgl');

    if (!canvas || !gl || !vertexSource || !fragmentSource) return;

    const createShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 0, 1, -1, 0, -1, 1, 0,
        -1, 1, 0, 1, -1, 0, 1, 1, 0
    ]), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, 'resolution');
    const time = gl.getUniformLocation(program, 'time');
    const xScale = gl.getUniformLocation(program, 'xScale');
    const yScale = gl.getUniformLocation(program, 'yScale');
    const distortion = gl.getUniformLocation(program, 'distortion');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const render = now => {
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform1f(time, now * 0.001);
        gl.uniform1f(xScale, 2.5);
        gl.uniform1f(yScale, 0.15);
        gl.uniform1f(distortion, 0.05);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
});
