/* ===================== English 1–4 · app engine ===================== */
/* English 1–4 üçün AYRICA Google Cədvəl (Apps Script). Veb tətbiqin /exec linkini bura yazın. Boş qalanda qeydiyyat yalnız cihazda saxlanır. */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbziFaGfWngGaBtxsw5KHbfn4g6lHoXIQsEje_LsoxrSNyScVqRfY2TFxl4MKQ_SeNmj/exec';
const SAMIR_TEL = '557958625';
const TCODE = '25890';               // müəllim paneli kodu
const SITE = 'English 1–4';

/* ---------- storage ---------- */
const KEY = "hc14_v1";
let S = {prog:{}, learned:{}, log:[]};
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch(e) {}
if (!Array.isArray(S.log)) S.log = [];
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {} }
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

/* ---------- helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd = n => Math.floor(Math.random()*n);
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const take = (a,n) => shuffle(a).slice(0,n);
const W = w => ({en:w[0], az:w[1], p:w[2]});
const isText = p => typeof p === "string" && /^[\x20-\x7E]+$/.test(p) && !p.startsWith("c:") && !p.startsWith("#");
const NUMW = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
const TENS = {20:"twenty",30:"thirty",40:"forty",50:"fifty",60:"sixty",70:"seventy",80:"eighty",90:"ninety",100:"one hundred"};
function numWord(n){ if (n<=20) return NUMW[n]; if (TENS[n]) return TENS[n]; const t=Math.floor(n/10)*10; return TENS[t]+"-"+NUMW[n%10]; }
function pic(p, cls=""){
  if (!p) return `<span class="pic ${cls}"><span class="tx">?</span></span>`;
  if (p.startsWith("c:")) return `<span class="pic ${cls}"><span class="sw" style="background:${p.slice(2)}"></span></span>`;
  if (p.startsWith("#") && ICONS[p.slice(1)]) return `<span class="pic ${cls}">${ICONS[p.slice(1)]}</span>`;
  if (isText(p)) return `<span class="pic ${cls}"><span class="tx">${esc(p)}</span></span>`;
  return `<span class="pic ${cls}"><span class="em">${p}</span></span>`;
}
const stripEmoji = t => String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{2190}-\u{21FF}]/gu,"").replace(/___+/g,"blank").trim();
const today = () => { const d=new Date(); return String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear(); };

/* ---------- speech ---------- */
let VOICE = null;
function pickVoice(){ try { const v = speechSynthesis.getVoices(); VOICE = v.find(x=>/en[-_]GB/i.test(x.lang)&&/female|google|libby|sonia|serena/i.test(x.name)) || v.find(x=>/en[-_](US|GB)/i.test(x.lang)) || v.find(x=>/^en/i.test(x.lang)) || null; } catch(e){} }
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch(e){}
function speak(text, opts={}){
  try {
    const t = stripEmoji(text); if (!t) { opts.onend && opts.onend(); return; }
    if (!opts.queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "en-GB"; if (VOICE) u.voice = VOICE; u.rate = opts.rate || 0.85; u.pitch = 1.05;
    if (opts.onend) u.onend = opts.onend;
    speechSynthesis.speak(u);
  } catch(e){ opts.onend && opts.onend(); }
}
function stopSpeak(){ try { speechSynthesis.cancel(); } catch(e){} }

/* ---------- sounds + fireworks ---------- */
let AC = null;
function tone(f, d, type="sine", v=.08, when=0){
  try { AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.value=f;
    const t=AC.currentTime+when; g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d+.02); } catch(e){}
}
const sfx = {
  click(){ tone(660,.06,"triangle",.05); },
  ok(){ tone(660,.1,"sine",.09); tone(880,.12,"sine",.09,.09); tone(1320,.18,"sine",.07,.18); },
  bad(){ tone(220,.18,"square",.05); tone(160,.25,"square",.05,.12); },
  win(){ [523,659,784,1046,1318].forEach((f,i)=>tone(f,.22,"triangle",.08,i*.11)); }
};
const fx = $("#fx"); let parts=[], fxOn=false;
function fireworks(n=3){
  const c=fx; c.width=innerWidth; c.height=innerHeight;
  const cols=["#FF7A2F","#FFC83D","#1FAE69","#2F7BFF","#9A4DF0","#F0418C"];
  for(let k=0;k<n;k++){ const x=innerWidth*(.2+.6*Math.random()), y=innerHeight*(.2+.3*Math.random());
    for(let i=0;i<60;i++){ const a=Math.random()*6.28, s=2+Math.random()*5; parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:60+rnd(30),c:cols[rnd(6)]}); } }
  if(!fxOn){ fxOn=true; requestAnimationFrame(tick); }
}
function tick(){ const g=fx.getContext("2d"); g.clearRect(0,0,fx.width,fx.height);
  parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=.08; p.vx*=.99; p.l--; g.globalAlpha=Math.max(0,p.l/80); g.fillStyle=p.c; g.beginPath(); g.arc(p.x,p.y,3,0,6.3); g.fill(); });
  parts=parts.filter(p=>p.l>0); if(parts.length) requestAnimationFrame(tick); else { fxOn=false; g.clearRect(0,0,fx.width,fx.height); } }
function toast(t){ const d=document.createElement("div"); d.className="toast"; d.textContent=t; document.body.appendChild(d); setTimeout(()=>d.remove(),2200); }
document.addEventListener("click", e=>{ if(e.target.closest("button")) sfx.click(); }, true);

/* ---------- data access ---------- */
const grade = g => GRADES[g-1];
const unit = (g,u) => grade(g).units[u];
const words = (g,u) => unit(g,u).w.map(W);
const allWords = g => grade(g).units.flatMap((x,i)=>x.w.map(w=>Object.assign(W(w),{u:i})));
const pre = g => g===1;  // 1-ci sinif: oxumadan, səs və şəkil ilə
function distract(w, pool, n){ return take(pool.filter(x=>x.en!==w.en && x.p!==w.p && x.az!==w.az), n); }
function dedupe(arr, f){ const s=new Set(); return arr.filter(x=>{ const k=f(x); if(s.has(k)) return false; s.add(k); return true; }); }

/* şəkli konkret olmayan cümlələr (sual, bəli/xeyr) 1-ci sinifdə şəkil seçimində işlənmir */
const ABSTRACT = new Set(["❓","👍","👎","🎂","🎨","👋","🫡","🔤","✍️","📅","🗓️","⏰"]);
/* ===================== QUESTION GENERATORS ===================== */
const G = {
  listenPic(ws, n=8){ return take(ws,n).map(w=>({k:"choice", say:w.en, prompt:{text:"🔊 Dinlə və şəkli tap", small:true}, layout:"pic",
      opts:shuffle([{p:w.p, ok:true}, ...distract(w,ws,3).map(d=>({p:d.p}))])})); },
  picWord(ws, n=8, g=2){ return take(ws,n).map(w=>({k:"choice", prompt:{p:w.p, az: pre(g)?"":""}, layout:"txt",
      opts:shuffle([{t:w.en, ok:true, sp:pre(g)}, ...distract(w,ws,pre(g)?2:3).map(d=>({t:d.en, sp:pre(g)}))])})); },
  wordPic(ws, n=8){ return take(ws,n).map(w=>({k:"choice", say:w.en, prompt:{text:w.en}, layout:"pic",
      opts:shuffle([{p:w.p, ok:true}, ...distract(w,ws,3).map(d=>({p:d.p}))])})); },
  azPic(ws, n=8){ return take(ws,n).map(w=>({k:"choice", prompt:{text:w.az, az:"Azərbaycanca söz → şəkli tap"}, layout:"pic",
      opts:shuffle([{p:w.p, ok:true}, ...distract(w,ws,3).map(d=>({p:d.p}))])})); },
  azEn(ws, n=8){ return take(ws,n).map(w=>({k:"choice", prompt:{text:w.az, az:"İngiliscəsini seç"}, layout:"txt",
      opts:shuffle([{t:w.en, ok:true}, ...distract(w,ws,3).map(d=>({t:d.en}))])})); },
  enAz(ws, n=8){ return take(ws,n).map(w=>({k:"choice", say:w.en, prompt:{text:w.en, p:w.p, az:"Tərcüməsini seç"}, layout:"txt",
      opts:shuffle([{t:w.az, ok:true}, ...distract(w,ws,3).map(d=>({t:d.az}))])})); },
  sentence(ss, g, n=6){
    const S2 = ss.map(s=>({en:s[0], az:s[1], p:s[2]}));
    if (pre(g)) { const ok = dedupe(S2.filter(s=>!ABSTRACT.has(s.p)), s=>s.p); if (ok.length<3) return []; return take(ok, n).map(s=>({k:"choice", say:s.en, prompt:{text:"🔊 Cümləni dinlə və şəkli seç", small:true}, layout:"pic",
        opts:shuffle([{p:s.p, ok:true}, ...take(ok.filter(x=>x.p!==s.p),2).map(d=>({p:d.p}))])})); }
    return take(S2, n).map(s=>({k:"choice", say:s.en, prompt:{p:s.p, text:s.az, az:"Bu cümlənin ingiliscəsini seç"}, layout:"txt",
      opts:shuffle([{t:s.en, ok:true}, ...take(S2.filter(x=>x.en!==s.en),2).map(d=>({t:d.en}))])}));
  },
  chat(ch, g){ return shuffle(ch).map(c=>({k:"choice", say:c[0], prompt:{text:c[0], az:"Düzgün cavabı seç"}, layout:"txt",
      opts:shuffle([{t:c[1], ok:true, sp:pre(g)}, ...c[2].map(x=>({t:x, sp:pre(g)}))])})); },
  tf(ws, g, n=8){ const pool = ws; return take(pool,n).map(w=>{ const truth = Math.random()<.5; const d = distract(w,pool,1)[0] || w; const shown = truth ? w : d;
      const art = /^[aeiou]/i.test(w.en) ? "an" : "a"; const sent = isText(w.p)||w.p.startsWith("c:") ? `It's ${w.en}.` : (/s$/.test(w.en)&&!/ss$/.test(w.en) ? `They're ${w.en}.` : `It's ${art} ${w.en}.`);
      return {k:"choice", say:sent, prompt:{p:shown.p, text: pre(g) ? "🔊 Dinlə: düzdür, yoxsa səhv?" : sent, az: pre(g)?"":"Düzdür ✓ yoxsa səhv ✗?"}, layout:"pic2",
        opts:[{p:"✅", ok:truth},{p:"❌", ok:!truth}]}; }); },
  count(ws, g, n=6){ const em = ws.filter(w=>!isText(w.p) && !w.p.startsWith("#") && !w.p.startsWith("c:") && [...w.p].length<=2);
      if (!em.length) return []; const max = pre(g)?6:10;
      return Array.from({length:n},()=>{ const w=em[rnd(em.length)]; const k=2+rnd(max-1);
        const nums = shuffle([k, ...take([...Array(max+1).keys()].slice(1).filter(x=>x!==k),3)]);
        return {k:"choice", say:"How many "+w.en+"?", prompt:{html:`<div style="font-size:42px;line-height:1.2;max-width:420px">${Array(k).fill(w.p).join(" ")}</div>`, text:"How many?", az:"Neçədir? Say!"}, layout:"txt two",
          opts:nums.map(x=>({t: pre(g)? String(x) : numWord(x), ok:x===k}))}; }); },
  firstLetter(ws, n=8){ const L="abcdefghijklmnoprstuwy".split(""); const ok = ws.filter(w=>/^[a-z]/i.test(w.en) && !isText(w.p));
      return take(ok,n).map(w=>{ const f=w.en[0].toLowerCase(); return {k:"choice", say:w.en, prompt:{p:w.p, text:"🔊 İlk hərfi tap", small:true}, layout:"txt two",
        opts:shuffle([{t:f.toUpperCase()+" "+f, ok:true}, ...take(L.filter(x=>x!==f),3).map(x=>({t:x.toUpperCase()+" "+x}))])}; }); },
  odd(ws, others, n=6){ const res=[]; for(let i=0;i<n;i++){ const three = take(dedupe(ws,w=>w.p),3); const out = take(others.filter(o=>!three.some(t=>t.p===o.p)),1)[0]; if(!out||three.length<3) break;
      res.push({k:"choice", prompt:{text:"Hansı artıqdır?", az:"Qrupa aid olmayanı tap", small:true}, layout:"pic",
        opts:shuffle([...three.map(t=>({p:t.p, w:t.en})), {p:out.p, ok:true, w:out.en}])}); } return res; },
  gap(ss, ws, n=6){ const res=[]; for (const s of shuffle(ss)) { const en=s[0];
      const hit = ws.slice().sort((a,b)=>b.en.length-a.en.length).find(w=>new RegExp("\\b"+w.en.replace(/[-]/g,"\\-")+"s?\\b","i").test(en));
      if (hit) { const re=new RegExp("\\b("+hit.en.replace(/[-]/g,"\\-")+"s?)\\b","i"); const m=en.match(re)[1];
        const wr = distract(hit, ws, 2).map(d=> m.toLowerCase().endsWith("s")&&!hit.en.endsWith("s") ? d.en+"s" : d.en);
        res.push({k:"choice", say:en, prompt:{text:en.replace(re,"_____"), az:s[1]}, layout:"txt", opts:shuffle([{t:m, ok:true}, ...wr.map(t=>({t}))])}); }
      if (res.length>=n) break; } return res; },
  spell(ws, n=6){ return take(ws.filter(w=>/^[a-z]+$/i.test(w.en) && w.en.length<=10 && w.en.length>=3), n).map(w=>({k:"spell", word:w.en.toLowerCase(), p:w.p, az:w.az})); },
  missing(ws, n=6){ return take(ws.filter(w=>/^[a-z -]+$/i.test(w.en) && w.en.replace(/[^aeiou]/gi,"").length>=1 && w.en.length>=3), n).map(w=>({k:"missing", word:w.en.toLowerCase(), p:w.p, az:w.az})); },
  type(ws, n=6){ return take(ws.filter(w=>w.en.length<=14), n).map(w=>({k:"type", word:w.en, p:w.p, az:w.az})); },
  build(ss, n=6){ return take(ss.filter(s=>s[0].split(" ").length>=3 && s[0].split(" ").length<=9), n).map(s=>({k:"build", tokens:s[0].split(" "), az:s[1], p:s[2], en:s[0]})); },
  math(g, n=6){ const res=[]; const hi = g===4?100:(g===2?20:10);
    for(let i=0;i<n;i++){ let a,b; if(hi===100){ a=(1+rnd(5))*10; b=(1+rnd(4))*10; } else { a=1+rnd(hi/2); b=1+rnd(hi/2); } const c=a+b;
      const wr = take([c-10,c+10,c-1,c+1,c+2].filter(x=>x>0&&x<=Math.max(hi,100)&&x!==c),2);
      res.push({k:"choice", say:`${numWord(a)} plus ${numWord(b)}`, prompt:{text:`${numWord(a)} + ${numWord(b)} = ?`, az:`${a} + ${b}`}, layout:"txt", opts:shuffle([{t:numWord(c),ok:true},...wr.map(x=>({t:numWord(x)}))])}); }
    return res; },
  ordinal(n=6){ const an=["🐒","🦁","🐰","🐯","🐶","🦒","🐑","🐴","🐮","🐸"]; const nm=["monkey","lion","rabbit","tiger","dog","giraffe","sheep","horse","cow","frog"];
    const ord=["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth"]; const res=[];
    for(let i=0;i<n;i++){ const k=rnd(10); const o=shuffle([...Array(10).keys()]); const row=o.map(x=>an[x]); const tgt=o[k];
      res.push({k:"choice", say:`Which animal is the ${ord[k]}?`, prompt:{html:`<div style="font-size:30px;letter-spacing:2px">${row.map((a,j)=>`<span title="${j+1}">${a}</span>`).join("")}</div><div class="paz">1st → 10th</div>`, text:`Which animal is the ${ord[k]}?`}, layout:"txt two",
        opts:shuffle([{t:nm[tgt],ok:true}, ...take(nm.filter((_,j)=>j!==tgt),3).map(t=>({t}))])}); }
    return res; },
  readQs(qs){ return qs.map(q=>({k:"choice", say:q[0], prompt:{text:q[0]}, layout:"txt", opts:shuffle([{t:q[1],ok:true}, ...q.slice(2).map(t=>({t}))])})); },
  grammarQs(qs){ return shuffle(qs).map(q=>({k:"choice", prompt:{text:q[0], az:"Boşluğa uyğun variantı seç"}, layout:"txt", sayAfter:true, full:(t)=>q[0].replace(/_{3,}/,t),
      opts:shuffle([{t:q[1],ok:true}, ...q.slice(2).map(t=>({t}))])})); },
  storyPics(lines){ const L=dedupe(lines.map(l=>({en:l[0],p:l[2]})).filter(l=>!isText(l.p) && !ABSTRACT.has(l.p)), l=>l.p);
    return take(L, Math.min(5,L.length)).map(l=>({k:"choice", say:l.en, prompt:{text:"🔊 Cümləni dinlə və şəkli seç", small:true}, layout:"pic", opts:shuffle([{p:l.p,ok:true}, ...take(L.filter(x=>x.p!==l.p),2).map(d=>({p:d.p}))])})); }
};
function mixTest(g, u, n=15){
  const ws = u==null ? allWords(g) : words(g,u); const un = u==null ? null : unit(g,u);
  const others = u==null ? [] : grade(g).units.flatMap((x,i)=> i===u?[]:x.w.map(W));
  const ss = u==null ? grade(g).units.flatMap(x=>x.s) : un.s;
  let qs = [];
  if (pre(g)) qs = [...G.listenPic(ws,5), ...G.sentence(ss,g,3), ...G.tf(ws,g,3), ...G.odd(ws.length>4?ws:allWords(g), others.length?others:allWords(g),2), ...G.count(ws,g,2)];
  else qs = [...G.wordPic(ws,3), ...G.azEn(ws,3), ...G.sentence(ss,g,3), ...G.gap(ss,ws,3), ...G.spell(ws,2), ...G.build(ss,1)];
  return shuffle(qs).slice(0,n);
}

