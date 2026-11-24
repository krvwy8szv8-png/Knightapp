'use strict';
/* Ícones vetoriais nítidos (desenhados para o app, no estilo das cartas). Todos em viewBox 0 0 48 48. */
const BANNER = 'M5 4h38v34c-3.2 2.6-6.4 2.6-9.6 0s-6.4-2.6-9.6 0-6.4 2.6-9.6 0-6.4-2.6-9.2 0z';
const SHIELD = 'M24 4l17 4.5v13c0 10.5-7 18-17 22.5C14 39.5 7 32 7 21.5v-13z';
const LEAF = (x, y, r) => `<path d="M${x} ${y - 3.8}c2.2 1.7 2.2 5.9 0 7.6-2.2-1.7-2.2-5.9 0-7.6z" transform="rotate(${r} ${x} ${y})"/>`;
const ICON_SVG = {
  g: `<path d="${BANNER}" fill="#f9d71c" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
    <g fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"><path d="M22.5 31.5a10.5 10.5 0 01-6.5-19"/><path d="M25.5 31.5a10.5 10.5 0 006.5-19"/></g>
    <g fill="#111">${LEAF(17.9, 32.0, 243)}${LEAF(30.1, 32.0, -243)}${LEAF(13.4, 28.0, 270)}${LEAF(34.6, 28.0, -270)}${LEAF(11.1, 22.3, 297)}${LEAF(36.9, 22.3, -297)}${LEAF(11.7, 16.3, 324)}${LEAF(36.3, 16.3, -324)}${LEAF(15.0, 11.1, 351)}${LEAF(33.0, 11.1, -351)}</g><path d="M20.5 33.5l3.5-2.2 3.5 2.2" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>`,
  n: `<path d="${BANNER}" fill="#5f97dd" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M24 34c-8-5-11.5-9-11.5-13.3 0-3.4 2.6-5.7 5.6-5.7 2.6 0 4.6 1.5 5.9 3.6 1.3-2.1 3.3-3.6 5.9-3.6 3 0 5.6 2.3 5.6 5.7C35.5 25 32 29 24 34z" fill="#111"/>
    <path d="M24 30.2c-5.4-3.6-7.8-6.4-7.8-9.3 0-1.8 1.3-3 2.9-3 1.9 0 3.2 1.4 4.9 4 1.7-2.6 3-4 4.9-4 1.6 0 2.9 1.2 2.9 3 0 2.9-2.4 5.7-7.8 9.3z" fill="#5f97dd"/>
    <path d="M17.5 13.5l2.4-5.2 2.3 3.2L24 7l1.8 4.5 2.3-3.2 2.4 5.2z" fill="#111"/>`,
  v: `<path d="${BANNER}" fill="#e8262b" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
    <g transform="rotate(-33 24 17)"><path d="M22.8 6L24 4l1.2 2 .2 19.5h-2.8z" fill="#111"/><rect x="19" y="25.3" width="10" height="2.6" rx="1" fill="#111"/><rect x="22.9" y="27.6" width="2.2" height="5.4" fill="#111"/><circle cx="24" cy="34.2" r="1.9" fill="#111"/></g><g transform="rotate(33 24 17)"><path d="M22.8 6L24 4l1.2 2 .2 19.5h-2.8z" fill="#111"/><rect x="19" y="25.3" width="10" height="2.6" rx="1" fill="#111"/><rect x="22.9" y="27.6" width="2.2" height="5.4" fill="#111"/><circle cx="24" cy="34.2" r="1.9" fill="#111"/></g>`,
  gold: `<circle cx="24" cy="24" r="18.5" fill="#c97b16" stroke="#111" stroke-width="2.4"/><circle cx="24" cy="24" r="14.2" fill="#f2b53a" stroke="#8a4e05" stroke-width="1.6"/>
    <path d="M16.5 27.5l1.6-8 3.6 4 2.3-6 2.3 6 3.6-4 1.6 8z" fill="#8a4e05"/><path d="M16.5 29.5h15" stroke="#8a4e05" stroke-width="2" stroke-linecap="round"/>`,
  any: `<path d="${BANNER}" fill="#fff" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/><text x="24" y="28" text-anchor="middle" font-size="17" font-weight="800" fill="#111" font-family="system-ui,sans-serif">?</text>`,
  sg: `<path d="${SHIELD}" fill="#45a845" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 14v18M15 23h18" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/>`,
  sr: `<path d="${SHIELD}" fill="#e22c45" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 14v18M15 23h18" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/>`,
  vil: `<rect x="4" y="5" width="40" height="38" rx="3" fill="#fff" stroke="#111" stroke-width="2.4"/>
    <path d="M10 25l14-12 14 12" fill="none" stroke="#111" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M13 23v14h22V23" fill="#fff" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M13 29h22M19 23v14M29 23v14" stroke="#111" stroke-width="1.6"/><rect x="21.5" y="29" width="5" height="8" fill="#111"/><rect x="29" y="12" width="3.6" height="7" fill="#111"/>`,
  castle: `<circle cx="24" cy="24" r="21" fill="#e9e6df" stroke="#111" stroke-width="2.4"/>
    <path d="M11 36V20h3v-3h2.5v3h2V17h3v3h5v-3h3v3h2v-3H34v3h3v16z" fill="#8a8f98" stroke="#111" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M21 36v-6a3 3 0 016 0v6z" fill="#3a2a1a"/><path d="M14.5 24h3M30.5 24h3" stroke="#111" stroke-width="2"/>`,
  pu: `<path d="M24 4l17 6v13c0 10-7 17-17 21C14 40 7 33 7 23V10z" fill="#2fa84f" stroke="#fff" stroke-width="3"/>`,
  eu: `<path d="M24 4l17 6v13c0 10-7 17-17 21C14 40 7 33 7 23V10z" fill="#d6333f" stroke="#fff" stroke-width="3"/>`,
  hex: `<path d="M24 4l17.3 10v20L24 44 6.7 34V14z" fill="#fff" stroke="#111" stroke-width="2.6"/>`,
  hexd: `<path d="M24 4l17.3 10v20L24 44 6.7 34V14z" fill="#fff" stroke="#111" stroke-width="2.6" stroke-dasharray="4 3"/>`,
  pv: _T`<path d="M9 4h30v36l-15-7-15 7z" fill="#3c8a3c" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/><text x="24" y="24" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">PV</text>`,
  cp: `<path d="M12 44V6" stroke="#111" stroke-width="3" stroke-linecap="round"/><path d="M13 7h24l-5 7 5 7H13z" fill="#e8b21c" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/>`,
  inf: `<path d="M24 4l17.3 10v20L24 44 6.7 34V14z" fill="#3a3f4b" stroke="#111" stroke-width="2.4"/><circle cx="24" cy="24" r="7" fill="#9cc6ff"/>`,
  dipP: `<path d="M8 32c6-2 10-7 16-7s10 5 16 7" fill="none" stroke="#2fa84f" stroke-width="4" stroke-linecap="round"/><path d="M8 22c6-2 10-7 16-7s10 5 16 7" fill="none" stroke="#2fa84f" stroke-width="4" stroke-linecap="round"/>`,
  dipE: `<path d="M8 16c6 2 10 7 16 7s10-5 16-7" fill="none" stroke="#d6333f" stroke-width="4" stroke-linecap="round"/><path d="M8 26c6 2 10 7 16 7s10-5 16-7" fill="none" stroke="#d6333f" stroke-width="4" stroke-linecap="round"/>`,
  x: `<path d="M12 12l24 24M36 12L12 36" stroke="#111" stroke-width="5" stroke-linecap="round"/>`,
};

