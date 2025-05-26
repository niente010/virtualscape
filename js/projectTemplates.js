export class ProjectTemplateManager {
    constructor() {
        this.currentTemplate = null;
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.wasDragged = false;
        console.log('ProjectTemplateManager inizializzato');
    }

    async showProjectDescription(link) {
        const descriptionBox = document.createElement('div');
        descriptionBox.className = 'project-content invisible';

        // Crea il blocco info (titolo, wherewhen, keywords)
        const infoGroup = document.createElement('div');
        infoGroup.className = 'project-info-group';

        // WhereWhen
        const wherewhenEl = link.querySelector('.project-wherewhen');
        if (wherewhenEl) {
            const wherewhen = document.createElement('div');
            wherewhen.className = 'project-wherewhen';
            wherewhen.textContent = wherewhenEl.textContent;
            infoGroup.appendChild(wherewhen);
        }

        // Keywords
        const keywordsEl = link.querySelector('.project-keywords');
        if (keywordsEl) {
            const keywords = document.createElement('div');
            keywords.className = 'project-keywords';
            keywords.textContent = keywordsEl.textContent;
            infoGroup.appendChild(keywords);
        }

        // Crea il contenitore per la descrizione
        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'project-description';
        descriptionContainer.innerHTML = link.querySelector('.project-description-full').innerHTML;

        // Raggruppa infoGroup e descrizione in una colonna principale
        const mainColumn = document.createElement('div');
        mainColumn.className = 'project-main-column';
        mainColumn.appendChild(infoGroup);
        mainColumn.appendChild(descriptionContainer);
        descriptionBox.appendChild(mainColumn);

        // Crea il contenitore per l'immagine
        const imageContainer = document.createElement('div');
        imageContainer.className = 'project-image-container';
        // Crea il wrapper per l'immagine
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'project-image-wrapper';
        // Crea l'immagine usando il data-attribute
        const imagePath = link.dataset.image;
        if (imagePath) {
            const image = document.createElement('img');
            image.src = imagePath;
            image.className = 'project-image';
            image.alt = link.querySelector('.project-title').textContent;
            imageWrapper.appendChild(image);
        }
        imageContainer.appendChild(imageWrapper);

        // Crea il link per l'archivio
        const archiveLink = document.createElement('a');
        archiveLink.href = '#';
        archiveLink.className = 'archive-link';
        archiveLink.innerHTML = 'archivio';
        archiveLink.setAttribute('draggable', 'false');

        // Trova le thumb nel DOM del progetto selezionato
        const thumbsContainer = link.querySelector('.project-archive-thumbs');
        if (thumbsContainer) {
            const archiveGallery = document.createElement('div');
            archiveGallery.className = 'archive-gallery';
            const gallery = [];
            thumbsContainer.querySelectorAll('img').forEach((imgEl, idx) => {
                gallery.push({
                    src: imgEl.src,
                    alt: imgEl.alt,
                    embed: imgEl.getAttribute('data-embed') || '',
                    filename: imgEl.getAttribute('data-filename') || '',
                    format: imgEl.getAttribute('data-format') || '',
                    source: imgEl.getAttribute('data-source') || '',
                });
                const img = document.createElement('img');
                img.src = imgEl.src;
                img.alt = imgEl.alt;
                img.className = 'archive-thumb';
                img.setAttribute('draggable', 'false');
                img.onclick = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    showLightboxFromGallery(idx, gallery);
                };
                archiveGallery.appendChild(img);
            });
            archiveLink.appendChild(archiveGallery);
        }

        // Aggiungi event listeners per il drag and drop
        archiveLink.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Solo tasto sinistro
                this.dragStart(e, archiveLink);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e, archiveLink);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) { // Solo tasto sinistro
                this.isDragging = false;
            }
        });

        archiveLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.wasDragged) {
                archiveLink.classList.toggle('active');
            }
            this.wasDragged = false;
        });

        // Aggiungi tutti gli elementi
        descriptionBox.appendChild(imageContainer);
        descriptionBox.appendChild(archiveLink);

        document.body.appendChild(descriptionBox);
        this.currentTemplate = descriptionBox;

        // Forza un reflow e rendi visibile
        descriptionBox.offsetHeight;
        descriptionBox.style.opacity = '1';
        archiveLink.style.opacity = '1';

        // Centra il project content dopo averlo mostrato
        centerProjectContent();
        descriptionBox.classList.remove('invisible');
    }

    dragStart(e, element) {
        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;
        this.isDragging = true;
        this.wasDragged = false;
    }

    drag(e, element) {
        if (this.isDragging) {
            e.preventDefault();
            this.currentX = e.clientX - this.initialX;
            this.currentY = e.clientY - this.initialY;
            this.xOffset = this.currentX;
            this.yOffset = this.currentY;
            this.setTranslate(this.currentX, this.currentY, element);
            this.wasDragged = true;
        }
    }

    setTranslate(xPos, yPos, element) {
        element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    hideProjectDescription() {
        if (this.currentTemplate) {
            this.currentTemplate.style.opacity = '0';
            setTimeout(() => {
                this.currentTemplate.remove();
                this.currentTemplate = null;
            }, 500);
        }
    }
}