/* ===================== VIEWS ===================== */
let VIEW = {p:"home"};
const app = $("#app");
function go(v){ stopSpeak(); VIEW=v; render(); window.scrollTo({top:0,behavior:"instant"}); }
function tone_cls(g){ return g ? "t-"+grade(g).tone : "t-g1"; }

function render(){
  if (!REG) return regScreen();
  if (lsGet('hc14-blok',0)) return blockScreen();
  const v=VIEW; app.className = v.g ? (v.p==="extra"||v.x ? "t-ex" : tone_cls(v.g)) : "";
  document.body.className = app.className;
  if (v.p==="home") return renderHome();
  if (v.p==="grade") return renderGrade(v.g);
  if (v.p==="unit") return renderUnit(v.g, v.u);
  if (v.p==="sec") return renderSec(v);
  if (v.p==="extra") return renderExtra(v.g);
  if (v.p==="act") return renderAct(v);
  if (v.p==="teacher") return teacher();
}
function crumbs(items){ return `<nav class="crumbs"><button class="homeb" data-go='{"p":"home"}'>🏠 Ana menyu</button>${items.map((it,i)=> i===0 ? `<button class="back" data-go='${JSON.stringify(it[1])}'>← Geri</button>` : (it[1]?`<button data-go='${JSON.stringify(it[1])}'>${it[0]}</button>`:`<span>${it[0]}</span>`)).join("")}</nav>`; }
app.addEventListener("click", e=>{ const b=e.target.closest("[data-go]"); if(b) go(JSON.parse(b.dataset.go)); });

function gradePct(g){ const gr=grade(g); let t=0,d=0; gr.units.forEach((_,u)=>{ const ts=unitTasks(g,u).flatMap(s=>s.tasks); t+=ts.length; d+=ts.filter(x=>S.prog[x.key]!=null).length; }); return t?Math.round(d*100/t):0; }
function renderHome(){
  const name = REG && REG.ad ? REG.ad : "";
  app.innerHTML = `
  <section class="hello"><h2>${name?`Salam, ${esc(name)}! 👋`:"Salam! Sinfini seç 👋"}</h2>
  <p>Hər sinifdə dərsliyin bütün unitləri var. Unitin içində sözləri öyrənirsən, Student Book və Workbook tapşırıqlarını edirsən, oyun oynayırsan, video izləyirsən və sonda test yazırsan.</p></section>
  ${profHTML()}
  <section class="grades">${GRADES.map(gr=>{ const p=gradePct(gr.n); return `
    <button class="gcard t-${gr.tone}" data-go='{"p":"grade","g":${gr.n}}'>
      <span class="dots"></span><span class="big" aria-hidden="true">${gr.icon}</span>
      <span class="num">${gr.n}<small>-${gr.n===1?"ci":gr.n===2?"ci":gr.n===3?"cü":"cü"}</small></span>
      <h3>${gr.name}</h3><p>${gr.sub} · ${gr.units.length} unit + əlavə materiallar</p>
      <div class="gmeta"><span>İrəliləyiş</span><span>${p}%</span></div><div class="bar"><i style="width:${p}%"></i></div>
    </button>`; }).join("")}</section>`;
}
function unitDone(g,u){ const ts=unitTasks(g,u).flatMap(s=>s.tasks); const d=ts.filter(x=>S.prog[x.key]!=null).length; return {d, t:ts.length, test:S.prog[`g${g}u${u}-test`]}; }
function renderGrade(g){
  const gr=grade(g);
  app.innerHTML = crumbs([["",{p:"home"}],[gr.name]]) + `
  <section class="ghead"><span class="gi">${gr.icon}</span><div><h2>${gr.name}</h2><p>${gr.sub} · Student Book + Workbook · ${gr.units.length} unit</p></div></section>
  <section class="units">${gr.units.map((un,u)=>{ const st=unitDone(g,u); const p=Math.round(st.d*100/st.t);
    return `<button class="ucard" data-go='{"p":"unit","g":${g},"u":${u}}'>
      <div class="uh"><span class="un">Unit ${u+1}</span><span class="ue">${un.e}</span></div>
      <h3>${esc(un.t)}</h3><span class="uaz">${esc(un.az)}</span>
      <div class="bar"><i style="width:${p}%"></i></div>
      <div class="ust"><span>${st.d}/${st.t} tapşırıq</span><span>${st.test!=null?"Test: "+st.test+"%":"Test: —"}</span></div></button>`; }).join("")}
    <button class="ucard extra" data-go='{"p":"extra","g":${g}}'><div class="uh"><span class="un">Əlavə</span><span class="ue">⭐</span></div>
      <h3>Əlavə oyunlar və materiallar</h3><span class="uaz">Səsli hekayələr · qısa mətnlər · qrammatika · videolar · böyük oyunlar · ümumi test · sinif alətləri</span></button>
  </section>`;
}

/* ---------- unit task registry ---------- */
function unitTasks(g,u){
  const un=unit(g,u), ws=words(g,u), others=grade(g).units.flatMap((x,i)=>i===u?[]:x.w.map(W)), k=t=>`g${g}u${u}-${t}`, P=pre(g);
  const hasNum = ws.some(w=>/^\d+$/.test(w.p));
  const T=(id,ic,name,sub,run)=>({id,ic,name,sub,run,key:k(id)});
  const quiz=(id,ic,name,sub,make,skin,ins)=>T(id,ic,name,sub,el=>runQuiz(el,{title:name,ins:ins||sub,qs:make(),skin,key:k(id),g,u}));
  const sec=[];
  const voc=[
    T("flash","🃏","Söz kartları","Kartı çevir, dinlə, «Öyrəndim» de",el=>runFlash(el,ws,g,u,k("flash"))),
    T("list","📋","Lüğət siyahısı","Bütün sözlər, səs və tərcümə ilə",el=>runList(el,ws,un,k("list"))),
    quiz("listen","🎧","Dinlə və tap","Sözü eşit, şəklini seç",()=>G.listenPic(ws,8))];
  if (!P) voc.push(quiz("trans","🔁","Tərcümə et","Azərbaycanca sözün ingiliscəsini seç",()=>G.azEn(ws,8)));
  sec.push({id:"voc",h:"📖 Vocabulary",sub:"Sözləri öyrən: şəkil, səs, tərcümə",tasks:voc});
  const sb=[ quiz("point","👉","Listen and point",P?"Şəklə bax, düzgün sözü dinləyib seç":"Şəklə bax, sözü seç",()=>G.picWord(ws,8,g)) ];
  if (un.story) sb.push(T("story","📗","Story: "+un.story.t,"Hekayəni dinlə, sonra suallar",el=>runStory(el,{t:un.story.t,lines:un.story.lines,qs:null},k("story"),g)));
  if (un.read) sb.push(T("read","📗","Read: "+un.read.t,"Mətni oxu və dinlə, suallara cavab ver",el=>runRead(el,un.read,k("read"),g)));
  sb.push(T("book","📚","Şəkilli kitab: "+BOOKPAT[g][u].t,"Kitabı dinlə və oxu, sonra oyna",el=>runBook(el,makeBook(g,u),k("book"),g)));
  sb.push(T("grammar","🎵","Grammar Chant","Dinlə, əl çal və təkrar et, sonra oyna",el=>runChant(el,un,g,k("grammar"))));
  sb.push(quiz("chat","💬","Happy Chat!","Suala uyğun cavabı seç",()=>G.chat(un.chat,g)));
  sb.push(T("memory","🧠","Play: Memory Game","Cütləri tap",el=>runMemory(el,ws,g,k("memory"))));
  sb.push(quiz("roundup","🔍","Round Up!",P?"Say və dinlə: düz, yoxsa səhv?":"Say, oxu və yoxla",()=>shuffle([...G.count(ws,g,4),...G.tf(ws,g,4)])));
  sec.push({id:"sb",h:"📘 Student Book",sub:"Dərslikdəki dərslərin interaktiv forması",tasks:sb});
  const wb=[
    quiz("complete","✍️",P?"Complete: ilk hərf":"Complete the word",P?"Sözü eşit, ilk hərfini tap":"Buraxılmış hərfləri tamamla",()=>P?G.firstLetter(ws,8):G.missing(ws,7)),
    quiz("check","✅","Listen and check ✓ ✗","Düzdür, yoxsa səhv?",()=>G.tf(ws,g,8)),
    T("number","🔢","Listen and number","Sözləri eşitdiyin ardıcıllıqla düz",el=>runOrder(el,ws,k("number"))),
    T("match","🔗","Match","Şəkli sözlə birləşdir",el=>runMatch(el,ws,g,k("match")))];
  if (un.col) wb.push(T("colour","🖍️","Colour","Dinlə və rənglə",el=>runColour(el,g,u,k("colour"))));
  wb.push(quiz("circle","⭕",P?"Listen and circle":"Read and circle",P?"Cümləni dinlə, şəkli dairəyə al":"Boşluğa uyğun sözü seç",()=>P?G.sentence(un.s,g,6):G.gap(un.s,ws,6)));
  sec.push({id:"wb",h:"📗 Workbook (Skills Book)",sub:"İş dəftəri tapşırıqları",tasks:wb});
  const ex=[ quiz("odd","🧩","Odd one out","Artıq olanı tap",()=>G.odd(ws,others,6)) ];
  if (P) { ex.push(quiz("count","🔢","Count and choose","Say və rəqəmi seç",()=>G.count(ws,g,8)));
           ex.push(quiz("sentpic","🗣️","Listen to the sentence","Cümləni dinlə, şəkli seç",()=>G.sentence(un.s,g,7))); }
  else { ex.push(quiz("spell","🔤","Unscramble","Qarışıq hərflərdən sözü qur",()=>G.spell(ws,6)));
         ex.push(quiz("build","🧱","Make a sentence","Sözləri düzgün sıraya düz",()=>G.build(un.s,6)));
         ex.push(quiz("gap","🕳️","Fill the gap","Cümlədəki boşluğu doldur",()=>G.gap(un.s,ws,6)));
         ex.push(T("search","🔎","Word search","Sözləri cədvəldə tap",el=>runSearch(el,ws,k("search"))));
         ex.push(quiz("enaz","🇦🇿","English → Azərbaycanca","Tərcüməni seç",()=>G.enAz(ws,8))); }
  if (g>=3) ex.push(quiz("type","⌨️","Write the word","Şəklə bax, sözü yaz",()=>G.type(ws,6)));
  if (hasNum) ex.push(quiz("math","➕","Number maths","Sözlərlə hesabla",()=>G.math(g,6)));
  if (g===4 && u===1) { ex.push(quiz("ordinal","🥇","Which animal is…?","Sıra sayına görə heyvanı tap",()=>G.ordinal(6))); ex.push(T("cake","🎂","Colour the cake","Sıra sayına görə tortu rənglə",el=>runCake(el,k("cake")))); }
  sec.push({id:"ex",h:"🧩 Əlavə tapşırıqlar",sub:"Mövzuya uyğun yeni çalışmalar",tasks:ex});
  const gp = P ? ()=>G.listenPic(ws,10) : ()=>shuffle([...G.wordPic(ws,4),...G.azEn(ws,3),...G.gap(un.s,ws,3)]);
  sec.push({id:"gm",h:"🎮 Oyunlar",sub:"Oyna və öyrən",tasks:[
    quiz("wheel","🎡","Wheel Spin","Çarxı fırlat, xal qazan",gp,"wheel"),
    quiz("ship","🚢","Ship Battle","Düz cavab ver, gəmini batır",gp,"ship"),
    quiz("crane","🏗️","Crane Game","Qutuları qaldır",()=>G.listenPic(ws,8),"crane"),
    quiz("potion","🧪","Magic Potions","İksir bişir, heyvanı çevir",P?()=>G.sentence(un.s,g,6):()=>G.enAz(ws,8),"potion"),
    quiz("ocean","🤿","Ocean Quest","Dənizin dibinə en, xəzinəni tap",()=>P?G.tf(ws,g,8):G.chat(un.chat,g).concat(G.picWord(ws,4,g)),"ocean"),
    quiz("bubble","🫧","Bubble Pop","Düzgün qabarcığı partlat",()=>G.listenPic(ws,8),"bubble"),
    quiz("alien","👽",P?"Alien Friends":"Alien Spelling",P?"Yadplanetlini dinlə, şəkli seç":"Yadplanetliyə sözü yazmağa kömək et",()=>P?G.listenPic(ws,8):G.spell(ws,6),"alien"),
    T("puzzle","🧩","Fix the Picture","Şəkli hissələrdən düzəlt",el=>runPuzzle(el,ws,g,k("puzzle"))),
    T("race","🏁","Sound Race","Vaxta qarşı: dinlə və tap!",el=>runQuiz(el,{title:"Sound Race",ins:"Hər sual üçün "+(P?7:6)+" saniyə var. Tez ol!",qs:G.listenPic(ws,10),key:k("race"),g,u,timer:P?7:6}))]});
  sec.push({id:"test",h:"🏆 Unit testi",sub:"Unitin yekun testi",tasks:[quiz("test","🏆","Unit "+(u+1)+" testi","15 sual · bütün unit",()=>mixTest(g,u,15))]});
  return sec;
}
function taskCard(t){ const sc=S.prog[t.key]; return `<button class="task ${sc!=null?"done":""}" data-task="${t.id}"><span class="ti">${t.ic}</span><span class="tt"><b>${esc(t.name)}</b><small>${esc(t.sub)}</small></span><span class="ts">${sc!=null?sc+"%":"Başla"}</span></button>`; }
const SEC_COL = {lib:"#16A3B8",phon:"#FF7A2F",voc:"#FF7A2F",sb:"#2F7BFF",wb:"#1FAE69",ex:"#9A4DF0",gm:"#F0418C",vid:"#E5312D",test:"#E8A200",st:"#16A3B8",tx:"#2F7BFF",gr:"#9A4DF0",big:"#F0418C",abc:"#FF7A2F",bigtest:"#E8A200",tools:"#1FAE69"};
function secTile(s, cnt, done, go_){ const c=SEC_COL[s.id]||"#2F7BFF"; const p=cnt?Math.round(done*100/cnt):0;
  return `<button class="stile" style="--sc:${c}" data-go='${JSON.stringify(go_)}'><span class="sic">${s.h.split(" ")[0]}</span><b>${esc(s.h.split(" ").slice(1).join(" "))}</b><small>${esc(s.sub)}</small>${cnt!=null?`<span class="sbar"><i style="width:${p}%"></i></span><span class="scount">${done}/${cnt}</span>`:""}</button>`; }
