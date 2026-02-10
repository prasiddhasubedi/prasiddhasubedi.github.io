// ==========================================
// DASHBOARD FUNCTIONALITY
// Manages the admin dashboard UI and interactions
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DASHBOARD] Initializing dashboard');

    // Check authentication
    if (!window.auth.isAuthenticated()) {
        console.log('[DASHBOARD] User not authenticated, redirecting...');
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeLogout();
    loadDashboardData();
    
    console.log('[DASHBOARD] Dashboard initialized successfully');
});

// ==========================================
// INITIALIZATION
// ==========================================

function initializeDashboard() {
    const currentUser = window.auth.getCurrentUser();
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser;
        document.getElementById('welcomeName').textContent = currentUser;
    }

    // Initialize GitHub status
    checkGitHubStatus();

    // Initialize settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = 'github-setup.html';
        });
    }

    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Initialize action buttons
    initializeActionButtons();
}

// Check GitHub connection status
async function checkGitHubStatus() {
    const statusEl = document.getElementById('githubStatus');
    const statusText = document.getElementById('githubStatusText');
    
    if (!statusEl) return;
    
    if (window.githubAPI && window.githubAPI.hasToken()) {
        try {
            const result = await window.githubAPI.testToken();
            if (result.valid) {
                statusEl.style.display = 'flex';
                statusText.textContent = `Connected (${result.user})`;
                statusEl.style.background = 'rgba(16, 185, 129, 0.1)';
                statusText.style.color = '#10b981';
                statusEl.onclick = () => {
                    window.location.href = 'github-setup.html';
                };
            } else {
                showDisconnectedStatus(statusEl, statusText);
            }
        } catch (error) {
            showDisconnectedStatus(statusEl, statusText);
        }
    } else {
        showDisconnectedStatus(statusEl, statusText);
    }
}

function showDisconnectedStatus(statusEl, statusText) {
    statusEl.style.display = 'flex';
    statusText.textContent = 'Not Connected';
    statusEl.style.background = 'rgba(239, 68, 68, 0.1)';
    statusText.style.color = '#ef4444';
    statusEl.style.cursor = 'pointer';
    statusEl.onclick = () => {
        window.location.href = 'github-setup.html';
    };
}

function initializeActionButtons() {
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });

    // Add buttons
    const addPoetryBtn = document.getElementById('addPoetryBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');

    if (addPoetryBtn) {
        addPoetryBtn.addEventListener('click', () => window.modalManager.show('poetry'));
    }

    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', () => window.modalManager.show('photo'));
    }
}

function handleQuickAction(action) {
    switch(action) {
        case 'add-poetry':
            window.modalManager.show('poetry');
            break;
        case 'upload-photo':
            window.modalManager.show('photo');
            break;
        case 'manage-featured':
            // Navigate to featured section
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.querySelector('[data-section="featured"]').classList.add('active');
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            document.getElementById('section-featured').classList.add('active');
            document.getElementById('pageTitle').textContent = 'Featured Items';
            loadFeaturedManagement();
            break;
    }
}

