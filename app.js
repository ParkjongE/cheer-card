/* 과몰입 응원단 — 서버 없이 브라우저에서만 돌아가요. 쓴 글은 주소의 # 뒤에만 담겨요. */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  var CANCEL = {};

  /* ───────── 문구 ───────── */
  var EXAMPLES = ['내일 면접', '월요일 출근', '기말고사', '다이어트 3일차', '이불 밖으로 나가기', '첫 소개팅'];
  var CHANTS = [
    '{t} 뿌셔!', '할 수 있다!', '가즈아아아!', '{t} 별거 아니다!', '너는 된다!', '이미 됐다!',
    '{t} 나와!', '우리가 있다!', '쫄지 마!', '{t} 긴장해라!', '천재 등장!', '전설의 시작!',
    '숨만 쉬어도 잘한다!', '필승!', '{t} 씹어 먹어!', '오늘의 주인공!', '될 놈은 된다!', '어차피 우승!',
    '{t} 접수!', '눈 감고도 한다!', '화! 이! 팅!', '믿는다!', '사랑한다!', '지금이 전성기!',
    '한계 따위 없다!', '기립 박수!', '울지 마 내가 운다!', '{t}{이가} 너를 무서워한다!',
    '태어나길 잘했다!', '존재가 응원이다!', '{t} 그까짓 거!', '끝나고 맛있는 거 먹자!'
  ];
  var HEADS = [
    '[속보] 「{t}」, 성공 확정적',
    '[긴급] 「{t}」 측 "솔직히 무섭다"',
    '[속보] 응원단 규모, 집계 장비 한계 돌파',
    '[단독] 옆집 강아지도 응원 동참',
    '[속보] 전국 박수 소리에 지진계 흔들려',
    '[날씨] 오늘 전국에 응원 폭우',
    '[경제] 응원봉 전국 품절',
    '[단독] 달에서도 함성 관측',
    '[속보] 「{t}」{을를} 앞둔 당신, 이미 이긴 것으로 밝혀져',
    '[긴급] 응원단장 실신… 일어나서 다시 응원',
    '[속보] 외계 문명 "우리도 응원한다" 신호 보내',
    '[사회] 응원 소음 민원 0건, 민원인도 응원 중',
    '[속보] 꽃가루 재고 바닥',
    '[단독] 응원단, 목이 쉬었지만 계속하기로',
    '[속보] 「{t}」 응원 열기에 겨울 취소'
  ];
  var ENCORE_LINES = [
    '아직 부족했나요? 더 했어요.',
    '응원단 목이 쉬었어요. 그래도 해요.',
    '이쯤 되면 민폐예요. 계속해요.',
    '응원단장이 쓰러졌다가 다시 일어났어요.',
    '옆 우주에서 항의가 들어왔어요.',
    '이제 그만 가서 「{t}」 하세요. 진짜 화이팅.'
  ];
  var ENCORE_BTN = ['더 응원해', '더더 응원해', '아직 멀었어, 더', '응원단 살려… (더)', '끝까지 가 보자', '우주 끝까지 더'];
  var REPLIES = ['고마워, 힘낼게!', '덕분에 살았다', '너도 화이팅!', '시끄러워… 근데 고마워', '울었다 진짜'];
  var THANKS = ['응원 성공!', '통했다!', '감동이야!', '응원단 보람 있다!', '울어도 돼!', '고맙대!', '해냈다!', '응원한 보람!'];
  var UNITS = ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극', '항하사', '아승기', '나유타', '불가사의', '무량대수'];

  function josa(w, a, b) {
    var c = w.charCodeAt(w.length - 1);
    if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 ? a : b;
    return b;
  }
  /* 보내는 링크는 누구나 열 수 있는 공개 주소로 만들어요. 글은 # 뒤에만 붙어서 그 서버로도 전송되지 않아요. */
  var PUBLIC_URL = 'https://parkjonge.github.io/cheer-card/';
  var T = '오늘 하루', L = 2, R = '';
  function fill(tpl) {
    return tpl.replace(/\{t\}(?:\{(.)(.)\})?/g, function (m, a, b) { return a ? T + josa(T, a, b) : T; });
  }

  /* ───────── 링크에 담기 ───────── */
  function enc(o) {
    var bytes = new TextEncoder().encode(JSON.stringify(o)), s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function dec(s) {
    try {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      var bin = atob(s), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var o = JSON.parse(new TextDecoder().decode(bytes));
      if (!o || typeof o.t !== 'string') return null;
      var t = o.t.replace(/\s+/g, ' ').trim().slice(0, 30);
      var r = typeof o.r === 'string' ? o.r.replace(/\s+/g, ' ').trim().slice(0, 30) : '';
      return { t: t || '오늘 하루', l: Math.min(3, Math.max(1, parseInt(o.l, 10) || 2)), r: r };
    } catch (e) { return null; }
  }

  /* ───────── 소리 (전부 직접 합성) ───────── */
  var AC = null, master = null, muted = false, noise = null;
  function audio() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return AC; }
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try {
      AC = new C();
      master = AC.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(AC.destination);
      noise = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
      var d = noise.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { AC = null; }
    return AC;
  }
  function drum(delay, pow) {
    if (!AC) return;
    var t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(42, t + .22);
    g.gain.setValueAtTime(pow || 1, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + .32);
  }
  function burst(delay, dur, freq, vol, q) {
    if (!AC) return;
    var t = AC.currentTime + (delay || 0), s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = noise; s.loop = true;
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || .7;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.25, dur * .3));
    g.gain.setValueAtTime(vol, t + dur * .6);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + .05);
  }
  function roar(dur, vol) { burst(0, dur, 900, vol || .5, .5); burst(.05, dur, 2200, (vol || .5) * .35, .8); }
  function clap(delay) { burst(delay, .07, 1800, .5, 1.2); }
  function tone(delay, freq, dur, type, vol, to) {
    if (!AC) return;
    var t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.linearRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol || .12, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
  }
  function fanfare() { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(i * .11, f, .16, 'square', .1); }); }
  function whistle() { tone(0, 1900, .18, 'sine', .14, 2700); tone(.2, 1900, .32, 'sine', .14, 2900); }
  /* 옹알이 목소리: 글자마다 모음에 맞춘 소리를 직접 합성해요 (녹음 · 음성 엔진 없음) */
  var voiceBus = null;
  var FORM = { a: [1000, 1500], ae: [760, 2300], eo: [720, 1250], e: [600, 2500], o: [520, 950], u: [420, 1000], eu: [450, 1700], i: [380, 2900] };
  var JUNG = ['a', 'ae', 'a', 'ae', 'eo', 'e', 'eo', 'e', 'o', 'a', 'ae', 'e', 'o', 'u', 'eo', 'e', 'i', 'u', 'eu', 'i', 'i'];
  function say(text, o) {
    if (!AC || muted) return;
    o = o || {};
    if (!voiceBus) { voiceBus = AC.createGain(); voiceBus.connect(master); }
    var bus = voiceBus, n = o.n || 1, f0 = o.f0 || 560, step = .085 / (o.rate || 1), chars = Array.from(text);
    var vol = (o.vol || .5) / Math.sqrt(n);
    for (var v = 0; v < n; v++) (function (v) {
      var t = AC.currentTime + .03 + v * rnd(.01, .04), base = f0 * [1, 1.26, .84, 1.5, .67, 1.12][v % 6];
      chars.forEach(function (ch, i) {
        var c = ch.charCodeAt(0), vow;
        if (c >= 0xac00 && c <= 0xd7a3) vow = JUNG[Math.floor(((c - 0xac00) % 588) / 28)];
        else if (/[a-z0-9]/i.test(ch)) vow = 'a';
        else { t += (ch === ' ' ? .7 : 1.1) * step; return; }
        var last = i === chars.length - 1 || !/[가-힣a-z0-9]/i.test(chars[i + 1]);
        var dur = step * (last ? 2.1 : 1), f = base * rnd(.94, 1.08), F = FORM[vow];
        var osc = AC.createOscillator(), g = AC.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(f * .92, t);
        osc.frequency.exponentialRampToValueAtTime(f * (last ? 1.35 : 1.06), t + dur);
        F.forEach(function (fq, k) {
          var bp = AC.createBiquadFilter(), gg = AC.createGain();
          bp.type = 'bandpass'; bp.frequency.value = fq * 1.15; bp.Q.value = 5; gg.gain.value = k ? .7 : 1;
          osc.connect(bp); bp.connect(gg); gg.connect(g);
        });
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012);
        g.gain.exponentialRampToValueAtTime(.0001, t + dur * .95);
        g.connect(bus); osc.start(t); osc.stop(t + dur);
        t += dur * .92;
      });
    })(v);
  }
  function hush() {
    if (!voiceBus || !AC) return;
    var b = voiceBus; voiceBus = null;
    try { b.gain.setTargetAtTime(0, AC.currentTime, .02); } catch (e) {}
    setTimeout(function () { try { b.disconnect(); } catch (e) {} }, 250);
  }
  function buzz(p) { try { if (!muted && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

  /* ───────── 꽃가루 · 폭죽 · 별 ───────── */
  var cv = $('#fx'), cx = cv.getContext('2d'), W = 0, H = 0, P = [], stars = [], warp = 0;
  var COLORS = ['#ffe100', '#ff2b2b', '#1e5bff', '#ff4fa3', '#19c37d', '#ffffff', '#ff8a00'];
  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize); resize();
  function confetti(x, y, n, power) {
    if (REDUCE) n = Math.ceil(n / 4);
    for (var i = 0; i < n && P.length < 1400; i++) {
      var a = rnd(0, Math.PI * 2), v = rnd(.3, 1) * (power || 14);
      P.push({ k: 0, x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * .5, g: .32, w: rnd(6, 14), h: rnd(4, 9), r: rnd(0, 6), vr: rnd(-.4, .4), c: pick(COLORS), life: rnd(90, 170) });
    }
  }
  function rain(n) {
    for (var i = 0; i < n && P.length < 1400; i++) {
      P.push({ k: 0, x: rnd(0, W), y: rnd(-H * .4, -10), vx: rnd(-2, 2), vy: rnd(2, 7), g: .08, w: rnd(6, 14), h: rnd(4, 9), r: rnd(0, 6), vr: rnd(-.3, .3), c: pick(COLORS), life: rnd(140, 240) });
    }
  }
  function hearts(n) {
    if (REDUCE) n = Math.ceil(n / 3);
    for (var i = 0; i < n && P.length < 1400; i++) {
      P.push({ k: 2, x: rnd(0, W), y: rnd(-H * .5, -10), vx: rnd(-1.5, 1.5), vy: rnd(2, 6), g: .04, w: rnd(9, 22), r: rnd(-.5, .5), vr: rnd(-.03, .03), c: pick(['#ff2b6b', '#ff6f96', '#ffffff', '#ffe100']), life: rnd(170, 260) });
    }
  }
  function firework(x, y) {
    var c = pick(COLORS), n = REDUCE ? 14 : 46;
    for (var i = 0; i < n && P.length < 1400; i++) {
      var a = (i / n) * Math.PI * 2, v = rnd(3, 9);
      P.push({ k: 1, x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .06, w: rnd(2, 4.5), c: c, life: rnd(40, 75) });
    }
  }
  function initStars() {
    stars = [];
    for (var i = 0; i < 240; i++) stars.push({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(.05, 1) });
  }
  initStars();
  function frame() {
    cx.clearRect(0, 0, W, H);
    if (warp > 0) {
      cx.lineCap = 'round';
      for (var s = 0; s < stars.length; s++) {
        var st = stars[s], pz = st.z;
        st.z -= .004 * warp;
        if (st.z <= .02) { st.x = rnd(-1, 1); st.y = rnd(-1, 1); st.z = 1; pz = 1; }
        var x0 = W / 2 + st.x / pz * W * .5, y0 = H / 2 + st.y / pz * H * .5;
        var x1 = W / 2 + st.x / st.z * W * .5, y1 = H / 2 + st.y / st.z * H * .5;
        cx.strokeStyle = 'rgba(255,255,255,' + Math.min(1, 1.1 - st.z) + ')';
        cx.lineWidth = Math.max(.6, (1 - st.z) * 3);
        cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1 + .1, y1 + .1); cx.stroke();
      }
    }
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life--;
      if (p.k === 2) {
        p.r += p.vr; var hs = p.w / 16;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(hs, hs);
        cx.globalAlpha = Math.min(1, p.life / 30); cx.fillStyle = p.c;
        cx.beginPath(); cx.moveTo(0, 9); cx.bezierCurveTo(-20, -5, -9, -19, 0, -8); cx.bezierCurveTo(9, -19, 20, -5, 0, 9); cx.fill();
        cx.restore();
      } else if (p.k === 0) {
        p.vx *= .985; p.r += p.vr;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
        cx.globalAlpha = Math.min(1, p.life / 30); cx.fillStyle = p.c;
        cx.fillRect(-p.w / 2, -p.h / 2 * Math.cos(p.r * 2), p.w, p.h * Math.cos(p.r * 2));
        cx.restore();
      } else {
        p.vx *= .96; p.vy *= .96;
        cx.globalAlpha = Math.max(0, Math.min(1, p.life / 30)); cx.fillStyle = p.c;
        cx.beginPath(); cx.arc(p.x, p.y, p.w, 0, 6.3); cx.fill(); cx.globalAlpha = 1;
      }
      if (p.life <= 0 || p.y > H + 40) P.splice(i, 1);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ───────── 화면 부품 ───────── */
  var world = $('#world'), shaker = $('#shaker'), squad = $('#squad'), shouts = $('#shouts'), heads = $('#heads');
  var titleEl = $('#title'), counter = $('#counter'), countEl = $('#count'), ticker = $('#ticker');
  var envelope = $('#envelope'), polite = $('#polite'), finale = $('#finale'), spaceText = $('#spaceText');
  var rimfans = $('#rimfans'), here = $('#here'), tapHint = $('#tapHint'), GL = false, live = false, taps = 0, lastTap = 0;
  var run = 0, shakeTimer = 0, count = 1, countRaf = 0, encore = 0, busy = false;

  function wait(ms, id) {
    return new Promise(function (res, rej) { setTimeout(function () { id === run ? res() : rej(CANCEL); }, ms); });
  }
  function shake(px, ms) {
    if (REDUCE) return;
    shaker.style.setProperty('--sh', px + 'px'); shaker.classList.add('shake');
    clearTimeout(shakeTimer); shakeTimer = setTimeout(function () { shaker.classList.remove('shake'); }, ms);
  }
  function bg(c) { world.classList.remove('bg-p', 'bg-b', 'bg-r'); if (c) world.classList.add('bg-' + c); }

  function fmt(v) {
    if (v < 1e4) return Math.floor(v).toLocaleString('ko-KR') + ' 명';
    var k = Math.min(UNITS.length - 1, Math.floor(Math.log10(v) / 4));
    var head = Math.floor(v / Math.pow(10, k * 4));
    if (head >= 1e4) return '무량대수 × ' + Math.floor(head / 1e4).toLocaleString('ko-KR') + ' 명';
    return head.toLocaleString('ko-KR') + UNITS[k] + ' 명';
  }
  function countTo(target, ms) {
    cancelAnimationFrame(countRaf);
    var from = Math.log(Math.max(1, count)), to = Math.log(target), t0 = performance.now();
    counter.classList.add('pop');
    (function step(now) {
      var k = Math.min(1, (now - t0) / ms);
      count = Math.exp(from + (to - from) * k); countEl.textContent = fmt(count);
      if (k < 1) countRaf = requestAnimationFrame(step); else counter.classList.remove('pop');
    })(t0);
  }

  var FAN_COLORS = ['#ffd23f', '#ff8fb1', '#7cc6ff', '#8ee06b', '#c7a6ff', '#ff9f5a', '#ffffff', '#6fe3d4'];
  var K = '#231815';
  function pom(cx, cy, fill) {
    var s = '';
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * 6.283;
      s += '<circle cx="' + (cx + Math.cos(a) * 12).toFixed(1) + '" cy="' + (cy + Math.sin(a) * 12).toFixed(1) + '" r="9.5" fill="' + fill + '" stroke="' + K + '" stroke-width="3"/>';
    }
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="' + fill + '"/><circle cx="' + (cx - 5) + '" cy="' + (cy - 6) + '" r="4" fill="#fff" opacity=".7"/>';
  }
  /* 이모티콘풍 응원단원: 귀 · 눈 모양이 번갈아 나와요 */
  function fanSVG(color, kind) {
    var st = ' stroke="' + K + '" stroke-linecap="round" stroke-linejoin="round"';
    var shine = '<circle cx="-3.5" cy="-3.5" r="3.6" fill="#fff"/><circle cx="3.2" cy="3.4" r="1.8" fill="#fff"/>';
    var bigEyes = '<g transform="translate(43 102)"><circle r="10.5" fill="' + K + '"/>' + shine + '</g><g transform="translate(77 102)"><circle r="10.5" fill="' + K + '"/>' + shine + '</g>';
    var eyes = [
      '<path d="M35 95l14 7-14 7M85 95l-14 7 14 7" fill="none" stroke-width="5.5"' + st + '/>',
      bigEyes,
      '<path d="M34 106q9-15 18 0M68 106q9-15 18 0" fill="none" stroke-width="5.5"' + st + '/>',
      bigEyes + '<path class="tear" d="M40 114q-6 16-3 34M80 114q6 16 3 34" fill="none" stroke="#5cc8ff" stroke-width="7" stroke-linecap="round"/>',
      bigEyes + '<path d="M30 86l20 7M90 86l-20 7" fill="none" stroke-width="5.5"' + st + '/>'
    ][kind % 5];
    var ears = [
      '',
      '<path d="M30 80L24 42l28 18zM90 80l6-38-28 18z" fill="' + color + '" stroke-width="5"' + st + '/><path d="M32 66l-2-14 10 7zM88 66l2-14-10 7z" fill="#ff9db5"/>',
      '<ellipse cx="42" cy="42" rx="10" ry="25" fill="' + color + '" stroke-width="5"' + st + '/><ellipse cx="78" cy="42" rx="10" ry="25" fill="' + color + '" stroke-width="5"' + st + '/><ellipse cx="42" cy="44" rx="4" ry="15" fill="#ff9db5"/><ellipse cx="78" cy="44" rx="4" ry="15" fill="#ff9db5"/>',
      '<circle cx="32" cy="64" r="13" fill="' + color + '" stroke-width="5"' + st + '/><circle cx="88" cy="64" r="13" fill="' + color + '" stroke-width="5"' + st + '/><circle cx="32" cy="64" r="6" fill="#ff9db5"/><circle cx="88" cy="64" r="6" fill="#ff9db5"/>'
    ][Math.floor(kind / 2) % 4];
    return '<svg viewBox="-26 12 172 160" aria-hidden="true">' +
      '<ellipse cx="60" cy="161" rx="42" ry="7" fill="#000" opacity=".18"/>' +
      '<g class="arm al"><path d="M24 112L2 64" stroke-width="13"' + st + '/><path d="M24 112L2 64" stroke="' + color + '" stroke-width="7" stroke-linecap="round"/>' + pom(0, 48, '#ffe100') + '</g>' +
      '<g class="arm ar"><path d="M96 112L118 64" stroke-width="13"' + st + '/><path d="M96 112L118 64" stroke="' + color + '" stroke-width="7" stroke-linecap="round"/>' + pom(120, 48, '#ff4b4b') + '</g>' +
      ears +
      '<ellipse cx="44" cy="158" rx="12" ry="7" fill="' + color + '" stroke-width="5"' + st + '/><ellipse cx="76" cy="158" rx="12" ry="7" fill="' + color + '" stroke-width="5"' + st + '/>' +
      '<path d="M24 150C12 108 16 58 60 56c44 2 48 52 36 94-4 12-68 12-72 0z" fill="' + color + '" stroke-width="6"' + st + '/>' +
      '<g clip-path="url(#fc)"><ellipse cx="42" cy="78" rx="24" ry="15" fill="#fff" opacity=".42" transform="rotate(-24 42 78)"/><ellipse cx="60" cy="140" rx="26" ry="20" fill="#fff" opacity=".3"/><path d="M96 70c18 40 8 84-40 92h60V70z" fill="#000" opacity=".1"/></g>' +
      '<path d="M21 81Q60 66 99 81l-1 12Q60 78 22 93z" fill="#fff" stroke-width="4"' + st + '/><path d="M98 84l17-7-5 11zM98 89l14 9-11 1z" fill="#fff" stroke-width="3.5"' + st + '/>' +
      '<text x="60" y="84.5" text-anchor="middle" font-size="10.5" font-weight="900" fill="#ff2b2b">필승</text>' +
      eyes +
      '<ellipse cx="29" cy="116" rx="8.5" ry="5.5" fill="#ff6f96" opacity=".75"/><ellipse cx="91" cy="116" rx="8.5" ry="5.5" fill="#ff6f96" opacity=".75"/>' +
      '<path d="M46 115q14-5 28 0q2 24-14 24t-14-24z" fill="#5a1220" stroke-width="3.5"' + st + '/><path d="M49 115.5q11-3.5 22 0l-1 5q-10-2.5-20 0z" fill="#fff"/><ellipse cx="60" cy="133" rx="8.5" ry="5" fill="#ff6b81"/>' +
      '</svg>';
  }
  var fanN = 0;
  function addFan(mode, signText) {
    var el = document.createElement('div'), b = document.createElement('div');
    el.className = 'fan'; b.className = 'fan-b';
    b.innerHTML = fanSVG(pick(FAN_COLORS), fanN++);
    b.style.animationDuration = rnd(.26, .46) + 's'; b.style.animationDelay = -rnd(0, .4) + 's';
    var end = 'none', fromX, fromY;
    if (mode === 'peek') {
      var left = Math.random() < .5;
      el.classList.add('peek');
      el.style.bottom = rnd(-8, 12) + '%'; el.style[left ? 'left' : 'right'] = '-14vmin';
      end = 'rotate(' + (left ? 16 : -16) + 'deg)'; el.style.transform = end;
      fromX = (left ? -1 : 1) * W * .6; fromY = H * .3;
      b.style.setProperty('--j', 30);
    } else if (mode === 'top') {
      el.classList.add('top'); end = 'rotate(180deg)';
      el.style.top = '-3%'; el.style.left = rnd(4, 82) + '%';
      fromX = 0; fromY = -H * .5;
    } else {
      var tier = Math.floor(rnd(0, 3));
      el.style.left = rnd(-3, 90) + '%'; el.style.bottom = ([-3, 9, 21][tier] + rnd(-2, 3)) + '%';
      el.style.zIndex = 4 - tier;
      b.style.setProperty('--s', [1.25, 1, .78][tier]); b.style.setProperty('--j', rnd(12, 34) | 0);
      var side = Math.floor(rnd(0, 3));
      fromX = side === 0 ? -W * .7 : side === 1 ? W * .7 : rnd(-80, 80); fromY = side === 2 ? H * .8 : rnd(-H * .3, H * .2);
      if (mode === 'sign') {
        var sg = document.createElement('div'); sg.className = 'sign'; sg.textContent = signText || T + ' 화이팅'; b.appendChild(sg);
      }
    }
    el.appendChild(b); squad.appendChild(el);
    if (el.animate && !REDUCE) {
      el.animate([
        { transform: 'translate(' + fromX + 'px,' + fromY + 'px) rotate(' + rnd(-200, 200) + 'deg) scale(.3)' },
        { transform: end }
      ], { duration: rnd(420, 720), easing: 'cubic-bezier(.2,1.5,.4,1)' });
    }
    if (squad.children.length > 110) squad.removeChild(squad.firstChild);
  }

  /* 화면 밖으로 튀어나오는 글자 */
  function shout(text, o) {
    o = o || {};
    var el = document.createElement('div');
    el.className = 'shout c' + (o.c == null ? Math.floor(rnd(0, 4)) : o.c);
    el.textContent = text;
    var size = o.size || rnd(6, 11);
    el.style.fontSize = 'clamp(18px,' + size + 'vmin,' + (size * 14) + 'px)';
    shouts.appendChild(el);
    var w = el.offsetWidth, h = el.offsetHeight;
    var fit = Math.min(1, (W * .94) / w);
    var x = o.center ? (W - w) / 2 : rnd(-w * .1, Math.max(0, W - w * .9));
    var y = o.center ? (H - h) / 2 + (o.dy || 0) : rnd(H * .12, H * .72);
    if (o.at) { x = Math.max(4, Math.min(W - w - 4, o.at[0] - w / 2)); y = Math.max(4, o.at[1] - h * 1.4); }
    el.style.left = x + 'px'; el.style.top = y + 'px';
    var rot = o.center ? rnd(-4, 4) : rnd(-16, 16), hold = o.hold || 700;
    if (!el.animate) { setTimeout(function () { el.remove(); }, hold + 400); return el; }
    var total = 260 + hold + 380;
    var a = el.animate(REDUCE ? [
      { opacity: 0, transform: 'scale(' + fit + ')' }, { opacity: 1, transform: 'scale(' + fit + ')', offset: .2 },
      { opacity: 1, transform: 'scale(' + fit + ')', offset: .8 }, { opacity: 0, transform: 'scale(' + fit + ')' }
    ] : [
      { opacity: 0, transform: 'scale(.05) rotate(' + (rot - 40) + 'deg)', offset: 0 },
      { opacity: 1, transform: 'scale(' + fit * 1.35 + ') rotate(' + rot + 'deg)', offset: 180 / total },
      { opacity: 1, transform: 'scale(' + fit + ') rotate(' + rot + 'deg)', offset: 260 / total },
      { opacity: 1, transform: 'scale(' + fit * 1.06 + ') rotate(' + (rot + 1.5) + 'deg)', offset: (260 + hold) / total },
      { opacity: 0, transform: 'scale(' + fit * 7 + ') rotate(' + (rot + 6) + 'deg)', offset: 1 }
    ], { duration: total, easing: 'cubic-bezier(.3,.9,.4,1)' });
    a.onfinish = function () { el.remove(); };
    return el;
  }
  function chant(o) { return shout(fill(pick(CHANTS)), o); }

  function headline(text) {
    var el = document.createElement('div'), sp = document.createElement('span');
    el.className = 'head'; sp.textContent = text; el.appendChild(sp); heads.appendChild(el);
    var w = el.offsetWidth;
    el.style.left = rnd(W * .03, Math.max(W * .03, W * .97 - w)) + 'px';
    el.style.top = rnd(30, 58) + '%';
    var rot = rnd(-5, 5);
    el.style.transform = 'rotate(' + rot + 'deg)';
    if (el.animate && !REDUCE) el.animate([{ transform: 'scale(4) rotate(' + (rot + 20) + 'deg)', opacity: 0 }, { transform: 'scale(1) rotate(' + rot + 'deg)', opacity: 1 }], { duration: 230, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    drum(0, .9); shake(7, 220);
    while (heads.children.length > 3) heads.removeChild(heads.firstChild);
  }

  function setTitle(text) {
    titleEl.textContent = ''; titleEl.className = Array.from(text).length > 8 ? 'long' : '';
    Array.from(text).forEach(function (ch, i) {
      var s = document.createElement('span'); s.textContent = ch; titleEl.appendChild(s);
      if (s.animate && !REDUCE) s.animate([
        { transform: 'scale(9) rotate(' + rnd(-60, 60) + 'deg)', opacity: 0 },
        { transform: 'scale(.8) rotate(0)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }
      ], { duration: 420, delay: i * 70, fill: 'backwards', easing: 'cubic-bezier(.3,.8,.4,1)' });
      setTimeout(function () { drum(0, .8); }, i * 70 + 280);
    });
  }

  /* 은하 그림 한 번만 그리기 */
  (function () {
    var g = $('#galaxyCv'), c = g.getContext('2d'), R = 450;
    function arm(r, a) { return Math.log(Math.max(r, 26) / 26) * 2.5 + a * Math.PI; }
    function blob(x, y, r, col) {
      var gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    c.globalCompositeOperation = 'lighter';
    var i, r, th;
    for (i = 0; i < 520; i++) {
      r = rnd(40, 425); th = arm(r, i % 2) + rnd(-.3, .3);
      blob(R + Math.cos(th) * r, R + Math.sin(th) * r, rnd(20, 64), i % 5 ? 'rgba(70,110,255,.06)' : 'rgba(255,110,190,.05)');
    }
    for (i = 0; i < 11000; i++) {
      r = Math.pow(Math.random(), .62) * 435; th = arm(r, i % 2) + rnd(-.6, .6) * Math.random() * (i % 4 === 0 ? 2.4 : 1);
      c.fillStyle = pick(['rgba(255,255,255,', 'rgba(175,205,255,', 'rgba(175,205,255,', 'rgba(255,225,170,']) + rnd(.2, .9) + ')';
      c.beginPath(); c.arc(R + Math.cos(th) * r, R + Math.sin(th) * r, rnd(.35, 1.5), 0, 6.3); c.fill();
    }
    for (i = 0; i < 150; i++) {
      r = rnd(70, 400); th = arm(r, i % 2) + rnd(-.12, .12);
      blob(R + Math.cos(th) * r, R + Math.sin(th) * r, rnd(3, 8), 'rgba(255,90,150,.8)');
    }
    blob(R, R, 190, 'rgba(255,225,170,.85)'); blob(R, R, 70, 'rgba(255,252,235,1)');
    var rim = $('#rim');
    for (var k = 0; k < 18; k++) { var d = document.createElement('i'); d.style.transform = 'rotate(' + k * 20 + 'deg) translateY(-760%)'; rim.appendChild(d); }
  })();

  (function () {
    for (var k = 0; k < 16; k++) {
      var el = document.createElement('div'), b = document.createElement('div');
      el.className = 'fan'; b.className = 'fan-b';
      b.innerHTML = fanSVG(FAN_COLORS[k % FAN_COLORS.length], k);
      b.style.animationDuration = rnd(.26, .42) + 's'; b.style.animationDelay = -rnd(0, .4) + 's'; b.style.setProperty('--j', 10);
      el.style.transform = 'rotate(' + (k * 22.5) + 'deg) translateY(-34.4vmin)';
      el.appendChild(b); rimfans.appendChild(el);
    }
    if (window.Space) Space.onFrame = function () {
      var e = Space.earthScreen;
      if (e) here.style.transform = 'translate(' + e.x.toFixed(1) + 'px,' + (e.y - e.r - 12).toFixed(1) + 'px) translate(-50%,-100%)';
    };
  })();

  function spaceShow(id) {
    ['#earth', '#solar', '#galaxy'].forEach(function (s) {
      var e = $(s);
      if (s === id) { e.classList.remove('away'); e.classList.add('show'); }
      else if (e.classList.contains('show')) { e.classList.remove('show'); e.classList.add('away'); }
    });
  }
  function spaceSay(text, big) {
    spaceText.className = big ? 'big' : ''; spaceText.textContent = text;
    if (spaceText.animate && !REDUCE) spaceText.animate([{ transform: (big ? 'translateY(-50%) ' : '') + 'scale(.2)', opacity: 0 }, { transform: (big ? 'translateY(-50%) ' : '') + 'scale(1)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,1.6,.4,1)' });
  }

  function resetCard() {
    hush(); cancelAnimationFrame(countRaf); P.length = 0; warp = 0; count = 1; encore = 0; busy = false; fanN = 0;
    squad.textContent = ''; shouts.textContent = ''; heads.textContent = ''; titleEl.textContent = ''; titleEl.className = '';
    world.className = ''; shaker.classList.remove('shake'); counter.hidden = true; ticker.hidden = true; countEl.textContent = '1 명';
    ['#earth', '#solar', '#galaxy'].forEach(function (s) { $(s).className = s === '#earth' ? '' : $(s).className.replace(/show|away/g, '').trim(); $(s).classList.remove('show', 'away'); });
    spaceText.textContent = ''; spaceText.className = '';
    if (window.Space && Space.stop) Space.stop(); rimfans.classList.remove('show'); here.classList.remove('show');
    live = false; taps = 0; tapHint.classList.remove('done'); $('#replyBox').hidden = true; $('#rres').hidden = true; $('#rtext').value = '';
    polite.hidden = true; finale.hidden = true; $('.f-row').classList.remove('in');
    envelope.hidden = false; envelope.className = '';
    $('#fin1').textContent = ''; $('#fin2').textContent = ''; $('#fin3').textContent = ''; $('#more').textContent = ENCORE_BTN[0];
  }

  /* ───────── 응원 순서 ───────── */
  function play(data) {
    var id = ++run;
    T = data.t; L = data.l; R = data.r || '';
    resetCard();
    $('.env-t').textContent = R ? '답장이 도착했어요' : '응원이 도착했어요';
    $('.env-seal').textContent = R ? '답장' : '응원';
    $('#more').hidden = $('#reply').hidden = !!R; $('.f-note').hidden = !!R;
    if (R) return playReply(id);
    var M = [0, .8, 1, 1.25][L];
    var w = function (ms) { return wait(ms, id); };

    return new Promise(function (res) {
      $('#env').onclick = function () { $('#env').onclick = null; res(); };
    }).then(function () {
      if (id !== run) throw CANCEL;
      audio(); buzz(30); tone(0, 660, .12, 'sine', .08);
      envelope.classList.add('open');
      return w(520);
    }).then(function () {
      /* 1. 얌전한 척 */
      polite.hidden = false; envelope.classList.add('gone');
      $('#politeText').textContent = '「' + T + '」 화이팅.';
      return w(1500);
    }).then(function () { $('#politeText').textContent = '…'; return w(650); })
      .then(function () { $('#politeText').textContent = '아니, 이걸로는 부족해요.'; return w(1050); })
      .then(function () {
        /* 2. 터진다 */
        envelope.hidden = true; polite.hidden = true; world.classList.add('on'); live = true;
        setTitle(T); shake(10, 700); buzz([60, 40, 60, 40, 120]);
        confetti(W / 2, H * .45, 160, 20);
        return w(Array.from(T).length * 70 + 560);
      }).then(function () {
        roar(2.2, .5); fanfare(); say(T + ' 화이팅', { f0: 620, n: 3 });
        shout('화이팅!!!', { center: true, size: 26, hold: 900, c: 1, dy: H * .16 });
        shake(16, 900); confetti(W * .2, H * .6, 110, 18); confetti(W * .8, H * .6, 110, 18);
        return w(1250);
      }).then(function () {
        /* 3. 응원단 난입 */
        titleEl.classList.add('banner'); bg('p'); whistle(); roar(4 * M, .45);
        var total = Math.round(26 * M), seq = Promise.resolve();
        for (var i = 0; i < total; i++) (function (i) {
          seq = seq.then(function () {
            addFan(i === 4 ? 'peek' : i % 7 === 3 ? 'sign' : i % 9 === 6 ? 'top' : '');
            drum(0, .55); if (i % 2) clap(.05);
            if (i % 3 === 0) chant();
            if (i % 8 === 0) { shake(8, 300); confetti(rnd(0, W), H * .7, 40, 14); }
            if (i === 6) say(fill('{t} 뿌셔 할 수 있다'), { f0: 700, rate: 1.2, n: 2 });
            return w(95);
          });
        })(i);
        return seq;
      }).then(function () {
        say('가즈아아아', { f0: 480, rate: .8, n: 5 }); shout('가즈아아아!', { center: true, size: 20, hold: 600, c: 0 }); shake(14, 600); rain(120);
        return w(900);
      }).then(function () {
        /* 4. 속보 */
        bg('b'); counter.hidden = false; ticker.hidden = false;
        $('#tickText').textContent = HEADS.map(fill).join('   ◆   ');
        countTo(8.1e9, 3400 * M); roar(4.5 * M, .5);
        var list = HEADS.slice(0, 2).concat(HEADS.slice(2).sort(function () { return Math.random() - .5; }).slice(0, Math.round(2 + L)));
        var seq = Promise.resolve();
        list.forEach(function (h, i) {
          seq = seq.then(function () {
            headline(fill(h)); firework(rnd(W * .1, W * .9), rnd(H * .12, H * .5)); firework(rnd(W * .1, W * .9), rnd(H * .12, H * .5));
            if (i === 0) say('속보입니다 ' + T + ' 성공 확정적', { f0: 520, rate: 1.15 });
            addFan(''); addFan(''); chant({ size: rnd(5, 8) });
            return w(880);
          });
        });
        return seq;
      }).then(function () {
        bg('r'); shout('전 국 민 응 원', { center: true, size: 17, hold: 700, c: 2 }); shake(18, 800); rain(160); buzz([100, 50, 100, 50, 200]);
        for (var i = 0; i < 10; i++) addFan(i === 0 ? 'peek' : '');
        return w(1250);
      }).then(function () {
        /* 5. 우주로: 실사 지구에서 태양계, 은하로 빠져요 */
        hush(); world.classList.add('shrunk'); tone(0, 900, 1.2, 'sine', .12, 90);
        GL = !!(window.Space && Space.ok);
        if (GL) { Space.enter(); setTimeout(function () { if (id === run) rimfans.classList.add('show'); }, 550); }
        else spaceShow('#earth');
        return w(1400);
      }).then(function () { P.length = 0; spaceSay('지구가 응원합니다'); say('지구가 응원합니다', { f0: 600, n: 2 }); roar(1.8, .3); drum(0, 1); return w(2400); })
      .then(function () {
        if (GL) { rimfans.classList.remove('show'); Space.zoom(1, 2600); tone(0, 500, 2.2, 'sine', .08, 120); setTimeout(function () { if (id === run) here.classList.add('show'); }, 2100); }
        else spaceShow('#solar');
        spaceText.textContent = '';
        return w(GL ? 2500 : 900);
      }).then(function () { spaceSay('태양계가 응원합니다'); say('태양계가 응원합니다', { f0: 540, n: 3 }); roar(1.8, .35); drum(0, 1); return w(2500); })
      .then(function () { here.classList.remove('show'); spaceText.textContent = ''; if (GL) Space.leave(900); spaceShow('#galaxy'); return w(1100); })
      .then(function () { spaceSay('은하계가 응원합니다'); say('은하계가 응원합니다', { f0: 480, n: 4 }); roar(1.8, .4); drum(0, 1); return w(2200); })
      .then(function () {
        spaceShow(null); warp = REDUCE ? 1 : 6; roar(3, .6); fanfare();
        spaceSay('우주가 응원합니다', true); say('우주가 응원합니다', { f0: 420, rate: .75, n: 6 });
        buzz([200, 60, 200, 60, 400]);
        for (var i = 0; i < 7; i++) (function (i) { setTimeout(function () { if (id === run) { firework(rnd(W * .1, W * .9), rnd(H * .1, H * .9)); drum(0, 1); } }, i * 260); })(i);
        return w(2900);
      }).then(function () {
        /* 6. 급 정색 */
        warp = 0; P.length = 0; hush(); spaceText.textContent = '';
        finale.hidden = false;
        return w(1300);
      }).then(function () { $('#fin1').textContent = '…'; return w(900); })
      .then(function () { $('#fin1').textContent = '진심이에요.'; return w(1200); })
      .then(function () { $('#fin2').textContent = '「' + T + '」 화이팅.'; tone(0, 523, .5, 'sine', .07); tone(.12, 784, .6, 'sine', .06); return w(900); })
      .then(function () { $('.f-row').classList.add('in'); })
      .catch(function (e) { if (e !== CANCEL && window.console) console.error(e); });
  }

  /* 답장 카드: 응원을 받은 사람이 돌려보낸 한마디가 펼쳐져요 */
  function playReply(id) {
    var w = function (ms) { return wait(ms, id); };
    return new Promise(function (res) {
      $('#env').onclick = function () { $('#env').onclick = null; res(); };
    }).then(function () {
      if (id !== run) throw CANCEL;
      audio(); buzz(30); tone(0, 660, .12, 'sine', .08);
      envelope.classList.add('open');
      return w(520);
    }).then(function () {
      polite.hidden = false; envelope.classList.add('gone');
      $('#politeText').textContent = '「' + T + '」 응원, 잘 받았대요.';
      return w(1500);
    }).then(function () { $('#politeText').textContent = '그리고 한마디를 남겼어요.'; return w(1100); })
      .then(function () {
        envelope.hidden = true; polite.hidden = true; bg('p'); world.classList.add('on'); live = true;
        setTitle(R); shake(10, 700); buzz([60, 40, 60, 40, 120]);
        confetti(W / 2, H * .45, 140, 20); hearts(40); fanfare();
        return w(Array.from(R).length * 70 + 700);
      }).then(function () {
        say(R, { f0: 640, n: 2 }); roar(3, .45); whistle();
        var seq = Promise.resolve();
        for (var i = 0; i < 18; i++) (function (i) {
          seq = seq.then(function () {
            addFan(i === 3 ? 'peek' : i % 4 === 1 ? 'sign' : '', '응원 성공');
            drum(0, .5); if (i % 2) clap(.05);
            if (i % 3 === 0) shout(pick(THANKS));
            if (i % 5 === 0) hearts(14);
            return w(110);
          });
        })(i);
        return seq;
      }).then(function () {
        titleEl.classList.add('banner'); bg('r');
        headline('[속보] 「' + T + '」 응원, 통한 것으로 확인');
        shout('응원 성공!', { center: true, size: 22, hold: 1000, c: 1 }); say('응원 성공', { f0: 560, n: 5, rate: .8 });
        shake(14, 700); hearts(70); confetti(W * .2, H * .6, 90, 18); confetti(W * .8, H * .6, 90, 18);
        return w(2800);
      }).then(function () {
        hush(); world.classList.add('shrunk'); P.length = 0; finale.hidden = false;
        return w(1000);
      }).then(function () { $('#fin1').textContent = '응원이 통했어요.'; return w(900); })
      .then(function () { $('#fin2').textContent = '「' + R + '」'; tone(0, 523, .5, 'sine', .07); tone(.12, 784, .6, 'sine', .06); return w(800); })
      .then(function () { $('#fin3').textContent = '「' + T + '」 응원에 대한 답장이에요'; $('.f-row').classList.add('in'); })
      .catch(function (e) { if (e !== CANCEL && window.console) console.error(e); });
  }

  /* 더 응원해: 누를수록 더 과해져요 */
  function more() {
    if (busy || finale.hidden || R) return;
    busy = true; encore++;
    var id = run, n = encore;
    audio(); finale.hidden = true;
    world.classList.remove('shrunk'); bg(['p', 'b', 'r', ''][n % 4]); world.classList.add('on');
    ['#earth', '#solar', '#galaxy'].forEach(function (s) { $(s).classList.remove('show', 'away'); });
    counter.hidden = false; ticker.hidden = false; titleEl.classList.add('banner');
    countTo(Math.min(9e71, Math.max(count, 8.1e9) * Math.pow(1e4, n + 1)), 2200);
    roar(2.8, .6); fanfare(); whistle(); buzz([80, 40, 80, 40, 80, 40, 300]); shake(Math.min(30, 12 + n * 4), 2400);
    say(fill(pick(CHANTS)), { f0: rnd(480, 760), n: 3 });
    var add = Math.min(40, 10 + n * 6);
    for (var i = 0; i < add; i++) (function (i) {
      setTimeout(function () {
        if (id !== run) return;
        addFan(i % 6 === 0 ? 'peek' : i % 5 === 2 ? 'sign' : i % 7 === 4 ? 'top' : '');
        if (i % 2 === 0) chant({ size: rnd(6, Math.min(22, 10 + n * 2)) });
        if (i % 4 === 0) { firework(rnd(0, W), rnd(0, H * .6)); confetti(rnd(0, W), rnd(H * .3, H * .8), 50, 16); drum(0, .9); }
      }, i * (2100 / add));
    })(i);
    setTimeout(function () { if (id === run) headline(fill(pick(HEADS))); }, 500);
    setTimeout(function () { if (id === run) shout('화이팅 × ' + Math.pow(10, Math.min(n, 15)).toLocaleString('ko-KR'), { center: true, size: 15, hold: 800, c: 1 }); }, 1100);
    setTimeout(function () {
      if (id !== run) return;
      hush(); world.classList.add('shrunk'); finale.hidden = false;
      $('#fin1').textContent = '응원 ' + (n + 1) + '회차 · ' + fmt(count);
      $('#fin3').textContent = fill(ENCORE_LINES[Math.min(n - 1, ENCORE_LINES.length - 1)]);
      $('#more').textContent = ENCORE_BTN[Math.min(n, ENCORE_BTN.length - 1)];
      busy = false;
    }, 3000);
  }
  /* 눌러서 같이 응원: 누른 자리에서 꽃가루 · 구호 · 응원단원이 터져요. 우주에서는 폭죽 */
  $('#card').addEventListener('pointerdown', function (e) {
    if (!live || !finale.hidden || (e.target.closest && e.target.closest('button'))) return;
    var now = Date.now(); if (now - lastTap < 70) return;
    lastTap = now; taps++;
    var x = e.clientX, y = e.clientY, k = taps % 8;
    audio(); tone(0, 520 + k * 70, .09, 'triangle', .14, 950 + k * 90); buzz(15);
    if (world.classList.contains('shrunk')) { firework(x, y); return; }
    confetti(x, y, 26, 13); drum(0, .5); tapHint.classList.add('done');
    if (taps % 2 === 0) shout(fill(pick(CHANTS)), { size: rnd(4, 7), at: [x, y], hold: 350 });
    if (taps % 3 === 0) addFan('');
    if (taps % 10 === 0) { shake(10, 300); say(fill(pick(CHANTS)), { f0: rnd(520, 760), n: 2 }); }
  });
  /* 마우스나 기기 기울기를 따라 층마다 다르게 출렁여요 */
  function sway(x, y) {
    if (REDUCE) return;
    x = Math.max(-1, Math.min(1, x)); y = Math.max(-1, Math.min(1, y));
    shaker.style.setProperty('--px', x.toFixed(3)); shaker.style.setProperty('--py', y.toFixed(3));
  }
  window.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') sway((e.clientX / W - .5) * 2, (e.clientY / H - .5) * 2); });
  window.addEventListener('deviceorientation', function (e) { if (e.gamma != null) sway(e.gamma / 28, ((e.beta || 45) - 45) / 28); });
  $('#more').addEventListener('click', more);
  $('#again').addEventListener('click', function () { route(); });
  $('#mine').addEventListener('click', function () { location.hash = ''; });
  $('#mute').addEventListener('click', function () {
    muted = !muted; this.setAttribute('aria-pressed', String(muted)); this.textContent = muted ? '소리 켜기' : '소리 끄기';
    if (master) master.gain.value = muted ? 0 : .55; if (muted) hush();
  });
  var lastShake = 0;
  window.addEventListener('devicemotion', function (e) {
    var a = e.accelerationIncludingGravity; if (!a) return;
    var m = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0), now = Date.now();
    if (m > 34 && now - lastShake > 3500) { lastShake = now; more(); }
  });

  /* ───────── 만드는 화면 ───────── */
  var level = 2, topic = $('#topic');
  EXAMPLES.forEach(function (ex) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = ex;
    b.addEventListener('click', function () { topic.value = ex; topic.focus(); });
    $('#chips').appendChild(b);
  });
  Array.prototype.forEach.call(document.querySelectorAll('#levels button'), function (b) {
    b.addEventListener('click', function () {
      level = +b.dataset.l;
      Array.prototype.forEach.call(document.querySelectorAll('#levels button'), function (x) { x.setAttribute('aria-checked', String(x === b)); });
    });
  });
  function makeHash() {
    var t = topic.value.replace(/\s+/g, ' ').trim().slice(0, 30) || '오늘 하루';
    return '#c=' + enc({ t: t, l: level });
  }
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    $('#link').value = PUBLIC_URL + makeHash();
    $('#result').hidden = false; $('#copied').textContent = '';
    confetti(W / 2, H * .5, 80, 16);
    $('#result').scrollIntoView({ block: 'nearest', behavior: REDUCE ? 'auto' : 'smooth' });
  });
  function copyFrom(input, out) {
    var done = function (ok) { out.textContent = ok ? '복사했어요. 이제 붙여 넣어 보내세요.' : '복사가 막혔어요. 위 주소를 길게 눌러 직접 복사해 주세요.'; };
    var fallback = function () { input.focus(); input.select(); try { done(document.execCommand('copy')); } catch (e) { done(false); } };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(input.value).then(function () { done(true); }, fallback);
    else fallback();
  }
  $('#copy').addEventListener('click', function () { copyFrom($('#link'), $('#copied')); });

  /* 답장 만들기: 받은 응원에 한마디를 붙여 다시 링크로 */
  REPLIES.forEach(function (tx) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = tx;
    b.addEventListener('click', function () { $('#rtext').value = tx; });
    $('#rchips').appendChild(b);
  });
  $('#reply').addEventListener('click', function () {
    var box = $('#replyBox'); box.hidden = !box.hidden;
    if (!box.hidden) box.scrollIntoView({ block: 'nearest', behavior: REDUCE ? 'auto' : 'smooth' });
  });
  $('#rmake').addEventListener('click', function () {
    var r = $('#rtext').value.replace(/\s+/g, ' ').trim().slice(0, 30) || REPLIES[0];
    $('#rlink').value = PUBLIC_URL + '#c=' + enc({ t: T, l: L, r: r });
    $('#rres').hidden = false; $('#rcopied').textContent = ''; hearts(30);
    $('#rres').scrollIntoView({ block: 'nearest', behavior: REDUCE ? 'auto' : 'smooth' });
  });
  $('#rcopy').addEventListener('click', function () { copyFrom($('#rlink'), $('#rcopied')); });
  $('#open').addEventListener('click', function () { location.hash = makeHash(); });

  /* ───────── 길 나누기 ───────── */
  function route() {
    var m = /^#c=([\w-]+)/.exec(location.hash), d = m && dec(m[1]);
    if (d) {
      $('#compose').hidden = true; $('#card').hidden = false;
      play(d);
    } else {
      run++; hush(); P.length = 0; warp = 0; if (window.Space && Space.stop) Space.stop();
      $('#card').hidden = true; $('#compose').hidden = false;
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
