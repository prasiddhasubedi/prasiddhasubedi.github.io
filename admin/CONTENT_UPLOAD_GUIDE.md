# Content Upload Instructions

## How Content Upload Works

When you upload content (poems, articles, ebooks) through the admin panel:

1. **Content is saved to localStorage** - The content data is stored in your browser's localStorage
2. **Recently Posted section updates** - The homepage carousel shows your new content
3. **Content counts update** - The statistics on the homepage update automatically
4. **Index pages load dynamically** - The poetry/articles/ebooks index pages load content from localStorage

## Creating Individual Content Pages

Since this is a static GitHub Pages site, individual content pages need to be created manually:

### For Poetry:

1. Create a new folder in `/poetry/` with your poem's title (e.g., `/poetry/My New Poem/`)
2. Copy the template files from `/poetry/Serene Beauty/`:
   - `index.html`
   - `style.css`
   - `script.js`
3. The content will automatically load from localStorage using the folder name as the title

### For Articles:

1. Create a new folder in `/articles/` with your article's title (e.g., `/articles/My Article/`)
2. Copy the template files from `/articles/_template/`:
   - `index.html`
   - `style.css`
   - `script.js`
3. The content will automatically load from localStorage using the folder name as the title

### For Ebooks:

1. Create a new folder in `/ebooks/` with your ebook's title (e.g., `/ebooks/My Book/`)
2. Copy the template files from `/ebooks/_template/`:
   - `index.html`
   - `style.css`
   - `script.js`
3. The content will automatically load from localStorage using the folder name as the title

## Important Notes:

- **Folder names must exactly match the content title** stored in localStorage
- URL encoding will be handled automatically (spaces become `%20` in URLs)
- All content pages use the premium background styling automatically
- Content is loaded dynamically via JavaScript from localStorage
- The same template works for all content of the same type

## Quick Script (For Tech-Savvy Users):

You can use this bash script to quickly create folders for new content:

```bash
# For poetry
mkdir -p "poetry/Your Poem Title"
cp poetry/Serene\ Beauty/{index.html,style.css,script.js} "poetry/Your Poem Title/"

# For articles
mkdir -p "articles/Your Article Title"
cp articles/_template/{index.html,style.css,script.js} "articles/Your Article Title/"

# For ebooks
mkdir -p "ebooks/Your Book Title"
cp ebooks/_template/{index.html,style.css,script.js} "ebooks/Your Book Title/"
```

## Automation Alternative:

For fully automated content page creation, you would need:
1. A server-side component (Node.js, Python, etc.)
2. GitHub API integration to create files programmatically
3. Or a static site generator like Jekyll, Hugo, or Gatsby

The current implementation provides a good balance between ease of use and static hosting limitations.
