import { STATE, STARTER } from './state.js';
export const DATA = {
  questions: ["./data/questions.json","./data/extra_questions.json"],
  glossary:  ["./data/glossary.json","./data/extra_glossary.json"],
  handbook:  ["./data/handbook.json"]
};
export function fetchFirst(urls){
  return new Promise((resolve)=>{
    let i=0; const tryNext=()=>{
      if(i>=urls.length){ resolve(null); return; }
      const u = urls[i++] + '?v='+(Date.now()%1000000);
      fetch(u,{cache:'no-store'}).then(res=>{
        if(!res.ok){ tryNext(); return; }
        res.json().then(data=>resolve(data)).catch(tryNext);
      }).catch(tryNext);
    }; tryNext();
  });
}
export function normalizeQuestions(any){
  let arr = Array.isArray(any)?any:((any&&(any.items||any.data))?(any.items||any.data):[]);
  arr = arr.filter((q)=> q && Array.isArray(q.choices) && typeof q.answer==='number' && typeof q.q==='string' && typeof q.id==='string' && typeof q.cat==='string' && q.answer>=0 && q.answer<q.choices.length);
  return arr.map(q=>{
    let diff = q.difficulty || q.level;
    if(typeof diff==='number'){ diff = diff<=1?'low':(diff>=3?'high':'mid'); }
    if(typeof diff!=='string'){ diff='mid'; }
    return {...q, level: diff};
  });
}
export function normalizeGlossary(any){
  let arr = Array.isArray(any)?any:((any&&(any.items||any.data))?(any.items||any.data):[]);
  const out=[]; (arr||[]).forEach((t)=>{
    if(!t || typeof t!=='object') return;
    const term=t.term||t['用語']||t.name||t.title;
    const cat=t.cat||t.category||t['カテゴリ']||"";
    const desc=t.desc||t.description||t.meaning||t.explanation||t['説明'];
    let rawAlias=t.alias||t['別名']||t.aka||null; let alias=[];
    if(Array.isArray(rawAlias)){ alias=rawAlias.filter(x=>typeof x==='string'&&x.trim()); }
    else if(typeof rawAlias==='string'){ alias=rawAlias.split(/[、,\/]/).map(x=>x.trim()).filter(Boolean); }
    if(typeof term==='string' && typeof desc==='string') out.push({term,cat,desc,alias});
  }); return out;
}
export async function loadData(){
  const arr = await Promise.all([fetchFirst(DATA.questions), fetchFirst(DATA.glossary), fetchFirst(DATA.handbook)]);
  const qs = normalizeQuestions(arr[0]);
  const gl = normalizeGlossary(arr[1]);
  const hb = arr[2];
  STATE.handbook = (hb && hb.chapters) ? hb : STARTER.handbook;
  STATE.all = (qs && qs.length) ? qs : STARTER.questions;
  STATE.glossary = (gl && gl.length) ? gl : STARTER.glossary;
}
