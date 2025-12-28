// Main JavaScript file for Writer's Portfolio
console.log('[DEBUG] main.js loaded successfully');

// Initialize AOS (Animate On Scroll) when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] DOM Content Loaded');

    // Initialize AOS animations if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
        console.log('[DEBUG] AOS initialized');
    } else {
        console.log('[DEBUG] AOS library not loaded');
    }

    // Mobile menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            console.log('[DEBUG] Menu toggle clicked');
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a navigation link
        const navLinks = navMenu.querySelectorAll('li a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('[DEBUG] Nav link clicked, closing menu');
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        console.log('[DEBUG] Mobile menu toggle initialized');
    } else {
        console.log('[DEBUG] Menu toggle or nav menu not found');
    }

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    console.log('[DEBUG] Smooth scroll to:', href);
                }
            }
        });
    });

    console.log('[DEBUG] Smooth scrolling initialized');

    // Auto-collapse navigation menu after clicking on a menu item
    const navItems = document.querySelectorAll('.menu a');
    const menu = document.querySelector('.menu');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            menu.classList.remove('open');
            console.log('[DEBUG] Collapsed menu after click');
        });
    });
});

// Dynamic content loader for novels and articles
function loadDynamicContent(sectionId, contentData) {
    console.log('[DEBUG] Loading dynamic content for:', sectionId);

    const container = document.getElementById(sectionId);
    if (!container) {
        console.error('[ERROR] Container not found:', sectionId);
        return;
    }

    try {
        container.innerHTML = contentData;
        console.log('[DEBUG] Content loaded successfully for:', sectionId);

        // Re-initialize AOS for new content
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    } catch (error) {
        console.error('[ERROR] Failed to load content:', error);
        container.innerHTML = '<p style="color: red;">Error loading content. Please try again.</p>';
    }
}

// Add loading animation
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner"><p>Loading...</p></div>';
        console.log('[DEBUG] Showing loading state for:', elementId);
    }
}

// Error handler for failed loads
function handleLoadError(elementId, error) {
    console.error('[ERROR] Load failed for:', elementId, error);
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error-message">
                <p>⚠️ Failed to load content</p>
                <p style="font-size: 0.9em; color: #666;">${error.message || 'Unknown error'}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

console.log('[DEBUG] main.js initialization complete');