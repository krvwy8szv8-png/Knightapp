'use strict';
/* Prévia do lado da carta e faixa de consequências do Cenário. */

// Faixas das trilhas de consequência no cartão de Cenário (mesmo molde em todos os cenários).
const CONS = { x1: 0.48, bands: { 1: 0.048, 2: 0.140, 3: 0.232 }, bh: 0.045 };

/* Faixa com a trilha t: mostra o recorte do cartão, as marcas já feitas e onde está o próximo símbolo. */
function consStripHtml(t, tap, upcoming) {
  const y0 = CONS.bands[t] - CONS.bh, hFrac = CONS.bh * 2;
  const auto = consStripAuto(t);
  if (auto) {
    const aspectA = (CONS.x1) / (hFrac * 0.7076);
    let extra = '';
    if (upcoming) {
      const els = consEls(t);
      extra = consIdx(S.tracks[t] + 1).filter((k) => k < els.length).map((k) => `<div class="cs-now" style="left:${(consX(S.scenId, k) / CONS.x1) * 100}%"></div>`).join('');
    }
    const live = S.phase === 4 && S.cons && S.cons.turn === S.turn && S.cons.t === t && S.cons.items.length;
    const curA = live ? consX(S.scenId, S.cons.items[0].i) / CONS.x1 : auto.cur;
    if (live) upcoming = true;
    return `<div class="cstrip" data-strip="${t}">
      <div class="cstrip-in" style="aspect-ratio:${aspectA.toFixed(3)};background-image:url(assets/scen/${S.scenId}.webp);background-size:${(100 / CONS.x1).toFixed(2)}% auto;background-position:0 ${((y0 / (1 - hFrac)) * 100).toFixed(2)}%" data-cur="${curA ?? 0.98}">
        ${auto.marks}${extra}${curA != null && !upcoming ? _T`<div class="cs-cur" style="left:${curA * 100}%"><span>próximo</span></div>` : ''}
      </div></div>`;
  }
  const inBand = S.marks.scen.filter((m) => m.x <= CONS.x1 && m.y >= y0 && m.y <= y0 + hFrac);
  const lastX = inBand.length ? Math.max(...inBand.map((m) => m.x)) : null;
  const marks = inBand.map((m) => `<div class="cs-mk" style="left:${(m.x / CONS.x1) * 100}%;top:${((m.y - y0) / hFrac) * 100}%">${markSvg(m.t === 'x' ? 'x' : m.t, `csm${t}:${m.x},${m.y}`)}</div>`).join('');
  const cur = lastX == null ? 0.02 : Math.min(0.99, lastX / CONS.x1 + 0.035);
  // proporção do recorte: largura x1*W, altura hFrac*H (aspect do cartão ≈ 0.7076)
  const aspect = (CONS.x1) / (hFrac * 0.7076);
  return _T`<div class="cstrip" data-strip="${t}">
    <div class="cstrip-in ${tap ? 'tap' : ''}" style="aspect-ratio:${aspect.toFixed(3)};background-image:url(assets/scen/${S.scenId}.webp);background-size:${(100 / CONS.x1).toFixed(2)}% auto;background-position:0 ${((y0 / (1 - hFrac)) * 100).toFixed(2)}%" data-cur="${cur}">
      ${marks}<div class="cs-cur" style="left:${cur * 100}%"><span>próximo</span></div>
    </div></div>`;
}
function bindStrip(el) {
  $$('.cstrip', el).forEach((wrap) => {
    const inner = $('.cstrip-in', wrap);
    const cur = +inner.dataset.cur;
    requestAnimationFrame(() => { wrap.scrollLeft = Math.max(0, cur * inner.clientWidth - wrap.clientWidth * 0.25); });
    if (!inner.classList.contains('tap')) return;
    inner.onclick = (e) => {
      const r = inner.getBoundingClientRect(); const t = +wrap.dataset.strip;
      const sx = (e.clientX - r.left) / r.width, sy = (e.clientY - r.top) / r.height;
      const x = +(sx * CONS.x1).toFixed(4), y = +((CONS.bands[t] - CONS.bh) + sy * CONS.bh * 2).toFixed(4);
      // tocar perto de uma marca existente apaga; senão risca
      const near = S.marks.scen.findIndex((m) => Math.hypot((m.x - x) * 2400, (m.y - y) * 1698) < 22);
      commit(() => { if (near >= 0) S.marks.scen.splice(near, 1); else S.marks.scen.push({ t: 'x', x, y }); });
    };
  });
}
function consText(t) {
  const n = S.tracks[t] + 1;
  const els = consEls(t);
  if (els.length) {
    const it = consIdx(n).filter((k) => k < els.length).map((k, j, arr) => {
      const p = consParse(els[k]); const possible = arr.length === 2 && j === 0 && !!p.cost;
      return `<div class="pv-c">${possible ? _T`<b>Possível</b>${p.cost ? _T` (evita com ${p.cost.n} ${RES[p.cost.k].name}${S.res[p.cost.k] >= p.cost.n ? '' : _T` — hoje você não tem`})` : ''}` : _T`<b>Inevitável</b>`}: ${effText(p.eff)}</div>`;
    }).join('');
    return _T`${n}ª vez nesta trilha.${it || _T` Trilha esgotada: nada acontece.`}`;
  }
  return n === 1
    ? _T`Primeira vez nesta trilha: resolva só o primeiro símbolo.`
    : _T`Será a ${n}ª vez nesta trilha: primeiro a consequência possível (pague o custo para evitá-la), depois a inevitável.`;
}

