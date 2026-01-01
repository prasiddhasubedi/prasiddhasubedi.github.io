// ==========================================
// CONTENT PAGE GENERATOR
// Dynamically generates individual content pages
// ==========================================

// Constants
const DESCRIPTION_MAX_LENGTH = 150;

class ContentPageGenerator {
    constructor() {
        this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    }

    // Generate a poem page
    generatePoemPage(poem) {
        const poemTitle = poem.title;
        const poemContent = poem.content || '';
        const author = poem.author || 'prasiddha';
        const description = poem.description || 'A poem by Prasiddha Subedi';
        const mediaUrl = poem.mediaUrl || '';

        // Split content into stanzas (double line breaks)
        const stanzas = poemContent.split('\n\n').filter(s => s.trim());
        
        const stanzasHTML = stanzas.map((stanza, index) => {
            const verses = stanza.split('\n').filter(v => v.trim());
            const versesHTML = verses.map(verse => 
                `<p class="verse">${this.escapeHTML(verse)}</p>`
            ).join('\n          ');
            
            const finalClass = index === stanzas.length - 1 ? ' final-stanza' : '';
            return `
        <div class="stanza${finalClass}">
          ${versesHTML}
        </div>`;
        }).join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(poemTitle)} - Prasiddha Subedi</title>
  <meta name="description" content="${this.escapeHTML(description)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="../../favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="../../favicon-512x512.png">
  
  <!-- Open Graph Meta Tags for Social Media -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://prasiddhasubedi.github.io/byprasiddha/poetry/${encodeURIComponent(poemTitle)}/">
  <meta property="og:title" content="${this.escapeHTML(poemTitle)} - Prasiddha Subedi">
  <meta property="og:description" content="${this.escapeHTML(description)}">
  <meta property="og:image" content="https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${this.escapeHTML(poemTitle)} - Prasiddha Subedi">
  <meta property="og:site_name" content="Prasiddha Subedi - Premium Literary Experience">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://prasiddhasubedi.github.io/byprasiddha/poetry/${encodeURIComponent(poemTitle)}/">
  <meta name="twitter:title" content="${this.escapeHTML(poemTitle)} - Prasiddha Subedi">
  <meta name="twitter:description" content="${this.escapeHTML(description)}">
  <meta name="twitter:image" content="https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg">
  <meta name="twitter:image:alt" content="${this.escapeHTML(poemTitle)} - Prasiddha Subedi">
  
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="decorative-elements">
      <div class="gradient-bg"></div>
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <header class="title-section">
      <h1 class="main-title">${this.escapeHTML(poemTitle)}</h1>
      <div class="author-signature">${this.escapeHTML(author)}</div>
    </header>

    <main class="poetry-content">
      <div class="poem-text">
${stanzasHTML}
      </div>
    </main>

    <div class="back-link-container">
      <a href="../index.html" class="back-link">← Back to Poetry Collection</a>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`;
    }

    // Generate an article page
    generateArticlePage(article) {
        const title = article.title;
        const content = article.content || '';
        const author = article.author || 'Prasiddha Subedi';
        const excerpt = article.excerpt || content.substring(0, 150) + '...';
        const date = new Date(article.postedDate || article.dateCreated);
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const mediaUrl = article.mediaUrl || '';

        // Convert content line breaks to paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        const contentHTML = paragraphs.map(p => 
            `<p>${this.escapeHTML(p).replace(/\n/g, '<br>')}</p>`
        ).join('\n        ');

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(title)} - Prasiddha Subedi</title>
  <meta name="description" content="${this.escapeHTML(excerpt)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="../../favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="../../favicon-512x512.png">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://prasiddhasubedi.github.io/byprasiddha/articles/${encodeURIComponent(title)}/">
  <meta property="og:title" content="${this.escapeHTML(title)}">
  <meta property="og:description" content="${this.escapeHTML(excerpt)}">
  <meta property="og:image" content="https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${this.escapeHTML(title)}">
  <meta name="twitter:description" content="${this.escapeHTML(excerpt)}">
  <meta name="twitter:image" content="https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg">
  
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="decorative-elements">
      <div class="gradient-bg"></div>
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <header class="title-section">
      <h1 class="main-title">${this.escapeHTML(title)}</h1>
      <div class="article-meta">
        <span class="author">By ${this.escapeHTML(author)}</span>
        <span class="separator">•</span>
        <span class="date">${formattedDate}</span>
      </div>
    </header>

    <main class="article-content">
      <article class="article-text">
        ${contentHTML}
      </article>
    </main>

    <div class="back-link-container">
      <a href="../index.html" class="back-link">← Back to Articles</a>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`;
    }

    // Generate an ebook page
    generateEbookPage(ebook) {
        const title = ebook.title;
        const description = ebook.description || '';
        const author = ebook.author || 'Prasiddha Subedi';
        const genre = ebook.genre || '';
        const date = new Date(ebook.postedDate || ebook.dateCreated);
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const coverImageUrl = ebook.coverImageUrl || '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(title)} - Prasiddha Subedi</title>
  <meta name="description" content="${this.escapeHTML(description)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="../../favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../../favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../favicon-192x192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="../../favicon-512x512.png">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="book">
  <meta property="og:url" content="https://prasiddhasubedi.github.io/byprasiddha/ebooks/${encodeURIComponent(title)}/">
  <meta property="og:title" content="${this.escapeHTML(title)}">
  <meta property="og:description" content="${this.escapeHTML(description)}">
  <meta property="og:image" content="https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${this.escapeHTML(title)}">
  <meta name="twitter:description" content="${this.escapeHTML(description)}">
  <meta name="twitter:image" content="https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg">
  
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="decorative-elements">
      <div class="gradient-bg"></div>
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <header class="title-section">
      <h1 class="main-title">${this.escapeHTML(title)}</h1>
      <div class="ebook-meta">
        <span class="author">By ${this.escapeHTML(author)}</span>
        ${genre ? `<span class="separator">•</span><span class="genre">${this.escapeHTML(genre)}</span>` : ''}
        <span class="separator">•</span>
        <span class="date">${formattedDate}</span>
      </div>
    </header>

    <main class="ebook-content">
      <div class="ebook-description">
        <p>${this.escapeHTML(description)}</p>
      </div>
      <div class="coming-soon-notice">
        <p>📚 Full content coming soon...</p>
      </div>
    </main>

    <div class="back-link-container">
      <a href="../index.html" class="back-link">← Back to Ebooks</a>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`;
    }

    // Helper to escape HTML
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Save generated page (simulated - in reality this would need server-side support)
    // For GitHub Pages, we'll store the HTML in localStorage and provide download
    savePageAsDownload(html, type, title) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Create global instance
window.contentPageGenerator = new ContentPageGenerator();
