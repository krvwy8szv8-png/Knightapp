'use strict';
/* Ações de Influência do Cenário, vitória/derrota automáticas e preparação guiada. */

/* =================== Ações de Influência =================== */
const infRows = () => INF_ACTS[S.scenId] || [];
function infState() {
  const st = scenState();
  if (!st.inf) st.inf = infRows().map(() => ({ L: 0, R: 0 }));
  if (!st.infTurn) st.infTurn = {};
  return st;
}
function cellParse(c) {
  if (c === 'unit') return { unit: 1 };
  const m = c.match(/^([a-z]+)(\d+)$/); return { [m[1]]: +m[2] };
}
function cellText(c, html) {
  const r = cellParse(c); const [k, n] = Object.entries(r)[0];
  if (k === 'unit') return _T`colocar 1 unidade sua`;
  if (k === 'cp') return _T`${n} Comando`;
  if (k === 'dip') return _T`+${n} Diplomacia`;
  if (k === 'vp') return _T`${n} PV`;
  return html ? `<span class="ri"><img src="${RES[k].icon}" alt="">${n}</span>` : `${n} ${RES[k].name}`;
}
/* Próxima célula de um lado: { i, c, ok, req } ou null (lado esgotado). */
function infNext(ri, side) {
  const row = infRows()[ri]; const st = infState().inf[ri];
  const i = st[side]; const cells = row[side];
  if (i >= cells.length) return null;
  if (side === 'L') { const need = i === 0 ? 0 : row.lv[i - 1]; return { i, c: cells[i], ok: actLevel(row.act) >= need, req: need ? `${ACT_NAMES[row.act]} ${need}` : '' }; }
  const need = i === 0 ? 0 : row.hx[i - 1]; return { i, c: cells[i], ok: S.res.inf >= need, req: need ? _T`Influência ${need}` : '' };
}
/* Ações efetivamente ativadas neste turno (inclui correntes completas). */
function activatedActs(acts) {
  const out = new Set(acts); const st = courtState();
  for (const a of acts) for (const [id, from] of Object.entries(st.chains)) {
    if (from !== a) continue; const ch = COURT.chains[id]; if (ch.a === 'castle') continue;
    out.add(ch.a === a ? ch.b : ch.a);
  }
  return [...out];
}
function infPending() {
  if (S.phase !== 3 || !S.choice) return [];
  const acts = activatedActs(EV[actionCard().id][S.choice].a); const st = infState();
  return infRows().map((r, ri) => ({ r, ri })).filter(({ r, ri }) => acts.includes(r.act) && !st.infTurn[ri]);
}
function takeInf(ri, side) {
  const row = infRows()[ri]; const nx = infNext(ri, side);
  if (!nx) return toast(_T`Esse lado já foi todo usado.`);
  if (!nx.ok) return toast(_T`Requisito: ${nx.req}.`);
  const r = cellParse(nx.c);
  commit(() => {
    const notes = [];
    if (r.unit) { S.place = (S.place || 0) + 1; } else applyRewards(r, notes);
    infState().inf[ri][side]++; infState().infTurn[ri] = true;
    log(_T`Cenário · ${ACT_NAMES[row.act]} (${side === 'L' ? _T`esquerda` : _T`direita`}): ${cellText(nx.c)}`);
    notes.forEach((n) => log(n));
  });
  if (r.unit) { ui.tab = 'scen'; ui.scenView = 'map'; ui.mapTool = 'pu'; render(); toast(_T`Coloque 1 unidade sua no mapa.`); }
  else if (r.cp) toast(_T`+${r.cp} Comando. Use neste turno.`);
}
function skipInf(ri) { commit(() => { infState().infTurn[ri] = true; }, _T`Cenário · ${ACT_NAMES[infRows()[ri].act]}: sem ação (nenhum lado disponível)`); }