let currentGallery = [];
let currentIndex = 0;

function showLightboxFromGallery(index, gallery) {
    currentGallery = gallery;
    currentIndex = (index + gallery.length) % gallery.length;
    const {src, alt, embed, filename, format, source} = gallery[currentIndex];
    showLightbox(src, alt, embed, filename, format, source, true);
}

// Gestore tastiera per la lightbox
function handleLightboxKeydown(e) {
    const overlay = document.querySelector('.archive-lightbox-overlay.active');
    if (!overlay) return;
    if (e.key === 'Escape') {
        overlay.classList.remove('active');
        document.removeEventListener('keydown', handleLightboxKeydown);
    } else if (e.key === 'ArrowRight' && currentGallery.length > 1) {
        showLightboxFromGallery(currentIndex + 1, currentGallery);
        setTimeout(() => {
            const newNext = document.querySelector('.lightbox-nav-square.right');
            if (newNext) {
                newNext.classList.add('active');
                setTimeout(() => newNext.classList.remove('active'), 175);
            }
        }, 10);
    } else if (e.key === 'ArrowLeft' && currentGallery.length > 1) {
        showLightboxFromGallery(currentIndex - 1, currentGallery);
        setTimeout(() => {
            const newPrev = document.querySelector('.lightbox-nav-square.left');
            if (newPrev) {
                newPrev.classList.add('active');
                setTimeout(() => newPrev.classList.remove('active'), 175);
            }
        }, 10);
    }
}

function stopAllMedia() {
    const iframes = document.querySelectorAll('.archive-lightbox-overlay iframe');
    iframes.forEach(iframe => {
        // Per YouTube
        if (iframe.src.includes('youtube.com')) {
            iframe.src = iframe.src;
        }
        // Per SoundCloud
        if (iframe.src.includes('soundcloud.com')) {
            iframe.src = iframe.src;
        }
    });
}

