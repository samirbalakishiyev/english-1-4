/* ===================== academoo formatları: şəkilli kitablar, fonika yolu, puzzle ===================== */

/* ---- şəkilli kitab: hər unit üçün nümunə cümlə + söz seçimi ---- */
const BOOKPAT = {
1:[{t:"I Am Six!",p:"I am {w}.",f:w=>/^\d+$/.test(w.p)},{t:"How Do I Feel?",p:"I am {w}."},{t:"In My Backpack",p:"I have {a}{w}."},{t:"I See Colours",p:"It is {w}."},{t:"My Clothes",p:"I have {a}{w}."},{t:"This Is Me",p:"{this} my {w}."},{t:"My Family",p:"This is my {w}."},{t:"On the Farm",p:"It is {a}{w}."}],
2:[{t:"Meet My Family",p:"This is my {w}.",f:w=>!/^(hello|hi|goodbye|bye)$/.test(w.en)},{t:"My School Things",p:"I have {a}{w}.",f:w=>!/^\d+$/.test(w.p)},{t:"Animal Friends",p:"It is {a}{w}."},{t:"My Toys",p:"I like my {w}.",f:w=>!w.p.startsWith("c:")},{t:"I Can See It",p:"I can see the {w}."},{t:"Nature Walk",p:"Look at the {w}!",f:w=>!w.p.startsWith("c:")},{t:"My House",p:"This is the {w}.",f:w=>!/^\d+$/.test(w.p)},{t:"Yummy Food",p:"I see {a}{w}."}],
3:[{t:"My Week",p:"Today is {w}."},{t:"Simon Says",p:"{W}, please!"},{t:"My Body",p:"{this} my {w}."},{t:"When I Grow Up",p:"I want to be {a}{w}."},{t:"At the Zoo",p:"Look at the {w}!",n:8},{t:"My School Day",p:"I like {w}."},{t:"Around Town",p:"Let's go to the {w}."},{t:"What's the Weather?",p:"It is {w}.",n:8}],
4:[{t:"My Big Family",p:"{this} my {w}.",f:w=>!/^\d+$/.test(w.p)},{t:"My Birthday Month",p:"My birthday is in {w}.",n:12},{t:"My Day",p:"I {w} every day.",s:8},{t:"Sports Day",p:"I'm playing {w}.",n:8},{t:"At the Park",p:"We like to {w}.",n:8},{t:"What I'm Wearing",p:"I'm wearing {a}{w}.",n:8},{t:"Party Time",p:"We have {w}.",n:8},{t:"I Can Do It!",p:"I can {w}."}]
};
const PLURAL = new Set(["teeth","pants","shoes","sneakers","eyes","arms","hands","legs","feet","eyebrows","ears","grandparents","parents","peas","French fries","sandwiches","chips","sandals","shorts","jeans","coloured pencils"]);
const UNCOUNT = new Set(["milk","pizza","clay","juice","lemonade","popcorn","soda","candy","cake","hair"]);
function art(w){ if(PLURAL.has(w)||UNCOUNT.has(w)) return ""; return /^[aeiou]/i.test(w)?"an ":"a "; }
function makeBook(g,u){
  const b=BOOKPAT[g][u], un=unit(g,u); let ws=words(g,u);
  if(b.s) ws=ws.slice(b.s); if(b.f) ws=ws.filter(b.f); if(b.n) ws=ws.slice(0,b.n);
  const pages=ws.map(w=>{ const pl=PLURAL.has(w.en)||/s$/.test(w.en)&&!/ss$|us$/.test(w.en)&&g===3&&u===2;
    let s=b.p.replace("{a}",art(w.en)).replace("{this}",pl?"These are":"This is").replace("{W}",w.en[0].toUpperCase()+w.en.slice(1)).replace("{w}",w.en);
    return {s, w:w.en, p:w.p, az:w.az}; });
  return {t:b.t, e:un.e, pages};
}
function runBook(el, bk, key, g){
  let i=0, tok=0; const P=bk.pages;
  el.innerHTML=header(el,"📚 "+bk.t,"Səhifəni dinlə və oxu. ▶ ilə bütün kitab oxunur. Sonda oyunlar var.")+`<div class="stage">
   <div class="bookpage" id="bp"></div>
   <div class="row"><button class="btn ghost" id="bprev">◀</button><button class="say sm" id="bsay">🔊</button><button class="btn" id="ball">▶ Kitabı oxu</button><button class="btn ghost" id="bnext">▶</button></div>
   <div class="row"><button class="btn ghost" id="btr">🇦🇿 Tərcümə</button><button class="btn" id="bq">🎮 Oyunlara keç →</button></div></div>`;
  $("#sc",el).hidden=true; let tr=false;
  const draw=(read=true)=>{ const pg=P[i]; const hl=esc(pg.s).replace(esc(pg.w),`<mark>${esc(pg.w)}</mark>`);
    $("#bp",el).innerHTML=`<div class="bpic">${pic(pg.p)}</div><div class="btxt">${hl}</div>${tr?`<div class="paz">${esc(pg.az)}</div>`:""}<div class="bnum">${i+1} / ${P.length}</div>`;
    $("#qc",el).textContent=`${i+1}/${P.length}`; $("#pg",el).style.width=((i+1)*100/P.length)+"%"; if(read) speak(pg.s,{rate:.8}); };
  $("#bprev",el).onclick=()=>{ tok++; i=(i-1+P.length)%P.length; draw(); };
  $("#bnext",el).onclick=()=>{ tok++; i=(i+1)%P.length; draw(); };
  $("#bsay",el).onclick=()=>speak(P[i].s,{rate:.8});
  $("#btr",el).onclick=()=>{ tr=!tr; draw(false); };
  $("#ball",el).onclick=()=>{ const my=++tok; i=0; const step=()=>{ if(my!==tok) return; draw(false); speak(P[i].s,{rate:.8,onend:()=>{ if(my!==tok) return; if(i<P.length-1){ setTimeout(()=>{ if(my!==tok) return; i++; step(); },900); } else { S.prog[key]=S.prog[key]||50; save(); toast("📚 Kitab bitdi! İndi oyna 🎮"); } }}); }; step(); };
  $("#bq",el).onclick=()=>{ tok++; stopSpeak(); const ws=P.map(p=>({en:p.w,p:p.p,az:p.az}));
    const sentQ = P.filter(p=>!isText(p.p)||true).map(p=>({k:"choice", say:p.s, prompt:{p:p.p, text:p.s.replace(p.w,"_____"), az:"Şəklə uyğun sözü seç"}, layout:"txt", opts:shuffle([{t:p.w,ok:true}, ...take(P.filter(x=>x.w!==p.w&&x.p!==p.p),2).map(x=>({t:x.w}))])}));
    const qs = pre(g) ? shuffle([...G.listenPic(ws,5), ...P.slice(0,5).map(p=>({k:"choice", say:p.s, prompt:{text:"🔊 Cümləni dinlə və şəkli seç", small:true}, layout:"pic", opts:shuffle([{p:p.p,ok:true}, ...take(P.filter(x=>x.p!==p.p),2).map(x=>({p:x.p}))])}))]).slice(0,10)
      : shuffle([...take(sentQ,4), ...G.wordPic(ws,3), ...P.slice(0,3).filter(p=>p.s.split(" ").length>=3).map(p=>({k:"build", tokens:p.s.split(" "), az:p.az+" (kitabdan cümlə)", p:p.p, en:p.s}))]);
    runQuiz(el,{title:bk.t+" · oyunlar",ins:"Kitabdakı söz və cümlələrlə oyna",qs,key,g,u:VIEW.u}); };
  draw();
}

