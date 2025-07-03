import { compostItems } from './compostDatabase.js';

export let compostZIndex = 100; // z-index di partenza per compost
export let globalCompostView = null; // Istanza globale di CompostView

export function resetCompostZIndex() {
  compostZIndex = 100;
}

export class CompostView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = [...compostItems].sort((a, b) => new Date(a.date) - new Date(b.date));
    this.audioPlayers = [];
    // Assicurati che la classe compost-page sia rimossa all'inizializzazione
    document.body.classList.remove('compost-page');
    
    // NEW: Lazy-loading observer (solo immagini)
    if ('IntersectionObserver' in window) {
      this.lazyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset && img.dataset.src) {
              img.src = img.dataset.src;
              delete img.dataset.src;
            }
            observer.unobserve(img);
          }
        });
      }, { root: this.container, rootMargin: '200px', threshold: 0.1 });
    } else {
      this.lazyObserver = null;
    }
    
    // Proprietà per lo scroll orizzontale
    this.isHorizontalScrollEnabled = false;
    this.wheelHandler = null;
    this.touchStartHandler = null;
    this.touchMoveHandler = null;
    this.touchStartY = 0;
    this.touchStartX = 0;
    
    // Salva l'istanza globalmente
    globalCompostView = this;
  }

  render() {
    this.container.innerHTML = '';
    this.items.forEach((item, idx) => {
      const el = this.createElement(item, idx);
      this.randomizeStyle(el, item.type, idx);
      this.makeDraggable(el);
      this.container.appendChild(el);
      // Se è un elemento audio, inizializza subito wavesurfer (caricamento immediato)
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
      // LAZY IMG PLACEHOLDER
      const img = document.createElement('img');
      img.style.cssText = 'width:100%;display:block;';
      img.alt = item.title || '';
      img.dataset.src = item.url; // src verrà impostato dall'observer
      img.loading = 'lazy'; // fallback per browser che lo supportano anche senza observer
      img.addEventListener('dragstart', e => e.preventDefault());
      el.appendChild(img);
      // Osserva per il lazy-loading se possibile
      if (this.lazyObserver) {
        this.lazyObserver.observe(img);
      } else {
        img.src = item.url; // Fallback senza IntersectionObserver
      }
    } else if (item.type === 'quote') {
      // Scegli un font casuale tra quelli disponibili
      const fonts = ['font-tangle', 'font-wondertype', 'font-petme', 'font-badgerspine', 'font-fungal', 'font-jrugpunk', 'font-bulletmotion', 'font-nutsboltsandwrenches', 'font-apostlexiii', 'font-karrik', 'font-filth', 'font-mattone', 'font-jetbrainsmono', 'font-rmentrees', 'font-prokaryotes', 'font-punknova', 'font-insolente', 'font-myrtillepixel'];
      const font = fonts[Math.floor(Math.random() * fonts.length)];
      // Font size tra 0.7em e 2em
      const fontSize = (0.7 + Math.random() * 1.3).toFixed(2) + 'em';
      el.innerHTML = `<span class="${font}" style="font-size:${fontSize};color:red;text-shadow:var(--text-glow);">${item.content}</span>`;
    } else if (item.type === 'text') {
      // Testo lungo: font size più piccolo, font casuale tra quelli "piccoli"
      const smallFonts = ['font-wondertype', 'font-fungal', 'font-jrugpunk', 'font-karrik', 'font-gensco', 'font-insolente', 'font-punknova'];
      const font = smallFonts[Math.floor(Math.random() * smallFonts.length)];
      const fontSize = (0.4 + Math.random() * 0.6).toFixed(2) + 'em';
      el.classList.add('compost-text');
      el.innerHTML = `<div class="${font}" style="font-size:${fontSize}; color:red; line-height:0.9; text-shadow:var(--text-glow);">${item.content}</div>`;
    } else if (item.type === 'audio') {
      // Custom audio player with wavesurfer.js (inizializzato subito dopo il render)
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
      // Imposta la larghezza in unità viewport (vw) in modo che non dipenda
      // dalla larghezza del contenitore ma dal viewport stesso.
      const minVW = 16;   // valore minimo ~ precedente 8% di 200vw
      const maxVW = 32;   // valore massimo ~ precedente 16% di 200vw
      const widthVW = minVW + Math.random() * (maxVW - minVW);
      el.style.width = `${widthVW}vw`; 
    } else {
      el.style.width = 'auto';
    }
    // Distribuzione x: concentrata al centro con offset controllabile
    // Offset orizzontale (percentuale rispetto alla larghezza del container)
    const OFFSET_PCT = 2; // sposta tutto di almeno 5% a destra (evita bordo sinistro)

    // Triangular distribution (media di due uniformi) ~ simile a secante iperbolica
    const triRand = (Math.random() + Math.random()) / 2; // valori 0-1, picco al centro ~0.5

    // Range totale in cui distribuire (in percentuale del container)
    const RANGE_PCT = 250; // elementi possono arrivare a +300% rispetto al bordo sinistro

    // Posizione finale: da OFFSET_PCT a OFFSET_PCT + RANGE_PCT, con densità maggiore al centro
    const x = OFFSET_PCT + triRand * RANGE_PCT;

    el.style.left = `${x}%`
    // Distribuzione y: casuale su 65% dell'altezza
    const y = 10 + Math.random() * 70;
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
    document.body.classList.add('compost-page');
    this.render();
    this.enableHorizontalScroll();
  }

  hide() {
    // Ferma tutti i player audio attivi
    if (this.audioPlayers) {
      this.audioPlayers.forEach(player => {
        if (player && player.isPlaying && player.isPlaying()) {
          player.pause();
        }
      });
      this.audioPlayers = [];
    }
    this.container.style.opacity = '0';
    this.container.style.pointerEvents = 'none';
    document.body.classList.remove('compost-page');
    this.disableHorizontalScroll();
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
      height: 150,
      responsive: true,
      cursorWidth: 0,
      interact: false, // di default non seekabile
    });
    this.audioPlayers.push(wavesurfer);
    wavesurfer.load(audioUrl);
    let isPlaying = false;
    let hasEnabledInteract = false;
    square.addEventListener('click', () => {
      wavesurfer.playPause();
    });
    wavesurfer.on('play', () => {
      isPlaying = true;
      square.classList.add('active');
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
    return wavesurfer;
  }

  // Abilita lo scroll orizzontale che risponde al movimento verticale
  enableHorizontalScroll() {
    if (this.isHorizontalScrollEnabled) return;
    
    this.isHorizontalScrollEnabled = true;
    
    // Gestione scroll con rotella del mouse
    this.wheelHandler = (e) => {
      // Se c'è movimento orizzontale (touchpad), lascialo passare normalmente
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return; // Permetti lo scroll orizzontale nativo
      }
      
      // Altrimenti, converti il movimento verticale in orizzontale
      e.preventDefault();
      const scrollAmount = e.deltaY * 2; // Moltiplicatore per velocità
      this.container.scrollLeft += scrollAmount;
    };
    
    // Gestione touch per dispositivi mobili
    this.touchStartHandler = (e) => {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
    };
    
    this.touchMoveHandler = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = this.touchStartY - touchY;
      const deltaX = this.touchStartX - touchX;
      
      // Se il movimento è più verticale che orizzontale, converti in scroll orizzontale
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        this.container.scrollLeft += deltaY * 2;
        this.touchStartY = touchY;
      }
    };
    
    // Applica gli event listener
    this.container.addEventListener('wheel', this.wheelHandler, { passive: false });
    this.container.addEventListener('touchstart', this.touchStartHandler, { passive: false });
    this.container.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    
    // Blocca lo scroll verticale del body quando siamo nella compost page
    document.body.style.overflow = 'hidden';
  }

  // Disabilita lo scroll orizzontale
  disableHorizontalScroll() {
    if (!this.isHorizontalScrollEnabled) return;
    
    this.isHorizontalScrollEnabled = false;
    
    // Rimuovi gli event listener
    if (this.wheelHandler) {
      this.container.removeEventListener('wheel', this.wheelHandler);
      this.wheelHandler = null;
    }
    
    // Rimuovi tutti gli event listener di touch
    if (this.touchStartHandler) {
      this.container.removeEventListener('touchstart', this.touchStartHandler);
      this.touchStartHandler = null;
    }
    if (this.touchMoveHandler) {
      this.container.removeEventListener('touchmove', this.touchMoveHandler);
      this.touchMoveHandler = null;
    }
    
    // Ripristina lo scroll verticale del body
    document.body.style.overflow = '';
  }
} 

// Gestione della navigazione hash per compost
export function handleCompostNavigation() {
  const compostBlock = document.querySelector('.link-block[data-category="compost"]');
  
  // Crea l'istanza solo se non esiste già
  if (!globalCompostView) {
    globalCompostView = new CompostView('compost-container');
  }
  
  if (window.location.hash === '#compost') {
    if (compostBlock) compostBlock.classList.add('active');
    if (globalCompostView) globalCompostView.show();
  } else {
    if (compostBlock) compostBlock.classList.remove('active');
    if (globalCompostView) globalCompostView.hide();
  }
} 

// Funzione per fermare tutti i player audio attivi
export function stopAllCompostAudio() {
  if (globalCompostView && globalCompostView.audioPlayers) {
    globalCompostView.audioPlayers.forEach(player => {
      if (player && player.isPlaying && player.isPlaying()) {
        player.pause();
      }
    });
  }
} 

