(() => {
    // get audio player
    const players = document.querySelectorAll('.audio-player');

    players.forEach(player => {
        const playBtn = player.querySelector('.play');
        const pauseBtn = player.querySelector('.pause');
        const statusText = player.querySelector('.status');

        let audio = player.querySelector('audio');
        if (!audio) {
            const src = player.dataset.src;
            if (!src) {
                console.warn('[audio-player] unable to find');
                return;
            }
            audio = document.createElement('audio');
            audio.src = src;
            audio.preload = 'metadata';
            audio.style.display = 'none';
            player.appendChild(audio);
        }
        audio.volume = 0.7; // default volume set

        // status update
        const updateButtons = () => {
            const isPaused = audio.paused;

            if(statusText)
            {
                statusText.textContent = isPaused ? 'Background Music stopped' : 'Background Music is playing...';
            }
        };

        // button events
        playBtn.addEventListener('click', () => {
            audio.play().catch(err => {
                console.error('[audio-player] failed to play:', err);
            });
        });
        pauseBtn.addEventListener('click', () => audio.pause());

        // audio player events
        audio.addEventListener('play', () => {
            // in case if multiple players exist
            document.querySelectorAll('.audio-player audio').forEach(other => {
                if (other !== audio) other.pause();
            });
            updateButtons();
        });
        audio.addEventListener('pause', updateButtons);
        audio.addEventListener('ended', updateButtons);

        updateButtons();
    });
})();