/* Bloco de escolha usado na fase de Ação. */
function infChoiceHtml(ri) {
  const row = infRows()[ri]; const st = infState();
  if (st.infTurn[ri]) return _T`<div class="gains ok">✓ Ação do Cenário recebida</div>`;
  const btn = (side) => {
    const nx = infNext(ri, side);
    const arrow = side === 'L' ? '←' : '→';
    if (!nx) return _T`<button class="btn small" disabled>${arrow} esgotado</button>`;
    return `<button class="btn small ${nx.ok ? 'primary' : ''}" data-inf="${ri}:${side}" ${nx.ok ? '' : 'disabled'}>${arrow} ${cellText(nx.c, true)}${nx.req ? ` <small>(${nx.req})</small>` : ''}</button>`;
  };
  const none = !['L', 'R'].some((s) => { const n = infNext(ri, s); return n && n.ok; });
  return _T`<div class="inf-pick"><span class="muted small">Cenário · escolha um lado:</span> ${btn('L')} ${btn('R')}${none ? _T` <button class="btn small" data-infskip="${ri}">Nenhum disponível</button>` : ''}</div>`;
}
function bindInf(el) {
  $$('[data-inf]', el).forEach((b) => (b.onclick = () => { const [ri, s] = b.dataset.inf.split(':'); takeInf(+ri, s); }));
  $$('[data-infskip]', el).forEach((b) => (b.onclick = () => skipInf(+b.dataset.infskip)));
}
/* Painel com as três linhas (vista Ações). */
function infPanelHtml() {
  const st = infState();
  const rows = infRows().map((row, ri) => {
    const cells = (side) => row[side].map((c, i) => {
      const used = i < st.inf[ri][side];
      const isNext = i === st.inf[ri][side];
      const nx = isNext ? infNext(ri, side) : null;
      const req = i === 0 ? _T`livre` : side === 'L' ? _T`nível ${row.lv[i - 1]}` : `⬡ ${row.hx[i - 1]}`;
      return `<span class="ic-cell ${used ? 'used' : isNext ? (nx.ok ? 'next ok' : 'next lock') : ''}">${req ? `<i class="ic-req">${req}</i>` : ''}${cellText(c, true)}</span>`;
    });
    return _T`<div class="inf-row"><div class="ir-h"><img src="assets/icons/${row.act}.png" alt=""><b>${ACT_NAMES[row.act]}</b></div>
      <div class="ir-line"><span class="ir-l">← nível</span>${cells('L').join('')}</div>
      <div class="ir-line"><span class="ir-l">→ Influência</span>${cells('R').join('')}</div></div>`;
  }).join('');
  return _T`<div class="cp-box"><h3>Ações de Influência <small class="muted">(você tem Influência ${S.res.inf})</small></h3>${rows}
    <p class="muted small">Quando um evento ativa essa ação, você risca a próxima casa de um dos lados. Esquerda: exige o nível da ação. Direita: exige Influência (⬡). As casas são usadas em ordem, da primeira para fora. Verde = a próxima, disponível agora.</p></div>`;
}

