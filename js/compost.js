import { compostItems } from './compostDatabase.js';

export class CompostView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = [...compostItems].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  render() {
    this.container.innerHTML = '';
    this.items.forEach((item, idx) => {
      const el = this.createElement(item, idx);
      this.randomizeStyle(el, item.type);
      this.makeDraggable(el);
      this.container.appendChild(el);
    });
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
    } else if (item.type === 'text') {
      // Scegli un font casuale tra quelli disponibili
      const fonts = ['font-tangle', 'font-wondertype', 'font-petme', 'font-badgerspine', 'font-fungal', 'font-jrugpunk', 'font-bulletmotion', 'font-nutsboltsandwrenches', 'font-apostlexiii', 'font-karrik', 'font-filth', 'font-mattone', 'font-jetbrainsmono', 'font-rmentrees', 'font-prokaryotes'];
      const font = fonts[Math.floor(Math.random() * fonts.length)];
      // Font size tra 0.7em e 2em
      const fontSize = (0.7 + Math.random() * 1.3).toFixed(2) + 'em';
      el.innerHTML = `<span class="${font}" style="font-size:${fontSize};color:red;">${item.content}</span>`;
    } else if (item.type === 'audio') {
      el.innerHTML = `
        <audio src="${item.url}" controls style="width:120px;"></audio>
        <div>${item.title || ''}</div>
      `;
    }
    return el;
  }

  randomizeStyle(el, type) {
    // Dimensione random per immagini
    if (type === 'image') {
      const scale = 0.2 + Math.random() * 0.2; // 20% - 40%
      el.style.width = `${scale * 80}%`;
    } else {
      el.style.width = 'auto';
    }
    // Posizione random
    el.style.left = `${Math.random() * 70}%`;
    el.style.top = `${Math.random() * 90}%`;
    // Z-index random
    el.style.zIndex = Math.floor(Math.random() * 100);
  }

  makeDraggable(el) {
    let offsetX, offsetY, isDragging = false;
    el.onmousedown = (e) => {
      // Porta sempre in primo piano l'elemento toccato
      const allItems = document.querySelectorAll('.compost-item');
      let maxZ = 0;
      allItems.forEach(item => {
        const z = parseInt(item.style.zIndex) || 0;
        if (z > maxZ) maxZ = z;
      });
      el.style.zIndex = maxZ + 1;
      isDragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      document.onmousemove = (ev) => {
        if (!isDragging) return;
        el.style.left = (ev.clientX - offsetX) + 'px';
        el.style.top = (ev.clientY - offsetY) + 'px';
      };
      document.onmouseup = () => {
        isDragging = false;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }
} 