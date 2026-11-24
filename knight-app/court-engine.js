'use strict';
/* Motor da carta Corte: pagamento de custos, requisitos, recompensas, Influência e ativação de ações. */

const LORDS = ['lord1', 'lord2', 'lord3', 'lord4', 'lord5', 'lord6'];
const ACT_NAMES = {
  king: _T`Rei`, church: _T`Igreja`, nobles: _T`Nobres`, merchants: _T`Mercadores`, lords: _T`Senhores`, combat: _T`Combate`,
  knowledge: _T`Conhecimento`, fame: _T`Fama`, tournaments: _T`Torneios`, village: _T`Vila`, castle: _T`Castelo`, stable: _T`Estábulo`, armory: _T`Arsenal`,
};
const RES_SHORT = { g: _T`Glória`, n: _T`Nobreza`, v: _T`Valor`, gold: _T`Ouro`, vp: _T`PV`, dip: _T`Diplomacia`, cp: _T`Comando` };

function courtInit() {
  const paid = {};
  for (const [tid, t] of Object.entries(COURT.tracks)) paid[tid] = t.segs.map((s) => s.c.map(() => null));
  return { paid, rooms: {}, chains: {}, full: {} };
}
function courtState() { if (!S.court) S.court = courtInit(); return S.court; }

const segDone = (tid, si) => courtState().paid[tid][si].every((p) => p !== null);
const trackDone = (tid) => COURT.tracks[tid].segs.every((_, si) => segDone(tid, si));
const floorsDone = () => [0, 1, 2].filter((f) => COURT.castle.rooms.every((r, i) => r.floor !== f || courtState().rooms[i])).length;

function actLevel(act) {
  if (act === 'castle') return floorsDone();
  if (act === 'lords') return LORDS.reduce((n, l) => n + COURT.tracks[l].segs.filter((s, si) => s.hex && segDone(l, si)).length, 0);
  const t = COURT.tracks[act]; if (!t) return 0;
  if (act === 'village' || act === 'armory') return t.segs.filter((_, si) => segDone(act, si)).length;
  return t.segs.filter((s, si) => s.hex && segDone(act, si)).length;
}
function reqText(req) {
  if (!req) return '';
  return req.inf != null ? _T`Influência ${req.inf}` : _T`${ACT_NAMES[req.act]} nível ${req.lvl}`;
}
function reqMet(req) {
  if (!req) return true;
  if (req.inf != null) return S.res.inf >= req.inf;
  return actLevel(req.act) >= req.lvl;
}
function whyBlocked(tid, si) {
  const t = COURT.tracks[tid]; const seg = t.segs[si];
  if (t.mode === 'seq') for (let k = 0; k < si; k++) if (!segDone(tid, k)) return _T`Complete antes o segmento anterior desta trilha.`;
  if (!reqMet(seg.req)) return _T`Requisito não cumprido: ${reqText(seg.req)} (você tem ${seg.req.inf != null ? S.res.inf : actLevel(seg.req.act)}).`;
  return null;
}
function fmtRes(r) { return Object.entries(r).map(([k, n]) => `+${n} ${RES_SHORT[k] || k}`).join(', '); }

function applyRewards(r, notes) {
  for (const [k, n] of Object.entries(r)) {
    if (k === 'vp') S.res.vp += n;
    else if (k === 'dip') S.res.dipP = Math.min(5, S.res.dipP + n);
    else if (k === 'cp') S.res.cp += n;
    else gain(k, n, notes);
  }
}

/* Escolha do recurso para custos "qualquer" (e para as salas do Castelo). */
function chooseAny(title, cb, list, note, gainMode) {
  list = list || ['g', 'n', 'v'];
  const opts = list.map((k) => `<button class="btn any-pick" data-k="${k}" ${!gainMode && S.res[k] < 1 ? 'disabled' : ''}><img src="${RES[k].icon}" alt="">${RES[k].name} <small>(${S.res[k]})</small></button>`).join('');
  modal(`<h2>${title}</h2><p class="muted small">${note || _T`Custo em branco aceita qualquer recurso (não Ouro).`}</p><div class="any-row">${opts}</div>`, () => {
    $$('.any-pick').forEach((b) => (b.onclick = () => { closeModal(); cb(b.dataset.k); }));
  });
}

