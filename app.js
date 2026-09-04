// Free Will: Real or Fake? - Core Application Engine
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Canvases & Labs
  let dominoSim = null;
  let libetSim = null;

  try {
    dominoSim = new DominoCanvas('domino-canvas');
  } catch (e) {
    console.error("Failed to init DominoCanvas", e);
  }

  try {
    libetSim = new LibetExperiment('libet-clock-canvas', 'libet-eeg-canvas');
  } catch (e) {
    console.error("Failed to init LibetExperiment", e);
  }

  
  // 0. Initialize WebGL ShaderGradient & Liquid Glass Systems
  let shaderEngine = null;
  try {
    if (typeof ShaderGradient !== 'undefined') {
      shaderEngine = new ShaderGradient('shader-gradient-canvas');
    }
  } catch (e) {
    console.warn('[ShaderGradient] Engine init fallback:', e);
  }

  const cyclePaletteBtn = document.getElementById('cycle-palette-btn');
  const paletteNameEl = document.getElementById('palette-name');
  if (cyclePaletteBtn && shaderEngine) {
    cyclePaletteBtn.addEventListener('click', () => {
      const nextP = shaderEngine.nextPalette();
      if (paletteNameEl) {
        paletteNameEl.textContent = nextP.name.split(' ')[0];
      }
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }

  // Theme Management (Radiant Sunlight ☀️ vs Luminous Aurora ✨)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIconEl = document.getElementById('theme-icon');
  const themeLabelEl = document.getElementById('theme-label');

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (themeIconEl) themeIconEl.textContent = '✨';
      if (themeLabelEl) themeLabelEl.textContent = 'Aurora';
    } else {
      document.documentElement.classList.remove('dark');
      if (themeIconEl) themeIconEl.textContent = '☀️';
      if (themeLabelEl) themeLabelEl.textContent = 'Radiant';
    }
    try {
      localStorage.setItem('fw_theme', isDark ? 'dark' : 'light');
    } catch (e) {}
    updateAllChartsTheme();
  }

  // Initialize theme from storage (Default to Radiant / Bright)
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('fw_theme');
  } catch (e) {}
  
  if (savedTheme === 'dark') {
    applyTheme(true);
  } else {
    applyTheme(false); // Bright & Happy by default!
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(!isDark);
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }

  // Hero Deck Button
  const heroDeckBtn = document.getElementById('hero-demo-deck-btn');
  if (heroDeckBtn) {
    heroDeckBtn.addEventListener('click', () => {
      setMode('deck');
    });
  }

  // 2. Audio Ambience Toggle
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioStatus = document.getElementById('audio-status-text');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const active = window.soundEngine.toggleMute();
      if (audioStatus) {
        audioStatus.textContent = active ? "Audio: ON (Ambient Synth)" : "Audio: MUTED";
      }
      audioBtn.classList.toggle('active', active);
    });
  }

  // 3. View Mode Switching (Odyssey vs Presentation Deck)
  const modeOdysseyBtn = document.getElementById('mode-odyssey-btn');
  const modeDeckBtn = document.getElementById('mode-deck-btn');
  const odysseyView = document.getElementById('odyssey-view');
  const deckView = document.getElementById('deck-view');

  function setMode(mode) {
    if (mode === 'deck') {
      odysseyView.classList.add('hidden');
      deckView.classList.remove('hidden');
      modeDeckBtn.classList.add('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
      modeOdysseyBtn.classList.remove('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
      window.soundEngine.playClick();
    } else {
      deckView.classList.add('hidden');
      odysseyView.classList.remove('hidden');
      modeOdysseyBtn.classList.add('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
      modeDeckBtn.classList.remove('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
      window.soundEngine.playClick();
    }
  }

  if (modeOdysseyBtn && modeDeckBtn) {
    modeOdysseyBtn.addEventListener('click', () => setMode('odyssey'));
    modeDeckBtn.addEventListener('click', () => setMode('deck'));
  }

  // 4. Slide Deck Controller (14 Slides Master Curriculum)
  let currentSlide = 0;
  const slides = document.querySelectorAll('.deck-slide');
  const totalSlides = slides.length;
  const slideNumEl = document.getElementById('deck-slide-num');
  const slideProgressEl = document.getElementById('deck-progress-bar');
  const prevSlideBtn = document.getElementById('deck-prev-btn');
  const nextSlideBtn = document.getElementById('deck-next-btn');
  const toggleNotesBtn = document.getElementById('deck-notes-toggle');
  const notesDrawer = document.getElementById('deck-notes-drawer');
  const fullscreenBtn = document.getElementById('deck-fullscreen-btn');

  
  // =========================================================================
  // CHART.JS PRESENTATION SLIDE DATA VISUALIZATION ENGINE
  // =========================================================================
  const deckCharts = {};

  function isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }

  function getTextColor() {
    return isDarkMode() ? '#cbd5e1' : '#334155';
  }

  function getGridColor() {
    return isDarkMode() ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)';
  }

  function initOrUpdateSlideCharts(slideIdx) {
    if (typeof Chart === 'undefined') return;

    // Slide 1 (0-indexed): Slide 02 / Consensus Donut
    if (slideIdx === 1) {
      const el = document.getElementById('deck-chart-survey');
      if (el && !deckCharts.survey) {
        deckCharts.survey = new Chart(el, {
          type: 'doughnut',
          data: {
            labels: ['Compatibilism (Agency in Nature)', 'Libertarian Free Will', 'Hard Determinism (Zero Agency)', 'Other / Agnostic'],
            datasets: [{
              data: [59.2, 18.8, 11.2, 10.8],
              backgroundColor: ['#06b6d4', '#f59e0b', '#f43f5e', '#a855f7'],
              borderColor: isDarkMode() ? '#0f172a' : '#ffffff',
              borderWidth: 3,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { animateScale: true, animateRotate: true, duration: 1000 },
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: getTextColor(), font: { size: 11, family: 'Inter' }, boxWidth: 14 }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
                }
              }
            },
            cutout: '64%'
          }
        });
      } else if (deckCharts.survey) {
        deckCharts.survey.resize();
      }
    }

    // Slide 3: Slide 04 / Libet EEG Readiness Potential Curve
    if (slideIdx === 3) {
      const el = document.getElementById('deck-chart-libet');
      if (el && !deckCharts.libet) {
        deckCharts.libet = new Chart(el, {
          type: 'line',
          data: {
            labels: ['-1000ms', '-800ms', '-550ms (RP Starts)', '-400ms', '-200ms (Conscious Urge W)', '-100ms', '0ms (Action)'],
            datasets: [
              {
                label: 'SMA Readiness Potential (μV)',
                data: [0, -0.6, -2.1, -3.8, -5.4, -6.2, -7.1],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointRadius: [2, 3, 7, 3, 9, 3, 9],
                pointBackgroundColor: ['#38bdf8', '#38bdf8', '#fbbf24', '#38bdf8', '#f43f5e', '#38bdf8', '#34d399']
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900 },
            scales: {
              y: {
                reverse: true,
                title: { display: true, text: 'Cortical Potential (μV)', color: getTextColor() },
                ticks: { color: getTextColor() },
                grid: { color: getGridColor() }
              },
              x: {
                ticks: { color: getTextColor() },
                grid: { color: getGridColor() }
              }
            },
            plugins: {
              legend: { labels: { color: getTextColor(), font: { size: 11 } } }
            }
          }
        });
      } else if (deckCharts.libet) {
        deckCharts.libet.resize();
      }
    }

    // Slide 4: Slide 05 / Haynes fMRI BA10 Predictive Accuracy
    if (slideIdx === 4) {
      const el = document.getElementById('deck-chart-haynes');
      if (el && !deckCharts.haynes) {
        deckCharts.haynes = new Chart(el, {
          type: 'line',
          data: {
            labels: ['-10s', '-8s', '-6s', '-4s', '-2s', '-1s', '0s (Awareness)'],
            datasets: [
              {
                label: 'BA10 Choice Decoding Accuracy (%)',
                data: [50, 58.8, 60.5, 63.2, 66.4, 76.5, 100],
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointRadius: 6,
                pointBackgroundColor: '#a855f7'
              },
              {
                label: 'Random Chance Baseline (50%)',
                data: [50, 50, 50, 50, 50, 50, 50],
                borderColor: '#94a3b8',
                borderWidth: 2,
                borderDash: [6, 4],
                fill: false,
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900 },
            scales: {
              y: {
                min: 45,
                max: 105,
                title: { display: true, text: 'Decoding Precision (%)', color: getTextColor() },
                ticks: { color: getTextColor() },
                grid: { color: getGridColor() }
              },
              x: {
                ticks: { color: getTextColor() },
                grid: { color: getGridColor() }
              }
            },
            plugins: {
              legend: { labels: { color: getTextColor(), font: { size: 11 } } }
            }
          }
        });
      } else if (deckCharts.haynes) {
        deckCharts.haynes.resize();
      }
    }

    // Slide 5: Slide 06 / Schurger Stochastic Noise Model
    if (slideIdx === 5) {
      const el = document.getElementById('deck-chart-schurger');
      if (el && !deckCharts.schurger) {
        deckCharts.schurger = new Chart(el, {
          type: 'line',
          data: {
            labels: ['0ms', '200ms', '400ms', '600ms', '800ms', '1000ms', '1200ms', '1400ms'],
            datasets: [
              {
                label: 'Spontaneous Neural Drift',
                data: [0.15, 0.28, 0.22, 0.48, 0.39, 0.68, 0.74, 0.94],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#10b981'
              },
              {
                label: 'Motor Decision Boundary',
                data: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
                borderColor: '#f43f5e',
                borderWidth: 2,
                borderDash: [6, 4],
                fill: false,
                pointRadius: 0
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900 },
            scales: {
              y: {
                min: 0,
                max: 1.1,
                title: { display: true, text: 'Accumulated Signal', color: getTextColor() },
                ticks: { color: getTextColor() },
                grid: { color: getGridColor() }
              },
              x: {
                ticks: { color: getTextColor() },
                grid: { color: getGridColor() }
              }
            },
            plugins: {
              legend: { labels: { color: getTextColor(), font: { size: 11 } } }
            }
          }
        });
      } else if (deckCharts.schurger) {
        deckCharts.schurger.resize();
      }
    }

    // Slide 10: Slide 11 / Public Health Quarantine Justice Recidivism
    if (slideIdx === 10) {
      const el = document.getElementById('deck-chart-justice');
      if (el && !deckCharts.justice) {
        deckCharts.justice = new Chart(el, {
          type: 'bar',
          data: {
            labels: ['Retributive Punishment (Blame-Based)', 'Restorative Quarantine (Nordic Model)'],
            datasets: [
              {
                label: '2-Year Recidivism Rate (%)',
                data: [68.0, 20.0],
                backgroundColor: ['#f43f5e', '#10b981'],
                borderRadius: 8
              },
              {
                label: 'Rehabilitation & Public Safety Index (/100)',
                data: [32.0, 88.0],
                backgroundColor: ['#94a3b8', '#06b6d4'],
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900 },
            scales: {
              y: {
                max: 100,
                ticks: { color: getTextColor() },
                grid: { color: getGridColor() }
              },
              x: {
                ticks: { color: getTextColor(), font: { size: 10 } },
                grid: { display: false }
              }
            },
            plugins: {
              legend: { labels: { color: getTextColor(), font: { size: 11 } } }
            }
          }
        });
      } else if (deckCharts.justice) {
        deckCharts.justice.resize();
      }
    }

    // Slide 12: Slide 13 / The Agency Dividend & Flourishing
    if (slideIdx === 12) {
      const el = document.getElementById('deck-chart-agency');
      if (el && !deckCharts.agency) {
        deckCharts.agency = new Chart(el, {
          type: 'radar',
          data: {
            labels: ['Prosocial Empathy', 'Goal Persistence', 'Mental Resilience', 'Moral Accountability', 'Growth Mindset'],
            datasets: [
              {
                label: 'Nihilistic Fatalism ("I have no control")',
                data: [35, 28, 40, 32, 25],
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.25)',
                borderWidth: 2,
                pointRadius: 4
              },
              {
                label: 'Conscious Agency ("I author my actions")',
                data: [88, 92, 85, 90, 95],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.28)',
                borderWidth: 2,
                pointRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000 },
            scales: {
              r: {
                min: 0,
                max: 100,
                ticks: { display: false },
                pointLabels: { color: getTextColor(), font: { size: 10, family: 'Inter' } },
                grid: { color: getGridColor() },
                angleLines: { color: getGridColor() }
              }
            },
            plugins: {
              legend: { labels: { color: getTextColor(), font: { size: 11 } } }
            }
          }
        });
      } else if (deckCharts.agency) {
        deckCharts.agency.resize();
      }
    }
  }

  function updateAllChartsTheme() {
    Object.values(deckCharts).forEach((chart) => {
      if (!chart) return;
      if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = getTextColor();
      }
      if (chart.options.scales) {
        if (chart.options.scales.x) {
          if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = getTextColor();
          if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = getGridColor();
        }
        if (chart.options.scales.y) {
          if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = getTextColor();
          if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = getGridColor();
          if (chart.options.scales.y.title) chart.options.scales.y.title.color = getTextColor();
        }
        if (chart.options.scales.r) {
          if (chart.options.scales.r.pointLabels) chart.options.scales.r.pointLabels.color = getTextColor();
          if (chart.options.scales.r.grid) chart.options.scales.r.grid.color = getGridColor();
          if (chart.options.scales.r.angleLines) chart.options.scales.r.angleLines.color = getGridColor();
        }
      }
      chart.update();
    });
  }


  function updateSlide(newIdx) {
    if (newIdx < 0 || newIdx >= totalSlides) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = newIdx;
    slides[currentSlide].classList.add('active');

    if (slideNumEl) {
      slideNumEl.textContent = `Slide ${currentSlide + 1} of ${totalSlides}`;
    }
    if (slideProgressEl) {
      slideProgressEl.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
    }

    // Update Speaker Notes Content
    const activeSlide = slides[currentSlide];
    const notesContent = activeSlide.getAttribute('data-notes') || "No notes for this slide.";
    const notesTextEl = document.getElementById('deck-notes-text');
    if (notesTextEl) {
      notesTextEl.textContent = notesContent;
    }

    window.soundEngine.playClick();
    initOrUpdateSlideCharts(currentSlide);
  }

  if (prevSlideBtn && nextSlideBtn) {
    prevSlideBtn.addEventListener('click', () => updateSlide(currentSlide - 1));
    nextSlideBtn.addEventListener('click', () => updateSlide(currentSlide + 1));
  }

  if (toggleNotesBtn && notesDrawer) {
    toggleNotesBtn.addEventListener('click', () => {
      notesDrawer.classList.toggle('hidden');
      toggleNotesBtn.classList.toggle('bg-amber-500/20');
      window.soundEngine.playClick();
    });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      deckView.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  // Keyboard navigation for Deck
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (!deckView.classList.contains('hidden')) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        updateSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        updateSlide(currentSlide - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        if (toggleNotesBtn) toggleNotesBtn.click();
      } else if (e.key === 'Escape') {
        if (notesDrawer && !notesDrawer.classList.contains('hidden')) {
          notesDrawer.classList.add('hidden');
        }
      }
    }

    if (e.key === 'm' || e.key === 'M') {
      if (audioBtn) audioBtn.click();
    }
    if (e.key === 'o' || e.key === 'O') {
      setMode('odyssey');
    }
    if (e.key === 't' || e.key === 'T') {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(!isDark);
      return;
    }
    if (e.key === 'p' || e.key === 'P') {
      setMode('deck');
    }
  });

  // 5. Crossroads Simulator
  const btnPathLeft = document.getElementById('path-left-btn');
  const btnPathRight = document.getElementById('path-right-btn');
  const btnPathCenter = document.getElementById('path-center-btn');
  const crossroadsResult = document.getElementById('crossroads-result');
  const crossroadsAnalysis = document.getElementById('crossroads-analysis');

  function selectCrossroadPath(path) {
    if (window.soundEngine) window.soundEngine.playCrossroadsSweep(path);
    if (!crossroadsResult || !crossroadsAnalysis) return;

    crossroadsResult.classList.remove('hidden');
    let message = "";
    if (path === 'left') {
      message = "You chose the LEFT PATH (Path A). You felt autonomous. But why left? Was it because your eyes scanned left-to-right? Were your motor neurons pre-biased by your dominant hand? A supercomputer computing your neuron states at that exact millisecond could have calculated your finger movement before you consciously felt the urge.";
    } else if (path === 'right') {
      message = "You chose the RIGHT PATH (Path B). Did you choose right to prove you had free will, or did the impulse arise spontaneously from subcortical dopamine pathways? Every reason you generate right now is a retroactive narrative your prefrontal cortex created to justify an action already taken.";
    } else {
      message = "You attempted to REJECT THE BINARY. But this defiance was also caused by your prior beliefs, skepticism, and personality traits formed by genetics and your life history. Defiance is not an escape from causality; it is simply another link in the chain.";
    }

    crossroadsAnalysis.textContent = message;
  }

  if (btnPathLeft) btnPathLeft.addEventListener('click', () => selectCrossroadPath('left'));
  if (btnPathRight) btnPathRight.addEventListener('click', () => selectCrossroadPath('right'));
  if (btnPathCenter) btnPathCenter.addEventListener('click', () => selectCrossroadPath('center'));

  // 6. Upgraded Domino Controls
  const pushDominoBtn = document.getElementById('push-domino-btn');
  const resetDominoBtn = document.getElementById('reset-domino-btn');
  const interveneDominoBtn = document.getElementById('intervene-domino-btn');
  const pauseDominoBtn = document.getElementById('pause-domino-btn');
  const stepDominoBtn = document.getElementById('step-domino-btn');
  const speedDominoBtns = document.querySelectorAll('.domino-speed-btn');
  const labelModeBtn = document.getElementById('domino-label-mode-btn');

  if (pushDominoBtn && dominoSim) {
    pushDominoBtn.addEventListener('click', () => dominoSim.pushFirst());
  }
  if (resetDominoBtn && dominoSim) {
    resetDominoBtn.addEventListener('click', () => dominoSim.reset());
  }
  if (interveneDominoBtn && dominoSim) {
    interveneDominoBtn.addEventListener('click', () => dominoSim.intervene());
  }
  if (pauseDominoBtn && dominoSim) {
    pauseDominoBtn.addEventListener('click', () => {
      const paused = dominoSim.togglePause();
      pauseDominoBtn.innerHTML = paused ? "<span>▶ Resume</span>" : "<span>⏸ Pause</span>";
      pauseDominoBtn.classList.toggle('border-amber-500', paused);
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }
  if (stepDominoBtn && dominoSim) {
    stepDominoBtn.addEventListener('click', () => {
      dominoSim.stepForward();
      if (pauseDominoBtn) pauseDominoBtn.innerHTML = "<span>▶ Resume</span>";
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }
  if (speedDominoBtns && dominoSim) {
    speedDominoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speedDominoBtns.forEach(b => b.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border', 'border-cyan-500/40'));
        btn.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border', 'border-cyan-500/40');
        const speed = parseFloat(btn.getAttribute('data-speed')) || 1.0;
        dominoSim.setSpeed(speed);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }
  if (labelModeBtn && dominoSim) {
    labelModeBtn.addEventListener('click', () => {
      const newMode = dominoSim.labelMode === 'cosmic' ? 'physics' : 'cosmic';
      dominoSim.setLabelMode(newMode);
      labelModeBtn.textContent = newMode === 'cosmic' 
        ? "🏷️ Cosmic Causal Chain (Big Bang → You)" 
        : "🏷️ Classical Physics (C-1 → C-14)";
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }

  // 7. Neuroscience Protocols (Libet, Haynes, Schurger)
  const libetTriggerBtn = document.getElementById('libet-trigger-btn');
  const libetResetBtn = document.getElementById('libet-reset-btn');
  const neuroTabBtns = document.querySelectorAll('.neuro-tab-btn');
  const neuroTitleEl = document.getElementById('neuro-protocol-title');
  const neuroDescEl = document.getElementById('neuro-protocol-desc');

  if (libetTriggerBtn && libetSim) {
    libetTriggerBtn.addEventListener('click', () => libetSim.triggerAction());
  }
  if (libetResetBtn && libetSim) {
    libetResetBtn.addEventListener('click', () => libetSim.reset());
  }

  if (neuroTabBtns && libetSim) {
    neuroTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        neuroTabBtns.forEach(b => b.classList.remove('active', 'bg-rose-500/20', 'text-rose-300', 'border', 'border-rose-500/40'));
        btn.classList.add('active', 'bg-rose-500/20', 'text-rose-300', 'border', 'border-rose-500/40');
        const mode = btn.getAttribute('data-mode') || 'libet';
        libetSim.setComparison(mode);

        if (mode === 'haynes') {
          if (neuroTitleEl) neuroTitleEl.textContent = "John-Dylan Haynes (2008) fMRI Decoding Replica";
          if (neuroDescEl) neuroDescEl.textContent = "Max Planck fMRI pattern decoding: Frontopolar cortex (BA10) activity reveals the decision 7 to 10 seconds before conscious awareness. Press action to simulate fMRI prediction.";
        } else if (mode === 'schurger') {
          if (neuroTitleEl) neuroTitleEl.textContent = "Aaron Schurger (2012) Stochastic Accumulator Replica";
          if (neuroDescEl) neuroDescEl.textContent = "Stochastic accumulator model: spontaneous background neural noise drifts until it randomly crosses the motor threshold. The urge is constructed at the threshold, not before.";
        } else {
          if (neuroTitleEl) neuroTitleEl.textContent = "Benjamin Libet (1983) Oscilloscope Replica";
          if (neuroDescEl) neuroDescEl.textContent = "Watch the revolving phosphor spot below. Whenever you feel a spontaneous 'urge' to act, press the action button or hit SPACEBAR.";
        }

        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  // 7B. Harry Frankfurt Counterexample Simulator
  const frankfurtVoteABtn = document.getElementById('frankfurt-vote-a-btn');
  const frankfurtVoteBBtn = document.getElementById('frankfurt-vote-b-btn');
  const frankfurtChipStatus = document.getElementById('frankfurt-chip-status');
  const frankfurtVoteCast = document.getElementById('frankfurt-vote-cast');
  const frankfurtAlternatePoss = document.getElementById('frankfurt-alternate-poss');
  const frankfurtMoralResp = document.getElementById('frankfurt-moral-resp');
  const frankfurtAnalysisText = document.getElementById('frankfurt-analysis-text');

  if (frankfurtVoteABtn) {
    frankfurtVoteABtn.addEventListener('click', () => {
      if (frankfurtChipStatus) {
        frankfurtChipStatus.textContent = "DORMANT (0% INTERVENTION)";
        frankfurtChipStatus.className = "text-emerald-400 font-bold";
      }
      if (frankfurtVoteCast) frankfurtVoteCast.textContent = "Candidate A (Voluntary Choice)";
      if (frankfurtAlternatePoss) frankfurtAlternatePoss.textContent = "NO (Black would have intervened)";
      if (frankfurtMoralResp) {
        frankfurtMoralResp.textContent = "YES (Autonomous Volition)";
        frankfurtMoralResp.className = "text-emerald-400 font-bold";
      }
      if (frankfurtAnalysisText) {
        frankfurtAnalysisText.textContent = "Jones chose Candidate A entirely on his own volition. Black's neural chip remained 100% dormant. Even though Jones literally could not have done otherwise, he is fully morally responsible! Harry Frankfurt proved that moral accountability does not require alternate possibilities.";
      }
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }

  if (frankfurtVoteBBtn) {
    frankfurtVoteBBtn.addEventListener('click', () => {
      if (frankfurtChipStatus) {
        frankfurtChipStatus.textContent = "OVERRIDE TRIGGERED (100% INTERVENTION)";
        frankfurtChipStatus.className = "text-rose-400 font-bold animate-pulse";
      }
      if (frankfurtVoteCast) frankfurtVoteCast.textContent = "Candidate A (FORCED by Chip)";
      if (frankfurtAlternatePoss) frankfurtAlternatePoss.textContent = "NO (Forced by Chip)";
      if (frankfurtMoralResp) {
        frankfurtMoralResp.textContent = "NO (Coerced by Neural Override)";
        frankfurtMoralResp.className = "text-rose-400 font-bold";
      }
      if (frankfurtAnalysisText) {
        frankfurtAnalysisText.textContent = "Jones hesitated and began to lean toward Candidate B. Black's chip instantly activated and physically hijacked Jones's motor cortex, forcing him to vote Candidate A. Here, Jones is NOT morally responsible because he was coerced.";
      }
      if (window.soundEngine) {
        window.soundEngine.playNeuralBeep(440);
        window.soundEngine.playClick();
      }
    });
  }

  // 7C. Robert Sapolsky Multiscale Causal Explorer
  const sapolskyBtns = document.querySelectorAll('.sapolsky-layer-btn');
  const sapolskyTitle = document.getElementById('sapolsky-layer-title');
  const sapolskySubstrate = document.getElementById('sapolsky-layer-substrate');
  const sapolskyDesc = document.getElementById('sapolsky-layer-desc');

  const sapolskyLayers = {
    second: {
      title: "1 Second Before Action",
      substrate: "Substrate: Amygdala, Insula & Prefrontal Cortex",
      desc: "In the millisecond window preceding behavior, an action potential races across the axon hillock. Did the prefrontal cortex successfully suppress the amygdala's impulse, or did the amygdala dominate? This instantaneous electrochemical balance was determined by the molecular environment of the previous seconds."
    },
    minutes: {
      title: "Minutes Before Action",
      substrate: "Substrate: Sensory Stimuli, Ambient Temperature & Olfaction",
      desc: "Minutes earlier, sensory inputs primed the nervous system. The smell of fresh bread, an ambient drop in room temperature, or a passing hostile facial expression subtly biased dopamine receptors. Humans routinely invent noble post-hoc explanations for actions triggered by unconscious environmental priming."
    },
    hours: {
      title: "Hours to Days Prior",
      substrate: "Substrate: Circulating Testosterone, Cortisol & Blood Glucose",
      desc: "Hours earlier, circulating endocrine hormones set cortical responsiveness. Elevated cortisol lowers sensory thresholds for threat perception; elevated testosterone amplifies amygdala reactivity; low blood glucose impairs executive willpower in the anterior cingulate. You didn't choose your hormone levels."
    },
    months: {
      title: "Weeks to Months Prior",
      substrate: "Substrate: Neuroplasticity & Dendritic Spine Remodeling",
      desc: "Prolonged stress or trauma physically expands dendrites in the basolateral amygdala while shrinking dendritic arborization in the hippocampus and prefrontal cortex. The structural architecture of your brain was remodeled by past environmental stressors long before this decision."
    },
    adolescence: {
      title: "Adolescence & Early Life",
      substrate: "Substrate: Frontal Cortex Myelination & Synaptic Pruning",
      desc: "The frontal cortex is the last brain region to fully develop, completing myelination around age 25. High-risk behaviors, emotional volatility, and identity consolidation in youth permanently mold the neural pathways that dictate adult impulse control."
    },
    genes: {
      title: "Fetal Life & Genetics",
      substrate: "Substrate: Maternal Epigenetics & DNA Alleles (MAOA, DRD4)",
      desc: "Before birth, maternal stress hormones crossed the placenta to alter fetal brain wiring. Epigenetic methylation tags activated or silenced genes regulating glucocorticoid receptors. You did not select your genome or your uterine environment."
    },
    millennia: {
      title: "Millennia (Evolutionary Ecology)",
      substrate: "Substrate: Evolutionary Selection & Cultural Ancestry",
      desc: "Tens of thousands of years ago, whether your ancestors inhabited nomadic pastoralist steppes (valuing rapid retaliatory honor) or communal agricultural valleys (valuing cooperative harmony) shaped cultural norms that were passed down linguistically and structurally. The causal dominoes stretch back to human genesis."
    }
  };

  if (sapolskyBtns) {
    sapolskyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sapolskyBtns.forEach(b => b.classList.remove('active', 'bg-cyan-500/20', 'text-cyan-300', 'border', 'border-cyan-500/40'));
        btn.classList.add('active', 'bg-cyan-500/20', 'text-cyan-300', 'border', 'border-cyan-500/40');
        const scale = btn.getAttribute('data-scale') || 'second';
        const layer = sapolskyLayers[scale];
        if (layer) {
          if (sapolskyTitle) sapolskyTitle.textContent = layer.title;
          if (sapolskySubstrate) sapolskySubstrate.textContent = layer.substrate;
          if (sapolskyDesc) sapolskyDesc.textContent = layer.desc;
        }
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  // 7D. Quantum Indeterminism & Randomness Simulator
  const quantumRollBtn = document.getElementById('quantum-roll-btn');
  const quantumDisplay = document.getElementById('quantum-dice-display');

  if (quantumRollBtn && quantumDisplay) {
    quantumRollBtn.addEventListener('click', () => {
      const outcomes = [
        { text: "⚛️ ALPHA DECAY (+2e)", color: "#38bdf8" },
        { text: "⚡ BETA DECAY (-1e)", color: "#a855f7" },
        { text: "✨ GAMMA EMISSION (0e)", color: "#fbbf24" },
        { text: "🎲 QUANTUM TUNNELING", color: "#f43f5e" }
      ];
      const roll = outcomes[Math.floor(Math.random() * outcomes.length)];
      quantumDisplay.textContent = roll.text;
      quantumDisplay.style.color = roll.color;
      if (window.soundEngine) {
        window.soundEngine.playNeuralBeep(600 + Math.random() * 400);
        window.soundEngine.playClick();
      }
    });
  }

  // 8. Philosophical Compass (5 Dilemmas)
  const compassQuestions = [
    {
      q: "1. If Laplace's Demon (a supercomputer) could compute your entire future with 100% accuracy, do you still have free will?",
      answers: [
        { text: "No, absolute predictability proves freedom is a complete myth.", stance: 'hard' },
        { text: "Yes, because being predictable doesn't mean I am coerced against my will.", stance: 'compat' },
        { text: "No, unless my conscious mind can veto the computer's prediction.", stance: 'wont' }
      ]
    },
    {
      q: "2. Can you consciously choose what your very next thought will be before it pops into your head?",
      answers: [
        { text: "Impossible. Thoughts simply appear out of the darkness of the unconscious.", stance: 'hard' },
        { text: "I can't author the first spark, but I can deliberately steer or veto the thought.", stance: 'wont' },
        { text: "It doesn't matter where it started; as long as I identify with it, it's my free choice.", stance: 'compat' }
      ]
    },
    {
      q: "3. A person with a severe brain tumor suddenly commits a violent crime. When the tumor is removed, they return to peaceful behavior. Were they responsible?",
      answers: [
        { text: "No. Their biology dictated their action completely.", stance: 'hard' },
        { text: "They could only be blamed if their intact conscious veto was operational.", stance: 'wont' },
        { text: "They lacked authentic agency because their normal self was impaired by external pathology.", stance: 'compat' }
      ]
    },
    {
      q: "4. You crave a chocolate cookie while on a diet, but successfully resist it. What happened?",
      answers: [
        { text: "My conscious mind exercised 'Free Won't' to inhibit the motor impulse.", stance: 'wont' },
        { text: "The desire to look healthy was simply stronger than the desire for sugar. Determinism won.", stance: 'hard' },
        { text: "I acted freely because I aligned my action with my higher-order reflective desires.", stance: 'compat' }
      ]
    },
    {
      q: "5. What is the true definition of human freedom?",
      answers: [
        { text: "Freedom from external physical coercion (being able to do what you desire).", stance: 'compat' },
        { text: "An absolute uncaused origin of choice (which is physically impossible).", stance: 'hard' },
        { text: "The negative power of conscious inhibition and moral restraint.", stance: 'wont' }
      ]
    }
  ];

  let compassScores = { hard: 0, wont: 0, compat: 0 };
  let currentCompassQ = 0;
  const compassContainer = document.getElementById('compass-question-container');
  const compassResultsEl = document.getElementById('compass-result-display');

  function renderCompassQuestion() {
    if (!compassContainer) return;
    if (currentCompassQ >= compassQuestions.length) {
      renderCompassOutcome();
      return;
    }

    const q = compassQuestions[currentCompassQ];
    let html = `
      <div class="mb-4">
        <span class="text-xs uppercase tracking-widest text-cyan-400 font-mono">Dilemma ${currentCompassQ + 1} of 5</span>
        <h4 class="text-lg font-semibold text-white mt-1 mb-4">${q.q}</h4>
        <div class="space-y-3">
    `;

    q.answers.forEach((ans, idx) => {
      html += `
        <button class="w-full text-left p-3.5 rounded-lg border border-slate-700/80 bg-slate-900/60 hover:border-cyan-400/60 hover:bg-cyan-950/20 transition group flex items-start space-x-3 compass-choice-btn" data-stance="${ans.stance}">
          <span class="font-mono text-cyan-400 text-sm font-bold mt-0.5">${String.fromCharCode(65 + idx)}.</span>
          <span class="text-slate-200 text-sm group-hover:text-cyan-200 transition">${ans.text}</span>
        </button>
      `;
    });

    html += `</div></div>`;
    compassContainer.innerHTML = html;

    const btns = compassContainer.querySelectorAll('.compass-choice-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stance = btn.getAttribute('data-stance');
        compassScores[stance]++;
        currentCompassQ++;
        window.soundEngine.playClick();
        renderCompassQuestion();
      });
    });
  }

  function renderCompassOutcome() {
    if (!compassContainer || !compassResultsEl) return;
    compassContainer.classList.add('hidden');
    compassResultsEl.classList.remove('hidden');

    const total = compassQuestions.length;
    const hardPct = Math.round((compassScores.hard / total) * 100);
    const wontPct = Math.round((compassScores.wont / total) * 100);
    const compatPct = Math.round((compassScores.compat / total) * 100);

    let primaryStance = "Compatibilism";
    let desc = "You lean toward Compatibilism: You recognize physical determinism, but define freedom as the capacity to act upon internal values and desires without external coercion.";
    if (compassScores.hard >= compassScores.wont && compassScores.hard >= compassScores.compat) {
      primaryStance = "Hard Determinism";
      desc = "You align with Hard Determinism (Spinoza & Harris): You view conscious free will as a total illusion created by physics, biology, and causal dominoes.";
    } else if (compassScores.wont >= compassScores.hard && compassScores.wont >= compassScores.compat) {
      primaryStance = "Free Won't (Veto Agency)";
      desc = "You align with Benjamin Libet's 'Free Won't': While initial impulses are unconsciously generated, conscious awareness acts as a moral gatekeeper with veto power.";
    }

    document.getElementById('compass-primary-stance').textContent = primaryStance;
    document.getElementById('compass-desc').textContent = desc;
    document.getElementById('bar-hard').style.width = `${hardPct}%`;
    document.getElementById('bar-wont').style.width = `${wontPct}%`;
    document.getElementById('bar-compat').style.width = `${compatPct}%`;
    document.getElementById('pct-hard').textContent = `${hardPct}%`;
    document.getElementById('pct-wont').textContent = `${wontPct}%`;
    document.getElementById('pct-compat').textContent = `${compatPct}%`;
  }

  const restartCompassBtn = document.getElementById('restart-compass-btn');
  if (restartCompassBtn) {
    restartCompassBtn.addEventListener('click', () => {
      compassScores = { hard: 0, wont: 0, compat: 0 };
      currentCompassQ = 0;
      compassContainer.classList.remove('hidden');
      compassResultsEl.classList.add('hidden');
      renderCompassQuestion();
    });
  }
  renderCompassQuestion();

  // 9. Courtroom Justice Simulator
  const retribSlider = document.getElementById('justice-retribution-slider');
  const courtGavelBtn = document.getElementById('court-gavel-btn');
  const courtFeedback = document.getElementById('court-feedback-text');

  function updateCourtroom() {
    if (!retribSlider || !courtFeedback) return;
    const val = parseInt(retribSlider.value, 10);
    if (val > 65) {
      courtFeedback.textContent = `High Retributive Philosophy (${val}%): Punishment is strictly justified because the offender 'chose' their crime and deserves retribution, regardless of past conditioning or brain biology.`;
      courtFeedback.className = "text-rose-400 font-mono text-xs";
    } else if (val < 35) {
      courtFeedback.textContent = `Pure Deterministic Quarantine (${val}%): The concept of moral blame is abandoned. Criminals are treated like dangerous viruses or malfunctioning machines—quarantined for public safety and rehabilitated without moral vengeance.`;
      courtFeedback.className = "text-cyan-400 font-mono text-xs";
    } else {
      courtFeedback.textContent = `Balanced Pragmatic Justice (${val}%): Retains accountability as a necessary social deterrence mechanism, while utilizing neuroscience to moderate sentencing and address root causes.`;
      courtFeedback.className = "text-amber-400 font-mono text-xs";
    }
  }

  if (retribSlider) {
    retribSlider.addEventListener('input', updateCourtroom);
  }
  if (courtGavelBtn) {
    courtGavelBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playGavel();
      updateCourtroom();
    });
  }

  // 10. Sartre Gravitational Particle Void
  const sartreCanvas = document.getElementById('sartre-void-canvas');
  if (sartreCanvas) {
    const sCtx = sartreCanvas.getContext('2d');
    let sWidth, sHeight;
    const words = [
      { text: "CONDEMNED", x: 100, y: 80, vx: 0.2, vy: 0.1, size: 24, color: '#a855f7' },
      { text: "FREE", x: 260, y: 120, vx: -0.15, vy: 0.2, size: 28, color: '#f59e0b' },
      { text: "RESPONSIBILITY", x: 120, y: 160, vx: 0.1, vy: -0.1, size: 18, color: '#38bdf8' },
      { text: "BAD FAITH", x: 300, y: 70, vx: -0.2, vy: -0.15, size: 16, color: '#f43f5e' },
      { text: "FACTICITY", x: 220, y: 180, vx: 0.12, vy: 0.18, size: 16, color: '#94a3b8' },
      { text: "ANGST", x: 80, y: 140, vx: -0.18, vy: 0.12, size: 20, color: '#e2e8f0' }
    ];
    let mouseX = -1000, mouseY = -1000;

    const resizeSartre = () => {
      const rect = sartreCanvas.parentElement.getBoundingClientRect();
      sWidth = rect.width || 450;
      sHeight = 220;
      sartreCanvas.width = sWidth * window.devicePixelRatio;
      sartreCanvas.height = sHeight * window.devicePixelRatio;
      sartreCanvas.style.width = sWidth + 'px';
      sartreCanvas.style.height = sHeight + 'px';
      sCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeSartre();
    window.addEventListener('resize', resizeSartre);

    sartreCanvas.addEventListener('mousemove', (e) => {
      const rect = sartreCanvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    sartreCanvas.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    function animateSartre() {
      sCtx.clearRect(0, 0, sWidth, sHeight);

      // Star / Void particles
      words.forEach(w => {
        // Gravitational pull toward mouse
        if (mouseX > 0) {
          const dx = mouseX - w.x;
          const dy = mouseY - w.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5 && dist < 180) {
            w.vx += (dx / dist) * 0.08;
            w.vy += (dy / dist) * 0.08;
          }
        }

        w.x += w.vx;
        w.y += w.vy;
        w.vx *= 0.96;
        w.vy *= 0.96;

        // Bounce on boundaries
        if (w.x < 30 || w.x > sWidth - 100) w.vx *= -1;
        if (w.y < 30 || w.y > sHeight - 20) w.vy *= -1;

        sCtx.save();
        sCtx.font = `bold ${w.size}px "Cinzel", "Playfair Display", serif`;
        sCtx.fillStyle = w.color;
        sCtx.shadowBlur = 10;
        sCtx.shadowColor = w.color;
        sCtx.fillText(w.text, w.x, w.y);
        sCtx.restore();
      });

      requestAnimationFrame(animateSartre);
    }
    animateSartre();
  }

  // 11. Final Audience Vote Widget
  const pollBtns = document.querySelectorAll('.poll-vote-btn');
  const pollResultEl = document.getElementById('poll-result-bar');
  if (pollBtns) {
    pollBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pollBtns.forEach(b => b.classList.remove('border-amber-400', 'bg-amber-500/20'));
        btn.classList.add('border-amber-400', 'bg-amber-500/20');
        if (pollResultEl) {
          pollResultEl.classList.remove('hidden');
        }
        window.soundEngine.playClick();
      });
    });
  }

  // 12. Documentation Modal
  const openDocBtn = document.getElementById('open-doc-btn');
  const closeDocBtn = document.getElementById('close-doc-btn');
  const docModal = document.getElementById('doc-modal');
  const downloadDocBtn = document.getElementById('download-doc-btn');

  if (openDocBtn && docModal) {
    openDocBtn.addEventListener('click', () => {
      docModal.classList.remove('hidden');
      window.soundEngine.playClick();
    });
  }
  if (closeDocBtn && docModal) {
    closeDocBtn.addEventListener('click', () => {
      docModal.classList.add('hidden');
      window.soundEngine.playClick();
    });
  }
  if (downloadDocBtn) {
    downloadDocBtn.addEventListener('click', () => {
      window.open('/DOCUMENTATION.md', '_blank');
    });
  }
});
