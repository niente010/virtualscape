/* inizializza l'applicazione e gestisce gli event listener globali*/

import { updateConnections } from './connections.js';
import { initializeCategories } from './categories.js';
import { initializeProjects } from './projects.js';
import { ProjectTemplateManager } from './projectTemplates.js';

document.addEventListener('DOMContentLoaded', () => {
    console.group('Inizializzazione applicazione');
    
    // Inizializza i componenti
    const templateManager = new ProjectTemplateManager();
    console.log('Template Manager creato:', templateManager);
    
    initializeCategories();
    console.log('Categorie inizializzate');
    
    initializeProjects(templateManager);
    console.log('Progetti inizializzati');
    
    console.groupEnd();
    
    // Event listeners globali
    window.addEventListener('resize', updateConnections);
    
    // Stato iniziale
    document.querySelectorAll('.project-link').forEach(project => {
        project.style.opacity = '0';
    });
    document.querySelectorAll('.link-block').forEach(cat => {
        cat.style.opacity = '1';
    });
});

console.log('Script caricato, in attesa di eventi...'); 
