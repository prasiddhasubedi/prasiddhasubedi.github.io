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

    // Generate URL-friendly slug from title
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except -
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }

    // Validate theme name
    validateTheme(theme) {
        const validThemes = [
            'Dark Galaxy',
            'Light Elegance',
            'Sepia Classic',
            'Ocean Breeze',
            'Forest Green',
            'Sunset Glow',
            'Midnight Purple',
            'Rose Gold',
            'Monochrome',
            'Autumn Leaves',
            'Arctic Ice',
            'Cherry Blossom'
        ];
        return validThemes.includes(theme) ? theme : 'Dark Galaxy';
    }

    // ==========================================
    // POETRY METHODS
    // ==========================================

    getPoetry() {
        return this.data.poetry || [];
    }

    addPoetry(poetry) {
        const sanitized = this.sanitizeObject(poetry, ['title', 'content', 'author', 'tags', 'description', 'postedDate', 'theme']);
        const newPoetry = {
            id: this.generateId(),
            ...sanitized,
            theme: this.validateTheme(poetry.theme || 'Dark Galaxy'),
            slug: this.slugify(poetry.title),
            mediaUrl: poetry.mediaUrl || '', // Media URL is not sanitized as it's expected to be base64 or valid URL
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            postedDate: poetry.postedDate || new Date().toISOString()
        };
        
        this.data.poetry.unshift(newPoetry);
        this.saveData();
        return newPoetry;
    }

    // Update poetry item
    updatePoetry(id, updates) {
        const index = this.data.poetry.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        const sanitized = this.sanitizeObject(updates, ['title', 'content', 'author', 'tags', 'description', 'postedDate', 'theme']);
        this.data.poetry[index] = {
            ...this.data.poetry[index],
            ...sanitized,
            dateModified: new Date().toISOString()
        };
        
        // Update slug if title changed
        if (updates.title) {
            this.data.poetry[index].slug = this.slugify(updates.title);
        }
        
        // Validate and update theme
        if (updates.theme) {
            this.data.poetry[index].theme = this.validateTheme(updates.theme);
        }
        
        if (updates.mediaUrl !== undefined) {
            this.data.poetry[index].mediaUrl = updates.mediaUrl;
        }
        if (updates.postedDate) {
            this.data.poetry[index].postedDate = updates.postedDate;
        }
        if (updates.featured !== undefined) {
            this.data.poetry[index].featured = updates.featured;
        }
        if (updates.featuredOrder !== undefined) {
            this.data.poetry[index].featuredOrder = updates.featuredOrder;
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

    // Update photo
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
        if (updates.featured !== undefined) {
            this.data.photos[index].featured = updates.featured;
        }
        if (updates.featuredOrder !== undefined) {
            this.data.photos[index].featuredOrder = updates.featuredOrder;
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
    // FEATURED ITEMS METHODS
    // ==========================================

    getFeaturedItems() {
        const featured = [];
        
        // Get featured poetry
        if (this.data.poetry) {
            this.data.poetry.forEach(poem => {
                if (poem.featured) {
                    featured.push({
                        ...poem,
                        type: 'poetry',
                        category: 'Poetry',
                        url: `poetry/${poem.slug || this.slugify(poem.title)}/index.html`
                    });
                }
            });
        }
        
        // Get featured photos
        if (this.data.photos) {
            this.data.photos.forEach(photo => {
                if (photo.featured) {
                    featured.push({
                        ...photo,
                        type: 'photography',
                        category: 'Photography',
                        url: photo.url
                    });
                }
            });
        }
        
        // Sort by featuredOrder (lower numbers first) or dateCreated
        featured.sort((a, b) => {
            const orderA = a.featuredOrder !== undefined ? a.featuredOrder : 999999;
            const orderB = b.featuredOrder !== undefined ? b.featuredOrder : 999999;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            // If same order or no order, sort by date
            return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0);
        });
        
        return featured;
    }

    toggleFeatured(type, id) {
        let item = null;
        
        if (type === 'poetry') {
            const index = this.data.poetry.findIndex(p => p.id === id);
            if (index !== -1) {
                this.data.poetry[index].featured = !this.data.poetry[index].featured;
                if (this.data.poetry[index].featured && this.data.poetry[index].featuredOrder === undefined) {
                    // Set order to the end
                    const featured = this.getFeaturedItems();
                    this.data.poetry[index].featuredOrder = featured.length;
                }
                item = this.data.poetry[index];
            }
        } else if (type === 'photography') {
            const index = this.data.photos.findIndex(p => p.id === id);
            if (index !== -1) {
                this.data.photos[index].featured = !this.data.photos[index].featured;
                if (this.data.photos[index].featured && this.data.photos[index].featuredOrder === undefined) {
                    // Set order to the end
                    const featured = this.getFeaturedItems();
                    this.data.photos[index].featuredOrder = featured.length;
                }
                item = this.data.photos[index];
            }
        }
        
        if (item) {
            this.saveData();
        }
        
        return item;
    }

    updateFeaturedOrder(type, id, newOrder) {
        if (type === 'poetry') {
            const index = this.data.poetry.findIndex(p => p.id === id);
            if (index !== -1) {
                this.data.poetry[index].featuredOrder = newOrder;
                this.saveData();
                return this.data.poetry[index];
            }
        } else if (type === 'photography') {
            const index = this.data.photos.findIndex(p => p.id === id);
            if (index !== -1) {
                this.data.photos[index].featuredOrder = newOrder;
                this.saveData();
                return this.data.photos[index];
            }
        }
        return null;
    }

    // ==========================================
    // STATISTICS
    // ==========================================

    getStats() {
        return {
            poetry: this.data.poetry.length,
            photos: this.data.photos.length,
            featured: this.getFeaturedItems().length,
            total: this.data.poetry.length + this.data.photos.length
        };
    }

    // ==========================================
    // SEARCH
    // ==========================================

    search(query, type = 'all') {
        const lowercaseQuery = query.toLowerCase();
        const results = {
            poetry: [],
            photos: []
        };

        if (type === 'all' || type === 'poetry') {
            results.poetry = this.data.poetry.filter(item =>
                item.title.toLowerCase().includes(lowercaseQuery) ||
                item.content.toLowerCase().includes(lowercaseQuery) ||
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
            if (!imported.poetry || !imported.photos) {
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
                title: "NEEDS, A HUMAN DOES",
                content: `A human needs to be held close,\nTo feel a heartbeat, not a ghost;\nTo know that someone understands,\nThe weight we carry in our hands.\n\nA human needs a place to rest,\nWhere fears subside and we're our best;\nA shelter built not just of stone,\nBut love that makes a house a home.\n\nA human needs to dream and hope,\nTo climb the mountains, find the rope;\nTo see beyond the present pain,\nAnd trust that sun will come with rain.\n\nA human needs to give and take,\nTo love, to lose, to bend, to break;\nFor in our needs, we're most alive—\nConnected, human, born to thrive.`,
                author: "prasiddha",
                description: "A profound reflection on the fundamental needs that define our humanity",
                tags: "humanity, needs, connection, love",
                postedDate: new Date('2026-01-06T00:00:00Z').toISOString()
            },
            {
                title: "IF I COULD TELL THE MOON",
                content: `If I could tell the moon my secrets deep,\nWould she keep them safe while mortals sleep?\nWould she understand the weight I bear,\nOr simply glow, indifferent to my prayer?\n\nI'd whisper hopes that never saw the day,\nAnd dreams that time has slowly worn away;\nI'd share the love I couldn't speak aloud,\nHidden beneath my silent, fearful shroud.\n\nThe moon has seen a thousand years unfold,\nShe's witnessed stories new and stories old;\nPerhaps she knows that pain and joy entwine,\nThat broken hearts eventually align.\n\nIf I could tell the moon, would she reply?\nOr would she just drift gently through the sky?\nMaybe silence is her wisest art—\nA listening ear, a sympathetic heart.`,
                author: "prasiddha",
                description: "A heartfelt conversation with the moon about secrets and silent yearnings",
                tags: "moon, secrets, longing, night",
                postedDate: new Date('2026-01-03T00:00:00Z').toISOString()
            },
            {
                title: "SHE, LIKE EVERYTHING BEAUTIFUL",
                content: `She, like everything beautiful,\nComes with thorns and gentle rain;\nA rose that blooms in morning light,\nYet fades when touched by evening's pain.\n\nShe, like everything beautiful,\nIs fleeting, fragile, and sublime;\nA sunset painted in the sky,\nThat vanishes with passing time.\n\nShe, like everything beautiful,\nDemands attention, care, and grace;\nA melody that haunts the soul,\nA memory time cannot erase.\n\nShe, like everything beautiful,\nIs worth the risk, the fear, the fall;\nFor beauty, though it may not last,\nIs the most precious gift of all.`,
                author: "prasiddha",
                description: "An ode to fleeting beauty and the courage to embrace it despite its impermanence",
                tags: "beauty, love, transience, courage",
                postedDate: new Date('2026-01-02T00:00:00Z').toISOString()
            },
            {
                title: "MAYBE SOMEDAY",
                content: `Maybe someday the sun will rise\nWithout the weight of yesterday's goodbyes;\nMaybe someday the rain will fall\nWithout echoing your distant call.\n\nMaybe someday I'll walk alone\nWithout your shadow, fully grown;\nMaybe someday these wounds will heal,\nAnd I'll remember how to feel.\n\nMaybe someday the stars will shine\nWithout reminding me you were mine;\nMaybe someday this aching heart\nWill learn to live, to make a start.\n\nMaybe someday is all I have,\nA fragile hope, a gentle salve;\nBut hope is all we need, they say,\nTo make it through another day.`,
                author: "prasiddha",
                description: "A hopeful reflection on healing and the promise of better tomorrows",
                tags: "hope, healing, future, resilience",
                postedDate: new Date('2026-01-01T00:00:00Z').toISOString()
            },
            {
                title: "IF STARS HAD WINDOWS",
                content: `If stars had windows, what would they see?\nThe dreams of lovers beneath their tree?\nThe lonely wanderer's silent plea?\nThe child who wishes to be free?\n\nIf stars had windows, would they watch\nAs lives unfold, as hearts unlatch?\nWould they witness joy and sorrow blend,\nOr turn away when stories end?\n\nIf stars had windows, could they tell\nOf futures bright or dark as well?\nWould they share their ancient sight,\nOr keep their secrets in the night?\n\nIf stars had windows, I would climb\nBeyond the boundaries of time;\nI'd peer inside and finally know\nWhat makes the universe aglow.`,
                author: "prasiddha",
                description: "A whimsical exploration of cosmic perspective and universal mysteries",
                tags: "stars, wonder, universe, imagination",
                postedDate: new Date('2025-12-31T00:00:00Z').toISOString()
            },
            {
                title: "THE SKY BENEATH MY FEET",
                content: `I walked upon the sky today,\nBeneath my feet, the clouds did sway;\nThe world inverted, upside down,\nI wore the heavens as my crown.\n\nThe earth above looked strange and small,\nI felt no fear that I might fall;\nFor gravity had lost its hold,\nAnd I was free, unbridled, bold.\n\nI danced on air, I touched the blue,\nI saw the world from angles new;\nPerspective shifts when up is down,\nWhen sky becomes the solid ground.\n\nMaybe we're all walking blind,\nToo rigid in our earthly mind;\nMaybe truth is upside down,\nMaybe freedom wears no crown.`,
                author: "prasiddha",
                description: "A surreal journey of perspective where the impossible becomes possible",
                tags: "surreal, perspective, freedom, imagination",
                postedDate: new Date('2025-12-30T00:00:00Z').toISOString()
            },
            {
                title: "Whispers of Dawn",
                content: `Morning breaks with gentle grace,\nA canvas painted, sky embraced;\nSoft light dances through the trees,\nCarried softly by the breeze.\n\nDew drops glisten, pearls of light,\nTransforming darkness into bright;\nThe world awakens, fresh and new,\nIn shades of gold and morning dew.\n\nBirds compose their morning song,\nA melody that all belong;\nIn this moment, pure and true,\nNature's beauty shines right through.\n\nWhispers of dawn, so soft, so clear,\nBringing hope with every year;\nA promise kept, a day begun,\nUntil the setting of the sun.`,
                author: "prasiddha",
                description: "A celebration of the peaceful beauty found in early morning moments",
                tags: "nature, morning, dawn, beauty",
                postedDate: new Date('2025-12-25T00:00:00Z').toISOString()
            },
            {
                title: "Silent Mountains",
                content: `Ancient peaks that touch the sky,\nWatching centuries pass by;\nStanding tall through storm and snow,\nGuardians of the world below.\n\nTheir silence speaks of endless time,\nOf nature's rhythm, nature's rhyme;\nIn their presence, small we feel,\nYet their strength helps us to heal.\n\nClouds may gather at their crown,\nSnows may fall and then come down;\nBut these sentinels remain,\nThrough sunshine, wind, and rain.\n\nMountains teach us to be strong,\nTo stand for right against the wrong;\nIn silence, wisdom finds its way,\nAs night surrenders to the day.`,
                author: "prasiddha",
                description: "An ode to the timeless strength and wisdom of mountain ranges",
                tags: "mountains, nature, strength, wisdom",
                postedDate: new Date('2025-12-20T00:00:00Z').toISOString()
            },
            {
                title: "Ocean's Embrace",
                content: `Waves that crash upon the shore,\nTelling tales of ancient lore;\nEndless blue meets endless sky,\nWhere seabirds soar and dolphins fly.\n\nThe ocean's heart beats strong and deep,\nHolding secrets it will keep;\nIn its depths, a world unknown,\nWhere mysteries have always grown.\n\nTides that rise and tides that fall,\nThe ocean answers nature's call;\nPowerful yet calm it stays,\nThrough moonlit nights and sunny days.\n\nIn its embrace we find our peace,\nFrom worldly troubles, sweet release;\nThe ocean sings its endless song,\nA melody where we belong.`,
                author: "prasiddha",
                description: "A poetic journey into the depths and mysteries of the sea",
                tags: "ocean, sea, nature, peace",
                postedDate: new Date('2025-12-15T00:00:00Z').toISOString()
            },
            {
                title: "Autumn's Farewell",
                content: `Leaves of amber, red, and gold,\nTelling stories yet untold;\nFloating gently to the ground,\nWithout a whisper, without sound.\n\nAutumn paints with nature's brush,\nIn the evening's fading hush;\nTrees stand bare against the sky,\nAs summer bids its last goodbye.\n\nCrisp air carries scent of change,\nAs seasons once again arrange;\nHarvest moon shines bright above,\nA season's end we've come to love.\n\nIn this time of transformation,\nNature shows its celebration;\nThough leaves may fall and flowers fade,\nBeauty's mark will not evade.`,
                author: "prasiddha",
                description: "A reflection on the beautiful transformation that autumn brings",
                tags: "autumn, fall, seasons, change",
                postedDate: new Date('2025-12-10T00:00:00Z').toISOString()
            },
            {
                title: "Starlight Dreams",
                content: `When darkness falls and day retreats,\nThe night sky shows its starry beats;\nA million lights shine from afar,\nEach one a distant, ancient star.\n\nIn this vast and cosmic sea,\nWe wonder what we're meant to be;\nSo small beneath the endless night,\nYet filled with hope and inner light.\n\nConstellations tell their tales,\nOf heroes, myths, and cosmic sails;\nThe universe in all its glory,\nWrites its never-ending story.\n\nDreams take flight on starlit beams,\nNothing's quite as it first seems;\nIn the darkness, we find light,\nGuided by the stars so bright.`,
                author: "prasiddha",
                description: "A contemplation of our place in the vast universe under starlit skies",
                tags: "stars, night, dreams, universe",
                postedDate: new Date('2025-12-05T00:00:00Z').toISOString()
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
