// Interactive Canvas Physics Engine for Domino Determinism
class DominoCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.dominoes = [];
    this.count = 14;
    this.dominoWidth = 14;
    this.dominoHeight = 75;
    this.spacing = 38;
    this.gravity = 0.038;
    this.friction = 0.985;
    this.particles = [];
    this.running = true;
    this.interventionDominoIndex = -1;
    this.telemetryMessage = "Dominoes standing in unbroken causal sequence.";

    this.initResize();
    this.reset();
    this.initInteraction();
    this.animate();
  }

  initResize() {
    const setSize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width || 700;
      this.height = 240;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setSize();
    window.addEventListener('resize', () => {
      setSize();
      this.reset();
    });
  }

  reset() {
    this.dominoes = [];
    this.particles = [];
    this.interventionDominoIndex = -1;
    this.telemetryMessage = "Awaiting the First Cause (Initial Action).";

    const totalWidth = (this.count - 1) * this.spacing;
    const startX = Math.max(30, (this.width - totalWidth) / 2);
    const floorY = this.height - 40;

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
        label: i === 0 ? "INIT" : (i === this.count - 1 ? "RESULT" : `C-${i}`)
      });
    }
    this.updateTelemetry();
  }

  pushFirst() {
    if (this.dominoes.length > 0 && !this.dominoes[0].isFallen) {
      this.dominoes[0].angularVelocity = 0.045;
      this.telemetryMessage = "The First Cause has initiated the causal cascade.";
      this.updateTelemetry();
      if (window.soundEngine) window.soundEngine.playDominoClick(0.9);
    }
  }

  intervene() {
    // Pick middle domino to freeze or block
    const mid = Math.floor(this.count / 2);
    if (this.dominoes[mid]) {
      this.dominoes[mid].isBlocked = !this.dominoes[mid].isBlocked;
      this.dominoes[mid].highlight = this.dominoes[mid].isBlocked;
      if (this.dominoes[mid].isBlocked) {
        this.telemetryMessage = `[FREE WILL INTERVENTION]: Domino #${mid + 1} held stationary by observer. Did your decision have a prior physical cause?`;
      } else {
        this.telemetryMessage = `Intervention released. Deterministic chain restored.`;
      }
      this.updateTelemetry();
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  initInteraction() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let hit = false;
      this.dominoes.forEach((d, idx) => {
        if (Math.abs(clickX - d.x) < 22 && clickY > d.y - this.dominoHeight - 10 && clickY < d.y + 10) {
          hit = true;
          if (idx === 0 && !d.isFallen) {
            this.pushFirst();
          } else {
            d.isBlocked = !d.isBlocked;
            d.highlight = d.isBlocked;
            this.telemetryMessage = d.isBlocked 
              ? `Domino #${d.id} blocked by user. Was this an uncaused choice, or a reaction to the stimulus?`
              : `Domino #${d.id} unblocked.`;
            this.updateTelemetry();
            if (window.soundEngine) window.soundEngine.playClick();
          }
        }
      });
      if (!hit && this.dominoes.length > 0 && !this.dominoes[0].isFallen) {
        this.pushFirst();
      }
    });
  }

  updateTelemetry() {
    const el = document.getElementById('domino-telemetry-text');
    if (el) {
      el.textContent = this.telemetryMessage;
    }
  }

  addSparks(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -Math.random() * 2.5,
        alpha: 1.0,
        color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24'
      });
    }
  }

  update() {
    const maxAngle = Math.PI * 0.38; // ~68 degrees resting fall

    for (let i = 0; i < this.dominoes.length; i++) {
      const d = this.dominoes[i];
      if (d.isBlocked) {
        d.angularVelocity = 0;
        continue;
      }

      if (d.angle > 0.01 && !d.isFallen) {
        d.angularVelocity += this.gravity;
        d.angularVelocity *= this.friction;
        d.angle += d.angularVelocity;

        // Collision check with next domino
        if (i < this.dominoes.length - 1) {
          const next = this.dominoes[i + 1];
          const tipX = d.x + Math.sin(d.angle) * this.dominoHeight;
          const tipY = d.y - Math.cos(d.angle) * this.dominoHeight;

          if (tipX >= next.x && next.angle < 0.05 && !next.isBlocked) {
            next.angularVelocity = Math.max(0.045, d.angularVelocity * 0.82);
            d.angularVelocity *= 0.35;
            this.addSparks(next.x, next.y - this.dominoHeight * 0.7);
            if (window.soundEngine) {
              const pitch = 1.0 + (i / this.count) * 0.4;
              window.soundEngine.playDominoClick(pitch);
            }
          }
        }

        if (d.angle >= maxAngle) {
          d.angle = maxAngle;
          d.angularVelocity = 0;
          d.isFallen = true;

          if (i === this.dominoes.length - 1) {
            this.telemetryMessage = "Final domino collapsed. Every link in the chain was causally predetermined.";
            this.updateTelemetry();
          }
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.alpha -= 0.04;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Subtle floor line & reflection gradient
    const floorY = this.height - 40;
    const grad = this.ctx.createLinearGradient(0, floorY, 0, this.height);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    grad.addColorStop(0.1, 'rgba(30, 41, 59, 0.3)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, floorY, this.width, this.height - floorY);

    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, floorY);
    this.ctx.lineTo(this.width, floorY);
    this.ctx.stroke();

    // Render Dominoes
    this.dominoes.forEach((d) => {
      this.ctx.save();
      this.ctx.translate(d.x, d.y);
      this.ctx.rotate(d.angle);

      // Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(4, -this.dominoHeight + 4, this.dominoWidth, this.dominoHeight);

      // Domino Body
      let fillGrad = this.ctx.createLinearGradient(0, -this.dominoHeight, this.dominoWidth, 0);
      if (d.highlight || d.isBlocked) {
        fillGrad.addColorStop(0, '#f43f5e');
        fillGrad.addColorStop(1, '#be123c');
      } else if (d.id === 1) {
        fillGrad.addColorStop(0, '#38bdf8');
        fillGrad.addColorStop(1, '#0284c7');
      } else if (d.id === this.count) {
        fillGrad.addColorStop(0, '#fbbf24');
        fillGrad.addColorStop(1, '#d97706');
      } else {
        fillGrad.addColorStop(0, '#f8fafc');
        fillGrad.addColorStop(1, '#cbd5e1');
      }

      this.ctx.fillStyle = fillGrad;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.lineWidth = 1;
      
      // Rounded rect shape
      const r = 3;
      const w = this.dominoWidth;
      const h = this.dominoHeight;
      this.ctx.beginPath();
      this.ctx.roundRect(0, -h, w, h, r);
      this.ctx.fill();
      this.ctx.stroke();

      // Divider line
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      this.ctx.beginPath();
      this.ctx.moveTo(2, -h / 2);
      this.ctx.lineTo(w - 2, -h / 2);
      this.ctx.stroke();

      // Small dots or indicator
      this.ctx.fillStyle = d.isBlocked ? '#fff' : 'rgba(15, 23, 42, 0.7)';
      this.ctx.beginPath();
      this.ctx.arc(w / 2, -h * 0.75, 2, 0, Math.PI * 2);
      this.ctx.arc(w / 2, -h * 0.25, 2, 0, Math.PI * 2);
      this.ctx.fill();

      // ID label
      this.ctx.restore();

      // Floor Label
      this.ctx.fillStyle = d.highlight ? '#f43f5e' : 'rgba(148, 163, 184, 0.6)';
      this.ctx.font = '9px "JetBrains Mono", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(d.label, d.x + this.dominoWidth / 2, floorY + 16);
    });

    // Render Particles
    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  animate() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.animate());
  }
}

window.DominoCanvas = DominoCanvas;
