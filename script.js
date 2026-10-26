// FLAMES 🔥 — the school love game, coded by @hack.n.code
// Friends · Love · Affection · Marriage · Enemies · Siblings
(() => {
const INFO = {
  F: { w: 'FRIENDS',   e: '🤝', l: 'Sirf dost… friendzone pakka 😂' },
  L: { w: 'LOVE',      e: '❤️', l: 'Pyaar hai bhai, pyaar! 😍' },
  A: { w: 'AFFECTION', e: '🥰', l: 'Thoda thoda pyaar ho raha hai 🥰' },
  M: { w: 'MARRIAGE',  e: '💍', l: 'Shaadi pakki! 😂' },
  E: { w: 'ENEMIES',   e: '😤', l: 'Bhaag ja 😂 dushman nikla' },
  S: { w: 'SIBLINGS',  e: '🫂', l: 'Rakhi bandhwa le 😂' },
};
const WORD = 'FLAMES';
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const back = x => { x = clamp(x); const c = 1.7, y = x - 1; return 1 + (c + 1) * y * y * y + c * y * y; };

// ---------- the actual FLAMES algorithm ----------
const clean = s => (s || '').toLowerCase().replace(/[^a-z]/g, '');
function flames(a, b) {
  const A = [...clean(a)], B = [...clean(b)];
  const usedB = B.map(() => false), pairs = [];
  A.forEach((c, i) => {                       // strike common letters, one-for-one
    const j = B.findIndex((d, k) => d === c && !usedB[k]);
    if (j >= 0) { usedB[j] = true; pairs.push([i, j]); }
  });
  const n = A.length + B.length - 2 * pairs.length;
  const rounds = [];
  let s = [0, 1, 2, 3, 4, 5], i = 0;
  if (n > 0) while (s.length > 1) {          // count n around the circle, burn the letter you land on
    const start = i;
    i = (i + n - 1) % s.length;
    rounds.push({ start, land: i, list: s.slice(), removed: s[i] });
    s.splice(i, 1);
    i = i % s.length;
  }
  return { A, B, pairs, n, rounds, result: n > 0 ? WORD[s[0]] : null, survivor: n > 0 ? s[0] : -1 };
}
window.flames = flames;

// ---------- timeline ----------
function plan(sol) {
  const P = { strikes: [], rounds: [] };
  const np = sol.pairs.length, n = sol.n;
  sol.pairs.forEach((p, k) => P.strikes.push(0.5 + k * 0.42));
  P.sC = 0.5 + np * 0.42 + 0.12;
  P.cStep = n ? Math.min(0.07, 0.6 / n) : 0;
  P.sF = P.sC + n * P.cStep + 0.25;
  let cur = P.sF + 0.35;
  const hop = n ? Math.min(0.06, 0.36 / n) : 0;
  sol.rounds.forEach(r => {
    const R = { ...r, t0: cur, hop, tLand: cur + n * hop };
    R.tBurn = R.tLand + 0.05; R.tEnd = R.tBurn + 0.32; cur = R.tEnd + 0.04;
    P.rounds.push(R);
  });
  P.sR = n ? cur + 0.1 : P.sC + 0.3;
  P.sCard = P.sR + 0.25;
  P.total = P.sCard + 1.4;
  return P;
}

// ---------- state ----------
const qs = new URLSearchParams(location.search);
const CAP = qs.get('capture') === '1';
if (CAP) document.body.classList.add('cap');
const DEMO = { a: qs.get('da') || 'Rahul', b: qs.get('db') || 'Priya' };
const T0 = CAP ? 1.2 : 0;          // capture: names are typed first
let sol = null, P = null, tiles = { A: [], B: [] }, fl6 = [], names = { a: '', b: '' };

function build(a, b) {
  names = { a: a.trim(), b: b.trim() };
  sol = flames(a, b); P = plan(sol);
  const mk = (row, arr) => {
    row.innerHTML = '';
    return arr.map(c => {
      const d = document.createElement('div'); d.className = 'tile';
      d.innerHTML = `${c.toUpperCase()}<span class="st"></span><span class="no"></span>`;
      row.appendChild(d); return d;
    });
  };
  tiles.A = mk($('rowA'), sol.A); tiles.B = mk($('rowB'), sol.B);
  const sz = Math.max(sol.A.length, sol.B.length);
  const base = CAP ? 42 : 34, w = sz > 9 ? Math.max(18, Math.floor(base * 9 / sz)) : base;
  [...tiles.A, ...tiles.B].forEach(t => { t.style.width = w + 'px'; t.style.fontSize = Math.min(base, w + 2) + 'px'; });
  // number the leftover letters
  const sa = new Set(sol.pairs.map(p => p[0])), sb = new Set(sol.pairs.map(p => p[1]));
  let k = 0; tiles.left = [];
  tiles.A.forEach((t, i) => { if (!sa.has(i)) { t.querySelector('.no').textContent = ++k; tiles.left.push(t); } });
  tiles.B.forEach((t, i) => { if (!sb.has(i)) { t.querySelector('.no').textContent = ++k; tiles.left.push(t); } });
  const F = $('flames'); F.innerHTML = '';
  fl6 = [...WORD].map(ch => {
    const d = document.createElement('div'); d.className = 'fl6';
    d.innerHTML = `<b>${ch}</b><i>${INFO[ch].w.slice(0, 1) + INFO[ch].w.slice(1).toLowerCase()}</i><span class="x"></span><span class="ring"></span><span class="hn"></span>`;
    F.appendChild(d); return d;
  });
  const r = sol.result ? INFO[sol.result] : { w: 'SAME NAME?', e: '🤨', l: 'Arre, dono naam same? 😂 Try another' };
  $('remo').textContent = r.e; $('rword').textContent = r.w; $('rline').textContent = r.l;
  $('rnames').textContent = `${names.a} ❤️ ${names.b}`;
  window.__events = events();
}
function events() {   // site-time events (for sound sync in the reel)
  const ev = [];
  ev.push({ t: T0 + 0, k: 'tiles' });
  P.strikes.forEach(s => ev.push({ t: T0 + s, k: 'strike' }));
  ev.push({ t: T0 + P.sC, k: 'count' });
  ev.push({ t: T0 + P.sF, k: 'flames' });
  P.rounds.forEach(r => { for (let i = 0; i < sol.n; i++) ev.push({ t: T0 + r.t0 + i * r.hop, k: 'hop' }); ev.push({ t: T0 + r.tBurn, k: 'burn' }); });
  ev.push({ t: T0 + P.sCard, k: 'result' });
  return ev;
}

// ---------- particles (deterministic) ----------
const cv = $('fx'), cx = cv.getContext('2d');
function rnd(seed) { let x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
function sizeCanvas() { const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
addEventListener('resize', sizeCanvas); sizeCanvas();
function center(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
function burst(x, y, age, seed, count, power, cols, life) {
  if (age < 0 || age > life) return;
  for (let i = 0; i < count; i++) {
    const a = rnd(seed + i * 7.1) * Math.PI * 2, v = power * (0.35 + rnd(seed + i * 3.3) * 0.9);
    const px = x + Math.cos(a) * v * age, py = y + Math.sin(a) * v * age - 40 * age + 160 * age * age;
    const f = 1 - age / life, r = (2 + rnd(seed + i) * 3.5) * (0.4 + f);
    cx.globalAlpha = clamp(f * 1.3);
    cx.fillStyle = cols[i % cols.length];
    cx.beginPath(); cx.arc(px, py, r, 0, Math.PI * 2); cx.fill();
  }
  cx.globalAlpha = 1;
}
const FIRE = ['#fff2b0', '#ffc94d', '#ff8a1a', '#ff4d1a', '#e8132d'];
const PARTY = ['#ffd166', '#ff6b6b', '#ff9de2', '#ffffff', '#ff8a1a', '#7ee8ff'];

// ---------- render the whole page at time t ----------
function render(t) {
  if (!sol) return;
  const s = t - T0;
  // typing (capture only)
  if (CAP) {
    const ia = $('a'), ib = $('b');
    ia.value = DEMO.a.slice(0, Math.round(clamp(t / 0.45) * DEMO.a.length));
    ib.value = DEMO.b.slice(0, Math.round(clamp((t - 0.5) / 0.45) * DEMO.b.length));
    ia.classList.toggle('typing', t < 0.48); ib.classList.toggle('typing', t >= 0.48 && t < 1.0);
    const pr = t > 0.98 && t < 1.16 ? 0.95 : 1; $('go').style.transform = `scale(${pr})`;
    const st = $('stage'), y = (st.offsetTop - 215) * ease((s + 0.15) / 0.5);
    $('app').style.transform = `translateY(${-Math.max(0, y)}px)`;
  }
  const np = sol.pairs.length, n = sol.n;
  // status line
  let msg = 'Write two names ✍️';
  if (s >= 0) msg = np ? 'Cutting common letters ✂️' : 'No common letters 😮';
  if (s >= P.sC) msg = n ? `${n} letters left → count ${n} 👉` : 'Same letters… 🤨';
  if (n && s >= P.sF + 0.3) msg = 'F-L-A-M-E-S… burning 🔥';
  if (s >= P.sR) msg = 'Result 👇';
  $('status').textContent = msg;
  // tiles
  const all = [...tiles.A, ...tiles.B];
  all.forEach((el, i) => {
    const p = back((s - 0.03 - i * 0.025) / 0.25);
    el.style.opacity = clamp(p * 1.5); el.style.transform = `translateY(${(1 - p) * 10}px) scale(${0.6 + 0.4 * p})`;
    el.style.color = '#1d2a7a';
  });
  sol.pairs.forEach(([i, j], k) => {
    const p = ease((s - P.strikes[k]) / 0.28);
    [tiles.A[i], tiles.B[j]].forEach(el => {
      el.querySelector('.st').style.transform = `rotate(-14deg) scaleX(${p})`;
      if (p > 0.5) el.style.color = '#a7aecb';
    });
  });
  tiles.left.forEach((el, k) => {
    const p = back((s - P.sC - k * P.cStep) / 0.22);
    const no = el.querySelector('.no'); no.style.opacity = clamp(p * 1.4); no.style.transform = `scale(${p})`;
  });
  const shown = tiles.left.filter((_, k) => s >= P.sC + k * P.cStep).length;
  const cp = back((s - P.sC) / 0.3);
  $('count').style.opacity = clamp(cp * 1.4); $('count').style.transform = `translateX(${(1 - clamp(cp)) * -14}px)`;
  $('cn').textContent = shown;
  const fp = back((s - P.sF) / 0.35);
  $('flames').style.opacity = clamp(fp * 1.4); $('flames').style.transform = `translateY(${(1 - fp) * 18}px) scale(${0.85 + 0.15 * fp})`;
  // FLAMES letters
  fl6.forEach((el, li) => {
    const R = P.rounds.find(r => r.removed === li);
    const ring = el.querySelector('.ring'), hn = el.querySelector('.hn'), x = el.querySelector('.x');
    ring.style.opacity = 0; hn.style.opacity = 0;
    let sc = 1, op = 1, bg = '', filt = '';
    x.style.opacity = 0;
    if (R && s >= R.tBurn) {
      const p = (s - R.tBurn) / 0.38;
      if (p < 1) { sc = 1 + 0.32 * Math.sin(Math.PI * clamp(p)); bg = `linear-gradient(180deg,#ffe08a,#ff7a1a ${40 + 40 * p}%,#c4001f)`; filt = `drop-shadow(0 0 ${14 * (1 - p) + 4}px rgba(255,110,20,.9))`; }
      else { sc = 0.9; op = 0.38; filt = 'grayscale(1)'; x.style.opacity = 1; }
    }
    if (li === sol.survivor && s >= P.sR) { const q = back((s - P.sR) / 0.3); sc = 1 + 0.25 * q; bg = 'linear-gradient(180deg,#fff3c4,#ffb020)'; filt = 'drop-shadow(0 0 18px rgba(255,180,40,.95))'; }
    el.style.transform = `scale(${sc})`; el.style.opacity = op; el.style.background = bg; el.style.filter = filt;
    el.style.zIndex = sc > 1 ? 2 : 1;
  });
  const Rn = P.rounds.find(r => s >= r.t0 && s < r.tBurn + 0.05);
  if (Rn) {
    const k = Math.min(n - 1, Math.floor((s - Rn.t0) / Rn.hop));
    const li = Rn.list[(Rn.start + k) % Rn.list.length], el = fl6[li];
    el.querySelector('.ring').style.opacity = 1;
    const hn = el.querySelector('.hn'); hn.style.opacity = 1; hn.textContent = k + 1;
  }
  // result card
  const rp = back((s - P.sCard) / 0.45), rv = clamp((s - P.sCard) / 0.2);
  const res = $('result'); res.style.opacity = rv; res.style.background = `rgba(20,2,2,${0.6 * rv})`;
  res.classList.toggle('on', rv > 0.5);
  $('rcard').style.transform = `scale(${0.5 + 0.5 * rp}) rotate(${(1 - clamp(rp)) * -6}deg)`;
  $('remo').style.transform = `scale(${1 + 0.15 * Math.sin(Math.max(0, s - P.sCard) * 6)})`;
  // particles
  cx.clearRect(0, 0, innerWidth, innerHeight);
  P.rounds.forEach((r, k) => { const [x, y] = center(fl6[r.removed]); burst(x, y, s - r.tBurn, 11 + k * 31, 26, 120, FIRE, 0.75); });
  if (n) { const [x, y] = center($('remo')); burst(x, y, s - P.sCard, 999, 80, 330, PARTY, 1.3); burst(x, y, s - P.sCard - 0.12, 555, 40, 200, FIRE, 1.0); }
}
window.__render = render;

// ---------- live mode ----------
let raf = 0, startAt = 0;
function play(fromTop) {
  cancelAnimationFrame(raf);
  startAt = performance.now();
  const loop = () => { const t = (performance.now() - startAt) / 1000; render(t); if (t < P.total + 0.2) raf = requestAnimationFrame(loop); };
  loop();
  const st = $('stage');
  if (!fromTop) window.scrollTo({ top: st.getBoundingClientRect().top + scrollY - 12, behavior: 'smooth' });
}
function toast(m) { const e = $('toast'); e.textContent = m; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 2200); }
function go() {
  const a = $('a').value, b = $('b').value;
  if (!clean(a) || !clean(b)) { toast('Dono naam likho ✍️ (English letters)'); (!clean(a) ? $('a') : $('b')).focus(); return; }
  document.activeElement && document.activeElement.blur();
  build(a, b);
  const u = new URL(location.href); u.searchParams.set('a', names.a); u.searchParams.set('b', names.b); history.replaceState(null, '', u);
  play(false);
}
$('go').addEventListener('click', go);
$('a').addEventListener('keydown', e => { if (e.key === 'Enter') $('b').focus(); });
$('b').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
$('again').addEventListener('click', () => {
  cancelAnimationFrame(raf); render(-1); $('result').classList.remove('on');
  $('b').value = ''; window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => $('b').focus(), 350);
});
$('share').addEventListener('click', async () => {
  const u = new URL(location.origin + location.pathname); u.searchParams.set('a', names.a); u.searchParams.set('b', names.b);
  const r = sol.result ? INFO[sol.result] : null;
  const text = r ? `FLAMES says ${names.a} ❤️ ${names.b} = ${r.w} ${r.e} 😂 Check yours 👉` : 'Check your FLAMES 🔥';
  try { if (navigator.share) { await navigator.share({ title: 'FLAMES 🔥', text, url: u.href }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(`${text} ${u.href}`); toast('Link copied ✅ send it!'); }
  catch (e) { prompt('Copy this link:', u.href); }
});

// ---------- boot ----------
if (CAP) { build(DEMO.a, DEMO.b); }
else {
  const a = qs.get('a'), b = qs.get('b');
  if (a) $('a').value = a; if (b) $('b').value = b;
  if (a && b && clean(a) && clean(b)) setTimeout(go, 500);
  else { build('', ''); render(-1); }
}
if (CAP) { render(0); window.__T_END = T0 + P.total; window.__T0 = T0; window.__P = P; window.__sol = sol; }
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (CAP) render(0); window.__ready = true; });
})();