function unitVideos(g,u){ return (UNIT_TOPICS[g][u]||[]).map(t=>[t,VIDS[t]||[]]); }
function renderUnit(g,u){
  const un=unit(g,u), gr=grade(g), secs=unitTasks(g,u), st=unitDone(g,u);
  const nv=unitVideos(g,u).reduce((a,[,l])=>a+l.length,0);
  const tiles = secs.map(s=>secTile(s, s.tasks.length, s.tasks.filter(t=>S.prog[t.key]!=null).length, {p:"sec",g,u,s:s.id}));
  tiles.splice(secs.length-1,0, secTile({id:"vid",h:"🎬 Videolar",sub:`Mövzuya uyğun ${nv} video · YouTube`}, null, 0, {p:"sec",g,u,s:"vid"}));
  app.innerHTML = crumbs([["",{p:"grade",g}],[gr.name,{p:"grade",g}],["Unit "+(u+1)]]) + `
  <section class="uhead"><span class="ue">${un.e}</span><div><h2>Unit ${u+1} · ${esc(un.t)}</h2><p>${esc(un.az)} · ${un.w.length} söz · ${st.d}/${st.t} tapşırıq bitib</p></div></section>
  <section class="stiles">${tiles.join("")}</section>`;
}
function vidCard(v){ return `<a class="vid" href="https://www.youtube.com/watch?v=${v[1]}" target="_blank" rel="noopener"><span class="thumb"><img src="https://i.ytimg.com/vi/${v[1]}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="play">▶</span></span><span class="vt"><b>${esc(v[0])}</b><small>YouTube</small></span></a>`; }
function videoGroups(groups){ return groups.map(([t,l])=>`<section class="sect"><h3>${esc(VTOPIC[t]||t)} <small>${l.length} video</small></h3><div class="vids">${l.map(vidCard).join("")}</div></section>`).join(""); }
function renderSec(v){
  const {g,u}=v, gr=grade(g), un=unit(g,u);
  const base=[["",{p:"unit",g,u}],[gr.name,{p:"grade",g}],["Unit "+(u+1),{p:"unit",g,u}]];
  if (v.s==="vid"){ const groups=unitVideos(g,u);
    app.innerHTML = crumbs([...base,["🎬 Videolar"]]) + `<section class="uhead" style="background:#FFE3E1"><span class="ue">🎬</span><div><h2>Videolar · Unit ${u+1}</h2><p>${esc(un.t)} · videoya toxun, YouTube-da açılacaq</p></div></section>${videoGroups(groups)}`; return; }
  const s=unitTasks(g,u).find(x=>x.id===v.s); if(!s) return go({p:"unit",g,u});
  app.innerHTML = crumbs([...base,[s.h]]) + `<section class="uhead" style="background:color-mix(in srgb, ${SEC_COL[s.id]} 16%, var(--paper))"><span class="ue">${s.h.split(" ")[0]}</span><div><h2>${esc(s.h.split(" ").slice(1).join(" "))} · Unit ${u+1}</h2><p>${esc(s.sub)}</p></div></section>
   <div class="tasks">${s.tasks.map(taskCard).join("")}</div>`;
  app.querySelectorAll("[data-task]").forEach(b=>b.onclick=()=>go({p:"act",g,u,s:v.s,t:b.dataset.task}));
}

function findTask(v){ const list = v.x ? extraTasks(v.g) : unitTasks(v.g,v.u); for (const s of list) for (const t of s.tasks) if (t.id===v.t) return Object.assign({sec:s.id},t); return null; }
function renderAct(v){
  const t=findTask(v); if(!t) return go({p:"home"});
  const back = v.x ? {p:"extra",g:v.g,s:t.sec} : {p:"sec",g:v.g,u:v.u,s:t.sec};
  const mid = v.x ? [["Əlavə materiallar",{p:"extra",g:v.g}]] : [["Unit "+(v.u+1),{p:"unit",g:v.g,u:v.u}]];
  app.innerHTML = crumbs([["",back],[grade(v.g).name,{p:"grade",g:v.g}],...mid,[t.name]]) + `<section class="act" id="act"></section>`;
  const el=$("#act"); el.dataset.title=t.name; t.run(el);
}

/* ===================== ENGINES ===================== */
function header(el, title, ins){ return `<div class="ahead"><h2>${esc(title)}</h2><span class="qcount" id="qc"></span><span class="score" id="sc">⭐ 0</span><p class="ins">${esc(ins||"")}</p></div><div class="prog"><i id="pg" style="width:0%"></i></div>`; }

/* ---- generic quiz with game skins ---- */
const SKINS = {
  wheel:{ mount(n){ this.pts=0; this.rot=0; const segs=[10,20,50,10,30,100,20,40], cols=["#FF7A2F","#FFC83D","#1FAE69","#2F7BFF","#9A4DF0","#F0418C","#16B5C7","#FF5D5D"];
      this.segs=segs; const grad=segs.map((_,i)=>`${cols[i]} ${i*45}deg ${(i+1)*45}deg`).join(",");
      return `<div class="scene sc-wheel"><div class="row" style="align-items:center;gap:22px"><div class="wheelwrap"><div class="wheel" id="wh" style="background:conic-gradient(${grad})"><span style="background:#22264B;border-radius:50%;width:44px;height:44px;display:grid;place-items:center">🎯</span></div></div><div><div class="pts" id="wpts">0 xal</div><div id="wval" style="font-weight:900">Çarx fırlanır…</div></div></div></div>`; },
    before(i){ const k=rnd(8); this.cur=this.segs[k]; this.rot += 720 + (360 - (k*45+22.5)) - (this.rot%360); const w=$("#wh"); if(w) w.style.transform=`rotate(${this.rot}deg)`; const v=$("#wval"); if(v) v.textContent=`Bu sual: ${this.cur} xal`; },
    after(ok){ if(ok){ this.pts+=this.cur; } const p=$("#wpts"); if(p) p.textContent=this.pts+" xal"; } },
  ship:{ mount(n){ this.n=Math.min(n,8); this.hit=0; this.hp=3; return `<div class="scene sc-sea"><div style="display:grid;gap:10px;justify-items:center"><div class="fleet" id="enemy">${Array(this.n).fill('<span>🚢</span>').join("")}</div><div style="font-size:26px" id="ball">　</div><div class="hp" id="hp">⛵ Sənin gəmin: ❤️❤️❤️</div></div></div>`; },
    after(ok){ if(ok){ const s=$("#enemy").children[this.hit % this.n]; if(s){ s.classList.add("sunk"); s.textContent="💥"; setTimeout(()=>{s.textContent="🚢";},500);} this.hit++; $("#ball").textContent="💣 Atəş!"; }
      else { this.hp=Math.max(0,this.hp-1); $("#ball").textContent="🌊 Qaçırdın!"; } $("#hp").textContent="⛵ Sənin gəmin: "+("❤️".repeat(this.hp)||"🩹"); } },
  crane:{ mount(){ this.b=0; return `<div class="scene sc-site"><div class="row" style="align-items:flex-end;gap:30px"><span class="crane" id="cr">🏗️</span><div class="tower" id="tw"></div><span style="font-size:40px">🚚</span></div></div>`; },
    after(ok){ const c=$("#cr"); c.style.transform= ok?"translateY(-10px) rotate(-8deg)":"rotate(6deg)"; setTimeout(()=>c.style.transform="",500); if(ok){ this.b++; $("#tw").insertAdjacentHTML("beforeend","<span>📦</span>"); } } },
  potion:{ mount(n){ this.n=n; this.c=0; this.st=["🐸","🐢","🦎","🐲","🦄"]; return `<div class="scene sc-lab"><div class="row" style="align-items:center;gap:24px"><div class="cauldron">🧪</div><div style="display:grid;gap:8px;justify-items:center"><div class="liquid"><i id="lq" style="width:0%"></i></div><span class="hp" id="lqt">İksir: 0%</span></div><div class="creature" id="cre">🐸</div></div></div>`; },
    after(ok){ if(ok) this.c++; const p=Math.round(this.c*100/this.n); $("#lq").style.width=p+"%"; $("#lqt").textContent="İksir: "+p+"%"; const s=this.st[Math.min(4,Math.floor(this.c/Math.max(1,this.n/4)))]; const e=$("#cre"); if(e.textContent!==s){ e.style.transform="scale(1.5) rotate(20deg)"; setTimeout(()=>{e.textContent=s;e.style.transform="";},300);} } },
  ocean:{ mount(n){ this.n=n; this.d=0; return `<div class="scene sc-deep" style="display:block"><div class="depth"><span class="diver" id="dv" style="top:0">🤿</span><span class="chest" id="ch">🧰</span><span class="hp" style="position:absolute;right:6px;top:4px" id="dm">0 m</span><span style="position:absolute;left:10%;top:40%;font-size:26px">🐠</span><span style="position:absolute;right:16%;top:62%;font-size:26px">🐙</span></div></div>`; },
    after(ok){ if(ok) this.d++; const top=Math.round(this.d/this.n*100); $("#dv").style.top=`calc(${top}% - ${top*0.4}px)`; $("#dm").textContent=(this.d*10)+" m"; if(this.d===this.n) $("#ch").textContent="💎"; } },
  alien:{ mount(){ this.f=0; return `<div class="scene sc-space"><div style="display:grid;gap:8px;justify-items:center"><span class="ufo" id="ufo">🛸</span><div class="fleet" id="al"></div><span class="hp">Hər düz cavab bir dost gətirir!</span></div></div>`; },
    after(ok){ const u=$("#ufo"); u.style.transform= ok?"translateY(-8px) scale(1.15)":"translateX(10px)"; setTimeout(()=>u.style.transform="",400); if(ok){ this.f++; $("#al").insertAdjacentHTML("beforeend","<span>👽</span>"); } } },
  bubble:{ mount(){ return `<div class="scene sc-sea" style="min-height:70px"><span class="hp" style="font-size:20px">🫧 Düzgün qabarcığı partlat! 🫧</span></div>`; }, after(){} }
};
function runQuiz(el, cfg){
  const qs = cfg.qs.filter(Boolean); const n=qs.length; let i=0, score=0;
  if(!n){ el.innerHTML = header(el,cfg.title,cfg.ins)+`<p>Bu unit üçün bu tapşırıq yoxdur.</p>`; return; }
  const skin = cfg.skin ? Object.create(SKINS[cfg.skin]) : null;
  el.innerHTML = header(el,cfg.title,cfg.ins) + (skin?skin.mount(n):"") + (cfg.timer?`<div class="timer"><i id="tmr"></i></div>`:"") + `<div class="stage" id="stg"></div><div class="feedback" id="fb"></div>`;
  const stg=$("#stg",el), fb=$("#fb",el); let lock=false, tmr=null;
  function upd(){ $("#qc",el).textContent=`${Math.min(i+1,n)}/${n}`; $("#sc",el).textContent="⭐ "+score; $("#pg",el).style.width=(i*100/n)+"%"; }
  function next(){ if(!el.isConnected) return; if(i>=n) return finish(); upd(); lock=false; fb.textContent=""; fb.className="feedback"; if(skin&&skin.before) skin.before(i); show(qs[i]);
    if(cfg.timer){ const bar=$("#tmr",el); bar.style.transition="none"; bar.style.width="100%"; void bar.offsetWidth; bar.style.transition=`width ${cfg.timer}s linear`; bar.style.width="0%"; clearTimeout(tmr);
      tmr=setTimeout(()=>{ if(lock) return; stg.querySelectorAll("button").forEach(b=>b.disabled=true); const q=qs[i]; const ok=q.opts&&q.opts.find(o=>o.ok); fb.textContent="⏰ Vaxt bitdi!"; answered(false, ok&&(ok.t||ok.w||"")); }, cfg.timer*1000); } }
  function answered(ok, correctText){ if(lock) return; lock=true; clearTimeout(tmr); if(cfg.timer){ const bar=$("#tmr",el); const w=getComputedStyle(bar).width; bar.style.transition="none"; bar.style.width=w; }
      if(ok){ score++; sfx.ok(); fb.textContent=["Əla! 🎉","Super! ⭐","Afərin! 👏","Düzdür! ✅"][rnd(4)]; fb.className="feedback ok"; if(n<=10||score%3===0) fireworks(1); }
      else { sfx.bad(); fb.innerHTML="Səhv 😕"+(correctText?` · Düzgün: <b>${esc(correctText)}</b>`:""); fb.className="feedback no"; }
      if(skin) skin.after(ok); $("#sc",el).textContent="⭐ "+score; i++; setTimeout(next, ok?1000:1700); }
  function finish(){ $("#pg",el).style.width="100%"; const pct=Math.round(score*100/n); result({key:cfg.key, title:cfg.title, g:cfg.g, u:cfg.u, score, n, pct, retry:()=>runQuiz(el,Object.assign({},cfg,{qs:cfg.regen?cfg.regen():shuffle(cfg.qs)}))}); }
  function show(q){
    if(q.k==="choice") return showChoice(q);
    if(q.k==="spell"||q.k==="missing") return showSpell(q);
    if(q.k==="type") return showType(q);
    if(q.k==="build") return showBuild(q);
    if(q.k==="findall") return showFindAll(q);
  }
  function showFindAll(q){
    stg.innerHTML = promptHTML(q) + `<div class="findgrid">${q.cells.map((c,j)=>`<button class="tile fcell" data-j="${j}">${esc(c)}</button>`).join("")}</div><div class="paz" id="fleft"></div>`;
    bindSay(q); let need=q.cells.filter(c=>c===q.target).length, got=0, miss=0;
    const left=()=>$("#fleft",el).textContent=`Qaldı: ${need-got}`; left();
    stg.querySelectorAll(".fcell").forEach(b=>b.onclick=()=>{ if(b.disabled) return; b.disabled=true;
      if(q.cells[+b.dataset.j]===q.target){ got++; b.classList.add("fok"); tone(880,.08,"sine",.07); speak(q.say||q.target); left(); if(got===need) answered(miss<=1); }
      else { miss++; b.classList.add("fno"); sfx.bad(); } });
  }
  function promptHTML(q){ const p=q.prompt||{}; return `<div class="prompt">${q.say?`<button class="say" id="sayb" aria-label="Dinlə">🔊</button>`:""}${p.p?pic(p.p,"bigpic"):""}${p.html||""}${p.text&&!(p.small&&q.say&&false)?`<div class="pq" style="${p.small?"font-size:18px;color:var(--muted)":""}">${esc(p.text)}</div>`:""}${p.az?`<div class="paz">${esc(p.az)}</div>`:""}</div>`; }
  function bindSay(q){ const b=$("#sayb",el); if(b){ b.onclick=()=>speak(q.say); setTimeout(()=>speak(q.say),250); } }
  function showChoice(q){
    const isPic = q.layout==="pic"||q.layout==="pic2"; const cls = isPic ? (q.opts.length===4?"p4":q.opts.length===3?"p3":"p2") : ("txt "+(q.layout.includes("two")?"two":""));
    stg.innerHTML = promptHTML(q) + `<div class="opts ${cls} ${cfg.skin==="bubble"?"bubbles":""}">${q.opts.map((o,j)=>`<button class="opt ${isPic?"pico":""}" data-j="${j}">${o.p?pic(o.p):""}${o.t?`<span>${esc(o.t)}</span>`:""}${o.sp?`<span class="spk" data-sp="${esc(o.t)}">🔊</span>`:""}</button>`).join("")}</div>`;
    bindSay(q);
    stg.querySelectorAll("[data-sp]").forEach(s=>s.onclick=e=>{ e.stopPropagation(); speak(s.dataset.sp); });
    stg.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{ const o=q.opts[+b.dataset.j]; stg.querySelectorAll(".opt").forEach(x=>x.disabled=true);
      const okIdx=q.opts.findIndex(x=>x.ok); const okBtn=stg.querySelector(`.opt[data-j="${okIdx}"]`);
      if(o.ok){ b.classList.add("ok"); if(cfg.skin==="bubble") b.classList.add("pop"); } else { b.classList.add("no"); okBtn&&okBtn.classList.add("ok"); }
      const ct = q.opts[okIdx]; if(q.sayAfter && q.full) speak(q.full(ct.t)); else if(o.w) speak(o.w); else if(q.layout!=="pic2" && ct.t && !pre(cfg.g)) speak(ct.t);
      answered(!!o.ok, o.ok?null:(ct.t||ct.w||"")); });
  }
  function showSpell(q){
    const w=q.word; const isMiss=q.k==="missing";
    let fixed = [...w].map(ch=> ch===" "||ch==="-" ? ch : null);
    if(isMiss){ const vow=[...w].map((c,j)=>/[aeiou]/.test(c)?j:-1).filter(j=>j>=0); const hide = vow.length>3? take(vow,3): vow; fixed=[...w].map((c,j)=> hide.includes(j)?null:c); }
    const need=[...w].map((c,j)=>fixed[j]==null?c:null).filter(Boolean);
    const extra = isMiss ? take("aeiou".split(""),2) : [];
    const pool = shuffle([...need, ...extra].map((c,j)=>({c,id:j})));
    let filled=[];
    stg.innerHTML = `<div class="prompt">${pic(q.p,"bigpic")}<div class="paz">${esc(q.az)}</div><button class="say sm" id="sp2">🔊</button></div><div class="slots" id="sl"></div><div class="tiles" id="tl"></div><div class="row"><button class="btn ghost" id="undo">↩ Sil</button></div>`;
    $("#sp2",el).onclick=()=>speak(w);
    const draw=()=>{ let f=0; $("#sl",el).innerHTML=[...w].map((c,j)=>{ if(fixed[j]!=null) return `<span class="slot" style="${c===" "?"border:0;min-width:16px":""}">${c===" "?"":esc(c)}</span>`; const v=filled[f++]; return `<span class="slot" style="color:var(--tone)">${v?esc(v.c):""}</span>`; }).join("");
      $("#tl",el).innerHTML=pool.map(t=>`<button class="tile" data-id="${t.id}" ${filled.includes(t)?"disabled":""}>${esc(t.c)}</button>`).join("");
      $("#tl",el).querySelectorAll(".tile").forEach(b=>b.onclick=()=>{ const t=pool.find(x=>x.id==b.dataset.id); filled.push(t); draw(); if(filled.length===need.length) check(); }); };
    const check=()=>{ const got=filled.map(t=>t.c).join(""); const ok=got===need.join(""); $("#tl",el).querySelectorAll(".tile").forEach(b=>b.disabled=true); speak(w); answered(ok, ok?null:w); };
    $("#undo",el).onclick=()=>{ filled.pop(); draw(); };
    draw();
  }
  function showType(q){
    stg.innerHTML = `<div class="prompt">${pic(q.p,"bigpic")}<div class="pq">${esc(q.az)}</div><div class="paz">İngiliscə yaz (${q.word.length} hərf)</div></div><input class="typein" id="ty" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="row"><button class="btn" id="tyok">Yoxla ✓</button><button class="btn ghost" id="hint">💡 İpucu</button></div>`;
    const inp=$("#ty",el); inp.focus();
    $("#hint",el).onclick=()=>{ inp.value=q.word.slice(0, Math.max(1, Math.ceil(q.word.length/3))); inp.focus(); };
    const go2=()=>{ const ok = inp.value.trim().toLowerCase().replace(/\s+/g," ")===q.word.toLowerCase(); inp.disabled=true; $("#tyok",el).disabled=true; speak(q.word); answered(ok, ok?null:q.word); };
    $("#tyok",el).onclick=go2; inp.onkeydown=e=>{ if(e.key==="Enter") go2(); };
  }
  function showBuild(q){
    const toks=q.tokens.map((t,j)=>({t,id:j})); const pool=shuffle(toks); let sel=[];
    stg.innerHTML = `<div class="prompt">${q.p?pic(q.p,"bigpic"):""}<div class="pq" style="font-size:19px">${esc(q.az)}</div></div><div class="slots" id="sl" style="gap:6px"></div><div class="tiles" id="tl"></div><div class="row"><button class="btn ghost" id="undo">↩ Sil</button></div>`;
    const draw=()=>{ $("#sl",el).innerHTML = sel.length? sel.map(s=>`<span class="tile wd" style="box-shadow:none">${esc(s.t)}</span>`).join("") : `<span class="paz">Sözlərə toxun…</span>`;
      $("#tl",el).innerHTML = pool.map(p=>`<button class="tile wd" data-id="${p.id}" ${sel.includes(p)?"disabled":""}>${esc(p.t)}</button>`).join("");
      $("#tl",el).querySelectorAll(".tile").forEach(b=>b.onclick=()=>{ sel.push(pool.find(x=>x.id==b.dataset.id)); draw(); if(sel.length===toks.length){ const ok=sel.map(s=>s.t).join(" ")===q.en; speak(q.en); $("#tl",el).querySelectorAll(".tile").forEach(x=>x.disabled=true); answered(ok, ok?null:q.en); } }); };
    $("#undo",el).onclick=()=>{ sel.pop(); draw(); }; draw();
  }
  next();
}

