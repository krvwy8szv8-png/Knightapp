'use strict';
/* Motor da carta Personagem: privilégio, ações especiais, recompensas e limiares de Influência. */

const skills = () => CHAR_SKILLS[S.charId];
function charState() {
  if (!S.charSt) S.charSt = { rew: [false, false], thr: [false, false, false], rows: [false, false, false] };
  return S.charSt;
}
function rewText(r) {
  return Object.entries(r).map(([k, n]) => {
    if (k === 'cp') return _T`${n} Comando`;
    if (k === 'dip') return _T`${n} Diplomacia`;
    if (k === 'vp') return _T`${n} PV`;
    return `<span class="ri"><img src="${RES[k].icon}" alt="">${n}</span>`;
  }).join(' + ');
}
function reqLabel(req) {
  if (req.vp != null) return _T`${req.vp} PV`;
  return _T`${ACT_NAMES[req.act]} nível ${req.lvl}`;
}
function reqProgress(req) {
  return req.vp != null ? [S.res.vp, req.vp] : [actLevel(req.act), req.lvl];
}

/* Ações ativas no turno atual (para privilégios). */
function activeActs() {
  if (!S.choice || S.turn > 12) return [];
  return EV[actionCard().id][S.choice].a;
}
function swapActive() {
  const p = skills().priv;
  return p.swap && activeActs().includes(p.act) ? p.swap : null;
}
/* Recursos que podem pagar um custo do tipo dado (inclui troca do privilégio). */
function payOptions(type) {
  let opts = type === 'any' ? ['g', 'n', 'v'] : [type];
  const sw = swapActive();
  if (sw && type !== 'any' && sw.from.includes(type)) opts = [...new Set([...opts, ...sw.to])];
  return opts.filter((k) => S.res[k] >= 1);
}

/* Lista do que está disponível na carta Personagem. */
function charAvailable() {
  const sk = skills(); const st = charState(); const out = [];
  if (S.res[sk.sa] >= 6) out.push({ k: 'sa1' });
  if (S.res.inf >= 20 && S.res.g >= 6 && S.res.n >= 6 && S.res.v >= 6 && S.res.dipP < 5) out.push({ k: 'sa2' });
  sk.rew.forEach((r, i) => { const [have, need] = reqProgress(r.req); if (!st.rew[i] && have >= need) out.push({ k: 'rew', i }); });
  sk.thr.forEach((t, i) => { if (!st.thr[i] && S.res.inf >= t.inf) out.push({ k: 'thr', i }); });
  INF_ROWS.forEach((t, i) => { if (!st.rows[i] && S.res.inf >= t.inf) out.push({ k: 'row', i }); });
  return out;
}

function useSpecial(which) {
  const sk = skills();
  if (which === 1) {
    if (S.res[sk.sa] < 6) return toast(_T`Precisa de 6 ${RES[sk.sa].name}.`);
    commit(() => { S.res[sk.sa] -= 6; S.res.cp += 1; }, _T`Ação especial: 6 ${RES[sk.sa].name} → 1 Comando`);
    toast(_T`+1 Comando. Use no Cenário neste turno.`);
  } else {
    if (S.res.inf < 20) return toast(_T`Precisa de 20 de Influência.`);
    if (S.res.g < 6 || S.res.n < 6 || S.res.v < 6) return toast(_T`Precisa de 6 Glória, 6 Nobreza e 6 Valor.`);
    commit(() => { S.res.g -= 6; S.res.n -= 6; S.res.v -= 6; S.res.dipP = Math.min(5, S.res.dipP + 1); }, _T`Ação especial: 6 Glória + 6 Nobreza + 6 Valor → 1 Diplomacia`);
  }
}
function claim(kind, i) {
  const sk = skills(); const st = charState();
  const item = kind === 'rew' ? sk.rew[i] : kind === 'thr' ? sk.thr[i] : null;
  commit(() => {
    const notes = [];
    if (kind === 'row') { S.res.vp += INF_ROWS[i].vp; st.rows[i] = true; log(_T`Influência ${INF_ROWS[i].inf}: +${INF_ROWS[i].vp} PV`); return; }
    applyRewards(item.r, notes);
    (kind === 'rew' ? st.rew : st.thr)[i] = true;
    log(`${kind === 'rew' ? _T`Recompensa` : _T`Limiar ${item.inf} de Influência`}: ${rewText(item.r).replace(/<[^>]+>/g, '')}`);
    notes.forEach((n) => log(n));
    if (notes.length) setTimeout(() => toast(notes.join(' · ')), 30);
  });
}

