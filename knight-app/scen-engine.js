'use strict';
/* Ações por Ouro do Cenário: botões que cobram o custo, conferem o requisito e aplicam o efeito. */

function goldActions() {
  const o = GOLD_SCEN[S.scenId] || {};
  const list = GOLD_BASE.map((a) => {
    if (a.id === 'inf' && o.inf) return { ...a, cost: { gold: o.inf } };
    if (a.id === 'swap1' && o.swap1) return { ...o.swap1, id: 'swap1' };
    return a;
  });
  if (o.sp) list.push({ ...o.sp, id: 'sp' });
  return list;
}
function gaReqOk(req) {
  if (!req) return true;
  return req.inf != null ? S.res.inf >= req.inf : actLevel(req.act) >= req.lvl;
}
function gaCanPay(a) {
  for (const [k, n] of Object.entries(a.cost)) {
    if (k === 'any') { if (S.res.g + S.res.n + S.res.v < n) return false; }
    else if (S.res[k] < n) return false;
  }
  if (a.eff === 'swap' && S.res.g + S.res.n + S.res.v < 1) return false;
  return true;
}
function gaState(a) { return !gaReqOk(a.req) ? 'locked' : gaCanPay(a) ? 'ok' : 'lack'; }
function goldAvailCount() { return S.turn > 12 ? 0 : goldActions().filter((a) => gaState(a) === 'ok').length; }

function costHtml(c) {
  return Object.entries(c).map(([k, n]) => k === 'any' ? _T`${n} recursos quaisquer` : `<span class="ri"><img src="${RES[k].icon}" alt="">${n}</span>`).join(' ');
}
function useGold(id) {
  const a = goldActions().find((x) => x.id === id); if (!a) return;
  if (!gaReqOk(a.req)) return toast(_T`Requisito: ${reqText(a.req)}.`);
  if (!gaCanPay(a)) return toast(_T`Recursos insuficientes.`);
  const pay = () => { for (const [k, n] of Object.entries(a.cost)) if (k !== 'any') S.res[k] -= n; };
  const done = (fn, msg) => { commit(() => { pay(); fn(); }, _T`Ação por Ouro: ${msg}`); };
  if (a.eff === 'cp') { done(() => { S.res.cp += 1; }, _T`1 Comando`); toast(_T`+1 Comando. Use no mapa neste turno.`); return; }
  if (a.eff === 'inf') return done(() => { S.res.inf = Math.min(33, S.res.inf + 1); }, _T`1 Influência`);
  if (a.eff === 'res') {
    return chooseAny(_T`Receber 1 recurso`, (k) => done(() => { const notes = []; gain(k, 1, notes); notes.forEach((t) => log(t)); }, `1 ${RES[k].name}`),
      ['g', 'n', 'v'], _T`Escolha o recurso.`, true);
  }
  if (a.eff === 'swap') {
    const pick = (title, list, cb) => {
      modal(`<h2>${title}</h2><div class="any-row">${list.map((k) => `<button class="btn any-pick" data-k="${k}" ${title.includes(_T`Dar`) && S.res[k] < 1 ? 'disabled' : ''}><img src="${RES[k].icon}" alt="">${RES[k].name} <small>(${S.res[k]})</small></button>`).join('')}</div>`,
        () => $$('.any-pick').forEach((b) => (b.onclick = () => { closeModal(); cb(b.dataset.k); })));
    };
    return pick(_T`Dar 1 recurso`, ['g', 'n', 'v'], (from) => pick(_T`Receber 1 recurso`, ['g', 'n', 'v'].filter((k) => k !== from), (to) =>
      done(() => { S.res[from] -= 1; const notes = []; gain(to, 1, notes); notes.forEach((t) => log(t)); }, _T`trocou 1 ${RES[from].name} por 1 ${RES[to].name}`)));
  }
  if (a.eff === 'vp10') {
    const picked = [];
    const step = () => {
      if (picked.length === a.cost.any) return done(() => { picked.forEach((k) => (S.res[k] -= 1)); S.res.vp += 10; }, _T`${picked.map((k) => RES[k].name).join(', ')} → +10 PV`);
      const left = (k) => S.res[k] - picked.filter((x) => x === k).length;
      modal(_T`<h2>Pagar recurso ${picked.length + 1} de ${a.cost.any}</h2><div class="any-row">${['g', 'n', 'v'].map((k) => `<button class="btn any-pick" data-k="${k}" ${left(k) < 1 ? 'disabled' : ''}><img src="${RES[k].icon}" alt="">${RES[k].name} <small>(${left(k)})</small></button>`).join('')}</div>`,
        () => $$('.any-pick').forEach((b) => (b.onclick = () => { closeModal(); picked.push(b.dataset.k); step(); })));
    };
    return step();
  }
  if (a.eff === 'collect') {
    return collectModal(_T`Receber os recursos de 1 área`, (pick) => done(() => { const notes = []; for (const [k, n] of Object.entries(pick)) gain(k, n, notes); notes.forEach((t) => log(t)); },
      _T`recursos de 1 área: ${Object.entries(pick).filter(([, n]) => n).map(([k, n]) => `${n} ${RES[k].name}`).join(', ') || _T`nada`}`));
  }
  // efeito no mapa: cobra o custo e abre o mapa com a ferramenta certa
  const grants = a.tool === 'pu' || /colocar 1 (unidade )?sua/.test(a.label);
  const kills = a.tool === 'erase'; const moves = a.label === MOVE_EN ? 'moveEn' : /mover suas unidades/.test(a.label) ? 'moveOwn' : null;
  done(() => { if (grants) grantMap('add'); if (kills) grantMap('kill'); if (moves) grantMap(moves); }, a.label);
  if (hasAreas()) return mapRewardPrompt(_T`Pago.`);
  ui.tab = 'scen'; ui.scenView = 'map'; if (a.tool) ui.mapTool = a.tool; if (grants && a.tool !== 'erase') ui.mapTool = 'pu'; render();
  toast(_T`Pago. Agora no mapa: ${a.label}.`);
}

