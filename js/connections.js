export function updateConnections() {
    // 1. Controllo animazione in corso
    const animationInProgress = document.querySelector('.project-animation-group');
    if (animationInProgress) {
        return;
    }

    // 2. Pulizia linee esistenti
    const existingLines = document.querySelectorAll('.connection-line:not(.animation-line)');
    existingLines.forEach(line => line.remove());

    // 3. Selezione elementi
    const projects = document.querySelectorAll('.project-link');
    const categories = document.querySelectorAll('.link-block');
    
    // 4. Gestione opacità progetti
    handleProjectsOpacity(projects, categories);

    // 5. Disegno linee di connessione
    projects.forEach((project) => {
        // Solo per progetti non in animazione
        if (!project.closest('.project-animation-group')) {
            const projectCategories = project.dataset.categories.split(' ');
            const projectRect = project.getBoundingClientRect();
            const isProjectActive = project.classList.contains('active');
            
            // Per ogni categoria del progetto
            projectCategories.forEach(categoryName => {
                const categoryElement = Array.from(categories)
                    .find(cat => cat.dataset.category === categoryName);
                
                if (categoryElement) {
                    drawConnectionLines(project, categoryElement, projectRect, getBlockGap(), isProjectActive);
                }
            });
        }
    });
}

// Estrai la logica dell'opacità in una funzione separata
function handleProjectsOpacity(projects, categories) {
    projects.forEach(project => {
        project.style.opacity = '0';
    });
    
    const activeCategories = Array.from(categories).filter(cat => cat.classList.contains('active'));
    if (activeCategories.length > 0) {
        projects.forEach(project => {
            const projectCategories = project.dataset.categories.split(' ');
            if (projectCategories.some(cat => activeCategories.find(active => active.dataset.category === cat))) {
                project.style.opacity = '1';
            }
        });
    }
}

// Estrai il calcolo del blockGap in una funzione separata
function getBlockGap() {
    const style = getComputedStyle(document.documentElement);
    const blockGapValue = style.getPropertyValue('--block-gap').trim();
    let blockGap = 20;
    
    if (blockGapValue.includes('clamp')) {
        const matches = blockGapValue.match(/clamp\((.*?),(.*?),(.*?)\)/);
        if (matches) {
            const middleValue = matches[2].trim();
            if (middleValue.includes('vw')) {
                const vwValue = parseFloat(middleValue);
                blockGap = (window.innerWidth * vwValue) / 100;
            }
        }
    }
    return blockGap;
}

function drawConnectionLines(project, categoryElement, projectRect, blockGap, isProjectActive) {
    const rect = categoryElement.getBoundingClientRect();
    const textWidth = project.offsetWidth;
    
    // Crea linea orizzontale
    const horizontalLine = createHorizontalLine(project, textWidth, blockGap, categoryElement, isProjectActive);
    
    const categoryCenter = rect.left + (rect.width / 2);
    const categoryProjects = getCategoryProjects(project, categoryElement.dataset.category);
    const projectIndex = categoryProjects.indexOf(project);
    const totalProjects = categoryProjects.length;
    
    const { startX, endX } = calculateLinePositions(projectRect, textWidth, blockGap, categoryCenter, totalProjects, projectIndex);
    
    const horizontalWidth = Math.max(0, endX - startX);
    
    if (horizontalWidth > 0 && !isNaN(horizontalWidth)) {
        horizontalLine.style.width = `${horizontalWidth}px`;
        project.appendChild(horizontalLine);
        
        createVerticalLine(project, rect, projectRect, textWidth, blockGap, horizontalWidth, categoryElement, isProjectActive);
    }
}

function getLineOpacity(isProjectActive, categoryElement) {
    return isProjectActive ? '1' : (categoryElement.classList.contains('active') ? '1' : '0.28');
}

function createHorizontalLine(project, textWidth, blockGap, categoryElement, isProjectActive) {
    const projectTitle = project.querySelector('.project-title');
    const actualTextWidth = projectTitle.getBoundingClientRect().width;
    
    const horizontalLine = document.createElement('div');
    horizontalLine.classList.add('connection-line', 'horizontal');
    horizontalLine.style.opacity = getLineOpacity(isProjectActive, categoryElement);
    horizontalLine.style.left = `${actualTextWidth + blockGap}px`;
    
    return horizontalLine;
}

function createVerticalLine(project, rect, projectRect, textWidth, blockGap, horizontalWidth, categoryElement, isProjectActive) {
    const verticalLine = document.createElement('div');
    verticalLine.classList.add('connection-line', 'vertical');
    verticalLine.style.opacity = getLineOpacity(isProjectActive, categoryElement);
    
    const leftPosition = textWidth + blockGap + horizontalWidth;
    verticalLine.style.left = `${leftPosition}px`;
    verticalLine.style.top = '50%';
    
    const heightWithGap = Math.abs(rect.top - projectRect.top) - blockGap;
    verticalLine.style.height = `${heightWithGap}px`;
    
    if (rect.top < projectRect.top) {
        verticalLine.style.transform = 'scaleY(-1)';
    }
    
    project.appendChild(verticalLine);
}

function getCategoryProjects(project, category) {
    return Array.from(document.querySelectorAll('.project-link'))
        .filter(p => p.dataset.categories.split(' ').includes(category))
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

function calculateLinePositions(projectRect, textWidth, blockGap, categoryCenter, totalProjects, projectIndex) {
    const totalWidth = (totalProjects - 1) * (blockGap/2);
    const startOffset = -totalWidth / 2;
    const verticalLineOffset = startOffset + (projectIndex * (blockGap/2));
    
    const startX = projectRect.left + textWidth + blockGap;
    const endX = categoryCenter + verticalLineOffset;
    
    return { startX, endX };
} 