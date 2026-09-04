// Interactive Canvas Physics Engine for Domino Determinism (Free Will vs Universal Causality)
class DominoCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.dominoes = [];
    this.count = 14;
    this.dominoWidth = 14;
    this.dominoHeight = 72;
    this.spacing = 38;
    this.gravity = 0.042;
    this.friction = 0.982;
    this.particles = [];
    this.running = true;
    this.isPaused = false;
    this.speedMultiplier = 1.0;
    this.labelMode = 'cosmic'; // 'cosmic' (Big Bang -> Choice) or 'physics' (C-1 -> C-14)
    this.quantumBranchActive = false;
    this.telemetryMessage = "Awaiting the First Cause (Initial Action).";

    this.cosmicLabels = [
      "1. Big Bang (13.8 Bya)",
      "2. Stellar Genesis",
      "3. Earth Formed",
      "4. Abiogenesis (RNA)",
      "5. Cellular Life",
      "6. Mammalian Brain",
      "7. Parental DNA",
      "8. Epigenetic Marks",
      "9. Early Trauma/Joy",
      "10. Synaptic Wiring",
      "11. Blood Glucose",
      "12. Sensory Stimulus",
      "13. Readiness Pot. (-300ms)",
      "14. Conscious Choice"
    ];

    this.initResize();
    this.reset();
    this.initInteraction();
    this.animate();
  }

  initResize() {
    const setSize = () => {
      if (!this.canvas || !this.canvas.parentElement) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = Math.max(320, rect.width || 720);
      this.height = 250;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform before scaling
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setSize();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        setSize();
        this.repositionDominoes();
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    window.addEventListener('resize', () => {
      setSize();
      this.repositionDominoes();
    });
  }

  repositionDominoes() {
    const totalWidth = (this.count - 1) * this.spacing;
    const startX = Math.max(35, (this.width - totalWidth) / 2);
    const floorY = this.height - 42;

    this.dominoes.forEach((d, i) => {
      d.x = startX + i * this.spacing;
      d.y = floorY;
    });
  }

  reset() {
    this.dominoes = [];
    this.particles = [];
    this.isPaused = false;
    this.telemetryMessage = "Awaiting the First Cause (Initial Action).";

    const totalWidth = (this.count - 1) * this.spacing;
    const startX = Math.max(35, (this.width - totalWidth) / 2);
    const floorY = this.height - 42;

    for (let i = 0; i < this.count; i++) {
      this.dominoes.push({
        id: i + 1,
        x: startX + i * this.spacing,
        y: floorY,
        angle: 0,
        angularVelocity: 0,
        isFallen: false,
        isBlocked: false,
        highlight: false,
        hasHit: false,
        label: this.getLabel(i)
      });
    }
    this.updateTelemetry();
  }

  getLabel(index) {
    if (this.labelMode === 'cosmic') {
      return this.cosmicLabels[index] || `Step ${index + 1}`;
    }
    if (index === 0) return "INIT (Cause)";
    if (index === this.count - 1) return "RESULT (Action)";
    return `C-${index}`;
  }

  setLabelMode(mode) {
    this.labelMode = mode;
    this.dominoes.forEach((d, i) => {
      d.label = this.getLabel(i);
    });
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    this.telemetryMessage = `Simulation speed set to ${multiplier}x.`;
    this.updateTelemetry();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.telemetryMessage = this.isPaused ? "Simulation PAUSED. Use Step Forward or Resume." : "Simulation RESUMED.";
    this.updateTelemetry();
    return this.isPaused;
  }

  stepForward() {
    this.isPaused = true;
    for (let s = 0; s < 3; s++) {
      this.updatePhysics();
    }
    this.telemetryMessage = "Stepped forward 1 frame in the causal chain.";
    this.updateTelemetry();
  }

  pushFirst() {
    if (this.dominoes.length > 0) {
      if (this.dominoes[0].isBlocked) {
        this.dominoes[0].isBlocked = false;
        this.dominoes[0].highlight = false;
      }
      // Nudge both velocity AND angle to guarantee immediate physical rotation
      this.dominoes[0].angularVelocity = 0.055;
      this.dominoes[0].angle = 0.035;
      this.dominoes[0].isFallen = false;
      this.telemetryMessage = "The First Cause (Big Bang / Initial Action) has initiated the causal cascade.";
      this.updateTelemetry();
      if (window.soundEngine) window.soundEngine.playDominoClick(0.85);
    }
  }

  intervene() {
    // Pick middle domino to freeze or block
    const mid = Math.floor(this.count / 2);
    if (this.dominoes[mid]) {
      this.dominoes[mid].isBlocked = !this.dominoes[mid].isBlocked;
      this.dominoes[mid].highlight = this.dominoes[mid].isBlocked;
      if (this.dominoes[mid].isBlocked) {
        this.telemetryMessage = `[FREE WILL VETO]: Domino #${mid + 1} (${this.dominoes[mid].label}) frozen by observer! Did this intervention have a prior cause?`;
      } else {
        this.telemetryMessage = `Intervention released. Deterministic cascade restored.`;
      }
      this.updateTelemetry();
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  toggleDominoBlock(index) {
    const d = this.dominoes[index];
    if (!d) return;

    // If domino hasn't fallen and is first, allow pushing directly
    if (index === 0 && d.angle < 0.05 && !d.isBlocked) {
      this.pushFirst();
      return;
    }

    d.isBlocked = !d.isBlocked;
    d.highlight = d.isBlocked;
    if (d.isBlocked) {
      d.angularVelocity = 0;
      this.telemetryMessage = `Domino #${d.id} (${d.label}) blocked. Causal transfer will be halted at this coordinate.`;
    } else {
      this.telemetryMessage = `Domino #${d.id} (${d.label}) unblocked.`;
    }
    this.updateTelemetry();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  initInteraction() {
    const handleClick = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      const clickX = (clientX - rect.left) * scaleX;
      const clickY = (clientY - rect.top) * scaleY;

      let hit = false;
      this.dominoes.forEach((d, idx) => {
        const topY = d.y - this.dominoHeight - 15;
        const botY = d.y + 20;
        if (Math.abs(clickX - (d.x + this.dominoWidth / 2)) < 20 && clickY >= topY && clickY <= botY) {
          hit = true;
          this.toggleDominoBlock(idx);
        }
      });

      if (!hit && this.dominoes.length > 0 && !this.dominoes[0].isFallen && this.dominoes[0].angle < 0.05) {
        this.pushFirst();
      }
    };

    this.canvas.addEventListener('click', (e) => {
      handleClick(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleClick(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  updateTelemetry() {
    const el = document.getElementById('domino-telemetry-text');
    if (el) {
      el.textContent = this.telemetryMessage;
    }
  }

  addSparks(x, y, color = '#38bdf8') {
    for (let i = 0; i < 7; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -Math.random() * 3.2 - 0.5,
        alpha: 1.0,
        color: color || (Math.random() > 0.5 ? '#38bdf8' : '#fbbf24')
      });
    }
  }

  updatePhysics() {
    const maxRestAngle = Math.PI * 0.38; // ~68.4 degrees resting angle
    const n = this.dominoes.length;

    for (let i = 0; i < n; i++) {
      const d = this.dominoes[i];
      if (d.isBlocked) {
        d.angularVelocity = 0;
        continue;
      }

      // Gravitational acceleration once tilted
      if ((d.angle > 0.005 || d.angularVelocity > 0.001) && !d.isFallen) {
        // Torque increases as center of mass tilts
        const torque = this.gravity * Math.max(0.2, Math.sin(d.angle + 0.1));
        d.angularVelocity += torque * this.speedMultiplier;
        d.angularVelocity *= Math.pow(this.friction, this.speedMultiplier);
        d.angle += d.angularVelocity * this.speedMultiplier;

        // Collision detection with next domino
        if (i < n - 1) {
          const next = this.dominoes[i + 1];
          const tipX = d.x + Math.sin(d.angle) * this.dominoHeight + Math.cos(d.angle) * this.dominoWidth;
          const deltaX = next.x - d.x;

          if (tipX >= next.x) {
            // Case A: Next domino is BLOCKED (Intervention / Conscious Veto)
            if (next.isBlocked) {
              const maxAngleAgainstBlock = Math.asin(Math.min(0.95, (deltaX - 2) / this.dominoHeight));
              if (d.angle >= maxAngleAgainstBlock) {
                d.angle = maxAngleAgainstBlock;
                d.angularVelocity = 0;
                d.isFallen = true;

                if (!d.hasHit) {
                  d.hasHit = true;
                  this.addSparks(next.x, next.y - this.dominoHeight * 0.6, '#f43f5e');
                  if (window.soundEngine) window.soundEngine.playDominoClick(0.7);
                  this.telemetryMessage = `[CAUSAL CHAIN HALTED]: Domino #${d.id} collided with blocked Domino #${next.id}. Without a cause, the future cannot occur!`;
                  this.updateTelemetry();
                }
              }
            }
            // Case B: Next domino is FREE to fall
            else {
              if (next.angle < 0.05) {
                next.angularVelocity = Math.max(0.048, d.angularVelocity * 0.85);
                next.angle = Math.max(0.03, next.angle);
                d.angularVelocity *= 0.42;

                if (!d.hasHit) {
                  d.hasHit = true;
                  this.addSparks(next.x, next.y - this.dominoHeight * 0.65, '#38bdf8');
                  if (window.soundEngine) {
                    const pitch = 0.85 + (i / n) * 0.65;
                    window.soundEngine.playDominoClick(pitch);
                  }
                }
              }

              // Contact angle constraint: d cannot clip through next
              const maxAllowedAngle = next.angle + Math.asin(Math.min(0.95, deltaX / this.dominoHeight));
              if (d.angle > maxAllowedAngle) {
                d.angle = maxAllowedAngle;
              }
            }
          }
        }

        // Rest angle reached
        if (d.angle >= maxRestAngle) {
          d.angle = maxRestAngle;
          d.angularVelocity = 0;
          d.isFallen = true;

          if (i === n - 1) {
            this.telemetryMessage = "Final domino collapsed. 13.8 Billion years of unbroken causality completed.";
            this.updateTelemetry();
          }
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * this.speedMultiplier;
      p.y += p.vy * this.speedMultiplier;
      p.vy += 0.12 * this.speedMultiplier;
      p.alpha -= 0.035 * this.speedMultiplier;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const floorY = this.height - 42;

    // Floor Glow & Reflection
    const grad = this.ctx.createLinearGradient(0, floorY, 0, this.height);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
    grad.addColorStop(0.15, 'rgba(30, 41, 59, 0.35)');
    grad.addColorStop(1, 'rgba(6, 8, 14, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, floorY, this.width, this.height - floorY);

    // Neon Floor Line
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, floorY);
    this.ctx.lineTo(this.width, floorY);
    this.ctx.stroke();

    // Draw Causal Energy Wave between active falling dominoes
    this.ctx.save();
    for (let i = 0; i < this.dominoes.length - 1; i++) {
      const d1 = this.dominoes[i];
      const d2 = this.dominoes[i + 1];
      if (d1.angle > 0.05 && !d1.isBlocked && !d2.isFallen) {
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(d1.x + this.dominoWidth / 2, floorY - 10);
        this.ctx.lineTo(d2.x + this.dominoWidth / 2, floorY - 10);
        this.ctx.stroke();
      }
    }
    this.ctx.restore();

    // Render Dominoes
    this.dominoes.forEach((d) => {
      this.ctx.save();
      this.ctx.translate(d.x, d.y);
      this.ctx.rotate(d.angle);

      // Floor Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.fillRect(4, -this.dominoHeight + 4, this.dominoWidth, this.dominoHeight);

      // Domino Body Gradient
      let fillGrad = this.ctx.createLinearGradient(0, -this.dominoHeight, this.dominoWidth, 0);
      if (d.highlight || d.isBlocked) {
        fillGrad.addColorStop(0, '#f43f5e');
        fillGrad.addColorStop(1, '#9f1239');
      } else if (d.id === 1) {
        fillGrad.addColorStop(0, '#38bdf8');
        fillGrad.addColorStop(1, '#0284c7');
      } else if (d.id === this.count) {
        fillGrad.addColorStop(0, '#fbbf24');
        fillGrad.addColorStop(1, '#b45309');
      } else {
        fillGrad.addColorStop(0, '#f8fafc');
        fillGrad.addColorStop(1, '#94a3b8');
      }

      this.ctx.fillStyle = fillGrad;
      this.ctx.strokeStyle = d.isBlocked ? '#ffe4e6' : 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = d.isBlocked ? 2 : 1;

      // Rounded Domino Shape
      const w = this.dominoWidth;
      const h = this.dominoHeight;
      const r = 3;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(0, -h, w, h, r);
      } else {
        this.ctx.rect(0, -h, w, h);
      }
      this.ctx.fill();
      this.ctx.stroke();

      // Horizontal Middle Divider
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(2, -h / 2);
      this.ctx.lineTo(w - 2, -h / 2);
      this.ctx.stroke();

      // Domino Inset Dots / Pip
      this.ctx.fillStyle = d.isBlocked ? '#ffffff' : 'rgba(15, 23, 42, 0.75)';
      this.ctx.beginPath();
      this.ctx.arc(w / 2, -h * 0.75, 2.2, 0, Math.PI * 2);
      this.ctx.arc(w / 2, -h * 0.25, 2.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Aura on blocked domino
      if (d.isBlocked) {
        this.ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(-2, -h - 2, w + 4, h + 4);
      }

      this.ctx.restore();

      // Floor Label & Indicator
      this.ctx.save();
      this.ctx.fillStyle = d.highlight ? '#f43f5e' : (d.id === 1 ? '#38bdf8' : (d.id === this.count ? '#fbbf24' : 'rgba(148, 163, 184, 0.75)'));
      this.ctx.font = '9px "JetBrains Mono", monospace';
      this.ctx.textAlign = 'center';
      
      // Alternate tilt or truncate text if cosmic mode
      const labelText = d.label;
      if (this.labelMode === 'cosmic') {
        // Draw short vertical text or angled text for clarity
        this.ctx.translate(d.x + this.dominoWidth / 2, floorY + 14);
        this.ctx.rotate(Math.PI * 0.18);
        this.ctx.fillText(labelText.length > 18 ? labelText.substring(0, 16) + '…' : labelText, 0, 0);
      } else {
        this.ctx.fillText(labelText, d.x + this.dominoWidth / 2, floorY + 16);
      }
      this.ctx.restore();
    });

    // Render Particles
    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  animate() {
    if (!this.isPaused) {
      this.updatePhysics();
    }
    this.render();
    requestAnimationFrame(() => this.animate());
  }
}

window.DominoCanvas = DominoCanvas;
