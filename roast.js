/* =========================================================
   Torra Certa — torra guiada
   Usa as funções globais do index.html: DB, save, lot, $, esc, toast,
   openSheet, closeSheet, sheetCtx, closeBtn, ICON, today, fmt, fmtShort, cap, renderAll.
   ========================================================= */

/* ---------- equipamentos ---------- */
// cap: gramas por batelada · fc: janela típica do 1º crack (s) · stir: lembrete para mexer (s)
const GEAR = {
  popper: { l:'Pipoqueira de ar quente', cap:[60, 90], fc:[180, 330],
    d:'Mexe sozinha e deixa ver os grãos. A mais indicada para começar.',
    prep:['Ligue direto na tomada, sem extensão', 'Tigela na saída para pegar a película', 'Não saia de perto: a película pode pegar fogo'],
    agit:'Nos primeiros minutos, mexa com colher de pau até os grãos girarem sozinhos.', late:'Os grãos giram sozinhos. Olhe a cor e escute os estalos.',
    fast:'Use um pouco mais de grãos ou ligue numa extensão.', slow:'Use menos grãos e ligue direto na tomada.' },
  crank: { l:'Pipoqueira de manivela', cap:[150, 250], fc:[480, 720],
    d:'Panela com manivela no fogão. Muito comum e fácil de achar.',
    prep:['Fogo médio, panela pré-aquecida por 3 min', 'Tampa fechada; abra só para olhar'],
    agit:'Gire a manivela sem parar, num ritmo constante.',
    fast:'Baixe o fogo.', slow:'Aumente o fogo ou use menos grãos.' },
  pan: { l:'Panela, frigideira ou wok', cap:[100, 200], fc:[480, 720],
    d:'Funciona com o que tem em casa. A torra sai mais desigual.',
    prep:['Fundo grosso, de preferência ferro', 'Fogo médio, pré-aquecida por 3 min'],
    agit:'Mexa sem parar com colher de pau, raspando o fundo.',
    fast:'Baixe o fogo.', slow:'Aumente o fogo ou use menos grãos.' },
  oven: { l:'Forno', cap:[150, 250], fc:[480, 720], stir:120,
    d:'Assadeira furada, camada única. Precisa mexer de tempos em tempos.',
    prep:['Pré-aqueça a 240 °C por 15 min', 'Assadeira furada ou alumínio furado, camada única', 'Prateleira do meio'],
    agit:'Abra e mexa os grãos a cada 2 minutos, rápido para não perder calor.',
    fast:'Baixe para 220 °C.', slow:'Suba para 250 °C ou use menos grãos.' },
  airfryer: { l:'Air fryer', cap:[50, 100], fc:[420, 720], stir:120,
    d:'Prática, mas os testes publicados dão torra bem desigual.',
    prep:['Pré-aqueça a 190 °C por 5 min', 'Camada única no cesto', 'A película vai para a resistência: limpe depois'],
    agit:'Abra e chacoalhe o cesto a cada 2 minutos.',
    fast:'Baixe para 180 °C.', slow:'Suba para 200 °C ou use menos grãos.' },
  heatgun: { l:'Soprador térmico + tigela', cap:[150, 300], fc:[360, 540],
    d:'Dá bastante controle. Faça ao ar livre: a película voa.',
    prep:['Tigela de inox funda', 'Luva: a tigela esquenta muito', 'Ao ar livre ou perto de janela aberta'],
    agit:'Mexa em círculos sem parar, com o soprador a 10–15 cm dos grãos.', late:'Continue mexendo; se escurecer rápido, afaste o soprador.',
    fast:'Afaste o soprador.', slow:'Aproxime o soprador ou use menos grãos.' },
  drum: { l:'Torrador manual de fogão', cap:[200, 500], fc:[600, 840],
    d:'O cilindro com manivela tradicional do interior.',
    prep:['Fogo médio-baixo', 'Pré-aqueça o cilindro por 3 min'],
    agit:'Gire a manivela sem parar.',
    fast:'Baixe o fogo.', slow:'Aumente o fogo ou use menos grãos.' },
  electric: { l:'Torrador elétrico doméstico', cap:[100, 250], fc:null,
    d:'Siga a quantidade e o programa do fabricante; o app guia pelos sinais.',
    prep:['Quantidade e programa indicados pelo fabricante'],
    agit:'Siga as instruções do fabricante.',
    fast:'Use um programa mais suave.', slow:'Use um programa mais forte ou menos grãos.' },
};
const GEAR_ORDER = ['popper', 'crank', 'pan', 'oven', 'airfryer', 'heatgun', 'drum', 'electric'];
const fcWin = g => GEAR[g].fc || [480, 720];

/* ---------- pontos de torra ---------- */
const LEVELS = {
  light:  { l:'Clara', dev:60, loss:[12, 15], color:'#9A6A3F',
            d:'Mais acidez e notas frutadas. Cor de canela, superfície seca.', when:'cerca de 1 min depois do 1º crack' },
  medium: { l:'Média', dev:120, loss:[14, 17], color:'#6B4429',
            d:'Equilibrada: doçura, corpo e acidez. Marrom-chocolate, ainda seca.', when:'cerca de 2 min depois do 1º crack, antes do 2º' },
  mdark:  { l:'Média-escura', afterSC:15, loss:[16, 19], color:'#45291A',
            d:'Mais corpo e notas de chocolate, menos acidez. Pode aparecer um pouco de óleo.', when:'nos primeiros estalos do 2º crack' },
};

/* ---------- fases ---------- */
const PH = {
  armed:   { l:'Pronto para começar', c:'#8D9A5B', cor:'Verde', cheiro:'—', som:'—' },
  dry:     { l:'Secagem', c:'#B9B46A', cor:'Verde ficando amarelo-claro', cheiro:'Grama, feno', som:'Silêncio; sai vapor' },
  maillard:{ l:'Escurecimento', c:'#C49A5A', cor:'Amarelo → marrom-claro, com manchas', cheiro:'Pão torrado, cereal', som:'A película se solta; fumaça leve' },
  prefc:   { l:'1º crack chegando', c:'#A9763F', cor:'Marrom-claro', cheiro:'Doce, de pão e caramelo', som:'Fique atento: estalos como pipoca' },
  dev:     { l:'Desenvolvimento', c:'#7C4F2C', cor:'Marrom escurecendo e ficando uniforme', cheiro:'Caramelo, chocolate', som:'Estalos do 1º crack, sumindo aos poucos' },
  presc:   { l:'2º crack chegando', c:'#5A3820', cor:'Marrom-escuro', cheiro:'Mais tostado; a fumaça aumenta', som:'Estalos finos, como crepitar' },
  stop:    { l:'Ponto atingido', c:'#3E2617', cor:'No ponto escolhido', cheiro:'—', som:'—' },
};

/* ---------- avaliação ---------- */
const TASTE = [['aroma','Aroma','fraco','intenso'], ['docura','Doçura','pouca','muita'], ['acidez','Acidez','baixa','alta'],
               ['corpo','Corpo','leve','encorpado'], ['amargor','Amargor','baixo','alto'], ['retro','Retrogosto','curto','longo']];
