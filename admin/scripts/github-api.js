// ==========================================
// GITHUB API INTEGRATION
// Handles all GitHub repository operations
// ==========================================

class GitHubAPI {
    constructor() {
        this.owner = 'prasiddhasubedi';
        this.repo = 'byprasiddha';
        this.branch = 'main';
        this.apiBase = 'https://api.github.com';
        this.token = this.loadToken();
    }

    // Load token from localStorage
    loadToken() {
        return localStorage.getItem('github_token') || '';
    }

    // Save token to localStorage
    saveToken(token) {
        localStorage.setItem('github_token', token);
        this.token = token;
    }

    // Remove token
    clearToken() {
        localStorage.removeItem('github_token');
        this.token = '';
    }

    // Check if token is set
    hasToken() {
        return !!this.token;
    }

    // Get headers for API requests
    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `GitHub API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[GitHub API] Request failed:', error);
            throw error;
        }
    }

    // Test token validity
    async testToken() {
        try {
            const user = await this.request('/user');
            return { valid: true, user: user.login };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // Get file content
    async getFile(path) {
        try {
            const response = await this.request(
                `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`
            );
            
            if (response.content) {
                // Decode base64 content
                const content = atob(response.content.replace(/\n/g, ''));
                return {
                    content,
                    sha: response.sha,
                    path: response.path
                };
            }
            
            return null;
        } catch (error) {
            if (error.message.includes('404')) {
                return null; // File doesn't exist
            }
            throw error;
        }
    }

    // Create or update file
    async createOrUpdateFile(path, content, message, sha = null) {
        try {
            const body = {
                message,
                content: btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g,
                    (match, p1) => String.fromCharCode('0x' + p1))), // Properly encode UTF-8 to base64
                branch: this.branch
            };

            if (sha) {
                body.sha = sha; // Required for updates
            }

            const response = await this.request(
                `/repos/${this.owner}/${this.repo}/contents/${path}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(body)
                }
            );

            return {
                success: true,
                commit: response.commit,
                content: response.content
            };
        } catch (error) {
            console.error('[GitHub API] File operation failed:', error);
            throw error;
        }
    }

    // Delete file
    async deleteFile(path, message) {
        try {
            // First get the file to get its SHA
            const file = await this.getFile(path);
            if (!file) {
                throw new Error('File not found');
            }

            const body = {
                message,
                sha: file.sha,
                branch: this.branch
            };

            await this.request(
                `/repos/${this.owner}/${this.repo}/contents/${path}`,
                {
                    method: 'DELETE',
                    body: JSON.stringify(body)
                }
            );

            return { success: true };
        } catch (error) {
            console.error('[GitHub API] Delete failed:', error);
            throw error;
        }
    }

    // List directory contents
    async listDirectory(path) {
        try {
            const response = await this.request(
                `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`
            );
            return response;
        } catch (error) {
            console.error('[GitHub API] List directory failed:', error);
            throw error;
        }
    }

    // Upload image (binary file)
    async uploadImage(path, imageData, message) {
        try {
            // imageData should already be base64
            const base64Data = imageData.split(',')[1] || imageData;
            
            const body = {
                message,
                content: base64Data,
                branch: this.branch
            };

            const response = await this.request(
                `/repos/${this.owner}/${this.repo}/contents/${path}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(body)
                }
            );

            return {
                success: true,
                url: response.content.download_url,
                path: response.content.path
            };
        } catch (error) {
            console.error('[GitHub API] Image upload failed:', error);
            throw error;
        }
    }

    // Helper: Generate slug from title
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

    // Helper: Format date
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Create poem structure
    async createPoem(poemData) {
        const { title, content, author, description, mediaUrl, postedDate, theme } = poemData;
        const slug = this.slugify(title);
        const date = this.formatDate(postedDate || new Date());

        // Create poem HTML
        const poemHTML = this.generatePoemHTML(title, content, author, description, date, mediaUrl);
        
        // Create poem directory files
        const basePath = `poetry/${slug}`;
        
        try {
            // Create index.html
            await this.createOrUpdateFile(
                `${basePath}/index.html`,
                poemHTML,
                `[Poetry] Add new poem: ${title}`
            );

            // Create themed CSS
            const css = this.generatePoemCSS(theme || 'Dark Galaxy');
            await this.createOrUpdateFile(
                `${basePath}/style.css`,
                css,
                `[Poetry] Add styles for poem: ${title}`
            );

            // Create basic JS
            const js = this.generatePoemJS();
            await this.createOrUpdateFile(
                `${basePath}/script.js`,
                js,
                `[Poetry] Add script for poem: ${title}`
            );

            // Update poetry index
            await this.updatePoetryIndex(title, slug, description, date);

            return {
                success: true,
                path: basePath,
                url: `https://${this.owner}.github.io/${this.repo}/poetry/${encodeURIComponent(slug)}/`
            };
        } catch (error) {
            console.error('[GitHub API] Create poem failed:', error);
            throw error;
        }
    }

    // Generate poem HTML
    generatePoemHTML(title, content, author, description, date, mediaUrl) {
        const authorName = author || 'prasiddha';
        const desc = description || `A beautiful poem by ${authorName}`;
        
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
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://prasiddhasubedi.github.io/byprasiddha/poetry/${encodeURIComponent(title)}/">
  <meta property="og:title" content="${title} - Prasiddha Subedi">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${mediaUrl || 'https://prasiddhasubedi.github.io/byprasiddha/og-image.jpg'}">
  
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="../../css/engagement.css">
</head>
<body>
  <div class="cosmic-windows">
    <div class="window"></div>
    <div class="window"></div>
    <div class="window"></div>
    <div class="window"></div>
  </div>

  <div class="container">
    <header class="title-section">
      <h1 class="main-title">${title}</h1>
      <div class="author-signature">${authorName}</div>
      <div class="poem-date">${date}</div>
    </header>

    <main class="poetry-content">
      <div class="poem-text">
        ${this.formatPoemContent(content)}
      </div>
    </main>

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
        <button id="like-button" aria-label="Like this poem">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          Like
        </button>
      </div>

      <div class="share-section">
        <h3>Share this poem</h3>
        <div class="share-buttons">
          <button class="share-button twitter" data-share="twitter">Twitter</button>
          <button class="share-button facebook" data-share="facebook">Facebook</button>
          <button class="share-button whatsapp" data-share="whatsapp">WhatsApp</button>
        </div>
      </div>
    </div>

    <a href="../index.html" class="back-link">← Back to Poetry</a>
  </div>

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
  
  <script src="../../js/firebase-config.js"></script>
  <script src="../../js/firebase-engagement.js"></script>
  <script src="script.js"></script>
</body>
</html>`;
    }

    // Format poem content into stanzas
    formatPoemContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        let html = '';
        let stanza = [];

        lines.forEach((line, index) => {
            if (line.trim() === '' || line.trim() === '\n') {
                if (stanza.length > 0) {
                    html += `<div class="stanza">\n${stanza.map(l => `  <p class="verse">${l}</p>`).join('\n')}\n</div>\n\n`;
                    stanza = [];
                }
            } else {
                stanza.push(line.trim());
            }
        });

        // Add remaining stanza
        if (stanza.length > 0) {
            html += `<div class="stanza">\n${stanza.map(l => `  <p class="verse">${l}</p>`).join('\n')}\n</div>`;
        }

        return html;
    }

    // Generate poem CSS
    generatePoemCSS(theme = 'Dark Galaxy') {
        // Define theme configurations
        const themes = {
            'Dark Galaxy': {
                bodyBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                textColor: '#e8e8e8',
                titleColor: '#93c5fd',
                accentColor: '#9db4d4',
                windowGradient: 'radial-gradient(circle, rgba(147, 197, 253, 0.1) 0%, transparent 70%)',
                borderColor: 'rgba(147, 197, 253, 0.3)',
                linkBg: 'rgba(147, 197, 253, 0.1)',
                linkBgHover: 'rgba(147, 197, 253, 0.2)',
                linkColor: '#93c5fd'
            },
            'Light Elegance': {
                bodyBg: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                textColor: '#333333',
                titleColor: '#2c3e50',
                accentColor: '#7f8c8d',
                windowGradient: 'radial-gradient(circle, rgba(52, 73, 94, 0.05) 0%, transparent 70%)',
                borderColor: 'rgba(52, 73, 94, 0.2)',
                linkBg: 'rgba(52, 73, 94, 0.05)',
                linkBgHover: 'rgba(52, 73, 94, 0.1)',
                linkColor: '#2c3e50'
            },
            'Sepia Classic': {
                bodyBg: 'linear-gradient(135deg, #f4e8d8 0%, #e8d4b8 100%)',
                textColor: '#5a4a3a',
                titleColor: '#8b6f47',
                accentColor: '#9a7b4f',
                windowGradient: 'radial-gradient(circle, rgba(139, 111, 71, 0.08) 0%, transparent 70%)',
                borderColor: 'rgba(139, 111, 71, 0.3)',
                linkBg: 'rgba(139, 111, 71, 0.1)',
                linkBgHover: 'rgba(139, 111, 71, 0.2)',
                linkColor: '#8b6f47'
            },
            'Ocean Breeze': {
                bodyBg: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
                textColor: '#00695c',
                titleColor: '#00838f',
                accentColor: '#00acc1',
                windowGradient: 'radial-gradient(circle, rgba(0, 131, 143, 0.1) 0%, transparent 70%)',
                borderColor: 'rgba(0, 131, 143, 0.3)',
                linkBg: 'rgba(0, 131, 143, 0.1)',
                linkBgHover: 'rgba(0, 131, 143, 0.2)',
                linkColor: '#00838f'
            },
            'Forest Green': {
                bodyBg: 'linear-gradient(135deg, #2d4a2b 0%, #1b2f1a 100%)',
                textColor: '#d4e4d3',
                titleColor: '#81c784',
                accentColor: '#a5d6a7',
                windowGradient: 'radial-gradient(circle, rgba(129, 199, 132, 0.1) 0%, transparent 70%)',
                borderColor: 'rgba(129, 199, 132, 0.3)',
                linkBg: 'rgba(129, 199, 132, 0.1)',
                linkBgHover: 'rgba(129, 199, 132, 0.2)',
                linkColor: '#81c784'
            },
            'Sunset Glow': {
                bodyBg: 'linear-gradient(135deg, #ff6f61 0%, #d84315 100%)',
                textColor: '#fff3e0',
                titleColor: '#ffccbc',
                accentColor: '#ffab91',
                windowGradient: 'radial-gradient(circle, rgba(255, 204, 188, 0.15) 0%, transparent 70%)',
                borderColor: 'rgba(255, 204, 188, 0.4)',
                linkBg: 'rgba(255, 204, 188, 0.15)',
                linkBgHover: 'rgba(255, 204, 188, 0.25)',
                linkColor: '#ffccbc'
            },
            'Midnight Purple': {
                bodyBg: 'linear-gradient(135deg, #1a0033 0%, #2d1b4e 100%)',
                textColor: '#e1d5f0',
                titleColor: '#ce93d8',
                accentColor: '#ba68c8',
                windowGradient: 'radial-gradient(circle, rgba(206, 147, 216, 0.1) 0%, transparent 70%)',
                borderColor: 'rgba(206, 147, 216, 0.3)',
                linkBg: 'rgba(206, 147, 216, 0.1)',
                linkBgHover: 'rgba(206, 147, 216, 0.2)',
                linkColor: '#ce93d8'
            },
            'Rose Gold': {
                bodyBg: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)',
                textColor: '#5d4e60',
                titleColor: '#c2185b',
                accentColor: '#d81b60',
                windowGradient: 'radial-gradient(circle, rgba(194, 24, 91, 0.08) 0%, transparent 70%)',
                borderColor: 'rgba(194, 24, 91, 0.25)',
                linkBg: 'rgba(194, 24, 91, 0.08)',
                linkBgHover: 'rgba(194, 24, 91, 0.15)',
                linkColor: '#c2185b'
            },
            'Monochrome': {
                bodyBg: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                textColor: '#ffffff',
                titleColor: '#ffffff',
                accentColor: '#cccccc',
                windowGradient: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                linkBg: 'rgba(255, 255, 255, 0.1)',
                linkBgHover: 'rgba(255, 255, 255, 0.2)',
                linkColor: '#ffffff'
            },
            'Autumn Leaves': {
                bodyBg: 'linear-gradient(135deg, #8b4513 0%, #d2691e 100%)',
                textColor: '#fff8dc',
                titleColor: '#ffa500',
                accentColor: '#ffb347',
                windowGradient: 'radial-gradient(circle, rgba(255, 165, 0, 0.1) 0%, transparent 70%)',
                borderColor: 'rgba(255, 165, 0, 0.35)',
                linkBg: 'rgba(255, 165, 0, 0.15)',
                linkBgHover: 'rgba(255, 165, 0, 0.25)',
                linkColor: '#ffa500'
            },
            'Arctic Ice': {
                bodyBg: 'linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%)',
                textColor: '#01579b',
                titleColor: '#0277bd',
                accentColor: '#0288d1',
                windowGradient: 'radial-gradient(circle, rgba(2, 119, 189, 0.08) 0%, transparent 70%)',
                borderColor: 'rgba(2, 119, 189, 0.25)',
                linkBg: 'rgba(2, 119, 189, 0.08)',
                linkBgHover: 'rgba(2, 119, 189, 0.15)',
                linkColor: '#0277bd'
            },
            'Cherry Blossom': {
                bodyBg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
                textColor: '#4a148c',
                titleColor: '#c2185b',
                accentColor: '#e91e63',
                windowGradient: 'radial-gradient(circle, rgba(194, 24, 91, 0.08) 0%, transparent 70%)',
                borderColor: 'rgba(194, 24, 91, 0.25)',
                linkBg: 'rgba(194, 24, 91, 0.08)',
                linkBgHover: 'rgba(194, 24, 91, 0.15)',
                linkColor: '#c2185b'
            }
        };
        
        const selectedTheme = themes[theme] || themes['Dark Galaxy'];
        
        return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Georgia', serif;
  background: ${selectedTheme.bodyBg};
  color: ${selectedTheme.textColor};
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

.cosmic-windows {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.window {
  position: absolute;
  width: 100px;
  height: 100px;
  background: ${selectedTheme.windowGradient};
  border-radius: 50%;
  animation: float 20s infinite ease-in-out;
}

.window:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.window:nth-child(2) { top: 60%; right: 15%; animation-delay: 5s; }
.window:nth-child(3) { bottom: 20%; left: 20%; animation-delay: 10s; }
.window:nth-child(4) { top: 40%; right: 30%; animation-delay: 15s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-30px) scale(1.1); opacity: 0.6; }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

.title-section {
  text-align: center;
  margin-bottom: 60px;
  padding-bottom: 30px;
  border-bottom: 2px solid ${selectedTheme.borderColor};
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  color: ${selectedTheme.titleColor};
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.author-signature {
  font-size: 1.2rem;
  color: ${selectedTheme.accentColor};
  font-style: italic;
  margin-top: 10px;
}

.poem-date {
  color: ${selectedTheme.accentColor};
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-style: italic;
}

.poetry-content {
  margin: 40px 0;
}

.stanza {
  margin-bottom: 30px;
  line-height: 2;
}

.verse {
  font-size: 1.2rem;
  color: ${selectedTheme.textColor};
  margin-bottom: 8px;
  text-align: left;
  padding-left: 20px;
}

.back-link {
  display: inline-block;
  margin-top: 40px;
  padding: 12px 24px;
  background: ${selectedTheme.linkBg};
  color: ${selectedTheme.linkColor};
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid ${selectedTheme.borderColor};
}

.back-link:hover {
  background: ${selectedTheme.linkBgHover};
  transform: translateX(-5px);
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  
  .verse {
    font-size: 1rem;
    padding-left: 10px;
  }
}`;
    }

    // Generate poem JS
    generatePoemJS() {
        return `// Poetry page initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Poetry page loaded');
    
    // Add any custom animations or interactions here
});`;
    }

    // Update poetry index page
    async updatePoetryIndex(title, slug, description, date) {
        try {
            // Get current index file
            const indexFile = await this.getFile('poetry/index.html');
            
            if (!indexFile) {
                throw new Error('Poetry index not found');
            }

            let content = indexFile.content;
            
            // Find the poetry list
            const listStart = content.indexOf('<ul id="poetry-list">');
            const listEnd = content.indexOf('</ul>', listStart);
            
            if (listStart === -1 || listEnd === -1) {
                throw new Error('Could not find poetry list in index');
            }

            // Create new list item
            const encodedSlug = encodeURIComponent(slug);
            const newItem = `                    <li data-aos="fade-up" data-aos-delay="50">
                        <a href="${encodedSlug}/index.html">${title}</a>
                        <p style="color: #666; margin-top: 5px; font-size: 0.95rem;">${description}</p>
                        <p style="color: #999; margin-top: 3px; font-size: 0.85rem;">📅 ${date}</p>
                    </li>\n`;

            // Insert at the beginning of the list
            const insertPos = listStart + '<ul id="poetry-list">'.length + 1;
            content = content.slice(0, insertPos) + newItem + content.slice(insertPos);

            // Update the file
            await this.createOrUpdateFile(
                'poetry/index.html',
                content,
                `[Poetry] Update poetry index - Add "${title}"`,
                indexFile.sha
            );

            return { success: true };
        } catch (error) {
            console.error('[GitHub API] Update poetry index failed:', error);
            throw error;
        }
    }
}

// Export instance
const githubAPI = new GitHubAPI();
