// gestisce i progetti e le loro animazioni

import { updateConnections } from './connections.js';
import { updateCategoryOpacity } from './categories.js';
import { initializeProjectAnimation } from './projectAnimation.js';
import { ProjectTemplateManager } from './projectTemplates.js';

export function initializeProjects(templateManager) {
    const projectLinks = document.querySelectorAll('.project-link');
    let activeProject = null;

    // Rimuovi eventuali event listener esistenti
    projectLinks.forEach(link => {
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
    });

    // Reinizializza i project links dopo il clone
    const refreshedProjectLinks = document.querySelectorAll('.project-link');

    // Event Listeners
    refreshedProjectLinks.forEach(link => {
        // Click handler
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Ottieni il titolo del progetto dal DOM
            const projectTitle = link.querySelector('.project-title').textContent;
            const projectSlug = projectTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            // Salva lo stato corrente prima dell'animazione
            console.group('Saving state before project open');
            const activeCategories = Array.from(document.querySelectorAll('.link-block.active')).map(cat => cat.dataset.category);
            console.log('Active categories being saved:', activeCategories);
            
            const currentState = {
                action: 'openProject',
                activeProjectId: projectTitle,
                activeCategories: activeCategories,
                projectsState: Array.from(refreshedProjectLinks).map(p => ({
                    id: p.querySelector('.project-title').textContent,
                    opacity: window.getComputedStyle(p).opacity,
                    visibility: window.getComputedStyle(p).visibility,
                    position: window.getComputedStyle(p).position,
                    top: window.getComputedStyle(p).top,
                    left: window.getComputedStyle(p).left,
                    pointerEvents: window.getComputedStyle(p).pointerEvents
                }))
            };
            
            console.log('Full state being saved:', currentState);
            console.groupEnd();
            
            // Aggiungi stato alla cronologia con il titolo del progetto
            window.history.pushState(currentState, '', `#${projectSlug}`);

            if (activeProject === link) return;
            
            handleProjectClick(link, refreshedProjectLinks, activeProject);
            activeProject = link;
        });
    });

    // Inizializza gli hover events
    initializeProjectHover(refreshedProjectLinks);
    
    return {
        refreshProjectEvents: () => {
            initializeProjectHover(document.querySelectorAll('.project-link'));
        }
    };
}

// --- INIZIO: Gestione apertura progetto da hash URL ---
function openProjectFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        const projectTitle = link.querySelector('.project-title').textContent;
        const projectSlug = projectTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (projectSlug === hash) {
            link.click();
        }
    });
}
window.addEventListener('DOMContentLoaded', openProjectFromHash);
window.addEventListener('hashchange', openProjectFromHash);

function initializeProjectHover(projectLinks) {
    projectLinks.forEach(project => {

        // Gestisce l'evento mouseenter (hover)
        project.addEventListener('mouseenter', () => {
            // Verifica se il progetto è visibile (opacity === '1')
            // Questo evita che l'hover funzioni su progetti nascosti
            if (project.style.opacity === '1') {
                handleProjectHover(project, projectLinks);
            }
        });
        // Gestisce l'evento mouseleave (fine hover)
        project.addEventListener('mouseleave', () => {
            handleProjectLeave();
        });
    });
}

const templateManager = new ProjectTemplateManager();

