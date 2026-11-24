'use strict';
/* Glossário de ícones (aba Regras → Ícones). */
const ACT_ICON = (k) => `assets/icons/act-${k}.webp`;
const GLOSSARY = [
  { t: _T`Recursos`, items: [
    ['svg:g', _T`Glória`, _T`Recurso amarelo. Paga custos com o mesmo símbolo.`],
    ['svg:n', _T`Nobreza`, _T`Recurso azul. Paga custos com o mesmo símbolo.`],
    ['svg:v', _T`Valor`, _T`Recurso vermelho. É o mais pedido nas batalhas.`],
    ['svg:gold', _T`Ouro`, _T`Moeda. Compra ações de Ouro do cenário e paga alguns custos. Cada recurso e cada Ouro que sobrar no fim vale 5 PV.`],
    ['svg:g', _T`Quadrado = ganho a cada ativação`, _T`Na Corte, completar o segmento não dá o recurso na hora: ele passa a vir toda vez que a ação for ativada. No mapa, é o recurso que a área rende.`],
    ['svg:cg', _T`Círculo = custo`, _T`Recurso dentro de círculo é algo que você PAGA para riscar o espaço na Corte.`],
    ['txt:◯', _T`Círculo vazio`, _T`Custo que aceita qualquer recurso (Glória, Nobreza ou Valor).`],
  ] },
  { t: _T`Painel do jogador`, items: [
    ['svg:cp', _T`Comando`, _T`Pontos para agir no mapa (colocar, atacar, mover...). Não acumulam: o que não for usado no turno se perde.`],
    ['svg:inf', _T`Influência`, _T`Sobe ao completar segmentos com hexágono. Destrava limiares do personagem, ações do cenário e alguns custos.`],
    ['svg:pv', _T`PV (banner verde)`, _T`Pontos de vitória. Os números em banners verdes nas cartas são PV ganhos ao completar a trilha ou a linha.`],
    ['svg:dipP', _T`Sua Diplomacia`, _T`Trilha de 0 a 5. Completa, você vence na hora.`],
    ['svg:dipE', _T`Diplomacia inimiga`, _T`Trilha de 0 a 5. Completa, você perde na hora.`],
  ] },
  { t: _T`Ações da Corte`, items: [
    ['img:king', _T`Rei`, _T`Recursos do Rei e a próxima coluna da Ação do Rei no cenário.`],
    ['img:church', _T`Igreja`, _T`Recursos da Igreja e uma ação de Influência no cenário.`],
    ['img:nobles', _T`Nobres`, _T`Recursos dos Nobres e uma ação de Influência no cenário.`],
    ['img:merchants', _T`Mercadores`, _T`Recursos dos Mercadores e uma ação de Influência no cenário.`],
    ['img:lords', _T`Senhores`, _T`Os seis retratos; cada senhor rende os próprios recursos.`],
    ['img:castle', _T`Castelo`, _T`Salas em 3 andares; andares completos sobem o nível.`],
    ['img:village', _T`Vila`, _T`Segmentos pagos com Ouro; liga-se ao Castelo por corrente.`],
    ['img:stable', _T`Estábulo`, _T`Liga-se ao Castelo por corrente.`],
    ['img:armory', _T`Arsenal`, _T`Seis segmentos livres; pedido em várias batalhas.`],
    ['img:combat', _T`Combate`, _T`Trilha de recompensas; requisito comum das batalhas.`],
    ['img:knowledge', _T`Conhecimento`, _T`Trilha de recompensas; destrava trocas baratas de recurso.`],
    ['img:fame', _T`Fama (trompete)`, _T`Trilha de recompensas; destrava Influência por Ouro.`],
    ['img:tournaments', _T`Torneios (cavaleiro)`, _T`Quatro torneios livres que pagam Ouro e PV.`],
  ] },
  { t: _T`Símbolos da Corte e do personagem`, items: [
    ['svg:hex', _T`Hexágono`, _T`Hexágono vazio no segmento: completar dá +1 Influência. Com número dentro: Influência mínima para liberar o segmento.`],
    ['svg:hexd', _T`Hexágono pontilhado`, _T`Limiar de Influência: ao alcançar o número, você ganha o que está ao lado.`],
    ['txt:☆', _T`Estrela = recompensa imediata`, _T`Você recebe uma vez só, na hora em que paga o último custo do segmento. Depois é riscada e não se repete.`],
    ['txt:△', _T`Triângulo`, _T`Fica acima do segmento e é marcado quando você o completa, para ver rápido quais segmentos rendem na ativação.`],
    ['txt:⛓', _T`Corrente`, _T`Liga duas trilhas: com a ligação feita, ativar uma também ativa a vizinha.`],
    ['txt:🎯', _T`Meta do objetivo (app)`, _T`O app marca com 🎯 o que a próxima carta de objetivo vai avaliar.`],
  ] },
  { t: _T`Mapa`, items: [
    ['svg:pu', _T`Sua unidade`, _T`Peça sua no mapa (no app: escudo verde liso).`],
    ['svg:eu', _T`Unidade inimiga`, _T`Peça do inimigo (no app: escudo vermelho liso). Em alguns cenários é água, peste ou marcador político.`],
    ['svg:sg', _T`Escudo verde com +`, _T`Área onde você pode colocar unidades novas.`],
    ['svg:sr', _T`Escudo vermelho com +`, _T`Área de entrada do inimigo: unidades inimigas novas aparecem aqui primeiro.`],
    ['svg:vil', _T`Vila`, _T`Importante na Peste, na Enchente e no Monstro: perder vilas leva à derrota.`],
    ['svg:castle', _T`Castelo`, _T`O seu (claro) ou do inimigo (escuro). Muitos cenários são decididos aqui.`],
    ['svg:gold', _T`Moeda no mapa`, _T`Ouro impresso numa área: rende ao coletar; nas Eleições, perder moedas leva à derrota.`],
    ['svg:x', _T`Marca ✕`, _T`Risca algo destruído. Num recurso do mapa, o app deixa de contá-lo.`],
  ] },
  { t: _T`Consequências (como o app mostra)`, items: [
    ['txt:+', _T`Adicionar`, _T`Coloque 1 unidade inimiga (++ = 2, +++ = 3) numa área de entrada.`],
    ['txt:→', _T`Mover`, _T`Todas as unidades inimigas andam 1 área (⇉ = 2) rumo ao alvo do cenário.`],
    ['txt:+→', _T`Adicionar e mover`, _T`Primeiro entra 1 unidade, depois todas andam 1 área.`],
    ['txt:⚔', _T`Ataque inimigo`, _T`Em cada área com inimigos, eles destroem suas unidades e depois recursos.`],
    ['txt:︾', _T`+1 Diplomacia inimiga`, _T`A trilha inimiga sobe 1.`],
    ['txt:3$', _T`Custo para evitar`, _T`Consequência com custo é “possível”: pague e ela não acontece.`],
  ] },
];
function glossIcon(spec) {
  const [k, v] = spec.split(':');
  if (k === 'svg') return `<img class="gl-ic" src="${iconUri(v)}" alt="">`;
  if (k === 'img') return `<img class="gl-ic round" src="${ACT_ICON(v)}" alt="">`;
  return `<span class="gl-ic txt">${v === '3$' ? `3${iconImg('gold', 'gl-mini')}` : esc(v)}</span>`;
}
function glossaryHtml() {
  return _T`<div class="panel prose gloss"><h2>Ícones</h2><p class="muted small">O que significa cada símbolo das cartas e do app.</p>
    ${GLOSSARY.map((g) => `<h3>${g.t}</h3><div class="gl-list">${g.items.map(([ic, name, desc]) => `<div class="gl-it">${glossIcon(ic)}<div><b>${name}</b><span>${desc}</span></div></div>`).join('')}</div>`).join('')}</div>`;
}
