// ==========================================
// INITIALIZE DEFAULT CONTENT
// Populates localStorage with default poems if empty
// ==========================================

(function() {
    'use strict';
    
    console.log('[INIT] Checking for default content initialization');
    
    // Wait for contentManager to be available
    function initWhenReady() {
        if (typeof window.contentManager !== 'undefined') {
            console.log('[INIT] ContentManager available, initializing defaults');
            window.contentManager.initializeDefaultPoems();
        } else {
            console.log('[INIT] Waiting for ContentManager...');
            setTimeout(initWhenReady, 100);
        }
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
})();
