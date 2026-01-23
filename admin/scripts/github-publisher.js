// ==========================================
// GITHUB PUBLISHER
// Handles publishing content to GitHub repository
// ==========================================

class GitHubPublisher {
    constructor() {
        this.api = githubAPI;
        this.publishQueue = [];
        this.isPublishing = false;
    }

    // HTML escape utility to prevent XSS
    escapeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Escape HTML attribute to prevent XSS
    escapeHTMLAttr(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
    }

    // Validate and sanitize URL
    sanitizeURL(url) {
        if (typeof url !== 'string' || !url) return '';
        
        // Remove any dangerous protocols
        const trimmed = url.trim();
        const lowerUrl = trimmed.toLowerCase();
        
        // Block javascript:, data:, vbscript:, file: protocols
        if (lowerUrl.startsWith('javascript:') || 
            lowerUrl.startsWith('data:') || 
            lowerUrl.startsWith('vbscript:') ||
            lowerUrl.startsWith('file:')) {
            return '';
        }
        
        // Allow http:, https:, relative URLs (/, ./, ../), or paths without protocol
        // Relative paths like 'chapter1.html' or 'images/cover.jpg' are allowed
        
        return this.escapeHTMLAttr(trimmed);
    }

    // Get file extension from base64 or file data
    getImageExtension(base64Data) {
        const match = base64Data.match(/^data:image\/(\w+);base64,/);
        if (match && match[1]) {
            return match[1] === 'jpeg' ? 'jpg' : match[1];
        }
        return 'jpg'; // default fallback
    }

    // Check if ready to publish
    canPublish() {
        return this.api.hasToken();
    }

    // Show publishing options
    async showPublishOptions() {
        if (!this.canPublish()) {
            const setup = confirm('GitHub is not configured. Would you like to set it up now to enable auto-publishing?');
            if (setup) {
                window.location.href = 'github-setup.html';
            }
            return false;
        }
        return true;
    }

    // Publish poem to GitHub
    async publishPoem(poemData, options = {}) {
        try {
            showToast('Publishing poem to GitHub...', 'info');
            
            const result = await this.api.createPoem(poemData);
            
            if (result.success) {
                showToast(`Poem published successfully! Live at: ${result.url}`, 'success', 5000);
                
                // Also save to localStorage for backup
                if (!options.skipLocalSave) {
                    contentManager.addPoetry(poemData);
                }
                
                return result;
            } else {
                throw new Error('Publishing failed');
            }
        } catch (error) {
            console.error('[Publisher] Publish poem failed:', error);
            showToast(`Failed to publish: ${error.message}`, 'error', 5000);
            
            // Save locally as fallback
            if (confirm('Publishing to GitHub failed. Would you like to save locally instead?')) {
                contentManager.addPoetry(poemData);
                return { success: true, local: true };
            }
            
            throw error;
        }
    }

    // Publish article to GitHub
    async publishArticle(articleData, options = {}) {
        try {
            showToast('Publishing article to GitHub...', 'info');
            
            // Create article structure similar to poetry
            const slug = this.api.slugify(articleData.title);
            const date = this.api.formatDate(articleData.postedDate || new Date());
            
            const articleHTML = this.generateArticleHTML(
                articleData.title,
                articleData.content,
                articleData.author,
                articleData.excerpt,
                date
            );
            
            const basePath = `articles/${slug}`;
            
            // Create article files
            await this.api.createOrUpdateFile(
                `${basePath}/index.html`,
                articleHTML,
                `[Article] Add new article: ${articleData.title}`
            );
            
            // Update articles index
            await this.updateArticlesIndex(articleData.title, slug, articleData.excerpt, date);
            
            const url = `https://${this.api.owner}.github.io/${this.api.repo}/articles/${encodeURIComponent(slug)}/`;
            
            showToast(`Article published successfully! Live at: ${url}`, 'success', 5000);
            
            if (!options.skipLocalSave) {
                contentManager.addArticle(articleData);
            }
            
            return { success: true, url, path: basePath };
        } catch (error) {
            console.error('[Publisher] Publish article failed:', error);
            showToast(`Failed to publish: ${error.message}`, 'error', 5000);
            
            if (confirm('Publishing to GitHub failed. Would you like to save locally instead?')) {
                contentManager.addArticle(articleData);
                return { success: true, local: true };
            }
            
            throw error;
        }
    }

