// Dados do jogo KNIGHT (Radosław Ignatów / Hammerdice) — transcritos dos arquivos print & play.
// g = Glória, n = Nobreza, v = valor, gold = Ouro

const RES = {
  g:    { name: _T`Glória`,  icon: 'assets/icons/glory.png' },
  n:    { name: _T`Nobreza`, icon: 'assets/icons/nobility.png' },
  v:    { name: _T`Valor`,   icon: 'assets/icons/valor.png' },
  gold: { name: _T`Ouro`,    icon: 'assets/icons/gold.png' },
};

const ACTIONS = {
  king:      { name: _T`Rei`,        icon: 'assets/icons/king.png',
               hint: _T`Receba todos os recursos desbloqueados na trilha do Rei. Depois, receba as recompensas únicas da próxima ação do Rei no cartão de cenário (se tiver o nível exigido) e risque-a.` },
  castle:    { name: _T`Castelo`,    icon: 'assets/icons/castle.png',
               hint: _T`Receba os recursos desbloqueados do Castelo. Se tiver completado um andar e ligado a Vila e/ou o Estábulo, receba também os recursos desbloqueados deles.` },
  church:    { name: _T`Igreja`,     icon: 'assets/icons/church.png',
               hint: _T`Receba os recursos desbloqueados da Igreja e uma ação única desse tipo no cartão de cenário (escolha o lado, se tiver o nível). Se a trilha estiver completa e a corrente riscada, ativa também a ação vizinha.` },
  nobles:    { name: _T`Nobres`,     icon: 'assets/icons/nobles.png',
               hint: _T`Receba os recursos desbloqueados dos Nobres e uma ação única desse tipo no cartão de cenário (escolha o lado, se tiver o nível). Correntes completas ativam as ações vizinhas.` },
  merchants: { name: _T`Mercadores`, icon: 'assets/icons/merchants.png',
               hint: _T`Receba os recursos desbloqueados dos Mercadores e uma ação única desse tipo no cartão de cenário (escolha o lado, se tiver o nível). Correntes completas ativam as ações vizinhas.` },
  lords:     { name: _T`Senhores`,   icon: 'assets/icons/lords.png',
               hint: _T`Considere cada senhor separadamente e receba todos os recursos desbloqueados de todos eles. Na maioria dos cenários, não ativa nada no cartão de cenário.` },
};

// 12 cartas de evento. Cada lado: recursos, ações ativadas e trilha de consequência (1–3).
const EVENTS = [
  { id: 'e01', L: { r: { g: 4, gold: 1 },             a: ['king'],              t: 1 }, R: { r: { g: 1, n: 1, v: 2 },          a: ['castle', 'nobles'],    t: 2 } },
  { id: 'e02', L: { r: { v: 3, gold: 3 },             a: ['merchants'],         t: 1 }, R: { r: { n: 4 },                      a: ['king'],                t: 3 } },
  { id: 'e03', L: { r: { g: 4, gold: 1 },             a: ['king'],              t: 2 }, R: { r: { v: 2, n: 2 },                a: ['nobles', 'church'],    t: 3 } },
  { id: 'e04', L: { r: { g: 2, n: 2, gold: 1 },       a: ['church'],            t: 1 }, R: { r: { v: 3, n: 1, gold: 3 },       a: ['lords'],               t: 2 } },
  { id: 'e05', L: { r: { n: 2, v: 2 },                a: ['king'],              t: 2 }, R: { r: { g: 3, gold: 3 },             a: ['lords', 'merchants'],  t: 1 } },
  { id: 'e06', L: { r: { n: 3, g: 1 },                a: ['king'],              t: 3 }, R: { r: { v: 4, gold: 2 },             a: ['lords'],               t: 1 } },
  { id: 'e07', L: { r: { g: 3, gold: 2 },             a: ['nobles'],            t: 3 }, R: { r: { v: 3, n: 1 },                a: ['castle', 'church'],    t: 2 } },
  { id: 'e08', L: { r: { g: 2, v: 2 },                a: ['church', 'lords'],   t: 3 }, R: { r: { n: 3, gold: 3 },             a: ['castle', 'nobles'],    t: 2 } },
  { id: 'e09', L: { r: { g: 4 },                      a: ['castle'],            t: 1 }, R: { r: { v: 3, n: 2 },                a: ['merchants'],           t: 2 } },
  { id: 'e10', L: { r: { n: 3, g: 2 },                a: ['nobles'],            t: 3 }, R: { r: { v: 4, gold: 1 },             a: ['lords'],               t: 1 } },
  { id: 'e11', L: { r: { g: 3, n: 1, gold: 1 },       a: ['church'],            t: 3 }, R: { r: { v: 1, g: 1, n: 1, gold: 3 }, a: ['merchants', 'castle'], t: 2 } },
  { id: 'e12', L: { r: { n: 3, gold: 2 },             a: ['merchants'],         t: 1 }, R: { r: { v: 3, g: 2, gold: 1 },       a: ['church'],              t: 3 } },
];

const GOALS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];

const DIFF = { easy: _T`Fácil`, normal: 'Normal', hard: _T`Difícil`, extra: 'Extra' };

const CHARACTERS = [
  { id: 'barristan',  name: 'Sir Barristan',    diff: 'easy',   start: { g: 0, n: 1, v: 1, gold: 2 } },
  { id: 'cortez',     name: 'Sir Cortez',       diff: 'easy',   start: { g: 0, n: 0, v: 3, gold: 1 } },
  { id: 'jaques',     name: 'Sir Jacques',      diff: 'easy',   start: { g: 0, n: 2, v: 0, gold: 2 } },
  { id: 'vea',        name: 'Lady Vea',         diff: 'easy',   start: { g: 1, n: 0, v: 0, gold: 3 } },
  { id: 'philippe',   name: 'Philippe',         diff: 'normal', start: { g: 0, n: 0, v: 3, gold: 1 } },
  { id: 'revees',     name: 'Sir Revees',       diff: 'normal', start: { g: 1, n: 1, v: 1, gold: 1 } },
  { id: 'terrax',     name: 'Sir Terrax',       diff: 'normal', start: { g: 0, n: 3, v: 1, gold: 0 } },
  { id: 'ginny',      name: 'Lady Ginny',       diff: 'normal', start: { g: 1, n: 2, v: 1, gold: 0 } },
  { id: 'dana',       name: 'Lady Dana',        diff: 'normal', start: { g: 1, n: 0, v: 0, gold: 3 } },
  { id: 'gwendoline', name: 'Lady Gwendoline',  diff: 'normal', start: { g: 2, n: 0, v: 0, gold: 2 } },
  { id: 'bane',       name: 'Sir Bane',         diff: 'hard',   start: { g: 1, n: 0, v: 1, gold: 2 } },
  { id: 'morgan',     name: 'Sir Morgan',       diff: 'hard',   start: { g: 2, n: 1, v: 0, gold: 1 } },
  { id: 'dittmann',   name: 'Sir Dittmann',     diff: 'hard',   start: { g: 1, n: 0, v: 1, gold: 2 } },
  { id: 'macleod',    name: 'Sir MacLeod',      diff: 'hard',   start: { g: 1, n: 0, v: 2, gold: 1 } },
  { id: 'gardner',    name: 'Sir Gardner',      diff: 'extra',  start: { g: 0, n: 4, v: 0, gold: 0 } },
];

