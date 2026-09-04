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

  // 4. Slide Deck Controller (8 Slides from presentation notes)
  let currentSlide = 0;
  const slides = document.querySelectorAll('.deck-slide');
  const totalSlides = slides.length;
  const slideNumEl = document.getElementById('deck-slide-num');
  const slideProgressEl = document.getElementById('deck-progress-bar');
  const prevSlideBtn = document.getElementById('deck-prev-btn');
  const nextSlideBtn = document.getElementById('deck-next-btn');
  const toggleNotesBtn = document.getElementById('deck-notes-toggle');
  const notesDrawer = document.getElementById('deck-notes-drawer');

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
        if (!document.fullscreenElement) {
          deckView.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen();
        }
      }
    }

    if (e.key === 'm' || e.key === 'M') {
      if (audioBtn) audioBtn.click();
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

  // 6. Domino Controls
  const pushDominoBtn = document.getElementById('push-domino-btn');
  const resetDominoBtn = document.getElementById('reset-domino-btn');
  const interveneDominoBtn = document.getElementById('intervene-domino-btn');

  if (pushDominoBtn && dominoSim) {
    pushDominoBtn.addEventListener('click', () => dominoSim.pushFirst());
  }
  if (resetDominoBtn && dominoSim) {
    resetDominoBtn.addEventListener('click', () => dominoSim.reset());
  }
  if (interveneDominoBtn && dominoSim) {
    interveneDominoBtn.addEventListener('click', () => dominoSim.intervene());
  }

  // 7. Libet Experiment Controls
  const libetTriggerBtn = document.getElementById('libet-trigger-btn');
  const libetResetBtn = document.getElementById('libet-reset-btn');

  if (libetTriggerBtn && libetSim) {
    libetTriggerBtn.addEventListener('click', () => libetSim.triggerAction());
  }
  if (libetResetBtn && libetSim) {
    libetResetBtn.addEventListener('click', () => libetSim.reset());
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
