/* inizializza l'applicazione e gestisce gli event listener globali*/

import { updateConnections } from './connections.js';
import { initializeCategories } from './categories.js';
import { initializeProjects } from './projects.js';
import { ProjectTemplateManager } from './projectTemplates.js';
import { CompostView, resetCompostZIndex, handleCompostNavigation } from './compost.js'; 
import { resetLandingPage } from './reset.js';

document.addEventListener('DOMContentLoaded', () => {
    console.group('Inizializzazione applicazione');
    resetLandingPage();
    console.groupEnd();
    // Event listeners globali
    window.addEventListener('resize', updateConnections);
    window.addEventListener('hashchange', handleCompostNavigation);
});

console.log('Script caricato, in attesa di eventi...'); 
