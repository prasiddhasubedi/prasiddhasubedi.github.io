// ================================================
// IF I COULD TELL THE MOON - ENHANCED INTERACTIONS
// ================================================

console.log('[MOON POEM] Poem page initialized');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[MOON POEM] DOM Content Loaded');
  
  // Add subtle animation to verses on scroll
  initVerseAnimations();
  
  // Add reading progress indicator
  initReadingProgress();
  
  // Add keyboard navigation
  initKeyboardNavigation();
  
  // Add interactive moon effect
  initMoonInteraction();
});

// Verse Animations
function initVerseAnimations() {
  const verses = document.querySelectorAll('.verse');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 50);
      }
    });
  }, observerOptions);
  
  verses.forEach(verse => {
    verse.style.opacity = '0';
    verse.style.transform = 'translateY(20px)';
    verse.style.transition = 'all 0.6s ease-out';
    observer.observe(verse);
  });
  
  console.log('[MOON POEM] Verse animations initialized');
}

// Reading Progress
function initReadingProgress() {
  let ticking = false;
  
  function updateProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
      });
      ticking = true;
    }
  });
  
  console.log('[MOON POEM] Reading progress initialized');
}

// Keyboard Navigation
function initKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // ESC key to go back
    if (e.key === 'Escape') {
      const backLink = document.querySelector('.back-link');
      if (backLink) {
        window.location.href = backLink.href;
      }
    }
    
    // Space or Arrow Down to scroll down
    if (e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      window.scrollBy({
        top: 100,
        behavior: 'smooth'
      });
    }
    
    // Arrow Up to scroll up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      window.scrollBy({
        top: -100,
        behavior: 'smooth'
      });
    }
  });
  
  console.log('[MOON POEM] Keyboard navigation initialized');
}

// Moon Interaction
function initMoonInteraction() {
  const moon = document.querySelector('.moon');
  if (!moon) return;
  
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    const moveX = (x - 0.5) * 20;
    const moveY = (y - 0.5) * 20;
    
    moon.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
  
  console.log('[MOON POEM] Moon interaction initialized');
}

console.log('[MOON POEM] Script loaded successfully');
