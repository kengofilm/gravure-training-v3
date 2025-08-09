import { STATE } from './state.js';
import { loadData } from './data.js';
import { initRouter } from './router.js';
import { initGlossaryUI } from './glossary.js';
import { renderHandbook } from './handbook.js';
import { initTrainUI } from './train.js';
import { setStats } from './ui.js';

window.addEventListener('DOMContentLoaded', async ()=>{
  initRouter();
  await loadData();
  initGlossaryUI();
  renderHandbook();
  initTrainUI();
  setStats('問題:'+STATE.all.length+' | 用語:'+STATE.glossary.length+' | 誤答:'+STATE.wrongIds.size);
});
