'use strict';
/* KNIGHT · mesa digital — motor de turno, folhas marcáveis e salvamento local. */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SAVE_KEY = 'knight.save.v1';
const HIST_KEY = 'knight.history.v1';
const MAX = { g: 6, n: 6, v: 6, gold: 12, dipP: 5, dipE: 5, inf: 33 };
const PHASES = [_T`Troca de cartas`, _T`Recursos`, _T`Usar recursos`, _T`Ação`, _T`Consequências`];
const EV = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
const CH = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
const SC = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));

/* ---------- RNG com semente (para o modo simultâneo) ---------- */
function hashSeed(str) {
  let h1 = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h1 = Math.imul(h1 ^ str.charCodeAt(i), 3432918353); h1 = (h1 << 13) | (h1 >>> 19); }
  return (h1 >>> 0) || 1;
}
function rnd() { // mulberry32, estado guardado na partida
  let t = (S.rng = (S.rng + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

/* ---------- Estado ---------- */
let S = null;           // partida atual
let undoStack = [];
let ui = { crisp: (() => { try { return localStorage.getItem('knight.crisp') !== '0'; } catch { return true; } })(), showAvail: (() => { try { return localStorage.getItem('knight.avail') !== '0'; } catch { return true; } })(), tab: 'table', pick: { char: null, scen: null }, select: null, rulesView: 'summary', rulesPage: 0 };

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { toast(_T`Não foi possível salvar no aparelho.`); } }
function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; } }
function history() { try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch { return []; } }

function commit(fn, label) {
  undoStack.push(JSON.stringify(S));
  if (undoStack.length > 80) undoStack.shift();
  fn();
  if (label) log(label);
  save();
  render();
}
function undo() {
  if (!undoStack.length) return toast(_T`Nada para desfazer.`);
  S = JSON.parse(undoStack.pop());
  save(); render(); toast(_T`Desfeito.`);
}
function log(msg) { S.log.unshift(`T${S.turn} · ${msg}`); if (S.log.length > 200) S.log.pop(); }

function newGame(charId, scenId, advanced, seedText) {
  const seedStr = (seedText || '').trim().toUpperCase();
  const c = CH[charId], sc = SC[scenId];
  S = {
    v: 1, created: Date.now(), charId, scenId, advanced, seed: seedStr || null,
    rng: hashSeed(seedStr || String(Math.random()) + Date.now()),
    turn: 1, phase: 0, choice: null, actionFrom: null, finished: null,
    res: { g: c.start.g, n: c.start.n, v: c.start.v, gold: c.start.gold, cp: 0, inf: 0, vp: 0, dipP: 0, dipE: 0 },
    vpStages: {}, tracks: { 1: 0, 2: 0, 3: 0 }, goalDone: {},
    deck: [], row: [], goal: null, marks: { court: [], char: [], scen: [] }, size: { court: 1, char: 1, scen: 1 },
    log: [], court: courtInit(), gainsTaken: false, charSt: { rew: [false, false], thr: [false, false, false], rows: [false, false, false] },
  };
  if (advanced) {
    const m = sc.advanced.join(' ').match(/Diplomacia inimiga começa em (\d)/);
    if (m) S.res.dipE = +m[1];
  }
  S.goal = GOALS[Math.floor(rnd() * GOALS.length)];
  dealRound();
  undoStack = [];
  log(_T`Nova partida: ${c.name} em ${sc.name}${advanced ? _T` (avançado)` : ''}${S.seed ? _T` · código ${S.seed}` : ''}`);
  save();
}

function dealRound() {
  S.deck = shuffle(EVENTS.map((e) => e.id));
  S.row = S.deck.splice(0, 6).map((id, i) => ({ id, up: i === 0 || i === 5, side: null }));
}

const idx = () => (S.turn - 1) % 6;
const round = () => (S.turn <= 6 ? 1 : 2);
const cur = () => S.row[idx()];
const actionCard = () => (S.actionFrom != null ? S.row[S.actionFrom] : cur());

/* ---------- Recursos ---------- */
function gain(key, n, notes) {
  // Recurso acima do limite vira Ouro; Ouro acima do limite vira 5 PV.
  if (n <= 0) return;
  if (key === 'g' || key === 'n' || key === 'v') {
    const room = MAX[key] - S.res[key];
    const take = Math.min(room, n);
    S.res[key] += take;
    if (n > take) { notes && notes.push(_T`${n - take} ${RES[key].name} acima do limite → Ouro`); gain('gold', n - take, notes); }
  } else if (key === 'gold') {
    const room = MAX.gold - S.res.gold;
    const take = Math.min(room, n);
    S.res.gold += take;
    if (n > take) { notes && notes.push(_T`${n - take} Ouro acima do limite → ${(n - take) * 5} PV`); S.res.vp += (n - take) * 5; }
  } else if (MAX[key] != null) {
    S.res[key] = Math.min(MAX[key], S.res[key] + n);
  } else S.res[key] += n;
}
function spendGold(n, what) {
  if (S.res.gold < n) { toast(_T`Você precisa de ${n} Ouro para ${what}.`); return false; }
  S.res.gold -= n; return true;
}
function resList(r) {
  return Object.entries(r).map(([k, n]) => `<span class="ri"><img src="${RES[k].icon}" alt="">${n}</span>`).join('');
}

/* ---------- Ações de turno ---------- */
function chooseSide(side) {
  if (S.phase > 1 || S.choice) return;
  const card = cur(); const ev = EV[card.id][side];
  commit(() => {
    const notes = [];
    Object.entries(ev.r).forEach(([k, n]) => gain(k, n, notes));
    S.choice = side; card.side = side; card.up = true; S.phase = 2;
    log(_T`Escolheu o lado ${side === 'L' ? _T`esquerdo` : _T`direito`}: ${Object.entries(ev.r).map(([k, n]) => `+${n} ${RES[k].name}`).join(', ')}`);
    notes.forEach((t) => log(t));
    if (notes.length) setTimeout(() => toast(notes.join(' · ')), 50);
  });
}
function nextPhase() {
  if (S.phase === 0) { commit(() => { S.phase = 1; }); return; }
  if (S.phase === 1) return toast(_T`Escolha um lado da carta atual.`);
  if (S.phase === 2) { commit(() => { S.phase = 3; }, _T`Ativou: ${actionNames()}`); return; }
  if (S.phase === 3) {
    const pend = infPending().filter(({ ri }) => ['L', 'R'].some((sd) => { const n = infNext(ri, sd); return n && n.ok; }));
    if (pend.length && !ui.skipInfOk) {
      return modal(_T`<h2>Ação do Cenário pendente</h2><p>${pend.map(({ r }) => ACT_NAMES[r.act]).join(' e ')} foi ativada e você ainda não escolheu o lado no Cenário.</p>
        <div class="menu"><button class="btn primary" data-close>Voltar e escolher</button><button class="btn" data-skipinf>Seguir sem pegar</button></div>`, () => {
        $('[data-skipinf]').onclick = () => { closeModal(); ui.skipInfOk = true; nextPhase(); ui.skipInfOk = false; };
      });
    }
    commit(() => { const t = EV[cur().id][S.choice].t; S.tracks[t]++; S.phase = 4; }, _T`Consequências: trilha ${EV[cur().id][S.choice].t}`);
    return;
  }
  if (S.phase === 4) endTurn();
}
function actionNames() {
  const ac = actionCard(); const side = S.choice;
  return EV[ac.id][side] ? EV[ac.id][side].a.map((a) => ACTIONS[a].name).join(' + ') : '';
}
function endTurn(force) {
  const lostCp = S.res.cp;
  if (!force && SET.warnEnd && !ui.consOk && consPending()) {
    return modal(_T`<h2>Consequências não resolvidas</h2><p>Ainda falta decidir ${consPending() > 1 ? _T`as consequências` : _T`uma consequência`} deste turno.</p>
      <div class="menu"><button class="btn primary" data-close>Voltar e resolver</button><button class="btn" data-consok>Encerrar mesmo assim</button></div>`, () => {
      $('[data-consok]').onclick = () => { closeModal(); ui.consOk = true; endTurn(); ui.consOk = false; };
    });
  }
  if (lostCp && !force && SET.warnEnd) {
    return modal(_T`<h2>⚑ ${lostCp} Comando sem usar</h2><p>Comando não acumula: se encerrar agora, ${lostCp > 1 ? _T`esses pontos se perdem` : _T`esse ponto se perde`}.</p>
      <div class="menu"><button class="btn primary" data-usecp>Usar no mapa</button><button class="btn danger" data-lose>Encerrar o turno mesmo assim</button></div>`, () => {
      $('[data-usecp]').onclick = () => { closeModal(); ui.tab = 'scen'; ui.scenView = 'map'; render(); };
      $('[data-lose]').onclick = () => { closeModal(); endTurn(true); };
    });
  }
  const t = S.turn;
  commit(() => {
    if (lostCp) log(_T`${lostCp} ponto(s) de Comando não usados foram perdidos`);
    S.res.cp = 0;
    if (S.place) log(_T`${S.place} colocação(ões) de unidade não usadas foram perdidas`); S.place = 0;
    if (t % 3 === 0) S.vpStages[t] = S.res.vp;
    S.turn++; S.phase = 0; S.choice = null; S.actionFrom = null; S.gainsTaken = false; ui.preview = null; if (S.scen) S.scen.infTurn = {};
    if (S.turn === 7) { dealRound(); log(_T`Rodada 2: seis novas cartas de evento`); }
    if (S.turn <= 12) cur().up = true;
  }, _T`Fim do turno ${t}`);
  if (t === 3 || t === 6 || t === 9) evalGoal(t / 3);
  else if (t === 12) showEnd();
}

