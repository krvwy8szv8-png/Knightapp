'use strict';
/* Idiomas: inglês (padrão) e português.
   Cada texto do app é escrito em português dentro de _T`...`. Em inglês, o texto é
   dividido em trechos (fora das tags HTML) e cada trecho é trocado pela tradução
   do dicionário I18N_EN (i18n-en.js). ${...} dentro do texto viram {} na tradução;
   {0}, {1}… permitem mudar a ordem. Trocar o idioma recarrega o app. */
const LANG_KEY = 'knight.lang';
const LANG = (() => { try { return localStorage.getItem(LANG_KEY) || 'en'; } catch (e) { return 'en'; } })();
const isEN = LANG === 'en';
function setLang(l) { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} location.reload(); }

const I18N_MK = /\u0000(\d+)\u0001/g;
/* Traduz um texto com marcadores \u0000i\u0001 no lugar dos ${}. */
function i18nTranslate(src, dict) {
  const seg = (core) => {
    const ids = []; const norm = core.replace(I18N_MK, (_, i) => { ids.push(i); return '{}'; });
    const tr = dict[norm]; if (tr == null) return null;
    let k = 0;
    return tr.replace(/\{(\d*)\}/g, (_, n) => { const i = n === '' ? ids[k++] : ids[+n]; return i == null ? '' : `\u0000${i}\u0001`; });
  };
  const text = (t) => {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(t);
    if (!/[A-Za-zÀ-ÿ]/.test(m[2])) return t;
    const r = seg(m[2]); return r == null ? t : m[1] + r + m[3];
  };
  const tag = (t) => t.replace(/\b(title|aria-label|placeholder|alt)="([^"]*)"/g, (all, a, v) => { const r = text(v); return `${a}="${r}"`; });
  return src.replace(/<[^>]*>|[^<]+/g, (t) => (t[0] === '<' && t.length > 1 && t[t.length - 1] === '>' ? tag(t) : text(t)));
}
/* Lista os trechos traduzíveis (usado pela ferramenta de extração). */
function i18nSegments(src) {
  const out = [];
  i18nTranslate(src, new Proxy({}, { get: (_, k) => { if (typeof k === 'string') out.push(k); return undefined; } }));
  return out;
}
const I18N_CACHE = new WeakMap();
function _T(strings, ...vals) {
  let plan = I18N_CACHE.get(strings);
  if (!plan) {
    if (!isEN || typeof I18N_EN === 'undefined') plan = { s: strings, o: strings.slice(1).map((_, i) => i) };
    else {
      const src = strings.map((s, i) => (i ? `\u0000${i - 1}\u0001` : '') + s).join('');
      const tr = i18nTranslate(src, I18N_EN);
      const s = []; const o = []; let last = 0; let m; I18N_MK.lastIndex = 0;
      while ((m = I18N_MK.exec(tr))) { s.push(tr.slice(last, m.index)); o.push(+m[1]); last = m.index + m[0].length; }
      s.push(tr.slice(last));
      plan = { s, o };
    }
    I18N_CACHE.set(strings, plan);
  }
  let r = plan.s[0];
  for (let i = 0; i < plan.o.length; i++) r += vals[plan.o[i]] + plan.s[i + 1];
  return r;
}
/* Textos fixos do index.html. */
function i18nStatic() {
  if (!isEN || typeof I18N_EN === 'undefined') return;
  document.documentElement.lang = 'en';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodes = [];
  while (w.nextNode()) nodes.push(w.currentNode);
  for (const n of nodes) { if (n.parentElement && /SCRIPT|STYLE/.test(n.parentElement.tagName)) continue; const t = i18nTranslate(n.nodeValue, I18N_EN); if (t !== n.nodeValue) n.nodeValue = t; }
  for (const el of document.querySelectorAll('[title],[aria-label],[placeholder],[alt]')) for (const a of ['title', 'aria-label', 'placeholder', 'alt']) {
    const v = el.getAttribute(a); if (!v) continue; const t = i18nTranslate(v, I18N_EN); if (t !== v) el.setAttribute(a, t);
  }
  const tt = i18nTranslate(document.title, I18N_EN); if (tt) document.title = tt;
}
if (typeof module !== 'undefined') module.exports = { i18nTranslate, i18nSegments };
