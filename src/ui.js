import { byId } from './utils.js';
export function setStats(text){ byId('stats').textContent = text; }
export function setProgress(pct){ const bar=document.querySelector('#progress .bar'); if(bar){ bar.style.width=Math.max(0,Math.min(100,pct))+'%'; } }
