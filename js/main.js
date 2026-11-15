import { CONTENT } from '../content.js?v=11';
import { buildUI } from './ui.js?v=11';
import { initFx } from './fx.js?v=11';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

buildUI(CONTENT);
initFx(CONTENT);

// The page fades in once its fonts are ready.
await Promise.race([document.fonts.ready, wait(1200)]);
document.body.classList.add('ready');
