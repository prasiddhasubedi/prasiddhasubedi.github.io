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
// RECENTLY POSTED CAROUSEL
// ==========================================

// Recent posts data - This should be updated when new content is added
const recentPosts = [
    {
        id: 1,
        title: "Beauty Crisis Report",
        description: "A poem exploring the essence and turmoil around beauty",
        type: "poetry",
        category: "Poetry",
        date: "2025-01-15",
        url: "poetry/Beauty%20Crisis%20Report/index.html"
    },
    {
        id: 2,
        title: "Echoes of Tomorrow",
        description: "A science fiction thriller about a scientist who discovers a way to receive messages from the future",
        type: "ebook",
        category: "Ebook",
        date: "2025-01-10",
        url: "ebooks/echoes-of-tomorrow.html"
    },
    {
        id: 3,
        title: "The Art of Storytelling",
        description: "How traditional narrative techniques adapt to modern platforms and audiences",
        type: "article",
        category: "Article",
        date: "2025-01-05",
        url: "articles/the-art-of-storytelling.html"
    }
];

// Initialize carousel on homepage only
if (document.getElementById('recentlyPostedCarousel')) {
    initRecentlyPostedCarousel();
}

function initRecentlyPostedCarousel() {
    console.log('[PREMIUM] Initializing Recently Posted Carousel');
    
    const carouselTrack = document.getElementById('recentlyPostedCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!carouselTrack) {
        console.error('[PREMIUM] Carousel track not found');
        return;
    }
    
    let currentIndex = 0;
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 seconds
    
    // Icon SVGs for different types
    const iconSVGs = {
        poetry: '<path d="M12 2L2 7L12 12L22 7L12 2Z"></path><path d="M2 17L12 22L22 17"></path><path d="M2 12L12 17L22 12"></path>',
        ebook: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
        article: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
        photography: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>'
    };
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Generate carousel items
    function generateCarouselItems() {
        carouselTrack.innerHTML = recentPosts.map(post => `
            <a href="${post.url}" class="carousel-item">
                <div class="carousel-item-image">
                    <svg class="carousel-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${iconSVGs[post.type] || iconSVGs.article}
                    </svg>
                </div>
                <div class="carousel-item-content">
                    <span class="carousel-item-badge">${post.category}</span>
                    <h3 class="carousel-item-title">${post.title}</h3>
                    <p class="carousel-item-description">${post.description}</p>
                    <div class="carousel-item-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${formatDate(post.date)}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }
    
    // Generate dots
    function generateDots() {
        const totalSlides = Math.ceil(recentPosts.length / getItemsPerSlide());
        dotsContainer.innerHTML = Array(totalSlides).fill(0).map((_, i) => 
            `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');
        
        // Add click handlers to dots
        document.querySelectorAll('.carousel-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                goToSlide(index);
            });
        });
    }
    
    // Get items per slide based on viewport
    function getItemsPerSlide() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }
    
    // Go to specific slide
    function goToSlide(index) {
        const itemsPerSlide = getItemsPerSlide();
        const totalSlides = Math.ceil(recentPosts.length / itemsPerSlide);
        
        currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
        
        const offset = -currentIndex * 100;
        carouselTrack.style.transform = `translateX(${offset}%)`;
        
        // Update dots
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
        
        console.log('[PREMIUM] Carousel moved to slide:', currentIndex);
    }
    
    // Next slide
    function nextSlide() {
        const itemsPerSlide = getItemsPerSlide();
        const totalSlides = Math.ceil(recentPosts.length / itemsPerSlide);
        
        if (currentIndex < totalSlides - 1) {
            goToSlide(currentIndex + 1);
        } else {
            goToSlide(0); // Loop back to start
        }
    }
    
    // Previous slide
    function prevSlide() {
        const itemsPerSlide = getItemsPerSlide();
        const totalSlides = Math.ceil(recentPosts.length / itemsPerSlide);
        
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        } else {
            goToSlide(totalSlides - 1); // Loop to end
        }
    }
    
    // Start auto-play
    function startAutoPlay() {
        stopAutoPlay(); // Clear any existing interval
        autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        console.log('[PREMIUM] Carousel auto-play started');
    }
    
    // Stop auto-play
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }
    
    // Initialize
    generateCarouselItems();
    generateDots();
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay(); // Stop auto-play on manual interaction
            setTimeout(startAutoPlay, 10000); // Resume after 10 seconds
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay(); // Stop auto-play on manual interaction
            setTimeout(startAutoPlay, 10000); // Resume after 10 seconds
        });
    }
    
    // Pause auto-play on hover
    carouselTrack.addEventListener('mouseenter', stopAutoPlay);
    carouselTrack.addEventListener('mouseleave', startAutoPlay);
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            generateDots();
            goToSlide(0); // Reset to first slide on resize
        }, 250);
    });
    
    // Start auto-play
    startAutoPlay();
    
    console.log('[PREMIUM] Recently Posted Carousel initialized successfully');
}