/* ---- fonika yolu ---- */
const PH = {a:[["ant","🐜"],["apple","🍎"],["alligator","🐊"]],b:[["ball","⚽"],["bear","🐻"],["boat","⛵"]],c:[["cat","🐱"],["cow","🐄"],["car","🚗"]],d:[["dog","🐶"],["duck","🦆"],["door","🚪"]],e:[["egg","🥚"],["elephant","🐘"],["envelope","✉️"]],f:[["fish","🐟"],["fox","🦊"],["frog","🐸"]],g:[["goat","🐐"],["grapes","🍇"],["gift","🎁"]],h:[["hat","👒"],["horse","🐴"],["house","🏠"]],i:[["igloo","🛖"],["insect","🐞"],["ink","🖋️"]],j:[["juice","🧃"],["jam","🍯"],["jet","✈️"]],k:[["kite","🪁"],["key","🔑"],["kangaroo","🦘"]],l:[["lion","🦁"],["leaf","🍃"],["lemon","🍋"]],m:[["moon","🌙"],["monkey","🐒"],["milk","🥛"]],n:[["nose","👃"],["nest","🪺"],["nut","🥜"]],o:[["octopus","🐙"],["orange","🍊"],["ox","🐂"]],p:[["pig","🐷"],["pen","🖊️"],["pizza","🍕"]],q:[["queen","👸"],["question","❓"],["quilt","🛏️"]],r:[["rabbit","🐰"],["rain","🌧️"],["ring","💍"]],s:[["sun","☀️"],["snake","🐍"],["sock","🧦"]],t:[["tiger","🐯"],["tent","⛺"],["turtle","🐢"]],u:[["umbrella","☂️"],["up","⬆️"],["unicorn","🦄"]],v:[["van","🚐"],["violin","🎻"],["volcano","🌋"]],w:[["water","💧"],["watch","⌚"],["whale","🐳"]],x:[["fox","🦊"],["box","📦"],["six","6"]],y:[["yo-yo","🪀"],["yak","🐃"],["yellow","c:#FDD835"]],z:[["zebra","🦓"],["zoo","🏞️"],["zero","0"]]};
const CVC = [
 {t:"-a- sözləri",v:"a",w:[["cat","🐱"],["bat","🦇"],["hat","👒"],["rat","🐀"],["can","🥫"],["fan","🪭"],["van","🚐"],["man","👨"]]},
 {t:"-e- sözləri",v:"e",w:[["bed","🛏️"],["red","c:#E53935"],["hen","🐔"],["pen","🖊️"],["ten","10"],["net","🥅"],["jet","✈️"],["leg","🦵"]]},
 {t:"-i- sözləri",v:"i",w:[["pig","🐷"],["lip","👄"],["six","6"],["bin","🗑️"],["kid","🧒"],["zip","🤐"],["fig","🫐"],["wig","💇"]]},
 {t:"-o- sözləri",v:"o",w:[["dog","🐶"],["log","🪵"],["pot","🍲"],["hot","🔥"],["box","📦"],["fox","🦊"],["top","🔝"],["mop","🧹"]]},
 {t:"-u- sözləri",v:"u",w:[["sun","☀️"],["bug","🐛"],["mug","☕"],["run","🏃"],["bus","🚌"],["cup","🥤"],["hug","🤗"],["nut","🥜"]]}
];
function phWords(){ return Object.entries(PH).flatMap(([l,a])=>a.map(([en,p])=>({en,p,l}))); }
function runLetter(el, L, key, g){
  const ws=PH[L].map(([en,p])=>({en,p,az:""})), U=L.toUpperCase();
  el.innerHTML=header(el,`Hərf ${U} ${L}`,"Hərfə və şəkillərə toxun, dinlə. Sonra oyun başlayır.")+`<div class="stage">
   <button class="bigletter" id="bl">${U}<span>${L}</span></button>
   <div class="row">${ws.map((w,j)=>`<button class="witem" data-j="${j}" style="width:auto">${pic(w.p)}<div><b>${esc(w.en)}</b></div></button>`).join("")}</div>
   <button class="btn" id="lq">🎮 Oyuna keç →</button></div>`;
  $("#sc",el).hidden=true; $("#qc",el).textContent=U+L;
  const intro=()=>speak(`${U}. ${U} is for ${ws[0].en}. ${ws[1].en}. ${ws[2].en}.`,{rate:.75});
  $("#bl",el).onclick=intro; setTimeout(intro,300);
  el.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>speak(ws[+b.dataset.j].en));
  $("#lq",el).onclick=()=>{ stopSpeak(); const others="abcdefghijklmnoprstuwy".split("").filter(x=>x!==L);
    const cells=shuffle([...Array(5).fill(L), ...take(others,4).flatMap(x=>[x,x]).slice(0,7)]);
    const pool=phWords().filter(w=>w.l!==L && w.l!=="x");
    const qs=[
      {k:"findall", target:L, cells, say:L, prompt:{text:`Bütün «${L}» hərflərini tap`, small:true}},
      {k:"choice", prompt:{html:`<div class="bigletter sm">${U}</div>`, text:`${U} hərfinin kiçik cütünü tap`, small:true}, layout:"txt two", opts:shuffle([{t:L,ok:true}, ...take(others,3).map(t=>({t}))])},
      ...ws.filter(w=>!isText(w.p)).map(w=>({k:"choice", say:w.en, prompt:{text:`🔊 Hansı söz «${L}» ilə başlayır?`, small:true}, layout:"pic", opts:shuffle([{p:w.p,ok:true,w:w.en}, ...take(pool.filter(x=>!isText(x.p)),2).map(x=>({p:x.p,w:x.en}))])})),
      ...ws.filter(w=>w.en[0]===L).map(w=>({k:"choice", say:w.en, prompt:{p:w.p, text:"_"+w.en.slice(1), az:"Sözün ilk hərfini tap"}, layout:"txt two", opts:shuffle([{t:L,ok:true}, ...take(others,3).map(t=>({t}))])}))
    ];
    runQuiz(el,{title:`Hərf ${U} ${L} · oyun`,ins:"Hərfi tap, dinlə, sözü tamamla",qs,key,g}); };
}
function runCVC(el, grp, key, g){
  const ws=grp.w.map(([en,p])=>({en,p,az:""})); let i=0;
  el.innerHTML=header(el,"Blend: "+grp.t,"Hər hərfə ayrı-ayrı toxun, sonra 🔗 ilə birləşdir və sözü eşit.")+`<div class="stage"><div class="blend" id="bd"></div>
   <div class="row"><button class="btn ghost" id="cp">◀</button><button class="btn" id="cb">🔗 Birləşdir</button><button class="btn ghost" id="cn">▶</button></div><button class="btn" id="cq">🎮 Oyuna keç →</button></div>`;
  $("#sc",el).hidden=true;
  const draw=()=>{ const w=ws[i]; $("#qc",el).textContent=`${i+1}/${ws.length}`; $("#pg",el).style.width=((i+1)*100/ws.length)+"%";
    $("#bd",el).innerHTML=`<div class="bpic">${pic(w.p)}</div><div class="row">${[...w.en].map(c=>`<button class="tile bl ${c===grp.v?"vow":""}">${c}</button>`).join("")}</div><div class="btxt" id="bw" style="visibility:hidden">${w.en}</div>`;
    el.querySelectorAll(".tile.bl").forEach(b=>b.onclick=()=>speak(b.textContent,{rate:.6})); };
  $("#cb",el).onclick=()=>{ const w=ws[i]; $("#bw",el).style.visibility="visible"; speak([...w.en].join(" ")+". "+w.en,{rate:.6}); };
  $("#cp",el).onclick=()=>{ i=(i-1+ws.length)%ws.length; draw(); };
  $("#cn",el).onclick=()=>{ i=(i+1)%ws.length; draw(); };
  $("#cq",el).onclick=()=>{ stopSpeak(); const pics=ws.filter(w=>!isText(w.p)&&!w.p.startsWith("c:"));
    const qs=shuffle([...G.listenPic(pics,4), ...take(ws,3).map(w=>({k:"choice", say:w.en, prompt:{p:w.p, text:w.en[0]+" _ "+w.en[2], az:"Ortadakı saiti tap"}, layout:"txt two", opts:shuffle(["a","e","i","o","u"].filter(v=>v!==grp.v).slice(0,3).map(t=>({t})).concat([{t:grp.v,ok:true}]))})), ...G.spell(ws,3)]);
    runQuiz(el,{title:"Blend: "+grp.t+" · oyun",ins:"Dinlə, saiti tap, sözü qur",qs,key,g}); };
  draw();
}

