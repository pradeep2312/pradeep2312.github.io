// The 3D layer behind the page: glowing embers drifting in depth, and light
// streaks that appear while scrolling fast. The canvas is transparent, so the
// red glows painted in CSS show through.

import * as THREE from 'three';

function seeded(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BOX = new THREE.Vector3(70, 46, 60); // the volume embers wrap around in

function buildEmbers(rand, uniforms, count) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos.set([rand() * BOX.x, rand() * BOX.y, rand() * BOX.z], i * 3);
    seed[i] = rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uScroll;
      uniform float uScale;
      uniform vec3 uBox;
      varying float vAlpha;
      varying float vHeat;
      void main() {
        vec3 p = position;
        p.y += uTime * (0.5 + aSeed * 1.6) + uScroll * (0.6 + aSeed * 0.8);
        p.x += sin(uTime * (0.3 + aSeed) + aSeed * 40.0) * 1.6;
        p.z += cos(uTime * 0.25 + aSeed * 20.0) * 1.2;
        p = mod(p, uBox) - uBox * 0.5;
        p.z -= uBox.z * 0.5 + 2.0;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        float depth = -mv.z;
        float big = step(0.94, aSeed);
        gl_PointSize = uScale * (1.4 + aSeed * 3.2 + big * 16.0) * 26.0 / depth;
        gl_Position = projectionMatrix * mv;
        float flicker = 0.65 + 0.35 * sin(uTime * (2.0 + aSeed * 5.0) + aSeed * 90.0);
        vAlpha = flicker * smoothstep(uBox.z + 2.0, uBox.z * 0.55, depth) * smoothstep(1.0, 6.0, depth) * mix(0.9, 0.55, big);
        vHeat = fract(aSeed * 7.3);
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      varying float vHeat;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.5, 0.0, d);
        vec3 col = mix(vec3(1.0, 0.10, 0.06), vec3(1.0, 0.45, 0.10), vHeat);
        col = mix(col, vec3(1.0, 0.92, 0.7), pow(core, 6.0) * 0.8);
        gl_FragColor = vec4(col, core * core * vAlpha);
      }`,
  }));
  points.frustumCulled = false;
  return points;
}

// Thin lines that stretch toward the viewer in proportion to scroll speed.
function buildStreaks(rand, uniforms, count) {
  const pos = new Float32Array(count * 6);
  const end = new Float32Array(count * 2);
  const seed = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = rand() * BOX.x, y = rand() * BOX.y, z = rand() * BOX.z, s = rand();
    pos.set([x, y, z, x, y, z], i * 6);
    end.set([0, 1], i * 2);
    seed.set([s, s], i * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const lines = new THREE.LineSegments(geo, new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aEnd;
      attribute float aSeed;
      uniform float uTime;
      uniform float uScroll;
      uniform float uSpeed;
      uniform vec3 uBox;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += uScroll * (0.8 + aSeed);
        p.z += uTime * (4.0 + aSeed * 10.0);
        p = mod(p, uBox) - uBox * 0.5;
        p.z -= uBox.z * 0.5 + 2.0;
        p.y -= aEnd * uSpeed * (2.0 + aSeed * 5.0);
        p.z += aEnd * abs(uSpeed) * 1.5;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vAlpha = (1.0 - aEnd) * min(abs(uSpeed) * 0.6, 0.8) * smoothstep(1.0, 8.0, -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() { gl_FragColor = vec4(1.0, 0.28, 0.14, vAlpha); }`,
  }));
  lines.frustumCulled = false;
  return lines;
}

export async function initScene({ canvas, onProgress = () => {} }) {
  const lite = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = seeded(20261114);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.5, 200);
  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uSpeed: { value: 0 },
    uScale: { value: pixelRatio },
    uBox: { value: BOX },
  };
  scene.add(buildEmbers(rand, uniforms, lite ? 260 : 620));
  onProgress(0.6);
  if (!reduceMotion) scene.add(buildStreaks(rand, uniforms, lite ? 60 : 160));

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  const pointer = new THREE.Vector2();
  const look = new THREE.Vector2();
  if (!lite && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    });
  }

  const clock = new THREE.Clock();
  let lastY = window.scrollY;
  let speed = 0;

  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const y = window.scrollY;
    // Scroll speed in screen-heights per second, smoothed so streaks fade out.
    const v = (y - lastY) / window.innerHeight / Math.max(dt, 0.001);
    lastY = y;
    speed += (v - speed) * (1 - Math.exp(-dt * 6));

    uniforms.uScroll.value = y * 0.012;
    uniforms.uSpeed.value = reduceMotion ? 0 : speed;
    if (!reduceMotion) uniforms.uTime.value += dt;

    look.lerp(pointer, 1 - Math.exp(-dt * 3));
    camera.rotation.set(-look.y * 0.05, -look.x * 0.07, 0);
    renderer.render(scene, camera);
  };

  frame();
  renderer.setAnimationLoop(frame);
  onProgress(1);
}
