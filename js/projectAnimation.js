import { ProjectTemplateManager } from './projectTemplates.js';
import { updateConnections } from './connections.js';
import { initializeCategories } from './categories.js';
import { initializeProjects } from './projects.js';

let originalState = null;

// Costanti per l'animazione
const ANIMATION_CONSTANTS = {
    SCRAMBLE_DURATION: 1000,
    SCRAMBLE_FPS: 30,
    TARGET_TOP: 40,
    FADE_DURATION: 500,
    CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
};

// Funzioni di utilità
const createFixedElement = (className, styles) => {
    const element = document.createElement('div');
    element.className = className;
    Object.assign(element.style, {
        position: 'fixed',
        ...styles
    });
    return element;
};

const getRequiredElements = () => {
    const elements = {
        navContainer: document.querySelector('.nav-container'),
        horizontalLine: document.querySelector('.horizontal-line'),
        navLinks: document.querySelector('.nav-links')
    };

    if (!Object.values(elements).every(el => el)) {
        throw new Error('Required elements not found');
    }

    return elements;
};

const randomChar = () => ANIMATION_CONSTANTS.CHARS[Math.floor(Math.random() * ANIMATION_CONSTANTS.CHARS.length)];

// Funzione per l'effetto scramble/unscramble
const scrambleText = (element, finalText, isUnscramble = false) => {
    const finalUpperText = finalText.toUpperCase();
    const frames = ANIMATION_CONSTANTS.SCRAMBLE_DURATION / (1000 / ANIMATION_CONSTANTS.SCRAMBLE_FPS);
    let frame = 0;

    const currentFontSize = parseFloat(window.getComputedStyle(element).fontSize);
    const originalFontSize = isUnscramble ? 
        parseFloat(window.getComputedStyle(originalState.projectUnscrambled).fontSize) : 
        currentFontSize;

    return new Promise(resolve => {
        const interval = setInterval(() => {
            const progress = frame / frames;
            const targetSize = isUnscramble ? originalFontSize : originalFontSize * 2;
            const fontSize = isUnscramble ?
                currentFontSize - ((currentFontSize - targetSize) * progress) :
                originalFontSize + ((targetSize - originalFontSize) * progress);
            
            element.style.fontSize = `${fontSize}px`;
            element.textContent = frame >= frames ? finalUpperText : 
                Array(finalUpperText.length).fill().map(() => randomChar()).join('');

            if (frame++ >= frames) {
                clearInterval(interval);
                element.textContent = finalUpperText;
                element.style.fontSize = `${targetSize}px`;
                resolve();
            }
        }, 1000 / ANIMATION_CONSTANTS.SCRAMBLE_FPS);
    });
};

const createAnimationGroup = () => {
    return createFixedElement('project-animation-group', {
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        transition: 'transform 1s ease',
        pointerEvents: 'none',
        zIndex: '1000'
    });
};

const createNewHorizontalLine = (navLinks, horizontalLine) => {
    const navLinksRect = navLinks.getBoundingClientRect();
    const horizontalLineRect = horizontalLine.getBoundingClientRect();
    
    return createFixedElement('horizontal-line', {
        top: `${horizontalLineRect.top}px`,
        left: `${navLinksRect.left}px`,
        width: `${horizontalLineRect.width}px`,
        height: `${horizontalLineRect.height}px`,
        background: window.getComputedStyle(horizontalLine).background,
        zIndex: '998',
        pointerEvents: 'none'
    });
};

const handleConnectionLines = (link) => {
    const projectCategories = link.dataset.categories.split(' ');
    return projectCategories
        .map(category => {
            const existingLine = link.querySelector(`.connection-line.vertical[data-category="${category}"]`);
            if (!existingLine) return null;

            const categoryBlock = document.querySelector(`.link-block[data-category="${category}"]`);
            const categoryRect = categoryBlock.getBoundingClientRect();
            const currentRect = existingLine.getBoundingClientRect();

            existingLine.style.position = 'fixed';
            existingLine.style.left = `${currentRect.left}px`;
            existingLine.style.top = `${categoryRect.bottom}px`;
            existingLine.classList.add('animation-line');
            
            return existingLine;
        })
        .filter(Boolean);
};

