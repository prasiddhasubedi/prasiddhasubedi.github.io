// ==========================================
// FIREBASE ENGAGEMENT FEATURES
// Real-time views, likes, comments, and sharing
// ==========================================

// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================

// Firebase configuration - Can be loaded from external firebase-config.js
// or replaced directly in this file with your actual Firebase config
// Check if firebaseConfig is already defined (from external file)
if (typeof window.firebaseConfig === 'undefined') {
    window.firebaseConfig = {
        apiKey: "AIzaSyBI9yc2IrLQ_S5KW_doGtXNWX1883un_lw",
  authDomain: "my-site-92874.firebaseapp.com",
  projectId: "my-site-92874",
  storageBucket: "my-site-92874.firebasestorage.app",
  messagingSenderId: "575232040342",
  appId: "1:575232040342:web:e4ce6274f43ba320a211b7",
  measurementId: "G-6CC0FXCQN1"
    };
}

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

        console.log('[FIREBASE] Starting initialization...');
        console.log('[FIREBASE] Config:', {
            projectId: window.firebaseConfig.projectId,
            authDomain: window.firebaseConfig.authDomain,
            hasApiKey: !!window.firebaseConfig.apiKey
        });

        // Initialize Firebase App
        app = firebase.initializeApp(window.firebaseConfig);
        console.log('[FIREBASE] ✓ App initialized successfully');

        // Initialize Firestore
        db = firebase.firestore();
        console.log('[FIREBASE] ✓ Firestore initialized successfully');
        console.log('[FIREBASE] Firestore instance:', db ? 'Created' : 'Failed');

        // Initialize Analytics
        analytics = firebase.analytics();
        console.log('[FIREBASE] ✓ Analytics initialized successfully');

        return true;
    } catch (error) {
        console.error('[FIREBASE] ✗ Initialization error:', error);
        console.error('[FIREBASE] Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        return false;
    }
}

// ==========================================
// CONSTANTS
// ==========================================

const SEPARATOR_LINE = '='.repeat(60);
const COMMENT_RELOAD_DELAY = 500; // ms - delay before reloading comments after submission

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
 * Extract numeric timestamp value from various timestamp formats
 * @param {*} timestamp - Can be a Firestore Timestamp object or numeric timestamp
 * @returns {number} Timestamp in milliseconds, or 0 if timestamp is null/undefined/invalid
 */
