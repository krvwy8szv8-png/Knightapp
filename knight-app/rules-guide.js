'use strict';
/* Guia de regras do modo solo, com exemplos. Os exemplos usam cartas reais do jogo (personagens, eventos e a carta Corte). */

const GI = (k) => `<img class="gi" src="${(RES[k] || ACTIONS[k]).icon}" alt="${(RES[k] || ACTIONS[k]).name}">`;
const GA = (k) => `<img class="gi a" src="assets/icons/${k}.webp" alt="${ACTIONS[k] ? ACTIONS[k].name : k}">`;
const EX = (title, body) => _T`<div class="ex"><div class="ex-h">Exemplo · ${title}</div>${body}</div>`;
const TIP = (body) => `<div class="tip">💡 ${body}</div>`;

const GUIDE = [
  {
    id: 'visao', t: _T`1. Visão geral`,
    b: () => _T`
<p>Em KNIGHT você é um cavaleiro tentando resolver um problema particular (o <b>Cenário</b>): uma invasão, uma enchente, uma peste, uma eleição… Sozinho você não consegue. Precisa ganhar influência na corte do rei (<b>Corte</b>) para que o reino intervenha a seu favor.</p>
<p>A partida tem <b>12 turnos</b>, divididos em <b>2 rodadas de 6</b>. Em cada turno você escolhe um lado de uma carta de evento. Essa escolha decide de uma vez três coisas:</p>
<ol>
  <li>que <b>recursos</b> você recebe;</li>
  <li>que <b>ação</b> da Corte é ativada;</li>
  <li>qual <b>trilha de consequência</b> (1, 2 ou 3) o inimigo vai usar contra você no fim do turno.</li>
</ol>
<p>Você vence cumprindo uma condição de vitória do Cenário, com a maior pontuação possível. Também pode perder antes do fim, se uma condição de derrota acontecer.</p>
<p>Tudo se conecta assim: <b>evento → recursos → Corte (influência e ganhos) → Comando → Cenário</b>. A Corte é o motor; o Cenário é onde você vence ou perde.</p>`,
  },
  {
    id: 'comp', t: _T`2. As quatro cartas`,
    b: () => _T`
<ul>
  <li><b>Personagem</b>: seu cavaleiro. Guarda os recursos (${GI('g')} Glória, ${GI('n')} Nobreza, ${GI('v')} Valor, até 6 cada), o ${GI('gold')} Ouro (até 12), a trilha de Influência (até 33), os PV e as habilidades do personagem.</li>
  <li><b>Corte</b>: a corte, sempre a mesma em toda partida. Trilhas de ações que você desbloqueia pagando recursos.</li>
  <li><b>Cenário</b>: o problema da partida. Mapa, consequências, batalhas, ações de comando e condições de vitória e derrota.</li>
  <li><b>Cartas de evento e de objetivo</b>: o evento define o turno; o objetivo dá recompensas e penalidades nos turnos 3, 6 e 9.</li>
</ul>
${TIP(_T`No app, cada uma tem sua aba. A Mesa mostra a carta de evento do turno e guia as fases.`)}`,
  },
  {
    id: 'prep', t: _T`3. Preparação`,
    b: () => _T`
<ol>
  <li>Escolha um Personagem e um Cenário. A dificuldade está indicada em cada um (Fácil, Normal, Difícil).</li>
  <li>Marque os recursos iniciais do personagem.</li>
  <li>Embaralhe as cartas de evento e coloque <b>6 em fila</b>. Só a <b>primeira e a última</b> ficam viradas para cima.</li>
  <li>Sorteie uma carta de objetivo e coloque entre a 3ª e a 4ª carta de evento.</li>
  <li>Coloque um marcador no zero de cada trilha de Diplomacia do Cenário (a sua e a do inimigo).</li>
  <li>Siga a preparação específica do Cenário (unidades inimigas iniciais etc.). No modo avançado há preparação extra.</li>
</ol>
${EX(_T`Sir Dittmann em Defending the Realm`, _T`
<p>Sir Dittmann começa com ${GI('g')}1, ${GI('v')}1 e ${GI('gold')}2. Nobreza zerada. É um personagem Difícil: começa pobre, mas tem bons atalhos.</p>
<p>A fila sorteada mostra a carta 1 e a carta 6. As cartas 2 a 5 estão viradas: você sabe o que vem no começo e no fim da rodada, mas não no meio.</p>`)}
${TIP(_T`Quando o cenário tem preparação (unidades inimigas iniciais, ou o modo avançado), a Mesa mostra uma lista no turno 1 e marca cada item conforme você faz: as unidades são contadas no mapa, as consequências iniciais têm botão por trilha. O app faz toda a preparação das cartas. Com um <b>código de partida</b>, outra pessoa recebe exatamente as mesmas cartas, bom para comparar pontuação.`)}`,
  },
  {
    id: 'turno', t: _T`4. O turno, passo a passo`,
    b: () => _T`
<p>Cada turno tem 5 fases, sempre nesta ordem:</p>
<ol>
  <li value="0"><b>Troca de cartas</b> (opcional). Pague Ouro para mexer na fila: ${GI('gold')}1 revela uma carta virada; ${GI('gold')}2 troca de lugar duas cartas ainda não usadas, ou troca uma delas por uma carta aleatória do baralho; ${GI('gold')}6 usa a <b>ação</b> de uma carta vizinha no lugar da atual (recursos e consequência não mudam).</li>
  <li><b>Recursos</b>. Escolha o lado esquerdo ou direito da carta atual e receba os recursos dele.</li>
  <li><b>Usar recursos</b>. Gaste quanto quiser na Corte, no Personagem e no Cenário.</li>
  <li><b>Ação</b>. A ação do lado escolhido é ativada. O que você recebe aqui só pode ser gasto <b>no próximo turno</b>. A exceção são os pontos de Comando: use na hora ou perca.</li>
  <li><b>Consequências</b>. O inimigo age conforme a trilha (1, 2 ou 3) do lado escolhido.</li>
</ol>
${EX(_T`turno 1 de Sir Dittmann`, _T`
<p>A carta 1 é esta: lado esquerdo dá ${GI('g')}4 ${GI('gold')}1 e ativa ${GA('king')} Rei, trilha 1. Lado direito dá ${GI('g')}1 ${GI('n')}1 ${GI('v')}2 e ativa ${GA('castle')} Castelo + ${GA('nobles')} Nobres, trilha 2.</p>
<p><b>Fase 1.</b> Dittmann escolhe o direito. Fica com ${GI('g')}2 ${GI('n')}1 ${GI('v')}3 ${GI('gold')}2.</p>
<p><b>Fase 2.</b> O primeiro segmento de Nobres custa: 1 qualquer + ${GI('v')} + ${GI('v')}. Ele paga com os 3 Valor e completa o segmento:</p>
<ul><li>recompensa imediata (estrela): ${GI('gold')}1;</li><li>+1 Influência (hexágono);</li><li>a partir de agora, cada ativação de Nobres dá ${GI('v')}1.</li></ul>
<p><b>Fase 3.</b> O lado direito ativa Castelo e Nobres. Castelo ainda não tem nada construído; Nobres dá o ${GI('v')}1 recém-desbloqueado. Ativar Nobres também dá uma ação única de Nobres no Cenário. Esse Valor só pode ser usado no turno 2.</p>
<p><b>Fase 4.</b> Trilha 2, primeira vez: resolve só o primeiro símbolo dela no Cenário.</p>`)}
${TIP(_T`A escolha do lado é a decisão mais importante do turno. Olhe os três itens juntos: recursos, ação e consequência. Às vezes vale pegar menos recursos para evitar uma trilha de consequência perigosa. No app, tocar num lado mostra a <b>prévia</b>: com quanto você fica, quanto cada ação rende hoje e a faixa da trilha de consequência do seu Cenário. Alterne entre os lados à vontade; nada muda até você tocar em <b>Confirmar</b>.`)}`,
  },
  {
    id: 'rec', t: _T`5. Recursos, Ouro e limites`,
    b: () => _T`
<p>${GI('g')} Glória, ${GI('n')} Nobreza e ${GI('v')} Valor vão até <b>6</b>. ${GI('gold')} Ouro vai até <b>12</b>. Nada se perde no excesso:</p>
<ul><li>recurso acima de 6 vira Ouro;</li><li>Ouro acima de 12 vira <b>5 PV</b> cada.</li></ul>
<p>Os ícones nas cartas têm três formas:</p>
<ul>
  <li><b>Círculo = custo</b>, o que você paga. Círculo vazio aceita qualquer recurso (mas não Ouro).</li>
  <li><b>Quadrado = ganho</b>, recebido a cada ativação. Nunca é riscado.</li>
  <li><b>Estrela = recompensa imediata</b>, recebida uma vez quando você completa o pagamento. Depois é riscada.</li>
  <li><b>Quadrado = ganho a cada ativação.</b> Completar o segmento não dá esse recurso na hora; ele vem toda vez que a ação for ativada.</li>
</ul>
${EX(_T`conversão`, _T`<p>Você tem ${GI('g')}5 e ${GI('gold')}11 e recebe ${GI('g')}4. Um vai para a Glória (fica 6). Os outros 3 viram Ouro: um completa os 12, e os 2 restantes viram <b>10 PV</b>.</p>`)}
${TIP(_T`Recurso parado no máximo é desperdício. Antes de escolher um lado que dá muito de algo que você já tem cheio, gaste primeiro. No app, um recurso no máximo fica com a borda dourada.`)}`,
  },
  {
    id: 'court', t: _T`6. A Corte: como desbloquear`,
    b: () => _T`
<p>Cada ação da Corte é uma trilha dividida em <b>segmentos</b>. Cada segmento tem custos (círculos embaixo) e, em cima, o que ele dá: ganhos a cada ativação (quadrados), recompensa imediata (estrela) e às vezes um hexágono de Influência.</p>
<ul>
  <li>Dentro de um segmento, pague os custos <b>em qualquer ordem e em quantos turnos quiser</b>. Pagamento parcial fica guardado.</li>
  <li>Quando todos os custos estão pagos, o segmento é <b>desbloqueado</b>: você recebe a estrela na hora; o quadrado não vem agora, só nas ativações seguintes da ação.</li>
  <li>Segmento com <b>hexágono</b> dá +1 de Influência para aquela ação e +1 na trilha de Influência do Personagem.</li>
  <li>Entre segmentos há <b>requisitos</b> (bandeira vermelha com número e ícone). Para avançar, você precisa ter aquele nível na ação indicada, ou a Influência total indicada (número no hexágono).</li>
  <li>Completar uma trilha inteira dá os PV da bandeira verde no canto (50, 35, 25…).</li>
</ul>
${EX(_T`o requisito do Rei`, _T`
<p>O primeiro segmento do Rei custa ${GI('v')} ${GI('g')} ${GI('g')} ${GI('n')} ${GI('n')} e dá, a cada ativação, ${GI('n')}1 ${GI('g')}1 ${GI('v')}1, mais uma estrela de ${GI('v')}1 e +1 Influência.</p>
<p>O segundo segmento tem a bandeira <b>2 + trompete</b>: só pode ser pago com <b>Fama nível 2</b>. Fama não é ativada por eventos; ela existe para liberar outras trilhas. Para avançar no Rei, primeiro desenvolva Fama.</p>`)}
<h4>Níveis</h4>
<p>O nível de uma ação é quantos hexágonos dela você já desbloqueou. Há três exceções, que contam diferente e não aumentam a Influência total:</p>
<ul>
  <li><b>Vila</b>: cada casa paga é um nível, em qualquer ordem.</li>
  <li><b>Castelo</b>: cada sala custa ${GI('gold')}1 + 1 recurso qualquer, em qualquer ordem. Cada <b>andar completo</b> é um nível.</li>
  <li><b>Arsenal</b>: cada par de custos pago é um nível, em qualquer ordem.</li>
</ul>
<p><b>Senhores</b>: são 6 senhores, cada um com 2 segmentos. O nível de Senhores é a soma dos hexágonos de todos eles.</p>
${TIP(_T`No app, a aba Corte destaca em <b>verde</b> o que dá para pagar agora e em <b>dourado pulsando</b> o segmento que você consegue completar inteiro. Cada segmento liberado mostra quantos custos <b>faltam</b> (laranja quando já começou a pagar) e um <b>✓</b> quando está desbloqueado. No topo, a linha “Cada ativação rende hoje” resume os ganhos de cada ação.`)}`,
  },
  {
    id: 'ativ', t: _T`7. O que cada ação faz quando é ativada`,
    b: () => _T`
<ul>
  <li>${GA('king')} <b>Rei</b>: recebe todos os ganhos desbloqueados da trilha do Rei. Depois recebe as recompensas imediatas da <b>próxima ação do Rei</b> no Cenário (a coluna seguinte, se você tiver o nível exigido) e a risca.</li>
  <li>${GA('church')} <b>Igreja</b>, ${GA('nobles')} <b>Nobres</b>, ${GA('merchants')} <b>Mercadores</b>: recebe os ganhos desbloqueados e mais <b>uma ação daquele tipo no Cenário</b>, escolhendo o lado, se tiver o nível.</li>
  <li>${GA('lords')} <b>Senhores</b>: recebe os ganhos desbloqueados de <b>todos</b> os senhores.</li>
  <li>${GA('castle')} <b>Castelo</b>: recebe os ganhos das salas construídas. Ao completar um andar, você pode ligar o Castelo à <b>Vila</b> ou ao <b>Estábulo</b> (riscando a corrente). A partir daí, ativar o Castelo também dá os ganhos da ação ligada. É o <b>único jeito</b> de receber os ganhos da Vila e do Estábulo.</li>
  <li><b>Combate, Conhecimento, Fama, Torneios, Arsenal</b>: nunca são ativadas. Dão estrelas e servem de requisito para outras trilhas e para batalhas.</li>
</ul>
<h4>Correntes entre Igreja, Nobres e Mercadores</h4>
<p>Quando você completa uma dessas trilhas inteira, pode riscar a corrente com a vizinha. Daí em diante, ativar a trilha completa ativa também a vizinha.</p>
${EX(_T`Castelo ligado`, _T`
<p>Você completou o andar de baixo do Castelo (as 5 salas) e ligou à Vila, onde já pagou a primeira casa. O andar de baixo dá ${GI('v')}1 em duas salas e a casa da Vila dá ${GI('gold')}1.</p>
<p>Um evento que ativa Castelo agora rende ${GI('v')}2 ${GI('gold')}1.</p>`)}
${TIP(_T`No app, a fase de Ação lista o que cada ação rende com o que você já desbloqueou. O botão <b>Receber ganhos</b> soma tudo, inclusive correntes e privilégio. As ações únicas do Cenário você marca na aba Cenário.`)}`,
  },
  {
    id: 'char', t: _T`8. A carta Personagem`,
    b: () => _T`
<ul>
  <li><b>Privilégio</b> (topo, sob a cortina): bônus permanente sempre que certa ação é ativada no turno. Pode ser recurso extra (+${GI('v')}1 quando Igreja é ativada) ou uma troca (no turno de Igreja, custos de ${GI('v')} podem ser pagos com ${GI('n')} ou ${GI('g')}).</li>
  <li><b>Recompensas</b> (2 quadros abaixo): únicas, ao atingir um nível de ação ou uma quantidade de PV. Você coleta quando quiser.</li>
  <li><b>Ação especial 1</b>: 6 de um recurso → 1 Comando, quantas vezes quiser no turno.</li>
  <li><b>Ação especial 2</b> (com Influência 20): 6 ${GI('g')} + 6 ${GI('n')} + 6 ${GI('v')} → 1 Diplomacia.</li>
  <li><b>Limiares de Influência</b> (à direita da trilha): recompensas únicas ao atingir 5, 15, 23… de Influência. Também coletadas quando você quiser.</li>
  <li><b>Trilha de Influência</b>: cada hexágono desbloqueado na Corte marca 1 aqui.</li>
</ul>
${EX(_T`privilégio de troca de Sir Cortez`, _T`
<p>O privilégio de Sir Cortez diz: quando Igreja for ativada, ${GI('v')} vale como ${GI('v')}, ${GI('n')} ou ${GI('g')}.</p>
<p>No turno 4 ele escolhe um lado que ativa Igreja, mas está sem Valor. O Rei pede ${GI('v')} no primeiro custo. Neste turno ele paga com ${GI('g')} no lugar.</p>`)}
${TIP(_T`No app, sempre que você tiver Comando, a Mesa mostra a barra de Comando com os botões das ações do cenário (também dá para tocar no ⚑ do painel). Colocar, atacar e mover abrem o mapa; −1 Diplomacia inimiga e coletar são aplicados na hora. Se tentar encerrar o turno com Comando sobrando, o app avisa.`)}
${EX(_T`Comando na hora certa`, _T`
<p>Sir Dittmann tem ${GI('g')}6 e um inimigo na área do castelo. Ele usa a ação especial (6 Glória → 1 Comando) e, no mesmo turno, usa o Comando para atacar no Cenário. Se não usasse, o ponto se perderia no fim do turno.</p>`)}
${TIP(_T`No app, a aba Personagem mostra tudo isso com botões. O que está disponível fica em verde, e a aba mostra quantos itens você pode usar.`)}`,
  },
  {
    id: 'scen', t: _T`9. O Cenário`,
    b: () => _T`
<p>Os nomes abaixo seguem o cenário básico, <b>Defending the Realm</b>. Os outros funcionam de forma parecida; as diferenças estão nas regras de cada um (aba Regras → Cenário).</p>
<h4>Comando</h4>
<p>Pontos de Comando são a principal moeda do Cenário. Você ganha pela ação do Rei, pelas ações especiais do Personagem, pelos limiares de Influência e pelas ações de Influência do Cenário. <b>Não acumulam</b>: use no turno em que ganhar. Com 1 Comando você faz uma ação:</p>
<ul>
  <li>colocar 1 unidade sua numa área marcada com +;</li>
  <li>atacar: cada unidade sua destrói 1 inimiga na mesma área;</li>
  <li>mover quantas unidades quiser 1 área;</li>
  <li>coletar os recursos das áreas onde você tem unidades (mesmo com inimigos);</li>
  <li>baixar 1 da Diplomacia inimiga.</li>
</ul>
<h4>Ações por Ouro</h4>
<p>Reutilizáveis, quantas vezes quiser no seu turno. Algumas têm requisito (bandeira vermelha):</p>
<ul>
  <li>${GI('gold')}12 → 1 Comando;</li>
  <li>${GI('gold')}3 → 1 recurso à escolha (requer Influência 6);</li>
  <li>${GI('gold')}10 → 1 Influência (requer Fama 3);</li>
  <li>${GI('gold')}2 → troca 1 recurso por outro; com Conhecimento 2, a troca custa só ${GI('gold')}1;</li>
  <li>mais uma ação própria do cenário. No Defending the Realm: com Nobres 2, ${GI('gold')}7 move todas as unidades inimigas 1 área.</li>
</ul>
${EX(_T`Ouro parado vira Comando`, _T`<p>No turno 8 você tem ${GI('gold')}12 e um inimigo a uma área do castelo. Gasta os 12 em 1 Comando e ataca no mesmo turno.</p>`)}
${TIP(_T`No app, a aba Cenário tem os botões dessas ações. Os disponíveis ficam em verde, e o app confere o requisito e cobra o custo. Nos efeitos de mapa, você só move as peças.`)}
<h4>Batalhas</h4>
<p>Cada batalha tem uma condição (por exemplo, Combate nível 3) e um custo em recursos. Vencer dá a recompensa indicada; no básico, <b>20 PV</b> e remover 1 unidade inimiga à escolha. Você pode lutar quantas batalhas puder pagar no seu turno.</p>
${EX(_T`batalha`, _T`<p>A batalha pede Combate nível 3 e 3 recursos. Você tem Combate 3: paga, risca a batalha, ganha 20 PV e tira do mapa a unidade inimiga mais perto do castelo.</p>`)}
${TIP(_T`No app, a aba Cenário tem três vistas. <b>Mapa</b>: o mapa ampliado, onde você toca para colocar unidades e <b>arrasta</b> para mover; em cima ficam os botões de Comando (cada um gasta 1 ponto: colocar, atacar, mover, coletar, −1 Diplomacia inimiga). <b>Ações</b>: batalhas (toque nos custos para pagar; a vencida dá 20 PV), o Rei's action do Cenário e as ações por Ouro. <b>Cartão</b>: o cartão inteiro, com as mesmas marcas.`)}
<h4>Ações de Influência no Cenário</h4>
<p>No canto inferior direito do Cenário há três linhas, uma para cada ação (normalmente Igreja, Nobres e Mercadores; alguns cenários usam Castelo ou Senhores). Sempre que um evento ativa uma dessas ações, você também <b>risca a próxima casa de um dos lados</b> e recebe o que está nela:</p>
<ul><li><b>Esquerda</b>: cada casa depois da primeira exige um <b>nível</b> da ação (os números vermelhos 1, 2, 3).</li>
<li><b>Direita</b>: cada casa depois da primeira exige <b>Influência</b> (os hexágonos, por exemplo 6 e 12).</li></ul>
<p>As recompensas são Comando (bandeiras), Diplomacia (setas verdes), recursos, Ouro e PV.</p>
${EX(_T`Nobres no Defending the Realm`, _T`<p>Primeira ativação de Nobres: você escolhe entre a esquerda (5 Valor, livre) e a direita (+1 Diplomacia, livre). Pegou Valor? Na próxima, a esquerda pede Nobres nível 1 para dar 1 Comando; a direita continua oferecendo +1 Diplomacia.</p>`)}
${TIP(_T`No app, a fase de Ação mostra os dois botões (← esquerda, → direita) com o que cada um dá e o requisito. A prévia do lado da carta já avisa o que estará disponível. Se você tentar avançar sem escolher, o app lembra.`)}
<h4>Ação do Rei no Cenário</h4>
<p>O quadro do Rei no Cenário tem 5 colunas. Cada vez que um evento ativa o Rei, você recebe a <b>próxima</b> coluna, se tiver o nível exigido (a 1ª é livre, a 2ª pede Rei 1, a 3ª Rei 2…). Sem o nível, a ativação não dá nada ali.</p>
${EX(_T`Rei no Defending the Realm`, _T`<p>Primeira ativação do Rei: 1 Comando, 20 PV e ${GI('gold')}3. Para a segunda (1 Comando, 30 PV, ${GI('gold')}6) você precisa do Rei nível 1, ou seja, o primeiro segmento do Rei pago na Corte.</p>`)}
<h4>Vitória e derrota</h4>
<p>Cada cenário lista condições de vitória e de derrota imediatas. Em todos: sua Diplomacia completa é vitória e a Diplomacia inimiga completa é derrota. Se nenhuma condição for cumprida até o fim do turno 12, você perde 100 PV; se ainda sobrar pontuação positiva, conta como vitória.</p>
${TIP(_T`No app, a vista Ações do Cenário mostra o painel “Vitória e derrota”. Batalhas vencidas, PV + Influência, Diplomacia e número de inimigos no mapa são conferidos sozinhos: quando uma condição acontece, o app avisa e oferece encerrar a partida. Condições contáveis (áreas controladas, vilas queimadas, vilas inundadas, moedas etc.) têm um contador − / +, que também aparece no Mapa: ao chegar ao número pedido, o app avisa. As demais condições de mapa (castelo tomado, por exemplo) têm o botão “Aconteceu”.`)}
${TIP(_T`⚙ Menu → Configurações: tamanho do texto, ícones nítidos, animações, avisos ao encerrar o turno, detecção automática de vitória/derrota e, no computador, o mapa ao lado da Mesa. Atalhos no computador: ← → escolhem o lado da carta, Enter confirma ou avança a fase, 1–5 trocam de aba, M abre o mapa e Ctrl+Z desfaz.`)}
${TIP(_T`Você começa sem unidades no mapa. Cada unidade sua entra por uma colocação: o Comando “Colocar unidade” (1 Comando) ou uma ação do cartão que coloca unidade. O app mostra 📍 quantas você tem para colocar, aceita só áreas com + verde (na Enchente, nas Eleições e no Último Duelo, qualquer área permitida) e respeita os limites do cartão. Colocações não usadas se perdem no fim do turno. Para corrigir algo, há a opção “Colocar mesmo assim”.`)}
${TIP(_T`🧭 Assistente do mapa: o app conhece as áreas e quem é vizinho de quem. “Mover inimigos” mostra para onde cada unidade inimiga anda pelo caminho mais curto (rumo ao seu castelo ou, no Monstro, à vila mais próxima). “Ataque inimigo” calcula o que cada área destrói, e “Seu ataque” elimina 1 inimiga por unidade sua na mesma área. Tudo aparece primeiro como prévia, com setas e áreas destacadas; só muda o mapa ao tocar em Aplicar. Ao arrastar uma unidade sua, as áreas vizinhas ficam verdes.`)}
${TIP(_T`Na Peste, o botão “🔥 Queimar vila” registra a queima: pode gastar 1 Comando para o ataque ou só registrar um ataque já feito. O contador de vilas queimadas sobe e a ferramenta de marcação do mapa fica pronta para riscar a vila.`)}
<h4>Limites</h4>
<p>No básico: até 8 unidades de cada lado no mapa e até 4 da mesma facção numa área.</p>`,
  },
  {
    id: 'cons', t: _T`10. Consequências: como o inimigo age`,
    b: () => _T`
<p>No solo, o inimigo é automático: o lado que você escolhe no evento indica a trilha (1, 2 ou 3), e no fim do turno você resolve a próxima casa dessa trilha no Cenário.</p>
<ul>
  <li><b>Primeira vez numa trilha</b>: só o primeiro símbolo.</li>
  <li><b>Daí em diante</b>, sempre duas consequências, nesta ordem:
    <ol>
      <li>a <b>possível</b> (tem um custo em cima): pague o custo para evitá-la, ou ela acontece;</li>
      <li>a <b>inevitável</b>: sempre acontece.</li>
    </ol>
  </li>
  <li>Risque o que resolveu.</li>
</ul>
<h4>Símbolos mais comuns</h4>
<ul>
  <li><b>+ no escudo</b>: adiciona 1 ou 2 unidades inimigas nas áreas marcadas com +.</li>
  <li><b>Seta no escudo</b>: move todas as unidades inimigas 1 ou 2 áreas em direção ao seu castelo.</li>
  <li><b>X no escudo</b>: ataque inimigo.</li>
</ul>
<p>Se há inimigos no mapa e nenhum consegue cumprir a ordem (por exemplo, já estão no fim do caminho), a <b>Diplomacia inimiga sobe 1</b>.</p>
<h4>Ataque inimigo</h4>
<p>Cada área com inimigos ataca com força igual ao número de inimigos nela. Primeiro destroem suas unidades na área, depois destroem recursos da área. Todas as áreas atacam ao mesmo tempo. Se o <b>castelo</b> for atacado e você não tiver unidades suficientes, ele cai: <b>derrota imediata</b>.</p>
${EX(_T`trilha 1 pela segunda vez`, _T`
<p>Você escolheu um lado da trilha 1, que já foi usada uma vez. Agora ela mostra: custo ${GI('g')}3 sobre "+1 inimigo" e, ao lado, "mover 2".</p>
<p>Você paga ${GI('g')}3 e evita o novo inimigo. Mesmo assim, todos os inimigos andam 2 áreas em direção ao castelo.</p>`)}
${EX(_T`ataque`, _T`
<p>Há 2 inimigos numa área onde você tem 3 unidades. No ataque, 2 das suas unidades são destruídas e sobra 1.</p>
<p>Em outra área há 2 inimigos e nenhuma unidade sua: eles destroem 2 recursos dessa área.</p>`)}
${TIP(_T`O app conhece as 3 trilhas de todos os cenários. Na prévia do lado da carta ele já diz o que vai acontecer e quanto custa evitar. Na fase de Consequências, mostra cada símbolo com botões: <b>Pagar e evitar</b> (desconta o recurso) ou <b>Não pagar</b>. A Diplomacia inimiga é aplicada sozinha; adicionar, mover e atacar você faz no mapa (o botão abre o mapa). A faixa risca sozinha os símbolos usados.`)}`,
  },
  {
    id: 'obj', t: _T`11. A carta de objetivo`,
    b: () => _T`
<p>A carta de objetivo tem 3 colunas, avaliadas no fim dos turnos <b>3, 6 e 9</b>. Cada coluna tem duas partes:</p>
<ul>
  <li><b>em cima</b>, uma condição e a recompensa por cumpri-la;</li>
  <li><b>embaixo</b>, uma condição e a penalidade se ela acontecer.</li>
</ul>
<p>Condições comuns: ter um nível numa ação, ter certa soma de PV ou de Influência, ter mais ou menos "atividades" que o inimigo. Penalidades comuns: zerar um recurso, uma ativação extra do inimigo, Diplomacia inimiga +1.</p>
${EX(_T`fim do turno 3`, _T`
<p>A coluna 1 pede Castelo nível 1 para dar ${GI('g')}3 ${GI('n')}3 ${GI('v')}3 ${GI('gold')}6. Você completou o andar de baixo no turno 2: recebe tudo.</p>
<p>A penalidade de baixo é "nenhuma atividade no Cenário → ativação extra do inimigo". Você já tinha unidades no mapa, então escapa.</p>`)}
${TIP(_T`O objetivo fica visível desde o turno 1. No app, a Mesa mostra a faixa “Objetivo · fim do turno X” com a condição da recompensa e a da penalidade, e se cada uma está cumprida agora. No fim dos turnos 3, 6 e 9 o app avalia sozinho: aplica a recompensa, zera recursos ou sobe a Diplomacia inimiga. Unidades inimigas extras você coloca no mapa (o app abre o mapa para isso). Se as contagens do mapa estiverem desatualizadas, desmarque ou marque as caixas antes de aplicar.`)}
${TIP(_T`Metas marcadas com 🎯: o que a próxima avaliação vai julgar aparece destacado. No painel de recursos, um selo mostra o valor a alcançar (azul = recompensa, vermelho = evitar a penalidade, verde ✓ = já cumprido). Na Corte, a ação-alvo ganha um contorno e os custos que levam ao nível pedido ficam com anel azul tracejado. No Cenário, a faixa do topo mostra quantas unidades faltam.`)}`,
  },
  {
    id: 'fim', t: _T`12. Fim de jogo e pontuação`,
    b: () => _T`
<p>Anote seus PV nos turnos 3, 6, 9 e 12 (o app faz isso sozinho). Alguns objetivos olham esses valores.</p>
<p>A partida termina:</p>
<ul>
  <li>imediatamente, quando uma condição de <b>vitória</b> ou de <b>derrota</b> do Cenário acontece; ou</li>
  <li>depois do turno 12.</li>
</ul>
<p>No fim, cada recurso e cada Ouro que sobraram valem <b>5 PV</b>. No Defending the Realm, terminar sem cumprir nenhuma condição custa <b>−100 PV</b>. Se ainda sobrar pontuação positiva, conta como vitória; abaixo de zero, derrota.</p>
${EX(_T`pontuação`, _T`<p>Sir Dittmann termina com 180 PV e sobram ${GI('g')}2 ${GI('n')}1 ${GI('gold')}5: são 8 × 5 = 40 PV, total 220. Ele venceu 5 batalhas: vitória com 220.</p>`)}`,
  },
  {
    id: 'dicas', t: _T`13. Dicas de estratégia`,
    b: () => _T`
<ul>
  <li><b>Comece por segmentos baratos com hexágono.</b> Influência cedo libera requisitos e limiares do Personagem.</li>
  <li><b>Construa o motor antes de gastar no mapa.</b> Um segmento do Rei ou dos Nobres rende toda vez que o evento o ativa.</li>
  <li><b>Fama, Combate e Conhecimento são chaves.</b> Não dão ganhos, mas destravam o Rei, as batalhas e várias trilhas.</li>
  <li><b>Lembre do Comando.</b> Ele não acumula. Se o turno vai gerar Comando, tenha um plano no mapa.</li>
  <li><b>Vigie a Diplomacia inimiga.</b> Trilha cheia é derrota. Comando e algumas ações baixam a Diplomacia.</li>
  <li><b>Revelar uma carta por 1 Ouro costuma valer a pena</b> no começo da rodada: planejar 6 turnos é muito melhor do que 2.</li>
  <li><b>Conversão não é perda.</b> Recurso sobrando vira Ouro e Ouro sobrando vira PV. Encher tudo no fim é pontuação.</li>
</ul>`,
  },
];

function guideHtml(open) {
  const toc = GUIDE.map((s) => `<a href="#g-${s.id}" data-gsec="${s.id}">${s.t}</a>`).join('');
  return `<div class="guide">
    <nav class="g-toc">${toc}</nav>
    ${GUIDE.map((s) => `<details class="g-sec panel" id="g-${s.id}" ${open === s.id || (!open && s.id === 'visao') ? 'open' : ''}><summary><h3>${s.t}</h3></summary><div class="prose">${s.b()}</div></details>`).join('')}
  </div>`;
}
function bindGuide(el) {
  $$('[data-gsec]', el).forEach((a) => (a.onclick = (e) => {
    e.preventDefault();
    const d = $('#g-' + a.dataset.gsec, el); d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}
