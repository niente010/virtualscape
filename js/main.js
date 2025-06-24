/* inizializza l'applicazione e gestisce gli event listener globali*/

import { updateConnections } from './connections.js';
import { initializeCategories } from './categories.js';
import { initializeProjects } from './projects.js';
import { ProjectTemplateManager } from './projectTemplates.js';
import { CompostView, resetCompostZIndex } from './compost.js'; 

export function resetLandingPage() {
    // Rimuovi la classe compost-page all'avvio/reset
    document.body.classList.remove('compost-page');

    // Inizializza i componenti
    const templateManager = new ProjectTemplateManager();
    resetCompostZIndex();
    const compostView = new CompostView('compost-container');
    compostView.hide(); // Assicura che sia sempre nascosta all'avvio/reset
    initializeCategories(compostView);
    initializeProjects(templateManager);

    // Reset stili compost container
    const compostContainer = document.getElementById('compost-container');
    compostContainer.style.pointerEvents = 'none';
    compostContainer.style.zIndex = '0';

    // Stato iniziale
    document.querySelectorAll('.project-link').forEach(project => {
        project.style.opacity = '0';
    });
    document.querySelectorAll('.link-block').forEach(cat => {
        cat.style.opacity = '1';
    });

    return { templateManager, compostView };
}

document.addEventListener('DOMContentLoaded', () => {
    console.group('Inizializzazione applicazione');
    resetLandingPage();
    console.groupEnd();
    // Event listeners globali
    window.addEventListener('resize', updateConnections);
    window.addEventListener('hashchange', () => {
        const compostBlock = document.querySelector('.link-block[data-category="compost"]');
        const compostView = new CompostView('compost-container');
        if (window.location.hash === '#compost') {
            if (compostBlock) compostBlock.classList.add('active');
            if (compostView) compostView.show();
        } else {
            if (compostBlock) compostBlock.classList.remove('active');
            if (compostView) compostView.hide();
        }
    });

    // Sincronizza la compost page con l'hash anche all'avvio
    // (dopo il reset della landing)
    if (window.location.hash === '#compost') {
        const compostBlock = document.querySelector('.link-block[data-category="compost"]');
        const compostView = new CompostView('compost-container');
        if (compostBlock) compostBlock.classList.add('active');
        if (compostView) compostView.show();
    }
});

console.log('Script caricato, in attesa di eventi...'); 
