import { CONTENT } from '../content.js';
import { buildUI } from './ui.js';

const loader = document.getElementById('loader');
const fill = document.getElementById('loader-fill');
const pct = document.getElementById('loader-pct');

const setProgress = (p) => {
  const v = Math.round(Math.min(1, Math.max(0, p)) * 100);
  fill.style.width = v + '%';
  pct.textContent = v + '%';
};
const finish = () => {
  setProgress(1);
  setTimeout(() => loader.classList.add('done'), 350);
};

const ui = buildUI(CONTENT);
setProgress(0.15);

// The page stays fully usable if 3D cannot start (no WebGL, blocked CDN).
try {
  const { initScene } = await import('./scene.js');
  setProgress(0.4);
  await initScene({
    canvas: document.getElementById('scene'),
    sections: ui.sections,
    theme: CONTENT.theme,
    experienceCount: CONTENT.experience.length,
    projects: CONTENT.featured,
    onProgress: (p) => setProgress(0.4 + p * 0.6),
  });
} catch (err) {
  console.warn('3D scene unavailable, showing the page without it:', err);
  document.getElementById('scene').remove();
  document.body.classList.add('no-webgl');
}
finish();
