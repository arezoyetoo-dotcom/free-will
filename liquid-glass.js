/**
 * Liquid Glass Physics & Refraction Interaction Engine
 * Inspired by dashersw/liquid-glass-js and @paper-design/liquid-logo.
 * Provides interactive optical sheen, dynamic specular highlights, tactile spring responses.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LiquidGlass = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class LiquidGlassEngine {
    constructor() {
      this.init();
    }

    init() {
      this.bindCardSpecularTracking();
      this.bindButtonHaptics();
    }

    bindCardSpecularTracking() {
      // Dynamic light reflection that tracks mouse position across glass elements
      document.addEventListener('mousemove', (e) => {
        const glassElements = document.querySelectorAll('.glass-panel, .liquid-glass-card, .liquid-glass-btn');
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        glassElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Check if mouse is near or inside element
          const padding = 60;
          if (
            mouseX >= rect.left - padding &&
            mouseX <= rect.right + padding &&
            mouseY >= rect.top - padding &&
            mouseY <= rect.bottom + padding
          ) {
            const relX = ((mouseX - rect.left) / rect.width) * 100;
            const relY = ((mouseY - rect.top) / rect.height) * 100;
            const angle = Math.atan2(mouseY - (rect.top + rect.height / 2), mouseX - (rect.left + rect.width / 2)) * (180 / Math.PI);

            el.style.setProperty('--glass-x', `${relX.toFixed(1)}%`);
            el.style.setProperty('--glass-y', `${relY.toFixed(1)}%`);
            el.style.setProperty('--glass-angle', `${angle.toFixed(1)}deg`);
          }
        });
      }, { passive: true });
    }

    bindButtonHaptics() {
      document.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest('.liquid-glass-btn, .action-btn');
        if (btn) {
          btn.style.transform = 'scale(0.96) translateY(1px)';
          btn.style.transition = 'transform 0.08s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
      }, { passive: true });

      const release = (e) => {
        const btn = e.target.closest('.liquid-glass-btn, .action-btn');
        if (btn) {
          btn.style.transform = '';
          btn.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
      };

      document.addEventListener('pointerup', release, { passive: true });
      document.addEventListener('pointercancel', release, { passive: true });
    }
  }

  return new LiquidGlassEngine();
}));
