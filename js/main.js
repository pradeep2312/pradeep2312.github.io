import { CONTENT } from '../content.js?v=5';
import { buildUI } from './ui.js?v=5';
import { initFx } from './fx.js?v=5';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

buildUI(CONTENT);
initFx(CONTENT);

// The name appears first on a blank screen, then the page opens:
// the headline and giant name slide in, and the photo rises after them.
await Promise.race([document.fonts.ready, wait(1500)]);
await wait(1100);
document.body.classList.remove('loading');
document.body.classList.add('ready');
