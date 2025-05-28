/* inizializza l'applicazione e gestisce gli event listener globali*/

import { updateConnections } from './connections.js';
import { initializeCategories } from './categories.js';
import { initializeProjects } from './projects.js';
import { ProjectTemplateManager } from './projectTemplates.js';
import { CompostView } from './compost.js'; 

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

    // Gestione click su compost
    let compostActive = false;
    const compostContainer = document.getElementById('compost-container');
    const projectsList = document.querySelector('.projects-list');
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.dataset.category === 'compost') {
          if (!compostActive) {
            projectsList.style.opacity = '0';
            projectsList.style.pointerEvents = 'none';
            compostContainer.style.opacity = '1';
            compostContainer.style.pointerEvents = 'auto';
            window.location.hash = 'compost'; // Aggiungi #compost all'URL
            const compostView = new CompostView('compost-container');
            compostView.render();
            compostActive = true;
          } else {
            compostContainer.style.opacity = '0';
            compostContainer.style.pointerEvents = 'none';
            projectsList.style.opacity = '1';
            projectsList.style.pointerEvents = 'auto';
            history.replaceState(null, '', window.location.pathname + window.location.search);
            compostActive = false;
          }
        } else {
          compostContainer.style.opacity = '0';
          compostContainer.style.pointerEvents = 'none';
          projectsList.style.opacity = '1';
          projectsList.style.pointerEvents = 'auto';
          window.location.hash = '';
          compostActive = false;
        }
      });
    });

});

console.log('Script caricato, in attesa di eventi...'); 