/* Painel da aba Personagem. */
function charPanelHtml() {
  const sk = skills(); const st = charState(); const p = sk.priv;
  const avail = (ok) => (ok ? 'av' : '');
  let privTxt;
  if (p.plus) privTxt = _T`ganha ${rewText(p.plus)}`;
  else if (p.choice) privTxt = _T`ganha 1 ${p.choice.map((k) => RES[k].name).join(_T` ou `)} (à escolha)`;
  else privTxt = _T`custos de ${p.swap.from.map((k) => RES[k].name).join('/')} podem ser pagos com ${p.swap.to.map((k) => RES[k].name).join('/')}`;
  const swapOn = swapActive();
  const sa1ok = S.res[sk.sa] >= 6;
  const sa2ok = S.res.inf >= 20 && S.res.g >= 6 && S.res.n >= 6 && S.res.v >= 6 && S.res.dipP < 5;
  const rews = sk.rew.map((r, i) => {
    const [have, need] = reqProgress(r.req); const ok = !st.rew[i] && have >= need;
    return `<div class="cp-row ${st.rew[i] ? 'done' : avail(ok)}"><span>${reqLabel(r.req)} <small>(${Math.min(have, need)}/${need})</small></span><span>${rewText(r.r)}</span>
      ${st.rew[i] ? '<span class="tick">✓</span>' : _T`<button class="btn small ${ok ? 'primary' : ''}" data-claim="rew:${i}" ${ok ? '' : 'disabled'}>Coletar</button>`}</div>`;
  }).join('');
  const thrs = sk.thr.map((t, i) => {
    const ok = !st.thr[i] && S.res.inf >= t.inf;
    return _T`<div class="cp-row ${st.thr[i] ? 'done' : avail(ok)}"><span>Influência ${t.inf}</span><span>${rewText(t.r)}</span>
      ${st.thr[i] ? '<span class="tick">✓</span>' : _T`<button class="btn small ${ok ? 'primary' : ''}" data-claim="thr:${i}" ${ok ? '' : 'disabled'}>Coletar</button>`}</div>`;
  }).join('');
  const rows = INF_ROWS.map((t, i) => {
    const ok = !st.rows[i] && S.res.inf >= t.inf;
    return _T`<div class="cp-row ${st.rows[i] ? 'done' : avail(ok)}"><span>Influência ${t.inf}</span><span>${t.vp} PV</span>
      ${st.rows[i] ? '<span class="tick">✓</span>' : _T`<button class="btn small ${ok ? 'primary' : ''}" data-claim="row:${i}" ${ok ? '' : 'disabled'}>Coletar</button>`}</div>`;
  }).join('');
  return _T`<div class="char-panel">
    <div class="cp-box"><h3>Privilégio <img class="act-ic" src="assets/icons/${p.act === 'lords' ? 'lords' : p.act}.png" alt=""> ${ACT_NAMES[p.act]}</h3>
      <p>Quando ${ACT_NAMES[p.act]} for ativada no turno: ${privTxt}.</p>
      ${p.swap ? `<p class="small ${swapOn ? 'ok' : 'muted'}">${swapOn ? _T`✓ Ativo neste turno: a Corte já aceita a troca ao pagar.` : _T`Fica ativo nos turnos em que o lado escolhido ativar essa ação.`}</p>`
               : _T`<p class="small muted">Somado automaticamente no botão “Receber ganhos” da fase de ação.</p>`}</div>
    <div class="cp-box"><h3>Ações especiais <small class="muted">(uso livre no seu turno)</small></h3>
      <div class="cp-row ${avail(sa1ok)}"><span>6 <img class="ic" src="${RES[sk.sa].icon}" alt=""> → 1 Comando</span><span class="muted small">você tem ${S.res[sk.sa]}</span>
        <button class="btn small ${sa1ok ? 'primary' : ''}" data-sa="1" ${sa1ok ? '' : 'disabled'}>Usar</button></div>
      <div class="cp-row ${avail(sa2ok)}"><span>Influência 20: 6 <img class="ic" src="${RES.g.icon}" alt=""> 6 <img class="ic" src="${RES.n.icon}" alt=""> 6 <img class="ic" src="${RES.v.icon}" alt=""> → 1 Diplomacia</span><span></span>
        <button class="btn small ${sa2ok ? 'primary' : ''}" data-sa="2" ${sa2ok ? '' : 'disabled'}>Usar</button></div></div>
    <div class="cp-box"><h3>Recompensas</h3>${rews}</div>
    <div class="cp-box"><h3>Limiares de Influência <small class="muted">(você tem ${S.res.inf})</small></h3>${thrs}${rows}</div>
  </div>`;
}
function bindCharPanel(el) {
  $$('[data-sa]', el).forEach((b) => (b.onclick = () => useSpecial(+b.dataset.sa)));
  $$('[data-claim]', el).forEach((b) => (b.onclick = () => { const [k, i] = b.dataset.claim.split(':'); claim(k, +i); }));
}
