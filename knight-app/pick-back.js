'use strict';
/* Tela inicial: verso dos cartões de personagem e de cenário.
   O primeiro toque escolhe e vira o cartão; o segundo desvira (continua escolhido).
   O verso mostra o que diferencia aquele personagem ou cenário dos outros. */

function privText(p) {
  if (p.plus) return _T`ganha ${rewText(p.plus)}`;
  if (p.choice) return _T`ganha 1 ${p.choice.map((k) => RES[k].name).join(_T` ou `)} (à escolha)`;
  return _T`custos de ${p.swap.from.map((k) => RES[k].name).join('/')} podem ser pagos com ${p.swap.to.map((k) => RES[k].name).join('/')}`;
}
const actIc = (a) => `<img class="act-ic" src="assets/icons/${a}.png" alt="">`;
const resIc = (k) => `<img class="ic" src="${RES[k].icon}" alt="">`;

/* Totais que cada personagem ganha nas recompensas e limiares: servem para comparar. */
function charTotals(id) {
  const sk = CHAR_SKILLS[id]; const t = { cp: 0, dip: 0, gold: 0, res: 0 };
  for (const x of [...sk.rew.map((r) => r.r), ...sk.thr.map((r) => r.r)]) for (const [k, n] of Object.entries(x)) {
    if (k === 'cp' || k === 'dip' || k === 'gold') t[k] += n; else if (RES[k] && k !== 'gold') t.res += n;
  }
  t.first = Math.min(...sk.thr.map((x) => x.inf));
  return t;
}
let CHAR_BEST = null;
function charBest() {
  if (CHAR_BEST) return CHAR_BEST;
  const all = CHARACTERS.map((c) => charTotals(c.id));
  CHAR_BEST = { cp: Math.max(...all.map((t) => t.cp)), dip: Math.max(...all.map((t) => t.dip)), gold: Math.max(...all.map((t) => t.gold)), res: Math.max(...all.map((t) => t.res)), first: Math.min(...all.map((t) => t.first)) };
  return CHAR_BEST;
}
function charBackHtml(c) {
  const sk = CHAR_SKILLS[c.id]; const p = sk.priv; const t = charTotals(c.id); const best = charBest();
  const chip = (on, html) => `<span class="pb-chip ${on ? 'top' : ''}">${html}</span>`;
  const chips = [
    chip(t.cp === best.cp, _T`⚑ ${t.cp} Comando`),
    t.dip ? chip(t.dip === best.dip, _T`🕊 ${t.dip} Diplomacia`) : '',
    t.gold ? chip(t.gold === best.gold, `${resIc('gold')} ${t.gold}`) : '',
    t.res ? chip(t.res === best.res, _T`${t.res} recursos`) : '',
    chip(t.first === best.first, _T`1º limiar: Influência ${t.first}`),
  ].join('');
  return _T`<div class="pb-head"><img src="assets/thumbs/c_${c.id}.webp" alt=""><div><b>${c.name}</b> <span class="diff ${c.diff}">${DIFF[c.diff]}</span>
      <div class="small muted">Início: ${resList(c.start) || '—'}</div></div><span class="pb-flip">↺</span></div>
    <div class="pb-chips" title="Somando recompensas e limiares · em dourado: o maior entre os personagens">${chips}</div>
    <div class="pb-sec"><h4>Privilégio</h4><p>${actIc(p.act)} Quando ${ACT_NAMES[p.act]} for ativada: ${privText(p)}.</p></div>
    <div class="pb-sec"><h4>Conversão</h4><p>6 ${resIc(sk.sa)} → 1 Comando <span class="muted small">(quantas vezes quiser)</span></p></div>
    <div class="pb-sec"><h4>Recompensas</h4><ul>${sk.rew.map((r) => `<li><span>${reqLabel(r.req)}</span><span>${rewText(r.r)}</span></li>`).join('')}</ul></div>
    <div class="pb-sec"><h4>Limiares de Influência</h4><ul>${sk.thr.map((r) => _T`<li><span>Influência ${r.inf}</span><span>${rewText(r.r)}</span></li>`).join('')}</ul></div>`;
}

