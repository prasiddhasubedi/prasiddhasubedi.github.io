// ================================================
// THE SKY BENEATH MY FEET - ENHANCED INTERACTIONS
// ================================================

console.log('[SKY POEM] Poem page initialized');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[SKY POEM] DOM Content Loaded');
  
  // Add subtle animation to verses on scroll
  initVerseAnimations();
  
  // Add reading progress indicator
  initReadingProgress();
  
  // Add keyboard navigation
  initKeyboardNavigation();
  
  // Add inverted scroll effect
  initInvertedScroll();
});

// Verse Animations with rotation effect
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
          entry.target.style.transform = 'rotate(0deg)';
        }, index * 50);
      }
    });
  }, observerOptions);
  
  verses.forEach(verse => {
    verse.style.opacity = '0';
    verse.style.transform = 'rotate(-2deg)';
    verse.style.transition = 'all 0.6s ease-out';
    observer.observe(verse);
  });
  
  console.log('[SKY POEM] Verse animations initialized');
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
  
  console.log('[SKY POEM] Reading progress initialized');
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
  
  console.log('[SKY POEM] Keyboard navigation initialized');
}

// Inverted Scroll Effect
function initInvertedScroll() {
  const container = document.querySelector('.container');
  if (!container) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const rotation = Math.sin(scrolled / 500) * 1;
        container.style.transform = `scale(1) rotate(${0.5 + rotation}deg)`;
        ticking = false;
      });
      ticking = true;
    }
  });
  
  console.log('[SKY POEM] Inverted scroll effect initialized');
}

console.log('[SKY POEM] Script loaded successfully');