const BREW = ['Coado', 'Prensa francesa', 'Espresso', 'Moka', 'AeroPress', 'Outro'];
const NOTES = ['Chocolate', 'Caramelo', 'Nozes', 'Frutado', 'Cítrico', 'Floral', 'Mel', 'Especiarias', 'Terroso', 'Cru / verde', 'Queimado', 'Azedo'];

/* ---------- utilitários ---------- */
const mmss = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const now = () => Date.now();
function rdb() { DB.sessions = DB.sessions || []; DB.gear = DB.gear || null; return DB; }
const sess = id => rdb().sessions.find(s => s.id === id);
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
function plan(total, g) {
  const [lo, hi] = GEAR[g].cap; if (!(total > 0)) return null;
  const n = Math.max(1, Math.ceil(total / hi)), per = Math.round(total / n);
  return { n, per, small: per < lo };
}

/* =========================================================
   Áudio: bipes, microfone, wake lock
   ========================================================= */
let AC = null;
function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function beep(n = 1, f = 880) {
  const a = audio(); if (!a) return;
  for (let i = 0; i < n; i++) {
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * 0.22;
    o.frequency.value = f; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.18);
  }
}
let wake = null;
async function wakeOn() { try { if ('wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) {} }
function wakeOff() { try { wake && wake.release(); } catch (e) {} wake = null; }
document.addEventListener('visibilitychange', () => { if (!document.hidden && LIVE() && ['live', 'cool'].includes(LIVE().step)) wakeOn(); });

// Detector de estalos: filtro passa-alta + energia de curto prazo comparada ao ruído de fundo.
const MIC = { on:false, err:null, stream:null, node:null, level:0, pops:[], sens:'med' };
const SENS = { low:9, med:5.5, high:3.5 };
const WORKLET = `
class Pops extends AudioWorkletProcessor {
  constructor() { super(); this.bg = 1e-4; this.last = 0; this.ratio = 5.5; this.n = 0; this.pk = 0;
    this.port.onmessage = e => { if (e.data.ratio) this.ratio = e.data.ratio; }; }
  process(inp) {
    const ch = inp[0] && inp[0][0]; if (!ch) return true;
    let e = 0; for (let i = 0; i < ch.length; i++) e += ch[i] * ch[i]; e /= ch.length;
    const t = currentTime;
    if (e > this.bg * this.ratio && e > 2e-6 && t - this.last > 0.06) { this.last = t; this.port.postMessage({ pop:t, s:e / this.bg }); }
    this.bg = this.bg * 0.997 + Math.min(e, this.bg * 4) * 0.003;
    this.pk = Math.max(this.pk, e); if (++this.n >= 12) { this.port.postMessage({ lvl:this.pk, bg:this.bg }); this.n = 0; this.pk = 0; }
    return true;
  }
}
registerProcessor('pops', Pops);`;
async function micStart() {
  if (MIC.on) return true;
  const a = audio(); if (!a || !navigator.mediaDevices) { MIC.err = 'Microfone indisponível neste navegador.'; return false; }
  try {
    MIC.stream = await navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:false, noiseSuppression:false, autoGainControl:false } });
  } catch (e) { MIC.err = 'Sem permissão para o microfone. Use o botão.'; return false; }
  const src = a.createMediaStreamSource(MIC.stream), hp = a.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 1800; src.connect(hp);
  const onPop = (t, s) => { MIC.pops.push(now()); MIC.pops = MIC.pops.filter(x => now() - x < 30000); micPop(s); };
  try {
    await a.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type:'application/javascript' })));
    const node = new AudioWorkletNode(a, 'pops');
    node.port.onmessage = e => { if (e.data.pop) onPop(e.data.pop, e.data.s); if (e.data.lvl != null) MIC.level = Math.min(1, Math.sqrt(e.data.lvl) * 6); };
    node.port.postMessage({ ratio:SENS[MIC.sens] });
    hp.connect(node); const mute = a.createGain(); mute.gain.value = 0; node.connect(mute).connect(a.destination);
    MIC.node = node;
  } catch (e) {
    // alternativa: analyser em loop
    const an = a.createAnalyser(); an.fftSize = 256; hp.connect(an); const buf = new Float32Array(an.fftSize);
    let bg = 1e-4, last = 0;
    MIC.node = { port:{ postMessage(m) { if (m.ratio) MIC._ratio = m.ratio; } } }; MIC._ratio = SENS[MIC.sens];
    MIC._timer = setInterval(() => {
      an.getFloatTimeDomainData(buf); let e2 = 0; for (const v of buf) e2 += v * v; e2 /= buf.length;
      if (e2 > bg * MIC._ratio && e2 > 2e-6 && now() - last > 60) { last = now(); onPop(0, e2 / bg); }
      bg = bg * 0.97 + Math.min(e2, bg * 4) * 0.03; MIC.level = Math.min(1, Math.sqrt(e2) * 6);
    }, 6);
  }
  MIC.on = true; MIC.err = null; MIC.pops = [];
  return true;
}
function micStop() {
  try { MIC.stream && MIC.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
  clearInterval(MIC._timer); MIC.on = false; MIC.stream = null; MIC.node = null; MIC.level = 0;
}
function micSens(s) { MIC.sens = s; DB.micSens = s; save(); if (MIC.node) MIC.node.port.postMessage({ ratio:SENS[s] }); }

// Interpreta os estalos: 3 em 6 s viram o 1º crack; 4 em 5 s (depois de 1 min de desenvolvimento) viram o 2º.
function micPop() {
  const L = LIVE(); if (!L || L.step !== 'live' || !L.t0) return;
  L.popN = (L.popN || 0) + 1;
  const el = (now() - L.t0) / 1000, w = fcWin(L.gear), recent = s => MIC.pops.filter(x => now() - x <= s * 1000).length;
  if (!L.fc && el > w[0] * 0.55 && recent(6) >= 3) { mark('fc', true); return; }
  if (L.fc && !L.sc && el - L.fc > 60 && recent(5) >= 4) {
    if (L.level === 'mdark') mark('sc', true);
    else if (!L.scWarn) { L.scWarn = true; beep(3, 660); flash('Parece o 2º crack: pare agora.'); saveLive(); }
  }
}

/* =========================================================
   Estado da torra ao vivo
   ========================================================= */
const LIVE = () => rdb().live || null;
function saveLive() { save(); }
function startPrep(lotId) {
  rdb();
  DB.live = { step:'prep', gear:DB.gear || 'popper', level:DB.lastLevel || 'medium', green:'', lotId:lotId === undefined ? (lot() && ['roast', 'peel', 'rest'].includes(curStage(lot())) ? lot().id : null) : lotId,
              checks:{}, useMic:DB.useMic !== false };
  if (!DB.gear) DB.live.step = 'gear';
  save(); openRZ();
}
function el() { const L = LIVE(); return L && L.t0 ? ((L.stopT || now()) - L.t0) / 1000 : 0; }
function phase(L, t) {
  if (!L.t0) return 'armed';
  const w = fcWin(L.gear);
  if (!L.fc) return t < w[0] * 0.45 ? 'dry' : t < w[0] - 20 ? 'maillard' : 'prefc';
  if (L.level === 'mdark') return !L.sc ? (t - L.fc > 90 ? 'presc' : 'dev') : (t - L.sc >= LEVELS.mdark.afterSC ? 'stop' : 'presc');
  return t - L.fc >= LEVELS[L.level].dev ? 'stop' : 'dev';
}
function target(L) {
  if (L.level === 'mdark') return L.sc != null ? L.sc + LEVELS.mdark.afterSC : null;
  return L.fc != null ? L.fc + LEVELS[L.level].dev : null;
}
function mark(k, auto) {
  const L = LIVE(); if (!L || !L.t0) return;
  const t = el();
  if (k === 'fc') { L.fc = auto ? Math.max(0, t - 4) : t; L.fcAuto = !!auto; }
  if (k === 'sc') { L.sc = auto ? Math.max(0, t - 3) : t; L.scAuto = !!auto; }
  saveLive(); beep(auto ? 2 : 1, 990);
  if (auto) flash(`${k === 'fc' ? '1º' : '2º'} crack detectado pelo microfone`, k);
  renderRZ();
}
function unmark(k) { const L = LIVE(); if (k === 'fc') { L.fc = null; L.sc = null; } if (k === 'sc') L.sc = null; L.stopBeeped = false; saveLive(); renderRZ(); }
let flashT;
function flash(msg, undo) {
  const f = $('#rzFlash'); if (!f) return;
  f.innerHTML = `<span>${msg}</span>${undo ? `<button data-r="unmark" data-k="${undo}">Desfazer</button>` : ''}`;
  f.classList.add('on'); clearTimeout(flashT); flashT = setTimeout(() => f.classList.remove('on'), 6000);
}

/* ---------- dicas para a próxima batelada ---------- */
function tipsFor(b, g, level) {
  const w = fcWin(g), T = [], G = GEAR[g];
  if (b.fc == null) T.push(['warn', 'O 1º crack não foi marcado. Na próxima, fique atento ao som de pipoca.']);
  else if (G.fc && b.fc < w[0]) T.push(['warn', `O 1º crack veio cedo (${mmss(b.fc)}). Risco de grão queimado por fora e cru por dentro. ${G.fast}`]);
  else if (G.fc && b.fc > w[1]) T.push(['warn', `O 1º crack veio tarde (${mmss(b.fc)}). O café pode ficar “assado”, sem doçura. ${G.slow}`]);
  else if (b.fc != null) T.push(['ok', `1º crack em ${mmss(b.fc)}, dentro do esperado. Mantenha o calor.`]);
  if (b.sc != null && level !== 'mdark') T.push(['warn', 'Chegou ao 2º crack: passou do ponto escolhido. Pare um pouco antes na próxima.']);
  if (b.fc != null && b.drop != null) {
    const dv = b.drop - b.fc;
    if (level !== 'mdark' && dv < LEVELS[level].dev - 30) T.push(['warn', `Desenvolvimento curto (${mmss(dv)}). Pode ficar ácido e com gosto verde.`]);
    if (level !== 'mdark' && dv > LEVELS[level].dev + 45) T.push(['warn', `Desenvolvimento longo (${mmss(dv)}). Deve ter ficado mais escuro que o planejado.`]);
  }
  if (b.loss != null) {
    const [lo, hi] = LEVELS[level].loss;
    if (b.loss < lo - 1) T.push(['warn', `Perda de ${b.loss.toFixed(1)}%, baixa para torra ${LEVELS[level].l.toLowerCase()} (${lo}–${hi}%). Pode ter ficado clara ou crua por dentro.`]);
    else if (b.loss > hi + 1) T.push(['warn', `Perda de ${b.loss.toFixed(1)}%, alta para torra ${LEVELS[level].l.toLowerCase()} (${lo}–${hi}%). Ficou mais escura que o planejado.`]);
    else T.push(['ok', `Perda de ${b.loss.toFixed(1)}%, dentro do esperado para torra ${LEVELS[level].l.toLowerCase()}.`]);
  }
  return T;
}

/* =========================================================
   Tela cheia da torra
   ========================================================= */
let rzTimer = null, lastPh = null;
function openRZ() {
  let rz = $('#rz');
  if (!rz) { rz = document.createElement('div'); rz.id = 'rz'; rz.className = 'rz'; rz.setAttribute('role', 'dialog'); rz.setAttribute('aria-modal', 'true'); document.body.appendChild(rz); }
  rz.classList.add('on'); document.body.classList.add('rz-open'); renderRZ();
  clearInterval(rzTimer); rzTimer = setInterval(tick, 250);
}
function closeRZ() {
  $('#rz')?.classList.remove('on'); document.body.classList.remove('rz-open');
  clearInterval(rzTimer); micStop(); wakeOff(); lastPh = null; renderAll();
}
const X = `<button class="rz-x" data-r="quit" aria-label="Fechar">${ICON.x}</button>`;
const gearLine = g => GEAR[g].fc ? `${GEAR[g].cap[0]}–${GEAR[g].cap[1]} g por batelada · 1º crack ~${Math.round(GEAR[g].fc[0] / 60)}–${Math.round(GEAR[g].fc[1] / 60)} min` : `${GEAR[g].cap[0]}–${GEAR[g].cap[1]} g por batelada · tempos do fabricante`;

function renderRZ() {
  const L = LIVE(), rz = $('#rz'); if (!L || !rz) return;
  const S = L.sid ? sess(L.sid) : null;
  let h = '';
  switch (L.step) {
    case 'gear': h = viewGear(L); break;
    case 'prep': h = viewPrep(L); break;
    case 'live': h = viewLive(L, S); break;
    case 'cool': h = viewCool(L, S); break;
    case 'weigh': h = viewWeigh(L, S); break;
    case 'next': h = viewNext(L, S); break;
    case 'done': h = viewDone(L, S); break;
  }
  rz.innerHTML = h + '<div class="rz-flash" id="rzFlash"></div>';
  rz.scrollTop = 0;
  lastPh = null; // força o tick a pintar a fase atual
  tick();
}

function viewGear(L) {
  return `<div class="rz-head">${DB.gear ? `<button class="rz-x" data-r="toprep" aria-label="Voltar">${ICON.back}</button>` : X}<span></span><span style="width:36px"></span></div>
  <div class="rz-body">
    <h2>${DB.gear ? 'Trocar equipamento' : 'Qual seu equipamento?'}</h2>
    <p class="lead">${DB.gear ? 'Escolha o equipamento desta torra.' : 'Ele fica salvo como seu equipamento. Dá para trocar a qualquer momento.'}</p>
    ${GEAR_ORDER.map(k => `<button class="opt ${L.gear === k ? 'on' : ''}" data-r="gear" data-g="${k}"><span class="ra"></span><span><b>${GEAR[k].l}${DB.gear === k ? ' <i class="mine">meu</i>' : ''}</b><p>${GEAR[k].d}</p><p class="spec">${gearLine(k)}</p></span></button>`).join('')}
    ${DB.gear ? `<label class="rz-check"><input type="checkbox" id="rzMine" ${L.gear === DB.gear ? 'checked disabled' : ''}><span>Salvar como meu equipamento</span></label>` : ''}
  </div>
  <div class="rz-foot"><button class="btn" data-r="gearok">Continuar</button></div>`;
}

function viewPrep(L) {
  const G = GEAR[L.gear], p = plan(parseFloat(L.green), L.gear), Lt = L.lotId ? DB.lots.find(x => x.id === L.lotId) : null;
  const checks = ['Janela aberta ou exaustor ligado', 'Peneira e ventilador prontos para esfriar', 'Luva ou pano grosso', 'Balança e pote com tampa', ...G.prep];
  const ok = checks.filter((_, i) => L.checks[i]).length;
  return `<div class="rz-head">${X}<span class="rz-title">Nova torra</span><span style="width:36px"></span></div>
  <div class="rz-body">
    <div class="lbl">Equipamento</div>
    <button class="card rz-gear" data-r="togear"><span><b>${G.l}</b>${DB.gear === L.gear ? '<i class="mine">meu</i>' : ''}<small>${gearLine(L.gear)}</small></span><span class="go">Trocar</span></button>
    ${L.gear === 'airfryer' ? `<p class="hint" style="text-align:left">${G.d}</p>` : ''}

    <div class="lbl">Ponto</div>
    ${Object.entries(LEVELS).map(([k, v]) => `<button class="opt lvl ${L.level === k ? 'on' : ''}" data-r="level" data-l="${k}" style="--c:${v.color}"><span class="ra"></span><span><b>${v.l}</b><p>${v.d}</p><p class="spec">Parar ${v.when}</p></span><i class="bean" style="background:${v.color}"></i></button>`).join('')}

    <div class="lbl">Café verde</div>
    <label class="field"><input type="number" inputmode="decimal" id="rzGreen" value="${esc(L.green)}" placeholder="0"><span>g no total</span></label>
    <p class="hint rz-plan" id="rzPlan">${planText(p, L.gear)}</p>
    ${Lt ? `<label class="rz-check"><input type="checkbox" id="rzLot" checked><span>Registrar no lote “${esc(Lt.name)}”</span></label>` : ''}

    <div class="lbl">Antes de começar <span class="cnt">${ok} de ${checks.length}</span></div>
    <div class="card tasks">${checks.map((c, i) => `<div class="task ${L.checks[i] ? 'done' : ''}"><div class="tl">${c}</div><button class="chk" data-r="chk" data-i="${i}" aria-label="Feito">${ICON.check}</button></div>`).join('')}</div>

    <div class="lbl">Ouvir o crack</div>
    <div class="card" style="padding:2px 16px">
      <div class="set"><span>Usar o microfone<small>Detecta os estalos e marca o crack sozinho. O botão continua valendo.</small></span><button class="tgl ${L.useMic ? 'on' : ''}" data-r="usemic" aria-label="Microfone"><i></i></button></div>
    </div>
  </div>
  <div class="rz-foot"><button class="btn" data-r="begin" ${p ? '' : 'disabled'}>Ir para a batelada 1</button></div>`;
}
function planText(p, g) {
  if (!p) return `Seu equipamento torra ${GEAR[g].cap[0]}–${GEAR[g].cap[1]} g por vez.`;
  return `${p.n === 1 ? '1 batelada' : `${p.n} bateladas`} de ${p.per} g.` + (p.small ? ` Abaixo de ${GEAR[g].cap[0]} g a torra fica rápida e difícil de controlar.` : '');
}

function viewLive(L, S) {
  const G = GEAR[L.gear], Lv = LEVELS[L.level], b = S.plan, bi = L.bi + 1;
  const head = `<div class="rz-head">${X}<span class="rz-title">Batelada ${bi} de ${b.n} · ${L.batchG} g</span><span class="rz-tag">${Lv.l}</span></div>`;
  if (!L.t0) {
    return head + `<div class="rz-body rz-live">
      <div class="rz-ph" style="--pc:${PH.armed.c}"><i></i>${PH.armed.l}</div>
      <div class="rz-time">0:00</div>
      <div class="card rz-sig">
        <div class="lbl" style="margin-top:0">Agora</div>
        <ul class="rz-list">${G.prep.map(x => `<li>${x}</li>`).join('')}<li>Pese ${L.batchG} g de café verde</li></ul>
      </div>
      ${micCard(L)}
    </div>
    <div class="rz-foot"><button class="btn big" data-r="go">Grãos dentro · iniciar</button><p class="hint">Toque no momento em que os grãos entram no calor.</p></div>`;
  }
  return head + `<div class="rz-body rz-live">
    <div class="rz-ph" id="rzPh"></div>
    <div class="rz-time" id="rzTime">0:00</div>
    <div class="rz-meta" id="rzMeta"></div>
    <div class="rz-bar" id="rzBar"></div>
    <div class="rz-warn" id="rzWarn"></div>
    <div class="card rz-sig" id="rzSig"></div>
    ${micCard(L)}
    <div class="rz-marks" id="rzMarks"></div>
  </div>
  <div class="rz-foot" id="rzFoot"></div>`;
}
function micCard(L) {
  if (!L.useMic) return `<button class="rz-micoff" data-r="usemic">Ativar detecção pelo microfone</button>`;
  if (MIC.err) return `<div class="card rz-mic err"><span>${MIC.err}</span><button class="go" data-r="micretry">Tentar de novo</button></div>`;
  if (!MIC.on) return `<div class="card rz-mic"><span>Microfone desligado</span><button class="go" data-r="micretry">Ativar</button></div>`;
  return `<div class="card rz-mic"><span class="dot"></span><span class="ml">Ouvindo<small id="rzPops">0 estalos</small></span><span class="meter"><i id="rzMeter"></i></span>
    <button class="sens" data-r="sens" aria-label="Sensibilidade">Sensib.<b>${{ low:'baixa', med:'média', high:'alta' }[MIC.sens]}</b></button></div>`;
}

function tick() {
  const L = LIVE(); if (!L) return;
  if (L.step === 'live' && L.t0) {
    const t = el(), ph = phase(L, t);
    if (ph !== lastPh) { // mudou de fase: redesenha partes fixas
      lastPh = ph;
      if (ph === 'stop' && !L.stopBeeped) { L.stopBeeped = true; saveLive(); beep(3, 1046); }
      if (ph === 'prefc' && !L.preBeeped) { L.preBeeped = true; saveLive(); beep(1, 740); }
      paintLive(L, ph);
    }
    const tg = target(L), G = GEAR[L.gear];
    $('#rzTime') && ($('#rzTime').textContent = mmss(t));
    const meta = $('#rzMeta');
    if (meta) {
      if (!L.fc) { const w = fcWin(L.gear); meta.innerHTML = `1º crack esperado entre <b>${mmss(w[0])}</b> e <b>${mmss(w[1])}</b>`; }
      else {
        const dv = t - L.fc, pct = t > 0 ? dv / t * 100 : 0;
        meta.innerHTML = `Desenvolvimento <b>${mmss(dv)}</b> · ${pct.toFixed(0)}%` + (tg != null ? (t < tg ? ` · pare em <b>${mmss(tg - t)}</b>` : ` · <b class="hot">pare agora</b>`) : ' · aguarde o 2º crack');
      }
    }
    paintBar(L, t);
    // lembrete para mexer (forno, air fryer)
    if (G.stir && Math.floor(t / G.stir) > (L.stirN || 0)) { L.stirN = Math.floor(t / G.stir); saveLive(); beep(1, 620); flash(G.agit); }
    // avisos
    const w = $('#rzWarn'), win = fcWin(L.gear);
    let warn = '';
    if (!L.fc && G.fc && t > win[1] + 60) warn = `Está demorando. ${G.slow}`;
    else if (L.fc && G.fc && L.fc < win[0] - 30 && t - L.fc < 40) warn = `O 1º crack veio cedo. ${G.fast}`;
    else if (tg != null && t > tg + 30) warn = 'Passou do ponto escolhido. Pare e esfrie já.';
    else if (L.sc && L.level !== 'mdark') warn = '2º crack: passou do ponto escolhido. Pare agora.';
    if (w && w.textContent !== warn) { w.textContent = warn; w.classList.toggle('on', !!warn); }
    if (MIC.on) { const m = $('#rzMeter'); if (m) m.style.width = `${Math.round(MIC.level * 100)}%`; const pp = $('#rzPops'); if (pp) pp.textContent = `${L.popN || 0} estalos`; }
  }
  if (L.step === 'cool' && L.coolT0) {
    const left = 240 - (now() - L.coolT0) / 1000, c = $('#rzCool');
    if (c) c.textContent = left > 0 ? mmss(left) : 'Pronto';
    if (left <= 0 && !L.coolBeeped) { L.coolBeeped = true; saveLive(); beep(2, 880); }
    const ring = $('#rzRing'); if (ring) ring.style.setProperty('--p', Math.min(1, Math.max(0, 1 - left / 240)));
  }
}
function paintLive(L, ph) {
  const P = PH[ph], G = GEAR[L.gear], Lv = LEVELS[L.level];
  const phl = ph === 'stop' ? `Ponto ${Lv.l.toLowerCase()} atingido` : P.l;
  $('#rzPh') && ($('#rzPh').outerHTML = `<div class="rz-ph" id="rzPh" style="--pc:${ph === 'stop' ? Lv.color : P.c}"><i></i>${phl}</div>`);
  const sig = $('#rzSig');
  if (sig) sig.innerHTML = ph === 'stop'
    ? `<div class="rz-stop"><i class="bean big" style="background:${Lv.color}"></i><div><b>Despeje na peneira e esfrie.</b><p>Os grãos continuam torrando enquanto estão quentes.</p></div></div>`
    : `<div class="rz-do">${(['dev', 'presc'].includes(ph) && G.late) || G.agit}</div>
       <div class="rz-row"><span class="k">Cor</span><span class="v"><i class="bean" style="background:${P.c}"></i>${P.cor}</span></div>
       <div class="rz-row"><span class="k">Cheiro</span><span class="v">${P.cheiro}</span></div>
       <div class="rz-row"><span class="k">Som</span><span class="v">${P.som}</span></div>
       <div class="rz-row"><span class="k">Meta</span><span class="v"><i class="bean" style="background:${Lv.color}"></i>${Lv.l}: parar ${Lv.when}</span></div>`;
  const mk = $('#rzMarks');
  if (mk) mk.innerHTML = [L.fc != null ? `<span>1º crack ${mmss(L.fc)}${L.fcAuto ? ' · microfone' : ''}<button data-r="unmark" data-k="fc">desfazer</button></span>` : '',
                          L.sc != null ? `<span>2º crack ${mmss(L.sc)}${L.scAuto ? ' · microfone' : ''}<button data-r="unmark" data-k="sc">desfazer</button></span>` : ''].join('');
  const f = $('#rzFoot');
  if (f) {
    const stopBtn = `<button class="btn big ${ph === 'stop' ? 'go-now' : ''}" data-r="drop">Parar e esfriar</button>`;
    if (!L.fc) f.innerHTML = `<button class="btn big" data-r="fc">Ouvi o 1º crack</button><button class="rz-link" data-r="drop">Parar sem marcar o crack</button>`;
    else if (L.level === 'mdark' && !L.sc) f.innerHTML = `<button class="btn big" data-r="sc">Ouvi o 2º crack</button><button class="rz-link" data-r="drop">Parar agora</button>`;
    else f.innerHTML = `${stopBtn}${!L.sc && L.level !== 'mdark' ? `<button class="rz-link" data-r="sc">Marcar 2º crack</button>` : ''}`;
  }
}
function paintBar(L, t) {
  const bar = $('#rzBar'); if (!bar) return;
  const w = fcWin(L.gear), tg = target(L);
  const end = Math.max(t + 20, (tg || (L.fc ? L.fc + (L.level === 'mdark' ? 240 : LEVELS[L.level].dev) : w[1] + LEVELS[L.level === 'mdark' ? 'medium' : L.level].dev)) + 30);
  const P = x => `${Math.min(100, x / end * 100).toFixed(2)}%`;
  bar.innerHTML = `<div class="rb-track"><i class="rb-fill" style="width:${P(t)}"></i>
      <i class="rb-win" style="left:${P(w[0])};width:calc(${P(w[1])} - ${P(w[0])})"></i>
      ${L.fc != null ? `<i class="rb-mk" style="left:${P(L.fc)}"></i>` : ''}${L.sc != null ? `<i class="rb-mk" style="left:${P(L.sc)}"></i>` : ''}
      ${tg != null ? `<i class="rb-tg" style="left:${P(tg)}"></i>` : ''}
      <i class="rb-now" style="left:${P(t)}"></i></div>
    <div class="rb-lbl"><span>0:00</span>${L.fc == null ? `<span style="left:${P((w[0] + w[1]) / 2)}">1º crack</span>` : ''}${tg != null ? `<span style="left:${P(tg)}">ponto</span>` : ''}</div>`;
}

function viewCool(L, S) {
  return `<div class="rz-head"><span style="width:36px"></span><span class="rz-title">Batelada ${L.bi + 1} de ${S.plan.n} · esfriar</span><span style="width:36px"></span></div>
  <div class="rz-body rz-center">
    <div class="ring" id="rzRing"><div><div class="rz-time sm" id="rzCool">4:00</div><small>para esfriar</small></div></div>
    <h2 style="text-align:center">Esfrie rápido</h2>
    <ul class="rz-list">
      <li>Despeje na peneira e mexa na frente do ventilador</li>
      <li>Passe de uma peneira para outra para soltar a película</li>
      <li>Está pronto quando der para segurar os grãos na mão</li>
    </ul>
  </div>
  <div class="rz-foot"><button class="btn big" data-r="cooled">Já esfriou</button></div>`;
}
function viewWeigh(L, S) {
  const g = L.batchG;
  return `<div class="rz-head"><span style="width:36px"></span><span class="rz-title">Batelada ${L.bi + 1} de ${S.plan.n} · registrar</span><span style="width:36px"></span></div>
  <div class="rz-body">
    <h2>Quanto pesou?</h2>
    <p class="lead">A perda de peso mostra o quanto torrou. Para torra ${LEVELS[L.level].l.toLowerCase()}, o normal é ${LEVELS[L.level].loss[0]}–${LEVELS[L.level].loss[1]}%.</p>
    <div class="lbl">Verde</div>
    <label class="field"><input type="number" inputmode="decimal" id="rzBG" value="${g}"><span>g</span></label>
    <div class="lbl">Torrado</div>
    <label class="field"><input type="number" inputmode="decimal" id="rzRG" placeholder="0" autofocus><span>g</span></label>
    <p class="hint rz-plan" id="rzLoss">&nbsp;</p>
    <div class="lbl">Notas <span class="opt-l">opcional</span></div>
    <textarea id="rzNote" placeholder="Fogo, cor, cheiro, o que mudaria…"></textarea>
  </div>
  <div class="rz-foot"><button class="btn" data-r="savebatch">Salvar batelada</button><button class="rz-link" data-r="savebatch" data-skip="1">Pular pesagem</button></div>`;
}
function batchCard(b, i) {
  return `<div class="bt"><b>Batelada ${i + 1}</b><span>${b.green} g</span>
    <span>1º crack <b>${b.fc != null ? mmss(b.fc) : '—'}</b></span><span>Total <b>${mmss(b.drop)}</b></span>
    <span>Desenv. <b>${b.fc != null ? mmss(b.drop - b.fc) : '—'}</b></span><span>Perda <b>${b.loss != null ? b.loss.toFixed(1) + '%' : '—'}</b></span></div>`;
}
function viewNext(L, S) {
  const b = S.batches[S.batches.length - 1], T = tipsFor(b, S.gear, S.level);
  return `<div class="rz-head">${X}<span class="rz-title">Batelada ${L.bi + 1} de ${S.plan.n} salva</span><span style="width:36px"></span></div>
  <div class="rz-body">
    <h2>Para a próxima</h2>
    <div class="card">${batchCard(b, S.batches.length - 1)}</div>
    <div class="card rz-tips">${T.map(([k, x]) => `<p class="${k}"><i></i>${x}</p>`).join('')}</div>
    <p class="hint" style="text-align:left">Espere o equipamento voltar à temperatura antes de começar de novo.</p>
  </div>
  <div class="rz-foot"><button class="btn big" data-r="nextbatch">Começar batelada ${L.bi + 2}</button><button class="rz-link" data-r="finish">Encerrar por aqui</button></div>`;
}
function viewDone(L, S) {
  const B = S.batches, tg = B.reduce((x, b) => x + (b.green || 0), 0), tr = B.reduce((x, b) => x + (b.roasted || 0), 0);
  const Lt = S.lotId ? DB.lots.find(x => x.id === S.lotId) : null, canAdv = Lt && curStage(Lt) === 'roast';
  const last = B[B.length - 1], T = last ? tipsFor(last, S.gear, S.level) : [];
  return `<div class="rz-head"><span style="width:36px"></span><span class="rz-title">Torra concluída</span><span style="width:36px"></span></div>
  <div class="rz-body">
    <h2>Café <em>torrado</em></h2>
    <p class="lead">${B.length === 1 ? '1 batelada' : `${B.length} bateladas`} · ${GEAR[S.gear].l} · ${LEVELS[S.level].l}${tr ? ` · ${tg} g → ${tr} g` : ''}</p>
    <div class="card">${B.map(batchCard).join('')}</div>
    ${T.length ? `<div class="lbl">Última batelada</div><div class="card rz-tips">${T.map(([k, x]) => `<p class="${k}"><i></i>${x}</p>`).join('')}</div>` : ''}
    <div class="lbl">Agora</div>
    <ul class="rz-list"><li>Guarde em pote com tampa, depois de frio</li><li>Espere de 2 a 5 dias antes de moer</li><li>Depois de provar, avalie a torra na aba Torra</li></ul>
  </div>
  <div class="rz-foot">${canAdv ? `<button class="btn" data-r="advlot">Concluir e avançar o lote</button><button class="rz-link" data-r="close">Só concluir</button>` : `<button class="btn" data-r="close">Concluir</button>`}</div>`;
}

/* =========================================================
   Ações
   ========================================================= */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  const a = b.dataset.r, L = LIVE();
  switch (a) {
    case 'new': startPrep(); break;
    case 'newlot': startPrep(b.dataset.lot || null); break;
    case 'quit': {
      const live = L && ['live', 'cool', 'weigh'].includes(L.step) && L.t0;
      if (live && !confirm('Cancelar esta batelada? O que já foi salvo continua salvo.')) break;
      const S = L && L.sid ? sess(L.sid) : null;
      if (S && !S.batches.length) DB.sessions = DB.sessions.filter(x => x !== S);
      DB.live = null; save(); closeRZ(); break; }
    case 'close': DB.live = null; save(); closeRZ(); break;
    case 'togear': L.step = 'gear'; save(); renderRZ(); break;
    case 'toprep': L.step = 'prep'; save(); renderRZ(); break;
    case 'gear': L.gear = b.dataset.g; save(); renderRZ(); break;
    case 'gearok': {
      const mine = $('#rzMine'); if (!DB.gear || (mine && mine.checked)) DB.gear = L.gear;
      L.step = 'prep'; save(); renderRZ(); break; }
    case 'level': L.level = b.dataset.l; DB.lastLevel = L.level; save(); renderRZ(); break;
    case 'chk': L.checks[b.dataset.i] = !L.checks[b.dataset.i]; save(); renderRZ(); break;
    case 'usemic':
      L.useMic = !L.useMic; DB.useMic = L.useMic; save();
      if (L.useMic && L.step === 'live') { await micStart(); }
      if (!L.useMic) micStop();
      renderRZ(); break;
    case 'micretry': MIC.err = null; await micStart(); renderRZ(); break;
    case 'sens': micSens({ low:'med', med:'high', high:'low' }[MIC.sens]); renderRZ(); break;
    case 'begin': {
      const total = parseFloat(L.green), p = plan(total, L.gear); if (!p) break;
      const lotOk = $('#rzLot') ? $('#rzLot').checked : false;
      const S = { id:uid(), date:today(), created:now(), lotId:lotOk ? L.lotId : null, gear:L.gear, level:L.level, green:total, plan:p, batches:[], tasting:null };
      DB.sessions.push(S);
      Object.assign(L, { sid:S.id, bi:0, step:'live', batchG:p.per, t0:null, fc:null, sc:null });
      save(); audio(); if (L.useMic) await micStart(); wakeOn(); renderRZ(); break; }
    case 'go': audio(); L.t0 = now(); L.popN = 0; MIC.pops = []; save(); wakeOn(); if (L.useMic && !MIC.on) await micStart(); renderRZ(); break;
    case 'fc': mark('fc', false); break;
    case 'sc': mark('sc', false); break;
    case 'unmark': unmark(b.dataset.k); $('#rzFlash')?.classList.remove('on'); break;
    case 'drop': L.drop = el(); L.step = 'cool'; L.coolT0 = now(); L.coolBeeped = false; save(); beep(1, 880); renderRZ(); break;
    case 'cooled': L.step = 'weigh'; save(); micStop(); renderRZ(); setTimeout(() => $('#rzRG')?.focus(), 250); break;
    case 'savebatch': {
      const S = sess(L.sid), g = parseFloat($('#rzBG')?.value) || L.batchG, r = b.dataset.skip ? null : parseFloat($('#rzRG')?.value);
      if (!b.dataset.skip && !(r > 0)) { toast('Digite o peso torrado'); break; }
      S.batches.push({ green:g, roasted:r || null, loss:r ? (g - r) / g * 100 : null, fc:L.fc, sc:L.sc, drop:L.drop, fcAuto:!!L.fcAuto, note:$('#rzNote')?.value.trim() || '' });
      L.step = S.batches.length < S.plan.n ? 'next' : 'done'; save(); renderRZ(); break; }
    case 'nextbatch': Object.assign(L, { bi:L.bi + 1, step:'live', t0:null, fc:null, sc:null, drop:null, fcAuto:false, scAuto:false, stopBeeped:false, preBeeped:false, scWarn:false, stirN:0, popN:0 }); save(); if (L.useMic) await micStart(); renderRZ(); break;
    case 'finish': L.step = 'done'; save(); renderRZ(); break;
    case 'advlot': {
      const S = sess(L.sid), Lt = DB.lots.find(x => x.id === S.lotId);
      if (Lt) { Lt.log.push({ k:'degas', d:today() }); }
      DB.live = null; save(); closeRZ(); toast('Lote em desgaseificação'); break; }
    case 'gearpick': gearSheet(); break;
    case 'setgear': DB.gear = b.dataset.g; save(); closeSheet(); toast(`Meu equipamento: ${GEAR[DB.gear].l}`); break;
    case 'session': sessionSheet(b.dataset.id); break;
    case 'taste': tasteSheet(b.dataset.id); break;
    case 'tv': { const T = TD(); T[b.dataset.k] = +b.dataset.v; tasteSheet(TID, true); break; }
    case 'tbrew': TD().brew = b.dataset.v; tasteSheet(TID, true); break;
    case 'tnote': { const T = TD(); T.notes = T.notes || []; const v = b.dataset.v; T.notes = T.notes.includes(v) ? T.notes.filter(x => x !== v) : [...T.notes, v]; tasteSheet(TID, true); break; }
    case 'tsave': {
      const S = sess(TID), T = TD(); T.text = $('#tText')?.value.trim() || ''; T.date = today();
      if (!T.geral) { toast('Dê uma nota geral'); break; }
      S.tasting = T; TDRAFT = null; save(); closeSheet(); toast('Avaliação salva'); break; }
    case 'delsession': if (confirm('Apagar esta torra e a avaliação?')) { DB.sessions = DB.sessions.filter(x => x.id !== b.dataset.id); save(); closeSheet(); } break;
  }
});
document.addEventListener('input', e => {
  const L = LIVE();
  if (e.target.id === 'rzGreen' && L) { L.green = e.target.value; save(); const p = plan(parseFloat(L.green), L.gear); $('#rzPlan').textContent = planText(p, L.gear); const bt = $('[data-r=begin]'); if (bt) bt.disabled = !p; }
  if ((e.target.id === 'rzRG' || e.target.id === 'rzBG') && L) {
    const g = parseFloat($('#rzBG').value), r = parseFloat($('#rzRG').value), out = $('#rzLoss');
    if (g > 0 && r > 0 && r < g) { const loss = (g - r) / g * 100, [lo, hi] = LEVELS[L.level].loss; out.innerHTML = `Perda de <b>${loss.toFixed(1)}%</b> · ${loss < lo - 1 ? 'abaixo do esperado: pode ter ficado clara' : loss > hi + 1 ? 'acima do esperado: ficou mais escura' : 'dentro do esperado'}`; }
    else out.innerHTML = '&nbsp;';
  }
});