/* ---- result modal + saving + WhatsApp (My New Vocabulary formatı) ---- */
let LASTLOG=0;
function secLabel(r){ return `${r.g?grade(r.g).name:""}${r.u!=null?" · Unit "+(r.u+1):(VIEW.x?" · Əlavə":"")} · ${r.title}`; }
function result(r){
  if (r.key){ const prev=S.prog[r.key]; S.prog[r.key]=Math.max(prev||0, r.pct); const at=Date.now();
    S.log.push({sec:secLabel(r), g:`g${r.g}${r.u!=null?"u"+r.u:"x"}`, p:r.pct, r:r.score, n:r.n, at, sent:0}); if(S.log.length>120) S.log=S.log.slice(-120); LASTLOG=at; save(); }
  const medal = r.pct>=90?"🥇":r.pct>=70?"🥈":r.pct>=50?"🥉":"💪"; const stars = r.pct>=90?3:r.pct>=70?2:r.pct>=40?1:0;
  if (r.pct>=70){ sfx.win(); fireworks(4); }
  const m=document.createElement("div"); m.className="modal "+app.className;
  m.innerHTML = `<div class="mbox"><div class="medal">${medal}</div><h2>${r.pct>=90?"Möhtəşəm!":r.pct>=70?"Çox yaxşı!":r.pct>=50?"Yaxşı!":"Yenidən cəhd et!"}</h2>
   <div class="big-score">${r.score} / ${r.n} · ${r.pct}%</div><div class="stars">${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div>
   <p class="note" style="text-align:center">${esc(secLabel(r))}</p>
   ${hasPR()?`<div id="sendbox">${sendBox()}</div>`:`<p class="note" style="text-align:center">Nəticəni müəllimə göndərmək üçün ana səhifədə «Nəticəni müəllimə göndər» düyməsinə bas.</p>`}
   <div class="row"><button class="btn ghost" id="again">🔁 Yenidən</button><button class="btn" id="close">Davam et →</button></div></div>`;
  document.body.appendChild(m);
  $("#again",m).onclick=()=>{ m.remove(); r.retry&&r.retry(); };
  $("#close",m).onclick=()=>{ m.remove(); const t=findTask(VIEW); go(VIEW.x?{p:"extra",g:VIEW.g,s:t&&t.sec}:(VIEW.u!=null?{p:"sec",g:VIEW.g,u:VIEW.u,s:t?t.sec:"voc"}:{p:"home"})); };
}
const z2=x=>String(x).padStart(2,"0");
function waText(list){ const d=new Date(); return `📊 Results: ${z2(d.getDate())}.${z2(d.getMonth()+1)}.${d.getFullYear()}\n\n👤 ${PR.n} / ${PR.k}\n\n`+list.map((e,k)=>`${k+1}) ${e.sec} - ${e.p}%`).join("\n")+`\n\n— English 1–4 · Samir Balakishiyev`; }
const waHref=list=>"https://wa.me/994"+PR.t+"?text="+encodeURIComponent(waText(list));
function markSent(ats){ const now=Date.now(), A=new Set(ats); S.log.forEach(e=>{ if(!e.sent&&A.has(e.at)) e.sent=now; }); save(); setTimeout(()=>{ const b=document.getElementById("sendbox"); if(b) b.innerHTML=sendBox(); },400); }
function sendBox(){
  if(!hasPR()) return ""; const cur=S.log.find(e=>e.at===LASTLOG); if(!cur) return "";
  const list=S.log.filter(e=>!e.sent&&e.g===cur.g).slice(-20);
  if(!list.length) return `<p class="sendnote">✓ Nəticə müəllimə göndərildi.</p>`;
  return `<a class="btn wa sendbtn" href="${esc(waHref(list))}" target="_blank" rel="noopener" onclick="markSent([${list.map(e=>e.at).join(",")}])">${WAI}Nəticəni göndər${list.length>1?` (${list.length} task birlikdə)`:""}</a><p class="sendnote">İstəsən indi göndər, istəsən bu unitin növbəti tapşırıqlarını da işlə – sonra hamısı birlikdə gedəcək. Müəllim: ${fmtTel(PR.t)}</p>`;
}

