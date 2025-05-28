/* gestisce le categorie e la loro interattività */

import { updateConnections } from './connections.js';

export function initializeCategories(compostView) {
    const categories = document.querySelectorAll('.link-block');
    categories.forEach(block => {
        block.addEventListener('click', (e) => {
            e.preventDefault();
            const isCompost = block.dataset.category === 'compost';
            if (isCompost) {
                // Disattiva tutte le altre categorie
                categories.forEach(cat => {
                    if (cat !== block) cat.classList.remove('active');
                });
                // Toggle compost
                const wasActive = block.classList.contains('active');
                if (wasActive) {
                    block.classList.remove('active');
                    if (compostView) compostView.hide();
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                } else {
                    block.classList.add('active');
                    if (compostView) compostView.show();
                    window.location.hash = 'compost';
                }
            } else {
                // Se compost è attivo, disattivalo
                const compostBlock = document.querySelector('.link-block[data-category="compost"]');
                if (compostBlock && compostBlock.classList.contains('active')) {
                    compostBlock.classList.remove('active');
                    if (compostView) compostView.hide();
                    history.replaceState(null, '', window.location.pathname + window.location.search);
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