/* ---------- Ações com Ouro sobre as cartas ---------- */
function startSelect(kind) {
  if (S.turn > 12) return;
  const info = {
    reveal: _T`Toque numa carta virada para baixo para revelá-la (1 Ouro).`,
    swap: _T`Toque em duas cartas ainda não usadas para trocar de posição (2 Ouro).`,
    replace: _T`Toque numa carta ainda não usada para trocá-la por uma carta aleatória do baralho (2 Ouro).`,
    adjacent: _T`Toque numa carta revelada vizinha da carta atual para usar a ação dela (6 Ouro).`,
  }[kind];
  ui.select = { kind, picked: [] , info };
  render();
}
function unused(i) { return i > idx() || (i === idx() && !S.choice); }
function pickCard(i) {
  const sel = ui.select; if (!sel) return;
  const card = S.row[i];
  if (sel.kind === 'reveal') {
    if (card.up) return toast(_T`Essa carta já está revelada.`);
    commit(() => { if (spendGold(1, _T`revelar`)) { card.up = true; log(_T`Revelou a carta ${i + 1} (1 Ouro)`); } });
    ui.select = null; render();
  } else if (sel.kind === 'swap') {
    if (!unused(i)) return toast(_T`Só cartas ainda não usadas podem trocar de lugar.`);
    if (sel.picked.includes(i)) { sel.picked = sel.picked.filter((x) => x !== i); render(); return; }
    sel.picked.push(i);
    if (sel.picked.length === 2) {
      const [a, b] = sel.picked;
      commit(() => { if (spendGold(2, _T`trocar`)) { [S.row[a], S.row[b]] = [S.row[b], S.row[a]]; if (idx() === a || idx() === b) cur().up = true; log(_T`Trocou as cartas ${a + 1} e ${b + 1} de posição (2 Ouro)`); } });
      ui.select = null;
    }
    render();
  } else if (sel.kind === 'replace') {
    if (!unused(i)) return toast(_T`Só cartas ainda não usadas podem ser substituídas.`);
    if (!S.deck.length) return toast(_T`O baralho está vazio.`);
    commit(() => {
      if (!spendGold(2, _T`substituir`)) return;
      const old = card.id; const j = Math.floor(rnd() * S.deck.length);
      const nid = S.deck.splice(j, 1)[0]; S.deck.push(old);
      S.row[i] = { id: nid, up: card.up || i === idx(), side: null };
      log(_T`Substituiu a carta ${i + 1} por uma do baralho (2 Ouro)`);
    });
    ui.select = null; render();
  } else if (sel.kind === 'adjacent') {
    if (Math.abs(i - idx()) !== 1) return toast(_T`Escolha uma carta vizinha da carta atual.`);
    if (!card.up) return toast(_T`Revele a carta antes (1 Ouro).`);
    if (!S.choice) return toast(_T`Escolha primeiro o lado da carta atual: a ação usada é a do mesmo lado.`);
    commit(() => { if (spendGold(6, _T`usar a ação vizinha`)) { S.actionFrom = i; log(_T`Usará a ação da carta ${i + 1} (6 Ouro)`); } });
    ui.select = null; render();
  }
}

