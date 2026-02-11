const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://prasiddhasubedi1.com.np';
const OUTPUT_FILE = path.join(__dirname, '..', 'sitemap.xml');
const POETRY_DIR = path.join(__dirname, '..', 'poetry');

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// URL encode spaces and special characters
function encodeUrl(str) {
  return encodeURIComponent(str).replace(/%2F/g, '/');
}

// Generate XML entry for a URL
function generateUrlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function generateSitemap() {
  const currentDate = getCurrentDate();
  const urls = [];

  // Add homepage
  urls.push(generateUrlEntry(
    `${DOMAIN}/`,
    currentDate,
    'weekly',
    '1.0'
  ));

  // Add poetry index page
  urls.push(generateUrlEntry(
    `${DOMAIN}/poetry/`,
    currentDate,
    'weekly',
    '0.9'
  ));

  // Scan poetry directory for poem subdirectories
  try {
    const items = fs.readdirSync(POETRY_DIR);
    
    items.forEach(item => {
      const itemPath = path.join(POETRY_DIR, item);
      const stats = fs.statSync(itemPath);
      
      // Only process directories (poems)
      if (stats.isDirectory()) {
        // Check if directory contains an index.html file
        const indexPath = path.join(itemPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          // URL encode the poem directory name
          const encodedName = encodeUrl(item);
          urls.push(generateUrlEntry(
            `${DOMAIN}/poetry/${encodedName}/`,
            currentDate,
            'monthly',
            '0.8'
          ));
        }
      }
    });
  } catch (error) {
    console.error('Error reading poetry directory:', error);
    process.exit(1);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  // Write to file
  try {
    fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
    console.log(`✅ Sitemap generated successfully at ${OUTPUT_FILE}`);
    console.log(`📊 Total URLs: ${urls.length}`);
  } catch (error) {
    console.error('Error writing sitemap file:', error);
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  console.log('🚀 Generating sitemap...');
  generateSitemap();
}

module.exports = { generateSitemap };
