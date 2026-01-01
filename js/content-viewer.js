// ==========================================
// UNIVERSAL CONTENT VIEWER
// Loads content dynamically from localStorage
// ==========================================

class ContentViewer {
    constructor() {
        this.contentType = null;
        this.contentTitle = null;
        this.content = null;
    }

    // Initialize the viewer based on the page
    init() {
        // Determine content type from URL path
        const path = window.location.pathname;
        
        if (path.includes('/poetry/')) {
            this.contentType = 'poetry';
        } else if (path.includes('/articles/')) {
            this.contentType = 'articles';
        } else if (path.includes('/ebooks/')) {
            this.contentType = 'ebooks';
        } else {
            console.log('[ContentViewer] Not a content page');
            return false;
        }

        // Extract title from URL (last segment before index.html or last segment)
        const segments = path.split('/').filter(s => s && s !== 'index.html');
        this.contentTitle = decodeURIComponent(segments[segments.length - 1]);

        console.log('[ContentViewer] Type:', this.contentType, 'Title:', this.contentTitle);

        // Load and display content
        return this.loadContent();
    }

    // Load content from localStorage
    loadContent() {
        try {
            const contentData = localStorage.getItem('admin_content_data');
            
            if (!contentData) {
                console.log('[ContentViewer] No content data in localStorage');
                return false;
            }

            const data = JSON.parse(contentData);
            const contentArray = data[this.contentType] || [];

            // Find content by title
            this.content = contentArray.find(item => item.title === this.contentTitle);

            if (this.content) {
                console.log('[ContentViewer] Content found:', this.content.title);
                this.renderContent();
                return true;
            } else {
                console.log('[ContentViewer] Content not found for title:', this.contentTitle);
                return false;
            }
        } catch (error) {
            console.error('[ContentViewer] Error loading content:', error);
            return false;
        }
    }

    // Render the content on the page
    renderContent() {
        if (!this.content) return;

        // Update page title
        document.title = `${this.content.title} - Prasiddha Subedi`;

        // Update meta tags
        this.updateMetaTags();

        // Update content based on type
        switch (this.contentType) {
            case 'poetry':
                this.renderPoetry();
                break;
            case 'articles':
                this.renderArticle();
                break;
            case 'ebooks':
                this.renderEbook();
                break;
        }
    }

    // Update meta tags for SEO and social sharing
    updateMetaTags() {
        const description = this.content.description || 
                          this.content.excerpt || 
                          (this.content.content ? this.content.content.substring(0, 150) + '...' : 'Content by Prasiddha Subedi');

        // Update description meta
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = description;
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.content = `${this.content.title} - Prasiddha Subedi`;

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.content = description;

        // Update Twitter tags
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.content = `${this.content.title} - Prasiddha Subedi`;

        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        if (twitterDesc) twitterDesc.content = description;
    }

    // Render poetry content
    renderPoetry() {
        const titleElement = document.querySelector('.main-title');
        if (titleElement) {
            titleElement.textContent = this.content.title;
        }

        const authorElement = document.querySelector('.author-signature');
        if (authorElement) {
            authorElement.textContent = this.content.author || 'prasiddha';
        }

        const poemTextContainer = document.querySelector('.poem-text');
        if (poemTextContainer && this.content.content) {
            // Clear existing content
            poemTextContainer.innerHTML = '';

            // Split content into stanzas (double line breaks)
            const stanzas = this.content.content.split('\n\n').filter(s => s.trim());
            
            stanzas.forEach((stanza, index) => {
                const stanzaDiv = document.createElement('div');
                stanzaDiv.className = 'stanza';
                if (index === stanzas.length - 1) {
                    stanzaDiv.classList.add('final-stanza');
                }

                const verses = stanza.split('\n').filter(v => v.trim());
                verses.forEach(verse => {
                    const p = document.createElement('p');
                    p.className = 'verse';
                    p.textContent = verse;
                    stanzaDiv.appendChild(p);
                });

                poemTextContainer.appendChild(stanzaDiv);
            });
        }
    }

    // Render article content
    renderArticle() {
        const titleElement = document.querySelector('.main-title');
        if (titleElement) {
            titleElement.textContent = this.content.title;
        }

        // Update author and date in meta section
        const authorSpan = document.querySelector('.article-meta .author');
        if (authorSpan) {
            authorSpan.textContent = `By ${this.content.author || 'Prasiddha Subedi'}`;
        }

        const dateSpan = document.querySelector('.article-meta .date');
        if (dateSpan) {
            const date = new Date(this.content.postedDate || this.content.dateCreated);
            dateSpan.textContent = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }

        // Render article content
        const articleText = document.querySelector('.article-text');
        if (articleText && this.content.content) {
            // Split into paragraphs
            const paragraphs = this.content.content.split('\n\n').filter(p => p.trim());
            articleText.innerHTML = paragraphs.map(p => 
                `<p>${this.escapeHTML(p).replace(/\n/g, '<br>')}</p>`
            ).join('');
        }
    }

    // Render ebook content
    renderEbook() {
        const titleElement = document.querySelector('.main-title');
        if (titleElement) {
            titleElement.textContent = this.content.title;
        }

        // Update ebook meta
        const authorSpan = document.querySelector('.ebook-meta .author');
        if (authorSpan) {
            authorSpan.textContent = `By ${this.content.author || 'Prasiddha Subedi'}`;
        }

        const genreSpan = document.querySelector('.ebook-meta .genre');
        if (genreSpan && this.content.genre) {
            genreSpan.textContent = this.content.genre;
        }

        const dateSpan = document.querySelector('.ebook-meta .date');
        if (dateSpan) {
            const date = new Date(this.content.postedDate || this.content.dateCreated);
            dateSpan.textContent = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }

        // Render description
        const descriptionDiv = document.querySelector('.ebook-description');
        if (descriptionDiv && this.content.description) {
            descriptionDiv.innerHTML = `<p>${this.escapeHTML(this.content.description)}</p>`;
        }
    }

    // Escape HTML to prevent XSS
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new ContentViewer();
    viewer.init();
});