// lim: [suas no mapa, inimigas no mapa, suas por área, inimigas por área]
const SCENARIOS = [
  {
    id: 'defending', name: _T`Defendendo o Reino`, en: 'Defending the Realm', diff: 'easy', lim: [8, 8, 4, 4], page: 13,
    story: _T`Cenário básico: uma guerra defensiva contra um reino vizinho que tenta tomar as terras particulares do seu cavaleiro. Só com Influência na corte você consegue forçar alguma ação do reino.`,
    rules: [
      _T`No máximo 8 unidades no mapa de cada lado e no máximo 4 unidades da mesma facção numa área.`,
      _T`Batalhas: para entrar numa batalha, cumpra a condição (nível da ação indicada) e pague os recursos. Pode ser feito quantas vezes quiser no seu turno. Cada vitória dá 20 PV e remove 1 unidade inimiga à sua escolha.`,
      _T`Se houver unidades inimigas no mapa e nenhuma puder cumprir a ordem, a Diplomacia inimiga sobe 1.`,
      _T`Se a área do Castelo for atacada sem unidades suas suficientes para resistir, o Castelo é destruído: fim de jogo e derrota.`,
    ],
    win: [_T`6 unidades suas em 6 áreas sem inimigos`, _T`vencer as 5 batalhas`, _T`alcançar 300 PV e 25 de Influência`, _T`completar a sua trilha de Diplomacia`],
    lose: [_T`8 unidades inimigas no mapa`, _T`4 unidades inimigas na área do seu castelo sem defensores`, _T`ataque inimigo bem-sucedido ao castelo desprotegido`, _T`trilha de Diplomacia inimiga completa`],
    none: _T`Se nenhuma condição for cumprida: −100 PV. Pontuação final positiva é vitória; abaixo de 0 é derrota.`,
    advanced: [_T`Em cada área do mapa sobra só 1 recurso (risque os demais).`, _T`4 unidades inimigas, 2 em cada um dos dois quadrados marcados (+).`, _T`Diplomacia inimiga começa em 2.`],
  },
  {
    id: 'templars', name: _T`Guerra com os Templários`, en: 'War With The Templars', diff: 'easy', lim: [8, 10, 4, 4], page: 21,
    story: _T`Os Templários estão num momento de fraqueza. Os tesouros que você pode saquear melhorariam muito a sua posição, mas eles continuam sendo um adversário temível.`,
    rules: [_T`O inimigo começa o jogo com 1 unidade na área do Castelo dele.`],
    win: [_T`capturar o Castelo inimigo: entrar nele com pelo menos 2 unidades e atacar quando não houver defensores`, _T`vencer 4 batalhas decisivas`],
    lose: [_T`veja as condições de derrota no cartão de cenário`],
    advanced: [_T`Risque todos os recursos do mapa.`, _T`Diplomacia inimiga começa em 2.`, _T`Considere e risque a primeira consequência de cada uma das 3 trilhas.`],
  },
  {
    id: 'barbarian', name: _T`Invasão Bárbara`, en: _T`Barbarian Invasion`, diff: 'easy', lim: [8, 8, 4, 4], page: 18,
    story: _T`As terras distantes sob seu domínio foram invadidas por bárbaros vindos de todos os lados. O rei ainda subestima o problema; conquiste o apoio dele rápido e envie reforços.`,
    rules: [_T`Unidades inimigas são colocadas inicialmente só nas áreas marcadas (+) que não tenham outros inimigos. Só quando as seis áreas iniciais estiverem ocupadas você pode colocar vários inimigos na mesma área.`],
    win: [_T`veja as condições de vitória no cartão de cenário`],
    lose: [_T`veja as condições de derrota no cartão de cenário`],
    advanced: [_T`3 unidades inimigas em áreas (+) escolhidas.`, _T`Diplomacia inimiga começa em 3.`, _T`Considere e risque a primeira consequência que escolher.`],
  },
  {
    id: 'flood', name: _T`Enchente`, en: 'Flood', diff: 'easy', lim: [6, 9, 1, 1], page: 18,
    story: _T`Chuvas torrenciais fizeram o rio transbordar e inundar as terras da família. O rei não quer salvar sua propriedade; lute diplomaticamente por ajuda. Dá para construir diques e conter a água, mas não será fácil.`,
    rules: [
      _T`Em cada área pode haver só 1 unidade inimiga (a água acumulada) e 1 unidade sua.`,
      _T`Novas unidades inimigas vão primeiro para as áreas indicadas (+); depois para qualquer área adjacente a elas ou a áreas inundadas.`,
      _T`Suas unidades (trabalhadores) podem ser colocadas em qualquer área, exceto as inundadas.`,
      _T`Ataque inimigo: as áreas com inimigos ficam inundadas (ou os trabalhadores nelas morrem, evitando a inundação). Risque a área inundada e mova as unidades inimigas para áreas adjacentes ainda não inundadas.`,
      _T`O seu ataque destrói as unidades inimigas nas mesmas áreas. Áreas inundadas não podem ser recuperadas.`,
    ],
    win: [_T`veja as condições de vitória no cartão de cenário`],
    lose: [_T`10 áreas destruídas`, _T`o Castelo destruído`, _T`6 áreas com vilas destruídas`],
    advanced: [_T`4 áreas (+) escolhidas começam ocupadas pela água (unidades inimigas).`, _T`3 vilas escolhidas começam inundadas.`, _T`Diplomacia inimiga começa em 2.`],
  },
  {
    id: 'elections', name: _T`Eleições`, en: 'Elections', diff: 'normal', lim: [8, 10, 2, 2], page: 21,
    story: _T`Chegou a hora de elevar sua posição social: as eleições para o conselho dos senhores se aproximam e você tem um único adversário. Garanta o maior apoio possível.`,
    rules: [
      _T`Colocar unidades representa conquistar Influência política em áreas.`,
      _T`Você pode colocar as suas fichas e as inimigas em qualquer área.`,
      _T`Coloque marcadores inimigos primeiro em áreas sem marcadores; só depois nas outras.`,
      _T`Limite por área: 2 do mesmo tipo (4 no total). Marcadores inimigos não mudam de posição.`,
      _T`Não há castelo neste cenário.`,
    ],
    win: [_T`ter vantagem em 6 áreas`, _T`vencer 5 debates políticos`],
    lose: [_T`o inimigo ter vantagem em 6 áreas`, _T`o inimigo destruir todos os recursos em 4 áreas`, _T`o inimigo destruir 6 moedas no total (bloqueio dos fundos de campanha)`],
    advanced: [_T`4 unidades inimigas, uma em cada área (+).`, _T`Diplomacia inimiga começa em 3.`],
  },
  {
    id: 'rebely', name: _T`Rebelião`, en: _T`Rebely`, diff: 'normal', lim: [8, 9, 4, 1], page: 22,
    story: _T`Uma revolta foi instigada nas suas terras, provavelmente por inimigos políticos que agora impedem o rei de ajudar. Há muitos mercenários envolvidos; a situação é grave.`,
    rules: [
      _T`Sempre coloque a unidade inimiga numa área onde eles ainda não tenham forças.`,
      _T`Em cada área pode haver só 1 inimigo e no máximo 4 unidades suas.`,
      _T`O oponente nunca se move.`,
      _T`Não há castelo neste cenário.`,
    ],
    win: [_T`recrutar 6 unidades em 9 áreas diferentes (mesmo ocupadas)`, _T`vencer 6 batalhas`],
    lose: [_T`9 unidades rebeldes no mapa`, _T`os rebeldes destruírem 6 áreas`],
    advanced: [_T`4 unidades inimigas, uma em cada área.`, _T`Diplomacia inimiga começa em 3.`],
  },
  {
    id: 'oldcastle', name: _T`Cerco ao Velho Castelo`, en: _T`Old Castelo Siege`, diff: 'normal', lim: [8, 10, 4, 3], page: 19,
    story: _T`O velho castelo nas montanhas foi da sua família por muitos anos, até seu avô perdê-lo por dívidas. Agora você tem poder para retomá-lo, mas é uma fortaleza de verdade.`,
    rules: [
      _T`O oponente nunca se move.`,
      _T`Se suas unidades entrarem na área de uma guarda, não podem sair enquanto houver inimigos (precisam derrotá-los antes).`,
      _T`Limite por área: 3 unidades inimigas e 4 suas.`,
    ],
    win: [_T`entrar na área do Castelo com 4 unidades e atacar quando não houver inimigos`],
    lose: [_T`o oponente reforçar cada uma das guardas com 3 unidades`, _T`o oponente acumular 10 unidades no total`],
    advanced: [_T`4 unidades inimigas, uma em cada área (+).`, _T`Diplomacia inimiga começa em 3.`],
  },
  {
    id: 'plague', name: _T`Peste`, en: 'Plague', diff: 'hard', lim: [8, 9, 1, 1], page: 20,
    story: _T`Uma peste terrível se espalha pela sua terra, sem esperança de contenção, mas o rei não acredita na gravidade. Detenha a propagação antes que seja tarde.`,
    rules: [
      _T`A peste se espalha primeiro para as áreas marcadas com +.`,
      _T`Se essas áreas já estiverem ocupadas, uma nova unidade aparece em qualquer área adjacente a uma área ocupada ou destruída.`,
      _T`No ataque, a peste primeiro destrói uma unidade sua; se não houver, destrói a área onde está e se move para a área mais próxima que não esteja contaminada nem destruída.`,
      _T`Se a peste destruir uma vila, risque o símbolo dela.`,
      _T`Só 1 unidade de peste e 1 unidade sua por área.`,
      _T`Queimar vila: coloque sua unidade nela e faça um ataque; marque a vila com um círculo. Não é possível queimar uma vila já infectada.`,
    ],
    win: [_T`queimar 5 vilas antes que a doença chegue a elas`, _T`montar 4 quarentenas (representadas no campo de batalha)`],
    lose: [_T`6 vilas destruídas pela peste`, _T`9 unidades de peste no mapa`],
    advanced: [_T`3 áreas (+) começam infectadas (unidades inimigas).`, _T`3 vilas escolhidas começam afetadas pela peste.`, _T`Diplomacia inimiga começa em 3.`],
  },
  {
    id: 'conquer', name: _T`A Grande Conquista`, en: _T`The Great Conquer`, diff: 'hard', lim: [8, 9, 1, 1], page: 20,
    story: _T`Sua Influência já permite atacar as terras do vizinho; o rei não deve se opor a um conflito local, desde que você garanta apoio suficiente dele.`,
    rules: [_T`O inimigo começa o jogo com 2 unidades em duas áreas diferentes de castelos escolhidas por você.`],
    win: [_T`capturar 3 castelos do oponente: entrar com pelo menos 1 unidade e atacar quando não houver defensores`, _T`vencer 6 batalhas decisivas`],
    lose: [_T`veja as condições de derrota no cartão de cenário`],
    advanced: [_T`Risque todos os recursos do mapa.`, _T`Diplomacia inimiga começa em 3.`, _T`Considere e risque as 2 primeiras consequências que escolher.`],
  },
  {
    id: 'duel', name: _T`O Último Duelo`, en: 'Last Duel', diff: 'hard', lim: [8, 10, 4, 1], page: 22,
    story: _T`Nas terras disputadas há um grande conflito entre você e seu inimigo eterno, uma questão de honra entre famílias. O inimigo tem forças muito maiores; force um duelo que resolva a disputa antes que ele ganhe vantagem decisiva.`,
    rules: [
      _T`Você pode colocar as suas unidades e as inimigas em qualquer área.`,
      _T`Sempre coloque unidades inimigas em áreas que ainda não tenham inimigos.`,
      _T`Em cada área pode haver só 1 inimigo e no máximo 4 unidades suas.`,
    ],
    win: [_T`provocar o duelo cumprindo as condições no campo de batalha (o rei ordena resolver a disputa num duelo)`, _T`alcançar Influência ou Diplomacia tão alta que o rei ordena o inimigo a recuar`],
    lose: [_T`o inimigo trazer 10 unidades`, _T`o inimigo destruir 6 áreas com ataques`],
    advanced: [_T`4 unidades inimigas, uma em cada área escolhida.`],
  },
  {
    id: 'stronghold', name: _T`Fortaleza Ameaçada`, en: 'Stronghold Under Threat', diff: 'hard', lim: [8, 8, 4, 4], page: 19,
    story: _T`Suas terras foram invadidas na sua ausência; o ataque desonroso isolou sua fortaleza do resto do reino. Corra para o resgate antes que seja tarde.`,
    rules: [_T`Suas unidades só cruzam o rio nos pontos marcados com seta, e só no sentido em que a seta aponta.`],
    win: [_T`levar suas 4 unidades ao castelo sem unidades inimigas lá`, _T`vencer 6 batalhas decisivas`],
    lose: [_T`o inimigo levar 4 unidades ao seu castelo sem defesa e atacar`],
    advanced: [_T`5 unidades inimigas, uma em cada área (+).`, _T`Diplomacia inimiga começa em 3.`, _T`Suas unidades não podem se mover se estiverem numa área ocupada por inimigo.`],
  },
  {
    id: 'monster', name: _T`O Monstro`, en: 'The Monster', diff: 'extra', lim: [8, 8, 4, 4], page: 'monster',
    story: _T`As terras da sua família foram ocupadas por Senhor Greyson, o Monstro, um tirano psicopata que tortura e empala os inimigos. Acabe com essa tirania.`,
    rules: [
      _T`Suas unidades não podem passar por unidades inimigas ao se mover: param na área do inimigo. Os inimigos também param onde estão suas unidades. Ninguém sai dessa área sem uma batalha.`,
      _T`As unidades inimigas se movem em direção à área com a vila mais próxima ainda não destruída (em caso de empate, o jogador decide).`,
      _T`O inimigo começa o jogo com 3 unidades na área do Castelo dele.`,
    ],
    win: [_T`levar 4 unidades ao castelo inimigo sem tropas inimigas lá`, _T`vencer 6 batalhas decisivas`],
    lose: [_T`o inimigo destruir 5 vilas`, _T`o inimigo destruir 6 terrenos`, _T`o inimigo acumular 9 unidades`],
    advanced: [_T`+2 unidades inimigas em áreas escolhidas pelo jogador.`, _T`Diplomacia inimiga começa em 3.`],
  },
];

