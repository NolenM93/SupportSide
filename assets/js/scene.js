/* Support Side: interactive support-network scene.
   Local business at the center, offerings as nodes, pulses inward.
   Pauses offscreen and when the tab is hidden. Caps DPR on phones. */
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

  if (!sceneRoot || !canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isPhone = window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 2;

  var NODES = [
    {
      id: 'sites',
      label: 'Websites',
      copy: 'A site customers can use, without an agency markup or a bloated subscription.',
      href: '#work',
      linkLabel: 'See the work',
      pos: [-1.32, 0.88, 0.38]
    },
    {
      id: 'booking',
      label: 'Booking tools',
      copy: 'A booking website for a local rental company: availability, reservations, and a flow customers can actually use.',
      href: '#work',
      linkLabel: 'See the work',
      pos: [1.2, 0.92, 0.22]
    },
    {
      id: 'apps',
      label: 'Apps',
      copy: 'I build safe, affordable software of any kind: sites, booking tools, apps, so local owners can stay on the actual work.',
      href: '#work',
      linkLabel: 'See the work',
      pos: [-0.72, -1.02, 0.78]
    },
    {
      id: 'care',
      label: 'Care plans',
      copy: 'Monthly plans that cover hosting oversight, updates, backups, uptime monitoring, and quick support when you need it.',
      href: 'plans.html',
      linkLabel: 'View plans',
      pos: [0.98, -0.92, -0.58]
    }
  ];

  function webglOk() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (err) {
      return false;
    }
  }

  function goStatic() {
    document.documentElement.classList.add('scene-static');
    canvas.hidden = true;
  }

  if (reduceMotion || !webglOk()) {
    goStatic();
    bindNodeButtons(null);
    return;
  }

  var started = false;
  var scripts = document.createElement('script');
  scripts.src = 'assets/vendor/three.min.js';
  scripts.onload = function () {
    if (typeof THREE === 'undefined') {
      goStatic();
      bindNodeButtons(null);
      return;
    }
    start();
  };
  scripts.onerror = function () {
    goStatic();
    bindNodeButtons(null);
  };
  document.head.appendChild(scripts);

  function glowTexture(r, g, b) {
    var c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    var ctx = c.getContext('2d');
    var grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
    grd.addColorStop(0.28, 'rgba(' + r + ',' + g + ',' + b + ',0.45)');
    grd.addColorStop(0.62, 'rgba(' + r + ',' + g + ',' + b + ',0.08)');
    grd.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function start() {
    if (started) return;
    started = true;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isPhone,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
    camera.position.set(0, 0.42, 11.4);
    camera.lookAt(0, 0, 0);

    var world = new THREE.Group();
    scene.add(world);

    scene.add(new THREE.AmbientLight(0x8ea4c4, 0.22));
    var fill = new THREE.DirectionalLight(0x7ed7ea, 0.55);
    fill.position.set(-3, 4, 6);
    scene.add(fill);
    var warmLight = new THREE.PointLight(0xffb089, 2.4, 12, 2);
    scene.add(warmLight);

    var cyanTex = glowTexture(34, 211, 238);
    var warmTex = glowTexture(255, 176, 137);

    var core = new THREE.Group();
    var coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, isPhone ? 16 : 28, isPhone ? 16 : 28),
      new THREE.MeshStandardMaterial({
        color: 0xffc4a8,
        emissive: 0xff9b6a,
        emissiveIntensity: 1.4,
        roughness: 0.35,
        metalness: 0.08
      })
    );
    core.add(coreMesh);
    var coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: warmTex,
        color: 0xffc09a,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.95
      })
    );
    coreGlow.scale.set(2.8, 2.8, 1);
    core.add(coreGlow);
    var coreHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: warmTex,
        color: 0xffe1cc,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.5
      })
    );
    coreHalo.scale.set(4.6, 4.6, 1);
    core.add(coreHalo);
    world.add(core);

    var nodeRecords = [];
    var pulses = [];
    var pickables = [];

    NODES.forEach(function (spec, index) {
      var group = new THREE.Group();
      group.position.fromArray(spec.pos);
      var chip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.07, 6),
        new THREE.MeshStandardMaterial({
          color: 0x145862,
          emissive: 0x22d3ee,
          emissiveIntensity: 0.85,
          roughness: 0.28,
          metalness: 0.22
        })
      );
      chip.rotation.x = Math.PI / 2;
      group.add(chip);
      var glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: cyanTex,
          color: 0x22d3ee,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0.8
        })
      );
      glow.scale.set(1.15, 1.15, 1);
      group.add(glow);
      var hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.userData.nodeId = spec.id;
      group.add(hit);
      world.add(group);
      pickables.push(hit);

      var lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3().fromArray(spec.pos),
        new THREE.Vector3(0, 0, 0)
      ]);
      var line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({
          color: 0x22d3ee,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      world.add(line);

      var pulseCount = isPhone ? 1 : 2;
      for (var p = 0; p < pulseCount; p += 1) {
        var pulse = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: cyanTex,
            color: 0xb6f6ff,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            opacity: 0.9
          })
        );
        pulse.scale.set(0.42, 0.42, 1);
        world.add(pulse);
        pulses.push({
          sprite: pulse,
          from: new THREE.Vector3().fromArray(spec.pos),
          t: (p / pulseCount) + index * 0.17,
          speed: 0.18 + (index % 3) * 0.03
        });
      }

      nodeRecords.push({ spec: spec, group: group, chip: chip, glow: glow, hit: hit });
    });

    var dustCount = isPhone ? 18 : 64;
    var dustGeo = new THREE.BufferGeometry();
    var dustPos = new Float32Array(dustCount * 3);
    for (var i = 0; i < dustCount; i += 1) {
      dustPos[i * 3] = (Math.random() - 0.5) * 8;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    var dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0x7ad7ea,
        size: 0.025,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    world.add(dust);

    var buttons = bindNodeButtons(selectNode);
    var raycaster = new THREE.Raycaster();
    var pointerNdc = new THREE.Vector2();
    var pointer = { x: 0, y: 0 };
    var pointerTarget = { x: 0, y: 0 };
    var selectedId = null;
    var hoveringId = null;
    var visible = true;
    var running = true;
    var camZ = 11.4;
    var camZTarget = isPhone ? 7.1 : 6.35;
    var clock = new THREE.Clock();
    var frames = 0;
    var fpsWindow = 0;
    var fps = 0;
    var tmp = new THREE.Vector3();
    var rect;

    function setPointerFromEvent(event) {
      rect = canvas.getBoundingClientRect();
      var cx = (event.clientX - rect.left) / rect.width;
      var cy = (event.clientY - rect.top) / rect.height;
      pointerTarget.x = (cx - 0.5) * 2;
      pointerTarget.y = (cy - 0.5) * 2;
      pointerNdc.x = cx * 2 - 1;
      pointerNdc.y = -(cy * 2 - 1);
    }

    function pickNode() {
      raycaster.setFromCamera(pointerNdc, camera);
      var hits = raycaster.intersectObjects(pickables, false);
      if (!hits.length) return null;
      return hits[0].object.userData.nodeId;
    }

    function layout() {
      rect = canvas.getBoundingClientRect();
      var w = Math.max(1, canvas.clientWidth);
      var h = Math.max(1, canvas.clientHeight);
      var dpr = Math.min(window.devicePixelRatio || 1, isPhone ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      world.position.x = w >= 1280 ? 1.32 : w >= 1024 ? 0.95 : 0;
      world.scale.setScalar(w < 640 ? 0.98 : w < 1024 ? 1.02 : 1);
      camZTarget = w < 640 ? 6.55 : w < 1024 ? 6.35 : 6.15;
    }

    function projectButtons() {
      if (!buttons.length) return;
      rect = canvas.getBoundingClientRect();
      nodeRecords.forEach(function (rec, i) {
        var btn = buttons[i];
        if (!btn) return;
        tmp.copy(rec.group.position).applyMatrix4(world.matrixWorld);
        tmp.project(camera);
        var x = (tmp.x * 0.5 + 0.5) * rect.width;
        var y = (-tmp.y * 0.5 + 0.5) * rect.height + 26;
        var pad = 56;
        x = Math.max(pad, Math.min(rect.width - pad, x));
        y = Math.max(28, Math.min(rect.height - 18, y));
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%)';
      });
    }

    function selectNode(id) {
      selectedId = id;
      var spec = null;
      NODES.forEach(function (n) {
        if (n.id === id) spec = n;
      });
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
      }
    }

    function onPointerMove(event) {
      setPointerFromEvent(event);
      hoveringId = pickNode();
      sceneRoot.style.cursor = hoveringId ? 'pointer' : '';
    }

    function onPointerLeave() {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      hoveringId = null;
      sceneRoot.style.cursor = '';
    }

    function onPointerUp(event) {
      setPointerFromEvent(event);
      var id = pickNode();
      if (id) selectNode(id);
      else if (event.target === canvas) selectNode(null);
    }

    sceneRoot.addEventListener('pointermove', onPointerMove, { passive: true });
    sceneRoot.addEventListener('pointerleave', onPointerLeave);
    sceneRoot.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', layout);

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

    function tick() {
      requestAnimationFrame(tick);
      var dt = Math.min(clock.getDelta(), 0.05);
      frames += 1;
      fpsWindow += dt;
      if (fpsWindow >= 1) {
        fps = frames / fpsWindow;
        frames = 0;
        fpsWindow = 0;
      }
      if (!running) return;

      camZ += (camZTarget - camZ) * (1 - Math.exp(-dt * 1.6));
      camera.position.z = camZ;
      pointer.x += (pointerTarget.x - pointer.x) * (1 - Math.exp(-dt * 3.2));
      pointer.y += (pointerTarget.y - pointer.y) * (1 - Math.exp(-dt * 3.2));

      var t = clock.elapsedTime;
      world.rotation.y = pointer.x * 0.38 + Math.sin(t * 0.23) * 0.08;
      world.rotation.x = -pointer.y * 0.22 + Math.sin(t * 0.17) * 0.04;
      core.rotation.y = t * 0.12;
      var pulse = 1 + Math.sin(t * 1.6) * 0.045;
      coreGlow.scale.set(2.8 * pulse, 2.8 * pulse, 1);
      warmLight.intensity = 2.2 + Math.sin(t * 1.6) * 0.25;

      nodeRecords.forEach(function (rec) {
        var hot = rec.spec.id === selectedId || rec.spec.id === hoveringId;
        var s = hot ? 1.18 : 1;
        rec.group.scale.setScalar(rec.group.scale.x + (s - rec.group.scale.x) * 0.12);
        rec.glow.material.opacity = hot ? 1 : 0.72;
      });

      pulses.forEach(function (p) {
        p.t += dt * p.speed;
        if (p.t > 1) p.t -= 1;
        var ease = p.t * p.t;
        p.sprite.position.lerpVectors(p.from, core.position, ease);
        var near = ease * ease;
        p.sprite.material.color.setRGB(0.55 + near * 0.45, 0.72 - near * 0.2, 0.82 - near * 0.4);
      });

      dust.rotation.y = t * 0.02;
      projectButtons();
      renderer.render(scene, camera);
    }

    layout();
    projectButtons();
    tick();

    window.__ssScene = {
      ready: true,
      getFps: function () { return fps; },
      selectNode: selectNode
    };
  }

  function bindNodeButtons(onSelect) {
    if (!nodesRoot) return [];
    var buttons = [];
    NODES.forEach(function (spec) {
      var btn = nodesRoot.querySelector('[data-node="' + spec.id + '"]');
      if (!btn) return;
      buttons.push(btn);
      btn.addEventListener('click', function () {
        if (onSelect) onSelect(spec.id);
        else {
          if (hudStatus) hudStatus.textContent = spec.label;
          if (card && cardKicker && cardCopy && cardLink) {
            card.hidden = false;
            cardKicker.textContent = spec.label;
            cardCopy.textContent = spec.copy;
            cardLink.href = spec.href;
            cardLink.textContent = spec.linkLabel;
          }
        }
      });
    });
    return buttons;
  }
})();