/* ---- Fix the Picture: şəkil puzzle-ı ---- */
function runPuzzle(el, ws, g, key){
  const N = pre(g)?2:3, R=4; const pool=take(dedupe(ws.filter(w=>!isText(w.p)&&!w.p.startsWith("c:")&&!w.p.startsWith("#")),w=>w.p),R); let r=0, score=0;
  el.innerHTML=header(el,"Fix the Picture","Hissələri yerinə qoy: iki hissəyə ardıcıl toxunsan, yerləri dəyişir. Şəkil düzələndə sözü eşidəcəksən.")+`<div class="stage" id="pz"></div>`;
  const round=()=>{ const w=pool[r]; if(!w) return fin(); let order=shuffle([...Array(N*N).keys()]); while(order.every((v,k)=>v===k)) order=shuffle(order); let sel=null, moves=0;
    $("#qc",el).textContent=`${r+1}/${pool.length}`; $("#pg",el).style.width=(r*100/pool.length)+"%";
    const S2=240/N;
    const draw=()=>{ $("#pz",el).innerHTML=`<div class="puzzle" style="grid-template-columns:repeat(${N},${S2}px)">${order.map((v,k)=>{ const x=v%N, y=Math.floor(v/N); return `<button class="ptile ${sel===k?"sel":""}" data-k="${k}" style="width:${S2}px;height:${S2}px"><span style="left:${-x*S2}px;top:${-y*S2}px">${w.p}</span></button>`; }).join("")}</div><button class="say sm" id="ph">🔊</button><div class="feedback" id="pf"></div>`;
      $("#ph",el).onclick=()=>speak(w.en);
      el.querySelectorAll(".ptile").forEach(b=>b.onclick=()=>{ const k=+b.dataset.k; if(sel==null){ sel=k; draw(); return; } [order[sel],order[k]]=[order[k],order[sel]]; sel=null; moves++; draw();
        if(order.every((v,j)=>v===j)){ sfx.ok(); fireworks(1); score+= moves<=N*N?1:0.5; $("#pf",el).innerHTML=`Əla! Bu: <b>${esc(w.en)}</b> — ${esc(w.ru?w.az+" · "+w.ru:(w.az||""))}`; $("#pf",el).className="feedback ok"; speak(w.en); $("#sc",el).textContent="⭐ "+Math.round(score); r++; setTimeout(round,1800); } }); };
    draw(); };
  const fin=()=>result({key,title:"Fix the Picture",g,u:VIEW.u,score:Math.round(score),n:pool.length,pct:Math.round(score*100/pool.length),retry:()=>runPuzzle(el,ws,g,key)});
  round();
}