/* =========================================================
   Aba Torra
   ========================================================= */
function renderTorra() {
  const v = $('#v-torra'); if (!v) return; rdb();
  const g = DB.gear, S = [...DB.sessions].sort((a, b) => b.created - a.created);
  const pend = S.filter(s => !s.tasting && s.batches.length && diff(s.date, today()) >= 2);
  let h = `<div class="sec-title">Meu equipamento</div>`;
  h += g ? `<button class="card rz-gear" data-r="gearpick"><span><b>${GEAR[g].l}</b><small>${gearLine(g)}</small></span><span class="go">Trocar</span></button>`
         : `<button class="card rz-gear" data-r="gearpick"><span><b>Nenhum ainda</b><small>Escolha o que você usa para torrar</small></span><span class="go">Escolher</span></button>`;
  h += `<button class="btn" data-r="new" style="margin-top:12px">Nova torra</button>`;
  if (pend.length) h += `<div class="sec-title">Hora de provar</div>` + pend.slice(0, 3).map(s => `<button class="card rz-gear" data-r="taste" data-id="${s.id}"><span><b>Torra de ${fmtShort(s.date)}</b><small>${LEVELS[s.level].l} · ${diff(s.date, today())} dias de descanso</small></span><span class="go">Avaliar</span></button>`).join('');
  h += `<div class="sec-title">Torras<small>${S.length || ''}</small></div>`;
  h += S.length ? `<div class="card" style="padding:2px 16px">${S.map(s => {
    const B = s.batches, loss = avg(B.filter(b => b.loss != null).map(b => b.loss)), fc = avg(B.filter(b => b.fc != null).map(b => b.fc));
    const Lt = s.lotId && DB.lots.find(x => x.id === s.lotId);
    return `<button class="lotrow" data-r="session" data-id="${s.id}"><i class="bean" style="background:${LEVELS[s.level].color}"></i>
      <span class="nm">${fmtShort(s.date)} · ${LEVELS[s.level].l}<small>${GEAR[s.gear].l} · ${B.length}× ${loss != null ? `· perda ${loss.toFixed(1)}%` : ''}${fc != null ? ` · 1º crack ${mmss(fc)}` : ''}${Lt ? ` · ${esc(Lt.name)}` : ''}</small></span>
      ${s.tasting ? `<span class="score">${s.tasting.geral}<small>/5</small></span>` : `<span class="on">${B.length ? 'avaliar' : 'vazia'}</span>`}</button>`;
  }).join('')}</div>` : `<div class="card"><p class="empty" style="padding:2px 0">Nenhuma torra ainda. Elas aparecem aqui com tempos, perda e avaliação.</p></div>`;
  h += `<div class="sec-title">Pontos de torra</div>` + Object.values(LEVELS).map(v2 => `<div class="card rz-lvl"><i class="bean big" style="background:${v2.color}"></i><div><b>${v2.l}</b><p>${v2.d}</p><p class="spec">Parar ${v2.when} · perda de ${v2.loss[0]}–${v2.loss[1]}%</p></div></div>`).join('');
  h += `<div class="sec-title">Como a torra avança</div><div class="card" style="padding:4px 16px">${['dry', 'maillard', 'prefc', 'dev', 'presc'].map(k => `<div class="rz-row tall"><i class="bean" style="background:${PH[k].c}"></i><span><b>${PH[k].l}</b><small>${PH[k].cor} · ${PH[k].cheiro} · ${PH[k].som}</small></span></div>`).join('')}</div>`;
  v.innerHTML = h;
}