function goldPanelHtml() {
  const rows = goldActions().map((a) => {
    const st = gaState(a);
    const req = a.req ? `<small class="req ${gaReqOk(a.req) ? 'met' : ''}">${reqText(a.req)}</small>` : '';
    return _T`<div class="ga ${st}"><span class="ga-c">${costHtml(a.cost)}</span><span class="ga-l">→ ${esc(a.label)} ${req}</span>
      <button class="btn small ${st === 'ok' ? 'primary' : ''}" data-ga="${a.id}" ${st === 'ok' ? '' : 'disabled'}>Usar</button></div>`;
  }).join('');
  return _T`<details class="cp-box gold-panel" ${ui.goldOpen === false ? '' : 'open'}><summary><h3>Ações por Ouro <small class="muted">(quantas vezes quiser no seu turno)</small></h3></summary>${rows}
    <p class="muted small">Efeitos no mapa: o app cobra o custo; você coloca, move ou remove a unidade na carta.</p></details>`;
}
function bindGoldPanel(el) {
  $$('[data-ga]', el).forEach((b) => (b.onclick = () => useGold(b.dataset.ga)));
  const d = $('.gold-panel', el); if (d) d.ontoggle = () => { ui.goldOpen = d.open; };
}

/* =================== Cenário: estado =================== */
function parseCosts(str) {
  return str.split(' ').map((t) => t[0] === 'o' ? ['gold', +t.slice(1)] : [{ a: 'any' }[t] || t, 1]);
}
function battles() { return (BATTLES[S.scenId] || []).map(([req, lvl, c]) => ({ req, lvl, costs: parseCosts(c) })); }
function scenState() {
  if (!S.scen) S.scen = { bat: battles().map((b) => b.costs.map(() => null)), king: 0 };
  return S.scen;
}

