import { } from './utils.js';

export function getPanel(name){
  return document.getElementById('tab-'+name) || document.getElementById(name+'Panel');
}
export function setActiveTab(tab){
  const names=['train','glossary','diagram','handbook'];
  for(let i=0;i<names.length;i++){
    const n=names[i];
    const panel=getPanel(n);
    if(panel){ panel.hidden = (n!==tab); }
    const btn = document.getElementById('btn-'+n) || document.querySelector('.nav button[data-tab="'+n+'"]');
    if(btn){ btn.classList.toggle('active', n===tab); }
  }
  try{ localStorage.setItem('activeTab', tab); }catch(e){}
  if(tab==='handbook' && typeof window.renderHandbook==='function'){ window.renderHandbook(); }
}
export function initRouter(){
  const btns = document.querySelectorAll('.nav button');
  for(let i=0;i<btns.length;i++){
    (function(b){
      b.addEventListener('click', function(){
        const tab = b.getAttribute('data-tab') || 'train';
        setActiveTab(tab);
      });
    })(btns[i]);
  }
  const initial = (function(){ try{ return localStorage.getItem('activeTab') || 'train'; }catch(e){ return 'train'; }})();
  setActiveTab(initial);
}
