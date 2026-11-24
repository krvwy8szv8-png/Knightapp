'use strict';
/* Avaliação automática da carta de objetivo. */

const unitsOf = (t) => S.marks.scen.filter((m) => m.t === t).length;
/* Retorna { ok, text, have } para uma condição. */
function goalCond(c) {
  const k = Object.keys(c)[0];
  switch (k) {
    case 'acts': return { ok: c.acts.every(([a, l]) => actLevel(a) >= l), text: c.acts.map(([a, l]) => `${ACT_NAMES[a]} ${l}`).join(' + '), have: c.acts.map(([a]) => `${ACT_NAMES[a]} ${actLevel(a)}`).join(', ') };
    case 'vp': return { ok: S.res.vp >= c.vp, text: _T`${c.vp} PV ou mais`, have: _T`${S.res.vp} PV` };
    case 'inf': return { ok: S.res.inf >= c.inf, text: _T`Influência ${c.inf} ou mais`, have: _T`Influência ${S.res.inf}` };
    case 'gold': return { ok: S.res.gold >= c.gold, text: _T`${c.gold} Ouro ou mais`, have: _T`${S.res.gold} Ouro` };
    case 'pu': return { ok: unitsOf('pu') >= c.pu, text: _T`${c.pu} unidades suas ou mais no mapa`, have: _T`${unitsOf('pu')} unidades` };
    case 'infLt': return { ok: S.res.inf < c.infLt, text: _T`Influência menor que ${c.infLt}`, have: _T`Influência ${S.res.inf}` };
    case 'vpLt': return { ok: S.res.vp < c.vpLt, text: _T`menos de ${c.vpLt} PV`, have: _T`${S.res.vp} PV` };
    case 'puLt': return { ok: unitsOf('pu') < c.puLt, text: _T`menos de ${c.puLt} unidades suas no mapa`, have: _T`${unitsOf('pu')} unidades` };
    case 'euGe': return { ok: unitsOf('eu') >= c.euGe, text: _T`${c.euGe} ou mais unidades inimigas no mapa`, have: _T`${unitsOf('eu')} inimigas` };
    case 'euGtPu': return { ok: unitsOf('eu') > unitsOf('pu'), text: _T`mais unidades inimigas que suas no mapa`, have: _T`${unitsOf('eu')} inimigas × ${unitsOf('pu')} suas` };
    case 'dipPLt': return { ok: S.res.dipP < c.dipPLt, text: _T`sua Diplomacia menor que ${c.dipPLt}`, have: _T`Diplomacia ${S.res.dipP}` };
    case 'dipP0': return { ok: S.res.dipP === 0, text: _T`sua Diplomacia em 0`, have: _T`Diplomacia ${S.res.dipP}` };
    case 'gold0': return { ok: S.res.gold === 0, text: _T`nenhum Ouro`, have: _T`${S.res.gold} Ouro` };
  }
  return { ok: false, text: '?', have: '' };
}
function goalRewText(r) {
  const p = [];
  for (const k of ['g', 'n', 'v', 'gold']) if (r[k]) p.push(`<span class="ri"><img src="${RES[k].icon}" alt="">${r[k]}</span>`);
  if (r.cp) p.push(_T`${r.cp} Comando`);
  if (r.dip) p.push(_T`${r.dip} Diplomacia`);
  return p.join(' ');
}
function goalPenText(p) {
  const t = [];
  if (p.zero) t.push(_T`zerar ${p.zero.map((k) => RES[k].name).join(', ')}`);
  if (p.dipE) t.push(_T`+${p.dipE} Diplomacia inimiga`);
  if (p.enemy) t.push(_T`ativação do inimigo: ${effText('a' + Math.min(3, p.enemy))}`);
  return t.join(' · ');
}
const goalCol = (col) => (GOAL_DATA[S.goal] || [])[col - 1];

