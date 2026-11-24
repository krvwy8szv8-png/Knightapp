'use strict';
/* Estatísticas e histórico de partidas (ficam só no aparelho). */
const ACT_LIST = ['king', 'church', 'nobles', 'merchants', 'lords', 'castle', 'village', 'stable', 'armory', 'combat', 'knowledge', 'fame', 'tournaments'];
function saveHistory(h) { try { localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(0, 300))); } catch { toast(_T`Não foi possível salvar o histórico.`); } }

/* Grava (ou regrava, se a partida for encerrada de novo após desfazer) a partida atual. */
function recordGame() {
  const f = S.finished; if (!f) return;
  const lv = {}; for (const a of ACT_LIST) lv[a] = actLevel(a);
  let bats = 0, batTot = 0; try { const bs = battles(); batTot = bs.length; bats = bs.filter((_, i) => batWon(i)).length; } catch {}
  const rec = {
    id: S.created, at: Date.now(), char: S.charId, scen: S.scenId, adv: !!S.advanced, tut: S.seed === TUT_SEED,
    outcome: f.outcome, score: f.score, why: f.why || '', turn: S.endTurn || 12,
    stages: S.vpStages || {}, inf: S.res.inf, dipP: S.res.dipP, dipE: S.res.dipE, lv, bats, batTot,
    goals: S.goalLog || {}, mins: Math.round((Date.now() - S.created) / 60000),
  };
  const h = history().filter((g) => !(g.id && g.id === rec.id)); h.unshift(rec); saveHistory(h);
}
function statsOf(list) {
  const n = list.length, w = list.filter((g) => g.outcome === 'win').length;
  const scores = list.map((g) => g.score);
  return { n, w, rate: n ? Math.round((w * 100) / n) : 0, best: n ? Math.max(...scores) : null, avg: n ? Math.round(scores.reduce((a, b) => a + b, 0) / n) : null };
}
function streaks(h) {
  let cur = 0, best = 0, run = 0;
  for (const g of [...h].reverse()) { run = g.outcome === 'win' ? run + 1 : 0; best = Math.max(best, run); }
  for (const g of h) { if (g.outcome === 'win') cur++; else break; }
  return { cur, best };
}
/* Resumo mostrado no fim da partida. */
function endSummaryHtml() {
  const h = history(); const me = h.find((g) => g.id === S.created); if (!me) return '';
  const same = h.filter((g) => g.scen === me.scen && g.adv === me.adv && !g.tut);
  const prev = same.filter((g) => g.id !== me.id);
  const best = prev.length ? Math.max(...prev.map((g) => g.score)) : null;
  const rec = !me.tut && (best === null || me.score > best);
  const st = [3, 6, 9, 12].map((t) => (me.stages[t] ?? '—'));
  const top = ACT_LIST.map((a) => [a, me.lv[a]]).filter(([, l]) => l).sort((x, y) => y[1] - x[1]).slice(0, 3);
  const gl = [1, 2, 3].map((c) => (me.goals[c] ? (me.goals[c].rew ? '★' : me.goals[c].pen ? '⚠' : '·') : '—')).join(' ');
  return _T`<div class="end-sum">
    ${rec && prev.length ? _T`<div class="rec">🏆 Novo recorde neste cenário!</div>` : rec ? _T`<div class="rec">🏁 Primeira partida registrada neste cenário.</div>` : best !== null ? _T`<div class="muted small">Seu recorde aqui: <b>${best} PV</b></div>` : ''}
    <table class="score"><tr><td>PV ao fim dos turnos 3 · 6 · 9 · 12</td><td>${st.join(' · ')}</td></tr>
    <tr><td>Objetivos (★ recompensa · ⚠ penalidade)</td><td>${gl}</td></tr>
    <tr><td>${(BAT_NAME[me.scen] || [_T`Batalhas`])[0]}</td><td>${me.bats}/${me.batTot}</td></tr>
    <tr><td>Influência · Diplomacia sua / inimiga</td><td>${me.inf} · ${me.dipP} / ${me.dipE}</td></tr>
    <tr><td>Ações mais fortes</td><td>${top.map(([a, l]) => `${ACT_NAMES[a]} ${l}`).join(', ') || '—'}</td></tr></table>
    <p class="muted small">${same.length} partida(s) neste cenário · ${statsOf(same).w} vitória(s).</p></div>`;
}
/* Mini-gráfico das últimas partidas. */
function scoreChartSvg(list) {
  const L = list.slice(0, 20).reverse(); if (!L.length) return '';
  const max = Math.max(50, ...L.map((g) => Math.abs(g.score))); const W = 300, H = 90, bw = W / 20;
  const y0 = L.some((g) => g.score < 0) ? H / 2 : H - 4; const k = (y0 - 4) / max;
  return _T`<svg class="sc-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pontuação das últimas partidas">
    <line x1="0" x2="${W}" y1="${y0}" y2="${y0}" class="ax"/>
    ${L.map((g, i) => { const hgt = Math.max(2, Math.abs(g.score) * k); const y = g.score >= 0 ? y0 - hgt : y0; return _T`<rect x="${i * bw + 2}" y="${y}" width="${bw - 4}" height="${hgt}" rx="2" class="${g.outcome}"><title>${SC[g.scen]?.name ?? g.scen}: ${g.score} PV</title></rect>`; }).join('')}
  </svg>`;
}
function showStats() {
  const all = history(); const h = all.filter((g) => !g.tut);
  const s = statsOf(h), sk = streaks(h);
  const card = (v, l) => `<div class="st-c"><b>${v ?? '—'}</b><span>${l}</span></div>`;
  const byScen = SCENARIOS.map((sc) => { const L = h.filter((g) => g.scen === sc.id); return { sc, ...statsOf(L), last: L[0] }; });
  const byChar = CHARACTERS.map((c) => ({ c, ...statsOf(h.filter((g) => g.char === c.id)) })).filter((x) => x.n);
  const notWon = byScen.filter((x) => !x.w).map((x) => x.sc.name);
  const res = (o) => ({ win: _T`Vitória`, lose: _T`Derrota`, none: '—' }[o] || o);
  modal(_T`<h2>📊 Estatísticas</h2>
    ${!h.length ? _T`<p>Nenhuma partida terminada ainda. Ao encerrar uma partida, ela aparece aqui.</p>` : _T`
    <div class="st-cards">${card(s.n, _T`partidas`)}${card(s.w, _T`vitórias`)}${card(s.rate + '%', _T`aproveitamento`)}${card(s.best, _T`melhor PV`)}${card(s.avg, _T`média PV`)}${card(sk.cur + ' / ' + sk.best, _T`sequência atual / maior`)}</div>
    <h3>Últimas partidas</h3>${scoreChartSvg(h)}<p class="muted small"><span class="lg-w"></span> vitória <span class="lg-l"></span> derrota</p>
    <h3>Por cenário</h3>
    <table class="st-t"><tr><th>Cenário</th><th>Jogos</th><th>Vit.</th><th>Recorde</th></tr>
    ${byScen.map((x) => `<tr class="${x.n ? '' : 'muted'}"><td>${x.sc.name} <span class="diff ${x.sc.diff}">${DIFF[x.sc.diff]}</span></td><td>${x.n}</td><td>${x.w}</td><td>${x.best ?? '—'}</td></tr>`).join('')}</table>
    ${notWon.length ? _T`<p class="small">Ainda não vencidos: ${notWon.join(', ')}.</p>` : _T`<p class="small">🏆 Você já venceu todos os cenários!</p>`}
    ${byChar.length ? _T`<h3>Por personagem</h3><table class="st-t"><tr><th>Personagem</th><th>Jogos</th><th>Vit.</th><th>Recorde</th></tr>
    ${byChar.sort((a, b) => b.n - a.n).map((x) => `<tr><td>${x.c.name}</td><td>${x.n}</td><td>${x.w}</td><td>${x.best}</td></tr>`).join('')}</table>` : ''}`}
    ${all.length ? _T`<h3>Histórico</h3><div class="st-h">${all.slice(0, 40).map((g) => `<details><summary><span>${new Date(g.at).toLocaleDateString(isEN ? 'en-US' : 'pt-BR')}</span> ${SC[g.scen]?.name ?? g.scen}${g.adv ? _T` (av.)` : ''}${g.tut ? ' 🎓' : ''} · <b class="${g.outcome}">${res(g.outcome)} ${g.score}</b></summary>
      <p class="small">${CH[g.char]?.name ?? g.char}${g.why ? ' · ' + esc(g.why) : ''}${g.turn ? _T` · terminou no turno ${g.turn}` : ''}${g.mins ? _T` · ${g.mins} min` : ''}</p>
      ${g.stages ? _T`<p class="small muted">PV por etapa: ${[3, 6, 9, 12].map((t) => g.stages[t] ?? '—').join(' · ')}${g.batTot ? ` · ${(BAT_NAME[g.scen] || [_T`Batalhas`])[0].toLowerCase()} ${g.bats}/${g.batTot}` : ''}</p>` : ''}</details>`).join('')}</div>` : ''}
    <div class="menu row"><button class="btn small" data-exp>Exportar backup</button><label class="btn small">Importar backup<input type="file" accept=".json,application/json" data-imp hidden></label>${all.length ? _T`<button class="btn small danger" data-clr>Apagar histórico</button>` : ''}<button class="btn small" data-close>Fechar</button></div>
    <p class="muted small">Partidas guiadas (🎓) aparecem no histórico, mas não contam nas estatísticas.</p>`, () => {
    $('[data-exp]').onclick = () => {
      const blob = new Blob([JSON.stringify({ app: 'knight', v: 1, history: history() }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `knight-historico-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $('[data-imp]').onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const d = JSON.parse(await file.text()); const inc = Array.isArray(d) ? d : d.history; if (!Array.isArray(inc)) throw 0;
        const cur = history(); const key = (g) => g.id || g.at; const seen = new Set(cur.map(key));
        const merged = [...cur, ...inc.filter((g) => g && g.scen && !seen.has(key(g)))].sort((a, b) => b.at - a.at);
        saveHistory(merged); toast(_T`${merged.length - cur.length} partida(s) importada(s).`); showStats();
      } catch { toast(_T`Arquivo inválido.`); }
    };
    const clr = $('[data-clr]'); if (clr) clr.onclick = () => { if (confirm(_T`Apagar todo o histórico de partidas deste aparelho?`)) { saveHistory([]); showStats(); if (!$('#setup').hidden) goSetup(); } };
  });
}
