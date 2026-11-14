// The night-city world behind the page. Everything is generated in code:
// buildings, windows, traffic, moon, sky and particles. The camera travels
// through it as the page scrolls, one stop per section.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Camera stop for each section id: p = position, l = look-at point.
// The street runs along -z; the moon sits far beyond its end.
const STOPS = {
  hero: { p: [0, 38, 120], l: [0, 34, -100] },
  about: { p: [-9, 17, 38], l: [0, 15, -120] },
  experience: { p: [0, 3.6, -40], l: [0, 7, -200] },
  featured: { p: [2, 5, -150], l: [0, 8, -300] },
  repos: { p: [-4, 9, -250], l: [0, 24, -420] },
  contact: { p: [0, 165, -330], l: [0, 150, -1100] },
};

const ROAD_HALF = 10.5;
const FOG_NIGHT = new THREE.Color().setRGB(0.012, 0.02, 0.055);
const FOG_DAWN = new THREE.Color().setRGB(0.11, 0.045, 0.06);

// Fixed seed so the city looks the same on every visit.
function seeded(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCity(rand, uniforms, lite) {
  const boxes = [];
  for (const side of [-1, 1]) {
    for (let z = 30; z > -470; z -= 20) {
      for (let col = 0; col < (lite ? 4 : 6); col++) {
        const w = 10 + rand() * 6;
        const d = 10 + rand() * 7;
        const h = col === 0 ? 14 + rand() * 26 : 18 + rand() ** 2 * (60 + col * 10);
        const x = side * (13 + w / 2 + col * 19 + rand() * 3);
        boxes.push([x, z + (rand() - 0.5) * 4, w, h, d]);
      }
    }
  }
  // Distant skyline past the end of the street.
  for (let i = 0; i < (lite ? 70 : 160); i++) {
    const x = (rand() - 0.5) * 520;
    if (Math.abs(x) < 22) continue;
    boxes.push([x, -480 - rand() * 280, 12 + rand() * 10, 30 + rand() ** 2 * 110, 12 + rand() * 10]);
  }

  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec3 vN;
      varying vec2 vSeed;
      void main() {
        vec4 p = vec4(position, 1.0);
        vSeed = vec2(0.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
          vSeed = instanceMatrix[3].xz;
        #endif
        vec4 w = modelMatrix * p;
        vWorld = w.xyz;
        vN = normal;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform vec3 uAccent;
      uniform float uTime;
      varying vec3 vWorld;
      varying vec3 vN;
      varying vec2 vSeed;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 col = vec3(0.010, 0.013, 0.026);
        if (abs(vN.y) < 0.5) {
          bool xFace = abs(vN.x) > 0.5;
          vec2 g = vec2((xFace ? vWorld.z : vWorld.x) / 1.15, vWorld.y / 1.7);
          vec2 id = floor(g);
          vec2 f = fract(g);
          float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.28, f.y) * step(f.y, 0.78);
          vec2 key = id + vSeed * 0.37 + (xFace ? 31.0 : 0.0);
          float r = hash(key);
          float lit = step(0.62, r);
          float tone = hash(key * 1.7 + 5.0);
          vec3 wc = mix(vec3(1.0, 0.70, 0.40), vec3(0.50, 0.72, 1.0), step(0.5, tone));
          wc = mix(wc, uAccent, step(0.88, tone));
          float flicker = 0.85 + 0.15 * sin(uTime * 0.7 + r * 40.0);
          vec3 sharp = win * (lit * wc * (0.35 + 0.9 * hash(key + 3.3)) * flicker + (1.0 - lit) * vec3(0.012, 0.018, 0.03));
          // Far away the window grid gets finer than a pixel: fade to its average glow.
          vec3 blurred = vec3(0.55, 0.50, 0.50) * 0.085;
          float lod = smoothstep(0.3, 0.9, max(fwidth(g.x), fwidth(g.y)));
          col += mix(sharp, blurred, lod);
          col += uAccent * 0.02 * exp(-vWorld.y * 0.12);
        }
        float dist = distance(vWorld, cameraPosition);
        float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
        gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
      }`,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, boxes.length);
  const m = new THREE.Matrix4();
  boxes.forEach(([x, z, w, h, d], i) => {
    m.makeScale(w, h, d).setPosition(x, 0, z);
    mesh.setMatrixAt(i, m);
  });
  mesh.frustumCulled = false;
  return mesh;
}

function buildStreet(accent) {
  const g = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshBasicMaterial({ color: 0x010207 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF * 2, 1400), new THREE.MeshBasicMaterial({ color: 0x05070e }));
  road.rotation.x = -Math.PI / 2;
  road.position.z = -400;
  g.add(ground, road);

  // Neon kerb strips.
  const stripGeo = new THREE.BoxGeometry(0.12, 0.12, 1400);
  for (const side of [-1, 1]) {
    const strip = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ color: accent.clone().multiplyScalar(0.9) }));
    strip.position.set(side * (ROAD_HALF + 0.1), 0.1, -400);
    g.add(strip);
  }

  // Centre-line dashes.
  const count = 100;
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.02, 3.2), new THREE.MeshBasicMaterial({ color: 0x2a3350 }), count);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) dashes.setMatrixAt(i, m.makeTranslation(0, 0.02, 260 - i * 10));
  dashes.frustumCulled = false;
  g.add(dashes);
  return g;
}

// One glowing frame over the street per job in the experience section.
function buildGates(n, accent, accent2) {
  const g = new THREE.Group();
  const post = new THREE.BoxGeometry(0.35, 13, 0.35);
  const beam = new THREE.BoxGeometry(ROAD_HALF * 2 + 0.35, 0.35, 0.35);
  for (let i = 0; i < Math.min(n, 5); i++) {
    const mat = new THREE.MeshBasicMaterial({ color: (i % 2 ? accent2 : accent).clone().multiplyScalar(1.3) });
    const z = -66 - i * 21;
    for (const side of [-1, 1]) {
      const p = new THREE.Mesh(post, mat);
      p.position.set(side * ROAD_HALF, 6.5, z);
      g.add(p);
    }
    const b = new THREE.Mesh(beam, mat);
    b.position.set(0, 13, z);
    g.add(b);
  }
  return g;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

// One street billboard per featured project.
function buildBillboards(projects, theme) {
  const g = new THREE.Group();
  projects.slice(0, 4).forEach((p, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    const draw = (img) => {
      const grad = ctx.createLinearGradient(0, 0, 1024, 576);
      grad.addColorStop(0, '#0a1024');
      grad.addColorStop(1, '#150c2a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 576);
      if (img) {
        const s = Math.max(1024 / img.width, 576 / img.height);
        ctx.drawImage(img, (1024 - img.width * s) / 2, (576 - img.height * s) / 2, img.width * s, img.height * s);
        ctx.fillStyle = 'rgba(4,6,14,0.55)';
        ctx.fillRect(0, 0, 1024, 576);
      }
      ctx.strokeStyle = i % 2 ? theme.accent2 : theme.accent;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 1014, 566);
      ctx.fillStyle = i % 2 ? theme.accent2 : theme.accent;
      ctx.font = '500 34px "JetBrains Mono", monospace';
      ctx.fillText(`PROJECT ${String(i + 1).padStart(2, '0')}`, 64, 110);
      ctx.fillStyle = '#f2f5ff';
      ctx.font = '600 104px "Space Grotesk", sans-serif';
      wrapText(ctx, p.name.toUpperCase(), 64, 300, 900, 108);
      tex.needsUpdate = true;
    };
    draw();
    if (p.image) {
      const img = new Image();
      img.onload = () => draw(img);
      img.src = p.image;
    }

    const side = i % 2 ? -1 : 1;
    const z = -188 - i * 24;
    const board = new THREE.Mesh(new THREE.PlaneGeometry(14, 7.875), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    board.position.set(side * 13.5, 9, z);
    board.rotation.y = -side * 0.95;
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.2, 0.4), new THREE.MeshBasicMaterial({ color: 0x0b0e18 }));
    pole.position.set(side * 13.5, 2.6, z);
    g.add(board, pole);
  });
  return g;
}

function buildTraffic(rand, lite) {
  const count = lite ? 30 : 70;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), count);
  const cars = [];
  const head = new THREE.Color().setRGB(1.3, 1.5, 1.8);
  const tail = new THREE.Color().setRGB(1.8, 0.16, 0.1);
  for (let i = 0; i < count; i++) {
    const away = i % 2 === 0; // right-hand lanes drive away from the first view
    const lane = (away ? 1 : -1) * (rand() < 0.5 ? 3.2 : 7.2) + (rand() - 0.5) * 0.9;
    cars.push({ x: lane, z: 260 - rand() * 960, len: 5 + rand() * 10, speed: (away ? -1 : 1) * (38 + rand() * 50) });
    mesh.setColorAt(i, away ? tail : head);
  }
  mesh.frustumCulled = false;
  const m = new THREE.Matrix4();
  const update = (dt) => {
    cars.forEach((c, i) => {
      c.z += c.speed * dt;
      if (c.z > 260) c.z -= 960;
      if (c.z < -700) c.z += 960;
      m.makeScale(1, 1, c.len).setPosition(c.x, 0.45, c.z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { mesh, update };
}

function buildSky(uniforms) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(2600, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uFogColor;
        uniform vec3 uAccent;
        uniform float uDawn;
        varying vec3 vDir;
        void main() {
          float h = max(vDir.y, 0.0);
          vec3 top = mix(vec3(0.003, 0.005, 0.016), vec3(0.03, 0.03, 0.09), uDawn);
          vec3 col = mix(uFogColor, top, smoothstep(0.0, 0.5, h));
          float toward = smoothstep(0.4, -1.0, vDir.z);
          col += uDawn * toward * vec3(0.62, 0.20, 0.09) * exp(-h * 9.0);
          col += uDawn * toward * vec3(0.34, 0.09, 0.26) * exp(-h * 3.0);
          col += uAccent * 0.025 * exp(-h * 9.0);
          gl_FragColor = vec4(col, 1.0);
        }`,
    })
  );
  sky.renderOrder = -2;
  sky.frustumCulled = false;
  return sky;
}