const RULE_PAGES = [
  ...Array.from({ length: 14 }, (_, i) => ({ src: `assets/rules/r${String(i + 1).padStart(2, '0')}.webp`, label: _T`Regras · pág. ${i + 1}` })),
  ...[18, 19, 20, 21, 22].map((p, i) => ({ src: `assets/rules/r${p}.webp`, label: _T`Regras dos mapas · ${i + 1}` })),
  { src: 'assets/rules/monster.webp', label: _T`O Monstro · regras` },
  { src: 'assets/rules/help.webp', label: _T`Carta de ajuda` },
];

// Habilidades dos personagens (transcritas das cartas).
// priv: privilégio ao ativar a ação (plus = ganha; choice = escolhe 1 de; swap = custos de "from" podem ser pagos com "to")
// rew: 2 recompensas únicas (req: nível de ação ou PV)  · thr: limiares de Influência  · sa: ação especial 1 (6 de um recurso = 1 Comando)
const CHAR_SKILLS = {
  barristan:  { priv: { act: 'king', plus: { v: 2 } }, rew: [{ req: { act: 'combat', lvl: 3 }, r: { v: 6 } }, { req: { act: 'tournaments', lvl: 3 }, r: { n: 6 } }],
                thr: [{ inf: 7, r: { v: 5, cp: 1 } }, { inf: 12, r: { cp: 1 } }, { inf: 23, r: { v: 5, dip: 1 } }], sa: 'g' },
  cortez:     { priv: { act: 'church', swap: { from: ['v'], to: ['v', 'n', 'g'] } }, rew: [{ req: { vp: 50 }, r: { gold: 8 } }, { req: { act: 'fame', lvl: 1 }, r: { gold: 6 } }],
                thr: [{ inf: 5, r: { v: 6 } }, { inf: 11, r: { cp: 1 } }, { inf: 22, r: { cp: 2 } }], sa: 'g' },
  jaques:     { priv: { act: 'merchants', plus: { n: 1, gold: 1 } }, rew: [{ req: { act: 'knowledge', lvl: 1 }, r: { n: 5 } }, { req: { act: 'stable', lvl: 2 }, r: { g: 5 } }],
                thr: [{ inf: 3, r: { gold: 8 } }, { inf: 9, r: { dip: 1 } }, { inf: 14, r: { cp: 2 } }], sa: 'g' },
  vea:        { priv: { act: 'castle', swap: { from: ['n'], to: ['n', 'g'] } }, rew: [{ req: { act: 'armory', lvl: 5 }, r: { g: 6 } }, { req: { vp: 60 }, r: { n: 6 } }],
                thr: [{ inf: 5, r: { gold: 10 } }, { inf: 16, r: { cp: 2 } }, { inf: 23, r: { gold: 10, cp: 1 } }], sa: 'v' },
  philippe:   { priv: { act: 'king', plus: { gold: 2 } }, rew: [{ req: { act: 'king', lvl: 2 }, r: { g: 6 } }, { req: { act: 'castle', lvl: 2 }, r: { gold: 9 } }],
                thr: [{ inf: 9, r: { gold: 10 } }, { inf: 14, r: { cp: 2 } }, { inf: 21, r: { dip: 1 } }], sa: 'n' },
  revees:     { priv: { act: 'castle', swap: { from: ['g'], to: ['v', 'g'] } }, rew: [{ req: { act: 'lords', lvl: 2 }, r: { v: 5 } }, { req: { act: 'combat', lvl: 3 }, r: { gold: 6 } }],
                thr: [{ inf: 7, r: { cp: 1 } }, { inf: 16, r: { cp: 1 } }, { inf: 21, r: { cp: 1 } }], sa: 'n' },
  terrax:     { priv: { act: 'nobles', swap: { from: ['v'], to: ['v', 'n'] } }, rew: [{ req: { act: 'knowledge', lvl: 2 }, r: { v: 5 } }, { req: { act: 'combat', lvl: 3 }, r: { g: 6 } }],
                thr: [{ inf: 10, r: { cp: 1 } }, { inf: 15, r: { cp: 1 } }, { inf: 20, r: { cp: 1, dip: 1 } }], sa: 'g' },
  ginny:      { priv: { act: 'lords', plus: { n: 1, gold: 1 } }, rew: [{ req: { act: 'stable', lvl: 3 }, r: { gold: 9 } }, { req: { act: 'fame', lvl: 2 }, r: { v: 6 } }],
                thr: [{ inf: 5, r: { n: 6 } }, { inf: 12, r: { cp: 1 } }, { inf: 20, r: { cp: 2 } }], sa: 'g' },
  dana:       { priv: { act: 'castle', swap: { from: ['n', 'g'], to: ['gold'] } }, rew: [{ req: { act: 'king', lvl: 3 }, r: { cp: 2 } }, { req: { vp: 80 }, r: { gold: 8 } }],
                thr: [{ inf: 11, r: { gold: 8, cp: 1 } }, { inf: 22, r: { cp: 2 } }, { inf: 28, r: { cp: 2 } }], sa: 'n' },
  gwendoline: { priv: { act: 'merchants', swap: { from: ['n'], to: ['n', 'gold'] } }, rew: [{ req: { vp: 90 }, r: { g: 5 } }, { req: { act: 'merchants', lvl: 2 }, r: { gold: 10 } }],
                thr: [{ inf: 6, r: { cp: 1 } }, { inf: 16, r: { dip: 1 } }, { inf: 24, r: { cp: 2 } }], sa: 'v' },
  bane:       { priv: { act: 'lords', choice: ['g', 'v'] }, rew: [{ req: { act: 'combat', lvl: 3 }, r: { cp: 1 } }, { req: { act: 'tournaments', lvl: 4 }, r: { cp: 1 } }],
                thr: [{ inf: 15, r: { cp: 1 } }, { inf: 20, r: { cp: 2 } }, { inf: 25, r: { cp: 2 } }], sa: 'n' },
  morgan:     { priv: { act: 'nobles', plus: { g: 1 } }, rew: [{ req: { act: 'village', lvl: 4 }, r: { n: 6 } }, { req: { act: 'fame', lvl: 2 }, r: { g: 6 } }],
                thr: [{ inf: 10, r: { cp: 1 } }, { inf: 15, r: { v: 6, cp: 1 } }, { inf: 20, r: { gold: 12 } }], sa: 'v' },
  dittmann:   { priv: { act: 'church', plus: { v: 1 } }, rew: [{ req: { act: 'armory', lvl: 4 }, r: { gold: 6 } }, { req: { act: 'nobles', lvl: 2 }, r: { v: 5 } }],
                thr: [{ inf: 5, r: { gold: 8 } }, { inf: 15, r: { cp: 1 } }, { inf: 23, r: { cp: 2 } }], sa: 'g' },
  macleod:    { priv: { act: 'lords', plus: { n: 1 } }, rew: [{ req: { act: 'nobles', lvl: 2 }, r: { n: 6 } }, { req: { vp: 50 }, r: { gold: 9 } }],
                thr: [{ inf: 7, r: { g: 5, v: 5 } }, { inf: 14, r: { cp: 2 } }, { inf: 18, r: { cp: 1 } }], sa: 'n' },
  gardner:    { priv: { act: 'church', swap: { from: ['n'], to: ['v', 'n', 'g'] } }, rew: [{ req: { vp: 30 }, r: { gold: 12 } }, { req: { act: 'stable', lvl: 2 }, r: { n: 5 } }],
                thr: [{ inf: 8, r: { n: 6 } }, { inf: 20, r: { cp: 2 } }, { inf: 26, r: { cp: 1, dip: 1 } }], sa: 'g' },
};
// PV da trilha de Influência da carta de personagem (fim de cada linha).
const INF_ROWS = [{ inf: 11, vp: 30 }, { inf: 22, vp: 40 }, { inf: 33, vp: 50 }];