function showLightbox(src, alt, embed = '', filename = '', format = '', source = '', withNav = false) {
    let overlay = document.querySelector('.archive-lightbox-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'archive-lightbox-overlay';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'archive-lightbox-box';

    // Quadrato di chiusura
    const closeSquare = document.createElement('div');
    closeSquare.className = 'lightbox-close-square active';
    closeSquare.title = 'Chiudi';
    closeSquare.onclick = (e) => {
        e.stopPropagation();
        stopAllMedia();
        overlay.classList.remove('active');
        document.removeEventListener('keydown', handleLightboxKeydown);
    };
    overlay.appendChild(closeSquare);

    // Quadrati di navigazione
    if (withNav && currentGallery.length > 1) {
        const prevSquare = document.createElement('div');
        prevSquare.className = 'lightbox-nav-square left';
        prevSquare.onclick = (e) => {
            e.stopPropagation();
            showLightboxFromGallery(currentIndex - 1, currentGallery);
            setTimeout(() => {
                const newPrev = document.querySelector('.lightbox-nav-square.left');
                if (newPrev) {
                    newPrev.classList.add('active');
                    setTimeout(() => newPrev.classList.remove('active'), 175);
                }
            }, 10);
        };
        overlay.appendChild(prevSquare);

        const nextSquare = document.createElement('div');
        nextSquare.className = 'lightbox-nav-square right';
        nextSquare.onclick = (e) => {
            e.stopPropagation();
            showLightboxFromGallery(currentIndex + 1, currentGallery);
            setTimeout(() => {
                const newNext = document.querySelector('.lightbox-nav-square.right');
                if (newNext) {
                    newNext.classList.add('active');
                    setTimeout(() => newNext.classList.remove('active'), 175);
                }
            }, 10);
        };
        overlay.appendChild(nextSquare);
    }

    // Visualizzazione risorsa
    let media;
    if (format === 'video' && embed) {
        media = document.createElement('iframe');
        media.className = 'archive-lightbox-video';
        media.src = embed;
        media.width = '100%';
        media.height = 'auto';
        media.title = 'YouTube video player';
        media.frameBorder = '0';
        media.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        media.referrerPolicy = 'strict-origin-when-cross-origin';
        media.allowFullscreen = true;
    } else if (format === 'audio' && embed) {
        // Gestione SoundCloud
        const trackUrl = encodeURIComponent(embed);
        
        // Creiamo un contenitore per l'iframe
        const audioContainer = document.createElement('div');
        audioContainer.className = 'archive-lightbox-audio-container';
        audioContainer.style.width = '500px';
        audioContainer.style.height = '500px';
        audioContainer.style.position = 'relative';
        audioContainer.style.overflow = 'hidden';
        
        media = document.createElement('iframe');
        media.className = 'archive-lightbox-video';
        media.style.width = '100%';
        media.style.height = '100%';
        media.style.position = 'absolute';
        media.style.top = '0';
        media.style.left = '0';
        media.style.border = 'none';
        media.allow = 'autoplay';
        media.src = `https://w.soundcloud.com/player/?url=${trackUrl}&color=%23464926&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
        
        audioContainer.appendChild(media);
        box.appendChild(audioContainer);
    } else {
        media = document.createElement('img');
        media.className = 'archive-lightbox-img';
        media.src = src;
        media.alt = alt || '';
    }
    box.appendChild(media);

    // Caption universale
    const captionDiv = document.createElement('div');
    captionDiv.className = 'archive-lightbox-caption';
    captionDiv.innerHTML =
        `file name: <span>${filename}</span><br>format: <span>${format}</span><br>source: <a href="${source}" target="_blank" class="source-link">${source}</a><span class="source-symbol">⌱</span>`;
    box.appendChild(captionDiv);

    overlay.appendChild(box);
    overlay.classList.add('active');
    overlay.style.cursor = 'default';
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            stopAllMedia();
            overlay.classList.remove('active');
            document.removeEventListener('keydown', handleLightboxKeydown);
        }
    };
    if (source && media) {
        media.style.cursor = 'pointer';
        media.onclick = (e) => {
            window.open(source, '_blank');
        };
    }
    document.addEventListener('keydown', handleLightboxKeydown);
}

// Funzione per centrare project-content tra la barra rossa e il fondo della finestra
function centerProjectContent() {
    const animationGroup = document.querySelector('.project-animation-group');
    const projectContent = document.querySelector('.project-content');
    if (!animationGroup || !projectContent) return;

    // Calcola il bottom della barra rossa
    const groupRect = animationGroup.getBoundingClientRect();

    // Posiziona subito sotto il gruppo animazione, con un margine di 10px
    let top = groupRect.bottom;

    projectContent.style.top = `${top}px`;
    projectContent.style.position = 'absolute';
    projectContent.style.left = '50%';
    projectContent.style.transform = 'translateX(-50%)';
    projectContent.style.width = '100%';
    projectContent.style.overflow = 'hidden';
}

window.addEventListener('resize', centerProjectContent);

// Funzione per rimuovere il margin-bottom alle ultime immagini di ogni colonna in una masonry gallery
function removeBottomMarginFromLastColumnImages(galleryEl) {
    if (!galleryEl) return;
    const thumbs = Array.from(galleryEl.querySelectorAll('.archive-thumb'));
    if (thumbs.length === 0) return;
    // Reset margini
    thumbs.forEach(img => img.style.marginBottom = '10px');
    // Calcola quante colonne ci sono
    const computedStyle = window.getComputedStyle(galleryEl);
    const columnCount = parseInt(computedStyle.columnCount, 10) || 1;
    // Trova le ultime immagini di ogni colonna
    const bottoms = Array(columnCount).fill({bottom: -Infinity, idx: -1});
    thumbs.forEach((img, i) => {
        const rect = img.getBoundingClientRect();
        const col = Math.round((rect.left - galleryEl.getBoundingClientRect().left) / rect.width);
        if (rect.bottom > bottoms[col]?.bottom) {
            bottoms[col] = {bottom: rect.bottom, idx: i};
        }
    });
    // Rimuovi il margin-bottom alle ultime immagini di ogni colonna
    bottoms.forEach(({idx}) => {
        if (idx >= 0) thumbs[idx].style.marginBottom = '0';
    });
} 