// ==========================================
// NAVIGATION
// ==========================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get section name
            const sectionName = this.getAttribute('data-section');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show target section
            const targetSection = document.getElementById(`section-${sectionName}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update page title
            const title = this.querySelector('span').textContent;
            pageTitle.textContent = title;
            
            // Load section data
            loadSectionData(sectionName);
            
            // Close mobile sidebar
            if (window.innerWidth <= 1024) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

// ==========================================
// LOGOUT
// ==========================================

function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                window.auth.logout();
                window.location.href = 'login.html';
            }
        });
    }
}

// ==========================================
// DATA LOADING
// ==========================================

function loadDashboardData() {
    const stats = window.contentManager.getStats();
    
    // Update stat cards
    document.getElementById('poetryCount').textContent = stats.poetry;
    document.getElementById('photosCount').textContent = stats.photos;
    document.getElementById('featuredCount').textContent = stats.featured;
    
    // Load Firebase insights
    loadFirebaseInsights();
    
    // Load recent notifications
    loadNotifications();
}

function loadSectionData(section) {
    switch(section) {
        case 'poetry':
            loadPoetryList();
            break;
        case 'photography':
            loadPhotoGallery();
            break;
        case 'featured':
            loadFeaturedManagement();
            break;
    }
}

function loadPoetryList() {
    const poetry = window.contentManager.getPoetry();
    const container = document.getElementById('poetryList');
    
    if (!container) return;
    
    if (poetry.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"></path>
                    <path d="M2 17L12 22L22 17"></path>
                    <path d="M2 12L12 17L22 12"></path>
                </svg>
                <h3>No poems yet</h3>
                <p>Start adding your poems to showcase your work</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = poetry.map(poem => `
        <div class="content-item" data-id="${poem.id}">
            <div class="content-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"></path>
                    <path d="M2 17L12 22L22 17"></path>
                    <path d="M2 12L12 17L22 12"></path>
                </svg>
            </div>
            <div class="content-item-details">
                <div class="content-item-title">${escapeHTML(poem.title)}</div>
                <div class="content-item-meta">Created: ${formatDate(poem.dateCreated)}</div>
                ${poem.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
            </div>
            <div class="content-item-actions">
                <button class="btn-icon-small" onclick="toggleFeatured('poetry', '${poem.id}')" title="Toggle Featured">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </button>
                <button class="btn-icon-small" onclick="editPoetry('${poem.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-icon-small delete" onclick="deletePoetry('${poem.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Removed loadArticlesList() - articles management has been removed

// Removed loadEbooksList() and related ebook functions - ebooks management has been removed

function loadPhotoGallery() {
    const photos = window.contentManager.getPhotos();
    const container = document.getElementById('photoGrid');
    
    if (!container) return;
    
    if (photos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <h3>No photos yet</h3>
                <p>Upload your photos to create your gallery</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = photos.map(photo => `
        <div class="photo-item" data-id="${photo.id}">
            ${photo.featured ? '<div class="photo-featured-badge">⭐ Featured</div>' : ''}
            <img src="${photo.url}" alt="${escapeHTML(photo.title || 'Photo')}" class="photo-item-image">
            <div class="photo-item-footer">
                <span class="photo-title">${escapeHTML(photo.title || 'Untitled')}</span>
                <div class="photo-actions">
                    <button class="btn-icon-small ${photo.featured ? 'featured' : ''}" onclick="toggleFeatured('photography', '${photo.id}')" title="${photo.featured ? 'Unfeature' : 'Feature'}">
                        <svg viewBox="0 0 24 24" fill="${photo.featured ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                    <button class="btn-icon-small delete" onclick="deletePhoto('${photo.id}')" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadFeaturedManagement() {
    const container = document.getElementById('featuredManagement');
    if (!container) return;
    
    const poetry = window.contentManager.getPoetry().filter(p => p.featured);
    const photos = window.contentManager.getPhotos().filter(p => p.featured);
    
    container.innerHTML = `
        <div class="featured-section">
            <h3>Featured Poetry (${poetry.length})</h3>
            <div class="featured-list">
                ${poetry.length === 0 ? '<p>No featured poems</p>' : poetry.map(poem => `
                    <div class="featured-item">
                        <span>${escapeHTML(poem.title)}</span>
                        <button class="btn-icon-small" onclick="toggleFeatured('poetry', '${poem.id}')" title="Unfeature">
                            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="featured-section">
            <h3>Featured Photos (${photos.length})</h3>
            <div class="featured-list">
                ${photos.length === 0 ? '<p>No featured photos</p>' : photos.map(photo => `
                    <div class="featured-item">
                        <span>${escapeHTML(photo.title || 'Untitled')}</span>
                        <button class="btn-icon-small" onclick="toggleFeatured('photography', '${photo.id}')" title="Unfeature">
                            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.toggleFeatured = function(type, id) {
    if (window.contentManager.toggleFeatured) {
        window.contentManager.toggleFeatured(type, id);
        showToast('Featured status updated', 'success');
        
        // Reload appropriate list based on type
        if (type === 'poetry') {
            loadPoetryList();
        } else if (type === 'photography') {
            loadPhotoGallery();
        }
        
        // Reload featured management if visible
        const featuredContainer = document.getElementById('featuredManagement');
        if (featuredContainer && featuredContainer.offsetParent !== null) {
            loadFeaturedManagement();
        }
        
        loadDashboardData();
    } else {
        showToast('Featured functionality not available', 'error');
    }
};

// ==========================================
// CRUD OPERATIONS (Placeholder functions - will be implemented in modals)
// ==========================================

window.editPoetry = function(id) {
    const poetry = window.contentManager.getPoetryById(id);
    if (poetry) {
        window.modalManager.show('poetry', poetry);
    }
};

window.deletePoetry = function(id) {
    if (confirm('Are you sure you want to delete this poem?')) {
        window.contentManager.deletePoetry(id);
        loadPoetryList();
        loadDashboardData();
        showToast('Poem deleted successfully', 'success');
    }
};

// Removed - articles management has been removed
// window.editArticle = function(id) {
//     const article = window.contentManager.getArticleById(id);
//     if (article) {
//         window.modalManager.show('article', article);
//     }
// };

// Removed - articles management has been removed
// window.deleteArticle = function(id) {
//     if (confirm('Are you sure you want to delete this article?')) {
//         window.contentManager.deleteArticle(id);
//         loadArticlesList();
//         loadDashboardData();
//         showToast('Article deleted successfully', 'success');
//     }
// };

// Removed - ebooks management has been removed
// window.editEbook = function(id) {
//     const ebook = window.contentManager.getEbookById(id);
//     if (ebook) {
//         window.modalManager.show('ebook', ebook);
//     }
// };

// Removed - ebooks management has been removed
// window.deleteEbook = function(id) {
//     if (confirm('Are you sure you want to delete this eBook?')) {
//         window.contentManager.deleteEbook(id);
//         loadEbooksList();
//         loadDashboardData();
//         showToast('eBook deleted successfully', 'success');
//     }
// };

window.deletePhoto = function(id) {
    if (confirm('Are you sure you want to delete this photo?')) {
        window.contentManager.deletePhoto(id);
        loadPhotoGallery();
        loadDashboardData();
        showToast('Photo deleted successfully', 'success');
    }
};

// ==========================================
// MODAL FUNCTIONS (Simplified implementation)
// ==========================================

// Modal implementation is handled by modalManager

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// FIREBASE INSIGHTS & NOTIFICATIONS
// ==========================================

/**
 * Load Firebase insights (views, likes, comments)
 */
async function loadFirebaseInsights() {
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('[DASHBOARD] Firebase not initialized, skipping insights');
            document.getElementById('totalViews').textContent = '-';
            document.getElementById('totalLikes').textContent = '-';
            return;
        }
        
        const db = firebase.firestore();
        
        // Get all engagement documents
        const snapshot = await db.collection('engagement').get();
        
        let totalViews = 0;
        let totalLikes = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            totalViews += data.views || 0;
            totalLikes += data.likes || 0;
        });
        
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
        
    } catch (error) {
        console.error('[DASHBOARD] Error loading insights:', error);
        document.getElementById('totalViews').textContent = '-';
        document.getElementById('totalLikes').textContent = '-';
    }
}

/**
 * Load recent notifications (likes and comments)
 */
async function loadNotifications() {
    const container = document.getElementById('notificationsList');
    
    if (!container) return;
    
    try {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.warn('[DASHBOARD] Firebase not initialized, skipping notifications');
            container.innerHTML = '<p class="empty-text">Firebase not configured</p>';
            return;
        }
        
        const db = firebase.firestore();
        const notifications = [];
        
        // Get recent comments from all pages
        const engagementSnapshot = await db.collection('engagement').get();
        
        for (const doc of engagementSnapshot.docs) {
            const pageId = doc.id;
            const pageData = doc.data();
            
            // Get comments subcollection
            const commentsSnapshot = await db.collection('engagement')
                .doc(pageId)
                .collection('comments')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            commentsSnapshot.forEach(commentDoc => {
                const comment = commentDoc.data();
                notifications.push({
                    type: 'comment',
                    pageId: pageId,
                    author: comment.name || 'Anonymous',
                    text: comment.text,
                    timestamp: comment.timestamp?.toDate() || new Date()
                });
            });
        }
        
        // Sort by timestamp
        notifications.sort((a, b) => b.timestamp - a.timestamp);
        
        // Keep only last 15 notifications
        const recentNotifications = notifications.slice(0, 15);
        
        if (recentNotifications.length === 0) {
            container.innerHTML = '<p class="empty-text">No recent activity</p>';
            return;
        }
        
        // Display notifications
        container.innerHTML = recentNotifications.map(notif => {
            const timeAgo = getTimeAgo(notif.timestamp);
            const pageTitle = formatPageTitle(notif.pageId);
            
            if (notif.type === 'comment') {
                return `
                    <div class="notification-item">
                        <div class="notification-icon comment">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div class="notification-content">
                            <div class="notification-text">
                                <strong>${escapeHTML(notif.author)}</strong> commented on <em>${pageTitle}</em>
                            </div>
                            <div class="notification-preview">"${escapeHTML(notif.text.substring(0, 80))}${notif.text.length > 80 ? '...' : ''}"</div>
                            <div class="notification-time">${timeAgo}</div>
                        </div>
                    </div>
                `;
            }
            
            return '';
        }).join('');
        
    } catch (error) {
        console.error('[DASHBOARD] Error loading notifications:', error);
        container.innerHTML = '<p class="empty-text">Error loading notifications</p>';
    }
}

/**
 * Format page ID to readable title
 */
function formatPageTitle(pageId) {
    // Remove 'poetry/' prefix and decode URI
    let title = pageId.replace(/^poetry\/|^articles\/|^ebooks\//i, '');
    title = decodeURIComponent(title);
    
    // Convert from slug format to title case
    title = title
        .split(/[-_\/]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    return title;
}

/**
 * Get relative time string
 */
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// ==========================================
// NEW EBOOK MODAL (with chapters)
// ==========================================

function showNewEbookModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="modal-title">Create New eBook</h2>
                <button class="modal-close" onclick="closeNewEbookModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="newEbookForm">
                    <div class="form-group">
                        <label>Topic/Title <span style="color: #ef4444;">*</span></label>
                        <input type="text" id="ebookTopic" required placeholder="Enter ebook title">
                    </div>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label>Author</label>
                            <input type="text" id="ebookAuthor" value="Prasiddha Subedi">
                        </div>
                        <div class="form-group">
                            <label>Genre</label>
                            <input type="text" id="ebookGenre" placeholder="e.g., Poetry, Fiction">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="ebookDescription" rows="4" placeholder="Describe your ebook..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Cover Image URL (Optional)</label>
                        <input type="url" id="ebookCoverImage" placeholder="https://...">
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 5px;">You can add chapters after creating the ebook</p>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeNewEbookModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="createNewEbook()">
                    Create eBook
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').appendChild(modal);
}

function createNewEbook() {
    const ebookData = {
        topic: document.getElementById('ebookTopic').value,
        author: document.getElementById('ebookAuthor').value,
        genre: document.getElementById('ebookGenre').value,
        description: document.getElementById('ebookDescription').value,
        coverImage: document.getElementById('ebookCoverImage').value
    };
    
    if (!ebookData.topic) {
        showToast('Please enter an ebook title', 'error');
        return;
    }
    
    const newEbook = ebookManager.createEbook(ebookData);
    closeNewEbookModal();
    showToast('eBook created successfully!', 'success');
    
    // Redirect to ebook details page to add chapters
    setTimeout(() => {
        window.location.href = `ebook-details.html?id=${newEbook.id}`;
    }, 1000);
}

function closeNewEbookModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = '';
}
