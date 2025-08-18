(() => {
  class ClickFade {
    constructor({
      imgSrc,
      size = 64,
      duration = 1000,
      scaleFrom = 1.0,
      scaleTo = 1.4,
      rotate = true,
      zIndex = 9999,
      opacityFrom = 1,
      opacityTo = 0,
      onlyLeftClick = true,
      container = document // setting properties
    } = {}) {
      if (!imgSrc) throw new Error("ClickFade: imgSrc is required");

      this.cfg = {
        imgSrc,
        size,
        duration,
        scaleFrom,
        scaleTo,
        rotate,
        zIndex,
        opacityFrom,
        opacityTo,
        onlyLeftClick,
        container
      };

      // reduce animation in system if the user's system set to
      this.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

      // preload image
      this.preloaded = new Image();
      this.preloaded.src = imgSrc;

      this.onPointerDown = this.onPointerDown.bind(this);
      container.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    }

    onPointerDown(e) {
      // only left click available on desktop
      if (this.cfg.onlyLeftClick && e.pointerType === "mouse" && e.button !== 0) return;

      const x = e.clientX;
      const y = e.clientY;
      this.spawn(x, y);
    }

    spawn(x, y) {
      const cfg = this.cfg;
      const img = new Image();
      img.src = cfg.imgSrc;

      const sizePx = typeof cfg.size === "number" ? `${cfg.size}px` : cfg.size;

      Object.assign(img.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        width: sizePx,
        height: sizePx,
        pointerEvents: "none",
        userSelect: "none",
        transform: `translate(-50%, -50%) scale(${cfg.scaleFrom})${this._rotate(cfg.rotate)}`,
        opacity: `${cfg.opacityFrom}`,
        transition: `transform ${cfg.duration}ms cubic-bezier(.2,.8,.2,1), opacity ${cfg.duration}ms linear`,
        willChange: "transform, opacity",
        zIndex: String(cfg.zIndex),
        imageRendering: "auto"
      });

      document.body.appendChild(img);

      // noly fade out or less
      if (this.reducedMotion) {
        img.style.transition = `opacity ${Math.min(200, cfg.duration)}ms linear`;
      }

      // fade trigger
      requestAnimationFrame(() => {
        if (!img.isConnected) return;
        img.style.opacity = `${cfg.opacityTo}`;
        const endScale = this.reducedMotion ? cfg.scaleFrom : cfg.scaleTo;
        img.style.transform = `translate(-50%, -50%) scale(${endScale})${this._rotate(cfg.rotate)}`;
      });

      // remove after fade
      const remove = () => img.remove();
      img.addEventListener("transitionend", remove, { once: true });
      setTimeout(remove, cfg.duration + 120);
    }

    _rotate(enable) {
      if (!enable) return "";
      const deg = (Math.random() * 360).toFixed(2);
      return ` rotate(${deg}deg)`;
    }

    destroy() {
      this.cfg.container.removeEventListener("pointerdown", this.onPointerDown);
    }
  }

  window.ClickFade = ClickFade;
})();