function payCell(tid, si, ci) {
  const st = courtState(); const seg = COURT.tracks[tid].segs[si]; const type = seg.c[ci][2];
  if (st.paid[tid][si][ci]) return toast(_T`Este custo já foi pago.`);
  const block = whyBlocked(tid, si); if (block) return toast(block);
  const finish = (res) => {
    if (S.res[res] < 1) return toast(_T`Você não tem ${RES[res].name}.`);
    commit(() => {
      S.res[res] -= 1; st.paid[tid][si][ci] = res;
      log(_T`Corte · ${COURT.tracks[tid].name}: pagou 1 ${RES[res].name}`);
      if (segDone(tid, si)) onSegDone(tid, si);
    });
  };
  const opts = payOptions(type);
  if (!opts.length) return toast(type === 'any' ? _T`Você não tem Glória, Nobreza nem Valor.` : _T`Você não tem ${RES[type].name}.`);
  if (opts.length === 1) finish(opts[0]);
  else chooseAny(_T`${COURT.tracks[tid].name}: pagar com`, finish, opts, type === 'any' ? null : _T`Privilégio ativo: este custo aceita outro recurso neste turno.`);
}
function onSegDone(tid, si) {
  const t = COURT.tracks[tid]; const seg = t.segs[si]; const notes = []; const msgs = [];
  if (Object.keys(seg.rew).length) { applyRewards(seg.rew, notes); msgs.push(_T`recompensa imediata ${fmtRes(seg.rew)}`); }
  if (seg.hex) { S.res.inf = Math.min(33, S.res.inf + 1); msgs.push(_T`+1 Influência`); }
  if (Object.keys(seg.gain).length) msgs.push(_T`ganho destravado: ${fmtRes(seg.gain)} a cada ativação (não vem agora)`);
  const st = courtState();
  if (trackDone(tid) && t.vp && !st.full[tid]) { st.full[tid] = true; S.res.vp += t.vp; msgs.push(_T`trilha completa: +${t.vp} PV`); }
  const label = _T`${t.name}: segmento ${si + 1} desbloqueado${msgs.length ? ' (' + msgs.join('; ') + ')' : ''}`;
  log(label); notes.forEach((n) => log(n));
  setTimeout(() => toast(label + (notes.length ? ' · ' + notes.join(' · ') : '')), 30);
}
function unpayCell(tid, si, ci) {
  const st = courtState(); const res = st.paid[tid][si][ci];
  if (!res) return;
  if (segDone(tid, si)) return toast(_T`Este segmento já foi concluído. Use ↶ desfazer para voltar atrás.`);
  commit(() => { st.paid[tid][si][ci] = null; S.res[res] += 1; }, _T`Corte · ${COURT.tracks[tid].name}: estornou 1 ${RES[res].name}`);
}

function payRoom(i) {
  const st = courtState(); const room = COURT.castle.rooms[i];
  if (st.rooms[i]) return toast(_T`Esta sala já foi construída.`);
  if (S.res.gold < 1) return toast(_T`Cada sala custa 1 Ouro + 1 recurso à sua escolha.`);
  chooseAny(_T`Sala do Castelo: 1 Ouro + 1 recurso`, (res) => {
    if (S.res[res] < 1 || S.res.gold < 1) return toast(_T`Recursos insuficientes.`);
    commit(() => {
      const before = floorsDone(); const notes = [];
      S.res.gold -= 1; S.res[res] -= 1; st.rooms[i] = res;
      applyRewards(room.rew, notes);
      const parts = [];
      if (Object.keys(room.rew).length) parts.push(_T`recompensa imediata ${fmtRes(room.rew)}`);
      if (Object.keys(room.gain).length) parts.push(_T`ganho ${fmtRes(room.gain)} por ativação`);
      if (floorsDone() > before) parts.push(_T`andar completo: Castelo nível ${floorsDone()} — você pode ligar a Vila ou o Estábulo (toque na corrente)`);
      const label = _T`Castelo: sala construída${parts.length ? ' (' + parts.join('; ') + ')' : ''}`;
      log(label); notes.forEach((n) => log(n));
      setTimeout(() => toast(label), 30);
    });
  });
}
function toggleChain(id) {
  const st = courtState(); const ch = COURT.chains[id];
  if (st.chains[id]) return toast(_T`Esta ligação já foi feita. Use ↶ desfazer para voltar atrás.`);
  if (ch.a === 'castle') {
    const used = Object.keys(st.chains).filter((k) => COURT.chains[k].a === 'castle').length;
    if (floorsDone() <= used) return toast(_T`Complete um andar inteiro do Castelo para fazer esta ligação.`);
    commit(() => { st.chains[id] = 'castle'; }, _T`Castelo ligado a ${ACT_NAMES[ch.b]}: ativar Castelo também ativa ${ACT_NAMES[ch.b]}`);
    return;
  }
  const from = trackDone(ch.a) ? ch.a : trackDone(ch.b) ? ch.b : null;
  if (!from) return toast(_T`Complete toda a trilha de ${ACT_NAMES[ch.a]} ou de ${ACT_NAMES[ch.b]} para riscar esta corrente.`);
  const to = from === ch.a ? ch.b : ch.a;
  commit(() => { st.chains[id] = from; }, _T`Corrente: ativar ${ACT_NAMES[from]} também ativa ${ACT_NAMES[to]}`);
}