/* Faixa na Mesa com o objetivo da etapa atual. */
function goalBarHtml() {
  const pend = [1, 2, 3].find((c) => S.turn > c * 3 && !S.goalDone[c] && goalCol(c));
  const pendHtml = pend ? _T`<button class="goal-pend" data-goalpend="${pend}">⚠ Objetivo do fim do turno ${pend * 3} ainda não foi aplicado · toque para avaliar</button>` : '';
  if (S.turn > 9) return pendHtml;
  const col = Math.ceil(S.turn / 3); const g = goalCol(col); if (!g) return '';
  const a = goalCond(g.ok), b = goalCond(g.bad);
  return pendHtml + _T`<button class="goal-bar" data-goal>
    <span class="gb-t">Objetivo · fim do turno ${col * 3}</span>
    <span class="gb-r ${a.ok ? 'yes' : ''}">${a.ok ? '✓' : '★'} ${esc(a.text)} <small>(${esc(a.have)})</small> → ${goalRewText(g.rew)}</span>
    <span class="gb-p ${b.ok ? 'yes' : ''}">${b.ok ? '⚠' : '○'} Penalidade se ${esc(b.text)} <small>(${esc(b.have)})</small> → ${goalPenText(g.pen)}</span>
    <span class="gb-n">Faltam ${col * 3 - S.turn + 1} turno(s) contando este · metas marcadas com 🎯 no painel, na Corte e no mapa</span>
  </button>`;
}

/* Modal de avaliação no fim dos turnos 3, 6 e 9. */
function evalGoal(col) {
  const g = goalCol(col);
  if (!g) return showGoal(col, true);
  const done = S.goalDone[col];
  const a = goalCond(g.ok), b = goalCond(g.bad);
  const draw = (getRew, getPen) => modal(_T`<h2>Objetivo · fim do turno ${col * 3}</h2>
    <div class="goal-view" style="--col:${col - 1}"><img src="assets/goals/${S.goal}.webp" alt="Objetivo"><div class="col-mask"></div></div>
    ${done ? _T`<p class="ok">✓ Esta coluna já foi avaliada.</p>` : _T`
    <div class="ge ${getRew ? 'yes' : ''}"><label class="check"><input type="checkbox" id="ge-r" ${getRew ? 'checked' : ''}> <b>Recompensa</b></label>
      <div>${esc(a.text)} · você tem ${esc(a.have)} ${a.ok ? _T`<span class="ok">cumprido</span>` : _T`<span class="muted">não cumprido</span>`}</div><div>→ ${goalRewText(g.rew)}</div></div>
    <div class="ge pen ${getPen ? 'yes' : ''}"><label class="check"><input type="checkbox" id="ge-p" ${getPen ? 'checked' : ''}> <b>Penalidade</b></label>
      <div>${esc(b.text)} · você tem ${esc(b.have)} ${b.ok ? _T`<span class="bad">acontece</span>` : _T`<span class="muted">evitada</span>`}</div><div>→ ${goalPenText(g.pen)}</div></div>
    <p class="muted small">O app marcou as caixas conforme o estado atual. Contagens de unidades vêm do mapa: se o mapa não estiver em dia, corrija aqui antes de aplicar.</p>
    <button class="btn primary" data-apply>Aplicar</button>`}`, () => {
    const ap = $('[data-apply]'); if (!ap) return;
    ap.onclick = () => {
      const r = $('#ge-r').checked, p = $('#ge-p').checked;
      closeModal();
      commit(() => {
        const notes = [];
        if (r) { applyRewards(g.rew, notes); log(_T`Objetivo ${col * 3}: recompensa ${goalRewText(g.rew).replace(/<[^>]+>/g, '')}`); }
        if (p) {
          if (g.pen.zero) g.pen.zero.forEach((k) => (S.res[k] = 0));
          if (g.pen.dipE) S.res.dipE = Math.min(5, S.res.dipE + g.pen.dipE);
          log(_T`Objetivo ${col * 3}: penalidade ${goalPenText(g.pen)}`);
        }
        if (!r && !p) log(_T`Objetivo ${col * 3}: sem recompensa nem penalidade`);
        notes.forEach((n) => log(n));
        S.goalDone[col] = true; S.goalLog = S.goalLog || {}; S.goalLog[col] = { rew: !!r, pen: !!p };
      });
      if (p && g.pen.enemy) {
        if (hasAreas()) { consRunStart(-1, 'a' + Math.min(3, g.pen.enemy)); toast(_T`Penalidade do objetivo: confira no mapa onde as unidades inimigas entram e toque em Aplicar.`); }
        else { ui.tab = 'scen'; ui.scenView = 'map'; ui.mapTool = 'eu'; render(); toast(_T`Penalidade (ativação do inimigo): ${effText('a' + Math.min(3, g.pen.enemy))}. Marque no mapa.`); }
      }
      else toast(r || p ? _T`Objetivo aplicado.` : _T`Nada a aplicar nesta coluna.`);
    };
  });
  draw(a.ok, b.ok);
}