// Ações por Ouro do Cenário (quadro inferior esquerdo de cada cartão). Reutilizáveis, sem limite por turno.
// eff: cp | res | inf | swap | vp10 | map (efeito no mapa, feito pelo jogador)
const GOLD_BASE = [
  { id: 'cp',    cost: { gold: 12 },                                        eff: 'cp',   label: _T`1 Comando` },
  { id: 'res',   cost: { gold: 3 },  req: { inf: 6 },                       eff: 'res',  label: _T`1 recurso à escolha` },
  { id: 'inf',   cost: { gold: 10 }, req: { act: 'fame', lvl: 3 },          eff: 'inf',  label: _T`1 Influência` },
  { id: 'swap2', cost: { gold: 2 },                                         eff: 'swap', label: _T`trocar 1 recurso por outro` },
  { id: 'swap1', cost: { gold: 1 },  req: { act: 'knowledge', lvl: 2 },     eff: 'swap', label: _T`trocar 1 recurso por outro` },
];
const ADD_UNIT = _T`colocar 1 unidade sua no mapa`;
const KILL = _T`remover 1 unidade inimiga do mapa`;
const MOVE_EN = _T`mover todas as unidades inimigas 1 área`;
const GOLD_SCEN = {
  barbarian:  { sp: { cost: { gold: 9 }, req: { act: 'king', lvl: 3 }, eff: 'map', tool: 'erase', label: KILL } },
  conquer:    { sp: { cost: { gold: 7 }, req: { act: 'church', lvl: 2 }, eff: 'map', tool: 'pu', label: ADD_UNIT } },
  defending:  { sp: { cost: { gold: 7 }, req: { act: 'nobles', lvl: 2 }, eff: 'map', label: MOVE_EN } },
  duel:       { sp: { cost: { gold: 7 }, req: { act: 'lords', lvl: 3 }, eff: 'map', tool: 'pu', label: ADD_UNIT } },
  elections:  { inf: 8, sp: { cost: { gold: 6 }, req: { act: 'lords', lvl: 4 }, eff: 'map', tool: 'erase', label: _T`remover 1 unidade inimiga e colocar 1 sua em qualquer área permitida` } },
  flood:      { swap1: { cost: { gold: 6 }, req: { act: 'knowledge', lvl: 2 }, eff: 'map', tool: 'pu', label: _T`colocar 1 unidade sua (trabalhador)` },
                sp: { cost: { gold: 3 }, req: { act: 'nobles', lvl: 2 }, eff: 'collect', label: _T`receber os recursos de 1 área do mapa` } },
  monster:    { sp: { cost: { gold: 7 }, req: { act: 'church', lvl: 2 }, eff: 'map', tool: 'pu', label: ADD_UNIT } },
  oldcastle:  { sp: { cost: { g: 5 }, req: { act: 'knowledge', lvl: 3 }, eff: 'map', tool: 'pu', label: ADD_UNIT } },
  plague:     { sp: { cost: { n: 3 }, req: { act: 'king', lvl: 3 }, eff: 'map', tool: 'erase', label: KILL } },
  rebely:     { swap1: { cost: { gold: 6 }, req: { act: 'knowledge', lvl: 2 }, eff: 'map', label: _T`mover suas unidades 1 área` },
                sp: { cost: { gold: 5 }, req: { act: 'king', lvl: 2 }, eff: 'map', tool: 'erase', label: KILL } },
  stronghold: { sp: { cost: { any: 3 }, req: { act: 'merchants', lvl: 3 }, eff: 'vp10', label: _T`+10 PV` } },
  templars:   { sp: { cost: { gold: 6 }, req: { act: 'nobles', lvl: 2 }, eff: 'map', label: MOVE_EN } },
};

