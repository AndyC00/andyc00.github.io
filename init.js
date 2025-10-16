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

// center target section when clicking nav anchors
window.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // ignore if it's just '#'
      if (!href || href === '#') return;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      // update URL hash without jumping
      history.pushState(null, '', href);
    });
  });
});
