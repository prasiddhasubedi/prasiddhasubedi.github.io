// ================================================
// SERENE BEAUTY - ENHANCED POEM INTERACTIONS
// ================================================

console.log('[SERENE BEAUTY] Poem page initialized');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[SERENE BEAUTY] DOM Content Loaded');
  
  // Add subtle animation to verses on scroll
  initVerseAnimations();
  
  // Add reading progress indicator
  initReadingProgress();
  
  // Add keyboard navigation
  initKeyboardNavigation();
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
          entry.target.style.transform = 'translateX(0)';
        }, index * 50);
      }
    });
  }, observerOptions);
  
  verses.forEach(verse => {
    verse.style.opacity = '0';
    verse.style.transform = 'translateX(-20px)';
    verse.style.transition = 'all 0.6s ease-out';
    observer.observe(verse);
  });
  
  console.log('[SERENE BEAUTY] Verse animations initialized');
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
  
  console.log('[SERENE BEAUTY] Reading progress initialized');
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
  
  console.log('[SERENE BEAUTY] Keyboard navigation initialized');
}

console.log('[SERENE BEAUTY] Script loaded successfully');
