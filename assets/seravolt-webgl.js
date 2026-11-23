/**
 * <sv-brass-stage> — Lightweight Raw WebGL Architectural Brushed-Brass & Blueprint Shader
 * Renders an ultra-subtle interactive Warm Chalk drafting grid with metallic Brushed Volt Brass
 * anisotropic sheen reacting to cursor coordinates. Zero external runtime dependencies.
 */
class SvBrassStage extends HTMLElement {
  connectedCallback() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.dataset.webglEnabled === 'false') return;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'sv-switcher__webgl';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.appendChild(this.canvas);

    const gl = this.canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!gl) return;
    this.gl = gl;

    const vs = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fs = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_mode;

      void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_res.x / max(u_res.y, 1.0), 1.0);

        // Subtle architectural millimeter drafting grid
        vec2 gridUV = uv * aspect * 14.0;
        vec2 grid = abs(fract(gridUV - 0.5) - 0.5) / 0.03;
        float line = 1.0 - min(min(grid.x, grid.y), 1.0);

        // Anisotropic Brushed Volt Brass radial sheen following pointer
        vec2 delta = (uv - u_mouse) * aspect;
        float dist = length(delta);
        float brush = sin((uv.x * 160.0 + u_time * 0.4) + sin(uv.y * 8.0)) * 0.5 + 0.5;
        float sheen = exp(-dist * 3.1) * (0.16 + 0.06 * brush);

        // Mode-specific accent warmth (0: Obsidian, 1: Saddle Cognac, 2: Oxblood)
        vec3 brass = vec3(0.776, 0.592, 0.286);
        vec3 limestone = vec3(0.886, 0.867, 0.835);
        vec3 tint = mix(brass, vec3(0.549, 0.290, 0.184), clamp(u_mode * 0.45, 0.0, 1.0));

        vec3 col = mix(limestone, tint, clamp(sheen * 3.0, 0.0, 1.0));
        float alpha = clamp(line * 0.24 + sheen * 0.85, 0.0, 0.52);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.uRes = gl.getUniformLocation(prog, 'u_res');
    this.uMouse = gl.getUniformLocation(prog, 'u_mouse');
    this.uTime = gl.getUniformLocation(prog, 'u_time');
    this.uMode = gl.getUniformLocation(prog, 'u_mode');

    this.mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    this.modeValue = 0;
    this.targetMode = 0;

    this._onResize = () => {
      const rect = this.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };

    this._onPointer = (e) => {
      const rect = this.getBoundingClientRect();
      this.mouse.tx = (e.clientX - rect.left) / Math.max(rect.width, 1);
      this.mouse.ty = 1.0 - (e.clientY - rect.top) / Math.max(rect.height, 1);
    };

    this.parentElement?.addEventListener('pointermove', this._onPointer, { passive: true });
    this._ro = new ResizeObserver(this._onResize);
    this._ro.observe(this);
    this._onResize();

    const start = performance.now();
    const render = (now) => {
      this._raf = requestAnimationFrame(render);
      this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.08;
      this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.08;
      this.modeValue += (this.targetMode - this.modeValue) * 0.08;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.uMouse, this.mouse.x, this.mouse.y);
      gl.uniform1f(this.uTime, (now - start) * 0.001);
      gl.uniform1f(this.uMode, this.modeValue);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    this._raf = requestAnimationFrame(render);
  }

  setMode(index) {
    this.targetMode = Number(index) || 0;
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this.parentElement?.removeEventListener('pointermove', this._onPointer);
  }
}

if (!customElements.get('sv-brass-stage')) {
  customElements.define('sv-brass-stage', SvBrassStage);
}