/* ---------- Render geral ---------- */
function render() {
  if (!S) return;
  $('#setup').hidden = true; $('#game').hidden = false;
  const sc = SC[S.scenId], c = CH[S.charId];
  $('#tb-title').textContent = S.turn > 12 ? _T`Fim de jogo` : _T`Turno ${S.turn}/12 · Rodada ${round()}`;
  $('#tb-sub').textContent = `${c.name} · ${sc.name}${S.advanced ? _T` · avançado` : ''}${S.seed ? ' · ' + S.seed : ''}`;
  renderHUD();
  $$('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === ui.tab));
  if (S.turn <= 12) {
    const cs = courtAvailSummary(); const ca = cs.segs + cs.rooms + cs.chains, ch = charAvailable().length;
    $('[data-tab="court"]').dataset.badge = ca || ''; $('[data-tab="char"]').dataset.badge = ch || ''; $('[data-tab="scen"]').dataset.badge = (goldAvailCount() + batAvailCount() + (S.res.cp ? 1 : 0)) || '';
  } else { $('[data-tab="court"]').dataset.badge = ''; $('[data-tab="char"]').dataset.badge = ''; $('[data-tab="scen"]').dataset.badge = ''; }
  $$('.tab-page').forEach((p) => (p.hidden = p.id !== 'tab-' + ui.tab));
  const side = sideMapOn(); $('#game').classList.toggle('with-side', side); $('#side-map').hidden = !side;
  if (side) renderMapView($('#side-map'));
  if (ui.tab === 'table') renderTable();
  else if (ui.tab === 'rules') renderRules();
  else if (ui.tab === 'scen') renderScen();
  else renderSheet(ui.tab);
  wlCheck();
  tutRender();
}

function setTopH() { const t = $('.topbar'); if (t) document.documentElement.style.setProperty('--top-h', t.offsetHeight + 'px'); }
window.addEventListener('resize', setTopH);
function renderHUD() {
  setTopH();
  const r = S.res; const sc = SC[S.scenId];
  const chip = (k, label, val, max, icon, cls = '') =>
    `<button class="chip ${cls}" data-res="${k}" title="${label}">${icon}<span class="val"><b>${val}</b>${max != null ? `<small>/${max}</small>` : ''}</span><span class="lbl">${label}</span>${goalChipBadge(k)}</button>`;
  const img = (k) => `<img src="${RES[k].icon}" alt="">`;
  $('#hud').innerHTML =
    chip('g', _T`Glória`, r.g, 6, img('g'), r.g >= 6 ? 'full' : '') +
    chip('n', _T`Nobreza`, r.n, 6, img('n'), r.n >= 6 ? 'full' : '') +
    chip('v', _T`Valor`, r.v, 6, img('v'), r.v >= 6 ? 'full' : '') +
    chip('gold', _T`Ouro`, r.gold, 12, img('gold'), r.gold >= 12 ? 'full' : '') +
    chip('cp', _T`Comando`, r.cp, null, '<i class="sym">⚑</i>', r.cp ? 'hot' : '') +
    chip('inf', _T`Influência`, r.inf, 33, '<i class="sym hex">⬡</i>') +
    chip('vp', _T`PV`, r.vp, null, '<i class="sym">★</i>') +
    chip('dipP', _T`Diplomacia`, r.dipP, 5, '<i class="sym up">︽</i>') +
    chip('dipE', _T`Dipl. inimiga`, r.dipE, 5, '<i class="sym down">︾</i>', r.dipE >= 4 ? 'danger' : '');
}

/* ---------- Mesa ---------- */
function cardImg(card, i, mini) {
  if (!card.up) return _T`<img class="cimg" src="assets/events/back.webp" alt="Carta virada">`;
  return _T`<img class="cimg" src="assets/events/${card.id}.webp" alt="Carta de evento">`;
}
function renderTable() {
  const el = $('#tab-table');
  if (S.turn > 12) {
    el.innerHTML = _T`<div class="panel center"><h2>Partida encerrada</h2><p>${S.finished ? esc(finalText()) : _T`Calcule a pontuação final.`}</p>
      <button class="btn primary" id="t-end">${S.finished ? _T`Ver resultado` : _T`Pontuação final`}</button> <button class="btn" id="t-new">Nova partida</button></div>${logHtml()}`;
    $('#t-end').onclick = showEnd; $('#t-new').onclick = goSetup; return;
  }
  const card = cur(); const ev = EV[card.id];
  const sideInfo = (s) => {
    const d = ev[s];
    return _T`<div class="side-info">${resList(d.r)}<span class="ri acts">${d.a.map((a) => `<img src="${ACTIONS[a].icon}" alt="${ACTIONS[a].name}">`).join('')}</span><span class="trk">trilha ${d.t}</span></div>`;
  };
  const stepper = PHASES.map((p, i) => `<li class="${i === S.phase ? 'on' : i < S.phase ? 'done' : ''}"><span>${i}</span>${p}</li>`).join('');

  let phaseBox = '';
  if (S.phase <= 1) phaseBox = (S.turn === 1 && !S.choice ? setupHtml() : '') + (ui.preview ? sidePreviewHtml(ui.preview) : '');
  if (S.phase <= 1 && !ui.preview) phaseBox +=
    _T`<p><strong>Toque no lado esquerdo ou direito da carta</strong> para ver a prévia: recursos, o que cada ação rende e a consequência. Você pode alternar entre os lados à vontade; nada é aplicado até confirmar.</p>
       <p class="muted small">Antes de confirmar, dá para revelar, trocar ou substituir cartas com Ouro (botões abaixo da fileira).</p>`;
  else if (S.phase === 2) phaseBox = availBoxHtml() + _T`<p>Gaste recursos e Ouro no <a href="#" data-goto="court">Corte</a>, no <a href="#" data-goto="char">Personagem</a> e no <a href="#" data-goto="scen">Cenário</a> (neste, desconte pelo painel). O que você ganhar na ação só poderá ser usado no próximo turno.</p>
      <button class="btn primary" data-next>Ativar a ação →</button>`;
  else if (S.phase === 3) {
    const ac = actionCard(); const acts = EV[ac.id][S.choice].a;
    const total = {};
    const rows = acts.map((a) => {
      const g = activationGains(a);
      for (const [k, n] of Object.entries(g.out)) total[k] = (total[k] || 0) + n;
      const got = Object.keys(g.out).length ? resList(g.out) : _T`<span class="muted">nada desbloqueado ainda</span>`;
      const kn = a === 'king' ? kingNext() : null;
      const kRow = a === 'king' ? _T`<div class="gains">Cenário: ${kn ? (kn.ok ? _T`coluna ${kn.k + 1} → ${kingColText(kn.col)}` : _T`<span class="muted">coluna ${kn.k + 1} exige Rei ${kn.k} (sem efeito agora)</span>`) : _T`<span class="muted">todas as colunas usadas</span>`}</div>` : '';
      const iRows = infRows().map((r, ri) => (r.act === a ? infChoiceHtml(ri) : '')).join('');
      return _T`<div class="act"><img src="${ACTIONS[a].icon}" alt=""><div><strong>${ACTIONS[a].name}</strong>${g.src.length ? ` <span class="muted small">+ ${g.src.join(', ')}</span>` : ''}
        <div class="gains">Corte: ${got}</div>${kRow}${iRows}<p>${ACTIONS[a].hint}</p></div></div>`;
    }).join('') + activatedActs(acts).filter((a) => !acts.includes(a)).map((a) => {
      const iRows = infRows().map((r, ri) => (r.act === a ? infChoiceHtml(ri) : '')).join('');
      return iRows ? _T`<div class="act"><img src="${ACTIONS[a].icon}" alt=""><div><strong>${ACTIONS[a].name}</strong> <span class="muted small">(ativada pela corrente)</span>${iRows}</div></div>` : '';
    }).join('');
    const pv = CHAR_SKILLS[S.charId].priv; const privOn = acts.includes(pv.act) && (pv.plus || pv.choice);
    if (privOn && pv.plus) for (const [k, n] of Object.entries(pv.plus)) total[k] = (total[k] || 0) + n;
    const privRow = privOn ? _T`<p class="priv-note">Privilégio de ${CH[S.charId].name}: ${pv.plus ? resList(pv.plus) + _T` incluído abaixo` : _T`+1 ${pv.choice.map((k) => RES[k].name).join(_T` ou `)} (você escolhe ao receber)`}</p>` : '';
    const kOn = acts.includes('king') && kingNext() && kingNext().ok;
    const hasGains = Object.keys(total).length || privOn || kOn;
    phaseBox = _T`${S.actionFrom != null ? _T`<p class="note">Usando a ação da carta ${S.actionFrom + 1} (vizinha).</p>` : ''}
      ${rows}${privRow}
      ${hasGains ? (S.gainsTaken ? _T`<p class="ok">✓ Ganhos recebidos.</p>` : _T`<button class="btn primary" data-gains>Receber ganhos: ${resList(total)}${pv.choice && privOn ? _T` + 1 à escolha` : ''}${kOn ? _T` + Rei's action do Cenário` : ''}</button>`) : ''}

      <p class="muted small">Comando ganho agora deve ser usado neste turno.</p>
      <button class="btn primary" data-next>Consequências →</button>`;
  } else if (S.phase === 4) {
    const t = ev[S.choice].t; const n = S.tracks[t];
    const auto = consEls(t).length > 0; if (auto) consCur();
    phaseBox = _T`<div class="conseq"><span class="badge-t">${t}</span><div><strong>Trilha ${t} · ${n}ª vez nesta partida</strong>
      <p>${n === 1 ? _T`Primeira vez: só o primeiro símbolo.` : _T`Primeiro a consequência possível (pague o custo para evitá-la), depois a inevitável.`}</p></div></div>
      ${consStripHtml(t, !auto)}
      ${auto ? consBoxHtml() : _T`<p class="muted small">Toque nos símbolos da faixa para riscá-los (toque de novo para apagar).</p>`}
      <button class="btn small" data-goto="scen" data-sv2="map">Abrir o mapa</button>
      <button class="btn primary" data-next>Encerrar o turno ${S.turn}${S.turn % 3 === 0 && S.turn < 12 ? _T` e avaliar o objetivo` : S.turn === 12 ? _T` e terminar a partida` : ''} →</button>`;
  }

  const sel = ui.select;
  const row = S.row.map((c, i) => {
    const cls = ['mini', i === idx() ? 'current' : '', i < idx() ? 'played' : '', sel && sel.picked.includes(i) ? 'picked' : '', S.actionFrom === i ? 'from' : ''].join(' ');
    const goalSlot = i === 3 ? _T`<button class="mini goal" data-goal title="Objetivo"><img class="cimg" src="assets/goals/${S.goal}.webp" alt="Objetivo"><span class="gnum">obj.</span></button>` : '';
    return `${goalSlot}<button class="${cls}" data-card="${i}"><span class="pos">${i + 1 + (round() - 1) * 6}</span>${cardImg(c, i, true)}${c.side ? `<span class="sidetag">${c.side === 'L' ? _T`esq.` : _T`dir.`}</span>` : ''}</button>`;
  }).join('');

  el.innerHTML = _T`
    <ol class="stepper">${stepper}</ol>
    ${goalBarHtml()}
    <div class="table-grid">
      <div class="active-card ${S.choice ? 'chosen-' + S.choice : ''} ${!S.choice ? 'pickable' : ''} ${!S.choice && ui.preview ? 'pv-' + ui.preview : ''}">
        ${cardImg(card)}
        <button class="half L" data-side="L" aria-label="Lado esquerdo"></button>
        <button class="half R" data-side="R" aria-label="Lado direito"></button>
      </div>
      <div class="phase-box panel">
        <div class="sides">${['L', 'R'].map((sd) => `<div data-side="${sd}" class="${S.choice === sd ? 'on' : S.choice ? 'off' : !S.choice && ui.preview === sd ? 'pv-on' : ''} ${!S.choice ? 'clk' : ''}"><small>${sd === 'L' ? _T`Esquerdo` : _T`Direito`}</small>${sideInfo(sd)}</div>`).join('')}</div>
        <h3>${S.phase} · ${PHASES[S.phase]}</h3>
        ${S.res.cp && S.phase >= 2 ? _T`<div class="cmd-inline">${cmdBarHtml()}<p class="muted small">Use agora: Comando não passa para o próximo turno. Colocar, atacar e mover abrem o mapa.</p></div>` : ''}
        ${phaseBox}
      </div>
    </div>
    <div class="row-wrap"><div class="card-row">${row}</div></div>
    ${sel ? _T`<div class="select-bar"><span>${sel.info}</span><button class="btn small" data-cancel>Cancelar</button></div>` : _T`
    <div class="gold-actions">
      <button class="btn small" data-sel="reveal"><img src="assets/icons/gold.webp" alt="">1 · Revelar carta</button>
      <button class="btn small" data-sel="swap"><img src="assets/icons/gold.webp" alt="">2 · Trocar posições</button>
      <button class="btn small" data-sel="replace"><img src="assets/icons/gold.webp" alt="">2 · Substituir do baralho</button>
      <button class="btn small" data-sel="adjacent"><img src="assets/icons/gold.webp" alt="">6 · Ação da vizinha</button>
    </div>`}
    ${logHtml()}`;

  $$('[data-side]', el).forEach((b) => (b.onclick = () => { if (!S.choice) { ui.preview = b.dataset.side; render(); } else showCard(idx()); }));
  $$('[data-confirm]', el).forEach((b) => (b.onclick = () => { const sd = b.dataset.confirm; ui.preview = null; chooseSide(sd); }));
  bindStrip(el); bindInf(el); bindSetup(el); bindCons(el);
  $$('[data-next]', el).forEach((b) => (b.onclick = nextPhase));
  $$('[data-cmd]', el).forEach((b) => (b.onclick = () => useCmd(b.dataset.cmd)));
  const gb = $('[data-gains]', el);
  if (gb) gb.onclick = () => {
    const acts = EV[actionCard().id][S.choice].a;
    const pv = CHAR_SKILLS[S.charId].priv; const on = acts.includes(pv.act);
    const run = (pick) => commit(() => {
      const notes = []; const tot = {};
      acts.forEach((a) => { for (const [k, n] of Object.entries(activationGains(a).out)) tot[k] = (tot[k] || 0) + n; });
      if (on && pv.plus) for (const [k, n] of Object.entries(pv.plus)) tot[k] = (tot[k] || 0) + n;
      if (pick) tot[pick] = (tot[pick] || 0) + 1;
      if (acts.includes('king')) {
        const c = applyKingCol(notes);
        if (c && (c.add || c.kill || c.moveOwn)) setTimeout(() => mapRewardPrompt(_T`Ação do Rei:`), 60);
      }
      Object.entries(tot).forEach(([k, n]) => gain(k, n, notes));
      S.gainsTaken = true;
      log(_T`Ganhos da ação: ${Object.entries(tot).map(([k, n]) => `+${n} ${RES[k].name}`).join(', ')}`); notes.forEach((t) => log(t));
      if (notes.length) setTimeout(() => toast(notes.join(' · ')), 30);
    });
    if (on && pv.choice) {
      modal(_T`<h2>Privilégio: escolha 1</h2><div class="any-row">${pv.choice.map((k) => `<button class="btn any-pick" data-k="${k}"><img src="${RES[k].icon}" alt="">${RES[k].name}</button>`).join('')}</div>`,
        () => $$('.any-pick').forEach((b) => (b.onclick = () => { closeModal(); run(b.dataset.k); })));
    } else run(null);
  };
  $$('[data-goto]', el).forEach((b) => (b.onclick = (e) => { e.preventDefault(); ui.tab = b.dataset.goto; if (b.dataset.sv2) ui.scenView = b.dataset.sv2; render(); }));
  $$('[data-card]', el).forEach((b) => (b.onclick = () => (ui.select ? pickCard(+b.dataset.card) : showCard(+b.dataset.card))));
  $$('[data-sel]', el).forEach((b) => (b.onclick = () => startSelect(b.dataset.sel)));
  const cancel = $('[data-cancel]', el); if (cancel) cancel.onclick = () => { ui.select = null; render(); };
  $$('[data-goalpend]', el).forEach((b) => (b.onclick = () => evalGoal(+b.dataset.goalpend)));
  $$('[data-goal]', el).forEach((b) => (b.onclick = () => { const c = Math.min(3, Math.ceil(S.turn / 3)); if (S.turn > 9 || S.goalDone[c]) showGoal(c, false); else showGoal(c, false); }));
}
function availBoxHtml() {
  const a = courtAvailSummary(); const ch = charAvailable();
  const chTxt = ch.map((x) => ({ sa1: _T`ação especial → Comando`, sa2: _T`ação especial → Diplomacia`, rew: _T`recompensa`, thr: _T`limiar de Influência`, row: _T`PV de Influência` }[x.k]));
  const uniq = [...new Set(chTxt)];
  const items = [];
  if (a.cells) items.push(_T`<button class="av-item" data-goto="court"><b>${a.cells}</b> custos pagáveis na Corte${a.segs ? _T` · <b>${a.segs}</b> segmento(s) dá para completar` : ''}</button>`);
  if (a.rooms) items.push(_T`<button class="av-item" data-goto="court">Salas do Castelo disponíveis</button>`);
  if (a.chains) items.push(_T`<button class="av-item" data-goto="court"><b>${a.chains}</b> ligação(ões) de corrente</button>`);
  if (ch.length) items.push(_T`<button class="av-item" data-goto="char">Personagem: ${uniq.join(', ')}</button>`);
  const gl = goldActions().filter((x) => gaState(x) === 'ok');
  if (gl.length) items.push(_T`<button class="av-item" data-goto="scen" data-sv2="acts">Cenário: ${gl.length} ação(ões) por Ouro</button>`);
  const bc = batAvailCount();
  if (bc) items.push(_T`<button class="av-item" data-goto="scen" data-sv2="acts"><b>${bc}</b> batalha(s) dá para vencer agora</button>`);
  if (S.res.cp) items.push(_T`<button class="av-item" data-goto="scen" data-sv2="map">⚑ <b>${S.res.cp}</b> Comando para usar neste turno</button>`);
  if (!items.length) return _T`<div class="avail-box none">Nada pagável com os recursos atuais.</div>`;
  return _T`<div class="avail-box"><div class="av-h">Disponível agora</div>${items.join('')}</div>`;
}
function logHtml() {
  return _T`<details class="panel log"><summary>Histórico do jogo</summary><ul>${S.log.slice(0, 60).map((l) => `<li>${esc(l)}</li>`).join('')}</ul></details>`;
}
function showCard(i) {
  const c = S.row[i];
  if (!c.up) return modal(_T`<h2>Carta ${i + 1}</h2><p>Esta carta está virada para baixo. Revele por 1 Ouro com o botão “Revelar carta”.</p><img class="full" src="assets/events/back.webp" alt="">`);
  modal(_T`<h2>Carta ${i + 1}${i === idx() ? _T` (atual)` : ''}</h2><img class="full" src="assets/events/${c.id}.webp" alt="">`);
}
function showGoal(col, evaluate) {
  const turnLabel = { 1: 3, 2: 6, 3: 9 }[col];
  modal(_T`<h2>${evaluate ? _T`Avaliar o objetivo · fim do turno ${turnLabel}` : _T`Carta de objetivo`}</h2>
    <div class="goal-view" style="--col:${col - 1}"><img src="assets/goals/${S.goal}.webp" alt="Objetivo"><div class="col-mask"></div></div>
    <p>A coluna destacada é avaliada no fim do turno ${turnLabel}. <strong>Em cima:</strong> condição e recompensa. <strong>Embaixo:</strong> condição e penalidade.</p>
    ${evaluate ? _T`<p class="muted small">Aplique o resultado no painel (recursos, comando, Diplomacia) e nas cartas (ativação inimiga).</p><button class="btn primary" data-close>Feito</button>` : ''}`);
}

/* ---------- Final ---------- */
function finalCalc() {
  const r = S.res; const left = r.g + r.n + r.v + r.gold;
  return { left, bonus: left * 5 };
}
function finalText() {
  const f = S.finished; if (!f) return '';
  return _T`${{ win: _T`Vitória`, lose: _T`Derrota`, none: _T`Sem condição` }[f.outcome]} · ${f.score} PV${f.why ? ' · ' + f.why : ''}`;
}
function finishGame(kind, why) {
  commit(() => {
    const ff = finalCalc(); const pen = kind === 'none' ? -100 : 0;
    S.res.vp += ff.bonus + pen; S.vpStages[12] = S.res.vp;
    const outcome = kind === 'none' ? (S.res.vp > 0 ? 'win' : 'lose') : kind;
    const w = kind === 'none' ? _T`sem condição (−100)${S.res.vp > 0 ? _T`, pontuação positiva` : ''}` : why || '';
    S.finished = { outcome, score: S.res.vp, at: Date.now(), why: w };
    S.endTurn = Math.min(12, S.turn); S.turn = 13; recordGame();
  }, _T`Fim de jogo: ${kind}${why ? ' · ' + why : ''}`);
  showEnd();
}
function showEnd() {
  if (S.finished) {
    return modal(_T`<h2>${esc(finalText())}</h2><p>${CH[S.charId].name} em ${SC[S.scenId].name}.</p>${endSummaryHtml()}
      <div class="menu"><button class="btn primary" data-new>Nova partida</button><button class="btn" data-again>Jogar de novo este cenário</button><button class="btn" data-stats>📊 Estatísticas</button></div>`, () => {
      $('[data-new]').onclick = () => { closeModal(); goSetup(); };
      $('[data-again]').onclick = () => { closeModal(); ui.pick = { char: S.charId, scen: S.scenId }; goSetup(); };
      $('[data-stats]').onclick = () => { closeModal(); showStats(); };
    });
  }
  const sc = SC[S.scenId]; const f = finalCalc();
  modal(_T`<h2>Pontuação final</h2>
    <table class="score"><tr><td>Pontos de vitória</td><td>${S.res.vp}</td></tr>
    <tr><td>Recursos e Ouro restantes (${f.left} × 5)</td><td>+${f.bonus}</td></tr>
    <tr class="tot"><td>Total</td><td id="fin-tot">${S.res.vp + f.bonus}</td></tr></table>
    <p class="muted small">Sem nenhuma condição de vitória ou derrota cumprida: −100 PV. Se o total continuar positivo, é vitória; abaixo de 0, derrota.</p>
    <div class="outcomes">
      <button class="btn primary" data-out="none">Nenhuma condição (−100)</button>
      <button class="btn" data-out="win">Cumpri uma condição de vitória</button>
      <button class="btn danger" data-out="lose">Cumpri uma condição de derrota</button>
    </div>
    ${S.turn <= 12 ? _T`<p class="muted small">Encerrar agora termina a partida antes do turno 12.</p>` : ''}`, () => {
    $$('[data-out]').forEach((b) => (b.onclick = () => { closeModal(); finishGame(b.dataset.out); }));
  });
}

/* ---------- Folhas com marcação ---------- */
const SHEETS = {
  court: { title: _T`Corte`, src: () => 'assets/court.webp', base: 2.3 },
  char: { title: _T`Personagem`, src: () => `assets/chars/${S.charId}.webp`, base: 4.6 },
  scen: { title: _T`Cenário`, src: () => `assets/scen/${S.scenId}.webp`, base: 2.4 },
};
const TOOLS = [
  { id: 'pay', label: '✓', name: _T`Pagar`, only: 'court' },
  { id: 'x', label: '✕', name: _T`Riscar` },
  { id: 'sq', label: '□', name: _T`Quadrado` },
  { id: 'o', label: '◯', name: _T`Círculo` },
  { id: 'dot', label: '●', name: _T`Marcador` },
  { id: 'pu', label: '<i class="u pu"></i>', name: _T`Sua unidade`, only: 'scen' },
  { id: 'eu', label: '<i class="u eu"></i>', name: _T`Unidade inimiga`, only: 'scen' },
  { id: 'move', label: '✥', name: _T`Mover` },
  { id: 'erase', label: '⌫', name: _T`Apagar` },
];
const view = { court: { zoom: 1, tool: 'pay' }, char: { zoom: 1, tool: 'x' }, scen: { zoom: 1, tool: 'pu' } };
let moving = null;

function markSvg(t, seed) {
  if (penOn() && PEN_T.has(t)) return penSvg(t, seed ?? t);
  return markSvgCrisp(t);
}
function markSvgCrisp(t) {
  switch (t) {
    case 'x': return '<svg viewBox="0 0 10 10"><path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#c4161c" stroke-width="1.7" stroke-linecap="round"/></svg>';
    case 'loop': return '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.3" fill="none" stroke="#178a35" stroke-width=".9"/></svg>';
    case 'chk': return '<svg viewBox="0 0 10 10"><path d="M1.6 5.4L4 8 8.6 2" fill="none" stroke="#178a35" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    case 'hatch': return '<svg viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="#1a3fa022" stroke="#1a3fa0" stroke-width="1"/></svg>';
    case 'sq': return '<svg viewBox="0 0 10 10"><rect x="1.2" y="1.2" width="7.6" height="7.6" fill="none" stroke="#1a3fa0" stroke-width="1.3"/></svg>';
    case 'o': return '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.9" fill="none" stroke="#1a3fa0" stroke-width="1.2"/></svg>';
    case 'dot': return '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.4" fill="#2b2b2b" stroke="#fff" stroke-width=".8"/></svg>';
    case 'pu': return '<svg viewBox="0 0 10 10"><path d="M5 .8l3.8 1.4v3c0 2.2-1.7 3.6-3.8 4.2C2.9 8.8 1.2 7.4 1.2 5.2v-3z" fill="#2f9e44" stroke="#fff" stroke-width=".7"/></svg>';
    case 'eu': return '<svg viewBox="0 0 10 10"><path d="M5 .8l3.8 1.4v3c0 2.2-1.7 3.6-3.8 4.2C2.9 8.8 1.2 7.4 1.2 5.2v-3z" fill="#d6222a" stroke="#fff" stroke-width=".7"/></svg>';
  }
  return '';
}
function renderSheet(kind) {
  const el = kind === 'scen' ? $('#scen-card') : $('#tab-' + kind); const cfg = SHEETS[kind]; const v = view[kind];
  const sc = SC[S.scenId];
  const tools = TOOLS.filter((t) => !t.only || t.only === kind)
    .map((t) => `<button class="tool ${v.tool === t.id ? 'on' : ''}" data-tool="${t.id}" title="${t.name}">${t.label}<small>${t.name}</small></button>`).join('');
  let counts = '';
  if (kind === 'scen') {
    const pu = S.marks.scen.filter((m) => m.t === 'pu').length, eu = S.marks.scen.filter((m) => m.t === 'eu').length;
    counts = _T`<div class="counts"><span class="${pu > sc.lim[0] ? 'over' : ''}"><i class="u pu"></i> ${pu}/${sc.lim[0]} no mapa · máx. ${sc.lim[2]} por área</span>
      <span class="${eu > sc.lim[1] ? 'over' : ''}"><i class="u eu"></i> ${eu}/${sc.lim[1]} no mapa · máx. ${sc.lim[3]} por área</span></div>`;
  }
  if (!el.dataset.built || el.dataset.built !== kind + S.charId + S.scenId) {
    el.innerHTML = _T`<div class="sheet-tools"><div class="tools">${tools}</div>
        <div class="zoom"><button data-z="-1" aria-label="Diminuir">−</button><span id="z-${kind}">100%</span><button data-z="1" aria-label="Aumentar">+</button>
        <button data-size title="Tamanho das marcas">Aa</button></div></div>
      <div class="counts-wrap"></div>${kind === 'char' ? '<div class="char-panel-wrap"></div>' : ''}
      <div class="viewer" id="viewer-${kind}"><div class="canvas" id="canvas-${kind}"><img src="${cfg.src()}" alt="${cfg.title}" draggable="false"><div class="cmarks"></div><div class="marks"></div></div></div>
      <p class="muted small sheet-help">${kind === 'court' ? _T`Com ✓ Pagar, toque num custo para pagá-lo (custos em branco perguntam qual recurso usar), numa sala do Castelo para construí-la ou numa corrente para fazer a ligação. ⌫ estorna um custo de segmento ainda não concluído. ` : ''}Toque na carta para marcar com a ferramenta escolhida. Use os botões de zoom ou faça pinça para aproximar. ✥ move uma marca (toque nela e depois no destino).</p>`;
    el.dataset.built = kind + S.charId + S.scenId;
    if (!view[kind].init) { view[kind].init = true; if (window.innerWidth < 700) view[kind].zoom = kind === 'char' ? 1.4 : 2.6; }
    bindSheet(kind);
  }
  $('.tools', el).innerHTML = tools;
  $$('[data-tool]', el).forEach((b) => (b.onclick = () => { view[kind].tool = b.dataset.tool; moving = null; renderSheet(kind); }));
  if (kind === 'court') {
    const a = courtAvailSummary();
    $('.counts-wrap', el).innerHTML = _T`<div class="avail-bar"><label class="check sm"><input type="checkbox" id="avail-tg" ${ui.showAvail ? 'checked' : ''}> Destacar o que dá para pagar</label> <label class="check sm"><input type="checkbox" data-crisp ${ui.crisp ? 'checked' : ''}> Ícones nítidos</label>
      <span class="legend"><i class="lg ok"></i>pagável <i class="lg full"></i>completa o segmento ${swapActive() ? _T`<i class="lg conv"></i>convertível (privilégio) ` : ''}<i class="lg lack"></i>liberado, falta recurso ${goalTargets().some((t) => t.kind === 'act' && !t.ok) ? _T`<i class="lg goal"></i>leva à meta do objetivo` : ''} <span class="lgc">faltam N</span> custos restantes <span class="lgc done">✓</span> desbloqueado</span>
      <span class="muted small">${a.cells} custos pagáveis · ${a.segs} segmentos completáveis${a.rooms ? _T` · salas do Castelo` : ''}${a.chains ? ' · ' + a.chains + _T` ligação(ões)` : ''}</span></div>${goalStripHtml('court')}${courtGainsHtml()}${courtSummaryHtml()}`;
    bindCrisp(el, () => drawMarks('court'));
    $('#avail-tg', el).onchange = (e) => { ui.showAvail = SET.avail = e.target.checked; saveSet(); try { localStorage.setItem('knight.avail', ui.showAvail ? '1' : '0'); } catch {} drawMarks('court'); };
  } else $('.counts-wrap', el).innerHTML = counts;
  if (kind === 'char') { const w = $('.char-panel-wrap', el); w.innerHTML = charPanelHtml(); bindCharPanel(w); }
  applyZoom(kind);
  drawMarks(kind);
}
function applyZoom(kind) {
  const v = view[kind]; const c = $('#canvas-' + kind); if (!c) return;
  c.style.width = v.zoom * 100 + '%';
  const z = $('#z-' + kind); if (z) z.textContent = Math.round(v.zoom * 100) + '%';
}
function drawMarks(kind) {
  const layer = $('#canvas-' + kind + ' .marks'); if (!layer) return;
  const size = SHEETS[kind].base * [0.75, 1, 1.35][S.size[kind] ?? 1];
  layer.style.setProperty('--ms', size + '%');
  if (kind === 'court') $('#canvas-court .cmarks').innerHTML = courtCrispHtml() + goalCourtHtml() + (ui.showAvail ? courtAvailHtml() : '') + courtMarksHtml() + (ui.showAvail ? courtCountHtml() : '');
  if (kind === 'scen') $('#canvas-scen .cmarks').innerHTML = scenCardMarksHtml();
  layer.innerHTML = S.marks[kind].map((m, i) =>
    `<div class="mk ${m.t} ${moving && moving.kind === kind && moving.i === i ? 'sel' : ''}" style="left:${m.x * 100}%;top:${m.y * 100}%">${markSvg(m.t, `${kind}m:${m.x.toFixed(4)},${m.y.toFixed(4)}`)}</div>`).join('');
}
function zoomBy(kind, dir, cx, cy) {
  const v = view[kind]; const vw = $('#viewer-' + kind);
  const old = v.zoom; const nz = Math.max(1, Math.min(6, +(old * (dir > 0 ? 1.4 : 1 / 1.4)).toFixed(3)));
  setZoom(kind, nz, cx, cy);
}
function setZoom(kind, nz, cx, cy) {
  const v = view[kind]; const vw = $('#viewer-' + kind); const old = v.zoom;
  if (cx == null) { cx = vw.clientWidth / 2; cy = vw.clientHeight / 2; }
  const fx = (vw.scrollLeft + cx) / old, fy = (vw.scrollTop + cy) / old;
  v.zoom = nz; applyZoom(kind);
  vw.scrollLeft = fx * nz - cx; vw.scrollTop = fy * nz - cy;
}
function bindSheet(kind) {
  const el = kind === 'scen' ? $('#scen-card') : $('#tab-' + kind); const vw = $('#viewer-' + kind); const canvas = $('#canvas-' + kind);
  $$('[data-z]', el).forEach((b) => (b.onclick = () => zoomBy(kind, +b.dataset.z)));
  $('[data-size]', el).onclick = () => { S.size[kind] = ((S.size[kind] ?? 1) + 1) % 3; save(); drawMarks(kind); };
  vw.addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); const r = vw.getBoundingClientRect(); zoomBy(kind, e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  // pinça
  let pinch = null, lastPinch = 0;
  vw.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches; const r = vw.getBoundingClientRect();
      pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: view[kind].zoom, cx: (a.clientX + b.clientX) / 2 - r.left, cy: (a.clientY + b.clientY) / 2 - r.top };
    }
  }, { passive: true });
  vw.addEventListener('touchmove', (e) => {
    if (pinch && e.touches.length === 2) {
      e.preventDefault();
      const [a, b] = e.touches; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setZoom(kind, Math.max(1, Math.min(6, pinch.z * d / pinch.d)), pinch.cx, pinch.cy);
    }
  }, { passive: false });
  vw.addEventListener('touchend', (e) => { if (pinch && e.touches.length < 2) { pinch = null; lastPinch = Date.now(); } });
  canvas.addEventListener('click', (e) => {
    if (Date.now() - lastPinch < 400) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const tool = view[kind].tool; const marks = S.marks[kind];
    if (kind === 'court' && (tool === 'pay' || tool === 'erase')) {
      if (courtClick(x, y, r.width, r.height, tool === 'erase')) return;
      if (tool === 'pay') return toast(_T`Toque exatamente sobre um custo, uma sala do Castelo ou uma corrente.`);
    }
    const nearest = () => {
      let best = -1, bd = Infinity;
      marks.forEach((m, i) => { const d = Math.hypot((m.x - x) * r.width, (m.y - y) * r.height); if (d < bd) { bd = d; best = i; } });
      const tol = Math.max(18, r.width * SHEETS[kind].base / 100 * 0.7);
      return bd <= tol ? best : -1;
    };
    if (tool === 'erase') {
      const i = nearest(); if (i < 0) return;
      commitSheet(kind, () => marks.splice(i, 1));
    } else if (tool === 'move') {
      if (!moving) { const i = nearest(); if (i < 0) return toast(_T`Toque numa marca para selecioná-la.`); moving = { kind, i }; drawMarks(kind); return; }
      const i = moving.i; moving = null;
      commitSheet(kind, () => { marks[i].x = x; marks[i].y = y; });
    } else {
      if (kind === 'scen' && (tool === 'pu' || tool === 'eu')) {
        const sc = SC[S.scenId]; const n = marks.filter((m) => m.t === tool).length;
        const lim = tool === 'pu' ? sc.lim[0] : sc.lim[1];
        if (n >= lim) toast(_T`Atenção: limite de ${lim} unidades ${tool === 'pu' ? _T`suas` : _T`inimigas`} no mapa.`);
      }
      commitSheet(kind, () => marks.push({ t: tool, x: +x.toFixed(4), y: +y.toFixed(4) }));
    }
  });
}
function commitSheet(kind, fn) {
  undoStack.push(JSON.stringify(S)); if (undoStack.length > 80) undoStack.shift();
  fn(); save(); drawMarks(kind);
  if (kind === 'scen') renderSheet('scen');
}

