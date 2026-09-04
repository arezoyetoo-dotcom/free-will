// Benjamin Libet 1983 Oscilloscope & Readiness Potential Simulator
class LibetExperiment {
  constructor(clockCanvasId, eegCanvasId) {
    this.clockCanvas = document.getElementById(clockCanvasId);
    this.eegCanvas = document.getElementById(eegCanvasId);
    if (!this.clockCanvas || !this.eegCanvas) return;

    this.clockCtx = this.clockCanvas.getContext('2d');
    this.eegCtx = this.eegCanvas.getContext('2d');

    this.angle = 0;
    this.rotationSpeed = (Math.PI * 2) / (2.56 * 60); // 1 revolution every 2.56 seconds at 60fps
    this.isRunning = true;
    this.hasTriggered = false;
    this.triggerTimestamp = null;
    this.recordedAngle = null;
    this.comparisonMode = 'libet'; // 'libet' (300ms) or 'haynes' (7000ms)

    this.eegProgress = 0;
    this.isAnalyzing = false;

    this.initClock();
    this.initEEG();
    this.animate();
  }

  initClock() {
    const size = 200;
    this.clockCanvas.width = size * window.devicePixelRatio;
    this.clockCanvas.height = size * window.devicePixelRatio;
    this.clockCanvas.style.width = size + 'px';
    this.clockCanvas.style.height = size + 'px';
    this.clockCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  initEEG() {
    const rect = this.eegCanvas.parentElement.getBoundingClientRect();
    this.eegWidth = rect.width || 500;
    this.eegHeight = 160;
    this.eegCanvas.width = this.eegWidth * window.devicePixelRatio;
    this.eegCanvas.height = this.eegHeight * window.devicePixelRatio;
    this.eegCanvas.style.width = this.eegWidth + 'px';
    this.eegCanvas.style.height = this.eegHeight + 'px';
    this.eegCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  triggerAction() {
    this.hasTriggered = true;
    this.recordedAngle = this.angle;
    this.triggerTimestamp = Date.now();
    this.isAnalyzing = true;
    this.eegProgress = 0;

    if (window.soundEngine) {
      window.soundEngine.playNeuralBeep(880);
      window.soundEngine.playClick();
    }

    const reportEl = document.getElementById('libet-result-box');
    if (reportEl) {
      reportEl.classList.remove('hidden');
    }

    const statW = document.getElementById('stat-conscious-w');
    const statRP = document.getElementById('stat-readiness-rp');
    const statGap = document.getElementById('stat-unconscious-gap');
    if (statW && statRP && statGap) {
      statW.textContent = "0 ms (Subjective Click)";
      statRP.textContent = "-350 ms (Pre-conscious SMA Activation)";
      statGap.textContent = "350 ms (Unconscious Lead)";
    }
  }

  reset() {
    this.hasTriggered = false;
    this.recordedAngle = null;
    this.isAnalyzing = false;
    this.eegProgress = 0;

    const reportEl = document.getElementById('libet-result-box');
    if (reportEl) {
      reportEl.classList.add('hidden');
    }
  }

  setComparison(mode) {
    this.comparisonMode = mode;
    this.renderEEG();
  }

  renderClock() {
    const ctx = this.clockCtx;
    const cx = 100;
    const cy = 100;
    const r = 85;

    ctx.clearRect(0, 0, 200, 200);

    // Outer Bezel
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Radial Tick Marks (Libet Oscilloscope Dial)
    for (let i = 0; i < 60; i++) {
      const theta = (i / 60) * Math.PI * 2;
      const isMajor = i % 5 === 0;
      const innerR = isMajor ? r - 12 : r - 6;
      ctx.strokeStyle = isMajor ? 'rgba(56, 189, 248, 0.9)' : 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(theta) * innerR, cy + Math.sin(theta) * innerR);
      ctx.lineTo(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r);
      ctx.stroke();

      if (isMajor && i % 15 === 0) {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.7)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const num = i === 0 ? "60" : `${i}`;
        ctx.fillText(num, cx + Math.cos(theta) * (r - 22), cy + Math.sin(theta) * (r - 22));
      }
    }

    // Phosphor Trail
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#10b981';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 18, this.angle - 0.4, this.angle);
    ctx.stroke();

    // Rotating Spot
    const spotX = cx + Math.cos(this.angle) * (r - 18);
    const spotY = cy + Math.sin(this.angle) * (r - 18);
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(spotX, spotY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Marked decision point if triggered
    if (this.recordedAngle !== null) {
      const recX = cx + Math.cos(this.recordedAngle) * (r - 18);
      const recY = cy + Math.sin(this.recordedAngle) * (r - 18);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.beginPath();
      ctx.arc(recX, recY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(recX, recY);
      ctx.stroke();
    }
    ctx.restore();

    // Center Hub
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  renderEEG() {
    const ctx = this.eegCtx;
    const w = this.eegWidth;
    const h = this.eegHeight;

    ctx.clearRect(0, 0, w, h);

    // Oscilloscope Grid Lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Time Axis Reference
    const baselineY = h * 0.45;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(w, baselineY);
    ctx.stroke();

    // Markers on Timeline
    // 0ms is at x = w * 0.85 (Action)
    // -200ms is at x = w * 0.65 (Will / Awareness)
    // -550ms is at x = w * 0.35 (RP Onset)
    const xAction = w * 0.85;
    const xWill = w * 0.65;
    const xRP = w * 0.35;

    // Draw Shaded "Unconscious Time Gap" Zone
    const gapGrad = ctx.createLinearGradient(xRP, 0, xWill, 0);
    gapGrad.addColorStop(0, 'rgba(244, 63, 94, 0.15)');
    gapGrad.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
    ctx.fillStyle = gapGrad;
    ctx.fillRect(xRP, 15, xWill - xRP, h - 30);

    // Border of Unconscious Zone
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(xRP, 15, xWill - xRP, h - 30);
    ctx.setLineDash([]);

    // Label Unconscious Gap
    ctx.fillStyle = '#fb7185';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("UNCONSCIOUS PREPARATION (300-350ms GAP)", (xRP + xWill) / 2, 28);

    // Vertical marker lines
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xRP, 15);
    ctx.lineTo(xRP, h - 15);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(xWill, 15);
    ctx.lineTo(xWill, h - 15);
    ctx.stroke();

    ctx.strokeStyle = '#34d399';
    ctx.beginPath();
    ctx.moveTo(xAction, 15);
    ctx.lineTo(xAction, h - 15);
    ctx.stroke();

    // Labels for vertical lines
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText("RP Onset (-550ms)", xRP, h - 5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText("Conscious Will (-200ms)", xWill, h - 5);
    ctx.fillStyle = '#34d399';
    ctx.fillText("Action (0ms)", xAction, h - 5);

    // Draw Simulated Readiness Potential (RP) Waveform
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
    ctx.beginPath();

    const maxPoints = Math.floor(w * (this.hasTriggered ? Math.min(1, this.eegProgress) : 1));
    for (let x = 0; x < maxPoints; x++) {
      let y = baselineY;
      // Pre-RP baseline noise
      if (x < xRP) {
        y += (Math.sin(x * 0.2) + Math.cos(x * 0.4)) * 2.5;
      } 
      // Negative potential slope (Readiness Potential buildup)
      else if (x >= xRP && x < xAction) {
        const progress = (x - xRP) / (xAction - xRP);
        // Bereitschaftspotential is a negative electrical shift (curves upwards or downwards depending on polarity)
        const dip = Math.pow(progress, 1.8) * 55;
        y += dip + (Math.sin(x * 0.3) * 2);
      } 
      // Post-action discharge / return to baseline
      else {
        const afterProg = (x - xAction) / (w - xAction);
        const discharge = 55 * Math.exp(-afterProg * 4);
        y += discharge + (Math.sin(x * 0.25) * 2);
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  animate() {
    this.angle = (this.angle + this.rotationSpeed) % (Math.PI * 2);
    this.renderClock();

    if (this.isAnalyzing && this.eegProgress < 1.0) {
      this.eegProgress += 0.035;
    }
    this.renderEEG();

    requestAnimationFrame(() => this.animate());
  }
}

window.LibetExperiment = LibetExperiment;
