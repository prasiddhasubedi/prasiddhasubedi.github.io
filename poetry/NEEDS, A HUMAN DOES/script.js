// ================================================
// NEEDS, A HUMAN DOES - ENHANCED INTERACTIONS
// ================================================

console.log('[NEEDS POEM] Poem page initialized');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[NEEDS POEM] DOM Content Loaded');
  
  // Add subtle animation to verses on scroll
  initVerseAnimations();
  
  // Add reading progress indicator
  initReadingProgress();
  
  // Add keyboard navigation
  initKeyboardNavigation();
  
  // Add floating hearts animation
  initFloatingHearts();
});

// Verse Animations with gentle fade-in
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
  
  console.log('[NEEDS POEM] Verse animations initialized');
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
  
  console.log('[NEEDS POEM] Reading progress initialized');
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
  
  console.log('[NEEDS POEM] Keyboard navigation initialized');
}

// Floating Hearts Animation
function initFloatingHearts() {
  const container = document.querySelector('.container');
  if (!container) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
          const speed = 1 + (index * 0.3);
          heart.style.transform = `translateY(${scrolled * speed * 0.05}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
  
  console.log('[NEEDS POEM] Floating hearts animation initialized');
}

console.log('[NEEDS POEM] Script loaded successfully');
