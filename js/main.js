// ==========================================
// PREMIUM WRITER'S PORTFOLIO - MAIN JAVASCRIPT
// Advanced animations and interactions
// ==========================================

console.log('[PREMIUM] Portfolio initialized');

// ==========================================
// DOM READY INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[PREMIUM] DOM Content Loaded - Initializing features');
    
    // Initialize all features
    initAOS();
    initGSAP();
    initNavigation();
    initMobileMenu();
    initScrollEffects();
    initBackToTop();
    initSmoothScrolling();
    initCardAnimations();
    updateContentCounts();
    
    console.log('[PREMIUM] All features initialized successfully');
});

// ==========================================
// AOS (ANIMATE ON SCROLL) INITIALIZATION
// ==========================================
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic',
            delay: 0
        });
        console.log('[PREMIUM] AOS animations initialized');
    } else {
        console.log('[PREMIUM] AOS library not loaded');
    }
}

// ==========================================
// GSAP ANIMATIONS
// ==========================================
function initGSAP() {
    if (typeof gsap !== 'undefined') {
        console.log('[PREMIUM] Initializing GSAP animations');
        
        // Register ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            console.log('[PREMIUM] ScrollTrigger registered');
        }
        
        // Hero title animation
        const titleLines = document.querySelectorAll('.hero-title .title-line');
        if (titleLines.length > 0) {
            gsap.from(titleLines, {
                duration: 1.2,
                y: 100,
                opacity: 0,
                stagger: 0.2,
                ease: 'power4.out',
                delay: 0.3
            });
        }
        
        // Hero subtitle animation
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            gsap.from(subtitle, {
                duration: 1,
                y: 30,
                opacity: 0,
                ease: 'power3.out',
                delay: 1
            });
        }
        
        // Hero CTA animation
        const ctaButtons = document.querySelectorAll('.hero-cta a');
        if (ctaButtons.length > 0) {
            gsap.from(ctaButtons, {
                duration: 0.8,
                y: 30,
                opacity: 0,
                stagger: 0.15,
                ease: 'back.out(1.7)',
                delay: 1.3
            });
        }
        
        // Parallax effect for animated shapes
        const shapes = document.querySelectorAll('.animated-shapes .shape');
        shapes.forEach((shape, index) => {
            gsap.to(shape, {
                y: -50 * (index + 1),
                scrollTrigger: {
                    trigger: '.premium-hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
        
        // Section reveal animations
        const sections = document.querySelectorAll('.about-section, .premium-categories');
        sections.forEach(section => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });
        
        console.log('[PREMIUM] GSAP animations configured');
    } else {
        console.log('[PREMIUM] GSAP library not loaded');
    }
}

// ==========================================
// NAVIGATION SCROLL EFFECTS
// ==========================================
function initNavigation() {
    const nav = document.querySelector('.premium-nav');
    if (!nav) return;
    
    let lastScroll = 0;
    const scrollThreshold = 100;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // Update active link based on section
        updateActiveNavLink();
        
        lastScroll = currentScroll;
    });
    
    console.log('[PREMIUM] Navigation scroll effects initialized');
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('main section[id], main[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ==========================================
// MOBILE MENU
// ==========================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!menuToggle || !navMenu) return;
    
    // Toggle menu
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        console.log('[PREMIUM] Mobile menu toggled');
    });
    
    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            console.log('[PREMIUM] Mobile menu closed via link click');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            if (navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    console.log('[PREMIUM] Mobile menu initialized');
}

// ==========================================
// SMOOTH SCROLLING
// ==========================================
function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') {
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.premium-nav')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                console.log('[PREMIUM] Smooth scroll to:', href);
            }
        });
    });
    
    console.log('[PREMIUM] Smooth scrolling initialized');
}

// ==========================================
// BACK TO TOP BUTTON
// ==========================================
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        console.log('[PREMIUM] Scrolled to top');
    });
    
    console.log('[PREMIUM] Back to top button initialized');
}

// ==========================================
// SCROLL EFFECTS
// ==========================================
// Animation configuration constants
const PARALLAX_SPEED = 0.5;
const PARALLAX_FADE = 0.8;
const CARD_PARALLAX_INTENSITY = 10;
const CARD_HOVER_SCALE = 1.1;
const CARD_HOVER_ROTATION = 5;

function initScrollEffects() {
    // Parallax effect for hero section
    const hero = document.querySelector('.premium-hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = hero.querySelector('.hero-content');
            if (heroContent && scrolled < hero.offsetHeight) {
                heroContent.style.transform = `translateY(${scrolled * PARALLAX_SPEED}px)`;
                heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight) * PARALLAX_FADE;
            }
        });
    }
    
    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animatedElements = document.querySelectorAll('.feature-item, .premium-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    console.log('[PREMIUM] Scroll effects initialized');
}

