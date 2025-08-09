// todo:
// 1. mouse icon changed ✔
//      1.1 mouse icon on phone: move around like within space envrionment
// 2. On mouse click animation
// 3. On mouse click sound

(() => {
  class ZeroGDrifter {
    constructor(opts = {}) {
      // parameters for set up
      this.container = this._resolveContainer(opts.containerSelector) || document.body;
      this.imgSrc = opts.imgSrc || "_assets/Others/CursorIcon.png";
      this.width = opts.width;
      this.restitution = opts.restitution ?? 0.98;
      this.softDrag = opts.softDrag ?? 0.000;
      this.jitter = opts.jitter ?? 8;
      this.maxSpeed = opts.maxSpeed ?? 240;
      this.maxSpin = opts.maxSpin ?? 30;

      // random initial velocity
      const iv = opts.initialVelocity || {
        vx: (Math.random() * 2 - 1) * 60,
        vy: (Math.random() * 2 - 1) * 60,
        vr: (Math.random() * 2 - 1) * 10
      };
      this.vx = iv.vx; this.vy = iv.vy; this.vr = iv.vr;

      this._initDOM();
      this._bind();
    }

    _resolveContainer(sel) {
      if (!sel) return null;
      if (typeof sel === "string") return document.querySelector(sel);
      if (sel instanceof Element) return sel;
      return null;
    }

    _initDOM() {
      // hide div
      this.layer = document.createElement("div");
      Object.assign(this.layer.style, {
        position: this.container === document.body ? "fixed" : "absolute",
        inset: this.container === document.body ? "0" : "0",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1
      });

      // change to relative to fulfill the layout
      if (this.container !== document.body) {
        const cs = getComputedStyle(this.container);
        if (cs.position === "static") this.container.style.position = "relative";
      }
      this.container.appendChild(this.layer);

      // take image to the layer
      if (!this.img) {
        this.img = document.createElement("img");
        this.img.src = this.imgSrc;
        this.layer.appendChild(this.img);
      } else {
        if (this.img.parentElement !== this.layer) this.layer.appendChild(this.img);
      }

      this.img.classList.add("zero-g-drifter");
      if (this.width) this.img.style.width = this.width;
      Object.assign(this.img.style, {
        position: "absolute",
        userSelect: "none",
        pointerEvents: "none",
        willChange: "transform",
        transformOrigin: "center center",
        filter: "drop-shadow(0 6px 12px rgba(0,0,0,.45))"
      });

      // physical status
      this.bounds = { maxX: 0, maxY: 0 };
      this.x = 0; this.y = 0; this.angle = 0;
      this._last = performance.now();
      this._inited = false;
    }

    // recalculate the container size if screen size changed
    _bind() {
      this.ro = new ResizeObserver(() => this._measure());
      this.ro.observe(this.layer);

      // onclick to push the image
      const impulse = (ev) => {

        // not trigger when click buttons
        if (ev.target && ev.target.closest &&
          ev.target.closest('a,button,[role="button"],input,textarea,select,label,summary,details')) {
          return;
        }

        const rect = this.container.getBoundingClientRect();
        const cx = (ev.touches?.[0]?.clientX ?? ev.clientX) - rect.left;
        const cy = (ev.touches?.[0]?.clientY ?? ev.clientY) - rect.top;
        const dx = cx - (this.x + this.img.clientWidth / 2);
        const dy = cy - (this.y + this.img.clientHeight / 2);
        const len = Math.hypot(dx, dy) || 1;
        const k = 120;
        this.vx += (dx / len) * k;
        this.vy += (dy / len) * k;
        this.vr += (Math.random() * 2 - 1) * 12;
      };
      document.addEventListener("click", impulse, { passive: true });
      document.addEventListener("touchstart", impulse, { passive: true });

      // start the animation loop
      (this.img.decode?.() ?? Promise.resolve())
        .catch(() => { })
        .finally(() => {
          this._measure();
          requestAnimationFrame((t) => { this._last = t; requestAnimationFrame(this._tick.bind(this)); });
        });
    }

    // count the boundary of the screen
    _measure() {
      const cw = this.layer.clientWidth;
      const ch = this.layer.clientHeight;
      const w = this.img.clientWidth || this.img.width || 100;
      const h = this.img.clientHeight || this.img.height || 100;
      this.bounds.maxX = Math.max(0, cw - w);
      this.bounds.maxY = Math.max(0, ch - h);

      if (!this._inited) {
        this.x = this.bounds.maxX / 2;
        this.y = this.bounds.maxY / 2;
        this._inited = true;
      } else {
        this.x = Math.min(Math.max(0, this.x), this.bounds.maxX);
        this.y = Math.min(Math.max(0, this.y), this.bounds.maxY);
      }
    }

    _clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

    // update
    _tick(now) {
      const dt = (now - this._last) / 1000;
      this._last = now;

      // push a random jitter
      if (this.jitter > 0) {
        this.vx += (Math.random() * 2 - 1) * this.jitter * dt;
        this.vy += (Math.random() * 2 - 1) * this.jitter * dt;
        this.vr += (Math.random() * 2 - 1) * (this.jitter * 0.3) * dt;
      }

      // avoid infinite speed totalization
      this.vx *= (1 - this.softDrag);
      this.vy *= (1 - this.softDrag);
      this.vr *= (1 - this.softDrag);

      // speed limitation
      const sp = Math.hypot(this.vx, this.vy);
      if (sp > this.maxSpeed) {
        const r = this.maxSpeed / sp;
        this.vx *= r; this.vy *= r;
      }
      this.vr = this._clamp(this.vr, -this.maxSpin, this.maxSpin);

      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.angle += this.vr * dt;

      // rebound when hit the edge
      if (this.x <= 0) {
        this.x = 0; this.vx = -this.vx * this.restitution; this.vr += (Math.random() * 2 - 1) * 6;
      } else if (this.x >= this.bounds.maxX) {
        this.x = this.bounds.maxX; this.vx = -this.vx * this.restitution; this.vr += (Math.random() * 2 - 1) * 6;
      }
      if (this.y <= 0) {
        this.y = 0; this.vy = -this.vy * this.restitution; this.vr += (Math.random() * 2 - 1) * 6;
      } else if (this.y >= this.bounds.maxY) {
        this.y = this.bounds.maxY; this.vy = -this.vy * this.restitution; this.vr += (Math.random() * 2 - 1) * 6;
      }

      // render transfrom position
      this.img.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angle}deg)`;

      requestAnimationFrame(this._tick.bind(this));
    }
  }

  // open for global
  window.initDrifter = function initDrifter(options = {}) {
    return new ZeroGDrifter(options);
  };
})();
