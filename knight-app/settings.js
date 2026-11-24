'use strict';
/* Configurações (ficam no aparelho) e atalhos de teclado do computador. */
const SET_KEY = 'knight.settings.v1';
const SET_DEF = { sideMap: true, warnEnd: true, autoWl: true, motion: true, text: 1, crisp: true, avail: true, pen: true };
let SET = (() => { try { return Object.assign({}, SET_DEF, JSON.parse(localStorage.getItem(SET_KEY)) || {}); } catch { return { ...SET_DEF }; } })();
function saveSet() { try { localStorage.setItem(SET_KEY, JSON.stringify(SET)); } catch {} applySet(); }
function applySet() {
  document.documentElement.style.setProperty('--fs', SET.text);
  document.documentElement.classList.toggle('no-motion', !SET.motion);
  ui.crisp = SET.crisp; ui.showAvail = SET.avail;
  try { localStorage.setItem('knight.crisp', SET.crisp ? '1' : '0'); localStorage.setItem('knight.avail', SET.avail ? '1' : '0'); } catch {}
}
/* As opções que já existiam em outras telas continuam sincronizadas. */
(() => { try { if (localStorage.getItem('knight.crisp') === '0') SET.crisp = false; if (localStorage.getItem('knight.avail') === '0') SET.avail = false; } catch {} })();
const isDesktop = () => window.matchMedia('(min-width: 1100px) and (pointer: fine)').matches || window.innerWidth >= 1280;
const sideMapOn = () => SET.sideMap && isDesktop() && S && S.turn <= 12 && ui.tab === 'table';

function swVersion() {
  return new Promise((res) => {
    if (!('caches' in window)) return res('—');
    caches.keys().then((k) => res((k.find((x) => /^knight-[0-9a-f]{6,}/.test(x)) || '—').replace('knight-', ''))).catch(() => res('—'));
  });
}
function showSettings() {
  const ck = (k, label, hint) => `<label class="set-row"><input type="checkbox" data-set="${k}" ${SET[k] ? 'checked' : ''}><span><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</span></label>`;
  modal(_T`<h2>⚙ Configurações</h2>
    <div class="set-row"><span><b>Language · Idioma</b></span><div class="seg"><button class="${LANG === 'en' ? 'on' : ''}" data-setlang="en">English</button><button class="${LANG === 'pt' ? 'on' : ''}" data-setlang="pt">Português</button></div></div>
    <h3>Visual</h3>
    <div class="set-row"><span><b>Tamanho do texto</b></span><div class="seg">${[[0.9, 'A−'], [1, 'A'], [1.12, 'A+'], [1.25, 'A++']].map(([v, l]) => `<button class="${SET.text === v ? 'on' : ''}" data-text="${v}">${l}</button>`).join('')}</div></div>
    ${ck('crisp', _T`Ícones nítidos`, _T`Desenha os ícones por cima das imagens das cartas e do mapa.`)}
    ${ck('pen', _T`Marcas de caneta`, _T`Os riscos parecem feitos à mão no papel. Desligue para usar marcas retas e coloridas.`)}
    ${ck('avail', _T`Destacar o que dá para pagar`, _T`Contornos verde, roxo e amarelo na Corte e no Personagem.`)}
    ${ck('motion', _T`Animações`, _T`Desligue para tirar pulsos e transições.`)}
    ${ck('sideMap', _T`Mapa ao lado da Mesa (computador)`, _T`Em telas largas, o mapa do cenário fica sempre visível ao lado da Mesa.`)}
    <h3>Partida</h3>
    ${ck('warnEnd', _T`Avisar antes de encerrar o turno`, _T`Consequência pendente ou Comando sem usar.`)}
    ${ck('autoWl', _T`Detectar vitória e derrota sozinho`, _T`O app avisa quando uma condição do cenário é cumprida.`)}
    <h3>Atalhos de teclado (computador)</h3>
    <div class="keys"><span><kbd>←</kbd><kbd>→</kbd> lado da carta</span><span><kbd>Enter</kbd> confirmar / próxima fase</span><span><kbd>1</kbd>–<kbd>5</kbd> abas</span><span><kbd>Ctrl</kbd>+<kbd>Z</kbd> desfazer</span><span><kbd>M</kbd> mapa</span><span><kbd>Esc</kbd> fechar janela</span></div>
    <h3>Dados</h3>
    <div class="menu row">${S && S.turn <= 12 ? _T`<button class="btn small" data-restart>Recomeçar esta partida</button>` : ''}<button class="btn small" data-upd>Procurar atualização</button><button class="btn small danger" data-wipe>Apagar todos os dados</button></div>
    <p class="muted small" id="set-ver">Versão: …</p>`, () => {
    $$('[data-set]').forEach((c) => (c.onchange = () => { SET[c.dataset.set] = c.checked; saveSet(); if (S) render(); }));
    $$('[data-setlang]').forEach((b) => (b.onclick = () => { if (b.dataset.setlang !== LANG) setLang(b.dataset.setlang); }));
    $$('[data-text]').forEach((b) => (b.onclick = () => { SET.text = +b.dataset.text; saveSet(); $$('[data-text]').forEach((x) => x.classList.toggle('on', x === b)); }));
    const rs = $('[data-restart]'); if (rs) rs.onclick = () => { if (confirm(_T`Recomeçar do turno 1 com o mesmo personagem, cenário e código?`)) { closeModal(); const { charId, scenId, advanced, seed } = S; newGame(charId, scenId, advanced, seed || ''); ui.tab = 'table'; render(); } };
    $('[data-upd]').onclick = async () => {
      if (!('serviceWorker' in navigator)) return toast(_T`Este navegador não usa o modo offline.`);
      try { const r = await navigator.serviceWorker.getRegistration(); if (r) { await r.update(); toast(r.installing || r.waiting ? _T`Atualização encontrada: baixando os arquivos novos.` : _T`Você já está na versão mais recente.`); } else toast(_T`Modo offline ainda não instalado.`); } catch { toast(_T`Sem conexão para procurar atualização.`); }
    };
    $('[data-wipe]').onclick = () => {
      if (!confirm(_T`Apagar partida em andamento, histórico, estatísticas e configurações deste aparelho?`)) return;
      try { Object.keys(localStorage).filter((k) => k.startsWith('knight.')).forEach((k) => localStorage.removeItem(k)); } catch {}
      location.reload();
    };
    swVersion().then((v) => { const e = $('#set-ver'); if (e) e.textContent = _T`Versão: ${v} · ${navigator.onLine ? 'online' : 'offline'} · os dados ficam só neste aparelho.`; });
  });
}
/* Atalhos de teclado. */
document.addEventListener('keydown', (e) => {
  if (!S || $('#game').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement && document.activeElement.tagName)) return;
  if (!$('#modal').hidden) return;
  const k = e.key;
  if (k >= '1' && k <= '5') { ui.tab = ['table', 'court', 'char', 'scen', 'rules'][+k - 1]; render(); e.preventDefault(); return; }
  if (k === 'm' || k === 'M') { ui.tab = 'scen'; ui.scenView = 'map'; render(); return; }
  if (ui.tab !== 'table' || S.turn > 12) return;
  if ((k === 'ArrowLeft' || k === 'ArrowRight') && S.phase === 0 && !S.choice) {
    const h = $(`.active-card .half.${k === 'ArrowLeft' ? 'L' : 'R'}`); if (h) { h.click(); e.preventDefault(); }
  } else if (k === 'Enter') {
    const b = $('[data-confirm]') || $('.phase-box [data-next]'); if (b && !b.disabled) { b.click(); e.preventDefault(); }
  }
});
