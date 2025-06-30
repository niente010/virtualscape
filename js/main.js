/* inizializza l'applicazione e gestisce gli event listener globali*/

import { updateConnections } from './connections.js';
import { initializeCategories } from './categories.js';
import { initializeProjects } from './projects.js';
import { ProjectTemplateManager } from './projectTemplates.js';
import { CompostView, resetCompostZIndex, handleCompostNavigation } from './compost.js'; 
import { handleBioNavigation } from './bio.js';
import { resetLandingPage } from './reset.js';

document.addEventListener('DOMContentLoaded', () => {
    console.group('Inizializzazione applicazione');
    resetLandingPage();
    console.groupEnd();
    
    // Gestisci l'hash iniziale se presente nell'URL
    if (window.location.hash) {
        handleCompostNavigation();
        handleBioNavigation();
    }
    
    // Event listeners globali
    window.addEventListener('resize', updateConnections);
    window.addEventListener('hashchange', () => {
        handleCompostNavigation();
        handleBioNavigation();
    });
});

console.log('Script caricato, in attesa di eventi...'); 

// Hover Image Functionality
let activeHoverImage = null; // Reference to the image currently being shown

function updateHoverPosition(e) {
  if (activeHoverImage) {
    activeHoverImage.style.left = (e.clientX + 20) + 'px';
    activeHoverImage.style.top  = (e.clientY - 20) + 'px';
  }
}

document.addEventListener('mousemove', updateHoverPosition);

function handleHoverLink(link) {
  const img = link.querySelector('.hover-image');
  if (!img) return;

  // Salva il parent originale per poter ripristinare la posizione dell'immagine
  const originalParent = img.parentElement;
  const originalNextSibling = img.nextSibling; // potrebbe essere null

  link.addEventListener('mouseenter', (e) => {
    // Sposta l'immagine nel body per evitare problemi con trasformazioni CSS degli antenati
    if (img.parentElement !== document.body) {
      document.body.appendChild(img);
    }
    activeHoverImage = img;
    img.classList.add('active');
    img.style.display = 'block';
    updateHoverPosition(e);
  });

  link.addEventListener('mouseleave', () => {
    img.classList.remove('active');
    img.style.display = 'none';
    if (originalParent && img.parentElement === document.body) {
      originalParent.insertBefore(img, originalNextSibling);
    }
    if (img === activeHoverImage) activeHoverImage = null;
  });
}

// Inizializza tutti i link hover esistenti
function initializeHoverImages() {
  document.querySelectorAll('.hover-image-link').forEach(handleHoverLink);
}

// Osserva cambiamenti nel DOM per gestire nuovi link hover
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) { // Element node
        // Cerca sia nel nuovo nodo che nei suoi figli
        if (node.classList?.contains('hover-image-link')) {
          handleHoverLink(node);
        }
        node.querySelectorAll?.('.hover-image-link').forEach(handleHoverLink);
      }
    });
  });
});

// Inizializza al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
  initializeHoverImages();
  
  // Inizia ad osservare il DOM per cambiamenti
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// Reinizializza quando il contenuto dinamico viene caricato
document.addEventListener('contentLoaded', initializeHoverImages); 

// Gestione link esterni annidati in .external-link (per evitare anchor nidificati)
document.addEventListener('click', (e) => {
  const target = e.target.closest('.external-link');
  if (target) {
    e.stopPropagation();
    const url = target.dataset.url;
    if (url) {
      window.open(url, '_blank');
    }
  }
}); 