/* Ganhos de uma ativação (inclui correntes e ligações do Castelo). */
function trackGains(tid, into) {
  COURT.tracks[tid].segs.forEach((s, si) => { if (segDone(tid, si)) for (const [k, n] of Object.entries(s.gain)) into[k] = (into[k] || 0) + n; });
}
function activationGains(act, seen = new Set()) {
  const out = {}; const src = [];
  if (seen.has(act)) return { out, src }; seen.add(act);
  const st = courtState();
  if (act === 'lords') LORDS.forEach((l) => trackGains(l, out));
  else if (act === 'castle') {
    COURT.castle.rooms.forEach((r, i) => { if (st.rooms[i]) for (const [k, n] of Object.entries(r.gain)) out[k] = (out[k] || 0) + n; });
    for (const [id, from] of Object.entries(st.chains)) if (from === 'castle') { trackGains(COURT.chains[id].b, out); src.push(ACT_NAMES[COURT.chains[id].b]); }
  } else if (COURT.tracks[act]) trackGains(act, out);
  if (['church', 'nobles', 'merchants'].includes(act)) {
    for (const [id, from] of Object.entries(st.chains)) {
      if (from !== act) continue;
      const ch = COURT.chains[id]; const other = ch.a === act ? ch.b : ch.a;
      const sub = activationGains(other, seen);
      for (const [k, n] of Object.entries(sub.out)) out[k] = (out[k] || 0) + n;
      src.push(ACT_NAMES[other], ...sub.src);
    }
  }
  return { out, src };
}

/* Pontos clicáveis na carta Corte. */
function courtHotspots() {
  const st = courtState(); const hs = [];
  for (const [tid, t] of Object.entries(COURT.tracks)) t.segs.forEach((s, si) => s.c.forEach(([x, y, type], ci) => hs.push({ k: 'cell', tid, si, ci, x, y, type, paid: st.paid[tid][si][ci], done: segDone(tid, si) })));
  COURT.castle.rooms.forEach((r, i) => hs.push({ k: 'room', i, x: r.x, y: r.y, paid: st.rooms[i] }));
  for (const [id, c] of Object.entries(COURT.chains)) hs.push({ k: 'chain', id, x: c.x, y: c.y, paid: st.chains[id] });
  return hs;
}
function courtMarksHtml() {
  return courtHotspots().filter((h) => h.paid).map((h) => {
    const sd = `court:${h.x},${h.y}`;
    if (h.k === 'room') return penOn() ? `<div class="ck room pen-room" style="left:${h.x * 100}%;top:${h.y * 100}%">${markSvg('hatch', sd)}</div>` : `<div class="ck room" style="left:${h.x * 100}%;top:${h.y * 100}%"></div>`;
    if (h.k === 'chain') return `<div class="ck chain" style="left:${h.x * 100}%;top:${h.y * 100}%">${markSvg('x', sd)}</div>`;
    return `<div class="ck cell ${h.done ? 'done' : ''}" style="left:${h.x * 100}%;top:${h.y * 100}%">${markSvg('x', sd)}</div>`;
  }).join('') + courtLevelMarksHtml();
}

