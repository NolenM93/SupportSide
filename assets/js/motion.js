/* Support Side: GSAP entrance, section reveals, magnetic buttons.
   Skipped entirely when the user prefers reduced motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.documentElement.classList.add('has-motion');
  window.setTimeout(function () {
    document.documentElement.classList.remove('has-motion');
  }, 3500);

  function load(src, done) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = done;
    s.onerror = done;
    document.head.appendChild(s);
  }

  load('assets/vendor/gsap.min.js', function () {
    if (typeof gsap === 'undefined') {
      document.documentElement.classList.remove('has-motion');
      return;
    }
    load('assets/vendor/ScrollTrigger.min.js', init);
  });

  function init() {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    var heroLines = document.querySelectorAll('.hero-line');
    var heroLede = document.querySelector('.hero-lede');
    var heroActions = document.querySelector('.hero-actions');
    var kicker = document.querySelector('.hero .section-kicker');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (kicker) {
      tl.fromTo(kicker, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2);
    }
    if (heroLines.length) {
      tl.fromTo(heroLines, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.05, stagger: 0.12 }, 0.38);
    }
    if (heroLede) {
      tl.fromTo(heroLede, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.85 }, 0.72);
    }
    if (heroActions) {
      tl.fromTo(heroActions, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.9);
    }

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('.section-block').forEach(function (section) {
        gsap.from(section, {
          opacity: 0,
          y: 28,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 86%',
            once: true
          }
        });
      });
    }

    document.querySelectorAll('.js-magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (event) {
        var box = el.getBoundingClientRect();
        var x = event.clientX - (box.left + box.width / 2);
        var y = event.clientY - (box.top + box.height / 2);
        gsap.to(el, { x: x * 0.28, y: y * 0.38, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }
})();
