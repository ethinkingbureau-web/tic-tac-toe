/**
 * fireworks.js
 * A full-screen particle effect. Call burst(x, y) to launch a firework;
 * attach() makes every click or tap on the page launch one automatically.
 * The animation loop only runs while there are particles on screen.
 */
(function (global) {
  'use strict';

  const { CONFIG } = global.TTT;
  const cfg = CONFIG.fireworks;
  const TAU = Math.PI * 2;

  const rand = (min, max) => min + Math.random() * (max - min);

  class Fireworks {
    /** @param {HTMLCanvasElement} canvas a fixed, full-viewport canvas */
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.running = false;
      this.lastTime = 0;
      this.enabled = !(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);

      this._resize = this._resize.bind(this);
      this._onPointerDown = this._onPointerDown.bind(this);
      this._frame = this._frame.bind(this);
    }

    attach() {
      this._resize();
      window.addEventListener('resize', this._resize);
      window.addEventListener('pointerdown', this._onPointerDown);
    }

    /** Launches one firework at viewport coordinates (x, y). */
    burst(x, y) {
      if (!this.enabled) return;

      const hue = Math.floor(rand(0, 360));
      for (let i = 0; i < cfg.particlesPerBurst; i++) {
        const angle = (i / cfg.particlesPerBurst) * TAU + rand(-0.15, 0.15);
        const speed = rand(cfg.minSpeed, cfg.maxSpeed);
        this.particles.push({
          x, y,
          px: x, py: y, // previous position, for drawing a short trail
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: rand(cfg.minLife, cfg.maxLife),
          // Mostly one hue per burst, with a few gold and white sparks mixed in.
          color: Math.random() < 0.2 ? `hsl(45 100% 70%)` : `hsl(${hue + rand(-25, 25)} 95% 62%)`,
          size: rand(1.5, 3),
        });
      }
      this._start();
    }

    /* ------------------------------ internals ------------------------------ */

    _onPointerDown(e) {
      this.burst(e.clientX, e.clientY);
    }

    _resize() {
      const dpr = Math.max(1, global.devicePixelRatio || 1);
      this.width = global.innerWidth;
      this.height = global.innerHeight;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    _start() {
      if (this.running) return;
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this._frame);
    }

    _frame(now) {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      this._update(dt);
      this._draw();

      if (this.particles.length > 0) {
        requestAnimationFrame(this._frame);
      } else {
        this.running = false;
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    }

    _update(dt) {
      const drag = Math.pow(cfg.drag, dt * 60);
      for (const p of this.particles) {
        p.life += dt;
        p.px = p.x;
        p.py = p.y;
        p.vx *= drag;
        p.vy = p.vy * drag + cfg.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      this.particles = this.particles.filter((p) => p.life < p.maxLife);
    }

    _draw() {
      const { ctx } = this;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.lineCap = 'round';

      for (const p of this.particles) {
        const fade = 1 - p.life / p.maxLife;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * (0.5 + fade * 0.5);
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  global.TTT.Fireworks = Fireworks;
})(window);
