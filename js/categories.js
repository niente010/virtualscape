/* gestisce le categorie e la loro interattività */

import { updateConnections } from './connections.js';
import { initializeIdentitySelects } from './bio.js';
import { stopAllCompostAudio, globalCompostView } from './compost.js';

export function initializeCategories() {
    console.log('Categorie reinizializzate', globalCompostView);
    const categories = document.querySelectorAll('.link-block');
    // Rimuovi tutti i precedenti event listener clonando i nodi
    categories.forEach(block => {
        const newBlock = block.cloneNode(true);
        block.parentNode.replaceChild(newBlock, block);
    });
    // Seleziona di nuovo i nodi clonati
    const freshCategories = document.querySelectorAll('.link-block');
    freshCategories.forEach(block => {
        block.addEventListener('click', (e) => {
            e.preventDefault();
            const isCompost = block.dataset.category === 'compost';
            const isBio = block.dataset.category === 'bio';
            
            if (isCompost) {
                console.log('Compost click handler', globalCompostView);
                // Disattiva tutte le altre categorie
                freshCategories.forEach(cat => {
                    if (cat !== block) cat.classList.remove('active');
                });
                // Toggle compost
                const wasActive = block.classList.contains('active');
                if (wasActive) {
                    block.classList.remove('active');
                    if (globalCompostView) globalCompostView.hide();
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                } else {
                    block.classList.add('active');
                    if (globalCompostView) globalCompostView.show();
                    window.location.hash = 'compost';
                }
            } else if (isBio) {
                // Gestione bio - toggle semplice
                const bioContainer = document.getElementById('bio-container');
                if (bioContainer.style.opacity === '1') {
                    block.classList.remove('active');
                    bioContainer.style.opacity = '0';
                    bioContainer.style.pointerEvents = 'none';
                    document.body.classList.remove('bio-page');
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                    // Nascondi dopo la transizione
                    setTimeout(() => {
                        if (bioContainer.style.opacity === '0') {
                            bioContainer.style.display = 'none';
                        }
                    }, 300);
                } else {
                    // Disattiva tutte le altre categorie prima di aprire bio
                    freshCategories.forEach(cat => {
                        if (cat !== block) cat.classList.remove('active');
                    });
                    
                    // Se compost è attivo, disattivalo e ferma gli audio
                    const compostBlock = document.querySelector('.link-block[data-category="compost"]');
                    if (compostBlock && compostBlock.classList.contains('active')) {
                        compostBlock.classList.remove('active');
                        if (globalCompostView) globalCompostView.hide();
                        // Ferma tutti i player audio attivi
                        stopAllCompostAudio();
                        // Rimuovi l'hash #compost dall'URL
                        if (window.location.hash === '#compost') {
                            history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                    }
                    
                    block.classList.add('active');
                    bioContainer.style.display = 'block';
                    bioContainer.style.opacity = '1';
                    bioContainer.style.pointerEvents = 'auto';
                    document.body.classList.add('bio-page');
                    window.location.hash = '#bio';
                    // Inizializza gli identity selects
                    initializeIdentitySelects();
                }
            } else {
                // Per design, visual, audio
                // Se compost è attivo, disattivalo e ferma gli audio
                const compostBlock = document.querySelector('.link-block[data-category="compost"]');
                if (compostBlock && compostBlock.classList.contains('active')) {
                    compostBlock.classList.remove('active');
                    if (globalCompostView) globalCompostView.hide();
                    // Ferma tutti i player audio attivi
                    stopAllCompostAudio();
                    // Rimuovi l'hash #compost dall'URL
                    if (window.location.hash === '#compost') {
                        history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                }
                
                // Se bio è attivo, disattivalo
                const bioBlock = document.querySelector('.link-block[data-category="bio"]');
                const bioContainer = document.getElementById('bio-container');
                if (bioBlock && bioBlock.classList.contains('active')) {
                    bioBlock.classList.remove('active');
                    if (bioContainer) {
                        bioContainer.style.opacity = '0';
                        bioContainer.style.pointerEvents = 'none';
                        document.body.classList.remove('bio-page');
                        // Rimuovi l'hash #bio dall'URL
                        if (window.location.hash === '#bio') {
                            history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                        // Nascondi dopo la transizione
                        setTimeout(() => {
                            if (bioContainer.style.opacity === '0') {
                                bioContainer.style.display = 'none';
                            }
                        }, 300);
                    }
                }
                
                // Toggle la categoria normale
                block.classList.toggle('active');
            }
            updateConnections();
        });
    });
}

export function updateCategoryOpacity(projectCategories, hoveredProject = null) {
    const hoverCategories = ['design', 'visual', 'audio'];
    const horizontalLine = document.querySelector('.horizontal-line');
    
    document.querySelectorAll('.link-block').forEach(cat => {
        if (hoveredProject) {
            if (hoverCategories.includes(cat.dataset.category) && 
                !projectCategories.includes(cat.dataset.category)) {
                cat.style.opacity = '0.28';
            } else {
                cat.style.opacity = '1';
            }
        } else {
            cat.style.opacity = '1';
            horizontalLine.style.background = 'var(--main-color)';
        }
    });
    
    if (hoveredProject) {
        updateHorizontalLine(projectCategories);
    }
}

function updateHorizontalLine(projectCategories) {
    const horizontalLine = document.querySelector('.horizontal-line');
    const navRect = document.querySelector('.nav-links').getBoundingClientRect();
    
    const projectCategoriesElements = projectCategories
        .map(cat => document.querySelector(`.link-block[data-category="${cat}"]`))
        .filter(el => el !== null);
    
    const leftmostCategory = projectCategoriesElements
        .reduce((leftmost, current) => {
            const currentRect = current.getBoundingClientRect();
            const leftmostRect = leftmost.getBoundingClientRect();
            return currentRect.left < leftmostRect.left ? current : leftmost;
        });
    
    const leftmostRect = leftmostCategory.getBoundingClientRect();
    const relativePosition = leftmostRect.left - navRect.left;
    
    horizontalLine.style.background = `linear-gradient(to right, 
        rgba(255, 0, 0, 0.28) ${relativePosition}px, 
        var(--main-color) ${relativePosition}px)`;
} 