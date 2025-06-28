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
