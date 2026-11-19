/* 지구 · 태양계: 사진 없이 셰이더로 직접 그려요 (노이즈로 만든 대륙 · 구름 · 줄무늬). */
(function () {
  'use strict';
  var cv = document.getElementById('gl');
  var Space = window.Space = { ok: false, earthScreen: null };
  if (!cv) return;
  var gl = null;
  try { gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true }); } catch (e) {}
  if (!gl) return;

  var VS = 'attribute vec2 a;uniform vec2 uC,uR;varying vec2 v;void main(){v=a;gl_Position=vec4(uC+a*uR,0.,1.);}';
  var HEAD = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nvarying vec2 v;';
  var NOISE = [
    'float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
    'float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);',
    ' return mix(mix(mix(hash(i),hash(i+vec3(1.,0.,0.)),f.x),mix(hash(i+vec3(0.,1.,0.)),hash(i+vec3(1.,1.,0.)),f.x),f.y),',
    '  mix(mix(hash(i+vec3(0.,0.,1.)),hash(i+vec3(1.,0.,1.)),f.x),mix(hash(i+vec3(0.,1.,1.)),hash(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
    'float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec3(1.7,9.2,4.1);a*=.5;}return s;}'
  ].join('\n');
  /* 공 모양 천체. uT: 0 수성 1 금성 2 지구 3 화성 4 목성 5 토성 6 천왕성 7 해왕성 8 달 9 태양 */
  var FS_BALL = HEAD + NOISE + [
    'uniform float uRot,uT,uM,uTime,uTilt,uPx;uniform vec3 uL;',
    'void main(){',
    ' vec2 p=v*uM;float r=length(p);',
    ' if(r>1.){',
    '  if(uT==9.){float g=exp(-(r-1.)*3.2);float f=exp(-(r-1.)*14.);vec3 c=vec3(1.,.55,.12)*g+vec3(1.,.9,.6)*f;float a=clamp(g*.9+f,0.,1.);gl_FragColor=vec4(c*a,a);return;}',
    '  if(uT==2.){float h=exp(-(r-1.)*26.);vec2 n2=p/r;float lit=clamp(dot(n2,normalize(uL.xy+vec2(.0001)))*.75+.55,0.,1.);float a=h*.75*lit;gl_FragColor=vec4(vec3(.35,.62,1.)*a,a);return;}',
    '  discard;',
    ' }',
    ' vec3 n=vec3(p,sqrt(1.-r*r));',
    ' float ct=cos(uTilt),st=sin(uTilt);vec3 m=vec3(n.x*ct+n.y*st,-n.x*st+n.y*ct,n.z);',
    ' float cr=cos(uRot),sr=sin(uRot);vec3 q=vec3(m.x*cr-m.z*sr,m.y,m.x*sr+m.z*cr);',
    ' float aa=1.-smoothstep(1.-2.*uPx,1.,r);',
    ' if(uT==9.){float t=uTime*.12;float a=fbm(q*4.+vec3(t,0.,-t));float b=fbm(q*9.-vec3(0.,t*1.6,t));',
    '  vec3 c=mix(vec3(1.,.36,.03),vec3(1.,.86,.3),smoothstep(.3,.72,a))+vec3(.5,.35,.1)*smoothstep(.55,.8,b);',
    '  c*=.75+.55*n.z;gl_FragColor=vec4(c*1.25,1.);return;}',
    ' float d=dot(n,uL);float day=smoothstep(-.08,.28,d);vec3 c;',
    ' if(uT==2.){',
    '  float h=fbm(q*2.1+vec3(3.1,7.7,1.3))+.12*fbm(q*9.);float land=smoothstep(.555,.585,h);',
    '  float lat=abs(q.y);float dry=fbm(q*3.3+vec3(11.,2.,5.));',
    '  vec3 sea=mix(vec3(.015,.07,.27),vec3(.04,.3,.55),smoothstep(.38,.56,h));',
    '  vec3 gnd=mix(vec3(.1,.34,.1),vec3(.66,.56,.32),smoothstep(.42,.62,dry+(.3-lat)*.35));',
    '  gnd=mix(gnd,vec3(.3,.26,.2),smoothstep(.68,.8,h));',
    '  vec3 base=mix(sea,gnd,land);',
    '  float ice=smoothstep(.8,.9,lat+fbm(q*6.)*.12);base=mix(base,vec3(.93,.96,1.),ice);',
    '  vec3 w=q*2.6+vec3(uTime*.012,0.,uTime*.006);float cl=smoothstep(.5,.74,fbm(w+fbm(w*1.7)*.9));',
    '  vec3 hv=normalize(uL+vec3(0.,0.,1.));float sp=pow(max(dot(n,hv),0.),48.)*(1.-land)*(1.-cl);',
    '  float city=land*(1.-ice)*smoothstep(.62,.8,noise(q*46.))*smoothstep(.45,.6,fbm(q*7.+vec3(4.)));',
    '  c=mix(base,vec3(1.),cl*.9)*(day*1.15+.015)+vec3(1.,.95,.8)*sp*.9*day+vec3(1.,.78,.4)*city*1.5*(1.-day)*(1.-cl*.7);',
    '  float fr=pow(1.-n.z,2.6);c+=vec3(.25,.5,1.)*fr*(day*.9+.08);',
    ' }else{',
    '  vec3 base;',
    '  if(uT==4.){float y=q.y*10.+fbm(q*vec3(2.,6.,2.))*2.2;float b=sin(y)*.5+.5;base=mix(vec3(.88,.79,.64),vec3(.62,.4,.24),b);',
    '   base=mix(base,vec3(.93,.88,.8),smoothstep(.6,.9,sin(y*2.3+1.)));vec2 sp2=vec2(atan(q.x,q.z)*.9,(q.y+.32)*2.6);base=mix(base,vec3(.74,.25,.14),smoothstep(.36,.2,length(sp2)));}',
    '  else if(uT==5.){float y=q.y*13.+fbm(q*vec3(2.,5.,2.))*1.2;base=mix(vec3(.9,.82,.62),vec3(.72,.6,.42),sin(y)*.5+.5);}',
    '  else if(uT==6.){base=mix(vec3(.62,.86,.9),vec3(.5,.78,.86),sin(q.y*6.)*.5+.5);}',
    '  else if(uT==7.){float y=q.y*8.+fbm(q*3.)*1.5;base=mix(vec3(.14,.26,.75),vec3(.24,.44,.92),sin(y)*.5+.5);base=mix(base,vec3(.8,.88,1.),smoothstep(.7,.8,fbm(q*5.+vec3(2.))));}',
    '  else if(uT==3.){float h=fbm(q*3.+vec3(5.));base=mix(vec3(.45,.19,.1),vec3(.8,.42,.22),h*1.3);base=mix(base,vec3(.3,.14,.1),smoothstep(.6,.72,fbm(q*6.)));base=mix(base,vec3(.95,.93,.9),smoothstep(.86,.93,abs(q.y)+h*.08));}',
    '  else if(uT==1.){vec3 w=q*2.5+vec3(uTime*.01,0.,0.);float h=fbm(w+fbm(w*2.)*1.2);base=mix(vec3(.72,.5,.2),vec3(.97,.87,.62),h*1.3);}',
    '  else{float h=fbm(q*4.+vec3(uT));float cr2=smoothstep(.62,.7,noise(q*9.+vec3(uT)))+smoothstep(.7,.76,noise(q*20.));',
    '   base=mix(vec3(.3),vec3(.72,.71,.69),h*1.25)*(1.-cr2*.28);if(uT==8.)base=mix(base,vec3(.22),smoothstep(.56,.66,fbm(q*1.8+vec3(8.)))*.7);}',
    '  c=base*(day*1.12+.02);',
    ' }',
    ' gl_FragColor=vec4(c*aa,aa);',
    '}'].join('\n');
  var FS_RING = HEAD + 'uniform float uHalf,uSq;void main(){vec2 p=vec2(v.x,v.y/uSq)*2.4;float r=length(p);if(v.y*uHalf<0.||r<1.28||r>2.35)discard;float b=.55+.45*sin(r*38.)*sin(r*11.+1.);float gap=smoothstep(1.92,1.96,r)*(1.-smoothstep(1.99,2.03,r));float a=(.75*b)*(1.-gap*.85)*smoothstep(1.28,1.34,r)*(1.-smoothstep(2.28,2.35,r));vec3 c=mix(vec3(.78,.68,.5),vec3(.95,.88,.72),b);gl_FragColor=vec4(c*a,a);}';
  var FS_BG = HEAD + NOISE + [
    'uniform vec2 uAsp;uniform float uTime;',
    'void main(){vec2 uv=v*uAsp;vec3 c=vec3(.004,.006,.02);',
    ' float band=exp(-pow((uv.y*.9+uv.x*.35)*2.4,2.));float neb=fbm(vec3(uv*2.2,3.))*band;',
    ' c+=vec3(.16,.14,.26)*neb+vec3(.2,.1,.16)*band*smoothstep(.45,.75,fbm(vec3(uv*4.,7.)))*.5;',
    ' for(int k=0;k<3;k++){float sc=70.+float(k)*85.;vec2 g=uv*sc;vec2 id=floor(g);vec2 f=fract(g)-.5;',
    '  float h=hash(vec3(id,float(k)*3.7));vec2 o=vec2(hash(vec3(id,1.3)),hash(vec3(id,2.9)))-.5;',
    '  float s=smoothstep(.09+.07*h,0.,length(f-o*.7))*step(.9-band*.12,h);',
    '  float tw=.65+.35*sin(uTime*(1.+h*3.)+h*40.);c+=mix(vec3(.75,.85,1.),vec3(1.,.9,.75),hash(vec3(id,5.1)))*s*tw*(1.1-float(k)*.25);}',
    ' gl_FragColor=vec4(c,1.);}'].join('\n');
  var FS_LINE = HEAD + 'uniform float uA;void main(){gl_FragColor=vec4(vec3(.7,.8,1.)*uA,uA);}';

  function prog(vs, fs) {
    var p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) {
      var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    });
    gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }
  var pBall, pRing, pBg, pLine, quad, ring;
  try {
    pBall = prog(VS, FS_BALL); pRing = prog(VS, FS_RING); pBg = prog(VS, FS_BG); pLine = prog(VS, FS_LINE);
  } catch (e) { if (window.console) console.warn('우주 장면을 그릴 수 없어 간단한 그림으로 바꿔요.', e); return; }
  quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var SEG = 128, ringPts = new Float32Array(SEG * 2);
  for (var i = 0; i < SEG; i++) { ringPts[i * 2] = Math.cos(i / SEG * 6.2831853); ringPts[i * 2 + 1] = Math.sin(i / SEG * 6.2831853); }
  ring = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ring); gl.bufferData(gl.ARRAY_BUFFER, ringPts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  Space.ok = true;

  /* 궤도 반지름 · 크기는 보기 좋게 줄인 값이에요 (실제 비율 아님) */
  var TILT = 1.13, CT = Math.cos(TILT), STt = Math.sin(TILT);
  var BODIES = [
    { t: 0, o: .17, r: .018, sp: 1.6, a: 2.1, spin: .15 },
    { t: 1, o: .25, r: .029, sp: 1.15, a: 4.4, spin: -.08 },
    { t: 2, o: .35, r: .033, sp: .7, a: .95, spin: .17, tilt: .41 },
    { t: 3, o: .46, r: .023, sp: .55, a: 3.4, spin: .17, tilt: .44 },
    { t: 4, o: .64, r: .081, sp: .3, a: 5.5, spin: .4, tilt: .05 },
    { t: 5, o: .82, r: .065, sp: .22, a: 2.6, spin: .38, tilt: .2, ring: true },
    { t: 6, o: .95, r: .044, sp: .16, a: .2, spin: .25 },
    { t: 7, o: 1.06, r: .043, sp: .12, a: 4.0, spin: .25 }
  ];
  var EARTH = BODIES[2];
  var W = 1, H = 1, on = false, raf = 0, t0 = 0, last = 0, orbitT = 0;
  var z = 0, zFrom = 0, zTo = 0, zT0 = 0, zMs = 1;
  var kick = 1, kFrom = 1, kTo = 1, kT0 = 0, kMs = 1;
  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth || window.innerWidth; H = cv.clientHeight || window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); gl.viewport(0, 0, cv.width, cv.height);
  }
  window.addEventListener('resize', function () { if (on) resize(); });

  function drawBall(type, sx, sy, rpx, rot, L, tilt, time) {
    var m = type === 9 ? 3.2 : type === 2 ? 1.22 : 1;
    if (sx + rpx * m < -W / 2 || sx - rpx * m > W / 2 || sy + rpx * m < -H / 2 || sy - rpx * m > H / 2) return;
    var u = pBall.u;
    gl.useProgram(pBall.p); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(u.uC, sx / (W / 2), sy / (H / 2)); gl.uniform2f(u.uR, rpx * m / (W / 2), rpx * m / (H / 2));
    gl.uniform1f(u.uM, m); gl.uniform1f(u.uT, type); gl.uniform1f(u.uRot, rot); gl.uniform1f(u.uTilt, tilt || 0);
    gl.uniform1f(u.uTime, time); gl.uniform1f(u.uPx, 1 / Math.max(2, rpx)); gl.uniform3f(u.uL, L[0], L[1], L[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function drawRing(sx, sy, rpx, half) {
    var u = pRing.u, R = rpx * 2.4;
    gl.useProgram(pRing.p); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(u.uC, sx / (W / 2), sy / (H / 2)); gl.uniform2f(u.uR, R / (W / 2), R / (H / 2));
    gl.uniform1f(u.uHalf, half); gl.uniform1f(u.uSq, .36);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function frame(now) {
    if (!on) return;
    raf = requestAnimationFrame(frame);
    var time = (now - t0) / 1000, dt = Math.min(.05, (now - last) / 1000); last = now;
    z = zFrom + (zTo - zFrom) * ease(Math.min(1, (now - zT0) / zMs));
    kick = kFrom + (kTo - kFrom) * ease(Math.min(1, (now - kT0) / kMs));
    orbitT += dt * (.04 + z * .5);

    var minD = Math.min(W, H);
    var S0 = (minD * .3) / EARTH.r, S1 = Math.min(W / 2.3, H / 1.02);
    var S = Math.exp(Math.log(S0) + (Math.log(S1) - Math.log(S0)) * z) * kick;
    var ea = EARTH.a + orbitT * EARTH.sp;
    var ex = Math.cos(ea) * EARTH.o, ey = Math.sin(ea) * EARTH.o * CT;
    var f = 1 - (S1 * z) / S; if (f < 0) f = 0;
    var cx = ex * f, cy = ey * f;

    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    /* 별 배경 */
    gl.useProgram(pBg.p); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(pBg.u.uC, 0, 0); gl.uniform2f(pBg.u.uR, 1, 1);
    gl.uniform2f(pBg.u.uAsp, W / minD, H / minD); gl.uniform1f(pBg.u.uTime, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    /* 궤도 선 */
    var la = Math.max(0, Math.min(1, (z - .35) * 2.2)) * .32;
    if (la > .01) {
      gl.useProgram(pLine.p); gl.bindBuffer(gl.ARRAY_BUFFER, ring); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(pLine.u.uA, la);
      for (var i = 0; i < BODIES.length; i++) {
        gl.uniform2f(pLine.u.uC, -cx * S / (W / 2), -cy * S / (H / 2));
        gl.uniform2f(pLine.u.uR, BODIES[i].o * S / (W / 2), BODIES[i].o * CT * S / (H / 2));
        gl.drawArrays(gl.LINE_LOOP, 0, SEG);
      }
    }

    /* 먼 것부터 그리기 */
    var list = [{ sun: true, oy: 0 }];
    BODIES.forEach(function (b) {
      var a = b.a + orbitT * b.sp;
      list.push({ b: b, ox: Math.cos(a) * b.o, oy: Math.sin(a) * b.o });
    });
    var ma = time * .35 + 1, mo = EARTH.r * 2.9;
    var eox = Math.cos(ea) * EARTH.o, eoy = Math.sin(ea) * EARTH.o;
    list.push({ moon: true, ox: eox + Math.cos(ma) * mo, oy: eoy + Math.sin(ma) * mo });
    list.sort(function (p, q) { return q.oy - p.oy; });
    Space.earthScreen = null;
    list.forEach(function (it) {
      if (it.sun) { drawBall(9, -cx * S, -cy * S, .1 * S, time * .05, [0, 0, 1], 0, time); return; }
      var sx = (it.ox - cx) * S, sy = (it.oy * CT - cy) * S;
      var lx = -it.ox, ly = -it.oy * CT, lz = it.oy * STt, ll = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1;
      var L = [lx / ll, ly / ll, lz / ll];
      if (it.moon) { drawBall(8, sx, sy, EARTH.r * .27 * S, time * .05, L, 0, time); return; }
      var b = it.b, rpx = b.r * S;
      if (b.ring) drawRing(sx, sy, rpx, 1);
      drawBall(b.t, sx, sy, rpx, time * b.spin, L, b.tilt || 0, time);
      if (b.ring) drawRing(sx, sy, rpx, -1);
      if (b === EARTH) Space.earthScreen = { x: W / 2 + sx, y: H / 2 - sy, r: rpx };
    });
    if (Space.onFrame) Space.onFrame(z);
  }

  Space.enter = function () {
    if (!Space.ok) return;
    resize(); on = true; cv.style.transition = 'none'; cv.style.opacity = '1';
    var now = performance.now(); t0 = t0 || now; last = now;
    z = zFrom = zTo = 0; zT0 = now; zMs = 1;
    kFrom = 5; kTo = 1; kT0 = now; kMs = 1300;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  };
  Space.zoom = function (to, ms) { zFrom = z; zTo = to; zT0 = performance.now(); zMs = ms; };
  Space.leave = function (ms) {
    if (!on) return;
    kFrom = kick; kTo = .05; kT0 = performance.now(); kMs = ms;
    cv.style.transition = 'opacity ' + ms + 'ms ease-in'; cv.style.opacity = '0';
    setTimeout(function () { if (cv.style.opacity === '0') Space.stop(); }, ms + 60);
  };
  Space.stop = function () { on = false; cancelAnimationFrame(raf); cv.style.transition = 'none'; cv.style.opacity = '0'; Space.earthScreen = null; };
})();
