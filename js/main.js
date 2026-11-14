import { CONTENT } from '../content.js?v=3';
import { buildUI } from './ui.js?v=3';
import { initFx } from './fx.js?v=3';

const fill = document.getElementById('loader-fill');
const setProgress = (p) => { fill.style.width = Math.round(Math.min(1, Math.max(0, p)) * 100) + '%'; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const started = performance.now();

buildUI(CONTENT);
initFx();
setProgress(0.2);

// The page stays fully usable if 3D cannot start (no WebGL, blocked CDN).
try {
  const { initScene } = await import('./scene.js?v=3');
  setProgress(0.5);
  await initScene({
    canvas: document.getElementById('scene'),
    onProgress: (p) => setProgress(0.5 + p * 0.5),
  });
} catch (err) {
  console.warn('3D layer unavailable, showing the page without it:', err);
  document.getElementById('scene').remove();
}

// Hold long enough for the name to finish appearing, then open the page:
// the name slides in first and the photo follows (timed in style.css).
setProgress(1);
await Promise.race([document.fonts.ready, wait(1500)]);
await wait(Math.max(0, 1500 - (performance.now() - started)));
document.body.classList.remove('loading');
document.body.classList.add('ready');
