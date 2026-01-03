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

    // ==========================================
    // INITIALIZE DEFAULT POEMS
    // ==========================================

    initializeDefaultPoems() {
        // Only initialize if poetry array is empty
        if (this.data.poetry && this.data.poetry.length > 0) {
            console.log('[ContentManager] Poetry already exists, skipping initialization');
            return false;
        }

        console.log('[ContentManager] Initializing default poems');

        const defaultPoems = [
            {
                title: "Whispers of Dawn",
                content: `Morning breaks with gentle grace,\nA canvas painted, sky embraced;\nSoft light dances through the trees,\nCarried softly by the breeze.\n\nDew drops glisten, pearls of light,\nTransforming darkness into bright;\nThe world awakens, fresh and new,\nIn shades of gold and morning dew.\n\nBirds compose their morning song,\nA melody that all belong;\nIn this moment, pure and true,\nNature's beauty shines right through.\n\nWhispers of dawn, so soft, so clear,\nBringing hope with every year;\nA promise kept, a day begun,\nUntil the setting of the sun.`,
                author: "prasiddha",
                description: "A celebration of the peaceful beauty found in early morning moments",
                tags: "nature, morning, dawn, beauty",
                postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
            },
            {
                title: "Silent Mountains",
                content: `Ancient peaks that touch the sky,\nWatching centuries pass by;\nStanding tall through storm and snow,\nGuardians of the world below.\n\nTheir silence speaks of endless time,\nOf nature's rhythm, nature's rhyme;\nIn their presence, small we feel,\nYet their strength helps us to heal.\n\nClouds may gather at their crown,\nSnows may fall and then come down;\nBut these sentinels remain,\nThrough sunshine, wind, and rain.\n\nMountains teach us to be strong,\nTo stand for right against the wrong;\nIn silence, wisdom finds its way,\nAs night surrenders to the day.`,
                author: "prasiddha",
                description: "An ode to the timeless strength and wisdom of mountain ranges",
                tags: "mountains, nature, strength, wisdom",
                postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
            },
            {
                title: "Ocean's Embrace",
                content: `Waves that crash upon the shore,\nTelling tales of ancient lore;\nEndless blue meets endless sky,\nWhere seabirds soar and dolphins fly.\n\nThe ocean's heart beats strong and deep,\nHolding secrets it will keep;\nIn its depths, a world unknown,\nWhere mysteries have always grown.\n\nTides that rise and tides that fall,\nThe ocean answers nature's call;\nPowerful yet calm it stays,\nThrough moonlit nights and sunny days.\n\nIn its embrace we find our peace,\nFrom worldly troubles, sweet release;\nThe ocean sings its endless song,\nA melody where we belong.`,
                author: "prasiddha",
                description: "A poetic journey into the depths and mysteries of the sea",
                tags: "ocean, sea, nature, peace",
                postedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
            },
            {
                title: "Autumn's Farewell",
                content: `Leaves of amber, red, and gold,\nTelling stories yet untold;\nFloating gently to the ground,\nWithout a whisper, without sound.\n\nAutumn paints with nature's brush,\nIn the evening's fading hush;\nTrees stand bare against the sky,\nAs summer bids its last goodbye.\n\nCrisp air carries scent of change,\nAs seasons once again arrange;\nHarvest moon shines bright above,\nA season's end we've come to love.\n\nIn this time of transformation,\nNature shows its celebration;\nThough leaves may fall and flowers fade,\nBeauty's mark will not evade.`,
                author: "prasiddha",
                description: "A reflection on the beautiful transformation that autumn brings",
                tags: "autumn, fall, seasons, change",
                postedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
            },
            {
                title: "Starlight Dreams",
                content: `When darkness falls and day retreats,\nThe night sky shows its starry beats;\nA million lights shine from afar,\nEach one a distant, ancient star.\n\nIn this vast and cosmic sea,\nWe wonder what we're meant to be;\nSo small beneath the endless night,\nYet filled with hope and inner light.\n\nConstellations tell their tales,\nOf heroes, myths, and cosmic sails;\nThe universe in all its glory,\nWrites its never-ending story.\n\nDreams take flight on starlit beams,\nNothing's quite as it first seems;\nIn the darkness, we find light,\nGuided by the stars so bright.`,
                author: "prasiddha",
                description: "A contemplation of our place in the vast universe under starlit skies",
                tags: "stars, night, dreams, universe",
                postedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() // 25 days ago
            }
        ];

        // Add each default poem
        defaultPoems.forEach(poem => {
            this.addPoetry(poem);
        });

        console.log('[ContentManager] Added', defaultPoems.length, 'default poems');
        return true;
    }
}

// Create global instance
window.contentManager = new ContentManager();
