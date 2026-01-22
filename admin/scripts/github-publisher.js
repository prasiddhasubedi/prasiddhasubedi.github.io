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
                `Add article: ${articleData.title}`
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
                `Add ${title} to articles index`,
                indexFile.sha
            );

            return { success: true };
        } catch (error) {
            console.error('[Publisher] Update articles index failed:', error);
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
