// interactable planet init:
window.addEventListener('DOMContentLoaded', () => {
  initDrifter({
    imgSrc: "_assets/Others/artificial satellite.png",
    restitution: 0.98,
    jitter: 8
  });
});

// mouse click effect init:
window.addEventListener('DOMContentLoaded', () => {
  new ClickFade({
    imgSrc: "_assets/Others/MouseEffect.png", 
    size: 40,
    duration: 1000,
    scaleFrom: 1.0,
    scaleTo: 1.4,
    onlyLeftClick: true
  });
});