/* =================== Vitória e derrota =================== */
function wlCond(c) {
  if (c.bat != null) { const n = battles().filter((_, i) => batWon(i)).length; const bn = BAT_NAME[S.scenId]; return { ok: n >= c.bat, auto: true, text: bn ? `${bn[0].toLowerCase()}: ${c.bat}` : _T`vencer ${c.bat} batalhas`, have: `${n}/${c.bat}` }; }
  if (c.vpinf) return { ok: S.res.vp >= c.vpinf[0] && S.res.inf >= c.vpinf[1], auto: true, text: _T`${c.vpinf[0]} PV e Influência ${c.vpinf[1]}`, have: _T`${S.res.vp} PV · Influência ${S.res.inf}` };
  if (c.inf != null) return { ok: S.res.inf >= c.inf, auto: true, text: _T`Influência ${c.inf}`, have: `${S.res.inf}` };
  if (c.eu != null) { const n = S.marks.scen.filter((m) => m.t === 'eu').length; return { ok: n >= c.eu, auto: true, text: _T`${c.eu} unidades inimigas no mapa`, have: `${n}/${c.eu}` }; }
  if (c.cnt) { const n = cntGet(c.cnt); return { ok: n >= c.n, auto: true, cnt: c.cnt, text: `${COUNTERS[c.cnt].label}: ${c.n}`, have: `${n}/${c.n}` }; }
  return { ok: false, auto: false, text: c.m, have: '' };
}
function wlList() {
  const d = WINLOSE[S.scenId] || { win: [], lose: [] };
  return {
    win: [...d.win.map(wlCond), { ok: S.res.dipP >= 5, auto: true, text: _T`sua Diplomacia completa`, have: `${S.res.dipP}/5` }],
    lose: [...d.lose.map(wlCond), { ok: S.res.dipE >= 5, auto: true, text: _T`Diplomacia inimiga completa`, have: `${S.res.dipE}/5` }],
  };
}
function wlPanelHtml() {
  const l = wlList();
  const row = (c, kind, i) => `<div class="wl ${c.ok ? (kind === 'win' ? 'won' : 'lost') : ''}">
    <span>${c.ok ? (kind === 'win' ? '★' : '✖') : c.auto ? '○' : '◇'} ${esc(c.text)}</span>
    ${c.cnt ? cntCtl(c.cnt) : c.auto ? `<small class="muted">${esc(c.have)}</small>` : _T`<button class="btn small" data-wlm="${kind}:${i}">Aconteceu</button>`}</div>`;
  return _T`<div class="cp-box wl-box"><h3>Vitória e derrota</h3>
    <div class="wl-cols"><div><div class="wl-h win">Vitória imediata</div>${l.win.map((c, i) => row(c, 'win', i)).join('')}</div>
    <div><div class="wl-h lose">Derrota imediata</div>${l.lose.map((c, i) => row(c, 'lose', i)).join('')}</div></div>
    <p class="muted small">○ o app confere sozinho · ± contadores de mapa: ajuste conforme o mapa · ◇ toque em “Aconteceu” quando ocorrer. Se nenhuma condição for cumprida até o fim, a pontuação perde 100 PV.</p></div>`;
}
function bindWl(el) {
  bindCnt(el);
  $$('[data-wlm]', el).forEach((b) => (b.onclick = () => { const [k, i] = b.dataset.wlm.split(':'); wlTrigger(k, wlList()[k][+i].text, true); }));
}
function wlTrigger(kind, text, manual) {
  const win = kind === 'win';
  modal(_T`<h2>${win ? _T`★ Vitória!` : _T`✖ Derrota`}</h2>
    <p>${win ? _T`Condição de vitória` : _T`Condição de derrota`} cumprida: <b>${esc(text)}</b>.</p>
    <p class="muted small">Pela regra, a partida termina imediatamente.${manual ? '' : _T` O app detectou pelo estado atual.`}</p>
    <div class="menu"><button class="btn ${win ? 'primary' : 'danger'}" data-wlend>Encerrar e ver a pontuação</button><button class="btn" data-wlno>Ainda não (corrigir algo)</button></div>`, () => {
    $('[data-wlend]').onclick = () => { closeModal(); finishGame(kind, text); };
    $('[data-wlno]').onclick = () => { S.wlSeen = S.wlSeen || {}; S.wlSeen[kind + ':' + text] = true; save(); closeModal(); };
  });
}
/* Checa as condições automáticas depois de cada mudança. */
let wlChecking = false;
function wlCheck() {
  if (!S || S.finished || S.turn > 12 || wlChecking || !$('#modal').hidden || !SET.autoWl) return;
  S.wlSeen = S.wlSeen || {};
  const l = wlList();
  for (const kind of ['lose', 'win']) for (const c of l[kind]) {
    if (c.auto && c.ok && !S.wlSeen[kind + ':' + c.text]) { wlChecking = true; setTimeout(() => { wlChecking = false; wlTrigger(kind, c.text, false); }, 120); return; }
  }
}

/* =================== Preparação =================== */
function setupTasks() {
  const d = SETUP[S.scenId] || {};
  return [...(d.normal || []), ...(S.advanced ? d.adv || [] : [])];
}
function setupState() { if (!S.setupDone) S.setupDone = {}; return S.setupDone; }
function setupPending() { return S.turn === 1 && S.phase === 0 && setupTasks().some((t, i) => !setupItemDone(t, i)); }
function setupNeedUnits() { return setupTasks().reduce((n, t) => n + (t.units || 0), 0); }
function setupItemDone(t, i) {
  const st = setupState();
  if (t.units) return S.marks.scen.filter((m) => m.t === 'eu').length >= setupTasks().slice(0, i + 1).reduce((n, x) => n + (x.units || 0), 0) || st[i];
  if (t.tracks) return t.tracks.every((tr) => S.tracks[tr] >= 1);
  if (t.pick) return [1, 2, 3].filter((tr) => S.tracks[tr] >= 1).length >= t.pick;
  return !!st[i];
}
function setupHtml() {
  const tasks = setupTasks(); if (!tasks.length) return '';
  const eu = S.marks.scen.filter((m) => m.t === 'eu').length;
  const items = tasks.map((t, i) => {
    const done = setupItemDone(t, i);
    let body = '', act = '';
    if (t.units) { body = _T`Coloque <b>${t.units}</b> unidade${t.units > 1 ? 's' : ''} inimiga${t.units > 1 ? 's' : ''} ${esc(t.where)}.`; act = done ? '' : _T`<button class="btn small" data-su="map">Abrir o mapa (${Math.min(eu, setupNeedUnits())}/${setupNeedUnits()})</button>`; }
    else if (t.tracks || t.pick) {
      const n = t.pick || t.tracks.length;
      body = t.pick ? _T`Escolha ${n === 1 ? _T`1 trilha` : n + _T` trilhas`} de consequência: resolva e risque o primeiro símbolo de cada.` : _T`Resolva e risque o primeiro símbolo de cada uma das 3 trilhas de consequência.`;
      act = done ? '' : [1, 2, 3].filter((tr) => !t.tracks || t.tracks.includes(tr)).map((tr) => S.tracks[tr] >= 1 ? _T`<span class="tag">trilha ${tr} ✓</span>` : _T`<button class="btn small" data-st="${tr}">Trilha ${tr} feita</button>`).join(' ');
    } else { body = esc(t.m); act = done ? '' : _T`<button class="btn small" data-sm="${i}">Feito</button>`; }
    return `<li class="${done ? 'done' : ''}"><span>${done ? '✓' : '○'} ${body}</span> ${act}</li>`;
  }).join('');
  return _T`<div class="setup-box"><div class="av-h">Preparação do cenário${S.advanced ? _T` (avançado)` : ''}</div><ul>${items}</ul></div>`;
}
function bindSetup(el) {
  $$('[data-su]', el).forEach((b) => (b.onclick = () => { ui.tab = 'scen'; ui.scenView = 'map'; ui.mapTool = 'eu'; render(); }));
  $$('[data-sm]', el).forEach((b) => (b.onclick = () => commit(() => { setupState()[+b.dataset.sm] = true; })));
  $$('[data-st]', el).forEach((b) => (b.onclick = () => {
    const tr = +b.dataset.st; ui.tab = 'scen'; ui.scenView = 'card';
    commit(() => { S.tracks[tr] = Math.max(1, S.tracks[tr]); }, _T`Preparação: primeira consequência da trilha ${tr} resolvida`);
    toast(_T`Aplique o efeito do 1º símbolo da trilha ${tr} e risque-o no cartão.`);
  }));
}