// ---------- Cenário: mapa, batalhas, Ação do Rei e Comando ----------
// Área do mapa no cartão (frações da largura/altura). Padrão + ajustes.
const MAPBOX_DEF = [0.4863, 0.0253, 0.9875, 0.393];
const MAPBOX = { barbarian: [0.4842, 0.02, 0.9854, 0.3854], flood: [0.4904, 0.0253, 0.9917, 0.4137], rebely: [0.4854, 0.0236, 0.9867, 0.3895] };

// Batalhas: [requisito, nível, custos]. Custos: g n v = recurso, a = qualquer, oN = N Ouro.
// Requisitos especiais: inf (Influência), vp (PV), dipP (sua Diplomacia), dipE (Diplomacia inimiga pelo menos N — confirmado pelo usuário em 13/11).
// Recompensa padrão: remover 1 unidade inimiga + 20 PV.
const BATTLES = {
  defending:  [['combat', 3, 'v v v'], ['armory', 5, 'g v v'], ['tournaments', 3, 'v v v'], ['stable', 3, 'g g v'], ['fame', 2, 'v v n']],
  barbarian:  [['castle', 3, 'o12 v'], ['lords', 6, 'g g g'], ['armory', 6, 'v v v'], ['king', 2, 'n n n'], ['combat', 2, 'g v n']],
  conquer:    [['lords', 4, 'g n'], ['church', 2, 'v n'], ['castle', 3, 'g n'], ['knowledge', 3, 'v n'], ['armory', 6, 'g n'], ['fame', 3, 'v n']],
  duel:       [['dipP', 3, 'v n v n'], ['king', 3, 'g n g n'], ['dipE', 3, 'v n n v']],
  elections:  [['king', 2, 'o6 n'], ['nobles', 2, 'o6 v'], ['knowledge', 2, 'o6 n'], ['fame', 3, 'o6 g'], ['castle', 3, 'o6 g']],
  flood:      [['church', 2, 'g g g'], ['lords', 4, 'g v v'], ['inf', 24, 'n n v'], ['knowledge', 2, 'n g g'], ['merchants', 2, 'n g g']],
  monster:    [['church', 3, 'g g g'], ['castle', 3, 'v v v'], ['lords', 5, 'n n n'], ['king', 3, 'v g g'], ['dipP', 3, 'n v g'], ['fame', 3, 'v v v']],
  oldcastle:  [['lords', 6, 'n n n'], ['fame', 3, 'g g v'], ['stable', 3, 'v v o6'], ['vp', 180, 'n g v']],
  plague:     [['knowledge', 3, 'g g g'], ['king', 3, 'v n g'], ['church', 2, 'n n n'], ['merchants', 3, 'v g g']],
  rebely:     [['king', 2, 'g v n'], ['lords', 5, 'n n n'], ['village', 4, 'o8 g'], ['stable', 3, 'g g g'], ['inf', 20, 'a a a'], ['vp', 100, 'o12']],
  stronghold: [['armory', 5, 'g g'], ['fame', 2, 'n n'], ['dipP', 3, 'v v'], ['king', 2, 'g g'], ['vp', 250, 'n n'], ['lords', 5, 'v v']],
  templars:   [['tournaments', 4, 'v v g'], ['nobles', 3, 'v n o12'], ['combat', 3, 'v g g'], ['lords', 5, 'n n n']],
};

// Ação do Rei no Cenário: 5 colunas; a coluna k exige Rei nível k. Recompensas únicas.
// add = colocar 1 unidade sua · kill = remover 1 inimiga · moveOwn = mover suas unidades
const KING_COLS = {
  defending:  [{ cp: 1, vp: 20, gold: 3 }, { cp: 1, vp: 30, gold: 6 }, { cp: 1, vp: 30, gold: 6, dip: 1 }, { cp: 2, vp: 40, dip: 1 }, { cp: 2, vp: 50, dip: 1 }],
  barbarian:  [{ cp: 1, v: 3, n: 3, g: 3 }, { cp: 1, vp: 30, gold: 6 }, { cp: 1, vp: 30, gold: 6, dip: 1 }, { cp: 2, vp: 40, dip: 1 }, { cp: 2, vp: 50, dip: 1 }],
  conquer:    [{ cp: 1, n: 3, v: 3, g: 3, vp: 30 }, { cp: 1, dip: 1, gold: 8, vp: 30 }, { cp: 2, gold: 8, vp: 40 }, { cp: 1, dip: 1, vp: 40 }, { cp: 1, dip: 1, vp: 50 }],
  duel:       [{ cp: 1, v: 3, g: 3, gold: 8 }, { cp: 1, n: 5, vp: 40 }, { cp: 2, dip: 1, vp: 40 }, { cp: 2, dip: 1, vp: 40 }, { cp: 2, dip: 1, vp: 40 }],
  elections:  [{ cp: 1, n: 5, gold: 6, vp: 30 }, { cp: 1, dip: 1, add: 1, vp: 30 }, { cp: 1, dip: 1, gold: 12, vp: 40 }, { cp: 1, dip: 1, gold: 12, vp: 40 }, { cp: 3, vp: 40 }],
  flood:      [{ cp: 1, vp: 20, gold: 6 }, { cp: 1, vp: 30, gold: 6 }, { cp: 1, vp: 30, gold: 6, dip: 1 }, { cp: 2, vp: 40, dip: 1 }, { cp: 2, vp: 50, dip: 1 }],
  monster:    [{ cp: 1, v: 6, gold: 8 }, { cp: 1, n: 6, gold: 8 }, { cp: 1, g: 6, dip: 1, vp: 40 }, { cp: 1, gold: 8, dip: 1, vp: 40 }, { cp: 1, gold: 8, dip: 1, vp: 40 }],
  oldcastle:  [{ cp: 1, v: 5, n: 5, vp: 30 }, { cp: 2, vp: 30 }, { cp: 1, dip: 1, add: 1, vp: 30 }, { cp: 2, dip: 1, vp: 40 }, { cp: 1, dip: 1, vp: 50 }],
  plague:     [{ cp: 1, vp: 30, gold: 8 }, { cp: 1, vp: 30, gold: 8, kill: 1 }, { cp: 1, vp: 30, gold: 8, kill: 1 }, { cp: 2, vp: 40, kill: 1 }, { cp: 2, vp: 50, kill: 1 }],
  rebely:     [{ cp: 1, vp: 20, gold: 6 }, { cp: 1, vp: 30, gold: 6 }, { cp: 2, vp: 30, dip: 1 }, { cp: 2, vp: 40, dip: 1 }, { cp: 2, vp: 50, dip: 1 }],
  stronghold: [{ cp: 2, vp: 30 }, { cp: 1, dip: 1, vp: 40 }, { cp: 1, dip: 1, vp: 40 }, { cp: 2, dip: 1, vp: 50 }, { cp: 3 }],
  templars:   [{ cp: 1, vp: 20, dip: 1 }, { cp: 1, vp: 30, moveOwn: 1, gold: 9 }, { cp: 1, vp: 30, moveOwn: 1, gold: 9 }, { cp: 2, vp: 40, dip: 1 }, { cp: 2, vp: 50, dip: 1 }],
};

// Ações de Comando (1 ponto cada).
const CMD_DEF = {
  add:     { label: _T`Colocar unidade`, hint: _T`Toque no mapa numa área com + verde para colocar 1 unidade sua.` },
  attack:  { label: _T`Atacar`, hint: _T`Cada unidade sua destrói 1 inimiga na mesma área. Toque nas inimigas destruídas para removê-las.` },
  move:    { label: _T`Mover`, hint: _T`Arraste quantas unidades suas quiser, 1 área cada.` },
  push:    { label: _T`Mover inimigo`, hint: _T`Arraste a unidade inimiga como indicado no cartão.` },
  collect: { label: _T`Coletar`, hint: _T`Receba os recursos das áreas onde você tem unidades (mesmo com inimigos).` },
  dip:     { label: _T`−1 Dipl. inimiga`, hint: _T`Diminui a Diplomacia inimiga em 1.` },
};
const CMD_SCEN = { plague: ['add', 'attack', 'move', 'dip'], barbarian: ['add', 'attack', 'move', 'push', 'collect', 'dip'] };