/* ---------- Regras ---------- */


function renderRules() {
  const el = $('#tab-rules'); const sc = SC[S.scenId];
  const v = ui.rulesView;
  const nav = _T`<div class="seg"><button data-rv="summary" class="${v === 'summary' ? 'on' : ''}">Guia com exemplos</button><button data-rv="scen" class="${v === 'scen' ? 'on' : ''}">Este cenário</button><button data-rv="icons" class="${v === 'icons' ? 'on' : ''}">Ícones</button><button data-rv="pages" class="${v === 'pages' ? 'on' : ''}">Livro original</button></div>`;
  let body = '';
  if (v === 'summary') body = guideHtml(ui.guideOpen);
  else if (v === 'scen') body = scenarioHtml(sc, S.advanced);
  else if (v === 'icons') body = glossaryHtml();
  else {
    const p = RULE_PAGES[ui.rulesPage];
    body = `<div class="pager"><button class="btn small" data-pg="-1">‹</button><select id="pg-sel">${RULE_PAGES.map((r, i) => `<option value="${i}" ${i === ui.rulesPage ? 'selected' : ''}>${r.label}</option>`).join('')}</select><button class="btn small" data-pg="1">›</button></div>
      <div class="viewer page-viewer"><img src="${p.src}" alt="${p.label}"></div>`;
  }
  el.innerHTML = nav + body;
  if (v === 'summary') bindGuide(el);
  $$('[data-rv]', el).forEach((b) => (b.onclick = () => { ui.rulesView = b.dataset.rv; renderRules(); }));
  $$('[data-pg]', el).forEach((b) => (b.onclick = () => { ui.rulesPage = (ui.rulesPage + +b.dataset.pg + RULE_PAGES.length) % RULE_PAGES.length; renderRules(); }));
  const sel = $('#pg-sel', el); if (sel) sel.onchange = () => { ui.rulesPage = +sel.value; renderRules(); };
  const pgBtn = $('[data-openpage]', el); if (pgBtn) pgBtn.onclick = () => { ui.rulesView = 'pages'; ui.rulesPage = +pgBtn.dataset.openpage; renderRules(); };
}
function scenarioHtml(sc) {
  const pageIdx = sc.page === 'monster' ? RULE_PAGES.length - 2 : sc.page === 13 ? 12 : 14 + [18, 19, 20, 21, 22].indexOf(sc.page);
  return scenGuideHtml() + _T`<button class="btn small" data-openpage="${pageIdx}">Ver a página original do livro</button>`;
}

