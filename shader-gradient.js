/**
 * ShaderGradient Engine (Vanilla WebGL 2.0 / 1.0)
 * Inspired by ruucm/shadergradient and @react-three/fiber shaders.
 * Generates real-time, organic, living fluid gradients with smooth mouse displacement.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ShaderGradient = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Bright, happy, optimistic color palettes (RGB 0.0 - 1.0)
  const PALETTES = [
    {
      name: 'Joyful Sunrise',
      description: 'Warm, optimistic amber, radiant coral & electric sky',
      c1: [1.0, 0.42, 0.42],  // Coral #ff6b6b
      c2: [0.98, 0.72, 0.15], // Warm Amber #f59e0b
      c3: [0.05, 0.71, 0.85], // Sky Cyan #06b6d4
      c4: [0.55, 0.36, 0.96], // Orchid Violet #8b5cf6
      c5: [0.12, 0.82, 0.58], // Fresh Mint #10b981
      brightness: 1.05,
      contrast: 1.12
    },
    {
      name: 'Luminous Prism',
      description: 'Iridescent liquid crystal: rose, lavender & lemon gold',
      c1: [0.96, 0.45, 0.71], // Soft Rose #f472b6
      c2: [0.22, 0.74, 0.97], // Electric Azure #38bdf8
      c3: [0.98, 0.80, 0.18], // Lemon Gold #facc15
      c4: [0.75, 0.52, 0.99], // Lavender #c084fc
      c5: [0.32, 0.88, 0.61], // Spring Green #4ade80
      brightness: 1.15,
      contrast: 1.05
    },
    {
      name: 'Golden Radiance',
      description: 'Sunlit clarity: champagne gold, peach & electric sapphire',
      c1: [0.99, 0.65, 0.35], // Sunny Peach #fda4af
      c2: [0.97, 0.76, 0.22], // Champagne Gold #fde047
      c3: [0.20, 0.60, 0.95], // Electric Sapphire #3b82f6
      c4: [0.15, 0.85, 0.70], // Teal Mint #14b8a6
      c5: [0.95, 0.45, 0.55], // Radiant Rose #f43f5e
      brightness: 1.10,
      contrast: 1.15
    },
    {
      name: 'Electric Aurora',
      description: 'Vibrant twilight: neon cyan, ultraviolet & spring mint',
      c1: [0.08, 0.82, 0.92], // Neon Cyan #22d3ee
      c2: [0.66, 0.33, 0.98], // Ultraviolet #a855f7
      c3: [0.20, 0.88, 0.60], // Spring Mint #34d399
      c4: [0.98, 0.35, 0.60], // Vivid Pink #fb7185
      c5: [0.15, 0.45, 0.95], // Azure Blue #2563eb
      brightness: 1.0,
      contrast: 1.2
    }
  ];

  const VS_SOURCE = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const FS_SOURCE = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec3 u_c1;
    uniform vec3 u_c2;
    uniform vec3 u_c3;
    uniform vec3 u_c4;
    uniform vec3 u_c5;
    uniform float u_brightness;
    uniform float u_contrast;
    uniform float u_is_dark;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 st) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; ++i) {
        v += a * snoise(st);
        st = rot * st * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      st.x *= aspect;

      vec2 mouseNorm = u_mouse;
      mouseNorm.x *= aspect;
      float distToMouse = distance(st, mouseNorm);
      float mouseInfluence = smoothstep(0.65, 0.0, distToMouse);
      vec2 mouseDisplace = (st - mouseNorm) * mouseInfluence * 0.28;

      float t = u_time * 0.18;

      vec2 q = vec2(0.0);
      q.x = fbm(st + t * 0.25 - mouseDisplace);
      q.y = fbm(st + vec2(1.0) + t * 0.22);

      vec2 r = vec2(0.0);
      r.x = fbm(st + 1.8 * q + vec2(1.7, 9.2) + 0.15 * t + mouseDisplace * 0.5);
      r.y = fbm(st + 1.8 * q + vec2(8.3, 2.8) + 0.126 * t);

      float f = fbm(st + 1.4 * r);

      vec3 col = mix(u_c1, u_c2, clamp(f * f * 2.5, 0.0, 1.0));
      col = mix(col, u_c3, clamp(length(q), 0.0, 1.0) * 0.75);
      col = mix(col, u_c4, clamp(length(r.x), 0.0, 1.0) * 0.65);
      col = mix(col, u_c5, clamp(f * 0.9 + 0.1, 0.0, 1.0) * 0.55);

      float glint = pow(clamp(f * 1.35, 0.0, 1.0), 4.5) * 0.35;
      col += vec3(glint * 0.8, glint * 0.9, glint * 1.0);

      col = (col - 0.5) * u_contrast + 0.5;
      col *= u_brightness;

      if (u_is_dark > 0.5) {
        col = mix(col, vec3(0.02, 0.04, 0.08), 0.48);
      } else {
        col = mix(col, vec3(0.98, 0.99, 1.0), 0.22);
      }

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 0.95);
    }
  `;

  class ShaderGradientEngine {
    constructor(canvasId = 'shader-gradient-canvas') {
      this.canvas = document.getElementById(canvasId);
      this.gl = null;
      this.program = null;
      this.currentPaletteIdx = 0;
      this.isPaused = false;
      this.isDark = document.documentElement.classList.contains('dark');
      this.time = 0.0;
      this.lastFrameTime = performance.now();
      this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
      this.uniforms = {};
      this.animId = null;

      if (!this.canvas) {
        console.warn('[ShaderGradient] Canvas element not found:', canvasId);
        return;
      }

      this.init();
    }

    init() {
      this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'high-performance' }) ||
                 this.canvas.getContext('experimental-webgl', { alpha: true });

      if (!this.gl) {
        console.warn('[ShaderGradient] WebGL not supported, falling back to 2D canvas.');
        this.init2DFallback();
        return;
      }

      const gl = this.gl;
      const vs = this.compileShader(gl.VERTEX_SHADER, VS_SOURCE);
      const fs = this.compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);

      if (!vs || !fs) {
        console.warn('[ShaderGradient] Shader compile failure.');
        return;
      }

      this.program = gl.createProgram();
      gl.attachShader(this.program, vs);
      gl.attachShader(this.program, fs);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('[ShaderGradient] Program link error:', gl.getProgramInfoLog(this.program));
        return;
      }

      gl.useProgram(this.program);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const posLoc = gl.getAttribLocation(this.program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      this.uniforms.u_resolution = gl.getUniformLocation(this.program, 'u_resolution');
      this.uniforms.u_time = gl.getUniformLocation(this.program, 'u_time');
      this.uniforms.u_mouse = gl.getUniformLocation(this.program, 'u_mouse');
      this.uniforms.u_c1 = gl.getUniformLocation(this.program, 'u_c1');
      this.uniforms.u_c2 = gl.getUniformLocation(this.program, 'u_c2');
      this.uniforms.u_c3 = gl.getUniformLocation(this.program, 'u_c3');
      this.uniforms.u_c4 = gl.getUniformLocation(this.program, 'u_c4');
      this.uniforms.u_c5 = gl.getUniformLocation(this.program, 'u_c5');
      this.uniforms.u_brightness = gl.getUniformLocation(this.program, 'u_brightness');
      this.uniforms.u_contrast = gl.getUniformLocation(this.program, 'u_contrast');
      this.uniforms.u_is_dark = gl.getUniformLocation(this.program, 'u_is_dark');

      this.resize();
      this.setupListeners();
      this.applyPalette(this.currentPaletteIdx);

      this.loop = this.loop.bind(this);
      this.animId = requestAnimationFrame(this.loop);
    }

    compileShader(type, src) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[ShaderGradient] Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);

      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.gl) {
          this.gl.viewport(0, 0, width, height);
          this.gl.uniform2f(this.uniforms.u_resolution, width, height);
        }
      }
    }

    setupListeners() {
      window.addEventListener('resize', () => this.resize(), { passive: true });

      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = e.clientX / window.innerWidth;
        this.mouse.targetY = 1.0 - (e.clientY / window.innerHeight);
      }, { passive: true });

      const observer = new MutationObserver(() => {
        const isDarkNow = document.documentElement.classList.contains('dark');
        if (this.isDark !== isDarkNow) {
          this.isDark = isDarkNow;
          if (this.gl) {
            this.gl.uniform1f(this.uniforms.u_is_dark, this.isDark ? 1.0 : 0.0);
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    applyPalette(idx) {
      this.currentPaletteIdx = (idx + PALETTES.length) % PALETTES.length;
      const p = PALETTES[this.currentPaletteIdx];
      if (!this.gl) return;

      const gl = this.gl;
      gl.uniform3fv(this.uniforms.u_c1, p.c1);
      gl.uniform3fv(this.uniforms.u_c2, p.c2);
      gl.uniform3fv(this.uniforms.u_c3, p.c3);
      gl.uniform3fv(this.uniforms.u_c4, p.c4);
      gl.uniform3fv(this.uniforms.u_c5, p.c5);
      gl.uniform1f(this.uniforms.u_brightness, p.brightness);
      gl.uniform1f(this.uniforms.u_contrast, p.contrast);
      gl.uniform1f(this.uniforms.u_is_dark, this.isDark ? 1.0 : 0.0);
    }

    nextPalette() {
      this.applyPalette(this.currentPaletteIdx + 1);
      return PALETTES[this.currentPaletteIdx];
    }

    setPalette(idx) {
      this.applyPalette(idx);
      return PALETTES[this.currentPaletteIdx];
    }

    getCurrentPalette() {
      return PALETTES[this.currentPaletteIdx];
    }

    getPalettes() {
      return PALETTES;
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      return this.isPaused;
    }

    loop(now) {
      this.animId = requestAnimationFrame(this.loop);
      if (this.isPaused) return;

      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;
      this.time += dt;

      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

      if (this.gl) {
        this.gl.uniform1f(this.uniforms.u_time, this.time);
        this.gl.uniform2f(this.uniforms.u_mouse, this.mouse.x, this.mouse.y);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      }
    }

    init2DFallback() {
      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;
      let t = 0;
      const draw2D = () => {
        requestAnimationFrame(draw2D);
        if (this.isPaused) return;
        t += 0.01;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);

        const grad = ctx.createLinearGradient(0, 0, w, h);
        const p = PALETTES[this.currentPaletteIdx];
        const toHex = (c) => `rgb(${Math.floor(c[0]*255)}, ${Math.floor(c[1]*255)}, ${Math.floor(c[2]*255)})`;
        grad.addColorStop(0, toHex(p.c1));
        grad.addColorStop(0.3, toHex(p.c2));
        grad.addColorStop(0.6, toHex(p.c3));
        grad.addColorStop(1, toHex(p.c4));

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      };
      draw2D();
    }
  }

  return ShaderGradientEngine;
}));