// ---------- Cartas de objetivo (colunas avaliadas no fim dos turnos 3, 6 e 9) ----------
// ok: condição da recompensa · rew: recompensa · bad: condição da penalidade · pen: penalidade
// Condições: acts [[ação, nível]...] · vp ≥ · inf ≥ · gold ≥ · pu ≥ (suas unidades)
//            infLt · vpLt · puLt · euGe (inimigas ≥) · euGtPu (inimigas > suas) · dipPLt · dipP0 · gold0
// Penalidades: dipE (+Diplomacia inimiga) · zero [recursos] · enemy (unidades inimigas a adicionar)
const GOAL_DATA = {
  g1: [
    { ok: { acts: [['castle', 2]] }, rew: { n: 4, g: 4, v: 4 }, bad: { puLt: 2 }, pen: { enemy: 2 } },
    { ok: { vp: 130 }, rew: { cp: 2 }, bad: { infLt: 12 }, pen: { dipE: 1 } },
    { ok: { inf: 20 }, rew: { gold: 10, v: 6 }, bad: { euGe: 4 }, pen: { zero: ['n', 'g'] } },
  ],
  g2: [
    { ok: { gold: 10 }, rew: { n: 4, g: 4, v: 4 }, bad: { infLt: 3 }, pen: { enemy: 2 } },
    { ok: { inf: 12 }, rew: { gold: 12, dip: 1 }, bad: { euGtPu: 1 }, pen: { dipE: 1 } },
    { ok: { vp: 170 }, rew: { cp: 2 }, bad: { infLt: 20 }, pen: { zero: ['gold'], enemy: 1 } },
  ],
  g3: [
    { ok: { inf: 3 }, rew: { gold: 12 }, bad: { euGe: 3 }, pen: { zero: ['gold'], dipE: 1 } },
    { ok: { acts: [['knowledge', 2], ['combat', 2], ['lords', 2]] }, rew: { dip: 1, v: 6 }, bad: { dipP0: 1 }, pen: { zero: ['n', 'g', 'v'] } },
    { ok: { vp: 180 }, rew: { gold: 10, n: 5, g: 5 }, bad: { infLt: 19 }, pen: { enemy: 1 } },
  ],
  g4: [
    { ok: { acts: [['lords', 1]] }, rew: { n: 3, g: 3, v: 3, gold: 6 }, bad: { infLt: 3 }, pen: { zero: ['gold'] } },
    { ok: { vp: 110 }, rew: { n: 3, g: 3, v: 3, gold: 6 }, bad: { dipPLt: 2 }, pen: { dipE: 1 } },
    { ok: { acts: [['king', 3]] }, rew: { cp: 1, dip: 1 }, bad: { infLt: 25 }, pen: { zero: ['n', 'g', 'v'] } },
  ],
  g5: [
    { ok: { acts: [['tournaments', 2]] }, rew: { n: 4, g: 4, v: 4, gold: 10 }, bad: { gold0: 1 }, pen: { enemy: 2 } },
    { ok: { pu: 4 }, rew: { gold: 12, dip: 1 }, bad: { vpLt: 90 }, pen: { enemy: 2 } },
    { ok: { acts: [['castle', 3], ['lords', 5]] }, rew: { g: 4, v: 4, gold: 12 }, bad: { infLt: 21 }, pen: { zero: ['gold'], enemy: 1 } },
  ],
  g6: [
    { ok: { acts: [['nobles', 1], ['church', 1], ['merchants', 1]] }, rew: { n: 5, g: 5 }, bad: { infLt: 4 }, pen: { enemy: 1 } },
    { ok: { acts: [['tournaments', 3]] }, rew: { v: 6, dip: 1 }, bad: { vpLt: 100 }, pen: { zero: ['n', 'g', 'v'] } },
    { ok: { vp: 160 }, rew: { gold: 8, cp: 1 }, bad: { infLt: 23 }, pen: { enemy: 1 } },
  ],
};

