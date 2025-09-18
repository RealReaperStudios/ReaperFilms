// Copy to clipboard with fallback for file:// protocol
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

// Add click event to creator-credit to copy email
document.getElementById('creator-credit').addEventListener('click', () => {
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

// Load projects and render portfolio
async function loadProjects() {
    const res = await fetch('projects.json');
    const projects = await res.json();
    const portfolioGrid = document.getElementById('portfolio-grid');
    const galleryNavbar = document.getElementById('gallery-navbar');

    portfolioGrid.innerHTML = '';
    galleryNavbar.innerHTML = '';

    projects.forEach(project => {
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

// Back to portfolio button
document.getElementById('back-to-portfolio').addEventListener('click', () => {
    document.getElementById('gallery').style.display = 'none';
    document.getElementById('work').style.display = 'block';
});

// Initialize
loadProjects();