    // Generate article HTML
    generateArticleHTML(title, content, author, excerpt, date) {
        const authorName = author || 'Prasiddha Subedi';
        const desc = excerpt || `An article by ${authorName}`;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Prasiddha Subedi</title>
  <meta name="description" content="${desc}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="../../favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="../../favicon-512x512.png">
  
  <link rel="stylesheet" href="../../css/styles.css">
  <link rel="stylesheet" href="../../css/engagement.css">
  <style>
    .article-container {
      max-width: 800px;
      margin: 80px auto;
      padding: 40px 20px;
    }
    
    .article-header {
      text-align: center;
      margin-bottom: 50px;
    }
    
    .article-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 20px;
    }
    
    .article-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      color: #666;
      font-size: 0.95rem;
    }
    
    .article-content {
      line-height: 1.8;
      font-size: 1.1rem;
      color: #333;
    }
    
    .article-content p {
      margin-bottom: 20px;
    }
    
    .article-content h2 {
      margin: 40px 0 20px;
      color: #1a1a2e;
    }
    
    .article-content blockquote {
      border-left: 4px solid #6366f1;
      padding-left: 20px;
      margin: 30px 0;
      font-style: italic;
      color: #555;
    }
  </style>
</head>
<body>
  <nav class="premium-nav">
    <div class="container nav-container">
      <div class="logo-container">
        <a href="../../index.html" class="logo">
          <span class="logo-text">Prasiddha Subedi</span>
        </a>
      </div>
      <ul class="nav-menu">
        <li><a href="../../index.html" class="nav-link">Home</a></li>
        <li><a href="../../poetry/index.html" class="nav-link">Poetry</a></li>
        <li><a href="../index.html" class="nav-link active">Articles</a></li>
      </ul>
    </div>
  </nav>

  <div class="article-container">
    <header class="article-header">
      <h1 class="article-title">${title}</h1>
      <div class="article-meta">
        <span>By ${authorName}</span>
        <span>•</span>
        <span>${date}</span>
      </div>
    </header>

    <main class="article-content">
      ${content}
    </main>

    <!-- Engagement Features -->
    <div class="engagement-container">
      <div class="engagement-stats">
        <div class="stat-item">
          <span class="stat-value" id="view-count">0</span>
          <span class="stat-label">Views</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="like-count">0</span>
          <span class="stat-label">Likes</span>
        </div>
      </div>
      
      <div class="like-section">
        <button id="like-button" aria-label="Like this article">
          Like
        </button>
      </div>

      <div class="share-section">
        <h3>Share this article</h3>
        <div class="share-buttons">
          <button class="share-button twitter" data-share="twitter">Twitter</button>
          <button class="share-button facebook" data-share="facebook">Facebook</button>
          <button class="share-button whatsapp" data-share="whatsapp">WhatsApp</button>
        </div>
      </div>
    </div>

    <a href="../index.html" class="back-link">← Back to Articles</a>
  </div>

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
  
  <script src="../../js/firebase-config.js"></script>
  <script src="../../js/firebase-engagement.js"></script>
