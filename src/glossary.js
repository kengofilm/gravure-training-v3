import { STATE } from './state.js';
import { byId, escapeHtml } from './utils.js';

export function renderGlossary(){
  const q=(byId('gSearch').value||'').trim().toLowerCase();
  const cat=byId('gCat').value || 'all';
  const list=byId('gList'); list.innerHTML='';

  const filtered=STATE.glossary.filter(function(t){
    const okCat=(cat==='all' || t.cat===cat);
    const inTerm = (t.term||'').toLowerCase().indexOf(q)>=0;
    const inDesc = (t.desc||'').toLowerCase().indexOf(q)>=0;
    const inAlias = Array.isArray(t.alias) && t.alias.some(function(a){ return (a||'').toLowerCase().indexOf(q)>=0; });
    const okQ = (!q || inTerm || inDesc || inAlias);
    return okCat && okQ;
  });

  byId('gCount').textContent = filtered.length+' 語';

  filtered.forEach(function(t){
    const el=document.createElement('li'); el.className='term';
    const aliasHtml = (t.alias && t.alias.length)
      ? '<div class="muted" style="margin-top:4px;font-size:12px">別称: '+
        t.alias.map((a)=> '<span class="tag">'+escapeHtml(a)+'</span>').join(' ')
        +'</div>'
      : '';
    el.innerHTML =
      '<div><b>'+escapeHtml(t.term)+'</b> <span class="tag">'+escapeHtml(t.cat||'')+'</span></div>'+
      '<div style="opacity:.9;margin-top:4px">'+escapeHtml(t.desc||'')+'</div>'+ aliasHtml;
    el.addEventListener('click', function(){ showTerm(t); });
    list.appendChild(el);
  });

  byId('gDetail').hidden=true;
}

export function showTerm(t){
  const d=byId('gDetail'); d.hidden=false;
  const aliasHtml = (t.alias && t.alias.length)
    ? '<div class="muted" style="margin-top:8px">別称: '+
      t.alias.map((a)=> '<span class="tag">'+escapeHtml(a)+'</span>').join(' ')
      +'</div>'
    : '';
  d.innerHTML =
    '<b style="font-size:18px">'+escapeHtml(t.term)+'</b> '+
    '<span class="tag">'+escapeHtml(t.cat||'')+'</span>'+
    '<div style="margin-top:6px;line-height:1.6">'+escapeHtml(t.desc||'')+'</div>'+
    aliasHtml;
}

export function gotoGlossary(term){
  const input = document.getElementById('gSearch');
  if(input){ input.value = term || ''; }
  renderGlossary();

  if(term){
    const lower = term.toLowerCase();
    const t = STATE.glossary.find((g)=>{
      if((g.term||'').toLowerCase()===lower) return true;
      if(Array.isArray(g.alias) && g.alias.some((a)=> (a||'').toLowerCase()===lower)) return true;
      return false;
    }) || STATE.glossary.find((g)=>{
      return (g.term||'').indexOf(term)>=0 ||
             (g.desc||'').indexOf(term)>=0 ||
             (Array.isArray(g.alias) && g.alias.some((a)=> (a||'').indexOf(term)>=0));
    });
    if(t){ showTerm(t); const det=document.getElementById('gDetail'); if(det){ det.scrollIntoView({behavior:'smooth', block:'start'}); } }
  }
  window.scrollTo({top:0, behavior:'smooth'});
}

export function initGlossaryUI(){
  const gSel=document.getElementById('gCat');
  gSel.innerHTML='<option value="all">すべて</option>';
  const gCats = Array.from(new Set(STATE.glossary.map((t)=>t.cat))).sort();
  gCats.forEach(function(c){ const o=document.createElement('option'); o.value=c; o.textContent=c; gSel.appendChild(o); });
  document.getElementById('gSearch').addEventListener('input', renderGlossary);
  document.getElementById('gCat').addEventListener('change', renderGlossary);
  renderGlossary();
}
