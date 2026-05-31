const PROJECTS_MANIFEST = 'data/projects.json';
const PROJECTS_BASE = 'data/projects/';

function formatDescription(description) {
    if (Array.isArray(description)) {
        return description.filter(Boolean).join('<br><br>');
    }
    return description || '';
}

function createProjectElement(project) {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'project-link';
    link.dataset.categories = project.categories.join(' ');
    link.dataset.image = project.image;
    if (project.slug) link.dataset.slug = project.slug;

    const title = document.createElement('span');
    title.className = 'project-title';
    title.textContent = project.title;
    link.appendChild(title);

    const wherewhen = document.createElement('div');
    wherewhen.className = 'project-wherewhen';
    wherewhen.style.display = 'none';
    wherewhen.textContent = project.whereWhen;
    link.appendChild(wherewhen);

    const keywords = document.createElement('div');
    keywords.className = 'project-keywords';
    keywords.style.display = 'none';
    keywords.textContent = project.keywords;
    link.appendChild(keywords);

    const descContainer = document.createElement('div');
    descContainer.className = 'project-description-container';

    const descFull = document.createElement('p');
    descFull.className = 'project-description-full';
    descFull.innerHTML = formatDescription(project.description);
    descContainer.appendChild(descFull);

    const archiveThumbs = document.createElement('div');
    archiveThumbs.className = 'project-archive-thumbs';
    archiveThumbs.style.display = 'none';

    (project.archive || []).forEach((item, index) => {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || `thumb ${index + 1}`;
        if (item.embed) img.dataset.embed = item.embed;
        if (item.filename) img.dataset.filename = item.filename;
        if (item.format) img.dataset.format = item.format;
        if (item.source) img.dataset.source = item.source;
        archiveThumbs.appendChild(img);
    });

    descContainer.appendChild(archiveThumbs);
    link.appendChild(descContainer);

    return link;
}

export async function loadProjects() {
    const container = document.querySelector('.projects-list');
    if (!container) {
        throw new Error('Missing .projects-list container');
    }

    const response = await fetch(PROJECTS_MANIFEST);
    if (!response.ok) {
        throw new Error(`Failed to load projects manifest: ${response.status}`);
    }

    const slugs = await response.json();
    const projects = await Promise.all(
        slugs.map(async (slug) => {
            const projectResponse = await fetch(`${PROJECTS_BASE}${slug}.json`);
            if (!projectResponse.ok) {
                throw new Error(`Failed to load project "${slug}": ${projectResponse.status}`);
            }
            return projectResponse.json();
        })
    );

    container.replaceChildren(...projects.map(createProjectElement));
    document.dispatchEvent(new CustomEvent('projectsLoaded'));
    return projects;
}