function buildMoon(uniforms) {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(125, 48, 32),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec3 vN;
        varying vec3 vP;
        void main() {
          vN = normalize(normalMatrix * normal);
          vP = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uDawn;
        varying vec3 vN;
        varying vec3 vP;
        float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float noise(vec3 p) {
          vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        void main() {
          float n = noise(vP * 0.018) * 0.55 + noise(vP * 0.05) * 0.3 + noise(vP * 0.13) * 0.15;
          float limb = pow(max(vN.z, 0.0), 0.55);
          vec3 col = mix(vec3(0.42, 0.50, 0.72), vec3(0.95, 0.97, 1.0), smoothstep(0.3, 0.75, n));
          col = mix(col, vec3(1.0, 0.72, 0.55), uDawn * 0.6);
          gl_FragColor = vec4(col * limb * (0.85 - 0.3 * uDawn), 1.0);
        }`,
    })
  );
  moon.position.set(0, 220, -1100);
  moon.renderOrder = -1;
  return moon;
}

function buildStars(rand, uniforms) {
  const n = 1400;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const theta = rand() * Math.PI * 2;
    const y = 0.06 + rand() * 0.94;
    const r = Math.sqrt(1 - y * y);
    pos.set([Math.cos(theta) * r * 2400, y * 2400, Math.sin(theta) * r * 2400], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying float vTw;
      uniform float uTime;
      void main() {
        vTw = 0.6 + 0.4 * sin(uTime * 1.5 + position.x * 0.05 + position.y * 0.03);
        gl_PointSize = 1.2 + fract(position.x * 0.37) * 1.6;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uDawn;
      varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(vec3(0.8, 0.88, 1.0), smoothstep(0.5, 0.1, d) * vTw * (1.0 - uDawn * 0.85));
      }`,
  }));
  stars.frustumCulled = false;
  stars.renderOrder = -1;
  return stars;
}