async function handleProjectClick(link, projectLinks, activeProject) {
    const linkBlocks = document.querySelector('.nav-links');
    const linkBlocksRect = linkBlocks.getBoundingClientRect();
    const projectTitle = link.querySelector('.project-title');
    const titleRect = projectTitle.getBoundingClientRect();
    
    // Inizializza le funzioni di animazione
    const { animateProjectToTop } = initializeProjectAnimation(templateManager);
    
    const targetY = linkBlocksRect.top - 60;
    const targetX = 60;
    const initialY = titleRect.top;
    const initialX = titleRect.left;
    
    // Ottieni le categorie del progetto cliccato
    const projectCategories = link.dataset.categories.split(' ');
    
    // Nascondi altri progetti
    projectLinks.forEach(p => {
        if (p !== link) {
            p.style.opacity = '0';
            p.style.visibility = 'hidden';
            p.style.pointerEvents = 'none';
        }
    });
    
    // Funzione per mantenere le opacità delle categorie
    const maintainCategoryOpacity = () => {
        // Lista delle categorie che possono avere opacità ridotta
        const affectedCategories = ['design', 'visual', 'audio'];
        
        document.querySelectorAll('.link-block').forEach(cat => {
            // Applica opacità ridotta solo alle categorie nella lista affectedCategories
            if (affectedCategories.includes(cat.dataset.category) && 
                !projectCategories.includes(cat.dataset.category)) {
                cat.style.opacity = '0.28';
            } else {
                cat.style.opacity = '1';
            }
        });

        // Aggiorna la linea orizzontale
        updateHorizontalLine(projectCategories);
    };
    
    // Funzione per aggiornare la linea orizzontale
    const updateHorizontalLine = (categories) => {
        // Rimuovi eventuali linee duplicate
        const existingLines = document.querySelectorAll('.horizontal-line:not(.animation-line)');
        existingLines.forEach((line, index) => {
            if (index > 0) line.remove(); // Mantiene solo la prima linea
        });

        const horizontalLine = document.querySelector('.horizontal-line');
        const navRect = document.querySelector('.nav-links').getBoundingClientRect();
        
        const projectCategoriesElements = categories
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
    };
    
    // Applica le opacità iniziali
    maintainCategoryOpacity();
    
    // Posiziona il progetto
    link.style.position = 'fixed';
    link.style.top = `${initialY}px`;
    link.style.left = `${initialX}px`;
    link.style.transform = 'none';
    
    link.offsetHeight; // Force reflow
    
    if (activeProject) {
        activeProject.classList.remove('active');
    }
    
    link.classList.add('active');
    
    // Animazioni
    const afterFixRect = link.getBoundingClientRect();
    const needsHorizontalMove = Math.abs(afterFixRect.left - targetX) > 1;
    
    if (needsHorizontalMove) {
        link.style.transition = 'left 1s ease';
        link.style.left = `${targetX}px`;
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    link.style.transition = 'top 1s ease';
    link.style.top = `${targetY}px`;
    
    // Aggiorna connessioni mantenendo le opacità
    const updateLines = () => {
        if (link.classList.contains('active') && !link.dataset.animating) {
            updateConnections();
            maintainCategoryOpacity(); // Riapplica le opacità dopo ogni aggiornamento
            requestAnimationFrame(updateLines);
        }
    };
    requestAnimationFrame(updateLines);

    // Aggiungiamo un log qui
    console.log('Prima animazione completata, inizializzazione animazione verso l\'alto');
    
    try {
        // Esegui l'animazione verso l'alto
        await animateProjectToTop(link);
        
        //await templateManager.showProjectDescription(link);
    } catch (error) {
        console.error('Errore durante l\'animazione:', error);
    }
}

function handleProjectHover(project, projectLinks) {
    // Ottiene le categorie del progetto su cui si sta facendo hover    
    const projectCategories = project.dataset.categories.split(' ');
   
    // Gestisce l'opacità degli altri progetti
    projectLinks.forEach(p => {
        // Se non è il progetto su cui si sta facendo hover e è visibile
        if (p !== project && p.style.opacity === '1') {
            // Riduce l'opacità del progetto
            p.style.opacity = '0.28';
            // Riduce l'opacità delle linee di connessione
            p.querySelectorAll('.connection-line').forEach(line => {
                line.style.opacity = '0.28';
            });
        }
    });
    
    // Aggiorna l'opacità delle categorie
    // Le categorie del progetto hovrato rimangono a opacità piena
    // mentre le altre vengono ridotte  
    updateCategoryOpacity(projectCategories, project);
    
    // Mantiene il progetto hovrato e le sue linee a opacità piena    
    project.style.opacity = '1';
    project.querySelectorAll('.connection-line').forEach(line => {
        line.style.opacity = '1';
    });
}

function handleProjectLeave() {
    // Quando il mouse lascia il progetto:
    // 1. Aggiorna tutte le connessioni (ripristina lo stato normale)
    updateConnections();
    // 2. Resetta l'opacità delle categorie (array vuoto = nessuna categoria evidenziata)
    updateCategoryOpacity([]);
}
