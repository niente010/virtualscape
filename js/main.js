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
    // Funzione per ripristinare lo stato della landing page
    function restoreLandingPageState() {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.documentElement.style.position = 'fixed';
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
    // Funzione per abilitare scroll normale (per compost)
    function enableCompostScroll() {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.documentElement.style.position = '';
    }
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.dataset.category === 'compost') {
          if (!compostActive) {
            projectsList.style.display = 'none';
            compostContainer.style.display = 'block';
            const compostView = new CompostView('compost-container');
            compostView.render();
            compostActive = true;
            // Aggiorna hash URL
            window.location.hash = 'compost';
            // Abilita scroll normale
            enableCompostScroll();
          } else {
            compostContainer.style.display = 'none';
            projectsList.style.display = 'block';
            compostActive = false;
            // Rimuovi hash URL
            history.replaceState(null, '', window.location.pathname + window.location.search);
            // Ripristina stato landing page
            restoreLandingPageState();
          }
        } else {
          compostContainer.style.display = 'none';
          projectsList.style.display = 'block';
          compostActive = false;
          // Rimuovi hash URL
          history.replaceState(null, '', window.location.pathname + window.location.search);
          // Ripristina stato landing page
          restoreLandingPageState();
        }
      });
    });
    // All'avvio, se hash è #compost, mostra direttamente compost
    if (window.location.hash === '#compost') {
      projectsList.style.display = 'none';
      compostContainer.style.display = 'block';
      const compostView = new CompostView('compost-container');
      compostView.render();
      compostActive = true;
      enableCompostScroll();
    } else {
      restoreLandingPageState();
    }
});

console.log('Script caricato, in attesa di eventi...'); 