/* Barras de nível (hexágonos 1, 2, 3… ao lado de cada ação), detectadas no cartão (tools/levels.py). */
const LEVEL_HEX = {"lords":[[0.0325,0.4623],[0.0488,0.4629],[0.0646,0.4629],[0.0362,0.5471],[0.0517,0.5471],[0.0667,0.5465]],"king":[[0.0583,0.0206],[0.0746,0.0212],[0.0904,0.0212],[0.1062,0.0212]],"church":[[0.0587,0.2256],[0.0725,0.2256],[0.0862,0.2256]],"combat":[[0.0629,0.6337],[0.0767,0.6337],[0.0904,0.6337]],"village":[[0.0675,0.828],[0.0833,0.828],[0.0992,0.828],[0.1154,0.828]],"castle":[[0.3463,0.8163],[0.3625,0.8163],[0.3783,0.8163]],"knowledge":[[0.3908,0.6325],[0.405,0.6325],[0.4188,0.6325]],"nobles":[[0.3937,0.2273],[0.4075,0.2273],[0.4213,0.2273]],"stable":[[0.6121,0.8157],[0.6283,0.8157],[0.6442,0.8157]],"fame":[[0.7204,0.6302],[0.7342,0.6302],[0.748,0.6302]],"merchants":[[0.7292,0.2261],[0.7433,0.2261],[0.7571,0.2261]],"tournaments":[[0.7621,0.0489],[0.7783,0.0495],[0.7937,0.0495],[0.81,0.0495]],"armory":[[0.8246,0.808],[0.8408,0.8086],[0.8567,0.8086],[0.8725,0.8086],[0.8883,0.8086],[0.9042,0.8086]]};
function courtLevelMarksHtml() {
  let h = '';
  for (const [a, pts] of Object.entries(LEVEL_HEX)) {
    const n = Math.min(pts.length, actLevel(a));
    for (let i = 0; i < n; i++) h += _T`<div class="ck lvl" style="left:${pts[i][0] * 100}%;top:${pts[i][1] * 100}%" title="${ACT_NAMES[a]} nível ${i + 1}">${markSvg('x', `court:lv${a}${i}`)}</div>`;
  }
  return h;
}
function courtClick(x, y, rw, rh, erase) {
  let best = null, bd = Infinity;
  for (const h of courtHotspots()) {
    const d = Math.hypot((h.x - x) * rw, (h.y - y) * rh * 1);
    if (d < bd) { bd = d; best = h; }
  }
  const tol = rw * 0.02;
  if (!best || bd > tol) return false;
  if (erase) {
    if (best.k === 'cell') unpayCell(best.tid, best.si, best.ci);
    else toast(_T`Use ↶ desfazer para voltar atrás.`);
    return true;
  }
  if (best.k === 'cell') payCell(best.tid, best.si, best.ci);
  else if (best.k === 'room') payRoom(best.i);
  else toggleChain(best.id);
  return true;
}
function courtSummaryHtml() {
  const acts = ['king', 'church', 'nobles', 'merchants', 'lords', 'castle', 'village', 'stable', 'armory', 'combat', 'knowledge', 'fame', 'tournaments'];
  const max = { king: 4, church: 3, nobles: 3, merchants: 3, lords: 6, castle: 3, village: 4, stable: 3, armory: 6, combat: 3, knowledge: 3, fame: 3, tournaments: 4 };
  return `<div class="levels">${acts.map((a) => { const g = goalActNeed(a); return `<span class="lv ${actLevel(a) >= max[a] ? 'max' : actLevel(a) ? 'on' : ''} ${g ? 'goal ' + g.role + (g.ok ? ' ok' : '') : ''}">${ACT_NAMES[a]} <b>${actLevel(a)}</b>${g ? `<i>🎯${g.need}</i>` : ''}</span>`; }).join('')}</div>`;
}