/* ---- flashcards ---- */
function runFlash(el, ws, g, u, key){
  let i=0; const lk=`g${g}u${u}`; S.learned[lk]=S.learned[lk]||[];
  const order = ()=> ws.slice().sort((a,b)=> (S.learned[lk].includes(a.en)?1:0)-(S.learned[lk].includes(b.en)?1:0));
  let list=order();
  el.innerHTML = header(el,"Söz kartları","Karta toxun: arxasında tərcümə var. 🔊 ilə dinlə. Öyrəndiyin sözə «Öyrəndim ✓» bas.") + `<div class="stage"><div class="flash" id="fl"><div class="in"><div class="face"></div><div class="face bface"></div></div></div>
   <div class="row"><button class="btn ghost" id="pv">←</button><button class="say sm" id="fs">🔊</button><button class="btn" id="ln">Öyrəndim ✓</button><button class="btn ghost" id="nx">→</button></div><div class="feedback" id="lc"></div></div>`;
  const draw=()=>{ const w=list[i]; const L=S.learned[lk].includes(w.en);
    $("#fl",el).classList.remove("flip");
    $(".face",el).innerHTML=`${pic(w.p,"bigpic")}<div class="w">${esc(w.en)}</div>${L?'<div class="learned">✓ Öyrənilib</div>':""}`;
    $(".bface",el).innerHTML=`${pic(w.p,"bigpic")}<div class="az">${esc(w.az)}</div><div class="w" style="font-size:24px">${esc(w.en)}</div>`;
    $("#qc",el).textContent=`${i+1}/${list.length}`; $("#pg",el).style.width=((i+1)*100/list.length)+"%";
    const c=S.learned[lk].length; $("#sc",el).textContent=`✓ ${c}`; $("#lc",el).textContent = c===ws.length?"🎉 Bütün sözləri öyrəndin!":`${c} / ${ws.length} söz öyrənilib`;
    speak(w.en); };
  $("#fl",el).onclick=()=>{ $("#fl",el).classList.toggle("flip"); };
  $("#fs",el).onclick=()=>speak(list[i].en);
  $("#pv",el).onclick=()=>{ i=(i-1+list.length)%list.length; draw(); };
  $("#nx",el).onclick=()=>{ i=(i+1)%list.length; draw(); };
  $("#ln",el).onclick=()=>{ const w=list[i]; if(!S.learned[lk].includes(w.en)) S.learned[lk].push(w.en); sfx.ok();
     if(S.learned[lk].length===ws.length){ S.prog[key]=100; fireworks(3); } else S.prog[key]=Math.round(S.learned[lk].length*100/ws.length); save();
     list.push(list.splice(i,1)[0]); if(i>=list.length) i=0; draw(); };
  draw();
}
/* ---- word list ---- */
function runList(el, ws, un, key){
  el.innerHTML = header(el,"Lüğət: "+un.t,"Sözə toxun və dinlə. «Hamısını dinlə» bütün sözləri ardıcıl oxuyur.") + `<div class="stage"><div class="row"><button class="btn" id="all">▶ Hamısını dinlə</button><button class="btn ghost" id="stop">⏹ Dayan</button></div>
   <div class="wlist">${ws.map((w,j)=>`<button class="witem" data-j="${j}">${pic(w.p)}<div><b>${esc(w.en)}</b><small>${esc(w.az)}</small></div><span>🔊</span></button>`).join("")}</div>
   <h3 style="font-size:20px">Cümlələr</h3><div class="wlist">${un.s.map((s,j)=>`<button class="witem" data-s="${j}">${pic(s[2])}<div><b style="font-size:16px">${esc(s[0])}</b><small>${esc(s[1])}</small></div><span>🔊</span></button>`).join("")}</div></div>`;
  $("#qc",el).textContent=ws.length+" söz"; $("#sc",el).hidden=true; $("#pg",el).style.width="100%";
  el.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>speak(ws[+b.dataset.j].en));
  el.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>speak(un.s[+b.dataset.s][0]));
  let stop=false; $("#stop",el).onclick=()=>{ stop=true; stopSpeak(); };
  $("#all",el).onclick=()=>{ stop=false; let k=0; const items=[...el.querySelectorAll("[data-j]")]; const nx=()=>{ items.forEach(x=>x.style.outline=""); if(stop||k>=ws.length) { S.prog[key]=100; save(); return; } items[k].style.outline="3px solid var(--tone)"; speak(ws[k].en,{onend:()=>{k++; setTimeout(nx,350);}}); }; nx(); };
  if(S.prog[key]==null){ S.prog[key]=100; save(); }
}
/* ---- memory ---- */
function runMemory(el, ws, g, key){
  const base=take(dedupe(ws.filter(w=>w.p),w=>w.p),6); const P=pre(g);
  let cards=shuffle(base.flatMap((w,j)=>[{j,face:pic(w.p),w},{j,face:P?pic(w.p):`<span class="mw">${esc(w.en)}</span>`,w}]));
  let open=[], found=0, moves=0;
  el.innerHTML=header(el,"Memory Game",P?"Eyni şəkilləri tap":"Şəkli və onun sözünü tap")+`<div class="stage"><div class="mem" id="mm">${cards.map((c,k)=>`<button class="mcard" data-k="${k}">?</button>`).join("")}</div></div>`;
  $("#qc",el).textContent=`0/${base.length}`;
  el.querySelectorAll(".mcard").forEach(b=>b.onclick=()=>{ const c=cards[+b.dataset.k]; if(b.classList.contains("open")||b.classList.contains("gone")||open.length===2) return;
    b.classList.add("open"); b.innerHTML=c.face; speak(c.w.en); open.push([b,c]);
    if(open.length===2){ moves++; const [a,bb]=open; if(a[1].j===bb[1].j){ setTimeout(()=>{ a[0].className="mcard gone"; bb[0].className="mcard gone"; open=[]; found++; sfx.ok(); $("#qc",el).textContent=`${found}/${base.length}`; $("#sc",el).textContent="⭐ "+found; $("#pg",el).style.width=(found*100/base.length)+"%";
        if(found===base.length){ const pct=Math.max(40,Math.round(100-Math.max(0,moves-base.length)*6)); result({key,title:"Memory Game",g,u:VIEW.u,score:found,n:base.length,pct,retry:()=>runMemory(el,ws,g,key)}); } },400); }
      else setTimeout(()=>{ a[0].className="mcard"; a[0].textContent="?"; bb[0].className="mcard"; bb[0].textContent="?"; open=[]; },900); } });
}
/* ---- match ---- */
function runMatch(el, ws, g, key){
  const rounds=[take(dedupe(ws,w=>w.p),5)]; const rest=dedupe(ws.filter(w=>!rounds[0].includes(w)),w=>w.p); if(rest.length>=3) rounds.push(take(rest,Math.min(5,rest.length)));
  let r=0, mistakes=0, total=rounds.reduce((a,b)=>a+b.length,0), done=0;
  el.innerHTML=header(el,"Match","Soldan şəkli, sağdan uyğun sözü seç")+`<div class="stage" id="ms"></div>`;
  const draw=()=>{ const set=rounds[r]; const L=shuffle(set), R=shuffle(set); let sel=null;
    $("#ms",el).innerHTML=`<div class="match"><div class="col">${L.map(w=>`<button class="opt" data-l="${esc(w.en)}" style="font-size:44px">${pic(w.p)}</button>`).join("")}</div><div class="col">${R.map(w=>`<button class="opt" data-r="${esc(w.en)}">${esc(w.en)}${pre(g)?' <span class="spk">🔊</span>':""}</button>`).join("")}</div></div>`;
    el.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{ el.querySelectorAll("[data-l]").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); sel=b; speak(b.dataset.l); });
    el.querySelectorAll("[data-r]").forEach(b=>b.onclick=e=>{ if(e.target.classList.contains("spk")){ speak(b.dataset.r); return; } if(!sel){ speak(b.dataset.r); return; }
      if(sel.dataset.l===b.dataset.r){ sel.classList.add("gone"); b.classList.add("gone"); sel.classList.remove("sel"); sel=null; sfx.ok(); done++; $("#sc",el).textContent="⭐ "+done; $("#pg",el).style.width=(done*100/total)+"%";
        if(el.querySelectorAll("[data-r]:not(.gone)").length===0){ r++; if(r<rounds.length) setTimeout(draw,600); else { const pct=Math.max(0,Math.round((total-mistakes)*100/total)); result({key,title:"Match",g,u:VIEW.u,score:Math.max(0,total-mistakes),n:total,pct,retry:()=>runMatch(el,ws,g,key)}); } } }
      else { mistakes++; sfx.bad(); b.classList.add("no"); setTimeout(()=>b.classList.remove("no"),400); } }); };
  $("#qc",el).textContent=`${total} cüt`; draw();
}
/* ---- listen and number (order) ---- */
function runOrder(el, ws, key){
  const pool=dedupe(ws.filter(w=>w.p),w=>w.p); const R=4; let r=0, score=0;
  el.innerHTML=header(el,"Listen and number","Dinlə. Sözlər hansı ardıcıllıqla səsləndi? Şəkillərə o sıra ilə toxun.")+`<div class="stage" id="os"></div>`;
  const round=()=>{ const set=take(pool,4); const shown=shuffle(set); let picks=[];
    $("#qc",el).textContent=`${r+1}/${R}`; $("#pg",el).style.width=(r*100/R)+"%";
    $("#os",el).innerHTML=`<button class="say" id="pl">🔊</button><div class="ordergrid">${shown.map((w,j)=>`<button class="opt" data-j="${j}">${pic(w.p)}<span class="n" hidden></span></button>`).join("")}</div><div class="feedback" id="of"></div>`;
    const play=()=>{ let k=0; const nx=()=>{ if(k<set.length){ speak(set[k].en,{onend:()=>{k++; setTimeout(nx,500);}}); } }; nx(); };
    $("#pl",el).onclick=play; setTimeout(play,300);
    el.querySelectorAll(".ordergrid .opt").forEach(b=>b.onclick=()=>{ const w=shown[+b.dataset.j]; if(picks.includes(w)) return; picks.push(w); const n=b.querySelector(".n"); n.hidden=false; n.textContent=picks.length;
      if(picks.length===4){ const ok=picks.every((p,j)=>p===set[j]); if(ok){ score++; sfx.ok(); $("#of",el).textContent="Əla! Ardıcıllıq düzdür 🎉"; $("#of",el).className="feedback ok"; }
        else { sfx.bad(); $("#of",el).innerHTML="Səhv. Düzgün: "+set.map((s,j)=>`${j+1}. ${esc(s.en)}`).join(" · "); $("#of",el).className="feedback no"; }
        $("#sc",el).textContent="⭐ "+score; r++; setTimeout(()=>{ if(r<R) round(); else result({key,title:"Listen and number",g:VIEW.g,u:VIEW.u,score,n:R,pct:Math.round(score*100/R),retry:()=>runOrder(el,ws,key)}); }, ok?1200:2600); } }); };
  round();
}
/* ---- colour ---- */
const SHAPES = {
  balloon:c=>`<svg viewBox="0 0 100 100"><ellipse cx="50" cy="40" rx="26" ry="32" fill="${c}" stroke="#333" stroke-width="3"/><path d="M50 72q-6 12 2 26" stroke="#333" stroke-width="2" fill="none"/></svg>`,
  star:c=>`<svg viewBox="0 0 100 100"><polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="${c}" stroke="#333" stroke-width="3"/></svg>`,
  heart:c=>`<svg viewBox="0 0 100 100"><path d="M50 88S8 62 8 34a20 20 0 0 1 42-8 20 20 0 0 1 42 8c0 28-42 54-42 54z" fill="${c}" stroke="#333" stroke-width="3"/></svg>`,
  fish:c=>`<svg viewBox="0 0 100 100"><ellipse cx="44" cy="50" rx="32" ry="20" fill="${c}" stroke="#333" stroke-width="3"/><polygon points="74,50 96,32 96,68" fill="${c}" stroke="#333" stroke-width="3"/><circle cx="28" cy="46" r="4" fill="#333"/></svg>`,
  house:c=>`<svg viewBox="0 0 100 100"><polygon points="50,8 92,44 8,44" fill="${c}" stroke="#333" stroke-width="3"/><rect x="18" y="44" width="64" height="48" fill="${c}" stroke="#333" stroke-width="3"/><rect x="42" y="62" width="16" height="30" fill="#fff" stroke="#333" stroke-width="3"/></svg>`,
  shirt:c=>`<svg viewBox="0 0 100 100"><path d="M34 10l-26 16 10 18 12-6v52h40V38l12 6 10-18-26-16q-8 10-16 0z" fill="${c}" stroke="#333" stroke-width="3"/></svg>`
};
function colourWords(g,u){ let cs=words(g,u).filter(w=>w.p.startsWith("c:")); if(cs.length<4) cs=grade(1).units[3].w.map(W); return cs; }
function runColour(el,g,u,key){
  const cs=colourWords(g,u).filter(c=>c.en!=="white"||true); const shapes=Object.keys(SHAPES); const R=8; let r=0, score=0, chosen=null;
  el.innerHTML=header(el,"Colour","Dinlə: nəyi hansı rəngə boyamaq lazımdır? Rəngi seç, sonra şəklə toxun.")+`<div class="stage" id="cs"></div>`;
  const round=()=>{ const sh=shapes[rnd(shapes.length)], c=cs[rnd(cs.length)]; chosen=null; const ins=`Colour the ${sh} ${c.en}.`;
    $("#qc",el).textContent=`${r+1}/${R}`; $("#pg",el).style.width=(r*100/R)+"%";
    $("#cs",el).innerHTML=`<div class="prompt"><button class="say sm" id="cp2">🔊</button><div class="pq">${pre(g)?"🔊 Dinlə və rənglə":esc(ins)}</div><div class="paz">${pre(g)?"":esc(c.az)+" rəngə boya"}</div></div>
      <button class="canvasbox" id="cv" aria-label="Rənglə">${SHAPES[sh]("#FFFFFF")}</button>
      <div class="palette">${cs.map((x,j)=>`<button class="paint" data-j="${j}" style="background:${x.p.slice(2)}" aria-label="${esc(x.en)}"></button>`).join("")}</div><div class="feedback" id="cf"></div>`;
    $("#cp2",el).onclick=()=>speak(ins); setTimeout(()=>speak(ins),250);
    el.querySelectorAll(".paint").forEach(b=>b.onclick=()=>{ el.querySelectorAll(".paint").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); chosen=cs[+b.dataset.j]; speak(chosen.en); });
    $("#cv",el).onclick=()=>{ if(!chosen){ toast("Əvvəlcə rəngi seç 🎨"); return; } $("#cv",el).innerHTML=SHAPES[sh](chosen.p.slice(2)); $("#cv",el).onclick=null; const ok=chosen.en===c.en;
      if(ok){ score++; sfx.ok(); fireworks(1); $("#cf",el).textContent="Əla! 🎨"; $("#cf",el).className="feedback ok"; } else { sfx.bad(); $("#cf",el).innerHTML=`Səhv. Düzgün rəng: <b>${esc(c.en)}</b>`; $("#cf",el).className="feedback no"; }
      $("#sc",el).textContent="⭐ "+score; r++; setTimeout(()=>{ if(r<R) round(); else result({key,title:"Colour",g,u,score,n:R,pct:Math.round(score*100/R),retry:()=>runColour(el,g,u,key)}); },1400); }; };
  round();
}
function runCake(el,key){
  const cols=[["red","#E53935"],["blue","#1E88E5"],["green","#43A047"],["yellow","#FDD835"],["pink","#EC407A"],["purple","#8E24AA"]];
  const ord=["first","second","third","fourth","fifth","sixth"]; const plan=shuffle(cols).map((c,j)=>({layer:j,c})); const seq=shuffle(plan); let r=0, score=0, chosen=null; const fill=Array(6).fill("#FFFFFF");
  el.innerHTML=header(el,"Colour the cake","Tortun qatları aşağıdan yuxarı sayılır: first (1st) → sixth (6th). Rəngi seç, sonra qata toxun.")+`<div class="stage" id="ck"></div>`;
  const draw=()=>{ const q=seq[r]; const ins=`Colour the ${ord[q.layer]} layer ${q.c[0]}.`;
    $("#qc",el).textContent=`${r+1}/6`; $("#pg",el).style.width=(r*100/6)+"%";
    $("#ck",el).innerHTML=`<div class="prompt"><button class="say sm" id="sp3">🔊</button><div class="pq">${esc(ins)}</div></div>
     <svg viewBox="0 0 200 230" style="width:220px;max-width:100%">${[0,1,2,3,4,5].map(j=>{ const y=200-j*30, w=170-j*20, x=(200-w)/2; return `<g data-l="${j}" style="cursor:pointer"><rect x="${x}" y="${y-28}" width="${w}" height="28" rx="6" fill="${fill[j]}" stroke="#333" stroke-width="2.5"/><text x="${x-4}" y="${y-9}" font-size="12" text-anchor="end" fill="currentColor">${j+1}${["st","nd","rd","th","th","th"][j]}</text></g>`; }).join("")}<rect x="96" y="10" width="8" height="22" fill="#FFC83D"/><path d="M100 2q6 6 0 10q-6-4 0-10" fill="#FF7A2F"/></svg>
     <div class="palette">${cols.map((c,j)=>`<button class="paint" data-j="${j}" style="background:${c[1]}" aria-label="${c[0]}"></button>`).join("")}</div><div class="feedback" id="kf"></div>`;
    $("#sp3",el).onclick=()=>speak(ins); setTimeout(()=>speak(ins),250);
    el.querySelectorAll(".paint").forEach(b=>b.onclick=()=>{ el.querySelectorAll(".paint").forEach(x=>x.classList.remove("sel")); b.classList.add("sel"); chosen=cols[+b.dataset.j]; speak(chosen[0]); });
    el.querySelectorAll("[data-l]").forEach(gq=>gq.onclick=()=>{ if(!chosen){ toast("Əvvəlcə rəngi seç 🎨"); return; } const l=+gq.dataset.l; fill[l]=chosen[1]; const ok=l===q.layer&&chosen[0]===q.c[0];
      if(ok){ score++; sfx.ok(); } else { sfx.bad(); fill[l]= l===q.layer?q.c[1]:fill[l]; fill[q.layer]=q.c[1]; }
      r++; $("#sc",el).textContent="⭐ "+score; if(r<6) setTimeout(draw, ok?700:1500); else { draw2(); } }); };
  const draw2=()=>result({key,title:"Colour the cake",g:VIEW.g,u:VIEW.u,score,n:6,pct:Math.round(score*100/6),retry:()=>runCake(el,key)});
  draw();
}
/* ---- word search ---- */
function runSearch(el, ws, key){
  const N=10; const list=take(ws.map(w=>w.en.toUpperCase().replace(/[^A-Z]/g,"")).filter(w=>w.length>=3&&w.length<=N),6);
  const grid=Array.from({length:N},()=>Array(N).fill("")); const placed=[];
  list.forEach(w=>{ for(let t=0;t<200;t++){ const dir=rnd(2), r0=rnd(dir?N-w.length+1:N), c0=rnd(dir?N:N-w.length+1); let ok=true;
      for(let k=0;k<w.length;k++){ const r=r0+(dir?k:0), c=c0+(dir?0:k); if(grid[r][c] && grid[r][c]!==w[k]) { ok=false; break; } }
      if(ok){ for(let k=0;k<w.length;k++){ const r=r0+(dir?k:0), c=c0+(dir?0:k); grid[r][c]=w[k]; } placed.push({w,cells:[...Array(w.length)].map((_,k)=>[r0+(dir?k:0),c0+(dir?0:k)])}); break; } } });
  const AB="ABCDEFGHIJKLMNOPRSTUVWY"; grid.forEach(r=>r.forEach((c,j)=>{ if(!c) r[j]=AB[rnd(AB.length)]; }));
  let found=[], start=null;
  el.innerHTML=header(el,"Word search","Sözün birinci hərfinə, sonra sonuncu hərfinə toxun (soldan sağa və ya yuxarıdan aşağı).")+`<div class="stage"><div class="row" id="wl">${placed.map(p=>`<span class="tile wd" data-w="${p.w}" style="box-shadow:none">${p.w.toLowerCase()}</span>`).join("")}</div>
   <div style="overflow-x:auto;max-width:100%"><div id="gr" style="display:grid;grid-template-columns:repeat(${N},minmax(30px,40px));gap:4px">${grid.flatMap((r,i)=>r.map((c,j)=>`<button class="tile" style="min-width:0;height:40px;padding:0;font-size:18px;box-shadow:none" data-r="${i}" data-c="${j}">${c}</button>`)).join("")}</div></div><button class="btn ghost" id="giveup">Bitir</button></div>`;
  $("#qc",el).textContent=`0/${placed.length}`;
  const cell=(r,c)=>el.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  el.querySelectorAll("#gr .tile").forEach(b=>b.onclick=()=>{ const r=+b.dataset.r, c=+b.dataset.c;
    if(!start){ start=[r,c]; b.style.background="var(--sun)"; return; }
    const [r0,c0]=start; cell(r0,c0).style.background=""; start=null;
    const hit=placed.find(p=>!found.includes(p.w) && ((p.cells[0][0]===r0&&p.cells[0][1]===c0&&p.cells.at(-1)[0]===r&&p.cells.at(-1)[1]===c)||(p.cells[0][0]===r&&p.cells[0][1]===c&&p.cells.at(-1)[0]===r0&&p.cells.at(-1)[1]===c0)));
    if(hit){ found.push(hit.w); hit.cells.forEach(([a,bb])=>{ const x=cell(a,bb); x.style.background="var(--oks)"; x.style.borderColor="var(--ok)"; }); el.querySelector(`[data-w="${hit.w}"]`).style.textDecoration="line-through"; sfx.ok(); speak(hit.w.toLowerCase());
      $("#qc",el).textContent=`${found.length}/${placed.length}`; $("#sc",el).textContent="⭐ "+found.length; $("#pg",el).style.width=(found.length*100/placed.length)+"%";
      if(found.length===placed.length) fin(); } else sfx.bad(); });
  const fin=()=>result({key,title:"Word search",g:VIEW.g,u:VIEW.u,score:found.length,n:placed.length,pct:Math.round(found.length*100/placed.length),retry:()=>runSearch(el,ws,key)});
  $("#giveup",el).onclick=fin;
}
/* ---- grammar chant: listen → clap → echo, then a game ---- */
function runChant(el, un, g, key){
  const L = un.s.map(s=>({en:s[0], az:s[1], p:s[2]}));
  el.innerHTML=header(el,"Grammar Chant","▶ bas: hər cümlədən əvvəl əl çalırıq 👏👏, cümləni dinləyirik, sonra 🎤 sən təkrar edirsən. Sonda oyun var.")+`<div class="stage">
   <div class="chantstage" id="cst"><span class="cpic" id="cpic">🎵</span><div class="cline" id="cline">Hazırsan?</div><div class="cecho" id="cecho"></div></div>
   <div class="row"><button class="btn" id="cgo">▶ Chant</button><button class="btn ghost" id="cst2">⏹</button><button class="btn ghost" id="ctr">🇦🇿 Tərcümə</button></div>
   <div style="display:grid;gap:8px;width:100%;justify-items:center">${L.map((l,j)=>`<button class="storyline" data-j="${j}">${pic(l.p)}<div><b>${esc(l.en)}</b><small hidden>${esc(l.az)}</small></div><span>🔊</span></button>`).join("")}</div>
   <button class="btn" id="cq">🎮 Oyuna keç →</button></div>`;
  $("#qc",el).textContent=L.length+" cümlə"; $("#sc",el).hidden=true;
  const rows=[...el.querySelectorAll(".storyline")]; let tok=0;
  const show=(j,echo)=>{ rows.forEach(x=>x.classList.remove("on")); if(j<0) return; rows[j].classList.add("on"); $("#cpic",el).innerHTML=pic(L[j].p); $("#cpic",el).classList.remove("bounce"); void $("#cpic",el).offsetWidth; $("#cpic",el).classList.add("bounce"); $("#cline",el).textContent=L[j].en; $("#cecho",el).textContent=echo?"🎤 Sən de!":"👂 Dinlə…"; $("#pg",el).style.width=((j+1)*100/L.length)+"%"; };
  rows.forEach(b=>b.onclick=()=>{ tok++; const j=+b.dataset.j; show(j,false); speak(L[j].en,{rate:.8}); });
  $("#ctr",el).onclick=()=>el.querySelectorAll(".storyline small").forEach(s=>s.hidden=!s.hidden);
  $("#cst2",el).onclick=()=>{ tok++; stopSpeak(); show(-1); $("#cline",el).textContent="Dayandı"; $("#cecho",el).textContent=""; };
  $("#cgo",el).onclick=()=>{ const my=++tok; let j=0;
    const step=()=>{ if(my!==tok) return; if(j>=L.length){ $("#cline",el).textContent="Əla! 👏 İndi oyuna keç."; $("#cecho",el).textContent="🎉"; sfx.win(); S.prog[key]=S.prog[key]||50; save(); return; }
      tone(880,.08,"triangle",.09); setTimeout(()=>tone(880,.08,"triangle",.09),260);
      setTimeout(()=>{ if(my!==tok) return; show(j,false); speak(L[j].en,{rate:.78,onend:()=>{ if(my!==tok) return; show(j,true); setTimeout(()=>{ j++; step(); },2300); }}); },560); };
    step(); };
  $("#cq",el).onclick=()=>{ tok++; stopSpeak(); const qs = pre(g) ? shuffle([...G.sentence(un.s,g,6), ...G.chat(un.chat,g).slice(0,3)]) : shuffle([...G.sentence(un.s,g,5), ...G.build(un.s,3)]);
    runQuiz(el,{title:"Grammar Chant · oyun",ins:pre(g)?"Cümləni dinlə və uyğun şəkli seç":"Cümləni seç və ya sözlərdən qur",qs,key,g,u:VIEW.u}); };
}
/* ---- story (audio, line highlight) ---- */
function runStory(el, st, key, g){
  el.innerHTML=header(el,st.t,"▶ düyməsi ilə hekayəni dinlə. Sətrə toxunsan, yalnız o sətir oxunur. Sonra suallara keç.")+`<div class="stage">
   <div style="font-size:64px">${st.e||"📖"}</div><div class="row"><button class="btn" id="pa">▶ Hekayəni dinlə</button><button class="btn ghost" id="ps">⏹</button><button class="btn ghost" id="tr">🇦🇿 Tərcümə</button></div>
   <div style="display:grid;gap:8px;width:100%;justify-items:center">${st.lines.map((l,j)=>`<button class="storyline" data-j="${j}">${pic(l[2])}<div><b>${esc(l[0])}</b><small hidden>${esc(l[1])}</small></div><span>🔊</span></button>`).join("")}</div>
   <button class="btn" id="toq">Suallara keç →</button></div>`;
  $("#qc",el).textContent=st.lines.length+" sətir"; $("#sc",el).hidden=true;
  const rows=[...el.querySelectorAll(".storyline")]; let stop=false;
  rows.forEach(b=>b.onclick=()=>{ rows.forEach(x=>x.classList.remove("on")); b.classList.add("on"); speak(st.lines[+b.dataset.j][0],{rate:.8}); });
  $("#tr",el).onclick=()=>el.querySelectorAll(".storyline small").forEach(s=>s.hidden=!s.hidden);
  $("#ps",el).onclick=()=>{ stop=true; stopSpeak(); rows.forEach(x=>x.classList.remove("on")); };
  $("#pa",el).onclick=()=>{ stop=false; let k=0; const nx=()=>{ rows.forEach(x=>x.classList.remove("on")); if(stop||k>=rows.length) return; rows[k].classList.add("on"); $("#pg",el).style.width=((k+1)*100/rows.length)+"%"; rows[k].scrollIntoView({block:"nearest",behavior:"smooth"}); speak(st.lines[k][0],{rate:.8,onend:()=>{k++; setTimeout(nx,450);}}); }; nx(); };
  $("#toq",el).onclick=()=>{ stopSpeak(); const qs = st.qs ? G.readQs(st.qs) : G.storyPics(st.lines); runQuiz(el,{title:st.t+" · suallar",ins:"Hekayəyə görə cavab ver",qs,key,g,u:VIEW.u}); };
}
function runRead(el, rd, key, g){
  const sents = rd.text.match(/[^.!?]+[.!?]+/g)||[rd.text];
  el.innerHTML=header(el,rd.t,"Mətni oxu. ▶ ilə dinləyə bilərsən. Sonra suallara cavab ver.")+`<div class="stage"><div class="row"><button class="btn" id="pa">▶ Mətni dinlə</button><button class="btn ghost" id="ps">⏹</button></div>
   <div class="reading" id="rt">${sents.map((s,j)=>`<span data-j="${j}">${esc(s.trim())} </span>`).join("")}</div><button class="btn" id="toq">Suallara keç →</button></div>`;
  $("#qc",el).textContent=rd.qs.length+" sual"; $("#sc",el).hidden=true;
  const sp=[...el.querySelectorAll("#rt span")]; let stop=false;
  sp.forEach(s=>{ s.style.cursor="pointer"; s.onclick=()=>speak(sents[+s.dataset.j]); });
  $("#ps",el).onclick=()=>{ stop=true; stopSpeak(); sp.forEach(x=>x.style.background=""); };
  $("#pa",el).onclick=()=>{ stop=false; let k=0; const nx=()=>{ sp.forEach(x=>x.style.background=""); if(stop||k>=sp.length) return; sp[k].style.background="var(--sun)"; speak(sents[k],{rate:.82,onend:()=>{k++; setTimeout(nx,300);}}); }; nx(); };
  $("#toq",el).onclick=()=>{ stopSpeak(); runQuiz(el,{title:rd.t+" · suallar",ins:"Mətnə görə düzgün cavabı seç",qs:G.readQs(rd.qs),key,g,u:VIEW.u}); };
}
/* ---- grammar mini lesson ---- */
function runGrammar(el, gm, key, g){
  el.innerHTML=header(el,gm.t,gm.az)+`<div class="stage"><div class="reading" style="background:var(--tones)"><b>📌 Qayda:</b> ${esc(gm.rule)}</div>
   <div class="wlist">${gm.ex.map((x,j)=>`<button class="witem" data-j="${j}"><div><b style="font-size:17px">${esc(x[0])}</b><small>${esc(x[1])}</small></div><span>🔊</span></button>`).join("")}</div>
   <button class="btn" id="toq">✍️ Tez yoxla: ${gm.qs.length} sual →</button></div>`;
  $("#sc",el).hidden=true; $("#qc",el).textContent="";
  el.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>speak(gm.ex[+b.dataset.j][0]));
  $("#toq",el).onclick=()=>runQuiz(el,{title:gm.t+" · tez yoxla",ins:"Düzgün variantı seç",qs:G.grammarQs(gm.qs),key,g});
}
/* ---- alphabet ---- */
const ABC = [["A","apple","🍎"],["B","ball","⚽"],["C","cat","🐱"],["D","dog","🐶"],["E","egg","🥚"],["F","fish","🐟"],["G","goat","🐐"],["H","hat","👒"],["I","ice cream","🍦"],["J","juice","🧃"],["K","kite","🪁"],["L","lion","🦁"],["M","milk","🥛"],["N","nose","👃"],["O","orange","🍊"],["P","pen","🖊️"],["Q","queen","👸"],["R","rabbit","🐰"],["S","sun","☀️"],["T","tree","🌳"],["U","umbrella","☂️"],["V","van","🚐"],["W","window","🪟"],["X","fox","🦊"],["Y","yo-yo","🪀"],["Z","zebra","🦓"]];
function runABC(el,key){
  el.innerHTML=header(el,"ABC · Əlifba","Hərfə toxun: hərf və söz səslənir.")+`<div class="stage"><div class="wlist">${ABC.map((a,j)=>`<button class="witem" data-j="${j}"><span class="pic" style="font-size:40px;width:52px">${a[2]}</span><div><b style="font-size:28px;font-family:var(--display)">${a[0]} ${a[0].toLowerCase()}</b><small>${a[1]}</small></div><span>🔊</span></button>`).join("")}</div></div>`;
  $("#sc",el).hidden=true; $("#qc",el).textContent="26 hərf"; $("#pg",el).style.width="100%";
  el.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{ const a=ABC[+b.dataset.j]; speak(`${a[0]}. ${a[0]} is for ${a[1]}.`); });
  S.prog[key]=100; save();
}
function abcQs(n=10){ return take(ABC,n).map(a=>({k:"choice", say:a[1], prompt:{p:a[2], text:"🔊 Bu söz hansı hərflə başlayır?", small:true}, layout:"txt two", opts:shuffle([{t:a[0]+" "+a[0].toLowerCase(),ok:true}, ...take(ABC.filter(x=>x[0]!==a[0]),3).map(x=>({t:x[0]+" "+x[0].toLowerCase()}))])})); }

