'use strict';
/* Marcas "de caneta": traços desenhados à mão, com pequenas variações por marca,
   tinta que se mistura ao papel e animação de traço quando a marca é feita agora.
   Cada marca recebe uma semente (posição) para que o desenho não mude a cada tela. */

const PEN_T = new Set(['x', 'o', 'sq', 'dot', 'chk', 'loop', 'hatch']);
const penSeen = new Set();
const penLayers = new Set();

function penRng(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const f2 = (n) => n.toFixed(2);
/* Traço levemente curvo, como uma linha feita à mão. */
function penLine(r, x1, y1, x2, y2, bow) {
  const mx = (x1 + x2) / 2 + (r() - 0.5) * bow, my = (y1 + y2) / 2 + (r() - 0.5) * bow;
  return `M${f2(x1)} ${f2(y1)}Q${f2(mx)} ${f2(my)} ${f2(x2)} ${f2(y2)}`;
}
/* Volta fechada que passa um pouco do ponto inicial (círculo feito à mão). */
function penLoop(r, rx, ry) {
  const a0 = r() * Math.PI * 2, sweep = Math.PI * 2 * (1.08 + r() * 0.1), n = 18; let d = '';
  for (let i = 0; i <= n; i++) {
    const a = a0 + (sweep * i) / n; const k = 1 + (r() - 0.5) * 0.07 + (i / n) * 0.06;
    const x = 5 + Math.cos(a) * rx * k, y = 5 + Math.sin(a) * ry * k;
    d += (i ? 'L' : 'M') + f2(x) + ' ' + f2(y);
  }
  return d;
}
function penSvg(t, seed) {
  const key = t + '|' + seed; const layer = String(seed).split(':')[0];
  const r = penRng(key); const j = (a = 1) => (r() - 0.5) * a;
  const rot = j(16); const w = 1.05 + r() * 0.35;
  let p = '';
  if (t === 'x') p = `<path pathLength="1" d="${penLine(r, 1.4 + j(), 1.5 + j(), 8.6 + j(), 8.5 + j(), 1.8)}"/><path pathLength="1" d="${penLine(r, 8.6 + j(), 1.4 + j(), 1.5 + j(), 8.6 + j(), 1.8)}"/>`;
  else if (t === 'chk') p = `<path pathLength="1" d="M${f2(1.4 + j())} ${f2(5.2 + j())}Q${f2(2.8)} ${f2(6.2)} ${f2(3.9 + j(0.6))} ${f2(8.4 + j(0.5))}Q${f2(5.6 + j())} ${f2(4)} ${f2(8.8 + j(0.6))} ${f2(1.5 + j(0.6))}"/>`;
  else if (t === 'o') p = `<path pathLength="1" d="${penLoop(r, 3.7, 3.6)}"/>`;
  else if (t === 'loop') p = `<path pathLength="1" d="${penLoop(r, 4.4, 4.5)}"/>`;
  else if (t === 'sq') { const a = 1.3, b = 8.7; p = `<path pathLength="1" d="M${f2(a + j())} ${f2(a + j())}L${f2(b + j(0.6))} ${f2(a + j(0.6))}L${f2(b + j(0.6))} ${f2(b + j(0.6))}L${f2(a + j(0.6))} ${f2(b + j(0.6))}L${f2(a + j(0.6))} ${f2(a - 0.4)}"/>`; }
  else if (t === 'dot') { let d = 'M5 5'; for (let i = 1; i <= 10; i++) { const a = i * 1.9 + j(0.4), rr = 0.4 + i * 0.27; d += `L${f2(5 + Math.cos(a) * rr)} ${f2(5 + Math.sin(a) * rr)}`; } p = `<path pathLength="1" d="${d}" stroke-width="1.6"/>`; }
  else if (t === 'hatch') { for (let i = 0; i < 5; i++) { const o = 1 + i * 2; p += `<path pathLength="1" d="${penLine(r, o + j(0.5), 9 + j(0.4), o + 4.5 + j(0.5), 1 + j(0.4), 0.8)}"/>`; } }
  let fresh = '';
  if (!penSeen.has(key)) { penSeen.add(key); if (penLayers.has(layer) && SET.motion) fresh = ' fresh'; }
  if (!penLayers.has(layer)) queueMicrotask(() => penLayers.add(layer));
  return `<svg viewBox="0 0 10 10" class="pen${fresh}" style="transform:rotate(${f2(rot)}deg)" fill="none" stroke="currentColor" stroke-width="${f2(w)}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}
const penOn = () => SET.pen !== false;
