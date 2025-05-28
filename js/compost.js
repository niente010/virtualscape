import { compostItems } from './compostDatabase.js';

let compostZIndex = 100; // z-index di partenza per compost

export class CompostView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = [...compostItems].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  render() {
    this.container.innerHTML = '';
    this.items.forEach((item, idx) => {
      const el = this.createElement(item, idx);
      this.randomizeStyle(el, item.type, idx);
      this.makeDraggable(el);
      this.container.appendChild(el);
      // Inizializza wavesurfer SOLO dopo che l'elemento è nel DOM
      if (item.type === 'audio') {
        this.initWaveSurferPlayer(el, item.url);
      }
    });
    // Scrolla all'estremo sinistro dopo il render
    this.container.scrollLeft = 0;
  }

  createElement(item, idx) {
    const el = document.createElement('div');
    el.className = 'compost-item';
    el.style.position = 'absolute';
    el.dataset.idx = idx;

    if (item.type === 'image') {
      el.classList.add('image');
      el.innerHTML = `<img src="${item.url}" alt="${item.title || ''}" style="width:100%;display:block;">`;
      el.querySelector('img').addEventListener('dragstart', e => e.preventDefault());
    } else if (item.type === 'quote') {
      // Scegli un font casuale tra quelli disponibili
      const fonts = ['font-tangle', 'font-wondertype', 'font-petme', 'font-badgerspine', 'font-fungal', 'font-jrugpunk', 'font-bulletmotion', 'font-nutsboltsandwrenches', 'font-apostlexiii', 'font-karrik', 'font-filth', 'font-mattone', 'font-jetbrainsmono', 'font-rmentrees', 'font-prokaryotes'];
      const font = fonts[Math.floor(Math.random() * fonts.length)];
      // Font size tra 0.7em e 2em
      const fontSize = (0.7 + Math.random() * 1.3).toFixed(2) + 'em';
      el.innerHTML = `<span class="${font}" style="font-size:${fontSize};color:red;text-shadow:var(--text-glow);">${item.content}</span>`;
    } else if (item.type === 'text') {
      // Testo lungo: font size più piccolo, font casuale tra quelli "piccoli"
      const smallFonts = ['font-wondertype', 'font-fungal', 'font-jrugpunk', 'font-karrik'];
      const font = smallFonts[Math.floor(Math.random() * smallFonts.length)];
      const fontSize = (0.4 + Math.random() * 0.6).toFixed(2) + 'em';
      el.classList.add('compost-text');
      el.innerHTML = `<div class="${font}" style="font-size:${fontSize}; color:red; line-height:0.9; text-shadow:var(--text-glow);">${item.content}</div>`;
    } else if (item.type === 'audio') {
      // Custom audio player with wavesurfer.js
      el.innerHTML = `
        <div class="compost-audio-player">
          <div class="compost-audio-square"></div>
          <div class="compost-audio-waveform"></div>
        </div>
        <div class="compost-audio-title">${item.title || ''}</div>
      `;
    }
    return el;
  }

  randomizeStyle(el, type, idx) {
    if (type === 'image') {
      const scale = 0.2 + Math.random() * 0.2;
      el.style.width = `${scale * 80}%`;
    } else {
      el.style.width = 'auto';
    }
    // Distribuzione x: molto più denso a sinistra (cubica inversa)
    const rand = Math.random();
    const x = 100 * (1 - Math.pow(1 - rand, 10)); // Molto più denso a sinistra
    el.style.left = `${x}%`;
    // Distribuzione y: casuale su 65% dell'altezza
    const y = 10 + Math.random() * 65;
    el.style.top = `${y}%`;
    el.style.transform = 'translateY(-50%)';
    el.style.zIndex = Math.floor(Math.random() * 100);
  }

  makeDraggable(el) {
    let offsetX, offsetY, isDragging = false;
    el.onmousedown = (e) => {
      // Se il click è sulla waveform, non attivare il drag
      if (e.target.classList && e.target.classList.contains('compost-audio-waveform')) return;
      isDragging = true;
      compostZIndex++;
      el.style.zIndex = compostZIndex;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      document.onmousemove = (ev) => {
        if (!isDragging) return;
        el.style.left = (ev.clientX - offsetX) + 'px';
        el.style.top = (ev.clientY - offsetY) + 'px';
      };
      document.onmouseup = () => {
        isDragging = false;
        // Mantieni lo z-index massimo anche dopo il rilascio
        el.style.zIndex = compostZIndex;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
    // Porta in primo piano anche al semplice click
    el.onclick = () => {
      compostZIndex++;
      el.style.zIndex = compostZIndex;
    };
  }

  show() {
    this.container.style.opacity = '1';
    this.container.style.pointerEvents = 'auto';
    this.render();
  }

  hide() {
    this.container.style.opacity = '0';
    this.container.style.pointerEvents = 'none';
  }

  // Carica wavesurfer.js da CDN se non già presente
  static loadWaveSurferScript() {
    return new Promise((resolve, reject) => {
      if (window.WaveSurfer) return resolve();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/wavesurfer.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Impossibile caricare wavesurfer.js'));
      document.head.appendChild(script);
    });
  }

  // Inizializza il player wavesurfer custom
  async initWaveSurferPlayer(el, audioUrl) {
    await CompostView.loadWaveSurferScript();
    const waveformDiv = el.querySelector('.compost-audio-waveform');
    const square = el.querySelector('.compost-audio-square');
    // Crea wavesurfer
    const wavesurfer = window.WaveSurfer.create({
      container: waveformDiv,
      waveColor: '#ff0000',
      progressColor: '#ff000054',
      height: 200,
      responsive: true,
      cursorWidth: 0,
      interact: false, // di default non seekabile
    });
    wavesurfer.load(audioUrl);
    let isPlaying = false;
    let hasEnabledInteract = false;
    square.addEventListener('click', () => {
      wavesurfer.playPause();
    });
    wavesurfer.on('play', () => {
      isPlaying = true;
      square.classList.add('active');
      // Abilita interact solo la prima volta che parte la riproduzione
      if (!hasEnabledInteract) {
        wavesurfer.setOptions({ interact: true });
        hasEnabledInteract = true;
      }
    });
    wavesurfer.on('pause', () => {
      isPlaying = false;
      square.classList.remove('active');
    });
    wavesurfer.on('finish', () => {
      isPlaying = false;
      square.classList.remove('active');
      wavesurfer.seekTo(0);
    });
  }
} 