</body>
</html>`;
    }

    // Update articles index
    async updateArticlesIndex(title, slug, excerpt, date) {
        try {
            const indexFile = await this.api.getFile('articles/index.html');
            
            if (!indexFile) {
                throw new Error('Articles index not found');
            }

            let content = indexFile.content;
            
            // Find the articles list
            const listStart = content.indexOf('<ul id="articles-list">');
            if (listStart === -1) {
                // Create the list if it doesn't exist
                const mainEnd = content.indexOf('</main>');
                if (mainEnd !== -1) {
                    const listHTML = `
            <div class="works-list">
                <h2>Available Articles</h2>
                <ul id="articles-list">
                </ul>
            </div>
`;
                    content = content.slice(0, mainEnd) + listHTML + content.slice(mainEnd);
                }
            }
            
            // Add new article to the list
            const encodedSlug = encodeURIComponent(slug);
            const newItem = `                    <li data-aos="fade-up" data-aos-delay="50">
                        <a href="${encodedSlug}/index.html">${title}</a>
                        <p style="color: #666; margin-top: 5px; font-size: 0.95rem;">${excerpt || 'No description available'}</p>
                        <p style="color: #999; margin-top: 3px; font-size: 0.85rem;">📅 ${date}</p>
                    </li>\n`;

            const insertPos = content.indexOf('<ul id="articles-list">') + '<ul id="articles-list">'.length + 1;
            content = content.slice(0, insertPos) + newItem + content.slice(insertPos);

            await this.api.createOrUpdateFile(
                'articles/index.html',
                content,
                `[Article] Update articles index - Add "${title}"`,
                indexFile.sha
            );

            return { success: true };
        } catch (error) {
            console.error('[Publisher] Update articles index failed:', error);
            throw error;
        }
    }

    // Publish photo to GitHub
    async publishPhoto(photoData, options = {}) {
        try {
            showToast('Publishing photo to GitHub...', 'info');
            
            // Get proper file extension from base64 data
            const imageExt = this.getImageExtension(photoData.url);
            const fileName = `${Date.now()}-${photoData.title.replace(/\s+/g, '-')}.${imageExt}`;
            const imagePath = `photography/images/${fileName}`;
            
            const imageResult = await this.api.uploadImage(
                imagePath,
                photoData.url,
                `[Photography] Add new photo: ${photoData.title}`
            );
            
            if (!imageResult.success) {
                throw new Error('Failed to upload photo image');
            }
            
            // Update photography index with new photo
            await this.updatePhotographyIndex(
                photoData.title,
                photoData.caption || '',
                imageResult.url,
                imagePath
            );
            
            const url = `https://${this.api.owner}.github.io/${this.api.repo}/photography/`;
            
            showToast(`Photo published successfully! View at: ${url}`, 'success', 5000);
            
            if (!options.skipLocalSave) {
                contentManager.addPhoto({
                    ...photoData,
                    url: imageResult.url
                });
            }
            
            return { success: true, url, imageUrl: imageResult.url };
        } catch (error) {
            console.error('[Publisher] Publish photo failed:', error);
            showToast(`Failed to publish: ${error.message}`, 'error', 5000);
            
            if (confirm('Publishing to GitHub failed. Would you like to save locally instead?')) {
                contentManager.addPhoto(photoData);
                return { success: true, local: true };
            }
            
            throw error;
        }
    }

    // Update photography index
    async updatePhotographyIndex(title, caption, imageUrl, imagePath) {
        try {
            const indexFile = await this.api.getFile('photography/index.html');
            
            if (!indexFile) {
                throw new Error('Photography index not found');
            }

            let content = indexFile.content;
            
            // Find the photo gallery section
            const galleryMarker = '<div class="works-list" data-aos="fade-up">';
            const galleryStart = content.indexOf(galleryMarker);
            
            if (galleryStart === -1) {
                throw new Error('Photo gallery section not found');
            }
            
            // Replace the "On the way" placeholder with actual gallery if it exists
            if (content.includes('On the way')) {
                // Escape HTML to prevent XSS
                const safeTitle = this.escapeHTML(title);
                const safeCaption = this.escapeHTML(caption);
                
                // Create initial photo grid
                const photoGridHTML = `
                <div class="works-list" data-aos="fade-up">
                    <h2>Photo Gallery</h2>
                    <div class="photo-gallery" id="photo-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin: 2rem 0;">
                        <div class="photo-item" data-aos="fade-up" style="position: relative; overflow: hidden; border-radius: 12px; aspect-ratio: 4/3; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                            <img src="${imageUrl}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: cover;">
                            <div class="photo-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 20px; color: white;">
                                <h3 style="margin: 0; font-size: 1.2rem;">${safeTitle}</h3>
                                ${safeCaption ? `<p style="margin: 5px 0 0; font-size: 0.9rem; opacity: 0.9;">${safeCaption}</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
                
                const placeholderEnd = content.indexOf('</div>', content.indexOf('On the way'));
                const sectionEnd = content.indexOf('</div>', placeholderEnd + 6) + 6;
                
                content = content.slice(0, galleryStart) + photoGridHTML + content.slice(sectionEnd);
            } else {
                // Escape HTML to prevent XSS
                const safeTitle = this.escapeHTML(title);
                const safeCaption = this.escapeHTML(caption);
                
                // Add to existing photo grid
                const gridEnd = content.indexOf('</div>', content.indexOf('id="photo-gallery"'));
                
                if (gridEnd === -1) {
                    throw new Error('Photo gallery grid not found');
                }
                
                const newPhotoHTML = `
                        <div class="photo-item" data-aos="fade-up" style="position: relative; overflow: hidden; border-radius: 12px; aspect-ratio: 4/3; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                            <img src="${imageUrl}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: cover;">
                            <div class="photo-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 20px; color: white;">
                                <h3 style="margin: 0; font-size: 1.2rem;">${safeTitle}</h3>
                                ${safeCaption ? `<p style="margin: 5px 0 0; font-size: 0.9rem; opacity: 0.9;">${safeCaption}</p>` : ''}
                            </div>
                        </div>`;
                
                content = content.slice(0, gridEnd) + newPhotoHTML + content.slice(gridEnd);
            }

            await this.api.createOrUpdateFile(
                'photography/index.html',
                content,
                `[Photography] Update gallery - Add "${title}"`,
                indexFile.sha
            );

            return { success: true };
        } catch (error) {
            console.error('[Publisher] Update photography index failed:', error);
            throw error;
        }
    }

    // Upload image to GitHub
    async uploadImage(file, folder = 'images') {
        try {
            showToast('Uploading image...', 'info');
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = async (e) => {
                    try {
                        const imageData = e.target.result;
                        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                        const path = `${folder}/${fileName}`;
                        
                        const result = await this.api.uploadImage(
                            path,
                            imageData,
                            `Upload image: ${fileName}`
                        );
                        
                        if (result.success) {
                            showToast('Image uploaded successfully!', 'success');
                            resolve(result);
                        } else {
                            reject(new Error('Upload failed'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
                
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('[Publisher] Upload image failed:', error);
            showToast(`Failed to upload image: ${error.message}`, 'error');
            throw error;
        }
    }

    // Publish eBook to GitHub
    async publishEbook(ebookData, options = {}) {
        try {
            showToast('Publishing eBook to GitHub...', 'info');
            
            const { topic, author, genre, description, coverImage, chapters = [] } = ebookData;
            const slug = this.api.slugify(topic);
            const basePath = `ebooks/${slug}`;
            
            // Validate eBook has chapters
            if (chapters.length === 0) {
                throw new Error('Cannot publish an eBook without chapters');
            }
            
            // Generate eBook main page HTML
            const ebookHTML = this.generateEbookHTML(topic, author, genre, description, coverImage, chapters, slug);
            
            // Create main eBook page
            await this.api.createOrUpdateFile(
                `${basePath}/index.html`,
                ebookHTML,
                `[eBook] Add new eBook: ${topic}`
            );
            
            // Create individual chapter pages
            for (let i = 0; i < chapters.length; i++) {
                const chapter = chapters[i];
                const chapterSlug = this.api.slugify(`chapter-${chapter.chapterNumber}-${chapter.title}`);
                const chapterHTML = this.generateChapterHTML(
                    topic,
                    chapter,
                    slug,
                    i > 0 ? chapters[i - 1] : null,
                    i < chapters.length - 1 ? chapters[i + 1] : null
                );
                
                await this.api.createOrUpdateFile(
                    `${basePath}/${chapterSlug}.html`,
                    chapterHTML,
                    `[eBook] Add chapter ${chapter.chapterNumber}: ${chapter.title}`
                );
            }
            
            // Update eBooks index
            await this.updateEbooksIndex(topic, slug, description, author, genre, chapters.length, coverImage);
            
            const url = `https://${this.api.owner}.github.io/${this.api.repo}/ebooks/${encodeURIComponent(slug)}/`;
            
            showToast(`eBook published successfully! Live at: ${url}`, 'success', 5000);
            
            if (!options.skipLocalSave && typeof ebookManager !== 'undefined') {
                ebookManager.saveEbook(ebookData);
            }
            
            return { success: true, url, path: basePath };
        } catch (error) {
            console.error('[Publisher] Publish eBook failed:', error);
            showToast(`Failed to publish: ${error.message}`, 'error', 5000);
            throw error;
        }
    }

    // Generate eBook main page HTML
    generateEbookHTML(topic, author, genre, description, coverImage, chapters, slug) {
        const authorName = author || 'Prasiddha Subedi';
        const genreName = genre || 'Literature';
        const desc = description || `An eBook by ${authorName}`;
        
        // Sort chapters by number
        const sortedChapters = [...chapters].sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
        
        // Generate chapter list HTML
        const chapterListHTML = sortedChapters.map(chapter => {
            const chapterSlug = this.api.slugify(`chapter-${chapter.chapterNumber}-${chapter.title}`);
            const safeTitle = this.escapeHTML(chapter.title);
            const safeSummary = this.escapeHTML(chapter.summary || '');
            const safeLink = chapter.link ? this.sanitizeURL(chapter.link) : '';
            
            return `
                <div class="chapter-item" data-aos="fade-up">
                    <div class="chapter-number">${chapter.chapterNumber}</div>
                    <div class="chapter-info">
                        <h3 class="chapter-title">
                            ${safeLink ? 
                                `<a href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeTitle} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; display: inline-block;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>` :
                                `<a href="${chapterSlug}.html">${safeTitle}</a>`
                            }
                        </h3>
                        ${safeSummary ? `<p class="chapter-summary">${safeSummary}</p>` : ''}
                    </div>
                </div>`;
        }).join('\n');
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(topic)} - Prasiddha Subedi</title>
  <meta name="description" content="${this.escapeHTML(desc)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="../../favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="../../favicon-512x512.png">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="book">
  <meta property="og:url" content="https://prasiddhasubedi.github.io/byprasiddha/ebooks/${encodeURIComponent(slug)}/">
  <meta property="og:title" content="${this.escapeHTML(topic)} - ${this.escapeHTML(authorName)}">
  <meta property="og:description" content="${this.escapeHTML(desc)}">
  ${coverImage ? `<meta property="og:image" content="${this.sanitizeURL(coverImage)}">` : '<meta property="og:image" content="https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg">'}
  
  <link rel="stylesheet" href="../../css/styles.css">
  <link rel="stylesheet" href="../../css/engagement.css">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <style>
    body {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e8e8e8;
      font-family: 'Georgia', serif;
      min-height: 100vh;
      padding: 20px;
    }
    
    .ebook-container {
      max-width: 900px;
      margin: 80px auto;
      padding: 40px 20px;
    }
    
    .ebook-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .ebook-cover {
      width: 300px;
      height: 400px;
      margin: 0 auto 30px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    .ebook-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .ebook-cover.no-image {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      color: white;
    }
    
    .ebook-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #93c5fd;
      margin-bottom: 15px;
    }
    
    .ebook-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      color: #9db4d4;
      font-size: 1.1rem;
      margin-bottom: 20px;
    }
    
    .ebook-description {
      font-size: 1.2rem;
      line-height: 1.8;
      color: #cbd5e1;
      margin: 0 auto;
      max-width: 700px;
    }
    
    .chapters-section {
      margin: 60px 0;
    }
    
    .section-title {
      font-size: 2rem;
      color: #93c5fd;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .chapter-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .chapter-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(147, 197, 253, 0.2);
      border-radius: 12px;
      padding: 25px;
      display: flex;
      gap: 20px;
      align-items: flex-start;
      transition: all 0.3s ease;
    }
    
    .chapter-item:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(147, 197, 253, 0.4);
      transform: translateX(10px);
    }
    
    .chapter-number {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    
    .chapter-info {
      flex: 1;
    }
    
    .chapter-title {
      font-size: 1.3rem;
      margin-bottom: 8px;
    }
    
    .chapter-title a {
      color: #93c5fd;
      text-decoration: none;
      transition: color 0.3s;
    }
    
    .chapter-title a:hover {
      color: #60a5fa;
    }
    
    .chapter-summary {
      color: #9db4d4;
      line-height: 1.6;
      margin: 0;
    }
    
    .back-link {
      display: inline-block;
      margin-top: 40px;
      padding: 12px 24px;
      background: rgba(147, 197, 253, 0.1);
      color: #93c5fd;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s;
      border: 1px solid rgba(147, 197, 253, 0.3);
    }
    
    .back-link:hover {
      background: rgba(147, 197, 253, 0.2);
      transform: translateX(-5px);
    }
    
    @media (max-width: 768px) {
      .ebook-cover {
        width: 200px;
        height: 280px;
      }
      
      .ebook-title {
        font-size: 1.8rem;
      }
      
      .chapter-item {
        flex-direction: column;
        gap: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="ebook-container">
    <header class="ebook-header">
      ${coverImage ? 
        `<div class="ebook-cover"><img src="${this.sanitizeURL(coverImage)}" alt="${this.escapeHTML(topic)} cover"></div>` :
        `<div class="ebook-cover no-image">📚</div>`
      }
      <h1 class="ebook-title">${this.escapeHTML(topic)}</h1>
      <div class="ebook-meta">
        <span>By ${this.escapeHTML(authorName)}</span>
        <span>•</span>
        <span>${this.escapeHTML(genreName)}</span>
        <span>•</span>
        <span>${chapters.length} Chapter${chapters.length !== 1 ? 's' : ''}</span>
      </div>
      <p class="ebook-description">${this.escapeHTML(desc)}</p>
    </header>

    <section class="chapters-section">
      <h2 class="section-title">Chapters</h2>
      <div class="chapter-list">
        ${chapterListHTML}
      </div>
    </section>

    <!-- Engagement Features -->
    <div class="engagement-container">
      <div class="engagement-stats">
        <div class="stat-item">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span class="stat-value" id="view-count">0</span>
          <span class="stat-label">Views</span>
        </div>
        
        <div class="stat-item">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="stat-value" id="like-count">0</span>
          <span class="stat-label">Likes</span>
        </div>
      </div>
      
      <div class="like-section">
        <button id="like-button" aria-label="Like this eBook">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          Like
        </button>
      </div>

      <div class="share-section">
        <h3>Share this eBook</h3>
        <div class="share-buttons">
          <button class="share-button twitter" data-share="twitter">Twitter</button>
          <button class="share-button facebook" data-share="facebook">Facebook</button>
          <button class="share-button whatsapp" data-share="whatsapp">WhatsApp</button>
        </div>
      </div>
    </div>

    <a href="../index.html" class="back-link">← Back to eBooks</a>
  </div>

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
  
  <script src="../../js/firebase-config.js"></script>
  <script src="../../js/firebase-engagement.js"></script>
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script>
    AOS.init({
      duration: 800,
      once: true
    });
  </script>
</body>
</html>`;
    }

    // Generate individual chapter HTML
    generateChapterHTML(ebookTopic, chapter, ebookSlug, previousChapter, nextChapter) {
        const safeTitle = this.escapeHTML(chapter.title);
        // Note: chapter.content is intentionally not escaped because it contains rich HTML 
        // from the Quill editor (formatting, links, etc.). This is admin-created content,
        // not user-submitted content from untrusted sources.
        const safeContent = chapter.content || '<p>Content not available. Please check the external link if provided.</p>';
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chapter ${chapter.chapterNumber}: ${safeTitle} - ${this.escapeHTML(ebookTopic)}</title>
  <meta name="description" content="${this.escapeHTML(chapter.summary || safeTitle)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="../../favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="../../favicon-512x512.png">
  
  <link rel="stylesheet" href="../../css/styles.css">
  <style>
    body {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e8e8e8;
      font-family: 'Georgia', serif;
      min-height: 100vh;
      padding: 20px;
    }
    
    .chapter-container {
      max-width: 800px;
      margin: 80px auto;
      padding: 40px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      border: 1px solid rgba(147, 197, 253, 0.1);
    }
    
    .chapter-header {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 2px solid rgba(147, 197, 253, 0.2);
    }
    
    .chapter-label {
      font-size: 0.9rem;
      color: #9db4d4;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .chapter-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #93c5fd;
      margin: 0;
    }
    
    .chapter-content {
      font-size: 1.2rem;
      line-height: 2;
      color: #e8e8e8;
    }
    
    .chapter-content p {
      margin-bottom: 20px;
    }
    
    .chapter-content h1,
    .chapter-content h2,
    .chapter-content h3 {
      color: #93c5fd;
      margin: 40px 0 20px;
    }
    
    .chapter-content ul,
    .chapter-content ol {
      margin: 20px 0;
      padding-left: 30px;
    }
    
    .chapter-content blockquote {
      border-left: 4px solid #667eea;
      padding-left: 20px;
      margin: 30px 0;
      font-style: italic;
      color: #9db4d4;
    }
    
    .chapter-navigation {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid rgba(147, 197, 253, 0.2);
    }
    
    .nav-button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 15px 25px;
      background: rgba(147, 197, 253, 0.1);
      color: #93c5fd;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s;
      border: 1px solid rgba(147, 197, 253, 0.3);
      font-size: 1rem;
    }
    
    .nav-button:hover {
      background: rgba(147, 197, 253, 0.2);
      transform: translateX(-5px);
    }
    
    .nav-button.next:hover {
      transform: translateX(5px);
    }
    
    .nav-button svg {
      width: 20px;
      height: 20px;
    }
    
    @media (max-width: 768px) {
      .chapter-container {
        padding: 20px;
      }
      
      .chapter-title {
        font-size: 1.8rem;
      }
      
      .chapter-content {
        font-size: 1.1rem;
      }
      
      .chapter-navigation {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="chapter-container">
    <header class="chapter-header">
      <div class="chapter-label">Chapter ${chapter.chapterNumber}</div>
      <h1 class="chapter-title">${safeTitle}</h1>
    </header>

    <main class="chapter-content">
      ${safeContent}
    </main>

    <nav class="chapter-navigation">
      <div>
        ${previousChapter ? 
          `<a href="${this.api.slugify(`chapter-${previousChapter.chapterNumber}-${previousChapter.title}`)}.html" class="nav-button prev">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <div>
              <div style="font-size: 0.85rem; opacity: 0.7;">Previous</div>
              <div>${this.escapeHTML(previousChapter.title)}</div>
            </div>
          </a>` :
          `<a href="index.html" class="nav-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Contents
          </a>`
        }
      </div>
      <div style="text-align: right;">
        ${nextChapter ? 
          `<a href="${this.api.slugify(`chapter-${nextChapter.chapterNumber}-${nextChapter.title}`)}.html" class="nav-button next">
            <div>
              <div style="font-size: 0.85rem; opacity: 0.7;">Next</div>
              <div>${this.escapeHTML(nextChapter.title)}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>` :
          `<a href="index.html" class="nav-button">
            Back to Contents
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M15 5l7 7-7 7"/>
            </svg>
          </a>`
        }
      </div>
    </nav>
  </div>
</body>
</html>`;
    }

    // Update eBooks index page
    async updateEbooksIndex(topic, slug, description, author, genre, chapterCount, coverImage) {
        try {
            // Get current index file
            const indexFile = await this.api.getFile('ebooks/index.html');
            
            if (!indexFile) {
                throw new Error('eBooks index not found');
            }

            let content = indexFile.content;
            
            // Find the ebooks list
            const listStart = content.indexOf('<ul id="ebooks-list">');
            const listEnd = content.indexOf('</ul>', listStart);
            
            if (listStart === -1 || listEnd === -1) {
                throw new Error('Could not find ebooks list in index');
            }

            // Create new list item
            const encodedSlug = encodeURIComponent(slug);
            const authorName = author || 'Prasiddha Subedi';
            const genreName = genre || 'Literature';
            const desc = description || `An eBook by ${authorName}`;
            
            const newItem = `                    <li data-aos="fade-up" data-aos-delay="50">
                        <a href="${encodedSlug}/index.html">
                            ${coverImage ? `<img src="${this.sanitizeURL(coverImage)}" alt="${this.escapeHTML(topic)} cover" style="width: 100px; height: 140px; object-fit: cover; border-radius: 8px; margin-right: 15px;">` : ''}
                            <div>
                                <h3>${this.escapeHTML(topic)}</h3>
                                <p style="color: #666; margin-top: 5px; font-size: 0.95rem;">${this.escapeHTML(desc)}</p>
                                <p style="color: #999; margin-top: 3px; font-size: 0.85rem;">📚 ${chapterCount} Chapter${chapterCount !== 1 ? 's' : ''} • ${this.escapeHTML(genreName)}</p>
                            </div>
                        </a>
                    </li>\n`;

            // Insert at the beginning of the list
            const insertPos = listStart + '<ul id="ebooks-list">'.length + 1;
            content = content.slice(0, insertPos) + newItem + content.slice(insertPos);

            // Update the file
            await this.api.createOrUpdateFile(
                'ebooks/index.html',
                content,
                `[eBook] Update eBooks index - Add "${topic}"`,
                indexFile.sha
            );

            return { success: true };
        } catch (error) {
            console.error('[Publisher] Update eBooks index failed:', error);
            throw error;
        }
    }

    // Delete content from GitHub
    async deleteContent(type, slug) {
        try {
            if (!confirm('This will delete the content from GitHub permanently. Continue?')) {
                return { cancelled: true };
            }
            
            showToast('Deleting from GitHub...', 'info');
            
            const folder = type === 'poetry' ? 'poetry' : type === 'articles' ? 'articles' : type;
            const path = `${folder}/${slug}`;
            
            // Delete the directory (GitHub API doesn't support directory deletion directly)
            // We need to delete each file individually
            const files = await this.api.listDirectory(path);
            
            for (const file of files) {
                await this.api.deleteFile(file.path, `Delete ${file.name}`);
            }
            
            showToast('Content deleted from GitHub successfully!', 'success');
            
            return { success: true };
        } catch (error) {
            console.error('[Publisher] Delete failed:', error);
            showToast(`Failed to delete: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Create global instance
const githubPublisher = new GitHubPublisher();

// Helper function to show toast
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}