/* =================== Batalhas =================== */
function batReqLabel(b) {
  if (b.req === 'inf') return _T`Influência ${b.lvl}`;
  if (b.req === 'vp') return _T`${b.lvl} PV`;
  if (b.req === 'dipP') return _T`Diplomacia ${b.lvl}`;
  if (b.req === 'dipE') return _T`Dipl. inimiga ${b.lvl}`;
  return `${ACT_NAMES[b.req]} ${b.lvl}`;
}
function batReqHave(b) {
  if (b.req === 'inf') return S.res.inf;
  if (b.req === 'vp') return S.res.vp;
  if (b.req === 'dipP') return S.res.dipP;
  if (b.req === 'dipE') return S.res.dipE;
  return actLevel(b.req);
}
function batReqOk(b) { return batReqHave(b) >= b.lvl; }
const batWon = (i) => scenState().bat[i].every((p) => p !== null);
function batCompletable(i) {
  const b = battles()[i]; const st = scenState().bat[i];
  if (batWon(i) || !batReqOk(b)) return false;
  const left = { g: S.res.g, n: S.res.n, v: S.res.v, gold: S.res.gold };
  const need = b.costs.filter((_, ci) => !st[ci]);
  for (const [t, n] of need) if (t === 'gold') { left.gold -= n; if (left.gold < 0) return false; }
  const items = need.filter(([t]) => t !== 'gold').map(([t]) => (t === 'any' ? ['g', 'n', 'v'] : payOptions(t).length ? [...new Set([t, ...((swapActive() && swapActive().from.includes(t)) ? swapActive().to : [])])] : [t]))
    .sort((a, c) => a.length - c.length);
  const fit = (k) => { if (k === items.length) return true; for (const r of items[k]) if (left[r] > 0) { left[r]--; if (fit(k + 1)) return true; left[r]++; } return false; };
  return fit(0);
}
function batState(i) {
  if (batWon(i)) return 'won';
  const b = battles()[i];
  if (!batReqOk(b)) return 'locked';
  if (batCompletable(i)) return 'full';
  const st = scenState().bat[i];
  return b.costs.some(([t, n], ci) => !st[ci] && (t === 'gold' ? S.res.gold >= n : payOptions(t).length)) ? 'ok' : 'lack';
}
function payBattle(i, ci) {
  const b = battles()[i]; const st = scenState().bat[i];
  if (st[ci]) return toast(_T`Este custo já foi pago.`);
  if (!batReqOk(b)) return toast(_T`Requisito não cumprido: ${batReqLabel(b)} (você tem ${batReqHave(b)}).`);
  const [t, n] = b.costs[ci];
  const finish = (res) => {
    commit(() => {
      if (res === 'gold') S.res.gold -= n; else S.res[res] -= 1;
      st[ci] = res;
      log(_T`Batalha ${i + 1}: pagou ${n} ${RES[res].name}`);
      if (batWon(i)) {
        S.res.vp += 20; grantMap('kill');
        log(_T`Batalha ${i + 1} vencida: +20 PV e remover 1 unidade inimiga`);
      }
    });
    if (batWon(i)) mapRewardPrompt(_T`${(BAT_NAME[S.scenId] || ['', _T`Batalha`])[1].replace(/^./, (c) => c.toUpperCase())} ${i + 1} vencida! +20 PV.`);
  };
  if (t === 'gold') { if (S.res.gold < n) return toast(_T`Precisa de ${n} Ouro.`); return finish('gold'); }
  const opts = payOptions(t);
  if (!opts.length) return toast(t === 'any' ? _T`Você não tem Glória, Nobreza nem Valor.` : _T`Você não tem ${RES[t].name}.`);
  if (opts.length === 1) finish(opts[0]); else chooseAny(_T`Batalha ${i + 1}: pagar com`, finish, opts, t === 'any' ? null : _T`Privilégio ativo: este custo aceita outro recurso neste turno.`);
}
function batAvailCount() { return S.turn > 12 ? 0 : battles().filter((_, i) => batState(i) === 'full').length; }

function battlesHtml() {
  const bs = battles(); const won = bs.filter((_, i) => batWon(i)).length;
  const rows = bs.map((b, i) => {
    const st = batState(i); const paid = scenState().bat[i];
    const costs = b.costs.map(([t, n], ci) => {
      const p = paid[ci];
      const icon = t === 'any' ? '<span class="anyc"></span>' : `<img src="${RES[t].icon}" alt="">`;
      const can = !p && st !== 'locked' && (t === 'gold' ? S.res.gold >= n : payOptions(t).length);
      return `<button class="bc ${p ? 'paid' : can ? 'can' : ''}" data-bat="${i}:${ci}" ${p ? 'disabled' : ''}>${t === 'gold' ? n : ''}${icon}${p ? '<i>✕</i>' : ''}</button>`;
    }).join('');
    const reqIcon = ['king', 'church', 'nobles', 'merchants', 'lords', 'castle'].includes(b.req) ? `<img class="act-ic" src="assets/icons/${b.req}.webp" alt="">` : '';
    return _T`<div class="bat ${st}"><div class="bat-h"><b>${i + 1}</b> ${reqIcon}<span class="req ${batReqOk(b) ? 'met' : ''}">${batReqLabel(b)} <small>(${batReqHave(b)})</small></span>
      <span class="bat-st">${{ won: _T`✓ vencida`, full: _T`dá para vencer agora`, ok: _T`pagável`, lack: _T`falta recurso`, locked: _T`bloqueada` }[st]}</span></div>
      <div class="bat-c">${costs}<span class="bat-r">→ −1 inimigo · 20 PV</span></div></div>`;
  }).join('');
  const bn = BAT_NAME[S.scenId];
  return _T`<div class="cp-box"><h3>${bn ? bn[0] : _T`Batalhas`} <small class="muted">${bn ? _T`cumpridas` : _T`vencidas`} ${won} de ${bs.length}</small></h3>${rows}
    <p class="muted small">Toque num custo para pagar (em qualquer ordem e em vários turnos). Ao pagar todos, a batalha é vencida: +20 PV e você remove 1 unidade inimiga.</p></div>`;
}