// ==========================================
// CARD ANIMATIONS
// ==========================================
function initCardAnimations() {
    const cards = document.querySelectorAll('.premium-card, .category-card');
    
    cards.forEach(card => {
        // Add hover sound effect (visual feedback)
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        
        // Mouse move parallax effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            const icon = card.querySelector('.card-icon');
            if (icon) {
                icon.style.transform = `translate(${deltaX * CARD_PARALLAX_INTENSITY}px, ${deltaY * CARD_PARALLAX_INTENSITY}px) scale(${CARD_HOVER_SCALE}) rotate(${CARD_HOVER_ROTATION}deg)`;
            }
        });
        
        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.card-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
    
    console.log('[PREMIUM] Card animations initialized');
}

// ==========================================
// DYNAMIC CONTENT LOADER (Legacy support)
// ==========================================
function loadDynamicContent(sectionId, contentData) {
    console.log('[PREMIUM] Loading dynamic content for:', sectionId);

    const container = document.getElementById(sectionId);
    if (!container) {
        console.error('[PREMIUM] Container not found:', sectionId);
        return;
    }

    try {
        container.innerHTML = contentData;
        console.log('[PREMIUM] Content loaded successfully for:', sectionId);

        // Re-initialize AOS for new content
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    } catch (error) {
        console.error('[PREMIUM] Failed to load content:', error);
        container.innerHTML = '<p style="color: red;">Error loading content. Please try again.</p>';
    }
}

// ==========================================
// LOADING ANIMATION
// ==========================================
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading-spinner"><p>Loading premium content...</p></div>';
        console.log('[PREMIUM] Showing loading state for:', elementId);
    }
}

// ==========================================
// ERROR HANDLER
// ==========================================
function handleLoadError(elementId, error) {
    console.error('[PREMIUM] Load failed for:', elementId, error);
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

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
window.addEventListener('load', () => {
    // Log page load performance
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('[PREMIUM] Page load time:', pageLoadTime + 'ms');
    }
    
    console.log('[PREMIUM] All resources loaded successfully');
});

// ==========================================
// LAZY LOADING IMAGES
// ==========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                    console.log('[PREMIUM] Image lazy loaded:', img.src);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}


console.log('[PREMIUM] Main script initialization complete');

// ==========================================
// NEW YEAR 2026 FEATURES (Temporary until Jan 3, 2026)
// ==========================================

// Check if New Year features should be active
function isNewYearActive() {
    const now = new Date();
    const endDate = new Date('2026-01-04T00:00:00Z'); // Jan 4, 2026 midnight UTC (day after Jan 3)
    return now < endDate;
}

// Initialize New Year features if within date range
function initNewYearFeatures() {
    if (!isNewYearActive()) {
        console.log('[NEW YEAR] Features disabled - past January 3, 2026');
        document.body.classList.add('new-year-expired');
        return;
    }
    
    console.log('[NEW YEAR] Initializing New Year 2026 features');
    
    const overlay = document.getElementById('newYearOverlay');
    const trigger = document.getElementById('newYearTrigger');
    const closeBtn = document.getElementById('newYearClose');
    const confettiContainer = document.getElementById('confettiContainer');
    
    if (!overlay || !trigger || !closeBtn || !confettiContainer) {
        console.error('[NEW YEAR] Required elements not found');
        return;
    }
    
    let animationShown = false;
    
    // Generate confetti
    function createConfetti() {
        confettiContainer.innerHTML = ''; // Clear existing confetti
        
        const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FF1493', '#9370DB'];
        const confettiCount = 100;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 2) + 's';
            confettiContainer.appendChild(confetti);
        }
    }
    
    // Show New Year animation
    function showNewYearAnimation() {
        createConfetti();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('[NEW YEAR] Animation displayed');
    }
    
    // Hide New Year animation
    function hideNewYearAnimation() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('[NEW YEAR] Animation hidden');
    }
    
    // Show animation on page load (only once per session)
    if (!sessionStorage.getItem('newYearShown')) {
        setTimeout(() => {
            showNewYearAnimation();
            sessionStorage.setItem('newYearShown', 'true');
            animationShown = true;
        }, 1000); // Delay 1 second after page load
    }
    
    // Trigger button click handler
    trigger.addEventListener('click', () => {
        showNewYearAnimation();
        console.log('[NEW YEAR] Animation triggered by button click');
    });
    
    // Close button handler
    closeBtn.addEventListener('click', () => {
        hideNewYearAnimation();
    });
    
    // Close on overlay click (outside content)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideNewYearAnimation();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            hideNewYearAnimation();
        }
    });
    
    console.log('[NEW YEAR] Features initialized successfully');
}

