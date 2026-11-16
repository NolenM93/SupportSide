/* Support Side: shared UI behavior
   Mobile nav, scrolled nav state, and scroll-reveal motion.
   All motion is skipped when the user prefers reduced motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var studioLinks = document.querySelectorAll('[data-studio-url]');
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    studioLinks.forEach(function (link) {
      link.setAttribute('href', 'http://localhost:3000');
    });
  }

  /* ---------- Mobile menu ---------- */

  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }

  window.closeMobileMenu = function () {
    setMenu(false);
  };

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(mobileMenu.classList.contains('hidden'));
    });

    document.addEventListener('click', function (e) {
      if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- Nav gains depth once the page scrolls ---------- */

  var nav = document.querySelector('.site-nav');

  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        nav.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Plan get-started modal ---------- */

  var planModal = document.getElementById('plan-modal');
  var planModalPanel = planModal && planModal.querySelector('[role="dialog"]');
  var planModalTitle = document.getElementById('plan-modal-title');
  var planModalEmail = document.getElementById('plan-modal-email');
  var planModalTriggers = document.querySelectorAll('.js-plan-start');
  var planModalLastFocus = null;
  var PLAN_CONTACT_EMAIL = 'nolenmillington@supportsidetech.com';

  function planModalFocusables() {
    if (!planModalPanel) return [];
    return Array.prototype.filter.call(
      planModalPanel.querySelectorAll('a[href], button:not([disabled])'),
      function (el) {
        return el.offsetWidth > 0 && el.offsetHeight > 0;
      }
    );
  }

  function setPlanPageInert(inert) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === planModal) return;
      el.inert = inert;
    });
  }

  function closePlanModal() {
    if (!planModal || planModal.hidden) return;
    planModal.hidden = true;
    document.body.style.overflow = '';
    setPlanPageInert(false);
    if (planModalLastFocus && typeof planModalLastFocus.focus === 'function') {
      planModalLastFocus.focus();
    }
    planModalLastFocus = null;
  }

  function openPlanModal(trigger) {
    if (!planModal || !planModalPanel || !planModalTitle || !planModalEmail) return;
    var planName = (trigger && trigger.getAttribute('data-plan')) || 'this plan';
    planModalTitle.textContent = 'Get started with ' + planName;
    planModalEmail.setAttribute(
      'href',
      'mailto:' + PLAN_CONTACT_EMAIL + '?subject=' + encodeURIComponent(planName)
    );
    planModalLastFocus = trigger || document.activeElement;
    planModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setPlanPageInert(true);
    planModalPanel.focus();
  }

  if (planModal && planModalPanel && planModalTriggers.length) {
    planModalTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openPlanModal(trigger);
      });
    });

    planModal.addEventListener('click', function (e) {
      if (e.target === planModal || (e.target.closest && e.target.closest('[data-plan-modal-close]'))) {
        closePlanModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (planModal.hidden) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closePlanModal();
        return;
      }

      if (e.key !== 'Tab') return;

      var list = planModalFocusables();
      if (!list.length) {
        e.preventDefault();
        planModalPanel.focus();
        return;
      }

      var first = list[0];
      var last = list[list.length - 1];
      var active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === planModalPanel || !planModalPanel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Scroll reveal ---------- */

  var revealables = document.querySelectorAll('.reveal');

  if (!revealables.length) return;

  // No observer support or reduced motion: show everything immediately.
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  revealables.forEach(function (el) {
    observer.observe(el);
  });
})();
