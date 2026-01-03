// ================================================
// IF STARS HAD WINDOWS - ENHANCED INTERACTIONS
// ================================================

console.log('[STARS POEM] Poem page initialized');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[STARS POEM] DOM Content Loaded');
  
  // Add subtle animation to verses on scroll
  initVerseAnimations();
  
  // Add reading progress indicator
  initReadingProgress();
  
  // Add keyboard navigation
  initKeyboardNavigation();
  
  // Add parallax effect for windows
  initWindowParallax();
});

// Verse Animations with fade from left
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
  
  console.log('[STARS POEM] Verse animations initialized');
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
  
  console.log('[STARS POEM] Reading progress initialized');
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
  
  console.log('[STARS POEM] Keyboard navigation initialized');
}

// Window Parallax Effect
function initWindowParallax() {
  const windows = document.querySelectorAll('.window');
  if (windows.length === 0) return;
  
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    
    windows.forEach((window, index) => {
      const speed = (index + 1) * 10;
      const moveX = x * speed;
      const moveY = y * speed;
      
      window.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
  
  console.log('[STARS POEM] Window parallax initialized');
}

console.log('[STARS POEM] Script loaded successfully');
