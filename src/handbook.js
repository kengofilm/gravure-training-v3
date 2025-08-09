import { STATE } from './state.js';
import { byId, escapeHtml } from './utils.js';

export function renderHandbook(){
  const hb = STATE.handbook;
  const cSel = byId('hbChapter');
  const sSel = byId('hbSection');
  const content = byId('hbContent');
  if(!(hb.chapters && hb.chapters.length)){
    content.innerHTML = '<p class="tag">handbook.json が見つかりませんでした（任意）。</p>';
    return;
  }
  if(!cSel.options.length){
    for(let i=0;i<hb.chapters.length;i++){
      const ch=hb.chapters[i]; const o=document.createElement('option'); o.value=i; o.textContent=(i+1)+'. '+ch.title; cSel.appendChild(o);
    }
    cSel.addEventListener('change', function(){ populateSections(); renderPage(); });
    sSel.addEventListener('change', renderPage);
    populateSections();
  }
  renderPage();

  function populateSections(){
    sSel.innerHTML='';
    const ch = hb.chapters[parseInt(cSel.value||0,10)];
    const secs = (ch && ch.sections) ? ch.sections : [];
    for(let i=0;i<secs.length;i++){
      const s=secs[i]; const o=document.createElement('option'); o.value=i; o.textContent=(i+1)+') '+s.title; sSel.appendChild(o);
    }
  }
  function renderPage(){
    const ch = STATE.handbook.chapters[parseInt(cSel.value||0,10)];
    const secs = (ch && ch.sections) ? ch.sections : [];
    const sec = secs[parseInt(sSel.value||0,10)] || {content:""};
    content.innerHTML = '<h4 style="margin:.2em 0">'+escapeHtml(ch.title)+'</h4><h5 style="margin:.2em 0;color:#9ca3af">'+escapeHtml((sec.title||''))+'</h5><p class="panel" style="line-height:1.7">'+(String(sec.content||'').split('\n').map(escapeHtml).join('<br>'))+'</p>';
  }
}
window.renderHandbook = renderHandbook;