function gearSheet() {
  sheetCtx = [gearSheet];
  openSheet(`<div class="shead"><div><h3>Meu equipamento</h3><p class="lead">Fica como padrão nas próximas torras.</p></div>${closeBtn}</div>
    ${GEAR_ORDER.map(k => `<button class="opt ${DB.gear === k ? 'on' : ''}" data-r="setgear" data-g="${k}"><span class="ra"></span><span><b>${GEAR[k].l}</b><p>${GEAR[k].d}</p><p class="spec">${gearLine(k)}</p></span></button>`).join('')}`);
}
function sessionSheet(id) {
  sheetCtx = [sessionSheet, id];
  const S = sess(id); if (!S) return closeSheet();
  const Lt = S.lotId && DB.lots.find(x => x.id === S.lotId), T = S.tasting, last = S.batches[S.batches.length - 1];
  openSheet(`<div class="shead"><div><h3>Torra de ${fmtShort(S.date)}</h3><span class="chip" style="--c:${LEVELS[S.level].color}"><i class="sw"></i>${LEVELS[S.level].l}</span><span class="chip" style="--c:var(--ink3)">${GEAR[S.gear].l}</span>${Lt ? `<span class="chip" style="--c:var(--ink3)">${esc(Lt.name)}</span>` : ''}</div>${closeBtn}</div>
    <div class="lbl">Bateladas</div>
    <div class="card">${S.batches.length ? S.batches.map(batchCard).join('') : '<p class="empty">Nenhuma batelada salva.</p>'}</div>
    ${S.batches.filter(b => b.note).map((b, i) => `<p class="hint" style="text-align:left">Nota: ${esc(b.note)}</p>`).join('')}
    ${last ? `<div class="lbl">Para a próxima torra</div><div class="card rz-tips">${tipsFor(last, S.gear, S.level).map(([k, x]) => `<p class="${k}"><i></i>${x}</p>`).join('')}</div>` : ''}
    <div class="lbl">Avaliação</div>
    ${T ? tasteView(T) + `<button class="btn ghost" data-r="taste" data-id="${id}">Editar avaliação</button>` : `<button class="btn" data-r="taste" data-id="${id}">Avaliar esta torra</button>`}
    <button class="btn ghost danger" data-r="delsession" data-id="${id}" style="margin-top:22px">Apagar torra</button>`);
}
function tasteView(T) {
  return `<div class="card">
    <div class="tv-top"><span class="score big">${T.geral}<small>/5</small></span><span>${T.brew || ''}${T.date ? `<small>${fmtShort(T.date)}</small>` : ''}</span></div>
    ${TASTE.map(([k, l]) => T[k] ? `<div class="tv-row"><span>${l}</span><span class="tv-bar"><i style="width:${T[k] / 5 * 100}%"></i></span><span class="n">${T[k]}</span></div>` : '').join('')}
    ${T.notes && T.notes.length ? `<div class="tv-chips">${T.notes.map(n => `<span>${n}</span>`).join('')}</div>` : ''}
    ${T.text ? `<p class="tv-text">${esc(T.text)}</p>` : ''}</div>`;
}
let TID = null, TDRAFT = null;
const TD = () => TDRAFT;
function tasteSheet(id, keep) {
  const S = sess(id); if (!S) return;
  if (!keep || TID !== id) { TID = id; TDRAFT = JSON.parse(JSON.stringify(S.tasting || { notes:[] })); }
  else { const t = $('#tText'); if (t) TDRAFT.text = t.value; }
  const T = TDRAFT, y = $('#sheet') ? $('#sheet').scrollTop : 0;
  sheetCtx = [tasteSheet, id, true];
  const dots = (k, v) => `<span class="tdots">${[1, 2, 3, 4, 5].map(n => `<button class="${v >= n ? 'on' : ''}" data-r="tv" data-k="${k}" data-v="${n}" aria-label="${n}"></button>`).join('')}</span>`;
  openSheet(`<div class="shead"><div><h3>Avaliar a torra</h3><p class="lead">${fmtShort(S.date)} · ${LEVELS[S.level].l} · ${GEAR[S.gear].l}</p></div>${closeBtn}</div>
    <div class="lbl">Preparo</div>
    <div class="tv-chips pick">${BREW.map(b => `<button class="${T.brew === b ? 'on' : ''}" data-r="tbrew" data-v="${b}">${b}</button>`).join('')}</div>
    <div class="lbl">Atributos</div>
    <div class="card" style="padding:4px 16px">${TASTE.map(([k, l, lo, hi]) => `<div class="tattr"><span><b>${l}</b><small>${lo} → ${hi}</small></span>${dots(k, T[k] || 0)}</div>`).join('')}</div>
    <div class="lbl">Sabores</div>
    <div class="tv-chips pick">${NOTES.map(n => `<button class="${(T.notes || []).includes(n) ? 'on' : ''}" data-r="tnote" data-v="${n}">${n}</button>`).join('')}</div>
    <div class="lbl">Nota geral</div>
    <div class="card" style="padding:4px 16px"><div class="tattr"><span><b>Gostei</b><small>1 → 5</small></span>${dots('geral', T.geral || 0)}</div></div>
    <div class="lbl">Comentário</div>
    <textarea id="tText" placeholder="O que mudaria na próxima torra?">${esc(T.text || '')}</textarea>
    <button class="btn" data-r="tsave">Salvar avaliação</button>`);
  if (keep) $('#sheet').scrollTop = y;
}

/* ---------- retomar uma torra em andamento ---------- */
(function resume() {
  rdb(); MIC.sens = DB.micSens || 'med';
  const L = LIVE();
  if (L && L.step) openRZ();
})();
renderTorra();