/* =================== Ação do Rei do Cenário =================== */
function kingCols() { return KING_COLS[S.scenId] || []; }
function kingColText(c, short) {
  const p = [];
  if (c.cp) p.push(_T`${c.cp} Comando`);
  if (c.vp) p.push(_T`${c.vp} PV`);
  for (const k of ['gold', 'g', 'n', 'v']) if (c[k]) p.push(short ? `${c[k]} ${RES[k].name}` : `<span class="ri"><img src="${RES[k].icon}" alt="">${c[k]}</span>`);
  if (c.dip) p.push(_T`${c.dip} Diplomacia`);
  if (c.add) p.push(_T`colocar 1 unidade`);
  if (c.kill) p.push(_T`remover 1 inimiga`);
  if (c.moveOwn) p.push(_T`mover suas unidades`);
  return p.join(' · ');
}
/* Próxima coluna da Ação do Rei: { k, col, ok } ou null se acabou. */
function kingNext() {
  const k = scenState().king; const cols = kingCols();
  if (k >= cols.length) return null;
  return { k, col: cols[k], ok: actLevel('king') >= k };
}
function applyKingCol(notes) {
  const nx = kingNext(); if (!nx || !nx.ok) return null;
  const c = nx.col;
  if (c.cp) S.res.cp += c.cp;
  if (c.vp) S.res.vp += c.vp;
  if (c.dip) S.res.dipP = Math.min(5, S.res.dipP + c.dip);
  for (const k of ['g', 'n', 'v', 'gold']) if (c[k]) gain(k, c[k], notes);
  if (c.kill) grantMap('kill', c.kill); if (c.add) grantMap('add', c.add); if (c.moveOwn) grantMap('moveOwn');
  scenState().king++;
  log(_T`Ação do Rei do Cenário (coluna ${nx.k + 1}): ${kingColText(c, true)}`);
  return c;
}
function kingHtml() {
  const k = scenState().king; const lvl = actLevel('king');
  const cols = kingCols().map((c, i) => {
    const cls = i < k ? 'done' : i === k ? (lvl >= i ? 'next ok' : 'next lock') : '';
    return `<div class="kc ${cls}"><div class="kc-h">${i === 0 ? _T`livre` : _T`Rei ${i}`}${i < k ? ' ✓' : i === k ? _T` · próxima` : ''}</div><div class="kc-b">${kingColText(c)}</div></div>`;
  }).join('');
  const nx = kingNext();
  return _T`<div class="cp-box"><h3><img class="act-ic" src="assets/icons/king.webp" alt=""> Ação do Rei <small class="muted">(você tem Rei ${lvl})</small></h3>
    <div class="kcols">${cols}</div>
    <p class="muted small">${nx ? (nx.ok ? _T`Na próxima vez que um evento ativar o Rei, você recebe a coluna ${nx.k + 1} junto com os ganhos (botão “Receber ganhos”).` : _T`A coluna ${nx.k + 1} exige Rei nível ${nx.k}. Enquanto não tiver, ativar o Rei não dá nada aqui.`) : _T`Todas as colunas já foram usadas.`}</p></div>`;
}