/* ---- teacher/class tools ---- */
function runNameWheel(el){
  let names=["Aysel","Murad","Leyla","Elvin","Nərmin","Kənan"]; try{ const s=localStorage.getItem(KEY+"_names"); if(s) names=JSON.parse(s); }catch(e){}
  el.innerHTML=header(el,"Ad çarxı","Şagirdlərin adlarını yaz (hər sətirdə bir ad) və çarxı fırlat.")+`<div class="stage tool"><textarea id="nm">${esc(names.join("\n"))}</textarea><div class="wheelwrap"><div class="wheel" id="nw" style="width:200px;height:200px"></div></div><div class="big-score" id="nr">?</div><button class="btn" id="spin">🎡 Fırlat</button></div>`;
  $("#sc",el).hidden=true; let rot=0;
  const paint=()=>{ const cols=["#FF7A2F","#FFC83D","#1FAE69","#2F7BFF","#9A4DF0","#F0418C"]; const n=Math.max(1,names.length); $("#nw",el).style.background=`conic-gradient(${names.map((_,i)=>`${cols[i%6]} ${i*360/n}deg ${(i+1)*360/n}deg`).join(",")||"#ccc 0 360deg"})`; };
  const read=()=>{ names=$("#nm",el).value.split("\n").map(s=>s.trim()).filter(Boolean); try{ localStorage.setItem(KEY+"_names",JSON.stringify(names)); }catch(e){} paint(); };
  $("#nm",el).oninput=read; paint();
  $("#spin",el).onclick=()=>{ read(); if(!names.length) return; const k=rnd(names.length), seg=360/names.length; rot+=1440+(360-(k*seg+seg/2))-(rot%360); $("#nw",el).style.transform=`rotate(${rot}deg)`; $("#nr",el).textContent="…"; setTimeout(()=>{ $("#nr",el).textContent=names[k]; sfx.win(); fireworks(1); speak(names[k]); },1650); };
}
function runDice(el){
  const F=["⚀","⚁","⚂","⚃","⚄","⚅"];
  el.innerHTML=header(el,"Zər","Zəri at. Çıxan rəqəmi ingiliscə de!")+`<div class="stage tool"><div class="row"><span class="dice" id="d1">⚀</span><span class="dice" id="d2">⚀</span></div><div class="big-score" id="dr">—</div><div class="row"><button class="btn" id="r1">🎲 Bir zər</button><button class="btn" id="r2">🎲🎲 İki zər</button></div></div>`;
  $("#sc",el).hidden=true;
  const roll=two=>{ let t=0; const iv=setInterval(()=>{ $("#d1",el).textContent=F[rnd(6)]; $("#d2",el).textContent=two?F[rnd(6)]:""; if(++t>10){ clearInterval(iv); const a=1+rnd(6), b=two?1+rnd(6):0; $("#d1",el).textContent=F[a-1]; $("#d2",el).textContent=two?F[b-1]:""; const s=a+b; $("#dr",el).textContent=`${s} · ${numWord(s)}`; speak(numWord(s)); } },70); };
  $("#r1",el).onclick=()=>roll(false); $("#r2",el).onclick=()=>roll(true);
}
function runGroups(el){
  el.innerHTML=header(el,"Qrup bölücü","Adları yaz, qrup sayını seç və böl.")+`<div class="stage tool"><textarea id="gn">Aysel\nMurad\nLeyla\nElvin\nNərmin\nKənan\nRəşad\nGünay</textarea><div class="row"><label class="toggle">Qrup sayı <input id="gk" type="number" min="2" max="10" value="2" style="width:70px;font:inherit;padding:6px;border-radius:10px;border:2px solid var(--line);background:var(--bg);color:var(--ink)"></label><button class="btn" id="mk">👥 Böl</button></div><div class="groups" id="go"></div></div>`;
  $("#sc",el).hidden=true;
  $("#mk",el).onclick=()=>{ const ns=shuffle($("#gn",el).value.split("\n").map(s=>s.trim()).filter(Boolean)); const k=Math.max(2,Math.min(10,+$("#gk",el).value||2)); const gs=Array.from({length:k},()=>[]); ns.forEach((n,i)=>gs[i%k].push(n));
    $("#go",el).innerHTML=gs.map((g,i)=>`<div><b>Qrup ${i+1}</b><br>${g.map(esc).join("<br>")}</div>`).join(""); };
}