/* =================== Destaque das metas da próxima avaliação =================== */
// Lista do que a próxima coluna do objetivo vai julgar.
// role: 'rew' (meta para ganhar a recompensa) ou 'pen' (meta para evitar a penalidade).
// kind: 'res' (valor do painel), 'act' (nível na Corte), 'pu'/'eu' (unidades no mapa). need = valor que cumpre a meta.
function goalTargets() {
  if (!S || S.turn > 9) return [];
  const col = Math.ceil(S.turn / 3); if ((S.goalDone || {})[col]) return [];
  const g = goalCol(col); if (!g) return [];
  const out = [];
  const add = (c, role) => {
    const k = Object.keys(c)[0];
    if (k === 'acts') c.acts.forEach(([a, l]) => out.push({ role, kind: 'act', key: a, need: l, ok: actLevel(a) >= l }));
    else if (k === 'vp' || k === 'inf' || k === 'gold') out.push({ role, kind: 'res', key: k, need: c[k], ok: S.res[k] >= c[k] });
    else if (k === 'pu') out.push({ role, kind: 'pu', need: c.pu, ok: unitsOf('pu') >= c.pu });
    else if (k === 'infLt') out.push({ role, kind: 'res', key: 'inf', need: c.infLt, ok: S.res.inf >= c.infLt });
    else if (k === 'vpLt') out.push({ role, kind: 'res', key: 'vp', need: c.vpLt, ok: S.res.vp >= c.vpLt });
    else if (k === 'puLt') out.push({ role, kind: 'pu', need: c.puLt, ok: unitsOf('pu') >= c.puLt });
    else if (k === 'dipPLt') out.push({ role, kind: 'res', key: 'dipP', need: c.dipPLt, ok: S.res.dipP >= c.dipPLt });
    else if (k === 'dipP0') out.push({ role, kind: 'res', key: 'dipP', need: 1, ok: S.res.dipP >= 1 });
    else if (k === 'gold0') out.push({ role, kind: 'res', key: 'gold', need: 1, ok: S.res.gold >= 1 });
    else if (k === 'euGe') out.push({ role, kind: 'eu', need: c.euGe - 1, max: true, ok: unitsOf('eu') < c.euGe });
    else if (k === 'euGtPu') out.push({ role, kind: 'pu', need: unitsOf('eu'), ok: unitsOf('pu') >= unitsOf('eu'), vsEnemy: true });
  };
  add(g.ok, 'rew'); add(g.bad, 'pen');
  return out;
}
const goalTurn = () => Math.ceil(S.turn / 3) * 3;
/* Selo para os valores do painel. */
function goalChipBadge(key) {
  const t = goalTargets().find((x) => x.kind === 'res' && x.key === key); if (!t) return '';
  return _T`<span class="gbadge ${t.role} ${t.ok ? 'ok' : ''}" title="Objetivo do turno ${goalTurn()}">${t.ok ? '✓' : '🎯'}${t.need}</span>`;
}
/* Rótulo "meta" para os níveis da Corte. */
function goalActNeed(a) { return goalTargets().find((x) => x.kind === 'act' && x.key === a); }
/* Texto curto de quanto falta. */
function goalGap(t) {
  if (t.ok) return _T`cumprido`;
  if (t.kind === 'act') return _T`faltam ${t.need - actLevel(t.key)} nível(is)`;
  if (t.kind === 'res') return _T`faltam ${t.need - S.res[t.key]}`;
  if (t.kind === 'pu') return _T`faltam ${t.need - unitsOf('pu')} unidade(s)`;
  if (t.kind === 'eu') return _T`remova ${unitsOf('eu') - t.need} inimiga(s)`;
  return '';
}
/* Custos da Corte que levam às metas de nível (anel azul na carta). */
function goalCourtCells() {
  const cells = []; const rooms = [];
  for (const t of goalTargets()) {
    if (t.kind !== 'act' || t.ok) continue;
    const a = t.key; let missing = t.need - actLevel(a);
    if (a === 'castle') {
      for (let f = 0; f < 3 && missing > 0; f++) {
        const fr = COURT.castle.rooms.map((r, i) => ({ r, i })).filter(({ r }) => r.floor === f);
        if (fr.every(({ i }) => courtState().rooms[i])) continue;
        fr.forEach(({ i }) => { if (!courtState().rooms[i]) rooms.push(i); }); missing--;
      }
      continue;
    }
    const tids = a === 'lords' ? LORDS : [a];
    for (const tid of tids) {
      const tr = COURT.tracks[tid]; if (!tr) continue;
      let need = a === 'lords' ? 99 : missing;
      for (let si = 0; si < tr.segs.length && need > 0; si++) {
        if (segDone(tid, si)) continue;
        tr.segs[si].c.forEach((_, ci) => { if (!courtState().paid[tid][si][ci]) cells.push([tid, si, ci]); });
        const counts = a === 'village' || a === 'armory' || tr.segs[si].hex;
        if (counts) need--;
        if (a === 'lords' && counts) break;
      }
    }
  }
  return { cells, rooms };
}
function goalCourtHtml() {
  const { cells, rooms } = goalCourtCells();
  return cells.map(([tid, si, ci]) => { const [x, y] = COURT.tracks[tid].segs[si].c[ci]; return `<div class="hl goalring" style="left:${x * 100}%;top:${y * 100}%"></div>`; }).join('')
    + rooms.map((i) => { const r = COURT.castle.rooms[i]; return `<div class="hl goalring room" style="left:${r.x * 100}%;top:${r.y * 100}%"></div>`; }).join('');
}
/* Faixa de metas (Corte e Cenário). */
function goalStripHtml(where) {
  const ts = goalTargets().filter((t) => where === 'court' ? t.kind === 'act' : where === 'map' ? (t.kind === 'pu' || t.kind === 'eu') : true);
  if (!ts.length) return '';
  const name = (t) => t.kind === 'act' ? `${ACT_NAMES[t.key]} ${t.need}` : t.kind === 'res' ? `${{ vp: _T`PV`, inf: _T`Influência`, gold: _T`Ouro`, dipP: _T`Diplomacia` }[t.key]} ${t.need}`
    : t.kind === 'pu' ? (t.vsEnemy ? _T`suas unidades ≥ inimigas` : _T`${t.need} unidades suas`) : _T`no máximo ${t.need} inimigas`;
  return _T`<div class="goal-strip"><span class="gs-t">🎯 Objetivo do turno ${goalTurn()}</span>${ts.map((t) => `<span class="gt ${t.role} ${t.ok ? 'ok' : ''}">${t.ok ? '✓' : t.role === 'rew' ? '★' : '⚠'} ${name(t)} <small>${goalGap(t)}</small></span>`).join('')}</div>`;
}