// Initialize New Year features when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewYearFeatures);
} else {
    initNewYearFeatures();
}

// ==========================================
// FEATURED ITEMS DISPLAY
// ==========================================

// Helper function to create URL-friendly slugs
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except -
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Function to load featured items from localStorage
function loadFeaturedItems() {
    try {
        const contentData = localStorage.getItem('admin_content_data');
        if (!contentData) {
            console.log('[PREMIUM] No content data found');
            return [];
        }
        
        const data = JSON.parse(contentData);
        const featured = [];
        
        // Add featured poetry items
        if (data.poetry && data.poetry.length > 0) {
            data.poetry.forEach(poem => {
                if (poem.featured) {
                    featured.push({
                        id: poem.id,
                        title: poem.title,
                        description: poem.description || poem.content.substring(0, 80) + '...',
                        type: 'poetry',
                        category: 'Poetry',
                        mediaUrl: poem.mediaUrl,
                        url: `poetry/${poem.slug || slugify(poem.title)}/index.html`,
                        featuredOrder: poem.featuredOrder !== undefined ? poem.featuredOrder : 999999
                    });
                }
            });
        }
        
        // Add featured photo items
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach(photo => {
                if (photo.featured) {
                    featured.push({
                        id: photo.id,
                        title: photo.title || 'Untitled Photo',
                        description: photo.caption || 'A beautiful photograph',
                        type: 'photography',
                        category: 'Photography',
                        mediaUrl: photo.url,
                        url: photo.url,
                        featuredOrder: photo.featuredOrder !== undefined ? photo.featuredOrder : 999999
                    });
                }
            });
        }
        
        // Sort by featuredOrder
        featured.sort((a, b) => a.featuredOrder - b.featuredOrder);
        
        return featured;
        
    } catch (error) {
        console.error('[PREMIUM] Error loading featured items:', error);
        return [];
    }
}

// Initialize featured items display on homepage
if (document.getElementById('featuredGrid')) {
    initFeaturedItems();
}

function initFeaturedItems() {
    console.log('[PREMIUM] Initializing Featured Items');
    
    const featuredGrid = document.getElementById('featuredGrid');
    
    if (!featuredGrid) {
        console.error('[PREMIUM] Featured grid not found');
        return;
    }
    
    const featuredItems = loadFeaturedItems();
    
    if (featuredItems.length === 0) {
        featuredGrid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <h3>No featured items yet</h3>
                <p>Featured items will appear here once added by the admin</p>
            </div>
        `;
        return;
    }
    
    // Icon SVGs for different types
    const iconSVGs = {
        poetry: '<path d="M12 2L2 7L12 12L22 7L12 2Z"></path><path d="M2 17L12 22L22 17"></path><path d="M2 12L12 17L22 12"></path>',
        photography: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>'
    };
    
    // Generate featured items
    featuredGrid.innerHTML = featuredItems.map(item => `
        <a href="${item.url}" class="featured-card" data-aos="fade-up">
            <div class="featured-card-image">
                ${item.mediaUrl && item.type === 'photography' ? 
                    `<img src="${item.mediaUrl}" alt="${item.title}" loading="lazy">` :
                    `<div class="featured-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${iconSVGs[item.type] || iconSVGs.poetry}
                        </svg>
                    </div>`
                }
            </div>
            <div class="featured-card-content">
                <span class="featured-card-badge">${item.category}</span>
                <h3 class="featured-card-title">${item.title}</h3>
                <p class="featured-card-description">${item.description}</p>
            </div>
        </a>
    `).join('');
    
    console.log('[PREMIUM] Featured Items initialized with', featuredItems.length, 'items');
}

// ==========================================
// UPDATE CONTENT COUNTS FROM LOCALSTORAGE
// ==========================================
function updateContentCounts() {
    try {
        // Get content data from localStorage
        const contentData = localStorage.getItem('admin_content_data');
        if (!contentData) {
            console.log('[PREMIUM] No content data found in localStorage');
            return;
        }
        
        const data = JSON.parse(contentData);
        
        // Update poetry count
        const poetryCountElement = document.querySelector('.poetry-card .stat-number');
        if (poetryCountElement && data.poetry) {
            poetryCountElement.textContent = data.poetry.length;
            console.log('[PREMIUM] Updated poetry count:', data.poetry.length);
        }
        
        console.log('[PREMIUM] Content counts updated successfully');
    } catch (error) {
        console.error('[PREMIUM] Error updating content counts:', error);
    }
}