/* =================== Contadores de mapa =================== */
function cntGet(k) { return isAutoCnt(k) ? autoCnt(k) : (S.counters || {})[k] || 0; }
function cntKeys() {
  const d = WINLOSE[S.scenId] || { win: [], lose: [] }; const out = [];
  for (const kind of ['win', 'lose']) for (const c of d[kind]) if (c.cnt && !out.find((o) => o.k === c.cnt)) out.push({ k: c.cnt, n: c.n, kind });
  return out;
}
function cntCtl(k) {
  if (isAutoCnt(k)) return `<span class="cnt-ctl auto" title="${k === 'razed' || k === 'coins' ? _T`Contado pelo mapa: risque os recursos com ✕` : _T`Contado pelas unidades no mapa`}"><b>${cntGet(k)}</b><small>auto</small></span>`;
  return _T`<span class="cnt-ctl"><button data-cnt="${k}:-1" aria-label="menos">−</button><b>${cntGet(k)}</b><button data-cnt="${k}:1" aria-label="mais">+</button></span>`;
}
function cntAdd(k, d) {
  const v = Math.max(0, cntGet(k) + d);
  commit(() => { S.counters = S.counters || {}; S.counters[k] = v; }, `${COUNTERS[k].label}: ${v}`);
}
function bindCnt(el) {
  $$('[data-cnt]', el).forEach((b) => (b.onclick = () => { const [k, d] = b.dataset.cnt.split(':'); cntAdd(k, +d); }));
}
function cntBarHtml() {
  const ks = cntKeys(); const sp = scenSpecialHtml();
  if (!ks.length && !sp) return '';
  return `<div class="cnt-bar">${ks.map((o) => `<span class="cnt-it ${o.kind}"><span>${COUNTERS[o.k].short} <small>/${o.n}</small></span>${cntCtl(o.k)}</span>`).join('')}${sp}</div>`;
}
function scenSpecialHtml() {
  if (S.scenId === 'plague') return _T`<button class="btn small" data-sp="burn">🔥 Queimar vila</button>`;
  return '';
}
function bindSpecial(el) {
  $$('[data-sp="burn"]', el).forEach((b) => (b.onclick = () => modal(_T`<h2>Queimar vila</h2>
    <p>Para queimar uma vila, você precisa ter uma unidade sua nela e fazer um ataque (gasta 1 Comando). Não dá para queimar uma vila que já tem peste.</p>
    <div class="menu"><button class="btn primary" data-burn="cp" ${S.res.cp ? '' : 'disabled'}>Atacar com 1 Comando e queimar</button><button class="btn" data-burn="free">Já fiz o ataque, só registrar</button></div>`, () => {
    $$('[data-burn]').forEach((x) => (x.onclick = () => {
      closeModal();
      commit(() => { if (x.dataset.burn === 'cp') S.res.cp -= 1; S.counters = S.counters || {}; S.counters.burned = cntGet('burned') + 1; }, _T`Vila queimada (${cntGet('burned') + 1}/5)`);
      ui.mapTool = 'o'; render(); toast(_T`Circule a vila queimada no mapa.`);
    }));
  })));
}
