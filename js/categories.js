/* gestisce le categorie e la loro interattività */

import { updateConnections } from './connections.js';

export function initializeCategories() {
    const categories = document.querySelectorAll('.link-block');
    
    categories.forEach(block => {
        block.addEventListener('click', (e) => {
            e.preventDefault();
            block.classList.toggle('active');
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