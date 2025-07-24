document.querySelectorAll('.slideshow').forEach(slider => {
    const imgs = slider.querySelectorAll('img');
    if (!imgs.length)   return;

    let i = 0;
    imgs[0].classList.add('show');

    setInterval(() => {
        imgs[i].classList.remove('show');
        i = (i + 1) % imgs.length;  //back to the first image when last img finished
        imgs[i].classList.add('show');
    }, 3000)    // 3 sec per picture
});