/* Lazy-load the Galaga-style hero scene after first paint.
   Reduced-motion stays on the static SVG. */
(function () {
  'use strict';

  var sceneRoot = document.getElementById('hero-scene');
  var canvas = document.getElementById('hero-canvas');
  var card = document.getElementById('node-card');
  var cardKicker = document.getElementById('node-card-kicker');
  var cardCopy = document.getElementById('node-card-copy');
  var cardLink = document.getElementById('node-card-link');
  var cardClose = document.getElementById('node-card-close');
  var hudStatus = document.querySelector('[data-hud-status]');
  var nodesRoot = document.getElementById('scene-nodes');

  function goStatic() {
    document.documentElement.classList.remove('scene-live');
    document.documentElement.classList.add('scene-static');
    if (canvas) canvas.hidden = true;
  }

  function bindCards() {
    if (!nodesRoot) return;
    var buttons = nodesRoot.querySelectorAll('[data-node]');
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        if (!card || !cardKicker || !cardCopy || !cardLink) return;
        card.hidden = false;
        cardKicker.textContent = btn.getAttribute('data-label') || btn.textContent.trim();
        cardCopy.textContent = btn.getAttribute('data-copy') || '';
        cardLink.href = btn.getAttribute('data-href') || '#work';
        cardLink.textContent = btn.getAttribute('data-link') || 'See the work';
        if (hudStatus) hudStatus.textContent = cardKicker.textContent;
      });
    });
    if (cardClose) {
      cardClose.addEventListener('click', function () {
        if (card) card.hidden = true;
        if (hudStatus) hudStatus.textContent = 'Select a node';
      });
    }
  }

  function canvas2dOk() {
    try {
      return !!(canvas && canvas.getContext && canvas.getContext('2d'));
    } catch (err) {
      return false;
    }
  }

  if (!sceneRoot || !canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !canvas2dOk()) {
    goStatic();
    bindCards();
    return;
  }

  var loaded = false;
  function loadScene() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.src = 'assets/js/scene.js';
    s.async = true;
    s.onerror = function () {
      goStatic();
      bindCards();
    };
    document.head.appendChild(s);
  }

  function afterPaint(fn) {
    var run = function () {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(fn, { timeout: 1600 });
      } else {
        window.setTimeout(fn, 120);
      }
    };
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
  }

  afterPaint(loadScene);
})();
