// ===== Project-1 Auto-Slideshow =====
(function(){
    const slides = document.querySelectorAll('#section .slideshow img');
    if(!slides.length) return;

    let i = 0;
    slides[0].classList.add('show');

    setInterval(()=>{
        slides[i].classList.remove('show');
        i = (i + 1) % slides.length;
        slides[i].classList.add('show');
    }, 3000);   // 3000 -> 3s per picture
})();