export function initializeProjectAnimation(templateManager) {
    async function animateProjectToTop(link) {
        const previousContent = document.querySelector('.project-content');
        const previousActiveLink = document.querySelector('.project-link.active');
        
        if (previousContent && previousActiveLink && previousActiveLink !== link) {
            await animateProjectToBottom(previousContent, previousActiveLink);
        }

        originalState = {
            projectsList: document.querySelector('.projects-list').cloneNode(true),
            siteStructure: document.querySelector('.site-structure').className,
            navContainer: document.querySelector('.nav-container').cloneNode(true),
            projectUnscrambled: link.querySelector('.project-title'),
        };

        const { navContainer, horizontalLine, navLinks } = getRequiredElements();
        const projectTitle = link.querySelector('.project-title');
        
        await scrambleText(projectTitle, projectTitle.textContent);
        
        const projectGroup = createAnimationGroup();
        const newHorizontalLine = createNewHorizontalLine(navLinks, horizontalLine);
        const connectionLines = handleConnectionLines(link);

        projectGroup.appendChild(link);
        connectionLines.forEach(line => {
            if (line?.parentNode) {
                line.parentNode.removeChild(line);
                projectGroup.appendChild(line);
            }
        });
        
        projectGroup.appendChild(navContainer);
        projectGroup.appendChild(newHorizontalLine);
        document.body.appendChild(projectGroup);

        const linkRect = link.getBoundingClientRect();
        const distance = linkRect.top - ANIMATION_CONSTANTS.TARGET_TOP;
        
        projectGroup.offsetHeight; // Force reflow
        projectGroup.style.transform = `translateY(-${distance}px)`;
        
        projectGroup.addEventListener('transitionend', 
            () => templateManager.showProjectDescription(link), 
            { once: true }
        );
    }

    // Funzione per animare il progetto verso il basso (inversa)
    async function animateProjectToBottom(projectContent, link) {
        console.group('Debug animateProjectToBottom');
        
        if (!originalState) {
            console.error('Stato originale non trovato');
            return;
        }

        try {
            // 1. Recupera gli elementi necessari
            const projectGroup = document.querySelector('.project-animation-group');
            const projectTitle = link.querySelector('.project-title');
            
            if (!projectGroup || !projectTitle) {
                throw new Error('Elementi necessari non trovati per l\'animazione inversa');
            }

            // Salva le posizioni X delle linee verticali prima dell'animazione
            const verticalLines = projectGroup.querySelectorAll('.connection-line.vertical');
            const linePositions = Array.from(verticalLines).map(line => ({
                element: line,
                left: line.getBoundingClientRect().left
            }));

            // 2. Rimuovi il contenuto del progetto con fade out
            if (projectContent) {
                projectContent.style.opacity = '0';
                await new Promise(resolve => setTimeout(resolve, 500));
                projectContent.remove();
            }

            // 3. Effetto unscramble sul titolo
            await scrambleText(projectTitle, projectTitle.textContent, true);

            // 4. Anima il gruppo verso il basso
            const originalRect = originalState.projectUnscrambled.getBoundingClientRect();
            const currentRect = projectTitle.getBoundingClientRect();
            const distance = originalRect.top - currentRect.top;
            
            projectGroup.style.transition = 'transform 1s ease';
            projectGroup.style.transform = `translateY(${distance}px)`;

            // 5. Attendi la fine dell'animazione e ripristina lo stato originale
            await new Promise((resolve, reject) => {
                const onTransitionEnd = () => {
                    try {
                        // Clona gli elementi originali prima di manipolarli
                        const navContainerClone = originalState.navContainer.cloneNode(true);
                        const projectsListClone = originalState.projectsList.cloneNode(true);

                        // Rimuovi il nav container esistente prima di aggiungerne uno nuovo
                        const existingNavContainer = document.querySelector('.nav-container:not(.project-animation-group .nav-container)');
                        if (existingNavContainer) {
                            existingNavContainer.remove();
                        }

                        // Ripristina la navigazione
                        document.body.appendChild(navContainerClone);

                        // Ripristina la lista dei progetti
                        const currentList = document.querySelector('.projects-list');
                        if (currentList) {
                            currentList.parentNode.replaceChild(projectsListClone, currentList);
                        }

                        // Ripristina la classe della struttura del sito
                        const siteStructure = document.querySelector('.site-structure');
                        if (siteStructure) {
                            siteStructure.className = originalState.siteStructure;
                        }

                        // Rimuovi il gruppo di animazione
                        if (projectGroup.parentNode) {
                            projectGroup.remove();
                        }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };

                projectGroup.addEventListener('transitionend', onTransitionEnd, { once: true });
            });

        } catch (error) {
            console.error('Errore durante l\'animazione inversa:', error);
            // Fallback: ripristina lo stato senza animazione
            try {
                if (originalState.navContainer) {
                    // Rimuovi il nav container esistente prima di aggiungerne uno nuovo
                    const existingNavContainer = document.querySelector('.nav-container:not(.project-animation-group .nav-container)');
                    if (existingNavContainer) {
                        existingNavContainer.remove();
                    }
                    
                    const navContainerClone = originalState.navContainer.cloneNode(true);
                    document.body.appendChild(navContainerClone);
                }
                
                const currentList = document.querySelector('.projects-list');
                if (currentList && originalState.projectsList) {
                    const projectsListClone = originalState.projectsList.cloneNode(true);
                    currentList.parentNode.replaceChild(projectsListClone, currentList);
                }
                
                if (projectContent) {
                    projectContent.remove();
                }
                
                const projectGroup = document.querySelector('.project-animation-group');
                if (projectGroup && projectGroup.parentNode) {
                    projectGroup.remove();
                }
            } catch (fallbackError) {
                console.error('Errore durante il fallback:', fallbackError);
            }
        }

        console.groupEnd();
    }

    // Gestione della navigazione browser
    window.addEventListener('popstate', async (event) => {
        console.group('Debug popstate event');
        console.log("Stato ricevuto:", event.state);
        console.log("Active categories:", event.state?.activeCategories);

        try {
            // 1. Pulizia elementi esistenti
            const allProjectContents = document.querySelectorAll('.project-content');
            const allAnimationGroups = document.querySelectorAll('.project-animation-group');
            const activeLink = document.querySelector('.project-link.active');

            // 2. Gestisci l'animazione inversa se necessario
            if (activeLink) {
                const projectContent = document.querySelector('.project-content');
                if (projectContent) {
                    await animateProjectToBottom(projectContent, activeLink);
                }
                activeLink.classList.remove('active');
            } else {
                // Se non c'è un link attivo, rimuovi direttamente gli elementi
                allProjectContents.forEach(content => content.remove());
                allAnimationGroups.forEach(group => group.remove());
            }

            // 3. Ripristina lo stato dalla history
            if (event.state) {
                console.log("Ripristino categorie attive:", event.state.activeCategories);
                
                // Ripristina lo stato delle categorie
                const activeCategories = [];
                document.querySelectorAll('.link-block').forEach(cat => {
                    const category = cat.dataset.category;
                    cat.classList.remove('active');
                    console.log(`Checking category ${category}:`, event.state.activeCategories?.includes(category));
                    if (event.state.activeCategories?.includes(category)) {
                        console.log(`Activating category: ${category}`);
                        cat.classList.add('active');
                        activeCategories.push(category);
                    }
                });

                console.log("Categorie attivate:", activeCategories);

                // Ripristina lo stato dei progetti
                document.querySelectorAll('.project-link').forEach(project => {
                    project.removeAttribute('style');
                    project.classList.remove('active');
                    
                    if (activeCategories.length > 0) {
                        const projectCategories = project.dataset.categories.split(' ');
                        const hasActiveCategory = projectCategories.some(cat => activeCategories.includes(cat));
                        project.style.opacity = hasActiveCategory ? '1' : '0';
                        project.style.visibility = hasActiveCategory ? 'visible' : 'hidden';
                        project.style.pointerEvents = hasActiveCategory ? 'auto' : 'none';
                    } else {
                        project.style.opacity = '1';
                        project.style.visibility = 'visible';
                        project.style.pointerEvents = 'auto';
                    }
                });

                // Aggiorna le connessioni
                updateConnections();
            } else {
                // Reset completo se non c'è state history
                document.querySelectorAll('.project-link').forEach(project => {
                    project.removeAttribute('style');
                    project.classList.remove('active');
                });
                document.querySelectorAll('.link-block').forEach(cat => {
                    cat.classList.remove('active');
                });
                updateConnections();
            }

        } catch (error) {
            console.error('Errore durante il ripristino dello stato:', error);
        } finally {
            // Reinizializza gli event listener
            console.log("Reinizializzazione degli event listener");
            initializeCategories();
            initializeProjects(templateManager);
            
            // Reset dello stato originale solo dopo che tutte le animazioni sono complete
            setTimeout(() => {
                originalState = null;
            }, 100);
        }
        
        console.groupEnd();
    });

    return {
        animateProjectToTop,
        animateProjectToBottom,
        scrambleText
    };
}