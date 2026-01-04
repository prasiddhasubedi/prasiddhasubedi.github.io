// ==========================================
// FIREBASE ENGAGEMENT FEATURES
// Real-time views, likes, comments, and sharing
// ==========================================

// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================

// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase (using modular SDK v9+)
let app, analytics, db;

/**
 * Initialize Firebase services
 * Handles errors gracefully to ensure site remains functional
 */
async function initializeFirebase() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('[FIREBASE] Firebase SDK not loaded, engagement features disabled');
            return false;
        }

        // Initialize Firebase App
        app = firebase.initializeApp(firebaseConfig);
        console.log('[FIREBASE] App initialized');

        // Initialize Firestore
        db = firebase.firestore();
        console.log('[FIREBASE] Firestore initialized');

        // Initialize Analytics
        analytics = firebase.analytics();
        console.log('[FIREBASE] Analytics initialized');

        return true;
    } catch (error) {
        console.error('[FIREBASE] Initialization error:', error);
        return false;
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get current page slug from pathname
 * Used as document ID in Firestore
 */
function getPageSlug() {
    const path = window.location.pathname;
    // Remove leading/trailing slashes and use as slug
    return path.replace(/^\/|\/$/g, '') || 'home';
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent script injection
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .substring(0, 500); // Limit length
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('[FIREBASE] Date formatting error:', error);
        return 'Unknown date';
    }
}

/**
 * Show temporary notification to user
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `engagement-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================
// VIEW COUNTER
// ==========================================

/**
 * Track page views with atomic increment
 * Creates document if it doesn't exist
 */
