type GL = WebGLRenderingContext;

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texel: Float32Array;
}

interface DoubleFBO {
  read: FBO;
  write: FBO;
  swap: () => void;
}

interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

const VERT = `
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 uTexel;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const BASE = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform vec2 uAspect;
uniform float uRadius;
uniform float uDt;
uniform float uDissipation;
uniform float uVorticity;
`;

function shader(body: string) {
  return `${BASE}\nvoid main(){\n${body}\n}`;
}

const FRAG = {
  clear: shader(
    `gl_FragColor = texture2D(uSource, vUv) * uDissipation;`
  ),
  splat: shader(
    `
    vec2 p = vUv - uPoint.xy;
    p.x *= uAspect.x;
    vec3 base = texture2D(uSource, vUv).xyz;
    float fall = exp(-dot(p, p) / uRadius);
    gl_FragColor = vec4(base + uColor * fall, 1.0);
    `
  ),
  advection: shader(`
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vec2 coord = vUv - uDt * vel * uTexel * 256.0;
    vec4 result = texture2D(uSource, coord);
    gl_FragColor = uDissipation * result;
    `
  ),
  divergence: shader(`
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    `
  ),
  curl: shader(`
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    `
  ),
  vorticity: shader(`
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= uVorticity * C;
    force.y *= -1.0;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    gl_FragColor = vec4(vel + force * uDt, 0.0, 1.0);
    `
  ),
  pressure: shader(`
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float C = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - C) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    `
  ),
  gradient: shader(`
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    vel.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
    `
  ),
  display: `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uSource;
uniform float uTime;
void main () {
  vec3 c = texture2D(uSource, vUv).rgb;
  c = pow(c, vec3(0.85));
  float vig = smoothstep(1.35, 0.25, length(vUv - 0.5));
  vec3 abyss = vec3(0.012, 0.016, 0.028);
  vec3 foam = vec3(0.72, 0.92, 1.0);
  vec3 ink = mix(abyss, c * vec3(0.55, 0.85, 1.15) + c.gbr * 0.18, 1.0);
  float n = fract(sin(dot(vUv * 420.0 + uTime, vec2(12.9898, 78.233))) * 43758.5453);
  ink += (n - 0.5) * 0.018;
  ink = mix(abyss, ink, vig);
  float sparkle = pow(max(c.r, max(c.g, c.b)), 3.2);
  ink += foam * sparkle * 0.35;
  gl_FragColor = vec4(ink, 1.0);
}
`,
};

function compile(gl: GL, type: number, source: string) {
  const s = gl.createShader(type);
  if (!s) throw new Error("shader");
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || "compile");
  }
  return s;
}

function link(gl: GL, vs: string, fs: string): Program {
  const program = gl.createProgram();
  if (!program) throw new Error("program");
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "link");
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
}

function createFBO(
  gl: GL,
  w: number,
  h: number,
  internal: number,
  format: number,
  type: number,
  filter: number
): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!texture || !fbo) throw new Error("fbo");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    texture,
    fbo,
    width: w,
    height: h,
    texel: new Float32Array([1 / w, 1 / h]),
  };
}

function createDouble(
  gl: GL,
  w: number,
  h: number,
  internal: number,
  format: number,
  type: number,
  filter: number
): DoubleFBO {
  let f1 = createFBO(gl, w, h, internal, format, type, filter);
  let f2 = createFBO(gl, w, h, internal, format, type, filter);
  return {
    get read() {
      return f1;
    },
    get write() {
      return f2;
    },
    swap() {
      const t = f1;
      f1 = f2;
      f2 = t;
    },
  };
}

export class Fluid {
  private gl: GL;
  private canvas: HTMLCanvasElement;
  private programs: Record<string, Program>;
  private dye!: DoubleFBO;
  private velocity!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;
  private pressure!: DoubleFBO;
  private format: { internal: number; format: number; type: number; filter: number };
  private last = 0;
  private colorHue = 0.55;
  private pointers = new Map<
    number,
    { x: number; y: number; dx: number; dy: number; down: boolean }
  >();
  private raf = 0;
  private simRes = 128;
  private dyeRes = 1024;
  private pressureIters = 18;
  paused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL unavailable");
    this.gl = gl;
    gl.getExtension("OES_standard_derivatives");
    const half = gl.getExtension("OES_texture_half_float");
    const halfLinear = gl.getExtension("OES_texture_half_float_linear");
    const HALF = half ? half.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    this.format = {
      internal: gl.RGBA,
      format: gl.RGBA,
      type: half ? HALF : gl.UNSIGNED_BYTE,
      filter: half && halfLinear ? gl.LINEAR : gl.NEAREST,
    };

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.programs = {
      clear: link(gl, VERT, FRAG.clear),
      splat: link(gl, VERT, FRAG.splat),
      advection: link(gl, VERT, FRAG.advection),
      divergence: link(gl, VERT, FRAG.divergence),
      curl: link(gl, VERT, FRAG.curl),
      vorticity: link(gl, VERT, FRAG.vorticity),
      pressure: link(gl, VERT, FRAG.pressure),
      gradient: link(gl, VERT, FRAG.gradient),
      display: link(gl, VERT, FRAG.display),
    };