/* Prévia de um lado da carta (antes de confirmar). */
function sidePreviewHtml(side) {
  const ev = EV[cur().id][side];
  const pv = CHAR_SKILLS[S.charId].priv;
  // recursos que você terá depois de receber
  const after = { g: S.res.g, n: S.res.n, v: S.res.v, gold: S.res.gold };
  let overflow = 0;
  for (const [k, n] of Object.entries(ev.r)) {
    if (k === 'gold') { const room = 12 - after.gold; after.gold += Math.min(room, n); overflow += Math.max(0, n - room) * 5; }
    else { const room = 6 - after[k]; after[k] += Math.min(room, n); const ex = n - Math.min(room, n); const gr = 12 - after.gold; after.gold += Math.min(gr, ex); overflow += Math.max(0, ex - gr) * 5; }
  }
  const acts = (S.actionFrom != null ? EV[S.row[S.actionFrom].id][side] : ev).a;
  const actRows = acts.map((a) => {
    const g = activationGains(a);
    const extra = a === pv.act && pv.plus ? _T` <span class="muted small">+ privilégio ${resList(pv.plus)}</span>` : a === pv.act && pv.choice ? _T` <span class="muted small">+ privilégio (1 à escolha)</span>` : a === pv.act && pv.swap ? _T` <span class="muted small">+ privilégio de troca ativo</span>` : '';
    const kn = a === 'king' ? kingNext() : null;
    const kTxt = a === 'king' ? _T`<div class="muted small">Cenário: ${kn ? (kn.ok ? _T`coluna ${kn.k + 1} → ${kingColText(kn.col)}` : _T`coluna ${kn.k + 1} exige Rei ${kn.k}`) : _T`colunas esgotadas`}</div>` : '';
    const iTxt = infRows().map((r, ri) => {
      if (r.act !== a) return '';
      const o = ['L', 'R'].map((sd) => { const n = infNext(ri, sd); return n ? `${sd === 'L' ? '←' : '→'} ${cellText(n.c)}${n.ok ? '' : ` (${n.req})`}` : null; }).filter(Boolean);
      return _T`<div class="muted small">Cenário: ${o.length ? o.join(' · ') : _T`esgotado`}</div>`;
    }).join('');
    return `<div class="pv-act"><img src="${ACTIONS[a].icon}" alt=""><b>${ACTIONS[a].name}</b> ${Object.keys(g.out).length ? resList(g.out) : _T`<span class="muted small">nada desbloqueado</span>`}${extra}</div>${kTxt}${iTxt}`;
  }).join('');
  return _T`<div class="pv">
    <div class="pv-h">Prévia · lado ${side === 'L' ? _T`esquerdo` : _T`direito`}</div>
    <div class="pv-row"><span class="pv-l">Recebe</span><span>${resList(ev.r)}</span></div>
    <div class="pv-row"><span class="pv-l">Fica com</span><span>${resList(after)}${overflow ? _T` <span class="muted small">+${overflow} PV de excesso</span>` : ''}</span></div>
    <div class="pv-row top"><span class="pv-l">Ação</span><span>${actRows}<span class="muted small">Ganhos de hoje só podem ser gastos no próximo turno.</span></span></div>
    <div class="pv-row top"><span class="pv-l">Consequência</span><span><span class="trk">trilha ${ev.t}</span> ${consText(ev.t)}</span></div>
    ${consStripHtml(ev.t, false, true)}
    <p class="muted small">A faixa mostra a trilha ${ev.t} do seu Cenário: os símbolos riscados já foram usados e os destacados em azul são os deste turno.</p>
    <button class="btn primary" data-confirm="${side}">Confirmar lado ${side === 'L' ? _T`esquerdo` : _T`direito`}</button>
  </div>`;
}