// Drifting motes that wrap around the camera, so they are always nearby.
function buildDust(rand, uniforms, lite) {
  const n = lite ? 250 : 700;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) pos[i] = rand() * 80;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uScale;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y -= uTime * (0.6 + fract(position.x * 13.7) * 1.4);
        p.x += sin(uTime * 0.3 + position.z) * 0.8;
        p = mod(p - cameraPosition + 40.0, 80.0) - 40.0 + cameraPosition;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vAlpha = smoothstep(40.0, 22.0, length(p - cameraPosition)) * smoothstep(0.5, 4.0, -mv.z);
        gl_PointSize = uScale * (0.6 + fract(position.z * 7.3)) * 26.0 / max(-mv.z, 0.1);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(mix(vec3(1.0), uAccent, 0.5), smoothstep(0.5, 0.0, d) * vAlpha * 0.5);
      }`,
  }));
  dust.frustumCulled = false;
  return dust;
}

export async function initScene({ canvas, sections, theme, experienceCount, projects, onProgress = () => {} }) {
  const lite = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = seeded(20261114);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(FOG_NIGHT.clone(), 0.0022);
  scene.background = scene.fog.color;
  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 6000);

  const accent = new THREE.Color(theme.accent);
  const accent2 = new THREE.Color(theme.accent2);
  // Shared by every shader, so one update per frame drives them all.
  const uniforms = {
    uTime: { value: 0 },
    uDawn: { value: 0 },
    uFogColor: { value: scene.fog.color },
    uFogDensity: { value: scene.fog.density },
    uAccent: { value: accent },
    uScale: { value: pixelRatio },
  };

  const sky = buildSky(uniforms);
  scene.add(sky, buildStars(rand, uniforms), buildMoon(uniforms));
  onProgress(0.3);
  scene.add(buildCity(rand, uniforms, lite), buildStreet(accent), buildGates(experienceCount, accent, accent2));
  onProgress(0.6);
  const traffic = buildTraffic(rand, lite);
  scene.add(traffic.mesh, buildDust(rand, uniforms, lite));

  // Billboards use the web fonts; don't wait forever if they are slow.
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  scene.add(buildBillboards(projects, theme));
  onProgress(0.9);

  let composer = null;
  if (!lite) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.5, 0.4));
    composer.addPass(new OutputPass());
  }

  const stops = sections.map((s) => STOPS[s.id]).filter(Boolean);
  const posCurve = new THREE.CatmullRomCurve3(stops.map((s) => new THREE.Vector3(...s.p)), false, 'catmullrom', 0.35);
  const lookCurve = new THREE.CatmullRomCurve3(stops.map((s) => new THREE.Vector3(...s.l)), false, 'catmullrom', 0.35);
  const last = stops.length - 1;

  // Fractional section index: 0 at the top of the first section, 1 at the top of the second, ...
  const scrollStop = () => {
    const y = window.scrollY;
    let i = 0;
    while (i < last - 1 && y >= sections[i + 1].offsetTop) i++;
    const top = sections[i].offsetTop;
    const span = sections[i + 1].offsetTop - top || 1;
    return Math.min(last, Math.max(0, i + (y - top) / span));
  };

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    // Keep the street framed on tall phone screens.
    camera.fov = w / h < 0.8 ? 68 : 50;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  const pointer = new THREE.Vector2();
  const drift = new THREE.Vector2();
  if (!lite && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    });
  }

  const clock = new THREE.Clock();
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  let t = scrollStop();

  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const target = scrollStop();
    t = reduceMotion ? target : t + (target - t) * (1 - Math.exp(-dt * 4.5));

    posCurve.getPoint(t / last, pos);
    lookCurve.getPoint(t / last, look);
    drift.lerp(pointer, 1 - Math.exp(-dt * 3));
    camera.position.set(pos.x + drift.x * 1.4, Math.max(2.4, pos.y - drift.y * 0.7), pos.z);
    camera.lookAt(look);

    const dawn = THREE.MathUtils.smoothstep(t, last - 0.8, last);
    uniforms.uDawn.value = dawn;
    scene.fog.color.copy(FOG_NIGHT).lerp(FOG_DAWN, dawn);
    if (!reduceMotion) {
      uniforms.uTime.value += dt;
      traffic.update(dt);
    }
    sky.position.copy(camera.position);

    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  frame();
  renderer.setAnimationLoop(frame);
  onProgress(1);
}