    this.resize();
    this.bindInput();
    this.seed();
  }

  start() {
    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      if (this.paused || document.hidden) return;
      this.step(t);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  splatAt(
    nx: number,
    ny: number,
    dx: number,
    dy: number,
    color?: [number, number, number],
    radius = 0.00035
  ) {
    const c = color ?? this.nextColor();
    this.splat(nx, ny, dx, dy, c, radius);
  }

  private seed() {
    for (let i = 0; i < 8; i++) {
      const x = 0.2 + Math.random() * 0.6;
      const y = 0.2 + Math.random() * 0.6;
      this.splat(
        x,
        y,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        this.nextColor(),
        0.00055
      );
    }
  }

  private nextColor(): [number, number, number] {
    this.colorHue = (this.colorHue + 0.07) % 1;
    const h = this.colorHue;
    const s = 0.72;
    const l = 0.58;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return [f(0) * 3.2, f(8) * 3.2, f(4) * 3.2];
  }

  private bindInput() {
    const canvas = this.canvas;
    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width,
        y: 1 - (e.clientY - r.top) / r.height,
      };
    };

    window.addEventListener("pointerdown", (e) => {
      const p = pos(e);
      this.pointers.set(e.pointerId, { ...p, dx: 0, dy: 0, down: true });
      this.splatAt(p.x, p.y, 0, 0, undefined, 0.0008);
    });
    window.addEventListener("pointerup", (e) => {
      this.pointers.delete(e.pointerId);
    });
    window.addEventListener(
      "pointermove",
      (e) => {
        const p = pos(e);
        const prev = this.pointers.get(e.pointerId);
        if (prev) {
          prev.dx = (p.x - prev.x) * 1800;
          prev.dy = (p.y - prev.y) * 1800;
          prev.x = p.x;
          prev.y = p.y;
        } else {
          this.pointers.set(e.pointerId, { ...p, dx: 0, dy: 0, down: false });
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", () => this.resize());
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width === w && this.canvas.height === h && this.dye) return;
    this.canvas.width = w;
    this.canvas.height = h;

    const mobile = window.matchMedia("(max-width: 720px)").matches;
    this.simRes = mobile ? 96 : 128;
    this.dyeRes = mobile ? 512 : 1024;
    this.pressureIters = mobile ? 12 : 18;

    const { internal, format, type, filter } = this.format;
    const sim = this.simRes;
    const dye = this.dyeRes;
    this.dye = createDouble(this.gl, dye, dye, internal, format, type, filter);
    this.velocity = createDouble(
      this.gl,
      sim,
      sim,
      internal,
      format,
      type,
      this.gl.LINEAR
    );
    this.divergence = createFBO(
      this.gl,
      sim,
      sim,
      internal,
      format,
      type,
      this.gl.NEAREST
    );
    this.curl = createFBO(this.gl, sim, sim, internal, format, type, this.gl.NEAREST);
    this.pressure = createDouble(
      this.gl,
      sim,
      sim,
      internal,
      format,
      type,
      this.gl.NEAREST
    );
  }

  private blit(target: FBO | null) {
    const gl = this.gl;
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  private splat(
    x: number,
    y: number,
    dx: number,
    dy: number,
    color: [number, number, number],
    radius: number
  ) {
    const gl = this.gl;
    const aspect = this.canvas.width / Math.max(this.canvas.height, 1);
    const p = this.programs.splat;
    gl.useProgram(p.program);
    gl.uniform1i(p.uniforms.uSource, 0);
    gl.uniform2f(p.uniforms.uPoint, x, y);
    gl.uniform2f(p.uniforms.uAspect, aspect, 1);
    gl.uniform1f(p.uniforms.uRadius, radius);
    gl.uniform2f(p.uniforms.uTexel, this.velocity.read.texel[0], this.velocity.read.texel[1]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    gl.uniform3f(p.uniforms.uColor, dx, dy, 0);
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
    gl.uniform3f(p.uniforms.uColor, color[0], color[1], color[2]);
    gl.uniform1f(p.uniforms.uRadius, radius * 0.85);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private step(now: number) {
    const dt = Math.min((now - this.last) / 1000, 0.033) || 0.016;
    this.last = now;
    const gl = this.gl;
    gl.disable(gl.BLEND);

    for (const ptr of this.pointers.values()) {
      if (Math.abs(ptr.dx) + Math.abs(ptr.dy) > 0.2) {
        this.splat(ptr.x, ptr.y, ptr.dx, ptr.dy, this.nextColor(), 0.00028);
        ptr.dx *= 0.65;
        ptr.dy *= 0.65;
      }
    }

    if (this.pointers.size === 0 && now % 2800 < 28) {
      this.splat(
        0.35 + Math.sin(now * 0.00035) * 0.22,
        0.5 + Math.cos(now * 0.00028) * 0.18,
        Math.sin(now * 0.001) * 40,
        Math.cos(now * 0.0012) * 40,
        this.nextColor(),
        0.0004
      );
    }

    const texel = this.velocity.read.texel;

    const curl = this.programs.curl;
    gl.useProgram(curl.program);
    gl.uniform2f(curl.uniforms.uTexel, texel[0], texel[1]);
    gl.uniform1i(curl.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    this.blit(this.curl);

    const vort = this.programs.vorticity;
    gl.useProgram(vort.program);
    gl.uniform2f(vort.uniforms.uTexel, texel[0], texel[1]);
    gl.uniform1f(vort.uniforms.uDt, dt);
    gl.uniform1f(vort.uniforms.uVorticity, 18);
    gl.uniform1i(vort.uniforms.uVelocity, 0);
    gl.uniform1i(vort.uniforms.uCurl, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.curl.texture);
    this.blit(this.velocity.write);
    this.velocity.swap();

    const div = this.programs.divergence;
    gl.useProgram(div.program);
    gl.uniform2f(div.uniforms.uTexel, texel[0], texel[1]);
    gl.uniform1i(div.uniforms.uVelocity, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    this.blit(this.divergence);

    const clear = this.programs.clear;
    gl.useProgram(clear.program);
    gl.uniform1i(clear.uniforms.uSource, 0);
    gl.uniform1f(clear.uniforms.uDissipation, 0.8);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
    this.blit(this.pressure.write);
    this.pressure.swap();

    const press = this.programs.pressure;
    gl.useProgram(press.program);
    gl.uniform2f(press.uniforms.uTexel, texel[0], texel[1]);
    gl.uniform1i(press.uniforms.uPressure, 0);
    gl.uniform1i(press.uniforms.uDivergence, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.divergence.texture);
    for (let i = 0; i < this.pressureIters; i++) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    const grad = this.programs.gradient;
    gl.useProgram(grad.program);
    gl.uniform2f(grad.uniforms.uTexel, texel[0], texel[1]);
    gl.uniform1i(grad.uniforms.uPressure, 0);
    gl.uniform1i(grad.uniforms.uVelocity, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    this.blit(this.velocity.write);
    this.velocity.swap();

    const adv = this.programs.advection;
    gl.useProgram(adv.program);
    gl.uniform2f(adv.uniforms.uTexel, texel[0], texel[1]);
    gl.uniform1f(adv.uniforms.uDt, dt);
    gl.uniform1i(adv.uniforms.uVelocity, 0);
    gl.uniform1i(adv.uniforms.uSource, 0);
    gl.uniform1f(adv.uniforms.uDissipation, 0.985);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform2f(adv.uniforms.uTexel, this.dye.read.texel[0], this.dye.read.texel[1]);
    gl.uniform1f(adv.uniforms.uDissipation, 0.992);
    gl.uniform1i(adv.uniforms.uVelocity, 0);
    gl.uniform1i(adv.uniforms.uSource, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
    this.blit(this.dye.write);
    this.dye.swap();

    const disp = this.programs.display;
    gl.useProgram(disp.program);
    gl.uniform1i(disp.uniforms.uSource, 0);
    gl.uniform1f(disp.uniforms.uTime, now * 0.001);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
    this.blit(null);
  }
}
