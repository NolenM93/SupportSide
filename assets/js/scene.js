/* Support Side: ambient Galaga-style 2D battle.
   Cyan player ship vs a swaying formation. Four labeled enemies
   still open the existing offering cards. No sound. */
(function () {
  'use strict';

  var sceneRoot = document.getElementById('hero-scene');
  var canvas = document.getElementById('hero-canvas');
  var nodesRoot = document.getElementById('scene-nodes');
  var hudStatus = document.querySelector('[data-hud-status]');
  var card = document.getElementById('node-card');
  var cardKicker = document.getElementById('node-card-kicker');
  var cardCopy = document.getElementById('node-card-copy');
  var cardLink = document.getElementById('node-card-link');
  var cardClose = document.getElementById('node-card-close');
  var heroEl = document.querySelector('.hero');
  if (!sceneRoot || !canvas) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    document.documentElement.classList.add('scene-static');
    canvas.hidden = true;
    return;
  }

  var NODES = [
    { id: 'sites', label: 'Websites', copy: 'A site customers can use, without an agency markup or a bloated subscription.', href: '#work', linkLabel: 'See the work' },
    { id: 'booking', label: 'Booking tools', copy: 'A booking website for a local rental company: availability, reservations, and a flow customers can actually use.', href: '#work', linkLabel: 'See the work' },
    { id: 'apps', label: 'Apps', copy: 'I build safe, affordable software of any kind: sites, booking tools, apps, so local owners can stay on the actual work.', href: '#work', linkLabel: 'See the work' },
    { id: 'care', label: 'Hosting', copy: 'We host your website and keep it running, safe, and up to date for one monthly price, so you never have to think about it.', href: 'plans.html', linkLabel: 'View hosting' }
  ];

  var isPhone = window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 2;
  var dprCap = isPhone ? 1.5 : 2;
  var running = true;
  var visible = true;
  var selectedId = null;
  var pointerX = 0.5;
  var hasPointer = false;
  var w = 1;
  var h = 1;
  var battle = { x: 0, y: 0, w: 1, h: 1 };
  var last = 0;
  var frames = 0;
  var fpsWindow = 0;
  var fps = 0;
  var time = 0;
  var nextDive = 1.8;
  var nextEnemyShot = 1.1;

  var C = {
    cyan: '#22d3ee',
    cyanHi: '#a5f3fc',
    cyanDim: '#155e75',
    orange: '#ff9b6a',
    orangeHi: '#ffd3ba',
    orangeDim: '#9a3412',
    spark: '#fff4d6',
    star: '#9ab0c8'
  };

  function pixelSprite(rows, colors) {
    var pw = rows[0].length;
    var ph = rows.length;
    var c = document.createElement('canvas');
    c.width = pw;
    c.height = ph;
    var g = c.getContext('2d');
    for (var y = 0; y < ph; y += 1) {
      for (var x = 0; x < pw; x += 1) {
        var ch = rows[y].charAt(x);
        if (ch === '.' || !colors[ch]) continue;
        g.fillStyle = colors[ch];
        g.fillRect(x, y, 1, 1);
      }
    }
    return { canvas: c, w: pw, h: ph };
  }

  var sprPlayer = pixelSprite(
    [
      '......A......',
      '.....AAA.....',
      '....AABAA....',
      '...AA.A.AA...',
      '..AAAAAAAAA..',
      '.AAABABABAAA.',
      'AAAAABABAAAAA',
      'A.AAA...AAA.A',
      '..C.......C..'
    ],
    { A: C.cyan, B: C.cyanHi, C: C.orange }
  );

  var sprEnemyCyan = pixelSprite(
    [
      '.A.........A.',
      '..A.......A..',
      '.AAAAAAAAAAA.',
      'AA.AABABAA.AA',
      'AAAAAAAAAAAAA',
      '.AAA.....AAA.',
      '..AA.....AA..',
      '...A.....A...'
    ],
    { A: C.cyan, B: C.cyanHi }
  );

  var sprEnemyOrange = pixelSprite(
    [
      '.A.........A.',
      'A.A.......A.A',
      '.AAAAAAAAAAA.',
      'AA.AABBABB.AA',
      'AAAAAAAAAAAAA',
      '.AAA.AAA.AAA.',
      '..A.......A..'
    ],
    { A: C.orange, B: C.orangeHi }
  );

  var buttons = [];
  if (nodesRoot) {
    NODES.forEach(function (spec) {
      var btn = nodesRoot.querySelector('[data-node="' + spec.id + '"]');
      if (!btn) return;
      buttons.push(btn);
      btn.addEventListener('click', function () {
        selectNode(spec.id);
      });
    });
  }

  var extras = 4;
  var enemies = [];
  NODES.forEach(function (spec, i) {
    enemies.push(makeEnemy(i, 1, spec.id, true));
  });
  for (var e = 0; e < extras; e += 1) {
    enemies.push(makeEnemy(e, 0, null, false));
  }

  var player = {
    x: 0,
    y: 0,
    vx: 0,
    flash: 0,
    cooldown: 0,
    scale: isPhone ? 2.2 : 2.8
  };
  var shots = [];
  var particles = [];
  var stars = [];

  function makeEnemy(col, row, tag, labeled) {
    return {
      col: col,
      row: row,
      tag: tag,
      labeled: labeled,
      homeX: 0,
      homeY: 0,
      x: 0,
      y: 0,
      mode: 'form',
      t: 0,
      alive: true,
      respawn: 0,
      scale: labeled ? (isPhone ? 2.2 : 2.9) : (isPhone ? 1.9 : 2.4),
      fromX: 0,
      fromY: 0,
      c1x: 0,
      c1y: 0,
      c2x: 0,
      c2y: 0
    };
  }

  function seedStars() {
    stars = [];
    var n = isPhone ? 36 : 70;
    for (var i = 0; i < n; i += 1) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        z: 0.35 + Math.random() * 1.4,
        s: Math.random() < 0.12 ? 2 : 1
      });
    }
  }

  function layoutBattle() {
    if (w >= 1024) {
      battle.x = w * 0.46;
      battle.y = h * 0.12;
      battle.w = w * 0.5;
      battle.h = h * 0.8;
    } else {
      battle.x = w * 0.04;
      battle.y = h * 0.08;
      battle.w = w * 0.92;
      battle.h = h * 0.86;
    }
    var gapX = battle.w / (w < 800 ? 4.35 : 5.2);
    var top = battle.y + battle.h * 0.16;
    var rowH = Math.min(52, battle.h * 0.12);
    enemies.forEach(function (en) {
      var cols = en.labeled ? 4 : extras;
      var start = battle.x + battle.w / 2 - ((cols - 1) * gapX) / 2;
      en.homeX = start + en.col * gapX;
      en.homeY = top + en.row * rowH;
      if (en.mode === 'form' && en.alive) {
        en.x = en.homeX;
        en.y = en.homeY;
      }
    });
    player.y = battle.y + battle.h * 0.88;
    if (!player.x) player.x = battle.x + battle.w / 2;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    w = Math.max(1, canvas.clientWidth);
    h = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutBattle();
    if (selectedId) placeCard(selectedId);
  }

  function bezier(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  }

  function spawnShot(x, y, vy, ally) {
    if (shots.length > 28) shots.shift();
    shots.push({ x: x, y: y, vy: vy, ally: ally, life: 2.4 });
  }

  function burst(x, y, color, n) {
    var count = n || (isPhone ? 6 : 10);
    for (var i = 0; i < count; i += 1) {
      var a = Math.random() * Math.PI * 2;
      var sp = 40 + Math.random() * 90;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.28 + Math.random() * 0.28,
        color: color
      });
    }
  }

  function startDive(en) {
    if (!en.alive || en.mode === 'dive') return;
    en.mode = 'dive';
    en.t = 0;
    en.fromX = en.x;
    en.fromY = en.y;
    var side = en.homeX > battle.x + battle.w / 2 ? 1 : -1;
    en.c1x = en.x + side * battle.w * 0.18;
    en.c1y = en.y + battle.h * 0.18;
    en.c2x = player.x - side * 36;
    en.c2y = player.y - 24;
  }

  function hitTest(ax, ay, bx, by, r) {
    var dx = ax - bx;
    var dy = ay - by;
    return dx * dx + dy * dy < r * r;
  }

  function specById(id) {
    for (var i = 0; i < NODES.length; i += 1) {
      if (NODES[i].id === id) return NODES[i];
    }
    return null;
  }

  function placeCard(id) {
    if (!card || !heroEl) return;
    if (window.innerWidth < 1024) {
      card.style.left = '';
      card.style.top = '';
      return;
    }
    var heroBox = heroEl.getBoundingClientRect();
    var copy = document.querySelector('.hero-copy');
    var actions = document.querySelector('.hero-actions');
    var heading = document.getElementById('hero-heading');
    var cardW = 336;
    var cardH = Math.max(card.offsetHeight || 0, 150);
    var left = copy ? copy.getBoundingClientRect().left : heroBox.left + 24;
    var top = actions
      ? Math.min(actions.getBoundingClientRect().bottom + 14, heroBox.bottom - cardH - 48)
      : heroBox.bottom - cardH - 56;
    var headingBox = heading ? heading.getBoundingClientRect() : null;
    if (headingBox && top < headingBox.bottom + 8) {
      top = headingBox.bottom + 16;
    }
    card.style.left = Math.round(left - heroBox.left) + 'px';
    card.style.top = Math.round(top - heroBox.top) + 'px';
  }

  function selectNode(id) {
    selectedId = id;
    var spec = specById(id);
    if (!spec) {
      if (card) card.hidden = true;
      if (hudStatus) hudStatus.textContent = 'Select a node';
      return;
    }
    if (hudStatus) hudStatus.textContent = spec.label;
    if (card && cardKicker && cardCopy && cardLink) {
      card.hidden = false;
      cardKicker.textContent = spec.label;
      cardCopy.textContent = spec.copy;
      cardLink.href = spec.href;
      cardLink.textContent = spec.linkLabel;
      requestAnimationFrame(function () {
        placeCard(id);
      });
    }
  }

  function pickEnemy(clientX, clientY) {
    var box = canvas.getBoundingClientRect();
    var x = ((clientX - box.left) / box.width) * w;
    var y = ((clientY - box.top) / box.height) * h;
    var best = null;
    var bestD = 36 * 36;
    enemies.forEach(function (en) {
      if (!en.alive || !en.labeled) return;
      var dx = en.x - x;
      var dy = en.y - y;
      var d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = en.tag;
      }
    });
    return best;
  }

  function drawSprite(spr, x, y, scale, angle) {
    ctx.save();
    ctx.translate(x, y);
    if (angle) ctx.rotate(angle);
    ctx.imageSmoothingEnabled = false;
    var dw = spr.w * scale;
    var dh = spr.h * scale;
    ctx.drawImage(spr.canvas, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  function projectButtons() {
    var rect = canvas.getBoundingClientRect();
    enemies.forEach(function (en) {
      if (!en.labeled) return;
      var btn = nodesRoot && nodesRoot.querySelector('[data-node="' + en.tag + '"]');
      if (!btn) return;
      btn.style.opacity = '1';
      var lx = en.formX || en.homeX;
      var ly = en.formY || en.homeY;
      var x = (lx / w) * rect.width;
      var y = (ly / h) * rect.height;
      btn.style.transform = 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%)';
    });
  }

  function step(dt) {
    time += dt;
    var sway = Math.sin(time * 0.85) * Math.min(28, battle.w * 0.045);

    var targetX = hasPointer
      ? battle.x + 24 + pointerX * (battle.w - 48)
      : battle.x + battle.w / 2 + Math.sin(time * 0.6) * battle.w * 0.22;
    player.x += (targetX - player.x) * Math.min(1, dt * 5.2);
    player.x = Math.max(battle.x + 18, Math.min(battle.x + battle.w - 18, player.x));
    player.cooldown -= dt;
    player.flash = Math.max(0, player.flash - dt);
    if (player.cooldown <= 0) {
      spawnShot(player.x, player.y - 14, -320, true);
      player.cooldown = 0.38;
    }

    nextDive -= dt;
    if (nextDive <= 0) {
      var candidates = enemies.filter(function (en) {
        return en.alive && en.mode === 'form';
      });
      if (candidates.length) {
        startDive(candidates[(Math.random() * candidates.length) | 0]);
      }
      nextDive = 2.4 + Math.random() * 1.8;
    }

    nextEnemyShot -= dt;
    if (nextEnemyShot <= 0) {
      var shooters = enemies.filter(function (en) {
        return en.alive;
      });
      if (shooters.length) {
        var sh = shooters[(Math.random() * shooters.length) | 0];
        spawnShot(sh.x, sh.y + 10, 150, false);
      }
      nextEnemyShot = 0.9 + Math.random() * 0.8;
    }

    enemies.forEach(function (en) {
      if (!en.alive) {
        en.respawn -= dt;
        if (en.respawn <= 0) {
          en.alive = true;
          en.mode = 'form';
          en.t = 0;
          en.x = en.homeX + sway;
          en.y = en.homeY;
        }
        return;
      }
      en.formX = en.homeX + sway;
      en.formY = en.homeY + Math.sin(time * 1.1 + en.col) * 4;
      if (en.mode === 'form') {
        en.x = en.formX;
        en.y = en.formY;
      } else {
        en.t += dt / 2.6;
        var t = en.t;
        if (t >= 1) {
          en.mode = 'form';
          en.t = 0;
        } else {
          en.x = bezier(en.fromX, en.c1x, en.c2x, en.homeX + sway, t);
          en.y = bezier(en.fromY, en.c1y, en.c2y, en.homeY, t);
        }
      }
    });

    for (var i = shots.length - 1; i >= 0; i -= 1) {
      var s = shots[i];
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0 || s.y < battle.y - 20 || s.y > battle.y + battle.h + 20) {
        shots.splice(i, 1);
        continue;
      }
      if (s.ally) {
        for (var j = 0; j < enemies.length; j += 1) {
          var en = enemies[j];
          if (!en.alive) continue;
          if (hitTest(s.x, s.y, en.x, en.y, 14)) {
            en.alive = false;
            en.respawn = 0.85;
            en.mode = 'form';
            burst(en.x, en.y, en.labeled ? C.cyanHi : C.orangeHi, isPhone ? 7 : 12);
            shots.splice(i, 1);
            break;
          }
        }
      } else if (hitTest(s.x, s.y, player.x, player.y, 13)) {
        player.flash = 0.18;
        burst(player.x, player.y - 4, C.orangeHi, 7);
        shots.splice(i, 1);
      }
    }

    for (var p = particles.length - 1; p >= 0; p -= 1) {
      var pt = particles[p];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 40 * dt;
      if (pt.life <= 0) particles.splice(p, 1);
    }

    stars.forEach(function (st) {
      st.y += (0.035 + st.z * 0.055) * dt;
      if (st.y > 1) {
        st.y -= 1;
        st.x = Math.random();
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (w >= 1024) {
      ctx.beginPath();
      ctx.rect(battle.x - 40, 0, w - battle.x + 40, h);
      ctx.clip();
    }

    stars.forEach(function (st) {
      var sx = battle.x + st.x * battle.w;
      var sy = st.y * h;
      ctx.globalAlpha = 0.25 + st.z * 0.4;
      ctx.fillStyle = C.star;
      ctx.fillRect(sx, sy, st.s, st.s);
    });
    ctx.globalAlpha = 1;

    shots.forEach(function (s) {
      ctx.fillStyle = s.ally ? C.cyanHi : C.orange;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(s.x - 3, s.y - (s.ally ? 8 : 6), 6, s.ally ? 12 : 10);
      ctx.globalAlpha = 1;
      ctx.fillRect(s.x - 1.5, s.y - (s.ally ? 8 : 6), 3, s.ally ? 11 : 9);
    });

    enemies.forEach(function (en) {
      if (!en.alive) return;
      var spr = en.labeled ? sprEnemyCyan : sprEnemyOrange;
      var ang = en.mode === 'dive' ? Math.atan2(player.y - en.y, player.x - en.x) - Math.PI / 2 : 0;
      if (en.mode === 'form') ang = 0;
      drawSprite(spr, en.x, en.y, en.scale, ang);
    });

    if (player.flash > 0) ctx.globalAlpha = 0.55 + Math.sin(time * 40) * 0.25;
    drawSprite(sprPlayer, player.x, player.y, player.scale, 0);
    ctx.globalAlpha = 1;

    particles.forEach(function (pt) {
      ctx.globalAlpha = Math.max(0, pt.life * 3);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 2, 2);
    });
    ctx.globalAlpha = 1;
    ctx.restore();
    projectButtons();
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (!last) last = now;
    var dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    frames += 1;
    fpsWindow += dt;
    if (fpsWindow >= 1) {
      fps = frames / fpsWindow;
      frames = 0;
      fpsWindow = 0;
    }
    if (!running) return;
    step(dt);
    draw();
  }

  function onPointerMove(event) {
    var box = canvas.getBoundingClientRect();
    if (box.width <= 0) return;
    var local = (event.clientX - box.left) / box.width;
    var bx = battle.x / w;
    var bw = battle.w / w;
    if (w >= 1024) {
      pointerX = Math.max(0, Math.min(1, (local - bx) / bw));
    } else {
      pointerX = Math.max(0, Math.min(1, local));
    }
    hasPointer = true;
  }

  function onPointerUp(event) {
    var id = pickEnemy(event.clientX, event.clientY);
    if (id) selectNode(id);
    else if (event.target === canvas) selectNode(null);
  }

  sceneRoot.addEventListener('pointermove', onPointerMove, { passive: true });
  sceneRoot.addEventListener('pointerleave', function () {
    hasPointer = false;
  });
  sceneRoot.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', resize);

  if (cardClose) {
    cardClose.addEventListener('click', function () {
      selectNode(null);
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') selectNode(null);
  });
  document.addEventListener('visibilitychange', function () {
    running = document.visibilityState === 'visible' && visible;
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        visible = entries[0] && entries[0].isIntersecting;
        running = document.visibilityState === 'visible' && visible;
      },
      { threshold: 0.08 }
    );
    io.observe(sceneRoot);
  }

  seedStars();
  resize();
  requestAnimationFrame(tick);
  document.documentElement.classList.add('scene-live');
  window.__ssScene = {
    ready: true,
    getFps: function () {
      return fps;
    },
    selectNode: selectNode
  };
})();
