// ==========================================
// EBOOK MANAGER
// Handles ebook and chapter management
// ==========================================

class EbookManager {
    constructor() {
        this.storageKey = 'ebooks_with_chapters';
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
            console.error('[EbookManager] Error loading data:', error);
        }
        
        return {
            ebooks: []
        };
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('[EbookManager] Error saving data:', error);
            return false;
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Create new ebook
    createEbook(ebookData) {
        const newEbook = {
            id: this.generateId(),
            topic: ebookData.topic,
            coverImage: ebookData.coverImage || '',
            description: ebookData.description || '',
            author: ebookData.author || 'Prasiddha Subedi',
            genre: ebookData.genre || '',
            tags: ebookData.tags || '',
            chapters: [],
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };
        
        this.data.ebooks.unshift(newEbook);
        this.saveData();
        return newEbook;
    }

    // Update ebook (topic, cover, description)
    updateEbook(ebookId, updates) {
        const index = this.data.ebooks.findIndex(e => e.id === ebookId);
        if (index === -1) return null;
        
        this.data.ebooks[index] = {
            ...this.data.ebooks[index],
            ...updates,
            dateModified: new Date().toISOString()
        };
        
        this.saveData();
        return this.data.ebooks[index];
    }

    // Delete ebook
    deleteEbook(ebookId) {
        const index = this.data.ebooks.findIndex(e => e.id === ebookId);
        if (index === -1) return false;
        
        this.data.ebooks.splice(index, 1);
        this.saveData();
        return true;
    }

    // Get ebook by ID
    getEbook(ebookId) {
        return this.data.ebooks.find(e => e.id === ebookId);
    }

    // Get all ebooks
    getAllEbooks() {
        return this.data.ebooks || [];
    }

    // Add chapter to ebook
    addChapter(ebookId, chapterData) {
        const ebook = this.getEbook(ebookId);
        if (!ebook) return null;
        
        const newChapter = {
            id: this.generateId(),
            title: chapterData.title,
            chapterNumber: chapterData.chapterNumber || ebook.chapters.length + 1,
            link: chapterData.link || '',
            content: chapterData.content || '',
            summary: chapterData.summary || '',
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };
        
        ebook.chapters.push(newChapter);
        ebook.dateModified = new Date().toISOString();
        this.saveData();
        
        return newChapter;
    }

    // Update chapter
    updateChapter(ebookId, chapterId, updates) {
        const ebook = this.getEbook(ebookId);
        if (!ebook) return null;
        
        const chapterIndex = ebook.chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) return null;
        
        ebook.chapters[chapterIndex] = {
            ...ebook.chapters[chapterIndex],
            ...updates,
            dateModified: new Date().toISOString()
        };
        
        ebook.dateModified = new Date().toISOString();
        this.saveData();
        
        return ebook.chapters[chapterIndex];
    }

    // Delete chapter
    deleteChapter(ebookId, chapterId) {
        const ebook = this.getEbook(ebookId);
        if (!ebook) return false;
        
        const chapterIndex = ebook.chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) return false;
        
        ebook.chapters.splice(chapterIndex, 1);
        ebook.dateModified = new Date().toISOString();
        this.saveData();
        
        return true;
    }

    // Get chapters for an ebook
    getChapters(ebookId) {
        const ebook = this.getEbook(ebookId);
        return ebook ? ebook.chapters : [];
    }

    // Reorder chapters
    reorderChapters(ebookId, chapterIds) {
        const ebook = this.getEbook(ebookId);
        if (!ebook) return false;
        
        const reorderedChapters = [];
        chapterIds.forEach((id, index) => {
            const chapter = ebook.chapters.find(c => c.id === id);
            if (chapter) {
                chapter.chapterNumber = index + 1;
                reorderedChapters.push(chapter);
            }
        });
        
        ebook.chapters = reorderedChapters;
        ebook.dateModified = new Date().toISOString();
        this.saveData();
        
        return true;
    }
}

// Create global instance
const ebookManager = new EbookManager();