function getTimestampValue(timestamp) {
    if (!timestamp) return 0;
    if (timestamp.toMillis) {
        // Firestore Timestamp object
        return timestamp.toMillis();
    }
    // Numeric timestamp - validate it's a number
    const numericValue = typeof timestamp === 'number' ? timestamp : Number(timestamp);
    return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Format timestamp to readable date
 * Handles both Firestore Timestamp objects and numeric timestamps from Date.now()
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';
    
    try {
        let date;
        if (timestamp.toDate) {
            // Firestore Timestamp object
            date = timestamp.toDate();
        } else {
            // Numeric timestamp from Date.now() or other numeric format
            date = new Date(timestamp);
        }
        
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
    if (!db) {
        console.error('[FIREBASE] trackPageView called but db is not initialized');
        return;
    }
    
    try {
        const slug = getPageSlug();
        console.log('[FIREBASE] Tracking page view for slug:', slug);
        
        const pageRef = db.collection('pages').doc(slug);
        console.log('[FIREBASE] Page reference created:', pageRef.path);
        
        // Get the document
        console.log('[FIREBASE] Fetching document from Firestore...');
        const doc = await pageRef.get();
        console.log('[FIREBASE] Document exists:', doc.exists);
        
        if (!doc.exists) {
            console.log('[FIREBASE] Creating new page document...');
            const newDocData = {
                slug: slug,
                views: 1,
                likes: 0,
                comments: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastViewed: firebase.firestore.FieldValue.serverTimestamp()
            };
            console.log('[FIREBASE] New document data:', newDocData);
            
            await pageRef.set(newDocData);
            console.log('[FIREBASE] ✓ New page document created successfully');
        } else {
            console.log('[FIREBASE] Document exists, incrementing view count...');
            // Increment view count atomically
            await pageRef.update({
                views: firebase.firestore.FieldValue.increment(1),
                lastViewed: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('[FIREBASE] ✓ View count incremented successfully');
        }
        
        // Fetch updated count and display
        console.log('[FIREBASE] Fetching updated document...');
        const updatedDoc = await pageRef.get();
        if (updatedDoc.exists) {
            const views = updatedDoc.data().views || 0;
            console.log('[FIREBASE] Current view count:', views);
            updateViewCount(views);
        } else {
            console.warn('[FIREBASE] Document does not exist after creation/update');
        }
        
        // Log analytics event
        if (analytics) {
            analytics.logEvent('page_view', {
                page_path: window.location.pathname,
                page_title: document.title
            });
            console.log('[FIREBASE] ✓ Analytics event logged: page_view');
        }
        
        console.log('[FIREBASE] ✓ Page view tracking completed successfully');
    } catch (error) {
        console.error('[FIREBASE] ✗ Error tracking page view:', error);
        console.error('[FIREBASE] Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Provide user-friendly error messages for common issues
        if (error.code === 'permission-denied') {
            console.error('[FIREBASE] ❌ PERMISSION DENIED');
            console.error('[FIREBASE] This error means Firestore security rules are blocking the operation.');
            console.error('[FIREBASE] Solutions:');
            console.error('[FIREBASE] 1. Check your Firestore rules in Firebase Console');
            console.error('[FIREBASE] 2. For testing, use permissive rules (see TROUBLESHOOTING.md)');
            console.error('[FIREBASE] 3. Ensure rules allow: read (if true) and write with proper validation');
            console.error('[FIREBASE] 4. See FIREBASE_SETUP.md for recommended rules');
        } else if (error.code === 'unauthenticated') {
            console.error('[FIREBASE] ❌ AUTHENTICATION REQUIRED');
            console.error('[FIREBASE] This error means the operation requires authentication.');
            console.error('[FIREBASE] Note: This website does not use Firebase Auth - this should not happen.');
            console.error('[FIREBASE] Check your Firestore rules - they should allow unauthenticated access.');
        } else if (error.code === 'unavailable') {
            console.warn('[FIREBASE] ⚠️ SERVICE UNAVAILABLE');
            console.warn('[FIREBASE] Firebase service might be temporarily unavailable or network issue.');
            console.warn('[FIREBASE] The page will still work, but engagement features are disabled.');
        }
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
        console.error('[FIREBASE] handleLike called but db is not initialized');
        showNotification('Like feature temporarily unavailable', 'error');
        return;
    }
    
    const slug = getPageSlug();
    const likeKey = `liked_${slug}`;
    console.log('[FIREBASE] Like button clicked for slug:', slug);
    
    // Check if already liked
    if (localStorage.getItem(likeKey)) {
        console.log('[FIREBASE] User has already liked this page');
        showNotification('You already liked this page!', 'info');
        return;
    }
    
    try {
        const pageRef = db.collection('pages').doc(slug);
        console.log('[FIREBASE] Incrementing like count...');
        
        // Increment like count atomically
        await pageRef.update({
            likes: firebase.firestore.FieldValue.increment(1)
        });
        console.log('[FIREBASE] ✓ Like count incremented successfully');
        
        // Mark as liked in localStorage
        localStorage.setItem(likeKey, 'true');
        console.log('[FIREBASE] Marked as liked in localStorage');
        
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
        console.log('[FIREBASE] Fetching updated like count...');
        const doc = await pageRef.get();
        if (doc.exists) {
            const likes = doc.data().likes || 0;
            console.log('[FIREBASE] Current like count:', likes);
            updateLikeCount(likes);
        }
        
        showNotification('Thank you for liking this page!', 'success');
        
        // Log analytics event
        if (analytics) {
            analytics.logEvent('like', {
                page_path: window.location.pathname
            });
            console.log('[FIREBASE] ✓ Analytics event logged: like');
        }
        
        console.log('[FIREBASE] ✓ Like action completed successfully');
    } catch (error) {
        console.error('[FIREBASE] ✗ Error liking page:', error);
        console.error('[FIREBASE] Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        
        // Provide user-friendly error messages
        if (error.code === 'permission-denied') {
            console.error('[FIREBASE] ❌ PERMISSION DENIED - Cannot like page');
            console.error('[FIREBASE] Check Firestore rules allow updating "likes" field');
            showNotification('Unable to like page - please try again later', 'error');
        } else if (error.code === 'not-found') {
            console.error('[FIREBASE] ❌ PAGE DOCUMENT NOT FOUND');
            console.error('[FIREBASE] The page document must be created first (happens on page view)');
            showNotification('Unable to like page - please refresh and try again', 'error');
        } else {
            showNotification('Failed to like page', 'error');
        }
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
    if (!db) {
        console.error('[FIREBASE] loadComments called but db is not initialized');
        return;
    }
    
    try {
        const slug = getPageSlug();
        console.log('[FIREBASE] Loading comments for slug:', slug);
        
        const pageRef = db.collection('pages').doc(slug);
        const doc = await pageRef.get();
        
        if (!doc.exists) {
            console.log('[FIREBASE] Document does not exist yet, no comments to load');
            return;
        }
        
        const comments = doc.data().comments || [];
        console.log('[FIREBASE] Loaded', comments.length, 'comments');
        
        const commentsList = document.getElementById('comments-list');
        
        if (!commentsList) {
            console.warn('[FIREBASE] Comments list element not found');
            return;
        }
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }
        
        // Sort comments by timestamp (oldest first)
        // Handles both Firestore Timestamp objects and numeric timestamps
        comments.sort((a, b) => {
            const timeA = getTimestampValue(a.timestamp);
            const timeB = getTimestampValue(b.timestamp);
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
        
        console.log('[FIREBASE] ✓ Comments loaded and rendered successfully');
    } catch (error) {
        console.error('[FIREBASE] ✗ Error loading comments:', error);
        console.error('[FIREBASE] Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        
        // Provide user-friendly error messages
        if (error.code === 'permission-denied') {
            console.error('[FIREBASE] ❌ PERMISSION DENIED - Cannot load comments');
            console.error('[FIREBASE] Check Firestore rules allow read access to pages collection');
            const commentsList = document.getElementById('comments-list');
            if (commentsList) {
                commentsList.innerHTML = '<p class="engagement-error">Unable to load comments due to permission restrictions.</p>';
            }
        }
    }
}

/**
 * Add new comment
 */
async function addComment(name, text) {
    if (!db) {
        console.error('[FIREBASE] addComment called but db is not initialized');
        showNotification('Comments temporarily unavailable', 'error');
        return false;
    }
    
    // Validate inputs
    text = sanitizeInput(text);
    name = sanitizeInput(name) || 'Anonymous';
    
    console.log('[FIREBASE] Adding comment:', { name, textLength: text.length });
    
    if (!text || text.length < 3) {
        console.warn('[FIREBASE] Comment too short:', text.length, 'characters');
        showNotification('Comment must be at least 3 characters', 'error');
        return false;
    }
    
    if (text.length > 500) {
        console.warn('[FIREBASE] Comment too long:', text.length, 'characters');
        showNotification('Comment is too long (max 500 characters)', 'error');
        return false;
    }
    
    try {
        const slug = getPageSlug();
        const pageRef = db.collection('pages').doc(slug);
        
        const newComment = {
            name: name,
            text: text,
            timestamp: Date.now()
        };
        
        console.log('[FIREBASE] Saving comment to Firestore...');
        
        // Add comment to array
        await pageRef.update({
            comments: firebase.firestore.FieldValue.arrayUnion(newComment)
        });
        
        console.log('[FIREBASE] ✓ Comment saved successfully');
        showNotification('Comment added successfully!', 'success');
        
        // Reload comments
        setTimeout(() => {
            console.log('[FIREBASE] Reloading comments...');
            loadComments();
        }, COMMENT_RELOAD_DELAY);
        
        // Log analytics event
        if (analytics) {
            analytics.logEvent('comment', {
                page_path: window.location.pathname
            });
            console.log('[FIREBASE] ✓ Analytics event logged: comment');
        }
        
        console.log('[FIREBASE] ✓ Comment action completed successfully');
        return true;
    } catch (error) {
        console.error('[FIREBASE] ✗ Error adding comment:', error);
        console.error('[FIREBASE] Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        
        // Provide user-friendly error messages
        if (error.code === 'permission-denied') {
            console.error('[FIREBASE] ❌ PERMISSION DENIED - Cannot add comment');
            console.error('[FIREBASE] Check Firestore rules allow updating "comments" field');
            showNotification('Unable to post comment - please try again later', 'error');
        } else if (error.code === 'not-found') {
            console.error('[FIREBASE] ❌ PAGE DOCUMENT NOT FOUND');
            console.error('[FIREBASE] The page document must be created first (happens on page view)');
            console.error('[FIREBASE] Try refreshing the page and commenting again');
            showNotification('Unable to post comment - please refresh and try again', 'error');
        } else {
            showNotification('Failed to add comment', 'error');
        }
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
    console.log('[FIREBASE] Share button clicked for platform:', platform);
    
    const shareUrl = getShareUrl(platform);
    
    if (!shareUrl) {
        console.error('[FIREBASE] Invalid platform:', platform);
        return;
    }
    
    console.log('[FIREBASE] Share URL generated:', shareUrl);
    
    // Open share window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Log analytics event
    if (analytics) {
        analytics.logEvent('share', {
            method: platform,
            content_type: 'page',
            item_id: getPageSlug()
        });
        console.log('[FIREBASE] ✓ Analytics event logged: share -', platform);
    }
    
    showNotification(`Sharing via ${platform}`, 'info');
    console.log('[FIREBASE] ✓ Share action completed for', platform);
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
    console.log(SEPARATOR_LINE);
    console.log('[FIREBASE] Starting engagement features initialization...');
    console.log('[FIREBASE] Page URL:', window.location.href);
    console.log('[FIREBASE] Page slug:', getPageSlug());
    console.log(SEPARATOR_LINE);
    
    const initialized = await initializeFirebase();
    
    if (!initialized) {
        console.warn('[FIREBASE] Engagement features disabled - Firebase not available');
        console.warn('[FIREBASE] Check that:');
        console.warn('[FIREBASE] 1. Firebase SDK scripts are loaded');
        console.warn('[FIREBASE] 2. Firebase configuration is correct');
        console.warn('[FIREBASE] 3. Internet connection is available');
        return;
    }
    
    console.log('[FIREBASE] Firebase initialized successfully, setting up features...');
    
    // Track page view
    console.log('[FIREBASE] [1/5] Tracking page view...');
    await trackPageView();
    
    // Initialize like button
    console.log('[FIREBASE] [2/5] Initializing like button...');
    await initializeLikeButton();
    const likeBtn = document.getElementById('like-button');
    if (likeBtn) {
        likeBtn.addEventListener('click', handleLike);
        console.log('[FIREBASE] ✓ Like button event listener attached');
    } else {
        console.warn('[FIREBASE] Like button element not found');
    }
    
    // Initialize comments
    console.log('[FIREBASE] [3/5] Loading comments...');
    await loadComments();
    console.log('[FIREBASE] [4/5] Initializing comment form...');
    initializeCommentForm();
    
    // Initialize share buttons
    console.log('[FIREBASE] [5/5] Initializing share buttons...');
    initializeShareButtons();
    
    console.log(SEPARATOR_LINE);
    console.log('[FIREBASE] ✓✓✓ All engagement features initialized successfully ✓✓✓');
    console.log('[FIREBASE] Features active:');
    console.log('[FIREBASE] • Views counter');
    console.log('[FIREBASE] • Like button');
    console.log('[FIREBASE] • Comment system');
    console.log('[FIREBASE] • Social sharing');
    console.log('[FIREBASE] • Analytics tracking');
    console.log(SEPARATOR_LINE);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEngagementFeatures);
} else {
    initializeEngagementFeatures();
}