/* Custos da Corte: símbolo colorido num círculo branco (como nas cartas). Ganhos continuam como bandeiras quadradas. */
Object.assign(ICON_SVG, {
  cg: `<circle cx="24" cy="24" r="22" fill="#fffdf6" stroke="#2b2b2b" stroke-width="1.6"/><circle cx="24" cy="24" r="19.6" fill="none" stroke="#cdb98a" stroke-width="1.4"/><g fill="none" stroke="#3b3000" stroke-width="1.6" stroke-linecap="round"><path d="M22.5 33a11 11 0 01-6.8-19.5"/><path d="M25.5 33a11 11 0 006.8-19.5"/></g>
    <g fill="#f4cf16" stroke="#3b3000" stroke-width=".9">${LEAF(18.4, 33.6, 243)}${LEAF(29.6, 33.6, -243)}${LEAF(14.2, 29.9, 270)}${LEAF(33.8, 29.9, -270)}${LEAF(12.1, 24.7, 297)}${LEAF(35.9, 24.7, -297)}${LEAF(12.7, 19.1, 324)}${LEAF(35.3, 19.1, -324)}${LEAF(15.7, 14.4, 351)}${LEAF(32.3, 14.4, -351)}</g>`,
  cn: `<circle cx="24" cy="24" r="22" fill="#fffdf6" stroke="#2b2b2b" stroke-width="1.6"/><circle cx="24" cy="24" r="19.6" fill="none" stroke="#cdb98a" stroke-width="1.4"/><g transform="translate(24 25) scale(1.18) translate(-24 -24)"><path d="M24 35c-7.4-4.6-10.6-8.3-10.6-12.3 0-3.1 2.4-5.3 5.2-5.3 2.4 0 4.2 1.4 5.4 3.3 1.2-1.9 3-3.3 5.4-3.3 2.8 0 5.2 2.2 5.2 5.3 0 4-3.2 7.7-10.6 12.3z" fill="#3c6fd1" stroke="#0f1f40" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M18.3 16.2l2.3-4.8 2.1 2.9L24 10l1.3 4.3 2.1-2.9 2.3 4.8z" fill="#3c6fd1" stroke="#0f1f40" stroke-width="1.3" stroke-linejoin="round"/></g>`,
  cv: `<circle cx="24" cy="24" r="22" fill="#fffdf6" stroke="#2b2b2b" stroke-width="1.6"/><circle cx="24" cy="24" r="19.6" fill="none" stroke="#cdb98a" stroke-width="1.4"/><g fill="#e3262c" stroke="#4a0606" stroke-width=".9"><g transform="rotate(-36 24 19)"><path d="M22.9 8L24 6l1.1 2 .2 17h-2.6z"/><rect x="19.5" y="24.6" width="9" height="2.4" rx="1"/><rect x="23" y="26.8" width="2" height="4.6"/><circle cx="24" cy="32.6" r="1.7"/></g><g transform="rotate(36 24 19)"><path d="M22.9 8L24 6l1.1 2 .2 17h-2.6z"/><rect x="19.5" y="24.6" width="9" height="2.4" rx="1"/><rect x="23" y="26.8" width="2" height="4.6"/><circle cx="24" cy="32.6" r="1.7"/></g></g>`,
});
/* Ícone em linha (img com data-URI; funciona offline e escala sem borrar). */
const _iconUri = {};
function iconUri(k) {
  if (!_iconUri[k]) _iconUri[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${ICON_SVG[k]}</svg>`);
  return _iconUri[k];
}
const iconImg = (k, cls = 'ic') => `<img class="${cls}" src="${iconUri(k)}" alt="">`;

/* ---------- Ícones nítidos por cima das imagens ---------- */
function bindCrisp(el, redraw) {
  $$('[data-crisp]', el).forEach((c) => (c.onchange = () => { ui.crisp = SET.crisp = c.checked; saveSet(); try { localStorage.setItem('knight.crisp', ui.crisp ? '1' : '0'); } catch {} redraw(); }));
}
const CRISP_SCALE = { g: 1.42, n: 1.42, v: 1.42, sg: 1.3, sr: 1.3, vil: 1.24, o: 1.38 };
function mapCrispHtml() {
  const A = AREAS[S.scenId]; if (!A || !ui.crisp) return '';
  const cut = new Set(mapIcons().filter((i) => i.cut).map((i) => i.u + ',' + i.v));
  return A.ic.map(([k, u, v, , w]) => `<img class="mic${cut.has(u + ',' + v) ? ' cut' : ''}" src="${iconUri(k === 'o' ? 'gold' : k)}" alt="" style="left:${u * 100}%;top:${v * 100}%;width:${(w * CRISP_SCALE[k] * 100).toFixed(2)}%">`).join('');
}
function courtCrispHtml() {
  if (!ui.crisp) return '';
  const d = COURT.castle.cell * 100; const out = [];
  for (const t of Object.values(COURT.tracks)) for (const s of t.segs) for (const [x, y, k] of s.c)
    out.push(`<div class="cic ${k}" style="left:${x * 100}%;top:${y * 100}%;width:${d.toFixed(2)}%">${k === 'any' ? '' : `<img src="${iconUri(k === 'gold' ? 'gold' : 'c' + k)}" alt="">`}</div>`);
  return out.join('');
}
// Recursos do app inteiro passam a usar os ícones vetoriais.
for (const k of ['g', 'n', 'v', 'gold']) RES[k].icon = iconUri(k);
