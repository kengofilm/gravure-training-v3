export const LS = {
  wrong: 'gravure_wrongIds',
  hist: 'gravure_history',
  mastery: 'gravure_mastery',
  session: 'gravure_session_v2',
  activeTab: 'activeTab'
};
export const STATE = {
  all: [], glossary: [], handbook: { chapters: [] },
  wrongIds: new Set(JSON.parse(localStorage.getItem(LS.wrong)||'[]')),
  history: JSON.parse(localStorage.getItem(LS.hist)||'[]'),
  mastery: JSON.parse(localStorage.getItem(LS.mastery)||'{}'),
  session: null
};
export const STARTER = {
  questions: [
    {id:"S0001", cat:"基礎/方式", q:"グラビア印刷の版は？", choices:["凹版","凸版","孔版","平版"], answer:0, exp:"セルにインキを保持する凹版。", level:"low", tags:["凹版"]},
    {id:"S0002", cat:"色/色校正", q:"ΔE*00の利点は？", choices:["知覚差に近い","RGB必須","測色不要","必ず0.0になる"], answer:0, exp:"CIEDE2000は知覚均等性に配慮。", level:"low", tags:["ΔE"]},
    {id:"S0003", cat:"基材/表面処理", q:"OPPの前処理で一般的なのは？", choices:["コロナ処理","加硫","硫酸洗浄","UV硬化"], answer:0, exp:"ぬれ性向上のため。", level:"low", tags:["ダイン"]}
  ],
  glossary: [
    {term:"デザイン入稿", cat:"工程", desc:"制作データを色管理条件とともに受け取る工程。プロファイル/白引き設計など要確認。"},
    {term:"色校正", cat:"色評価", desc:"標準見本・光源条件・測色ルールの合意のもとで行う評価。ΔE*00で判定。"},
    {term:"白引き", cat:"カラマネ", desc:"下地に白インキを敷き、基材色の影響を減らす。"}
  ],
  handbook: {chapters:[{title:"スターター",sections:[{title:"概要",content:"data/ 配下に JSON を置くと自動で読み込みます。questions.json / glossary.json は最低限必要です。"}]}]}
};
export function savePersist(){
  localStorage.setItem(LS.wrong, JSON.stringify(Array.from(STATE.wrongIds)));
  localStorage.setItem(LS.hist, JSON.stringify(STATE.history));
  localStorage.setItem(LS.mastery, JSON.stringify(STATE.mastery));
}
export function saveSession(session){ STATE.session = session; localStorage.setItem(LS.session, JSON.stringify(session||null)); }
export function loadSession(){ try{ const raw = localStorage.getItem(LS.session); return raw?JSON.parse(raw):null; }catch(e){ return null; } }
export function clearSession(){ STATE.session = null; localStorage.removeItem(LS.session); }
