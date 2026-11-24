'use strict';
/* Guia de cada cenário: resumo, nuances e dicas (texto próprio do app) + partes montadas a partir dos dados. */

const SCEN_TEXT = {
  defending: {
    sum: _T`É o cenário de aprendizado. Um reino vizinho invade suas terras pelas bordas do mapa e marcha em direção ao seu castelo. Você segura o avanço com unidades no mapa, vence batalhas usando o que construiu na Corte e usa a Influência para arrancar ajuda do reino.`,
    nuance: [
      _T`Cada lado tem no máximo 8 peças no mapa e 4 numa mesma área.`,
      _T`Quando o cartão manda o inimigo fazer algo e nenhuma peça dele consegue cumprir, quem ganha é a Diplomacia inimiga (+1).`,
      _T`O castelo é o ponto fraco: um ataque a ele sem defesa suficiente encerra a partida na hora.`,
    ],
    tips: [
      _T`Deixe sempre alguém na área do castelo; uma unidade parada ali evita a derrota mais comum.`,
      _T`As batalhas pedem muito Valor. Combate, Arsenal e Torneios são as trilhas que destravam a maioria delas.`,
      _T`A vitória por áreas é a mais rápida: espalhe unidades por áreas vazias e retire os inimigos que chegarem perto.`,
    ],
  },
  templars: {
    sum: _T`Aqui você é o atacante. Os Templários estão enfraquecidos e guardam riquezas no castelo deles. Você vence invadindo esse castelo ou ganhando as batalhas decisivas, antes que eles se reorganizem.`,
    nuance: [
      _T`Já começa 1 templário dentro do castelo deles.`,
      _T`Para tomar o castelo, leve pelo menos 2 unidades até lá e ataque quando não sobrar nenhum defensor.`,
      _T`Eles podem ter até 10 peças no mapa; você continua limitado a 8.`,
    ],
    tips: [
      _T`Avance em grupo: unidades espalhadas não conseguem limpar o castelo.`,
      _T`A ação de Ouro que move os inimigos (Nobres 2) ajuda a esvaziar o caminho.`,
      _T`Quatro batalhas bastam para vencer; elas giram em torno de Torneios, Nobres, Combate e Senhores.`,
    ],
  },
  barbarian: {
    sum: _T`Bárbaros entram por todos os lados ao mesmo tempo, e o rei ainda não acredita no perigo. Os primeiros turnos servem para conquistar apoio na corte e espalhar defesas; depois é hora de limpar o mapa.`,
    nuance: [
      _T`Bárbaros novos ocupam primeiro as áreas de entrada (escudo vermelho) que ainda estão vazias. Só depois de todas ocupadas eles começam a se acumular.`,
      _T`Neste cenário o Comando também permite mover inimigos e coletar recursos do mapa.`,
      _T`Com Rei 3, 9 Ouro removem 1 bárbaro do mapa.`,
    ],
    tips: [
      _T`Ocupe cedo áreas com recursos e use Coletar: o mapa paga boa parte da sua Corte.`,
      _T`A primeira batalha exige Castelo 3 e 12 Ouro; planeje o Ouro com antecedência.`,
      _T`Controlar 6 áreas sem bárbaros também vence; as áreas de entrada são as mais disputadas.`,
    ],
  },
  flood: {
    sum: _T`Não existe exército inimigo: o adversário é a água. Cada peça inimiga é uma área alagando e cada peça sua é uma equipe de trabalhadores segurando diques. O rei não quer ajudar, então a diplomacia pesa muito.`,
    nuance: [
      _T`Cabe só 1 água e 1 equipe de trabalhadores em cada área.`,
      _T`A água aparece primeiro nas áreas de entrada e depois se espalha para áreas vizinhas das que já estão alagadas.`,
      _T`Quando a água ataca, a área inunda e é riscada para sempre, a não ser que haja trabalhadores ali: eles se perdem no lugar da área.`,
      _T`Trabalhadores podem ir para qualquer área que ainda esteja seca.`,
    ],
    tips: [
      _T`Proteja primeiro as áreas com vilas e o castelo: são elas que contam para a derrota.`,
      _T`O seu ataque tira a água da área. Use o Comando antes que o ataque inimigo chegue.`,
      _T`Com Conhecimento 2, 6 Ouro colocam uma equipe nova; com Nobres 2, 3 Ouro rendem os recursos de uma área.`,
    ],
  },
  elections: {
    sum: _T`Uma disputa política, sem castelo e sem batalhas de verdade. As peças no mapa representam apoio eleitoral, e você conquista uma região tendo mais apoio nela do que o rival.`,
    nuance: [
      _T`As suas peças e as do rival podem entrar em qualquer área; no máximo 2 de cada lado por área.`,
      _T`O rival ocupa primeiro áreas onde ainda não tem ninguém e nunca muda as peças de lugar.`,
      _T`Vantagem numa área significa ter mais peças ali do que o adversário. O app conta isso sozinho pelo mapa.`,
      _T`Os ataques do rival destroem recursos e moedas do mapa. Risque-os com ✕ e o app soma as áreas arrasadas e as moedas perdidas.`,
      _T`As "batalhas" são debates políticos: cada um custa 6 Ouro e mais 1 recurso.`,
    ],
    tips: [
      _T`Duas peças numa área seguram a vantagem mesmo depois que o rival chegar com uma.`,
      _T`Guarde Ouro: os debates e a ação especial (trocar uma peça dele por uma sua) consomem bastante.`,
      _T`Defenda as áreas com moedas; perder 6 moedas é derrota.`,
    ],
  },
  rebely: {
    sum: _T`Uma revolta financiada por inimigos políticos toma as suas terras. Os rebeldes surgem espalhados, um por área, e não se movem. O desafio é marcar presença no território todo antes que eles arrasem as áreas.`,
    nuance: [
      _T`Um rebelde novo sempre vai para uma área que ainda não tem rebelde; nunca há mais de 1 por área.`,
      _T`Os rebeldes nunca se movem, mas os ataques deles destroem áreas.`,
      _T`Você pode ter até 4 unidades na mesma área.`,
      _T`Para vencer pelo mapa, tenha unidades suas em 6 áreas diferentes, mesmo que haja rebeldes nelas. O app conta isso sozinho.`,
    ],
    tips: [
      _T`Espalhe-se: uma unidade em cada área vale mais do que um grupo forte num lugar só.`,
      _T`Com Rei 2, 5 Ouro removem 1 rebelde; com Conhecimento 2, 6 Ouro movem as suas unidades.`,
      _T`As batalhas são variadas (Rei, Senhores, Vila, Estábulo, Influência e PV); escolha as que combinam com a sua Corte.`,
    ],
  },
  oldcastle: {
    sum: _T`Você quer retomar o castelo que a família perdeu por dívidas. É um cerco: guardas em postos fixos protegem o caminho, e o castelo só cai com uma força grande lá dentro.`,
    nuance: [
      _T`Os inimigos nunca se movem.`,
      _T`Quem entra numa área com guarda fica preso ali até derrotar todos os inimigos dela.`,
      _T`Até 3 inimigos e 4 unidades suas por área.`,
      _T`Para vencer pelo mapa, leve 4 unidades ao castelo e ataque quando não houver defensores.`,
      _T`No app, unidades presas aparecem com 🔒 e não podem ser arrastadas para fora da área.`,
    ],
    tips: [
      _T`Escolha uma rota e limpe guarda por guarda; dividir as forças deixa unidades presas.`,
      _T`A ação especial coloca unidades usando Glória (5 Glória, com Conhecimento 3).`,
      _T`Fique de olho nas guardas: se todas tiverem 3 inimigos, você perde.`,
    ],
  },
  plague: {
    sum: _T`Uma peste avança de vila em vila. Você não luta contra soldados: isola a doença, queima vilas antes que ela chegue e organiza quarentenas.`,
    nuance: [
      _T`A peste nasce nas áreas de entrada e depois se espalha para áreas vizinhas das já infectadas ou destruídas.`,
      _T`Quando a peste ataca, ela mata primeiro uma unidade sua na área. Se não houver ninguém, destrói a área e segue para a área vizinha mais próxima que ainda esteja limpa.`,
      _T`Cada vila tomada pela peste é riscada; 6 vilas perdidas é derrota.`,
      _T`Queimar uma vila exige uma unidade sua nela e um ataque; não dá para queimar uma vila já infectada.`,
      _T`Só 1 peste e 1 unidade sua por área.`,
    ],
    tips: [
      _T`Queime primeiro as vilas mais próximas da peste: são as que você perderia de qualquer jeito.`,
      _T`As quarentenas (as "batalhas" deste cenário) pedem Conhecimento, Rei, Igreja e Mercadores.`,
      _T`Com Rei 3, 3 Nobreza removem uma peste do mapa.`,
    ],
  },
  conquer: {
    sum: _T`Uma ofensiva em grande escala contra o vizinho. Ele tem vários castelos espalhados pelo mapa e você precisa tomar 3 deles, ou vencer as batalhas decisivas.`,
    nuance: [
      _T`Começam 2 inimigos, em dois castelos diferentes que você escolhe.`,
      _T`Só 1 peça de cada lado por área.`,
      _T`Para tomar um castelo, entre com 1 unidade e ataque quando não houver defensor.`,
    ],
    tips: [
      _T`Com só 1 unidade por área, avance em várias frentes ao mesmo tempo.`,
      _T`Com Igreja 2, 7 Ouro colocam uma unidade nova.`,
      _T`As 6 batalhas são baratas (2 recursos cada), mas exigem níveis altos em trilhas variadas.`,
    ],
  },
  duel: {
    sum: _T`Uma rixa entre famílias. O rival é muito mais forte no mapa, então a saída é política: forçar um duelo de honra ou ganhar tanto prestígio que o rei mande o rival recuar.`,
    nuance: [
      _T`As peças dos dois lados podem entrar em qualquer área.`,
      _T`O rival sempre entra numa área onde ainda não tem ninguém; no máximo 1 dele por área.`,
      _T`As "batalhas" aqui são as condições do duelo: sua Diplomacia pelo menos 3, Rei no nível 3 e a Diplomacia do rival pelo menos 3 (ele só aceita o duelo sob pressão).`,
    ],
    tips: [
      _T`Diplomacia é tudo neste cenário: priorize as ações de Influência que dão Diplomacia.`,
      _T`O rival traz muitas peças; segure o mapa só o suficiente para ele não destruir 6 áreas.`,
      _T`Com Senhores 3, 7 Ouro colocam uma unidade sua.`,
    ],
  },
  stronghold: {
    sum: _T`Enquanto você estava fora, inimigos isolaram a sua fortaleza do resto do reino. É uma corrida: levar reforços até lá antes que eles cheguem com força.`,
    nuance: [
      _T`Suas unidades só cruzam o rio onde há uma seta, e apenas no sentido em que ela aponta: não dá para voltar pelo mesmo caminho. O inimigo não tem essa restrição.`,
      _T`Para vencer pelo mapa, tenha 4 unidades suas no castelo sem inimigos lá.`,
      _T`Você perde se o inimigo levar 4 unidades ao castelo sem defesa e atacar.`,
      _T`No modo avançado, suas unidades numa área com inimigo ficam presas (🔒 no app) até a área ser limpa.`,
    ],
    tips: [
      _T`Planeje a travessia: as setas são mão única. Antes de cruzar, confira se a unidade não vai ficar do lado errado do rio.`,
      _T`A ação especial troca 3 recursos quaisquer por 10 PV (Mercadores 3); útil para as batalhas que pedem PV.`,
      _T`Uma unidade no castelo cedo evita sustos.`,
    ],
  },
  monster: {
    sum: _T`Senhor Greyson, o Monstro, devasta as vilas da sua família. As tropas dele marcham sempre para a vila intacta mais próxima, e cada vila perdida aproxima a derrota.`,
    nuance: [
      _T`Ninguém atravessa uma área ocupada pelo outro lado: quem entra para ali até haver batalha.`,
      _T`As tropas do Monstro andam em direção à vila mais próxima que ainda está de pé (em empate, você escolhe).`,
      _T`O Monstro começa com 3 tropas no castelo dele.`,
      _T`Você perde com 5 vilas destruídas, 6 terrenos destruídos ou 9 tropas do Monstro no mapa.`,
    ],
    tips: [
      _T`Coloque unidades entre o castelo do Monstro e as vilas: elas param a marcha.`,
      _T`Com Igreja 2, 7 Ouro colocam uma unidade nova.`,
      _T`Para vencer pelo mapa, leve 4 unidades ao castelo do Monstro sem tropas dele lá.`,
    ],
  },
};

