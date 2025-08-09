import { STATE, savePersist, saveSession, loadSession, clearSession } from './state.js';
import { byId, escapeHtml, shuffle } from './utils.js';
import { setProgress } from './ui.js';

let session=null;
function getWeakScore(id){
  const m=STATE.mastery[id]||{seen:0,correct:0};
  if(m.seen===0) return 1;
  return 1 - (m.correct/m.seen);
}
function filterPool(){
  const mode = byId('mode').value;
  const catFilter = byId('catFilter').value;
  const difficulty = byId('difficulty').value;
  let pool = STATE.all.slice();
  if(catFilter!=='any'){ pool = pool.filter(q=> q.cat===catFilter); }
  if(difficulty!=='any'){ pool = pool.filter(q=> q.level===difficulty); }
  if(mode==='wrong'){ pool = pool.filter(q=> STATE.wrongIds.has(q.id)); }
  else if(mode==='weak'){ pool.sort((a,b)=> getWeakScore(b.id)-getWeakScore(a.id)); }
  return pool;
}
function renderQuestion(){
  const g=byId('game'); g.innerHTML='';
  const i=session.idx; const q=session.list[i];
  if(!q){ return; }
  const card=document.createElement('div');
  card.className='qcard';
  const tags=(q.tags&&q.tags.map(t=>'<span class="tag">'+escapeHtml(t)+'</span>').join(' '))||'';
  const levelJ = q.level==='low'?'低':(q.level==='high'?'高':'中');
  card.innerHTML =
    '<div class="qhead">'+escapeHtml(q.q)+'</div>'+
    '<div class="qmeta">'+escapeHtml(q.cat)+'　<span class="tag">難度:'+levelJ+'</span> '+tags+'</div>'+
    '<div class="choices">'+ q.choices.map((c,idx)=>'<button class="choice" data-i="'+idx+'">'+escapeHtml(c)+'</button>').join('') +'</div>'+
    '<div class="feedback" style="padding:10px 14px"></div>'+
    '<div style="padding:10px;display:flex;gap:8px;flex-wrap:wrap">'+
      '<button class="btn nextBtn" style="flex:1">次へ</button>'+
      '<button class="btn secondary skipBtn" style="flex:1">わからない（復習）</button>'+
    '</div>';
  g.appendChild(card);
  const btns=card.querySelectorAll('.choice');
  for(let b=0;b<btns.length;b++){
    const btn=btns[b];
    btn.addEventListener('click', ()=> selectChoice(card,q,parseInt(btn.getAttribute('data-i'))));
  }
  card.querySelector('.nextBtn').addEventListener('click', nextQuestion);
  card.querySelector('.skipBtn').addEventListener('click', ()=> skipQuestion(q,card));
  setProgress(Math.round((session.idx)/session.total*100));
}
function skipQuestion(q, card){
  STATE.wrongIds.add(q.id); savePersist();
  const fb=card.querySelector('.feedback');
  fb.textContent='スキップ：復習モードに追加しました。';
  nextQuestion();
}
function selectChoice(card,q,i){
  const ok=(i===q.answer);
  const btns=card.querySelectorAll('.choice');
  for(let b=0;b<btns.length;b++){
    const idx=b; btns[b].disabled=true;
    if(idx===q.answer) btns[b].classList.add('correct');
    if(idx===i && !ok) btns[b].classList.add('wrong');
  }
  const m=STATE.mastery[q.id]||{seen:0,correct:0};
  m.seen+=1; if(ok) m.correct+=1; STATE.mastery[q.id]=m;
  if(ok){ STATE.wrongIds.delete(q.id); session.correct+=1; } else { STATE.wrongIds.add(q.id); }
  savePersist();
  const fb=card.querySelector('.feedback');
  fb.innerHTML=(ok?'<span style="color:#16a34a">正解！</span>':'<span style="color:#ef4444">不正解…</span> 正解は「'+escapeHtml(q.choices[q.answer])+'」。') + ' ' + escapeHtml(q.exp||'');
  session.answers[session.idx]={id:q.id, selected:i, ok};
  persistSession();
}
function nextQuestion(){
  session.idx+=1;
  if(session.idx<session.list.length) renderQuestion(); else endSession();
  persistSession();
}
function endSession(){
  STATE.history.push({ts:Date.now(), correct:session.correct, total:session.total, byCat:session.byCat});
  savePersist(); clearSession();
  const g=byId('game');
  const rate=Math.round(session.correct/session.total*100);
  g.innerHTML='<div class="panel"><h3>結果: '+session.correct+' / '+session.total+'（'+rate+'%）</h3></div>';
  setProgress(100);
}
function persistSession(){
  session.byCat = session.byCat || {};
  const i=session.idx; const q=session.list[i];
  if(q){ if(!session.byCat[q.cat]) session.byCat[q.cat]={c:0,t:0}; }
  saveSession(session);
}
export function startGame(){
  const pool = filterPool();
  const count = parseInt(byId('countPreset').value,10)||15;
  if(pool.length===0){ alert('選択条件に合う問題がありません。'); return; }
  shuffle(pool); const selected=pool.slice(0, Math.min(count, pool.length));
  session = { idx:0, list:selected, answers:[], correct:0, total:selected.length, byCat:{} };
  saveSession(session); renderQuestion();
}
export function initTrainUI(){
  document.getElementById('start').addEventListener('click', startGame);
  document.getElementById('save').addEventListener('click', ()=>{
    if(!session){ alert('セッションが開始されていません。'); return; }
    saveSession(session); alert('一時保存しました。再開ボタンから続きができます。');
  });
  document.getElementById('resume').addEventListener('click', ()=>{
    const s=loadSession(); if(!s){ alert('保存されたセッションはありません。'); return; }
    session=s; renderQuestion();
  });
  document.getElementById('resetSession').addEventListener('click', ()=>{
    clearSession(); alert('保存中のセッションを削除しました。');
  });
}