/* ===================== EXTRA PAGE ===================== */
function extraTasks(g){
  const E=EXTRAS[g], ws=allWords(g), k=t=>`g${g}x-${t}`, P=pre(g); const T=(id,ic,name,sub,run)=>({id,ic,name,sub,run,key:k(id)});
  const quiz=(id,ic,name,sub,make,skin)=>T(id,ic,name,sub,el=>runQuiz(el,{title:name,ins:sub,qs:make(),skin,key:k(id),g}));
  const sec=[];
  sec.push({id:"st",h:"🎧 Səsli hekayələr",sub:"Dinlə, sətir işıqlanır, sonra suallar",tasks:E.stories.map((s,i)=>T("st"+i,s.e,s.t,`${s.lines.length} sətir · ${s.qs.length} sual`,el=>runStory(el,s,k("st"+i),g)))});
  sec.push({id:"tx",h:"📖 Qısa mətnlər",sub:"Oxu, dinlə və cavab ver",tasks:E.texts.map((t,i)=>T("tx"+i,"📄",t.t,`${t.qs.length} sual`,el=>runRead(el,t,k("tx"+i),g)))});
  sec.push({id:"gr",h:"📝 Qrammatika",sub:"Qayda, nümunələr və tez yoxlama",tasks:E.grammar.map((gm,i)=>T("gr"+i,"📐",gm.t,gm.az,el=>runGrammar(el,gm,k("gr"+i),g)))});
  const gw = P ? ()=>G.listenPic(ws,12) : ()=>shuffle([...G.wordPic(ws,4),...G.azEn(ws,4),...G.enAz(ws,4)]);
  sec.push({id:"big",h:"🎮 Böyük oyunlar",sub:"Bütün unitlərin sözləri ilə",tasks:[
    quiz("wheel","🎡","Wheel Spin","Çarxı fırlat, xal qazan",gw,"wheel"),
    quiz("ship","🚢","Ship Battle","Düşmən donanmasını batır",gw,"ship"),
    quiz("crane","🏗️","Crane Game","Qutuları qaldır",()=>G.listenPic(ws,10),"crane"),
    quiz("potion","🧪","Magic Potions","İksir bişir",()=>P?G.tf(ws,g,10):G.enAz(ws,10),"potion"),
    quiz("ocean","🤿","Ocean Quest","Xəzinəni tap",()=>P?G.listenPic(ws,10):G.wordPic(ws,10),"ocean"),
    quiz("bubble","🫧","Bubble Pop","Qabarcıqları partlat",()=>G.listenPic(ws,10),"bubble"),
    quiz("alien","👽",P?"Alien Friends":"Alien Spelling",P?"Dinlə və tap":"Sözü yaz",()=>P?G.listenPic(ws,10):G.spell(ws,8),"alien"),
    T("memory","🧠","Memory Game","Cütləri tap",el=>runMemory(el,ws,g,k("memory"))),
    ...(P?[]:[T("search","🔎","Word search","Sözləri tap",el=>runSearch(el,ws,k("search")))])]});
  sec.splice(1,0,{id:"lib",h:"📚 Kitabxana",sub:"Bütün unitlərin şəkilli kitabları",tasks:grade(g).units.map((un,u)=>{ const b=BOOKPAT[g][u]; return T("bk"+u,un.e,b.t,"Unit "+(u+1)+" · oxu, dinlə, oyna",el=>runBook(el,makeBook(g,u),k("bk"+u),g)); })});
  if (g<=2) sec.push({id:"phon",h:"🔤 Fonika yolu",sub:"A–Z hərf səsləri və CVC sözləri",tasks:[...Object.keys(PH).map(L=>T("ph"+L,L.toUpperCase()+L,"Hərf "+L.toUpperCase()+" "+L,PH[L].map(x=>x[0]).join(", "),el=>runLetter(el,L,k("ph"+L),g))), ...CVC.map((c,ci)=>T("cvc"+ci,"🔗","Blend: "+c.t,c.w.map(x=>x[0]).join(", "),el=>runCVC(el,c,k("cvc"+ci),g)))]});
  if (g<=2) sec.push({id:"abc",h:"🔤 Əlifba",sub:"Hərflər və səslər",tasks:[T("abc","🔤","ABC kartları","26 hərf, söz və səs",el=>runABC(el,k("abc"))), quiz("abcq","🅰️","İlk hərfi tap","Sözü dinlə, hərfi seç",()=>abcQs(10))]});
  sec.push({id:"bigtest",h:"🧠 Ümumi test",sub:"Bütün sinif üzrə 25 sual",tasks:[quiz("bigtest","🏅","Böyük test","25 sual · bütün unitlər",()=>mixTest(g,null,25))]});
  sec.push({id:"tools",h:"🧰 Sinif alətləri",sub:"Müəllim üçün: dərsdə istifadə et",tasks:[T("namewheel","🎡","Ad çarxı","Təsadüfi şagird seç",el=>runNameWheel(el)),T("dice","🎲","Zər","Rəqəmləri ingiliscə de",el=>runDice(el)),T("groups","👥","Qrup bölücü","Sinfi qruplara böl",el=>runGroups(el))]});
  return sec;
}
function gradeVideos(g){ const seen=new Set(), out=[]; UNIT_TOPICS[g].forEach(ts=>ts.forEach(t=>{ if(!seen.has(t)){ seen.add(t); out.push([t,VIDS[t]||[]]); } }));
  ["abc","stories"].forEach(t=>{ if(!seen.has(t)) out.push([t,VIDS[t]]); }); return out; }
function renderExtra(g){
  const gr=grade(g), secs=extraTasks(g), v=VIEW;
  const base=[["",{p:"grade",g}],[gr.name,{p:"grade",g}]];
  if (v.s==="vid"){ const groups=gradeVideos(g);
    app.innerHTML = crumbs([["",{p:"extra",g}],[gr.name,{p:"grade",g}],["Əlavə materiallar",{p:"extra",g}],["🎬 Videolar"]]) + `<section class="uhead" style="background:#FFE3E1"><span class="ue">🎬</span><div><h2>Videolar · ${gr.name}</h2><p>${groups.reduce((a,[,l])=>a+l.length,0)} video · bütün unitlərin mövzuları, əlifba və cizgi hekayələr</p></div></section>${videoGroups(groups)}`; return; }
  const s = v.s && secs.find(x=>x.id===v.s);
  if (s){ app.innerHTML = crumbs([["",{p:"extra",g}],[gr.name,{p:"grade",g}],["Əlavə materiallar",{p:"extra",g}],[s.h]]) + `<section class="uhead" style="background:color-mix(in srgb, ${SEC_COL[s.id]} 16%, var(--paper))"><span class="ue">${s.h.split(" ")[0]}</span><div><h2>${esc(s.h.split(" ").slice(1).join(" "))}</h2><p>${esc(s.sub)}</p></div></section><div class="tasks">${s.tasks.map(taskCard).join("")}</div>`;
    app.querySelectorAll("[data-task]").forEach(b=>b.onclick=()=>go({p:"act",g,x:1,t:b.dataset.task})); return; }
  const nv=gradeVideos(g).reduce((a,[,l])=>a+l.length,0);
  const tiles=secs.map(x=>secTile(x, x.tasks.length, x.tasks.filter(t=>S.prog[t.key]!=null).length, {p:"extra",g,s:x.id}));
  tiles.splice(3,0, secTile({id:"vid",h:"🎬 Videolar",sub:`${nv} video · mahnılar, fonika, cizgi hekayələr`}, null, 0, {p:"extra",g,s:"vid"}));
  app.innerHTML = crumbs([...base,["Əlavə materiallar"]]) + `
  <section class="uhead" style="background:var(--exs)"><span class="ue">⭐</span><div><h2>Əlavə oyunlar və materiallar</h2><p>${gr.name} · bölməni seç</p></div></section>
  <section class="stiles">${tiles.join("")}</section>
  <section class="sect"><h3>📥 Müəllimin materialları <small>Yeni qrammatika tapşırıqları buraya əlavə olunacaq</small></h3></section>`;
}

/* ===================== QEYDİYYAT · BLOK · NƏTİCƏ PROFİLİ · MÜƏLLİM PANELİ ===================== */
const WAI='<svg viewBox="0 0 24 24" aria-hidden="true" class="wai"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg>';
const PFX=['10','50','51','55','60','70','77','99'];
function normTel(v){let d=String(v).replace(/\D/g,'');if(d.length>9&&d.startsWith('994'))d=d.slice(3);if(d.length===10&&d.startsWith('0'))d=d.slice(1);return d}
const telOK=d=>/^\d{9}$/.test(d)&&PFX.includes(d.slice(0,2));
const fmtTel=d=>`+994 ${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,7)} ${d.slice(7)}`;
const devName=()=>{const u=navigator.userAgent||'';return /iPhone|iPad|iPod/.test(u)?'iPhone/iPad':/Android/.test(u)?'Android':'Kompüter'};
let REG=lsGet('hc14-reg',null);

/* ---------- sync (Google Cədvəl) ---------- */
function regFields(){const r=REG||{};return {ad:r.ad,soyad:r.soyad,tel:r.tel,rol:r.rol,qeyd:r.at,sayt:SITE}}
function qPush(o){const q=lsGet('hc14-q',[]);q.push(o);lsSet('hc14-q',q.slice(-200))}
let FLUSHING=false;
async function qFlush(){
  if(!SHEET_URL||FLUSHING)return;FLUSHING=true;
  try{let q=lsGet('hc14-q',[]);
    while(q.length){const o=q[0];
      const r=await fetch(SHEET_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(o)});
      if(!r.ok)break;q=lsGet('hc14-q',[]);q.shift();lsSet('hc14-q',q);
      if(o.a==='ping'){let j=null;try{j=await r.json()}catch(e){}blokSet(j&&j.blok)}}
  }catch(e){}FLUSHING=false;
}
function syncPing(){if(!REG)return;qPush({a:'ping',...regFields()});qFlush()}
let LASTPING=0;function pingSoon(){if(!REG||Date.now()-LASTPING<60000)return;LASTPING=Date.now();syncPing()}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pingSoon()});
window.addEventListener('focus',pingSoon);window.addEventListener('pageshow',e=>{if(e.persisted)pingSoon()});
setInterval(()=>{if(document.visibilityState==='visible')pingSoon()},120000);

/* ---------- bloklanmış hesab ---------- */
function blokSet(v){
  if(v===true){if(!lsGet('hc14-blok',0))lsSet('hc14-blok',1);blockScreen()}
  else if(v===false&&lsGet('hc14-blok',0)){lsSet('hc14-blok',0);location.reload()}
}
function blockScreen(){
  document.body.className=app.className="";
  app.innerHTML=`<section class="regbox" style="border-color:var(--bad);text-align:center"><div style="font-size:54px;line-height:1">🚫</div><h2 style="color:var(--bad);font-size:clamp(24px,7vw,32px)">Hesabınız bloklanıb</h2><p style="font-size:19px;margin:0">Ətraflı məlumat üçün Samir müəllimlə əlaqə saxlayın.</p><a class="btn wa sendbtn" href="https://wa.me/994${SAMIR_TEL}" target="_blank" rel="noopener">${WAI}WhatsApp-da yaz</a><p class="note" style="font-size:15px">📞 Samir Balakişiyev · <b style="user-select:all">055 795 86 25</b></p></section>`;
  const lb=document.querySelector('.lockbtn');if(lb)lb.style.display='none';window.scrollTo(0,0);
}

/* ---------- qeydiyyat (bir dəfə) ---------- */
let RG={err:'',rol:''};
function regScreen(){
  document.body.className=app.className="";
  const r=RG; const f=(id,lab,ph)=>`<label>${lab}<input id="${id}" placeholder="${ph}" autocomplete="off" value="${esc(r[id]||'')}"></label>`;
  const rb=(v,lab)=>`<button type="button" class="rolebtn${r.rol===v?' on':''}" data-rol="${v}">${lab}</button>`;
  app.innerHTML=`<section class="regbox"><h2>Qeydiyyat 👋</h2><p class="note" style="font-size:15px">Başlamaq üçün bir dəfə qeydiyyatdan keçin. Bu məlumatlar bir daha soruşulmayacaq.</p><div class="pf">
   ${f('rg_ad','Ad','Məs: Ruslan')}${f('rg_soyad','Soyad','Məs: Əlizadə')}
   <label>Siz kimsiniz?</label><div class="row" style="justify-content:stretch">${rb('Tələbə','🎓 Şagird')}${rb('Müəllim','👩‍🏫 Müəllim')}</div>
   <label>Telefon nömrəsi<div class="tel"><span>+994</span><input id="rg_tel" inputmode="numeric" maxlength="12" placeholder="55 123 45 67" value="${esc(r.rg_tel||'')}"></div></label>
   <p class="perr">${esc(r.err||'')}</p><button class="btn sendbtn" id="rgok" type="button">Qeydiyyatdan keç və başla →</button></div></section>`;
  app.querySelectorAll('.rolebtn').forEach(b=>b.onclick=()=>{regRead();RG.rol=b.dataset.rol;RG.err='';regScreen()});
  $('#rg_tel').oninput=e=>regTel(e.target); $('#rgok').onclick=regSubmit;
}
function regTel(el){let d=el.value.replace(/\D/g,'');if(d.startsWith('994'))d=d.slice(3);if(d.startsWith('0'))d=d.slice(1);d=d.slice(0,9);el.value=[d.slice(0,2),d.slice(2,5),d.slice(5,7),d.slice(7,9)].filter(Boolean).join(' ')}
function regRead(){['rg_ad','rg_soyad','rg_tel'].forEach(k=>{const e=document.getElementById(k);if(e)RG[k]=e.value})}
function regSubmit(){
  regRead();const cl=v=>String(v||'').trim().replace(/\s+/g,' ');
  const ad=cl(RG.rg_ad),soyad=cl(RG.rg_soyad),tel=normTel(RG.rg_tel||'');
  let err='';
  if(!ad)err='Adınızı yazın.';else if(!soyad)err='Soyadınızı yazın.';
  else if(!RG.rol)err='Şagird və ya Müəllim düyməsini seçin.';
  else if(!telOK(tel))err='Telefon nömrəsi düzgün deyil. Nümunə: 55 123 45 67';
  if(err){RG.err=err;regScreen();return}
  REG={ad,soyad,tel,rol:RG.rol,at:Date.now()};lsSet('hc14-reg',REG);
  if(!PR.n){PR.n=ad+' '+soyad;psave()}
  VIEW={p:'home'};render();syncPing();
}

