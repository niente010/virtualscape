/* Funzioni di utilità per evitare dipendenze circolari */

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
    initializeCategories();
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