/* ---------- Disponibilidade (o que dá para pagar agora) ---------- */
function cellAvail(tid, si, ci) {
  const st = courtState();
  if (st.paid[tid][si][ci]) return 'paid';
  if (whyBlocked(tid, si)) return 'locked';
  const type = COURT.tracks[tid].segs[si].c[ci][2];
  const opts = payOptions(type);
  if (!opts.length) return 'lack';
  const sw = swapActive();
  // Custo convertível pelo privilégio: dá para pagar com um recurso diferente do original.
  if (sw && type !== 'any' && sw.from.includes(type) && opts.some((k) => k !== type)) return 'conv';
  return 'ok';
}
/* O segmento inteiro pode ser concluído agora com os recursos atuais? */
function segCompletable(tid, si) {
  const st = courtState(); const seg = COURT.tracks[tid].segs[si];
  if (segDone(tid, si) || whyBlocked(tid, si)) return false;
  // Atribui cada custo restante a um recurso (considera "qualquer" e a troca do privilégio).
  const sw = swapActive();
  const costs = seg.c.filter((_, ci) => !st.paid[tid][si][ci]).map(([, , t]) => {
    if (t === 'any') return ['g', 'n', 'v'];
    if (sw && sw.from.includes(t)) return [...new Set([t, ...sw.to])];
    return [t];
  }).sort((a, b) => a.length - b.length);
  const left = { g: S.res.g, n: S.res.n, v: S.res.v, gold: S.res.gold };
  const fit = (i) => {
    if (i === costs.length) return true;
    for (const k of costs[i]) { if (left[k] > 0) { left[k]--; if (fit(i + 1)) return true; left[k]++; } }
    return false;
  };
  return fit(0);
}
function roomAvail(i) {
  if (courtState().rooms[i]) return 'paid';
  return S.res.gold >= 1 && S.res.g + S.res.n + S.res.v >= 1 ? 'ok' : 'lack';
}
function chainAvail(id) {
  const st = courtState(); const ch = COURT.chains[id];
  if (st.chains[id]) return 'paid';
  if (ch.a === 'castle') return floorsDone() > Object.keys(st.chains).filter((k) => COURT.chains[k].a === 'castle').length ? 'ok' : 'locked';
  return trackDone(ch.a) || trackDone(ch.b) ? 'ok' : 'locked';
}
function courtAvailSummary() {
  let cells = 0, segs = 0, rooms = 0, chains = 0;
  for (const [tid, t] of Object.entries(COURT.tracks)) t.segs.forEach((s, si) => {
    let any = false;
    s.c.forEach((_, ci) => { const a = cellAvail(tid, si, ci); if (a === 'ok' || a === 'conv') { cells++; any = true; } });
    if (any && segCompletable(tid, si)) segs++;
  });
  COURT.castle.rooms.forEach((_, i) => { if (roomAvail(i) === 'ok') rooms++; });
  Object.keys(COURT.chains).forEach((id) => { if (chainAvail(id) === 'ok') chains++; });
  return { cells, segs, rooms: rooms ? 1 : 0, chains, total: cells + (rooms ? 1 : 0) + chains };
}
function courtAvailHtml() {
  const out = [];
  for (const [tid, t] of Object.entries(COURT.tracks)) t.segs.forEach((s, si) => {
    const full = segCompletable(tid, si);
    s.c.forEach(([x, y], ci) => {
      const a = cellAvail(tid, si, ci);
      if (a === 'ok' || a === 'conv' || a === 'lack') out.push(`<div class="hl ${a === 'conv' ? 'conv' + (full ? ' fullc' : '') : a === 'ok' ? (full ? 'full' : 'ok') : 'lack'}" style="left:${x * 100}%;top:${y * 100}%"></div>`);
    });
  });
  COURT.castle.rooms.forEach((r, i) => { if (roomAvail(i) === 'ok') out.push(`<div class="hl room ok" style="left:${r.x * 100}%;top:${r.y * 100}%"></div>`); });
  for (const [id, c] of Object.entries(COURT.chains)) if (chainAvail(id) === 'ok') out.push(`<div class="hl chain ok" style="left:${c.x * 100}%;top:${c.y * 100}%"></div>`);
  return out.join('');
}

/* ---------- Contagem regressiva por segmento e ganhos desbloqueados ---------- */
const BADGE_DY = 48 / 2007;
function courtCountHtml() {
  const st = courtState(); const out = [];
  for (const [tid, t] of Object.entries(COURT.tracks)) t.segs.forEach((s, si) => {
    const xs = s.c.map((c) => c[0]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2; const cy = s.c[0][1] - BADGE_DY;
    const left = st.paid[tid][si].filter((p) => p === null).length;
    if (left === 0) out.push(`<div class="cnt done" style="left:${cx * 100}%;top:${cy * 100}%">✓</div>`);
    else if (left < s.c.length || !whyBlocked(tid, si)) out.push(_T`<div class="cnt ${left < s.c.length ? 'part' : ''}" style="left:${cx * 100}%;top:${cy * 100}%"><span class="cw">faltam </span>${left}</div>`);
  });
  COURT.castle.rooms.forEach((r, i) => { if (st.rooms[i]) out.push(`<div class="cnt done" style="left:${r.x * 100}%;top:${(r.y - 0.03) * 100}%">✓</div>`); });
  return out.join('');
}
function courtGainsHtml() {
  const acts = ['king', 'church', 'nobles', 'merchants', 'lords', 'castle'];
  const pv = CHAR_SKILLS[S.charId].priv;
  return _T`<div class="gains-sum"><span class="gs-h">Cada ativação rende hoje:</span>${acts.map((a) => {
    const g = activationGains(a); const has = Object.keys(g.out).length;
    const priv = a === pv.act && pv.plus ? ` <small>+priv.</small>` : '';
    return `<span class="gs ${has ? 'on' : ''}"><img src="assets/icons/${a}.webp" alt="">${has ? resList(g.out) : '<span class="muted">—</span>'}${priv}${g.src.length ? `<small> (+${g.src.join(', ')})</small>` : ''}</span>`;
  }).join('')}</div>`;
}
