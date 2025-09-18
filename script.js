// Copy to clipboard with fallback for file:// protocol
console.log('Script loaded');
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        return fallbackCopyTextToClipboard(text).then(success => {
            if (!success) {
                prompt('Copy the email address:', text);
            }
            return success;
        });
    }
    return navigator.clipboard.writeText(text).catch(() => {
        return fallbackCopyTextToClipboard(text).then(success => {
            if (!success) {
                prompt('Copy the email address:', text);
            }
            return success;
        });
    });
}

document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
        const email = button.getAttribute('data-email');
        console.log('Copying email:', email);
        copyTextToClipboard(email).then(() => {
            console.log('Copy succeeded');
            const tooltip = document.createElement('div');
            tooltip.className = 'copy-tooltip';
            tooltip.textContent = 'Email copied!';
            document.body.appendChild(tooltip);
            setTimeout(() => {
                tooltip.classList.add('fade-out');
                setTimeout(() => tooltip.remove(), 300);
            }, 2000);
        }).catch(err => {
            console.error('Copy failed', err);
            alert('Failed to copy email. Please copy manually: ' + email);
        });
    });
});

// Add click event to creator-credit to copy email (if exists)
const creatorCredit = document.getElementById('creator-credit');
if (creatorCredit) {
    creatorCredit.addEventListener('click', () => {
        const email = 'Jamesbhart99@protonmail.com';
        copyTextToClipboard(email).then(() => {
            const tooltip = document.createElement('div');
            tooltip.className = 'copy-tooltip';
            tooltip.textContent = 'Email copied!';
            document.body.appendChild(tooltip);
            setTimeout(() => {
                tooltip.classList.add('fade-out');
                setTimeout(() => tooltip.remove(), 300);
            }, 2000);
        }).catch(() => {
            alert('Failed to copy email. Please copy manually: ' + email);
        });
    });
}

// Load projects and render portfolio
async function loadProjects() {
    console.log('Loading projects...');
    try {
        const res = await fetch('projects.json');
        console.log('Fetch response:', res);
        const projects = await res.json();
        console.log('Projects:', projects);
        const portfolioGrid = document.getElementById('portfolio-grid');
        const galleryNavbar = document.getElementById('gallery-navbar');

        console.log('Portfolio grid:', portfolioGrid);
        portfolioGrid.innerHTML = '';
        galleryNavbar.innerHTML = '';

        projects.forEach(project => {
            console.log('Creating item for project:', project);
            // Create portfolio item
            const item = document.createElement('div');
            item.className = 'portfolio-item';
            item.dataset.projectId = project.id;
            item.innerHTML = `
                <img src="${project.displayImage}" alt="${project.title}">
                <div class="portfolio-item-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                </div>
            `;
            item.addEventListener('click', () => {
                window.location.href = `project.html?id=${project.id}`;
            });
            portfolioGrid.appendChild(item);
        });
        console.log('Projects loaded successfully');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Open gallery for a project
async function openGallery(projectId) {
    const gallerySection = document.getElementById('gallery');
    const portfolioSection = document.getElementById('work');
    const galleryContent = document.getElementById('gallery-content');

    portfolioSection.style.display = 'none';
    gallerySection.style.display = 'block';
    galleryContent.innerHTML = '';

    try {
        const res = await fetch(`${projectId}.json`);
        const data = await res.json();
        data.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = projectId;
            img.className = 'gallery-image';
            galleryContent.appendChild(img);
        });
    } catch (error) {
        galleryContent.innerHTML = '<p>Failed to load gallery images.</p>';
    }
}

// Back to portfolio button (for index.html gallery)
const backToPortfolioBtn = document.getElementById('back-to-portfolio');
if (backToPortfolioBtn && document.getElementById('gallery')) {
    backToPortfolioBtn.addEventListener('click', () => {
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('work').style.display = 'block';
    });
}

// Initialize moved to DOMContentLoaded

// Utility to get URL query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Load projects and render gallery navbar (for project.html)
async function loadGalleryNavbar(currentProjectId) {
    const res = await fetch('projects.json');
    const projects = await res.json();
    const galleryNavbar = document.getElementById('gallery-navbar');
    galleryNavbar.innerHTML = '';

    projects.forEach(project => {
        const navIcon = document.createElement('img');
        navIcon.src = project.displayImage;
        navIcon.alt = project.title;
        navIcon.className = 'gallery-nav-icon';
        navIcon.title = project.title;
        navIcon.dataset.projectId = project.id;
        navIcon.addEventListener('click', () => {
            if (project.id !== currentProjectId) {
                window.location.href = `project.html?id=${project.id}`;
            }
        });
        galleryNavbar.appendChild(navIcon);
    });
}

// Load gallery images for current project
async function loadGallery(projectId) {
    const galleryContent = document.getElementById('gallery-content');
    galleryContent.innerHTML = '';

    try {
        const res = await fetch(`${projectId}.json`);
        const data = await res.json();
        window.currentImages = data.images;

        data.images.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = projectId;
            img.className = 'gallery-image';
            img.addEventListener('click', () => {
                openImageModal(index);
            });
            galleryContent.appendChild(img);
        });

        if (data.images.length === 0) {
            galleryContent.innerHTML = '<p>No gallery images available for this project.</p>';
        }
    } catch (error) {
        galleryContent.innerHTML = '<p>Failed to load gallery images.</p>';
    }
}

// Highlight active project icon in navbar
function highlightActiveProject(projectId) {
    const icons = document.querySelectorAll('.gallery-nav-icon');
    icons.forEach(icon => {
        if (icon.dataset.projectId === projectId) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
}

// Back to portfolio button (for project.html)
document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-to-portfolio');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Initialize for index.html
    if (document.getElementById('portfolio-grid')) {
        loadProjects();
    }

    // Main initialization for project.html
    const currentProjectId = getQueryParam('id');
    if (currentProjectId) {
        loadGalleryNavbar(currentProjectId);
        highlightActiveProject(currentProjectId);
        loadGallery(currentProjectId);
    }
});

// Modal for enlarged image with navigation
function openImageModal(index) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal-window';

    // Create image element
    const img = document.createElement('img');
    img.src = window.currentImages[index];
    modal.appendChild(img);

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'modal-controls';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'modal-button';
    prevBtn.textContent = 'Previous';
    prevBtn.addEventListener('click', () => {
        if (index > 0) {
            modal.remove();
            openImageModal(index - 1);
        }
    });
    if (index === 0) prevBtn.disabled = true;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-button';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'modal-button';
    nextBtn.textContent = 'Next';
    nextBtn.addEventListener('click', () => {
        if (index < window.currentImages.length - 1) {
            modal.remove();
            openImageModal(index + 1);
        }
    });
    if (index === window.currentImages.length - 1) nextBtn.disabled = true;

    controls.appendChild(prevBtn);
    controls.appendChild(closeBtn);
    controls.appendChild(nextBtn);
    modal.appendChild(controls);

    // Append modal to body
    document.body.appendChild(modal);
}