/* Ordem em que cada trilha de consequência é usada (1ª, 2ª, 3ª vez...). */
function consSchedule(id, t) {
  const els = ((CONS_TRACKS[id] || {})[t] || '').split('|').filter(Boolean);
  const out = [];
  for (let n = 1; ; n++) {
    const idx = consIdx(n).filter((i) => i < els.length); if (!idx.length) break;
    out.push(idx.map((i) => consParse(els[i])));
  }
  return { els, out };
}
function consStepText(id, step) {
  return step.map((p, j) => {
    const txt = effText(p.eff, id);
    if (p.cost) return _T`pague ${p.cost.n} ${RES[p.cost.k].name} para evitar: ${txt}`;
    return step.length > 1 && j === 0 ? _T`${txt} (sem custo, acontece)` : txt;
  }).join(_T` · depois: `);
}
function enemyHtml(id) {
  const EFF_GROUP = { a: _T`chegadas`, m: _T`movimentos`, at: _T`ataques`, d: _T`Diplomacia` };
  return [1, 2, 3].map((t) => {
    const { els, out } = consSchedule(id, t);
    const cnt = { a: 0, m: 0, at: 0, d: 0 };
    for (const e of els) { const f = consParse(e).eff; if (f === 'at') cnt.at++; else if (f === 'd') cnt.d++; else if (f[0] === 'm') cnt.m++; else if (f === 'am') { cnt.a++; cnt.m++; } else cnt.a++; }
    const tag = Object.entries(cnt).filter(([, n]) => n).map(([k, n]) => `${n} ${EFF_GROUP[k]}`).join(' · ');
    return _T`<details class="trk"><summary><b>Trilha ${t}</b> <span class="muted small">${tag}</span></summary><ol>${out.map((s) => `<li>${esc(consStepText(id, s))}</li>`).join('')}</ol></details>`;
  }).join('');
}
function dipSources(id) {
  const out = [];
  const kc = (KING_COLS[id] || []).map((c, i) => (c.dip ? i + 1 : 0)).filter(Boolean);
  if (kc.length) out.push(_T`Ação do Rei no cartão: colunas ${kc.join(', ')} dão +1 Diplomacia (cada coluna exige Rei no nível correspondente).`);
  const inf = (INF_ACTS[id] || []).map((r) => {
    const l = r.L.filter((x) => /^dip/.test(x)).length, rr = r.R.filter((x) => /^dip/.test(x)).length;
    return l + rr ? `${ACT_NAMES[r.act]} (${l + rr}×)` : '';
  }).filter(Boolean);
  if (inf.length) out.push(_T`Ações de Influência do cartão com Diplomacia: ${inf.join(', ')}.`);
  if (S && S.charId) { const th = (CHAR_SKILLS[S.charId] || {}).thr || []; const d = th.filter((x) => x.r.dip).map((x) => x.inf); if (d.length) out.push(_T`Seu personagem ganha Diplomacia ao chegar a Influência ${d.join(' e ')}.`); }
  out.push(_T`Algumas cartas de objetivo e o último segmento do Rei na Corte (Influência 26) também dão Diplomacia.`);
  return out;
}
function battleCostTxt(c) { return parseCosts(c).map(([k, n]) => (k === 'any' ? _T`qualquer` : k === 'gold' ? _T`${n} Ouro` : RES[k].name)).join(', '); }
function scenGuideHtml() {
  const id = S.scenId; const sc = SC[id]; const T = SCEN_TEXT[id] || { sum: sc.story, nuance: sc.rules, tips: [] };
  const wl = wlList(); const bn = BAT_NAME[id] || [_T`Batalhas`, _T`batalha`];
  const dE = [1, 2, 3].reduce((s, t) => s + consSchedule(id, t).els.filter((e) => consParse(e).eff === 'd').length, 0);
  const cmds = cmdList().map((c) => CMD_DEF[c].label).join(', ');
  const gold = goldActions().map((a) => `<li>${costHtml(a.cost)} → ${esc(a.label)}${a.req ? ` <small class="muted">(${esc(reqText(a.req))})</small>` : ''}</li>`).join('');
  return _T`<div class="panel prose sguide">
    <h2>${sc.name}${isEN ? '' : ` <span class="muted small">· ${sc.en}</span>`}</h2><span class="diff ${sc.diff}">${DIFF[sc.diff]}</span>
    <div class="sg-sum">${esc(T.sum)}</div>
    <p class="muted small">Limites: suas unidades ${sc.lim[0]} no mapa (${sc.lim[2]} por área) · inimigas ${sc.lim[1]} no mapa (${sc.lim[3]} por área).</p>
    <h3>🏆 Como vencer</h3><ul>${wl.win.map((c) => `<li>${esc(c.text)}</li>`).join('')}</ul>
    <h3>💀 Como perder</h3><ul>${wl.lose.map((c) => `<li>${esc(c.text)}</li>`).join('')}</ul>
    <p class="muted small">Sem nenhuma condição cumprida até o fim do turno 12: −100 PV. Se ainda sobrar pontuação positiva, conta como vitória.</p>
    <h3>📜 O que muda neste cenário</h3><ul>${T.nuance.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    <h3>⚔ Como o inimigo age</h3>
    <p>Cada lado de carta de evento indica uma trilha (1, 2 ou 3). Toda vez que você escolhe um lado, o inimigo usa a próxima consequência daquela trilha. Da 2ª vez em diante vêm duas: a primeira pode ser evitada pagando o custo indicado; a segunda sempre acontece.</p>
    ${enemyHtml(id)}
    <h3>🕊 Diplomacia</h3>
    <p>Quem completar a trilha de Diplomacia (5) decide a partida: a sua completa é vitória, a inimiga completa é derrota. As trilhas deste cenário têm <b>${dE}</b> símbolos de +1 Diplomacia inimiga, e cada ordem que o inimigo não consegue cumprir soma mais 1.</p>
    <ul>${dipSources(id).map((t) => `<li>${esc(t)}</li>`).join('')}${cmdList().includes('dip') ? _T`<li>O Comando “−1 Dipl. inimiga” reduz a do inimigo.</li>` : ''}</ul>
    <h3>🛠 Suas ferramentas</h3>
    <ul><li><b>Comando:</b> ${esc(cmds)}.</li>
      <li><b>${bn[0]}:</b> ${battles().length}. ${(BATTLES[id] || []).map(([r, l, c]) => `${esc(batReqLabel({ req: r, lvl: l }))} (${esc(battleCostTxt(c))})`).join(' · ')}.</li></ul>
    <p><b>Ações de Ouro</b> (sem limite por turno):</p><ul>${gold}</ul>
    ${T.tips.length ? _T`<h3>💡 Dicas</h3><ul>${T.tips.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
    <h3>Modo avançado ${S.advanced ? _T`<span class="tag">ativo</span>` : ''}</h3><ul>${sc.advanced.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
  </div>`;
}