/* =================== Comando =================== */
function cmdList() { return CMD_SCEN[S.scenId] || ['add', 'attack', 'move', 'collect', 'dip']; }
function useCmd(id) {
  if (S.res.cp < 1) return toast(_T`Você não tem Comando neste turno.`);
  if (id === 'dip' && S.res.dipE < 1) return toast(_T`A Diplomacia inimiga já está em 0.`);
  if (id === 'collect') {
    const cf = hasAreas() ? collectFromAreas() : null;
    return collectModal(_T`Coletar recursos`, (pick) => commit(() => { S.res.cp -= 1; const notes = []; for (const [k, n] of Object.entries(pick)) gain(k, n, notes); notes.forEach((t) => log(t)); },
      _T`Comando: coletou ${Object.entries(pick).filter(([, n]) => n).map(([k, n]) => `${n} ${RES[k].name}`).join(', ') || _T`nada`}`),
      cf ? _T`Já somei os recursos não riscados das ${cf.areas} área(s) onde você tem unidades. Confira e ajuste se precisar.` : _T`Some os recursos (os quadrados do mapa) das áreas onde você tem unidades.`, cf && cf.pick);
  }
  if (id === 'attack' && hasAreas()) {
    const p = playerAttackPlan(); if (!p.length) return toast(_T`Nenhuma unidade sua divide área com inimigos: não há o que atacar.`);
    ui.mapPv = { kind: 'pat', plan: p, cmd: true }; ui.tab = 'scen'; ui.scenView = 'map'; return render();
  }
  commit(() => { S.res.cp -= 1; if (id === 'dip') S.res.dipE -= 1; if (id === 'add') S.place = (S.place || 0) + 1; }, _T`Comando: ${CMD_DEF[id].label}`);
  if (id === 'add') { ui.mapTool = 'pu'; ui.scenView = 'map'; ui.tab = 'scen'; }
  if (id === 'attack') { ui.mapTool = 'erase'; ui.scenView = 'map'; ui.tab = 'scen'; }
  if (id === 'move' || id === 'push') { ui.scenView = 'map'; ui.tab = 'scen'; }
  render();
  toast(CMD_DEF[id].hint);
}
function cmdBarHtml() {
  const cp = S.res.cp;
  const pl = S.place || 0;
  return _T`<div class="cmdbar ${cp || pl ? 'on' : 'off'}"><span class="cmd-n">⚑ <b>${cp}</b> Comando</span>${pl ? _T`<span class="place-n">📍 ${pl} unidade${pl > 1 ? 's' : ''} para colocar ${PLACE_ANY.includes(S.scenId) ? _T`(qualquer área permitida)` : _T`(áreas com + verde)`}</span>` : ''}${cmdList().map((id) => `<button class="btn small cmd-b" data-cmd="${id}" ${cp ? '' : 'disabled'} title="${CMD_DEF[id].hint}">${CMD_DEF[id].label}</button>`).join('')}
    ${cp ? '' : _T`<span class="muted small cmd-hint">Ganhe Comando pelo Rei, ações especiais, limiares ou 12 Ouro.</span>`}
    ${ui.tab === 'scen' && S.turn <= 12 ? _T`<button class="btn small back-mesa" data-backmesa>← Mesa (${PHASES[S.phase]})</button>` : ''}</div>`;
}