/* ---------- HUD: ajuste de valores ---------- */
function openPop(key, anchor) {
  const names = { g: _T`Glória`, n: _T`Nobreza`, v: _T`Valor`, gold: _T`Ouro`, cp: _T`Pontos de Comando`, inf: _T`Influência`, vp: _T`Pontos de vitória`, dipP: _T`Diplomacia`, dipE: _T`Diplomacia inimiga` };
  const steps = key === 'vp' ? [-10, -5, -1, 1, 5, 10, 20] : [-3, -1, 1, 3];
  const pop = $('#pop');
  pop.innerHTML = `<div class="pop-h"><b>${names[key]}</b> <span>${S.res[key]}${MAX[key] != null ? ' / ' + MAX[key] : ''}</span></div>
    <div class="pop-btns">${steps.map((s) => `<button data-d="${s}" class="${s < 0 ? 'neg' : 'pos'}">${s > 0 ? '+' : ''}${s}</button>`).join('')}</div>
    ${['g', 'n', 'v', 'gold'].includes(key) ? _T`<p class="muted small">Ganhos acima do limite são convertidos automaticamente (recurso → Ouro → 5 PV).</p>` : ''}
    ${key === 'cp' ? _T`<p class="muted small">Pontos de Comando não usados se perdem no fim do turno.</p>${S.res.cp ? `<div class="pop-cmd">${cmdList().map((id) => `<button class="btn small" data-pcmd="${id}">${CMD_DEF[id].label}</button>`).join('')}</div>` : ''}` : ''}
    ${key === 'vp' ? _T`<p class="muted small">Marcação por etapa: ${[3, 6, 9, 12].map((t) => `${t}: <b>${S.vpStages[t] ?? '—'}</b>`).join(' · ')}</p>` : ''}`;
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  pop.style.top = Math.min(window.innerHeight - pop.offsetHeight - 8, r.bottom + 6) + 'px';
  pop.style.left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.left)) + 'px';
  $$('[data-pcmd]', pop).forEach((b) => (b.onclick = () => { pop.hidden = true; useCmd(b.dataset.pcmd); }));
  $$('[data-d]', pop).forEach((b) => (b.onclick = () => {
    const d = +b.dataset.d;
    if (d < 0 && S.res[key] + d < 0 && key !== 'vp') return toast(_T`Valor insuficiente.`);
    commit(() => {
      const notes = [];
      if (d > 0) gain(key, d, notes); else S.res[key] += d;
      log(`${names[key]} ${d > 0 ? '+' : ''}${d}`); notes.forEach((t) => log(t));
      if (notes.length) toast(notes.join(' · '));
    });
    openPop(key, $(`[data-res="${key}"]`));
  }));
}