async function trackPageView() {
    if (!db) return;
    
    try {
        const slug = getPageSlug();
        const pageRef = db.collection('pages').doc(slug);
        
        // Get the document
        const doc = await pageRef.get();
        
        if (!doc.exists) {
            // Create new document with initial values
            await pageRef.set({
                slug: slug,
                views: 1,
                likes: 0,
                comments: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastViewed: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('[FIREBASE] New page document created');
        } else {
            // Increment view count atomically
            await pageRef.update({
                views: firebase.firestore.FieldValue.increment(1),
                lastViewed: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Fetch updated count and display
        const updatedDoc = await pageRef.get();
        if (updatedDoc.exists) {
            const views = updatedDoc.data().views || 0;
            updateViewCount(views);
        }
        
        // Log analytics event
        if (analytics) {
            analytics.logEvent('page_view', {
                page_path: window.location.pathname,
                page_title: document.title
            });
        }
        
        console.log('[FIREBASE] Page view tracked');
    } catch (error) {
        console.error('[FIREBASE] Error tracking page view:', error);
    }
}

/**
 * Update view count in UI
 */
function updateViewCount(count) {
    const viewElement = document.getElementById('view-count');
    if (viewElement) {
        viewElement.textContent = count.toLocaleString();
    }
}

// ==========================================
// LIKE BUTTON
// ==========================================

/**
 * Handle like button click
 * Prevents multiple likes per browser using localStorage
 */
async function handleLike() {
    if (!db) {
        showNotification('Like feature temporarily unavailable', 'error');
        return;
    }
    
    const slug = getPageSlug();
    const likeKey = `liked_${slug}`;
    
    // Check if already liked
    if (localStorage.getItem(likeKey)) {
        showNotification('You already liked this page!', 'info');
        return;
    }
    
    try {
        const pageRef = db.collection('pages').doc(slug);
        
        // Increment like count atomically
        await pageRef.update({
            likes: firebase.firestore.FieldValue.increment(1)
        });
        
        // Mark as liked in localStorage
        localStorage.setItem(likeKey, 'true');
        
        // Update UI
        const likeBtn = document.getElementById('like-button');
        if (likeBtn) {
            likeBtn.classList.add('liked');
            likeBtn.disabled = true;
            likeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span id="like-count">...</span>
            `;
        }
        
        // Fetch updated count
        const doc = await pageRef.get();
        if (doc.exists) {
            const likes = doc.data().likes || 0;
            updateLikeCount(likes);
        }
        
        showNotification('Thank you for liking this page!', 'success');
        
        // Log analytics event
        if (analytics) {
            analytics.logEvent('like', {
                page_path: window.location.pathname
            });
        }
        
        console.log('[FIREBASE] Page liked');
    } catch (error) {
        console.error('[FIREBASE] Error liking page:', error);
        showNotification('Failed to like page', 'error');
    }
}

/**
 * Update like count in UI
 */
function updateLikeCount(count) {
    const likeElement = document.getElementById('like-count');
    if (likeElement) {
        likeElement.textContent = count.toLocaleString();
    }
}

/**
 * Initialize like button
 */
async function initializeLikeButton() {
    if (!db) return;
    
    try {
        const slug = getPageSlug();
        const likeKey = `liked_${slug}`;
        const pageRef = db.collection('pages').doc(slug);
        
        // Fetch current like count
        const doc = await pageRef.get();
        if (doc.exists) {
            const likes = doc.data().likes || 0;
            updateLikeCount(likes);
        }
        
        // Check if already liked
        const likeBtn = document.getElementById('like-button');
        if (localStorage.getItem(likeKey) && likeBtn) {
            likeBtn.classList.add('liked');
            likeBtn.disabled = true;
            likeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span id="like-count">${likes.toLocaleString()}</span>
            `;
        }
    } catch (error) {
        console.error('[FIREBASE] Error initializing like button:', error);
    }
}

// ==========================================
// COMMENT SYSTEM
// ==========================================

/**
 * Load and display comments
 */
async function loadComments() {
    if (!db) return;
    
    try {
        const slug = getPageSlug();
        const pageRef = db.collection('pages').doc(slug);
        const doc = await pageRef.get();
        
        if (!doc.exists) return;
        
        const comments = doc.data().comments || [];
        const commentsList = document.getElementById('comments-list');
        
        if (!commentsList) return;
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }
        
        // Sort comments by timestamp (oldest first)
        comments.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
            const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
            return timeA - timeB;
        });
        
        // Render comments
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${sanitizeInput(comment.name || 'Anonymous')}</span>
                    <span class="comment-date">${formatDate(comment.timestamp)}</span>
                </div>
                <div class="comment-text">${sanitizeInput(comment.text)}</div>
            </div>
        `).join('');
        
        // Update comment count
        const countElement = document.getElementById('comment-count');
        if (countElement) {
            countElement.textContent = comments.length;
        }
        
        console.log('[FIREBASE] Comments loaded:', comments.length);
    } catch (error) {
        console.error('[FIREBASE] Error loading comments:', error);
    }
}

/**
 * Add new comment
 */
async function addComment(name, text) {
    if (!db) {
        showNotification('Comments temporarily unavailable', 'error');
        return false;
    }
    
    // Validate inputs
    text = sanitizeInput(text);
    name = sanitizeInput(name) || 'Anonymous';
    
    if (!text || text.length < 3) {
        showNotification('Comment must be at least 3 characters', 'error');
        return false;
    }
    
    if (text.length > 500) {
        showNotification('Comment is too long (max 500 characters)', 'error');
        return false;
    }
    
    try {
        const slug = getPageSlug();
        const pageRef = db.collection('pages').doc(slug);
        
        const newComment = {
            name: name,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add comment to array
        await pageRef.update({
            comments: firebase.firestore.FieldValue.arrayUnion(newComment)
        });
        
        showNotification('Comment added successfully!', 'success');
        
        // Reload comments
        setTimeout(loadComments, 500);
        
        // Log analytics event
        if (analytics) {
            analytics.logEvent('comment', {
                page_path: window.location.pathname
            });
        }
        
        console.log('[FIREBASE] Comment added');
        return true;
    } catch (error) {
        console.error('[FIREBASE] Error adding comment:', error);
        showNotification('Failed to add comment', 'error');
        return false;
    }
}

/**
 * Initialize comment form
 */
function initializeCommentForm() {
    const form = document.getElementById('comment-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('comment-name');
        const textInput = document.getElementById('comment-text');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!textInput) return;
        
        const name = nameInput ? nameInput.value : '';
        const text = textInput.value;
        
        // Disable form during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
        
        const success = await addComment(name, text);
        
        if (success) {
            // Clear form
            if (nameInput) nameInput.value = '';
            textInput.value = '';
        }
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
    });
}

// ==========================================
// SOCIAL SHARING
// ==========================================

/**
 * Generate share URL for different platforms
 */
function getShareUrl(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    const urls = {
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        whatsapp: `https://api.whatsapp.com/send?text=${title}%20${url}`
    };
    
    return urls[platform] || '';
}

/**
 * Handle social share
 */
function handleShare(platform) {
    const shareUrl = getShareUrl(platform);
    
    if (!shareUrl) return;
    
    // Open share window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Log analytics event
    if (analytics) {
        analytics.logEvent('share', {
            method: platform,
            content_type: 'page',
            item_id: getPageSlug()
        });
    }
    
    showNotification(`Sharing via ${platform}`, 'info');
    console.log('[FIREBASE] Shared via', platform);
}

/**
 * Initialize share buttons
 */
function initializeShareButtons() {
    const shareButtons = document.querySelectorAll('[data-share]');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = button.getAttribute('data-share');
            handleShare(platform);
        });
    });
}

// ==========================================
// MAIN INITIALIZATION
// ==========================================

/**
 * Initialize all engagement features
 */
async function initializeEngagementFeatures() {
    console.log('[FIREBASE] Initializing engagement features...');
    
    const initialized = await initializeFirebase();
    
    if (!initialized) {
        console.warn('[FIREBASE] Engagement features disabled - Firebase not available');
        return;
    }
    
    // Track page view
    await trackPageView();
    
    // Initialize like button
    await initializeLikeButton();
    const likeBtn = document.getElementById('like-button');
    if (likeBtn) {
        likeBtn.addEventListener('click', handleLike);
    }
    
    // Initialize comments
    await loadComments();
    initializeCommentForm();
    
    // Initialize share buttons
    initializeShareButtons();
    
    console.log('[FIREBASE] All engagement features initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEngagementFeatures);
} else {
    initializeEngagementFeatures();
}