// ---------- Ações de Influência do Cenário (quadro inferior direito) ----------
// Cada linha: ação, níveis exigidos à esquerda (lv), Influência exigida à direita (hx).
// L: células da esquerda, da mais próxima do centro para fora (a 1ª é livre).
// R: células da direita, do centro para fora (a 1ª é livre).
// Códigos: n5 g5 v5 gold8 = recursos · cp1 = Comando · dip1 = Diplomacia · vp40 = PV · unit = colocar 1 unidade sua
const INF_ACTS = {
  defending: [
    { act: 'church', lv: [1, 2, 3], hx: [6, 12], L: ['n5', 'dip1', 'cp1', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [6, 12], L: ['v5', 'cp1', 'cp1', 'cp2'], R: ['dip1', 'vp30', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [6, 12], L: ['gold6', 'cp1', 'dip1', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
  ],
  barbarian: [
    { act: 'castle', lv: [1, 2, 3], hx: [6, 13], L: ['v5', 'cp1', 'dip1', 'dip1'], R: ['cp1', 'vp20', 'cp1'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [6, 13], L: ['cp1', 'g6', 'dip1', 'cp2'], R: ['cp1', 'vp30', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [6, 13], L: ['cp1', 'dip1', 'cp1', 'cp1'], R: ['gold12', 'dip1', 'cp2'] },
  ],
  conquer: [
    { act: 'church', lv: [1, 2, 3], hx: [6, 12], L: ['g5', 'dip1', 'cp2', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [6, 12], L: ['n5', 'cp2', 'dip1', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [6, 12], L: ['v5', 'cp1', 'dip1', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
  ],
  duel: [
    { act: 'lords', lv: [1, 3, 5], hx: [10, 15], L: ['g5', 'v5', 'n5', 'dip2'], R: ['cp1', 'cp1', 'dip1'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [10, 15], L: ['gold8', 'cp1', 'cp1', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
    { act: 'castle', lv: [1, 2, 3], hx: [10, 15], L: ['vp50', 'cp1', 'dip1', 'cp2'], R: ['cp1', 'cp1', 'dip1'] },
  ],
  elections: [
    { act: 'church', lv: [1, 2, 3], hx: [7, 15], L: ['cp1', 'dip1', 'vp40', 'cp2'], R: ['cp1', 'cp2', 'dip1'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [7, 15], L: ['dip1', 'cp2', 'dip1', 'dip1'], R: ['vp40', 'dip1', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [7, 15], L: ['cp1', 'vp40', 'cp2', 'cp2'], R: ['unit', 'cp1', 'cp2'] },
  ],
  flood: [
    { act: 'church', lv: [1, 2, 3], hx: [6, 12], L: ['cp1', 'cp2', 'cp1', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [6, 12], L: ['v5', 'dip1', 'cp1', 'cp2'], R: ['dip1', 'vp40', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [6, 12], L: ['gold6', 'cp2', 'vp40', 'cp2'], R: ['gold8', 'dip1', 'dip1'] },
  ],
  monster: [
    { act: 'church', lv: [1, 2, 3], hx: [6, 12], L: ['v5', 'dip1', 'cp1', 'cp2'], R: ['cp1', 'cp1', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [6, 12], L: ['cp1', 'cp1', 'cp1', 'cp2'], R: ['n5', 'dip1', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [6, 12], L: ['g5', 'gold8', 'dip1', 'cp2'], R: ['gold8', 'cp1', 'cp2'] },
  ],
  oldcastle: [
    { act: 'church', lv: [1, 2, 3], hx: [6, 12], L: ['n5', 'dip1', 'dip1', 'cp2'], R: ['cp1', 'unit', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [6, 12], L: ['cp1', 'dip1', 'cp1', 'cp2'], R: ['g5', 'dip1', 'cp1'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [6, 12], L: ['gold8', 'gold10', 'gold12', 'cp2'], R: ['cp1', 'cp1', 'cp2'] },
  ],
  plague: [
    { act: 'church', lv: [1, 2, 3], hx: [8, 16], L: ['cp1', 'cp1', 'dip1', 'cp2'], R: ['n5', 'cp2', 'dip1'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [8, 16], L: ['cp1', 'dip1', 'vp40', 'cp2'], R: ['v5', 'dip1', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [8, 16], L: ['vp40', 'cp1', 'dip1', 'cp2'], R: ['gold12', 'dip1', 'cp2'] },
  ],
  rebely: [
    { act: 'church', lv: [1, 2, 3], hx: [6, 18], L: ['n5', 'dip1', 'cp1', 'cp2'], R: ['cp1', 'dip1', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [6, 18], L: ['cp1', 'dip1', 'dip1', 'cp2'], R: ['v5', 'cp1', 'cp2'] },
    { act: 'lords', lv: [2, 4, 6], hx: [6, 18], L: ['cp1', 'cp2', 'vp50', 'cp2'], R: ['gold9', 'dip1', 'dip1'] },
  ],
  stronghold: [
    { act: 'church', lv: [1, 2, 3], hx: [9, 14], L: ['dip1', 'g6', 'n6', 'cp2'], R: ['cp1', 'gold12', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [9, 14], L: ['cp1', 'v6', 'vp40', 'cp2'], R: ['cp1', 'dip1', 'dip1'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [9, 14], L: ['cp1', 'n6', 'dip1', 'vp50'], R: ['gold8', 'cp2', 'vp50'] },
  ],
  templars: [
    { act: 'lords', lv: [2, 4, 6], hx: [7, 14], L: ['cp1', 'dip1', 'cp1', 'cp2'], R: ['v5', 'dip1', 'cp2'] },
    { act: 'nobles', lv: [1, 2, 3], hx: [7, 14], L: ['cp1', 'cp1', 'cp1', 'cp2'], R: ['dip1', 'gold9', 'cp2'] },
    { act: 'merchants', lv: [1, 2, 3], hx: [7, 14], L: ['gold9', 'cp1', 'dip1', 'cp2'], R: ['n5', 'dip1', 'cp2'] },
  ],
};

// ---------- Vitória e derrota (quadros do cartão) ----------
// Tipos automáticos: bat (batalhas vencidas ≥) · vpinf [PV, Influência] · inf (Influência ≥) · eu (unidades inimigas no mapa ≥)
// m: condição de mapa que você confirma. Em todos: sua Diplomacia cheia = vitória; Diplomacia inimiga cheia = derrota.
const CASTLE40 = _T`4 unidades inimigas na área do seu castelo, sem unidades suas`;
const CASTLEX = _T`ataque inimigo ao seu castelo desprotegido`;
const WINLOSE = {
  defending:  { lose: [{ eu: 9 }, { m: CASTLE40 }, { m: CASTLEX }], win: [{ cnt: 'held', n: 5 }, { bat: 5 }, { vpinf: [300, 25] }] },
  barbarian:  { lose: [{ eu: 8 }, { m: CASTLE40 }, { m: CASTLEX }], win: [{ cnt: 'held', n: 6 }, { bat: 5 }, { vpinf: [300, 25] }] },
  conquer:    { lose: [{ eu: 9 }, { m: CASTLE40 }, { m: CASTLEX }], win: [{ cnt: 'castles', n: 3 }, { bat: 6 }] },
  duel:       { lose: [{ eu: 10 }, { cnt: 'razed', n: 6 }], win: [{ bat: 3 }, { inf: 33 }] },
  elections:  { lose: [{ cnt: 'advE', n: 6 }, { cnt: 'razed', n: 4 }, { cnt: 'coins', n: 6 }], win: [{ cnt: 'advP', n: 6 }, { bat: 5 }, { vpinf: [250, 24] }] },
  flood:      { lose: [{ cnt: 'flooded', n: 10 }, { m: _T`castelo inundado` }, { cnt: 'villFlood', n: 6 }], win: [{ bat: 5 }, { vpinf: [250, 25] }] },
  monster:    { lose: [{ eu: 9 }, { cnt: 'razed', n: 6 }, { cnt: 'villLost', n: 5 }], win: [{ bat: 6 }, { m: _T`4 unidades suas no castelo inimigo sem inimigos` }] },
  oldcastle:  { lose: [{ m: _T`as 3 guardas com 3 unidades inimigas cada` }, { eu: 10 }], win: [{ m: _T`4 unidades suas na área do castelo e ataque sem inimigos` }, { bat: 4 }] },
  plague:     { lose: [{ cnt: 'villPlague', n: 6 }, { eu: 9 }], win: [{ cnt: 'burned', n: 5 }, { bat: 4 }, { vpinf: [250, 27] }] },
  rebely:     { lose: [{ eu: 9 }, { cnt: 'razed', n: 6 }], win: [{ cnt: 'occ', n: 6 }, { bat: 6 }] },
  stronghold: { lose: [{ m: _T`4 unidades inimigas no seu castelo sem defensores, e ataque` }], win: [{ m: _T`4 unidades suas no castelo sem inimigos` }, { bat: 6 }, { vpinf: [300, 27] }] },
  templars:   { lose: [{ eu: 10 }, { m: CASTLE40 }, { m: CASTLEX }], win: [{ m: _T`castelo inimigo capturado (2+ unidades suas e ataque sem defensores)` }, { bat: 4 }] },
};
// Contadores de mapa usados pelas condições acima (o jogador ajusta com + e −).
const COUNTERS = {
  held: { label: _T`Áreas com unidade sua e sem inimigos`, short: _T`áreas controladas`, free: true },
  occ: { label: _T`Áreas com unidade sua (mesmo com inimigos)`, short: _T`áreas com unidade sua`, free: true },
  castles: { label: _T`Castelos inimigos capturados`, short: _T`castelos capturados` },
  razed: { label: _T`Áreas com todos os recursos destruídos`, short: _T`áreas destruídas` },
  advP: { label: _T`Áreas com vantagem sua`, short: _T`vantagem sua`, free: true },
  advE: { label: _T`Áreas com vantagem inimiga`, short: _T`vantagem inimiga`, free: true },
  coins: { label: _T`Ouro destruído no mapa`, short: _T`Ouro destruído` },
  flooded: { label: _T`Áreas inundadas`, short: _T`áreas inundadas` },
  villFlood: { label: _T`Vilas inundadas`, short: _T`vilas inundadas` },
  villLost: { label: _T`Vilas destruídas pelo Monstro`, short: _T`vilas destruídas` },
  villPlague: { label: _T`Vilas destruídas pela peste`, short: _T`vilas com peste` },
  burned: { label: _T`Vilas queimadas por você`, short: _T`vilas queimadas` },
};
// Nome das "batalhas" em alguns cenários.
const BAT_NAME = { plague: [_T`Quarentenas`, _T`quarentena`], elections: [_T`Debates políticos`, _T`debate`], duel: [_T`Condições do duelo`, _T`condição`] };
// Textos de efeitos que mudam por cenário.
const EFF_SCEN = {
  flood: { a1: _T`a água avança: 1 unidade de água numa área marcada com + (depois, em área vizinha a uma área com água ou inundada)`, a2: _T`a água avança em 2 áreas (marcadas com + primeiro, depois vizinhas)`,
           at: _T`ataque da água: cada área com água fica inundada (risque-a), a menos que haja um trabalhador seu nela, que morre no lugar; depois a água se espalha para uma área vizinha ainda não inundada` },
  plague: { a1: _T`a peste se espalha para 1 área marcada com + (se ocupadas, para uma área vizinha a uma ocupada ou destruída)`, a2: _T`a peste se espalha para 2 áreas`, a3: _T`a peste se espalha para 3 áreas`,
            at: _T`ataque da peste: em cada área com peste, destrói 1 unidade sua; sem unidade, destrói a área (e a vila, se houver) e se espalha para a área mais próxima não contaminada` },
  monster: { m1: _T`mover todas as unidades inimigas 1 área em direção à vila mais próxima ainda não destruída (param ao encontrar unidade sua)`, m2: _T`mover todas as unidades inimigas 2 áreas em direção à vila mais próxima ainda não destruída (param ao encontrar unidade sua)`,
             am: _T`adicionar 1 unidade inimiga no castelo do Monstro e mover todas 1 área em direção à vila mais próxima` },
  elections: { a1: _T`colocar 1 marcador inimigo numa área sem marcadores (se não houver, em qualquer área)`, a2: _T`colocar 2 marcadores inimigos em áreas sem marcadores primeiro`,
               at: _T`ataque: cada área com marcador inimigo destrói seus marcadores e depois recursos/Ouro da área` },
  rebely: { a1: _T`colocar 1 rebelde numa área onde ainda não haja rebeldes`, a2: _T`colocar 2 rebeldes em áreas onde ainda não haja rebeldes` },
  duel: { a1: _T`colocar 1 unidade inimiga numa área sem inimigos`, a2: _T`colocar 2 unidades inimigas em áreas sem inimigos`, a3: _T`colocar 3 unidades inimigas em áreas sem inimigos` },
};


// ---------- Preparação (normal e avançado) ----------
// units: N unidades inimigas a colocar · tracks: resolver a 1ª consequência (lista fixa ou "pick" N à escolha) · m: tarefa manual
const SETUP = {
  defending:  { adv: [{ m: _T`Em cada área do mapa deixe só 1 recurso: risque os demais` }, { units: 4, where: _T`2 em cada um dos dois quadrados marcados com +` }] },
  templars:   { normal: [{ units: 1, where: _T`na área do castelo inimigo` }], adv: [{ m: _T`Risque todos os recursos do mapa` }, { tracks: [1, 2, 3] }] },
  barbarian:  { adv: [{ units: 3, where: _T`em áreas marcadas com + à sua escolha` }, { pick: 1 }] },
  flood:      { adv: [{ units: 4, where: _T`água em 4 áreas marcadas com + à sua escolha` }, { m: _T`3 vilas à sua escolha começam inundadas: risque-as` }] },
  elections:  { adv: [{ units: 4, where: _T`uma em cada área marcada com +` }] },
  rebely:     { adv: [{ units: 4, where: _T`uma em cada área (marcadas com +)` }] },
  oldcastle:  { adv: [{ units: 4, where: _T`uma em cada área marcada com +` }] },
  plague:     { adv: [{ units: 3, where: _T`3 áreas marcadas com + infectadas` }, { m: _T`3 vilas à sua escolha começam com peste: risque-as` }] },
  conquer:    { normal: [{ units: 2, where: _T`em duas áreas de castelo diferentes, à sua escolha` }], adv: [{ m: _T`Risque todos os recursos do mapa` }, { pick: 2 }] },
  duel:       { adv: [{ units: 4, where: _T`uma em cada área à sua escolha` }] },
  stronghold: { adv: [{ units: 5, where: _T`uma em cada área marcada com +` }, { m: _T`Regra extra: suas unidades não se movem se estiverem numa área com inimigo` }] },
  monster:    { normal: [{ units: 3, where: _T`na área do castelo inimigo` }], adv: [{ units: 2, where: _T`em áreas à sua escolha` }] },
};

// ---------- Trilhas de consequência (transcritas dos cartões) ----------
// Elementos em ordem; o 1º é inevitável; depois pares (possível, inevitável).
// a1 a2 a3 = adicionar 1/2/3 unidades inimigas · m1 m2 = mover inimigos 1/2 áreas · am = adicionar 1 e mover 1
// at = ataque inimigo · d = +1 Diplomacia inimiga · "3g:a1" = possível: pague 3 Glória ou aconteça a1 (o = Ouro)
const CONS_TRACKS = {
  defending: {
    1: 'a1|3g:a1|m2|d|a2|3o:at|m1|d|am|4o:a2|at|d|a2|d|at',
    2: 'am|d|am|3v:a2|at|d|a2|5o:d|a2|d|m2|4o:a1|at|d|m1',
    3: 'a2|2v:d|a1|d|a2|4n:at|am|d|at|5g:am|a2|d|at|4n:d|am' },
  barbarian: {
    1: 'am|3n:at|at|3n:at|am|4v:a2|a2|3v:d|at|4g:a2|am|3n:d|a2|3v:a1|at',
    2: 'am|4v:a2|d|3g:am|a2|3g:d|at|3v:a1|am|3g:am|a2|3g:am|d|3n:d|at',
    3: 'a2|3g:am|a2|3g:d|a2|4v:a2|at|3g:am|a2|3v:d|a2|3n:at|d|3v:a1|am' },
  conquer: {
    1: 'am|4n:a2|m2|3g:am|am|4n:at|d|4n:at|a2|4o:m2|at|7o:d|at|3o:m2|at',
    2: 'a2|4o:d|am|3n:a2|m2|6o:at|am|5g:a2|d|5o:d|m2|3g:am|am|4o:d|at',
    3: 'a2|5o:m2|at|3v:at|am|3g:am|m2|4v:a2|am|3o:m2|at|5v:at|d|2v:a1|at' },
  duel: {
    1: 'a2|2v:a1|at|4g:a2|d|6o:at|a2|3n:a2|at|3n:a1|a2|3g:d|at|2v:a1|a2',
    2: 'd|3n:a1|a2|3g:d|at|d|a2|2v:a1|a2|3v:at|a2|3n:a2|a2|4n:at|at',
    3: 'a2|5v:at|a2|2v:a1|d|4n:a2|at|3g:d|at|3n:a2|a3|4n:at|d|3g:d|at' },
  elections: {
    1: 'a2|3o:a1|at|3g:d|a2|2n:at|d|3g:d|a2|5o:at|a1|3g:d|a2|4o:a1|a1',
    2: 'd|3o:a1|a2|2o:a1|at|5g:d|a2|2o:a1|a1|2n:at|a2|3o:a1|a1|3n:at|a1',
    3: 'a1|2n:at|a2|3g:d|a2|6o:at|a2|4o:at|a2|3n:at|d|4o:a1|a1|3g:d|a1' },
  flood: {
    1: 'a1|d|a1|3g:a1|a1|d|a1|4o:a1|at|3g:a1|a1|d|a1',
    2: 'a1|2v:a1|a1|d|at|3v:at|a2|d|a1|3o:at|a2|d|at',
    3: 'a1|3n:a1|at|5o:d|a1|d|a2|4o:a1|a1|d|at|5g:a1|a2' },
  monster: {
    1: 'a2|3g:am|m2|3g:am|d|8o:d|at|6o:at|a2|3g:am|at|4v:a2|d|6o:at|at',
    2: 'd|6o:at|a2|4n:a2|at|5g:a2|a2|4n:a2|a2|3n:a2|d|6o:at|d|4o:d|a2',
    3: 'am|3n:a2|a2|4g:at|m2|6o:at|d|3g:am|at|3g:am|at|3g:am|a2|6o:at|at' },
  oldcastle: {
    1: 'd|2n:a2|a2|2v:d|a1|3g:d|a2|3n:at|a1|2g:d|a2|2v:a1|at|2g:a1|a1',
    2: 'a2|4g:a2|d|3n:at|a2|2v:a2|a1|2g:d|a1|4v:a1|at|2v:a1|a2|2n:at|a1',
    3: 'a2|2v:d|a1|2v:a2|d|4n:at|a2|2v:a1|at|2g:d|a1|3g:at|a1|2v:a1|a2' },
  plague: {
    1: 'a1|4g:a1|at|4o:d|a2|5v:at|a2|6o:d|a1|3v:a2|a2|2v:a2|at|2n:a1|a1',
    2: 'a2|3n:a2|a1|2g:a2|at|8o:d|at|6o:at|a2|5g:at|at|2n:a1|a2|4o:d|at',
    3: 'a1|5o:d|a2|4v:a2|at|5g:d|a1|6o:d|at|4n:at|a3|4o:d|a1|2g:a1|a2' },
  rebely: {
    1: 'a1|4o:a2|a2|6o:a2|at|2n:a1|a2|2v:a1|at|3o:at|d|8o:d|at|3g:d|a2',
    2: 'a2|3g:a1|a1|4o:d|a2|3n:a2|d|4v:a1|a2|6o:d|at|4o:a2|a2|2v:a1|at',
    3: 'a1|4o:d|at|3g:a1|a2|5v:a1|at|4o:a2|d|5o:at|a2|2n:a1|at|3g:d|a2' },
  stronghold: {
    1: 'am|4n:a2|at|5o:m2|am|4v:at|m2|4o:d|am|3g:am|d|6g:at|am|4n:at|d',
    2: 'a1|4v:a2|am|3n:at|a1|4v:at|am|3o:m2|at|5g:at|am|6g:am|m1|3g:at|at',
    3: 'a2|4g:a2|at|3o:d|am|6o:at|m2|3v:at|am|3n:at|d|8o:d|am|4v:at|d' },
  templars: {
    1: 'am|4g:d|am|4o:m2|at|3o:a2|a2|5o:d|at|4o:m2|a2|5o:d|at|3n:at|am',
    2: 'a1|2n:at|m2|6o:d|a2|4o:am|at|6o:d|a3|3o:m2|am|5o:d|at|4o:d|a2',
    3: 'a2|3g:am|at|4o:a2|am|6o:d|a1|6o:am|at|4o:m2|a2|3o:m2|am|5o:d|a2' },
};
// Posição (fração da largura do cartão) do elemento k na trilha.
function consX(scen, k) { return scen === 'flood' ? (208 + k * 116) / 1700 * 0.49 : 0.0455 + k * 0.02944; }
