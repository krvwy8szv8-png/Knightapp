'use strict';
/* Partida guiada: um passo a passo por cima de uma partida real (Defendendo o Reino, código GUIA). */
const TUT_CHAR = 'barristan', TUT_SCEN = 'defending', TUT_SEED = 'GUIA';
const courtPaidCount = () => {
  const walk = (o) => (o && typeof o === 'object' ? Object.values(o).reduce((n, v) => n + walk(v), 0) : o ? 1 : 0);
  const st = courtState(); return walk(st.paid) + walk(st.rooms);
};
const TUT = [
  { t: _T`Bem-vindo ao KNIGHT!`, b: _T`Nesta partida guiada você joga o 1º turno inteiro com a minha ajuda, no cenário mais fácil. Cada turno tem 5 fases, mostradas no topo da Mesa. Toque em <b>Próximo</b> para começar.`, next: true },
  { t: _T`Seu objetivo da etapa`, sel: '.goal-bar', tab: 'table', b: _T`A cada 3 turnos o app avalia esta carta de objetivo. ★ é o que dá recompensa e ⚠ é o que evita a penalidade. Os valores marcados com 🎯 no painel de cima mostram onde você precisa chegar.`, next: true },
  { t: _T`A fileira de cartas`, sel: '.row-wrap', tab: 'table', b: _T`Estas são as 6 cartas de evento da rodada: cada turno usa a próxima. Duas começam viradas para cima; as outras você descobre jogando (ou revela pagando 1 Ouro).`, next: true },
  { t: _T`Escolha um lado`, sel: '.active-card', tab: 'table', b: _T`Cada carta tem dois lados. Toque no lado <b>esquerdo</b> ou <b>direito</b> da carta grande para ver a prévia.`, done: () => ui.preview || S.choice },
  { t: _T`Compare os lados`, sel: '[data-confirm], .phase-box', tab: 'table', b: _T`A prévia mostra os recursos que você ganha agora, as ações que serão ativadas e a consequência (o que o inimigo fará). Toque no outro lado para comparar e, quando decidir, toque em <b>Confirmar</b>.`, done: () => S.choice },
  { t: _T`Hora de gastar`, sel: '[data-tab="court"]', b: _T`Fase 2: use os recursos. O número verde na aba mostra quantos segmentos você já consegue completar. Abra a <b>Corte</b>.`, done: () => ui.tab === 'court' || S.phase > 2 },
  { t: _T`Pague um custo`, sel: '#canvas-court', tab: 'court', enter: () => { S.tut.base = courtPaidCount(); },
    b: _T`Os custos são os <b>círculos</b> de baixo. Contorno <b>verde</b> = dá para pagar agora com o que você tem; <b>roxo</b> = dá pagando com o privilégio do personagem; <b>amarelo</b> = liberado, mas ainda falta recurso. Toque num círculo verde para pagar.`, done: () => courtPaidCount() > (S.tut.base || 0) || S.phase > 2, skip: _T`Não tenho nada verde` },
  { t: _T`Como a Corte rende`, sel: '.levels', tab: 'court', b: _T`Ao pagar todos os custos de um segmento: a <b>estrela</b> é recompensa imediata, o <b>quadrado</b> passa a render a cada ativação daquela ação e o <b>hexágono</b> dá +1 Influência. Os níveis de cada ação aparecem aqui embaixo.`, next: true },
  { t: _T`Volte à Mesa`, sel: '[data-tab="table"]', b: _T`Pague o que quiser e depois volte para a <b>Mesa</b>.`, done: () => ui.tab === 'table' },
  { t: _T`Ative a ação`, sel: '[data-next]', tab: 'table', b: _T`Fase 3: as ações do lado escolhido rendem os ganhos (quadrados) já destravados. Toque em <b>Ativar a ação</b>.`, done: () => S.phase >= 3 },
  { t: _T`Receba os ganhos`, sel: '[data-gains], .phase-box', tab: 'table', b: _T`Aqui aparece o que cada ação rende hoje. Toque em <b>Receber ganhos</b> (se houver). O que você ganha agora só pode ser gasto no próximo turno.`, done: () => S.gainsTaken || !$('[data-gains]') || S.phase >= 4 },
  { t: _T`Ação no Cenário`, sel: '.inf-pick', tab: 'table', b: _T`Igreja, Nobres e Mercadores também dão uma ação única no cartão do Cenário. Escolha o lado ← ou → do botão: cada lado segue uma linha diferente do cartão, e o que já foi usado não volta.`, done: () => S.phase >= 4 || !infPending().length },
  { t: _T`Siga para as consequências`, sel: '[data-next]', tab: 'table', b: _T`Toque em <b>Consequências →</b>.`, done: () => S.phase >= 4 },
  { t: _T`O inimigo reage`, sel: '.assist.run, .phase-box', b: _T`Fase 4: o número no lado escolhido indica a trilha de consequência. Se houver custo, você pode pagar para evitar. Toque em <b>▶ Executar no mapa</b>: o app mostra onde as unidades inimigas entram, para onde andam ou o que o ataque destrói. Confira (dá para tocar em outra área destacada para trocar) e toque em <b>Aplicar</b>.`, done: () => consPending() === 0 || S.turn > 1, skip: _T`Já resolvi` },
  { t: _T`Encerre o turno`, sel: '[data-next]', tab: 'table', b: _T`Pronto! Toque em <b>Encerrar o turno 1</b>.`, done: () => S.turn > 1 },
  { t: _T`Seu mapa e suas ferramentas`, sel: '[data-tab="scen"]', b: _T`Na aba <b>Cenário</b> ficam o mapa (com o 🧭 Assistente), as batalhas, as ações de Ouro e o <b>Guia</b> deste cenário, com como vencer, como perder e como o inimigo age.`, next: true },
  { t: _T`Tudo pronto!`, b: _T`Agora é com você. Dicas: ↶ desfaz qualquer passo; o selo verde nas abas mostra o que dá para fazer; Regras → Ícones explica cada símbolo. Boa partida!`, next: true, last: true },
];
function tutMapCons() { return !!(S.cons && S.cons.turn === S.turn && S.cons.items.some((i) => i.st === 'done' && consParse(i.e).eff !== 'd')); }
function tutAddCount() {
  if (!S.cons) return 0;
  return S.cons.items.filter((i) => i.st === 'done').reduce((n, i) => { const e = consParse(i.e).eff; const m = e.match(/^a(\d)$/); return n + (m ? +m[1] : e === 'am' ? 1 : 0); }, 0);
}
function tutStart() {
  newGame(TUT_CHAR, TUT_SCEN, false, TUT_SEED);
  S.tut = { i: 0 };
  ui.tab = 'table'; ui.preview = null; render();
}
function tutStep() { return S && S.tut ? TUT[S.tut.i] : null; }
function tutAdvance() {
  S.tut.i++; S.tut.base = null; const st = TUT[S.tut.i];
  if (!st) { S.tut = null; save(); $('#tut').hidden = true; clearTutHl(); toast(_T`Partida guiada concluída. Continue jogando normalmente!`); return; }
  if (st.enter) st.enter();
  if (st.tab && ui.tab !== st.tab && !st.done) { ui.tab = st.tab; }
  save(); render();
}
function clearTutHl() { $$('.tut-hl').forEach((e) => e.classList.remove('tut-hl')); }
function tutRender() {
  const box = $('#tut'); if (!box) return;
  if (!S || !S.tut) { box.hidden = true; clearTutHl(); return; }
  let st = tutStep();
  let guard = 0;
  let entered = false;
  while (st && ((st.when && !st.when()) || (st.done && st.done())) && guard++ < 20) { S.tut.i++; S.tut.base = null; st = tutStep(); if (st && st.enter && !(st.when && !st.when())) { st.enter(); entered = true; } }
  if (entered) { save(); setTimeout(render, 0); }
  if (!st) { S.tut = null; save(); box.hidden = true; clearTutHl(); return; }
  clearTutHl();
  let target = null;
  if (st.sel) for (const s of st.sel.split(',')) { const e = $(s.trim()); if (e && e.offsetParent !== null) { target = e; break; } }
  if (target) {
    target.classList.add('tut-hl');
    if (S.tut.scrolled !== S.tut.i) { S.tut.scrolled = S.tut.i; setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); }
  }
  const wrongTab = st.tab && ui.tab !== st.tab;
  box.hidden = false; box.classList.toggle('min', !!ui.tutMin);
  if (ui.tutMin) { box.innerHTML = `<button class="tut-pill" data-tutmax>🎓 ${S.tut.i + 1}/${TUT.length} · ${st.t} ▴</button>`; $('[data-tutmax]', box).onclick = () => { ui.tutMin = false; tutRender(); }; return; }
  box.innerHTML = _T`<div class="tut-h"><span>🎓 Partida guiada · ${S.tut.i + 1}/${TUT.length}</span><span><button class="tut-x" data-tutmin aria-label="Minimizar">▾</button> <button class="tut-x" data-tutx aria-label="Sair do guia">Sair</button></span></div>
    <b>${st.t}</b><p>${st.b}</p>
    <div class="tut-a">${wrongTab ? _T`<button class="btn small" data-tutgo>Ir para ${{ table: _T`Mesa`, court: _T`Corte`, scen: _T`Cenário` }[st.tab]}</button>` : ''}
    ${st.next ? `<button class="btn primary small" data-tutnext>${st.last ? _T`Concluir` : _T`Próximo`}</button>` : ''}
    ${st.skip ? `<button class="btn small" data-tutnext>${st.skip}</button>` : ''}</div>`;
  $('[data-tutnext]', box) && $$('[data-tutnext]', box).forEach((b) => (b.onclick = tutAdvance));
  $('[data-tutgo]', box) && ($('[data-tutgo]', box).onclick = () => { ui.tab = st.tab; render(); });
  $('[data-tutmin]', box).onclick = () => { ui.tutMin = true; tutRender(); };
  $('[data-tutx]', box).onclick = () => { if (confirm(_T`Sair da partida guiada? A partida continua normalmente.`)) { S.tut = null; save(); tutRender(); } };
}