/* =================== Mapa =================== */
const mapBox = () => MAPBOX[S.scenId] || MAPBOX_DEF;
function cardToMap(x, y) { const [x0, y0, x1, y1] = mapBox(); return [(x - x0) / (x1 - x0), (y - y0) / (y1 - y0)]; }
function mapToCard(u, v) { const [x0, y0, x1, y1] = mapBox(); return [+(x0 + u * (x1 - x0)).toFixed(4), +(y0 + v * (y1 - y0)).toFixed(4)]; }
const MAP_TOOLS = [
  { id: 'pu', label: '<i class="u pu"></i>', name: _T`Sua unidade` },
  { id: 'eu', label: '<i class="u eu"></i>', name: _T`Inimiga` },
  { id: 'x', label: '✕', name: _T`Destruído` },
  { id: 'o', label: '◯', name: _T`Círculo` },
  { id: 'erase', label: '⌫', name: _T`Remover` },
];
function mapCounts() {
  const sc = SC[S.scenId]; const pu = S.marks.scen.filter((m) => m.t === 'pu').length, eu = S.marks.scen.filter((m) => m.t === 'eu').length;
  const warn = [];
  if (eu >= sc.lim[1]) warn.push(_T`Limite de ${sc.lim[1]} unidades inimigas atingido: confira a condição de derrota do cenário.`);
  if (pu > sc.lim[0]) warn.push(_T`Você passou do limite de ${sc.lim[0]} unidades suas.`);
  if (S.res.dipE >= 5) warn.push(_T`Diplomacia inimiga completa: confira a condição de derrota.`);
  if (hasAreas()) warn.push(...areaOver().map((o) => _T`Uma área tem ${o.who === 'pu' ? o.a.pu + _T` unidades suas` : o.a.eu + _T` inimigas`}; o limite é ${o.lim} por área.`));
  return _T`<div class="counts"><span class="${pu > sc.lim[0] ? 'over' : ''}"><i class="u pu"></i> ${pu}/${sc.lim[0]} · máx. ${sc.lim[2]} por área</span>
    <span class="${eu >= sc.lim[1] ? 'over' : ''}"><i class="u eu"></i> ${eu}/${sc.lim[1]} · máx. ${sc.lim[3]} por área</span></div>${warn.map((w) => `<div class="warn">⚠ ${w}</div>`).join('')}`;
}
function mapUnitsHtml() {
  return S.marks.scen.map((m, i) => {
    const [u, v] = cardToMap(m.x, m.y);
    if (u < -0.02 || u > 1.02 || v < -0.02 || v > 1.02) return '';
    const lock = m.t === 'pu' && typeof isStuck === 'function' && isStuck(i);
    return `<div class="mu ${m.t}${lock ? ' stuck' : ''}${m.t === 'eu' && S.kill > 0 ? ' target' : ''}" data-mi="${i}" style="left:${u * 100}%;top:${v * 100}%"${lock ? _T` title="Presa: há inimigo na área"` : ''}>${markSvg(m.t, `map:${m.x},${m.y}`)}${lock ? '<span class="lock">🔒</span>' : ''}</div>`;
  }).join('');
}
function renderMapView(root) {
  const [x0, y0, x1, y1] = mapBox(); const bw = x1 - x0, bh = y1 - y0;
  if (!ui.mapTool) ui.mapTool = 'pu';
  if (!ui.mapZoom) ui.mapZoom = window.innerWidth < 700 ? 1.6 : 1;
  if (root.dataset.built !== S.scenId) {
    root.innerHTML = _T`<div class="cmd-wrap"></div>
      <div class="sheet-tools"><div class="tools map-tools"></div>
        <div class="zoom"><button data-mz="-1" aria-label="Diminuir">−</button><span class="mz"></span><button data-mz="1" aria-label="Aumentar">+</button></div></div>
      <div class="mcounts"></div><div class="as-wrap"></div>
      <div class="viewer mapviewer"><div class="mapv" style="aspect-ratio:${(bw / (bh * 0.70705)).toFixed(4)}">
        <img src="assets/scen/${S.scenId}.webp" alt="Mapa" draggable="false" style="width:${(100 / bw).toFixed(3)}%;left:${(-x0 / bw * 100).toFixed(3)}%;top:${(-y0 / bh * 100).toFixed(3)}%">
        <div class="mlayer"></div></div></div>
      <p class="muted small">Toque no mapa para colocar a peça escolhida (unidade sua só com Comando “Colocar unidade” ou ação do cartão). <b>Arraste</b> qualquer peça para movê-la. Com ⌫, toque numa peça para removê-la. Tudo aparece também no cartão completo.</p>`;
    root.dataset.built = S.scenId;
    bindMap(root);
  }
  $('.cmd-wrap', root).innerHTML = cmdBarHtml();
  $$('[data-cmd]', root).forEach((b) => (b.onclick = () => useCmd(b.dataset.cmd)));
  $$('[data-backmesa]', root).forEach((b) => (b.onclick = () => { ui.tab = 'table'; render(); }));
  $('.map-tools', root).innerHTML = MAP_TOOLS.map((t) => `<button class="tool ${ui.mapTool === t.id ? 'on' : ''}" data-mt="${t.id}" title="${t.name}">${t.label}<small>${t.name}</small></button>`).join('');
  $$('[data-mt]', root).forEach((b) => (b.onclick = () => { ui.mapTool = b.dataset.mt; renderMapView(root); }));
  $('.mcounts', root).innerHTML = goalStripHtml('map') + mapCounts() + cntBarHtml();
  bindCrisp($('.mcounts', root), () => renderMapView(root)); bindCnt($('.mcounts', root)); bindSpecial($('.mcounts', root));
  $('.mapv', root).style.width = ui.mapZoom * 100 + '%';
  $('.mz', root).textContent = Math.round(ui.mapZoom * 100) + '%';
  $('.as-wrap', root).innerHTML = assistHtml(); bindAssist(root);
  if (hasAreas()) layoutUnits();
  $('.mlayer', root).innerHTML = areaHighlightHtml() + mapCrispHtml() + (hasAreas() ? shieldRingsHtml() + areaBadgesHtml() : '') + mapUnitsHtml();
}
function bindMap(root) {
  const mapv = $('.mapv', root); const layer = $('.mlayer', root);
  $$('[data-mz]', root).forEach((b) => (b.onclick = () => { ui.mapZoom = Math.max(1, Math.min(4, +(ui.mapZoom * (+b.dataset.mz > 0 ? 1.3 : 1 / 1.3)).toFixed(2))); renderMapView(root); }));
  let drag = null, justDragged = 0;
  layer.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.mu'); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    drag = { el, i: +el.dataset.mi, sx: e.clientX, sy: e.clientY, moved: false };
    if (hasAreas() && S.marks.scen[drag.i].t === 'pu') { ui.dragFrom = areaOfMark(S.marks.scen[drag.i]); ui.dragStuck = isStuck(drag.i); const h = $('.ahl', layer); const html = areaHighlightHtml(); if (h) h.remove(); layer.insertAdjacentHTML('afterbegin', html); }
    el.setPointerCapture(e.pointerId); el.classList.add('drag');
  });
  layer.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
    if (!drag.moved) return;
    const r = mapv.getBoundingClientRect();
    drag.el.style.left = ((e.clientX - r.left) / r.width) * 100 + '%';
    drag.el.style.top = ((e.clientY - r.top) / r.height) * 100 + '%';
  });
  const end = (e) => {
    if (!drag) return;
    const d = drag; drag = null; d.el.classList.remove('drag'); justDragged = Date.now();
    const from = ui.dragFrom; const stuck = ui.dragStuck; ui.dragFrom = null; ui.dragStuck = false; if (!d.moved && from) renderMapView(root);
    if (d.moved) {
      const r = mapv.getBoundingClientRect();
      const u = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), v = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      const [x, y] = mapToCard(u, v);
      if (stuck && areaAtMap(u, v) !== from) { toast('🔒 ' + stuckMsg()); renderMapView(root); return; }
      if (from && hasAreas()) { const to = areaAtMap(u, v); if (to && to !== from && !areaGraph('pu')[from].includes(to)) toast(AREAS[S.scenId].darr && AREAS[S.scenId].darr.length && (AREAS[S.scenId].radj || []).some(([a, b]) => (a === from && b === to) || (a === to && b === from)) ? _T`Atenção: suas unidades só cruzam o rio pelas setas, no sentido indicado.` : _T`Atenção: a área ${to} não é vizinha da área ${from}. Unidades andam 1 área por Comando (Mover).`); }
      commit(() => { S.marks.scen[d.i].x = x; S.marks.scen[d.i].y = y; layoutUnits(); });
    } else if ((S.kill || 0) > 0 && S.marks.scen[d.i].t === 'eu') {
      commit(() => { S.marks.scen.splice(d.i, 1); S.kill -= 1; layoutUnits(); }, _T`Mapa: removeu 1 unidade inimiga (recompensa)`);
      if (!S.kill) toast(_T`Unidade inimiga removida.`);
    } else if (ui.mapTool === 'erase') {
      const t = S.marks.scen[d.i].t;
      commit(() => { S.marks.scen.splice(d.i, 1); }, t === 'eu' ? _T`Mapa: removeu unidade inimiga` : t === 'pu' ? _T`Mapa: removeu unidade sua` : null);
    }
  };
  layer.addEventListener('pointerup', end);
  layer.addEventListener('pointercancel', () => { ui.dragFrom = null; if (drag) { drag.el.classList.remove('drag'); drag = null; renderMapView(root); } });
  mapv.addEventListener('click', (e) => {
    if (Date.now() - justDragged < 350 || e.target.closest('.mu')) return;
    if (ui.mapPv && ui.mapPv.kind === 'add') { const r0 = mapv.getBoundingClientRect(); if (pvTapArea(areaAtMap((e.clientX - r0.left) / r0.width, (e.clientY - r0.top) / r0.height))) renderMapView(root); return; }
    const tool = ui.mapTool; if (tool === 'erase') return toast(_T`Com ⌫, toque numa peça para removê-la.`);
    const r = mapv.getBoundingClientRect();
    const [x, y] = mapToCard((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    const sc = SC[S.scenId];
    if (tool === 'pu') return placeOwn(x, y, root);
    if (tool === 'eu') {
      const n = S.marks.scen.filter((m) => m.t === tool).length; const lim = sc.lim[1];
      if (n >= lim) toast(_T`Atenção: limite de ${lim} unidades inimigas no mapa.`);
    }
    commit(() => { S.marks.scen.push({ t: tool, x, y }); if (tool === 'eu') layoutUnits(); }, tool === 'pu' ? _T`Mapa: colocou unidade sua` : tool === 'eu' ? _T`Mapa: colocou unidade inimiga` : null);
  });
}

/* Colocar unidade sua: só com uma colocação disponível (Comando “Colocar unidade”, ação de Ouro ou do cartão). */
const PLACE_ANY = ['flood', 'elections', 'duel'];
function placeProblem(x, y) {
  const sc = SC[S.scenId];
  if (S.marks.scen.filter((m) => m.t === 'pu').length >= sc.lim[0]) return _T`Limite de ${sc.lim[0]} unidades suas no mapa.`;
  if (!hasAreas()) return '';
  const [u, v] = cardToMap(x, y); const a = areaAtMap(u, v);
  if (!a || isBlocked(a)) return _T`Aqui não é uma área do mapa.`;
  if (!PLACE_ANY.includes(S.scenId) && !AREAS[S.scenId].ic.some(([k, , , ar]) => k === 'sg' && ar === a)) return _T`Unidades novas só entram em áreas marcadas com + verde.`;
  if (S.marks.scen.filter((m) => m.t === 'pu' && areaOfMark(m) === a).length >= sc.lim[2]) return _T`Limite de ${sc.lim[2]} unidades suas por área.`;
  return '';
}
function placeOwn(x, y, root, force) {
  const put = (useCp) => commit(() => {
    if (useCp) { S.res.cp -= 1; log(_T`Comando: Colocar unidade`); } else if (!force) S.place -= 1;
    S.marks.scen.push({ t: 'pu', x, y }); layoutUnits();
  }, force ? _T`Mapa: colocou unidade sua (correção manual)` : _T`Mapa: colocou unidade sua`);
  if (force) return put(false);
  const prob = placeProblem(x, y);
  if (!prob && (S.place || 0) > 0) return put(false);
  const canCp = !prob && S.res.cp > 0 && cmdList().includes('add');
  modal(_T`<h2>${prob ? _T`✋ Não dá para colocar aqui` : _T`Colocar unidade sua`}</h2>${prob ? `<p><b>${prob}</b></p>` : _T`<p>Você começa sem unidades no mapa. Cada unidade nova entra pelo Comando <b>Colocar unidade</b> (1 Comando) ou por uma ação do cartão que coloca unidade.</p>`}
    <div class="menu">${canCp ? _T`<button class="btn primary" data-pcp>Usar 1 Comando e colocar aqui</button>` : prob ? '' : _T`<p class="muted small">Você tem ${S.res.cp} Comando neste turno.</p>`}
    <button class="btn" data-pforce>Colocar mesmo assim (correção)</button><button class="btn" data-close>Cancelar</button></div>`, () => {
    const c = $('[data-pcp]'); if (c) c.onclick = () => { closeModal(); put(true); };
    $('[data-pforce]').onclick = () => { closeModal(); placeOwn(x, y, root, true); };
  });
}

/* =================== Aba Cenário =================== */
function renderScen() {
  const el = $('#tab-scen');
  if (!ui.scenView) ui.scenView = 'map';
  if (el.dataset.scenBuilt !== S.scenId + S.charId) {
    el.innerHTML = _T`<div class="seg scen-seg"><button data-sv="map">Mapa</button><button data-sv="acts">Ações</button><button data-sv="card">Cartão</button><button data-sv="guide">Guia</button></div>
      <div id="scen-map"></div><div id="scen-acts"></div><div id="scen-card"></div><div id="scen-guide"></div>`;
    el.dataset.scenBuilt = S.scenId + S.charId;
    $$('[data-sv]', el).forEach((b) => (b.onclick = () => { ui.scenView = b.dataset.sv; renderScen(); }));
  }
  const nAct = goldAvailCount() + batAvailCount();
  $$('[data-sv]', el).forEach((b) => { b.classList.toggle('on', b.dataset.sv === ui.scenView); b.dataset.badge = b.dataset.sv === 'acts' && nAct ? nAct : ''; });
  $('#scen-map', el).hidden = ui.scenView !== 'map';
  $('#scen-acts', el).hidden = ui.scenView !== 'acts';
  $('#scen-card', el).hidden = ui.scenView !== 'card';
  $('#scen-guide', el).hidden = ui.scenView !== 'guide';
  if (ui.scenView === 'guide') $('#scen-guide', el).innerHTML = scenGuideHtml();
  else if (ui.scenView === 'map') renderMapView($('#scen-map', el));
  else if (ui.scenView === 'acts') {
    const a = $('#scen-acts', el);
    a.innerHTML = `${wlPanelHtml()}<div class="cp-box">${cmdBarHtml()}</div>${battlesHtml()}${infPanelHtml()}${kingHtml()}${goldPanelHtml()}`;
    bindWl(a);
    $$('[data-cmd]', a).forEach((b) => (b.onclick = () => useCmd(b.dataset.cmd)));
    $$('[data-backmesa]', a).forEach((b) => (b.onclick = () => { ui.tab = 'table'; render(); }));
    $$('[data-bat]', a).forEach((b) => (b.onclick = () => { const [i, ci] = b.dataset.bat.split(':').map(Number); payBattle(i, ci); }));
    bindGoldPanel(a);
  } else renderSheet('scen');
}

/* Seletor de recursos coletados do mapa. */
function collectModal(title, onOk, note, init) {
  const pick = Object.assign({ g: 0, n: 0, v: 0, gold: 0 }, init || {});
  const draw = () => modal(_T`<h2>${title}</h2><p class="muted small">${note || _T`Some os recursos (os quadrados do mapa) da área escolhida.`}</p>
    <div class="steps">${Object.keys(pick).map((k) => `<div class="stp"><img src="${RES[k].icon}" alt=""><button data-s="${k}:-1">−</button><b>${pick[k]}</b><button data-s="${k}:1">+</button></div>`).join('')}</div>
    <button class="btn primary" data-ok>Receber</button>`, () => {
    $$('[data-s]').forEach((b) => (b.onclick = () => { const [k, d] = b.dataset.s.split(':'); pick[k] = Math.max(0, pick[k] + +d); draw(); }));
    $('[data-ok]').onclick = () => { closeModal(); onOk(pick); };
  });
  draw();
}