/* Condições de vitória e derrota escritas a partir dos dados (sem precisar de partida em andamento). */
function wlTextFor(id, c) {
  const bn = BAT_NAME[id];
  if (c.bat != null) return bn ? `${bn[0].toLowerCase()}: ${c.bat}` : _T`vencer ${c.bat} batalhas`;
  if (c.vpinf) return _T`${c.vpinf[0]} PV e Influência ${c.vpinf[1]}`;
  if (c.inf != null) return _T`Influência ${c.inf}`;
  if (c.eu != null) return _T`${c.eu} unidades inimigas no mapa`;
  if (c.cnt) return `${COUNTERS[c.cnt].label}: ${c.n}`;
  return c.m;
}
function scenBackHtml(s) {
  const id = s.id; const wl = WINLOSE[id] || { win: [], lose: [] }; const txt = (typeof SCEN_TEXT !== 'undefined' && SCEN_TEXT[id]) || { sum: s.story, nuance: s.rules || [] };
  const bats = BATTLES[id] || []; const bn = BAT_NAME[id] || [_T`Batalhas`, _T`batalha`];
  const tracks = CONS_TRACKS[id] || {}; const moves = Object.values(tracks).some((t) => /(^|[|:])(m\d|am)/.test(t));
  const sp = (GOLD_SCEN[id] || {}).sp;
  const chip = (on, html) => `<span class="pb-chip ${on ? 'top' : ''}">${html}</span>`;
  const chips = [
    chip(false, _T`⚔ ${bats.length} ${bn[0].toLowerCase()}`),
    chip(false, _T`Você ${s.lim[0]} · inimigo ${s.lim[1]} no mapa`),
    chip(s.lim[2] !== 4 || s.lim[3] !== 4, _T`por área: ${s.lim[2]} suas · ${s.lim[3]} inimigas`),
    moves ? '' : chip(true, _T`O inimigo não se move`),
  ].join('');
  const reqs = [...new Set(bats.map(([r]) => (r === 'inf' ? _T`Influência` : r === 'vp' ? _T`PV` : r === 'dipP' ? _T`Diplomacia` : r === 'dipE' ? _T`Dipl. inimiga` : ACT_NAMES[r])))].join(', ');
  return _T`<div class="pb-head"><img class="wide" src="assets/thumbs/s_${id}.webp" alt=""><div><b>${s.name}</b> <span class="diff ${s.diff}">${DIFF[s.diff]}</span></div><span class="pb-flip">↺</span></div>
    <p class="pb-sum">${esc(txt.sum)}</p>
    <div class="pb-chips">${chips}</div>
    <div class="pb-cols">
      <div class="pb-sec"><h4>🏆 Vitória</h4><ul>${wl.win.map((c) => `<li>${esc(wlTextFor(id, c))}</li>`).join('')}<li>${_T`sua Diplomacia completa`}</li></ul></div>
      <div class="pb-sec"><h4>💀 Derrota</h4><ul>${wl.lose.map((c) => `<li>${esc(wlTextFor(id, c))}</li>`).join('')}<li>${_T`Diplomacia inimiga completa`}</li></ul></div>
    </div>
    <div class="pb-sec"><h4>📜 O que muda</h4><ul>${txt.nuance.slice(0, 3).map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>
    <div class="pb-sec"><h4>${bn[0]}</h4><p>${bats.length} · exigem ${esc(reqs)}</p></div>
    ${sp ? _T`<div class="pb-sec"><h4>Ação de Ouro própria</h4><p class="pb-hl">${costHtml(sp.cost)} → ${esc(sp.label)}${sp.req ? ` <span class="muted small">(${esc(reqText(sp.req))})</span>` : ''}</p></div>` : ''}`;
}