/* ---------- nəticəni müəllimə göndər (profil) ---------- */
let PR={n:'',k:'',t:''},PEDITING=false,PERR='',PFORM=false,PCONF=false;
{const o=lsGet('hc14-prof',null);if(o)PR={n:o.n||'',k:o.k||'',t:o.t||''}}
function psave(){lsSet('hc14-prof',PR)}
const hasPR=()=>!!(PR.n&&PR.k&&telOK(PR.t));
function profHTML(){
  if(hasPR()&&!PEDITING){return `<section class="prof"><h3>${WAI}Nəticələr müəllimə göndəriləcək</h3><div class="psum"><span>Şagird: <b>${esc(PR.n)}</b></span><span>Sinif: <b>${esc(PR.k)}</b></span><span>Müəllimin nömrəsi: <b>${fmtTel(PR.t)}</b></span></div>${PCONF?'<p class="perr">Ad, sinif və nömrə silinsin? Bundan sonra nəticə göndərilməyəcək.</p><div class="row" style="justify-content:flex-start"><button class="btn" style="background:var(--bad)" onclick="pdelYes()">Bəli, sil</button><button class="btn ghost" onclick="pdelNo()">Xeyr</button></div>':'<div class="row" style="justify-content:flex-start"><button class="btn ghost" onclick="pedit()">Dəyiş</button><button class="btn ghost" style="color:var(--bad)" onclick="pdel()">Sil</button></div>'}</section>`;}
  if(!hasPR()&&!PFORM)return `<div><button class="btn wa sendbtn" onclick="PFORM=true;PERR='';render()">${WAI}Nəticəni müəllimə göndər</button></div>`;
  return `<section class="prof"><h3>${WAI}Nəticəni müəllimə göndər</h3><p class="note" style="font-size:14px">Nəticənizi müəllimə göndərmək istəyirsinizsə, aşağıdakı xanaları doldurun. İstəmirsinizsə, boş saxlayın və tapşırıqlara davam edin.</p><div class="pf"><label>Şagirdin adı və soyadı<input id="pn" autocomplete="name" placeholder="Məs: Əli Məmmədov" value="${esc(PR.n)}"></label><label>Sinif<input id="pk" placeholder="Məs: 3-A" value="${esc(PR.k)}"></label><label><span style="color:var(--bad);font-weight:900;font-size:15px">⚠️ Öz müəlliminin WhatsApp nömrəsi</span><div class="tel" id="ptw"><span>+994</span><input id="pt" type="tel" inputmode="numeric" autocomplete="off" placeholder="55 123 45 67" value="${esc(PR.t)}" oninput="ptype(this)"></div></label><p class="perr" id="perr">${esc(PERR)}</p><div class="row" style="justify-content:flex-start"><button class="btn" onclick="psubmit()">Yadda saxla</button><button class="btn ghost" onclick="pcancel()">${hasPR()?'Ləğv et':'Bağla'}</button></div></div></section>`;
}
function ptype(el){let d=el.value.replace(/\D/g,'');if(d.length>9&&d.startsWith('994'))d=d.slice(3);if(d.length>9&&d.startsWith('0'))d=d.slice(1);if(d.length>9)d=d.slice(0,9);el.value=d;document.getElementById('ptw').classList.remove('bad');document.getElementById('perr').textContent=''}
function psubmit(){
  const pn=$('#pn'),pk=$('#pk'),pt=$('#pt'),pe=$('#perr'),tw=$('#ptw');
  const n=pn.value.trim().replace(/\s+/g,' '),k=pk.value.trim(),t=normTel(pt.value);
  [pn,pk].forEach(x=>x.classList.remove('bad'));tw.classList.remove('bad');
  let err='';
  if(!n||n.split(' ').length<2){pn.classList.add('bad');err='Adınızı və soyadınızı yazın.'}
  else if(!k){pk.classList.add('bad');err='Sinfinizi yazın.'}
  else if(!telOK(t)){tw.classList.add('bad');err=t.length!==9?'Nömrə düzgün deyil: +994-dən sonra 9 rəqəm yazın (məs: 55 123 45 67).':'Nömrə düzgün deyil: 10, 50, 51, 55, 60, 70, 77 və ya 99 ilə başlamalıdır.'}
  if(err){pe.textContent=err;return}
  PR={n,k,t};PERR='';PEDITING=false;PFORM=false;psave();render();
}
function pedit(){PEDITING=true;PERR='';render()}
function pcancel(){PEDITING=false;PFORM=false;PERR='';render()}
function pdel(){PCONF=true;render()}
function pdelNo(){PCONF=false;render()}
function pdelYes(){PR={n:'',k:'',t:''};PEDITING=false;PFORM=false;PCONF=false;psave();render()}

/* ---------- müəllim paneli ---------- */
const LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4V7zm2 10a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2z"/></svg>';
let TEA=false,TMSG='';
(function(){const b=document.createElement('button');b.className='lockbtn';b.setAttribute('aria-label','Müəllim paneli');b.innerHTML=LOCK;b.onclick=()=>{stopSpeak();VIEW={p:'teacher'};teacher()};document.body.appendChild(b)})();
function thdr(title,sub,back){return `<nav class="crumbs"><button class="homeb" data-go='{"p":"home"}'>🏠 Ana menyu</button>${back?`<button class="back" onclick="${back}">← Geri</button>`:''}</nav><section class="uhead" style="background:var(--g3s)"><span class="ue">👩‍🏫</span><div><h2>${esc(title)}</h2>${sub?`<p>${esc(sub)}</p>`:''}</div></section>`}
function teacher(){
  document.body.className=app.className="t-g3";
  if(TEA)return tHome();
  app.innerHTML=thdr('Müəllim paneli','Kodu daxil edin','')+`<form class="tlogin" onsubmit="event.preventDefault();tLogin()"><input id="tcode" type="password" inputmode="numeric" autocomplete="off" placeholder="Kod" aria-label="Kod"><button class="btn" type="submit">Daxil ol</button><p class="perr" id="terr"></p></form>`;
  const i=$('#tcode');if(i)i.focus();window.scrollTo(0,0);
}
function tLogin(){const v=($('#tcode')||{}).value;if(v===TCODE){TEA=true;tHome()}else{const e=$('#terr');if(e)e.textContent='Kod səhvdir.';sfx.bad()}}
function tHome(){
  app.innerHTML=thdr('Müəllim paneli','Bölməni seçin','')+(TMSG?`<p class="tmsg">${esc(TMSG)}</p>`:'')+`<div class="tasks">
   <button class="task done" onclick="TU.q='';tUsers()"><span class="ti">👥</span><span class="tt"><b>İstifadəçilər</b><small>Qeydiyyatdan keçənlər · zəng, WhatsApp, blok</small></span></button>
   <button class="task done" onclick="tKey()"><span class="ti">🔑</span><span class="tt"><b>Cədvəl açarı</b><small>${lsGet('hc14-tkey','')?'Daxil edilib ✓':'Daxil edilməyib'}</small></span></button></div>
   <p class="note" style="font-size:14px">${SHEET_URL?'Google Cədvəl qoşulub ✓':'Google Cədvəl hələ qoşulmayıb: istifadəçilər, blok və nəticələr cədvəl qoşulandan sonra görünəcək.'}</p>`;
  window.scrollTo(0,0);
}
let TU={list:null,res:null,q:'',f:'',err:'',ask:'',msg:''};
function tKey(){
  app.innerHTML=thdr('Cədvəl açarı','Bir dəfə daxil edin','tHome()')+`<form class="tlogin" onsubmit="event.preventDefault();lsSet('hc14-tkey',$('#tk').value.trim());TU={list:null,res:null,q:'',f:'',err:'',ask:'',msg:''};TMSG='Açar yadda saxlandı.';tHome()"><input id="tk" type="password" autocomplete="off" placeholder="Açar" value="${esc(lsGet('hc14-tkey',''))}"><button class="btn" type="submit">Yadda saxla</button></form><p class="note" style="font-size:14px">Açar Google Cədvəlin skriptindədir (KEY). Şagirdlərə verməyin.</p>`;
  window.scrollTo(0,0);
}
async function tFetch(kind){
  const key=lsGet('hc14-tkey','');TU.err='';
  if(!SHEET_URL){TU.err='Google Cədvəl hələ qoşulmayıb.';return}
  if(!key){TU.err='Əvvəlcə "Cədvəl açarı"nı daxil edin.';return}
  try{const r=await fetch(SHEET_URL+'?a='+kind+'&key='+encodeURIComponent(key)+'&_='+Date.now());const o=await r.json();
    if(o.error)TU.err=o.error==='key'?'Cədvəl açarı səhvdir.':'Xəta: '+o.error;else TU[kind==='users'?'list':'res']=o.rows||[];
  }catch(e){TU.err='Məlumatı yükləmək alınmadı. İnterneti yoxlayın.'}
}
const dOnly=t=>{if(!t)return '';const d=new Date(+t||t);return isNaN(d)?String(t):`${z2(d.getDate())}.${z2(d.getMonth()+1)}.${d.getFullYear()} ${z2(d.getHours())}:${z2(d.getMinutes())}`};
function tSearch(fn){return `<input class="tsearch" placeholder="Axtar: ad, soyad, telefon…" value="${esc(TU.q)}" oninput="TU.q=this.value;clearTimeout(window._tq);window._tq=setTimeout(()=>{${fn}();const i=document.querySelector('.tsearch');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)">`}
async function tUsers(reload){
  if(!TU.list||reload){app.innerHTML=thdr('İstifadəçilər','Yüklənir…','tHome()');await tFetch('users')}
  const L=TU.list||[],now=Date.now(),day=864e5,q=TU.q.toLowerCase();
  const bl=L.filter(u=>u.blok).length,td=L.filter(u=>now-(+u.son||0)<day).length,wk=L.filter(u=>now-(+u.son||0)<7*day).length;
  const roles=[...new Set(L.map(u=>u.rol).filter(Boolean))];
  let h=thdr('İstifadəçilər',L.length+' nəfər','tHome()');
  if(TU.err)h+=`<p class="perr">${esc(TU.err)}</p>`;
  h+=`<div class="statrow">${[['Cəmi',L.length],...roles.map(r=>[r,L.filter(u=>u.rol===r).length]),['Bu gün',td],['Bu həftə',wk],['Bloklanıb',bl],['Əlaqə saxlanılıb',L.filter(u=>u.elaqe).length]].map(([a,b])=>`<div><small>${esc(a)}</small><b>${b}</b></div>`).join('')}</div>`;
  h+=`<div class="row" style="justify-content:flex-start"><button class="btn" onclick="tUsers(true)">↻ Yenilə</button>${['',...roles,'Blok','Elaqesiz'].map(f=>`<button class="btn ${TU.f===f?'':'ghost'}" onclick="TU.f='${f}';tUsers()">${f==='Blok'?'🚫 Bloklananlar':f==='Elaqesiz'?'📞 Əlaqə saxlanılmayanlar':f||'Hamısı'}</button>`).join('')}</div>`;
  if(TU.msg)h+=`<p class="tmsg">${esc(TU.msg)}</p>`;
  h+=tSearch('tUsers');
  const rows=L.filter(u=>(!TU.f||(TU.f==='Blok'?u.blok:TU.f==='Elaqesiz'?!u.elaqe:u.rol===TU.f))&&(!q||[u.ad,u.soyad,u.tel].join(' ').toLowerCase().includes(q))).sort((a,b)=>(+b.son||0)-(+a.son||0));
  h+=`<div class="tlist">`+rows.map(u=>`<div class="titem${u.blok?' blk':''}"><span><b${u.elaqe?' style="color:#1E8E4E"':''}>${u.elaqe?'✓ ':''}${esc(u.ad)} ${esc(u.soyad)}</b> <em class="tag">${esc(u.rol||'')}</em>${u.blok?' <em class="tag red">🚫 Bloklanıb</em>':''}${u.elaqe?` <em class="tag" style="background:#1E8E4E;color:#fff;border-color:#1E8E4E">✓ Əlaqə saxlanılıb · ${dOnly(u.elaqe)}</em>`:''}${u.sayt?` <em class="tag">${esc(u.sayt)}</em>`:''}<br><small>+994 ${esc(u.tel)}</small><br><small>Qeydiyyat: ${dOnly(u.qeyd)} · Son giriş: ${dOnly(u.son)}</small></span><a class="tbtn" href="tel:+994${esc(u.tel)}">📞</a><a class="tbtn ok" href="https://wa.me/994${esc(u.tel)}" target="_blank" rel="noopener">💬</a><button class="tbtn${u.elaqe?'':' ok'}" onclick="tElaqe('${esc(u.tel)}',${!u.elaqe})">${u.elaqe?'↺ Əlaqəni geri al':'✓ Əlaqə saxlanılıb'}</button>${TU.ask===u.tel?`<div class="askrow"><b>${u.blok?'Bloku açmaq':'Bloklamaq'} istəyirsiniz?</b><button class="tbtn ${u.blok?'ok':'rm'}" onclick="tBlock('${esc(u.tel)}',${!u.blok})">Bəli</button><button class="tbtn" onclick="TU.ask='';tUsers()">Xeyr</button></div>`:`<button class="tbtn ${u.blok?'ok':'rm'}" onclick="TU.ask='${esc(u.tel)}';TU.msg='';tUsers()">${u.blok?'✅ Bloku aç':'🚫 Blokla'}</button>`}</div>`).join('')+(rows.length?'':'<p class="note">Hələ heç kim yoxdur.</p>')+`</div>`;
  app.innerHTML=h;
}
async function tBlock(tel,v){
  const key=lsGet('hc14-tkey','');TU.ask='';
  if(!key){TU.msg='Əvvəlcə "Cədvəl açarı"nı daxil edin.';return tUsers()}
  TU.msg='Yadda saxlanılır…';tUsers();
  try{const r=await fetch(SHEET_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({a:'block',key,tel,v})});const o=await r.json();
    if(!o.ok)throw new Error(o.error||'x');
    (TU.list||[]).forEach(u=>{if(u.tel===tel)u.blok=v});TU.msg=v?'Bloklandı. İstifadəçi saytı növbəti açanda bildiriş görəcək.':'Blok açıldı.';
  }catch(e){const m=String(e&&e.message);TU.msg=m==='key'?'Cədvəl açarı səhvdir.':'Alınmadı: '+m}
  tUsers();
}
async function tElaqe(tel,v){
  const key=lsGet('hc14-tkey','');TU.ask='';
  if(!key){TU.msg='Əvvəlcə "Cədvəl açarı"nı daxil edin.';return tUsers()}
  TU.msg='Yadda saxlanılır…';tUsers();
  try{const r=await fetch(SHEET_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({a:'elaqe',key,tel,v})});const o=await r.json();
    if(!o.ok)throw new Error(o.error||'x');
    (TU.list||[]).forEach(u=>{if(String(u.tel)===String(tel))u.elaqe=v?(o.t||Date.now()):''});TU.msg=v?'✓ Əlaqə saxlanılıb kimi işarələndi.':'İşarə götürüldü.';
  }catch(e){const m=String(e&&e.message);TU.msg=m==='key'?'Cədvəl açarı səhvdir.':m==='a'||m==='x'?'Alınmadı. Google Cədvəlin skriptini yeniləyin (yeni Kod.gs → Новая версия).':'Alınmadı: '+m}
  tUsers();
}
async function tResults(reload){
  if(!TU.res||reload){app.innerHTML=thdr('Nəticələr','Yüklənir…','tHome()');await tFetch('results')}
  const L=(TU.res||[]).slice().sort((a,b)=>(+b.at||0)-(+a.at||0)),q=TU.q.toLowerCase();
  let h=thdr('Nəticələr',L.length+' nəticə','tHome()');
  if(TU.err)h+=`<p class="perr">${esc(TU.err)}</p>`;
  h+=`<div class="row" style="justify-content:flex-start"><button class="btn" onclick="tResults(true)">↻ Yenilə</button></div>`+tSearch('tResults');
  const rows=L.filter(x=>!q||[x.ad,x.soyad,x.sec].join(' ').toLowerCase().includes(q)).slice(0,400);
  h+=`<div class="tlist">`+rows.map(x=>`<div class="titem"><span><b>${esc(x.ad)} ${esc(x.soyad)}</b><br><small>${esc(x.sec)} · ${dOnly(x.at)}</small></span><span class="ts" style="background:${(+x.p)>=80?'var(--oks)':'var(--bads)'};color:${(+x.p)>=80?'var(--ok)':'var(--bad)'}">${esc(x.p)}%</span></div>`).join('')+(rows.length?'':'<p class="note">Hələ nəticə yoxdur.</p>')+`</div>`;
  app.innerHTML=h;
}

/* ---------- boot ---------- */
function boot(){
  if(!REG){regScreen();return}
  if(lsGet('hc14-blok',0)){blockScreen();syncPing();return}
  render();LASTPING=Date.now();syncPing();
}
boot();
