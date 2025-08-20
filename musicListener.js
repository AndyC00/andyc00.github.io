//singleton of Audio player
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

// make sure to get GainNode
function ensureGainNodeFor(audio, initial = 0.7) {
  if (audio._gainNode) return audio._gainNode;
  const src = audioCtx.createMediaElementSource(audio);
  const gain = audioCtx.createGain();
  gain.gain.value = initial;
  src.connect(gain).connect(audioCtx.destination);
  audio._gainNode = gain;
  audio.volume = 1;
  return gain;
}

// fade in play/resume
async function smoothFadeIn(audio, to = 0.7, sec = 0.8) {
  if (audio._fadeTimeout) { clearTimeout(audio._fadeTimeout); audio._fadeTimeout = null; }

  await audioCtx.resume();
  const g = ensureGainNodeFor(audio, 0.0001);
  const t = audioCtx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t);
  g.gain.linearRampToValueAtTime(to, t + sec);
  await audio.play();
}

// fade out and pause
function smoothFadeOutAndPause(audio, sec = 0.5) {
  const g = ensureGainNodeFor(audio);
  const t = audioCtx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t);
  g.gain.linearRampToValueAtTime(0.0001, t + sec);

  if (audio._fadeTimeout) clearTimeout(audio._fadeTimeout);
  audio._fadeTimeout = setTimeout(() => {
    audio.pause();
    audio._fadeTimeout = null;
  }, sec * 1000);
}

(() => {
  const players = document.querySelectorAll('.audio-player');

  players.forEach(player => {
    const playBtn = player.querySelector('.play');
    const pauseBtn = player.querySelector('.pause');
    const statusEl = player.querySelector('.status');

    let audio = player.querySelector('audio');
    if (!audio) {
      const src = player.dataset.src;
      if (!src) { console.warn('[audio-player] unable to find'); return; }
      audio = document.createElement('audio');
      audio.src = src;
      audio.preload = 'metadata';
      audio.style.display = 'none';
      player.appendChild(audio);
    }

    audio.volume = 1;

    // state update
    const updateButtons = () => {
      const isPaused = audio.paused;
      if (statusEl) {
        statusEl.textContent = isPaused
          ? 'Background Music stopped'
          : 'Background Music is playing...';
      }
      if (playBtn) playBtn.hidden = !isPaused;
      if (pauseBtn) pauseBtn.hidden = isPaused;
    };

    // fade in & out events
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        smoothFadeIn(audio, 0.7, 0.8)
          .then(updateButtons)
          .catch(err => console.error('[audio-player] failed to play:', err));
      });
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        smoothFadeOutAndPause(audio, 0.5);
      });
    }

    audio.addEventListener('play', () => {
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