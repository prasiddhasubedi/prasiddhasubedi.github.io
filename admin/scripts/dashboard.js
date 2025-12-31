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
    const addArticleBtn = document.getElementById('addArticleBtn');
    const addEbookBtn = document.getElementById('addEbookBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');

    if (addPoetryBtn) {
        addPoetryBtn.addEventListener('click', () => window.modalManager.show('poetry'));
    }

    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', () => window.modalManager.show('article'));
    }

    if (addEbookBtn) {
        addEbookBtn.addEventListener('click', () => window.modalManager.show('ebook'));
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
        case 'add-article':
            window.modalManager.show('article');
            break;
        case 'upload-photo':
            window.modalManager.show('photo');
            break;
        case 'add-ebook':
            window.modalManager.show('ebook');
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
    document.getElementById('articlesCount').textContent = stats.articles;
    document.getElementById('ebooksCount').textContent = stats.ebooks;
    document.getElementById('photosCount').textContent = stats.photos;
}

function loadSectionData(section) {
    switch(section) {
        case 'poetry':
            loadPoetryList();
            break;
        case 'articles':
            loadArticlesList();
            break;
        case 'ebooks':
            loadEbooksList();
            break;
        case 'photography':
            loadPhotoGallery();
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
            </div>
            <div class="content-item-actions">
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

function loadArticlesList() {
    const articles = window.contentManager.getArticles();
    const container = document.getElementById('articlesList');
    
    if (!container) return;
    
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <h3>No articles yet</h3>
                <p>Start writing and publishing your articles</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = articles.map(article => `
        <div class="content-item" data-id="${article.id}">
            <div class="content-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
            <div class="content-item-details">
                <div class="content-item-title">${escapeHTML(article.title)}</div>
                <div class="content-item-meta">Created: ${formatDate(article.dateCreated)}</div>
            </div>
            <div class="content-item-actions">
                <button class="btn-icon-small" onclick="editArticle('${article.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-icon-small delete" onclick="deleteArticle('${article.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function loadEbooksList() {
    const ebooks = window.contentManager.getEbooks();
    const container = document.getElementById('ebooksList');
    
    if (!container) return;
    
    if (ebooks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <h3>No eBooks yet</h3>
                <p>Add your eBooks to build your digital library</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ebooks.map(ebook => `
        <div class="content-item" data-id="${ebook.id}">
            <div class="content-item-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            </div>
            <div class="content-item-details">
                <div class="content-item-title">${escapeHTML(ebook.title)}</div>
                <div class="content-item-meta">Created: ${formatDate(ebook.dateCreated)}</div>
            </div>
            <div class="content-item-actions">
                <button class="btn-icon-small" onclick="editEbook('${ebook.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-icon-small delete" onclick="deleteEbook('${ebook.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

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
            <img src="${photo.url}" alt="${escapeHTML(photo.title || 'Photo')}" class="photo-item-image">
            <div class="photo-item-footer">
                <span class="photo-title">${escapeHTML(photo.title || 'Untitled')}</span>
                <button class="btn-icon-small delete" onclick="deletePhoto('${photo.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

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

window.editArticle = function(id) {
    const article = window.contentManager.getArticleById(id);
    if (article) {
        window.modalManager.show('article', article);
    }
};

window.deleteArticle = function(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        window.contentManager.deleteArticle(id);
        loadArticlesList();
        loadDashboardData();
        showToast('Article deleted successfully', 'success');
    }
};

window.editEbook = function(id) {
    const ebook = window.contentManager.getEbookById(id);
    if (ebook) {
        window.modalManager.show('ebook', ebook);
    }
};

window.deleteEbook = function(id) {
    if (confirm('Are you sure you want to delete this eBook?')) {
        window.contentManager.deleteEbook(id);
        loadEbooksList();
        loadDashboardData();
        showToast('eBook deleted successfully', 'success');
    }
};

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
