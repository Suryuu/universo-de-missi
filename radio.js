(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const audio = $('music-audio');
  const panel = $('radio-dialog');
  const originals = [
    {titulo:'Faroles de papel', archivo:'./assets/musica/faroles-de-papel.mp3'},
    {titulo:'Pasitos de Sol', archivo:'./assets/musica/pasitos-de-sol.mp3'},
    {titulo:'Ventanas azules', archivo:'./assets/musica/ventanas-azules.mp3'}
  ];
  const personal = window.REGALO_DE_MISSI?.canciones;
  const list = Array.isArray(personal) ? personal.filter(t => t && typeof t.titulo === 'string' && typeof t.archivo === 'string' && t.archivo.trim()) : [];
  const tracks = list.length ? list : originals;
  const defaults = {vol:.42, fx:true, muted:false, pause:false, index:0};
  let pref = {...defaults};
  try { Object.assign(pref, JSON.parse(localStorage.getItem('missi.radio.1') || '{}')); } catch {}
  pref.index = Number.isInteger(pref.index) && pref.index >= 0 && pref.index < tracks.length ? pref.index : 0;
  pref.vol = Number.isFinite(pref.vol) ? Math.max(0, Math.min(1, pref.vol)) : defaults.vol;
  let context, musicGain, fxGain, mediaSource, failedMusic = false, touched = false, loaded = -1;
  let wantsMusic = !pref.pause;
  function save() { try { localStorage.setItem('missi.radio.1', JSON.stringify(pref)); } catch {} }
  function setLevel() {
    if (musicGain) {
      musicGain.gain.setTargetAtTime(pref.vol, context.currentTime, .015);
      audio.volume = 1;
    } else { audio.volume = pref.vol; }
    audio.muted = !!pref.muted;
    if(fxGain)fxGain.gain.setTargetAtTime(pref.muted||!pref.fx ? 0 : 1,context.currentTime,.006);
  }
  function prepareSound() {
    const Engine = window.AudioContext || window.webkitAudioContext;
    if (!context && Engine) { try { context = new Engine(); } catch {} }
    if(context && !fxGain){fxGain=context.createGain();fxGain.connect(context.destination);}
    if (context?.state === 'suspended') context.resume().catch(() => {});
    // El grafo permite regular el volumen en Safari. Al abrir como archivo se usa
    // el reproductor nativo para no someter los MP3 locales a reglas de origen.
    if (context && !mediaSource && !failedMusic && location.protocol !== 'file:' && tracks.every(t => {
      try { const u = new URL(t.archivo,location.href); return u.origin === location.origin || u.protocol === 'data:'; }
      catch { return false; }
    })) {
      try {
        const gain = context.createGain();
        gain.connect(context.destination);
        mediaSource = context.createMediaElementSource(audio);
        mediaSource.connect(gain); musicGain = gain;
      } catch { failedMusic = true; }
    }
    setLevel();
  }
  function current() {
    if (loaded !== pref.index) {
      loaded = pref.index;
      audio.src = tracks[loaded].archivo;
      $('audio-status').textContent = '';
    }
  }
  function update() {
    const playing = !audio.paused && !audio.ended && !pref.muted;
    document.body.classList.toggle('music-on', playing);
    $('track-title').textContent = tracks[pref.index].titulo;
    $('track-count').textContent = (pref.index+1)+' / '+tracks.length;
    $('play-track').innerHTML = signo(playing?'pause':'play');
    $('play-track').setAttribute('aria-label', playing?'Pausar música':'Reproducir música');
    $('volume').value = Math.round(pref.vol*100);
    $('volume-value').value = Math.round(pref.vol*100)+' %';
    $('sound-effects').checked = !!pref.fx;
    $('all-muted').checked = !!pref.muted;
  }
  function play() {
    if (pref.muted) return;
    current();
    if (audio.error) audio.load();
    const pending = audio.play();
    if (pending) pending.catch(err => {
      if (err.name === 'AbortError') return;
      $('audio-status').textContent = err.name === 'NotAllowedError' ? 'Tocá reproducir para encender el tocadiscos.' : 'Esta pista no se pudo abrir. Podés elegir la siguiente.';
      update();
    });
    update();
  }
  function arrive() {
    if (touched) return;
    touched = true; prepareSound();
    if (!pref.pause && !pref.muted) play();
  }
  function show() {
    if (panel.open) return;
    panel.showModal(); update();
    $('play-track').focus({preventScroll:true});
  }
  function change(by, automatic = false) {
    const active = automatic || (!audio.paused && !pref.muted);
    pref.index = (pref.index+by+tracks.length)%tracks.length;
    current(); save(); update();
    if (active) play();
  }
  function fx(notes = [523,659], kind='note') {
    if (!pref.fx || pref.muted) return;
    prepareSound();
    if (!context) return;
    const now = context.currentTime+.012;
    notes.forEach((hz,i) => {
      const osc = context.createOscillator(), gain = context.createGain();
      const time = now+i*(kind==='purr'?.055:.108), len = kind==='purr'?.13:.29;
      osc.type = kind==='purr'?'triangle':'sine';
      osc.frequency.setValueAtTime(hz,time);
      if (kind==='purr') osc.frequency.exponentialRampToValueAtTime(hz*.83,time+len);
      gain.gain.setValueAtTime(.0001,time);
      gain.gain.exponentialRampToValueAtTime(kind==='purr'?.027:.041,time+.018);
      gain.gain.exponentialRampToValueAtTime(.0001,time+len);
      osc.connect(gain); gain.connect(fxGain); osc.start(time); osc.stop(time+len+.02);
      osc.onended=()=>{osc.disconnect();gain.disconnect();};
    });
  }
  $('radio-button').addEventListener('click',show);
  $('play-track').addEventListener('click',() => {
    touched=true; prepareSound();
    if (!audio.paused && !pref.muted) { audio.pause(); pref.pause=true; wantsMusic=false; }
    else { pref.muted=false; pref.pause=false; wantsMusic=true; setLevel(); play(); }
    save(); update();
  });
  $('next-track').addEventListener('click',()=>{ prepareSound();change(1); });
  $('prev-track').addEventListener('click',()=>{ prepareSound();change(-1); });
  $('volume').addEventListener('input',e=>{pref.vol=Number(e.target.value)/100; prepareSound();save();update();});
  $('sound-effects').addEventListener('change',e=>{pref.fx=e.target.checked;setLevel();save();if(pref.fx)fx([660]);});
  $('all-muted').addEventListener('change',e=>{
    prepareSound();pref.muted=e.target.checked;
    if(pref.muted){wantsMusic=!pref.pause; audio.pause();}
    setLevel();
    if(!pref.muted && wantsMusic && touched)play();
    save(); update();
  });
  audio.addEventListener('ended',()=>{if(!pref.muted&&!pref.pause)change(1,true);});
  audio.addEventListener('error',()=>{ $('audio-status').textContent='Esta pista no se pudo abrir. Podés elegir la siguiente.';update(); });
  ['play','playing','pause','loadedmetadata'].forEach(type=>audio.addEventListener(type,update));
  window.radioMissi={arrive,show,fx};
  update();
})();
