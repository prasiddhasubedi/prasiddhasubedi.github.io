// ==========================================
// CONTENT MANAGER
// Handles CRUD operations for all content types
// ==========================================

class ContentManager {
    constructor() {
        this.storageKey = 'admin_content_data';
        this.data = this.loadData();
    }

    // Load data from localStorage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('[ContentManager] Error loading data:', error);
        }
        
        // Return default empty structure
        return {
            poetry: [],
            articles: [],
            ebooks: [],
            photos: []
        };
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('[ContentManager] Error saving data:', error);
            return false;
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Sanitize object fields
    sanitizeObject(obj, allowedFields) {
        const sanitized = {};
        allowedFields.forEach(field => {
            if (obj.hasOwnProperty(field)) {
                sanitized[field] = this.sanitizeHTML(obj[field]);
            }
        });
        return sanitized;
    }

    // ==========================================
    // POETRY METHODS
    // ==========================================

    getPoetry() {
        return this.data.poetry || [];
    }

    addPoetry(poetry) {
        const sanitized = this.sanitizeObject(poetry, ['title', 'content', 'author', 'tags', 'description', 'postedDate']);
        const newPoetry = {
            id: this.generateId(),
            ...sanitized,
            mediaUrl: poetry.mediaUrl || '', // Media URL is not sanitized as it's expected to be base64 or valid URL
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            postedDate: poetry.postedDate || new Date().toISOString()
        };
        
        this.data.poetry.unshift(newPoetry);
        this.saveData();
        return newPoetry;
    }

    updatePoetry(id, updates) {
        const index = this.data.poetry.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        const sanitized = this.sanitizeObject(updates, ['title', 'content', 'author', 'tags', 'description', 'postedDate']);
        this.data.poetry[index] = {
            ...this.data.poetry[index],
            ...sanitized,
            dateModified: new Date().toISOString()
        };
        
        if (updates.mediaUrl !== undefined) {
            this.data.poetry[index].mediaUrl = updates.mediaUrl;
        }
        if (updates.postedDate) {
            this.data.poetry[index].postedDate = updates.postedDate;
        }
        
        this.saveData();
        return this.data.poetry[index];
    }

    deletePoetry(id) {
        const index = this.data.poetry.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        this.data.poetry.splice(index, 1);
        this.saveData();
        return true;
    }

    getPoetryById(id) {
        return this.data.poetry.find(p => p.id === id) || null;
    }

    // ==========================================
    // ARTICLES METHODS
    // ==========================================

    getArticles() {
        return this.data.articles || [];
    }

    addArticle(article) {
        const sanitized = this.sanitizeObject(article, ['title', 'content', 'author', 'excerpt', 'tags', 'postedDate']);
        const newArticle = {
            id: this.generateId(),
            ...sanitized,
            mediaUrl: article.mediaUrl || '', // Media URL is not sanitized as it's expected to be base64 or valid URL
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            postedDate: article.postedDate || new Date().toISOString()
        };
        
        this.data.articles.unshift(newArticle);
        this.saveData();
        return newArticle;
    }

    updateArticle(id, updates) {
        const index = this.data.articles.findIndex(a => a.id === id);
        if (index === -1) return null;
        
        const sanitized = this.sanitizeObject(updates, ['title', 'content', 'author', 'excerpt', 'tags', 'postedDate']);
        this.data.articles[index] = {
            ...this.data.articles[index],
            ...sanitized,
            dateModified: new Date().toISOString()
        };
        
        if (updates.mediaUrl !== undefined) {
            this.data.articles[index].mediaUrl = updates.mediaUrl;
        }
        if (updates.postedDate) {
            this.data.articles[index].postedDate = updates.postedDate;
        }
        
        this.saveData();
        return this.data.articles[index];
    }

    deleteArticle(id) {
        const index = this.data.articles.findIndex(a => a.id === id);
        if (index === -1) return false;
        
        this.data.articles.splice(index, 1);
        this.saveData();
        return true;
    }

    getArticleById(id) {
        return this.data.articles.find(a => a.id === id) || null;
    }

    // ==========================================
    // EBOOKS METHODS
    // ==========================================

    getEbooks() {
        return this.data.ebooks || [];
    }

    addEbook(ebook) {
        const sanitized = this.sanitizeObject(ebook, ['title', 'description', 'author', 'genre', 'tags', 'postedDate']);
        const newEbook = {
            id: this.generateId(),
            ...sanitized,
            coverImageUrl: ebook.coverImageUrl || '', // Cover image URL is not sanitized
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            postedDate: ebook.postedDate || new Date().toISOString()
        };
        
        this.data.ebooks.unshift(newEbook);
        this.saveData();
        return newEbook;
    }

    updateEbook(id, updates) {
        const index = this.data.ebooks.findIndex(e => e.id === id);
        if (index === -1) return null;
        
        const sanitized = this.sanitizeObject(updates, ['title', 'description', 'author', 'genre', 'tags', 'postedDate']);
        this.data.ebooks[index] = {
            ...this.data.ebooks[index],
            ...sanitized,
            dateModified: new Date().toISOString()
        };
        
        if (updates.coverImageUrl !== undefined) {
            this.data.ebooks[index].coverImageUrl = updates.coverImageUrl;
        }
        if (updates.postedDate) {
            this.data.ebooks[index].postedDate = updates.postedDate;
        }
        
        this.saveData();
        return this.data.ebooks[index];
    }

    deleteEbook(id) {
        const index = this.data.ebooks.findIndex(e => e.id === id);
        if (index === -1) return false;
        
        this.data.ebooks.splice(index, 1);
        this.saveData();
        return true;
    }

    getEbookById(id) {
        return this.data.ebooks.find(e => e.id === id) || null;
    }

    // ==========================================
    // PHOTOS METHODS
    // ==========================================

    getPhotos() {
        return this.data.photos || [];
    }

    addPhoto(photo) {
        const sanitized = this.sanitizeObject(photo, ['title', 'caption', 'tags']);
        const newPhoto = {
            id: this.generateId(),
            ...sanitized,
            url: photo.url || '', // URL is not sanitized as it's expected to be base64 or valid URL
            dateCreated: new Date().toISOString()
        };
        
        this.data.photos.unshift(newPhoto);
        this.saveData();
        return newPhoto;
    }

    updatePhoto(id, updates) {
        const index = this.data.photos.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        const sanitized = this.sanitizeObject(updates, ['title', 'caption', 'tags']);
        this.data.photos[index] = {
            ...this.data.photos[index],
            ...sanitized
        };
        
        if (updates.url) {
            this.data.photos[index].url = updates.url;
        }
        
        this.saveData();
        return this.data.photos[index];
    }

    deletePhoto(id) {
        const index = this.data.photos.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        this.data.photos.splice(index, 1);
        this.saveData();
        return true;
    }

    getPhotoById(id) {
        return this.data.photos.find(p => p.id === id) || null;
    }

    // ==========================================
    // STATISTICS
    // ==========================================

    getStats() {
        return {
            poetry: this.data.poetry.length,
            articles: this.data.articles.length,
            ebooks: this.data.ebooks.length,
            photos: this.data.photos.length,
            total: this.data.poetry.length + this.data.articles.length + 
                   this.data.ebooks.length + this.data.photos.length
        };
    }

    // ==========================================
    // SEARCH
    // ==========================================

    search(query, type = 'all') {
        const lowercaseQuery = query.toLowerCase();
        const results = {
            poetry: [],
            articles: [],
            ebooks: [],
            photos: []
        };

        if (type === 'all' || type === 'poetry') {
            results.poetry = this.data.poetry.filter(item =>
                item.title.toLowerCase().includes(lowercaseQuery) ||
                item.content.toLowerCase().includes(lowercaseQuery) ||
                (item.tags && item.tags.toLowerCase().includes(lowercaseQuery))
            );
        }

        if (type === 'all' || type === 'articles') {
            results.articles = this.data.articles.filter(item =>
                item.title.toLowerCase().includes(lowercaseQuery) ||
                item.content.toLowerCase().includes(lowercaseQuery) ||
                (item.excerpt && item.excerpt.toLowerCase().includes(lowercaseQuery)) ||
                (item.tags && item.tags.toLowerCase().includes(lowercaseQuery))
            );
        }

        if (type === 'all' || type === 'ebooks') {
            results.ebooks = this.data.ebooks.filter(item =>
                item.title.toLowerCase().includes(lowercaseQuery) ||
                (item.description && item.description.toLowerCase().includes(lowercaseQuery)) ||
                (item.tags && item.tags.toLowerCase().includes(lowercaseQuery))
            );
        }

        if (type === 'all' || type === 'photos') {
            results.photos = this.data.photos.filter(item =>
                (item.title && item.title.toLowerCase().includes(lowercaseQuery)) ||
                (item.caption && item.caption.toLowerCase().includes(lowercaseQuery)) ||
                (item.tags && item.tags.toLowerCase().includes(lowercaseQuery))
            );
        }

        return results;
    }

    // ==========================================
    // EXPORT & IMPORT
    // ==========================================

    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            
            // Validate structure
            if (!imported.poetry || !imported.articles || !imported.ebooks || !imported.photos) {
                throw new Error('Invalid data structure');
            }
            
            this.data = imported;
            this.saveData();
            return true;
        } catch (error) {
            console.error('[ContentManager] Error importing data:', error);
            return false;
        }
    }

    // ==========================================
    // CLEAR DATA (with confirmation)
    // ==========================================

    clearAllData() {
        this.data = {
            poetry: [],
            articles: [],
            ebooks: [],
            photos: []
        };
        this.saveData();
        return true;
    }
}

// Create global instance
window.contentManager = new ContentManager();