/* ---------- Modal, toast, menu ---------- */
function modal(html, after) {
  $('#modal-body').innerHTML = html; $('#modal').hidden = false;
  $$('[data-close]', $('#modal')).forEach((b) => (b.onclick = closeModal));
  if (after) after();
}
function closeModal() { $('#modal').hidden = true; }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3200); }

function openMenu() {
  modal(_T`<h2>Menu</h2><div class="menu">
    <button class="btn" data-m="tut">🎓 Partida guiada</button>
    <button class="btn" data-m="stats">📊 Estatísticas</button>
    <button class="btn" data-m="settings">⚙ Configurações</button>
    <button class="btn" data-m="goal">Ver carta de objetivo</button>
    <button class="btn" data-m="setup">Ver preparação do cenário</button>
    <button class="btn" data-m="end">Encerrar partida e pontuar</button>
    <button class="btn" data-m="export">Exportar partida (arquivo)</button>
    <button class="btn" data-m="import">Importar partida</button>
    <button class="btn" data-m="install" ${deferredInstall ? '' : 'hidden'}>Instalar o app</button>
    <button class="btn danger" data-m="new">Nova partida</button>
  </div><p class="muted small">Tudo fica salvo neste aparelho automaticamente e funciona sem internet.</p>`, () => {
    $$('[data-m]').forEach((b) => (b.onclick = () => {
      const m = b.dataset.m; closeModal();
      if (m === 'stats') return showStats();
      if (m === 'settings') return showSettings();
      if (m === 'tut') { if (!S.finished && S.turn <= 12 && S.turn + S.phase > 1 && !confirm(_T`A partida guiada começa uma partida nova e substitui a atual. Continuar?`)) return; return tutStart(); }
      if (m === 'goal') { const pend = [1, 2, 3].find((c) => S.turn > c * 3 && !S.goalDone[c]); if (pend) evalGoal(pend); else showGoal(Math.min(3, Math.ceil(Math.min(S.turn, 12) / 3)), false); }
      if (m === 'setup') showSetupTips();
      if (m === 'end') showEnd();
      if (m === 'new') { if (S.finished || confirm(_T`Abandonar a partida atual e começar outra?`)) goSetup(); }
      if (m === 'export') exportGame();
      if (m === 'import') importGame();
      if (m === 'install' && deferredInstall) deferredInstall.prompt();
    }));
  });
}
function showSetupTips() {
  const sc = SC[S.scenId], c = CH[S.charId];
  modal(_T`<h2>Preparação</h2>
    <ul class="prose">
      <li>${c.name} começa com ${resList(c.start)} (já está no painel).</li>
      <li>Seis cartas de evento foram distribuídas: só a primeira e a última estão reveladas. O objetivo fica entre a 3ª e a 4ª carta.</li>
      ${setupTasks().length ? _T`<li>Este cenário tem preparação: a Mesa mostra a lista do que fazer (unidades iniciais, consequências, recursos riscados) e marca o que já está pronto.</li>` : _T`<li>Este cenário não tem preparação extra.</li>`}
      ${S.advanced && /Diplomacia inimiga começa/.test(sc.advanced.join(' ')) ? _T`<li>Modo avançado: a Diplomacia inimiga já começa em ${S.res.dipE}.</li>` : ''}
    </ul>
    <div class="menu"><button class="btn primary" data-close>Começar</button><button class="btn" data-sguide>Ler o guia deste cenário</button></div>`, () => {
      $('[data-sguide]').onclick = () => { closeModal(); ui.tab = 'rules'; ui.rulesView = 'scen'; render(); };
    });
}
function exportGame() {
  const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `knight-${S.scenId}-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importGame() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    try { const d = JSON.parse(await inp.files[0].text()); if (!d.charId || !d.scenId || !d.row) throw 0; S = d; if (!S.court) S.court = courtInit(); undoStack = []; save(); ui.tab = 'table'; render(); toast(_T`Partida importada.`); }
    catch { toast(_T`Arquivo inválido.`); }
  };
  inp.click();
}

/* ---------- Tela inicial ---------- */
function goSetup() {
  S = null; undoStack = []; ui.select = null; ui.tab = 'table';
  $$('.sheet-page').forEach((p) => (p.dataset.built = '')); $('#tab-scen').dataset.scenBuilt = '';
  const saved = load();
  $('#game').hidden = true; $('#setup').hidden = false;
  const rb = $('#resume-box');
  if (saved && !saved.finished && saved.turn <= 12) {
    rb.hidden = false;
    $('#resume-info').textContent = _T`${CH[saved.charId].name} · ${SC[saved.scenId].name} · turno ${saved.turn}/12`;
    $('#btn-resume').onclick = () => { S = saved; if (!S.court) S.court = courtInit(); render(); };
  } else rb.hidden = true;

  const badge = (d) => `<span class="diff ${d}">${DIFF[d]}</span>`;
  const fl = ui.flip || (ui.flip = {});
  $('#char-grid').innerHTML = CHARACTERS.map((c) => fl.char === c.id
    ? `<button class="pick on flipped" data-char="${c.id}" aria-expanded="true"><div class="pick-back">${charBackHtml(c)}</div></button>`
    : `<button class="pick ${ui.pick.char === c.id ? 'on' : ''} ${fl.was === 'c:' + c.id ? 'unflip' : ''}" data-char="${c.id}">
      <img src="assets/thumbs/c_${c.id}.webp" alt="" loading="lazy"><span class="nm">${c.name}</span>${badge(c.diff)}
      <span class="st">${resList(c.start) || '<span class="muted">—</span>'}</span></button>`).join('');
  $('#scen-grid').innerHTML = SCENARIOS.map((s) => fl.scen === s.id
    ? `<button class="pick on flipped" data-scen="${s.id}" aria-expanded="true"><div class="pick-back">${scenBackHtml(s)}</div></button>`
    : `<button class="pick ${ui.pick.scen === s.id ? 'on' : ''} ${fl.was === 's:' + s.id ? 'unflip' : ''}" data-scen="${s.id}">
      <img src="assets/thumbs/s_${s.id}.webp" alt="" loading="lazy"><span class="nm">${s.name}</span>${isEN ? '' : `<span class="en">${s.en}</span>`}${badge(s.diff)}</button>`).join('');
  fl.was = null;
  /* 1º toque: escolhe e vira · 2º toque: desvira (continua escolhido) */
  const pickTap = (kind, id) => {
    const scrollY = window.scrollY;
    if (fl[kind] === id) { fl[kind] = null; fl.was = kind[0] + ':' + id; } else { ui.pick[kind] = id; fl[kind] = id; }
    goSetup(); window.scrollTo(0, scrollY);
    const el = document.querySelector(`[data-${kind}="${id}"]`); if (el && fl[kind] === id) el.scrollIntoView({ block: 'nearest', behavior: SET.motion ? 'smooth' : 'auto' });
  };
  $$('[data-char]').forEach((b) => (b.onclick = () => pickTap('char', b.dataset.char)));
  $$('[data-scen]').forEach((b) => (b.onclick = () => pickTap('scen', b.dataset.scen)));
  $('#btn-start').disabled = !(ui.pick.char && ui.pick.scen);

  const hst = history();
  $('#history-box').hidden = !hst.length;
  $('#btn-stats').onclick = showStats;
  $('#history-list').innerHTML = hst.slice(0, 15).map((g) => `<li><span>${new Date(g.at).toLocaleDateString(isEN ? 'en-US' : 'pt-BR')}</span>
    <span>${CH[g.char]?.name ?? g.char} · ${SC[g.scen]?.name ?? g.scen}${g.adv ? _T` (av.)` : ''}</span>
    <b class="${g.outcome}">${{ win: _T`Vitória`, lose: _T`Derrota`, none: '—' }[g.outcome]} · ${g.score}</b></li>`).join('');
}

/* ---------- PWA ---------- */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => {
      const st = $('#offline-status'); if (st) st.textContent = _T`Pronto para jogar offline.`;
    }).catch(() => {});
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'progress') { const st = $('#offline-status'); if (st) st.textContent = _T`Preparando uso offline… ${e.data.done}/${e.data.total}`; }
    });
    let hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) toast(_T`Nova versão instalada. Feche e abra o app para usá-la.`);
      hadController = true;
    });
  });
}

/* ---------- Inicialização ---------- */
document.addEventListener('DOMContentLoaded', () => {
  i18nStatic();
  document.querySelectorAll('[data-lang]').forEach((b) => { b.classList.toggle('on', b.dataset.lang === LANG); b.onclick = () => { if (b.dataset.lang !== LANG) setLang(b.dataset.lang); }; });
  $$('[data-random]').forEach((b) => (b.onclick = () => {
    const list = b.dataset.random === 'char' ? CHARACTERS : SCENARIOS;
    ui.pick[b.dataset.random] = list[Math.floor(Math.random() * list.length)].id; goSetup();
  }));
  $('#btn-start').onclick = () => {
    const saved = load();
    if (saved && !saved.finished && saved.turn <= 12 && !confirm(_T`Já existe uma partida em andamento. Começar uma nova vai substituí-la. Continuar?`)) return;
    newGame(ui.pick.char, ui.pick.scen, $('#opt-adv').checked, $('#opt-seed').value);
    ui.tab = 'table'; render(); showSetupTips();
  };
  $('#btn-set').onclick = showSettings;
  $('#btn-tut').onclick = () => {
    const saved = load();
    if (saved && !saved.finished && saved.turn <= 12 && !confirm(_T`Já existe uma partida em andamento. A partida guiada vai substituí-la. Continuar?`)) return;
    tutStart();
  };
  $('#tabs').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; ui.tab = b.dataset.tab; ui.select = null; render(); window.scrollTo(0, 0); };
  $('#hud').onclick = (e) => { const b = e.target.closest('[data-res]'); if (b) openPop(b.dataset.res, b); };
  $('#btn-undo').onclick = undo;
  $('#btn-menu').onclick = openMenu;
  $('#modal-x').onclick = closeModal;
  $('#modal').onclick = (e) => { if (e.target.id === 'modal') closeModal(); };
  document.addEventListener('click', (e) => { const p = $('#pop'); if (!p.hidden && !p.contains(e.target) && !e.target.closest('[data-res]')) p.hidden = true; });
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && S) { e.preventDefault(); undo(); } if (e.key === 'Escape') { closeModal(); $('#pop').hidden = true; } });

  applySet();
  const saved = load();
  if (saved && !saved.finished && saved.turn <= 12) { S = saved; if (!S.court) S.court = courtInit(); render(); }
  else goSetup();
});
