# Sitemap Generation Guide

This guide explains how to maintain and regenerate the sitemap.xml file for optimal SEO.

## Overview

The sitemap.xml file helps search engines discover and index all pages on the website. It's generated automatically using a Node.js script that scans the poetry directory and creates entries for all poem pages.

## When to Regenerate the Sitemap

You should regenerate the sitemap whenever:
- ✅ You add a new poem to the `/poetry/` directory
- ✅ You remove a poem from the `/poetry/` directory
- ✅ You make structural changes to the website
- ✅ You want to update the lastmod dates to signal freshness to search engines

## How to Regenerate the Sitemap

### Manual Regeneration

Run the following command from the root of the repository:

```bash
node scripts/generate-sitemap.js
```

The script will:
1. Scan the `/poetry/` directory for all poem subdirectories
2. Check that each directory contains an `index.html` file
3. Generate properly encoded URLs for poems with spaces or special characters
4. Create/update `sitemap.xml` at the root with all pages
5. Output a summary of URLs included

### What's Included in the Sitemap

The generated sitemap includes:
- **Homepage** (`/`) - Priority: 1.0, Changefreq: weekly
- **Poetry Index** (`/poetry/`) - Priority: 0.9, Changefreq: weekly
- **All Poem Pages** (`/poetry/[poem-name]/`) - Priority: 0.8, Changefreq: monthly

## Automated Regeneration (Optional)

### Using GitHub Actions

You can automate sitemap generation by creating a GitHub Actions workflow. Create `.github/workflows/generate-sitemap.yml`:

```yaml
name: Generate Sitemap

on:
  push:
    branches:
      - main
    paths:
      - 'poetry/**'
  workflow_dispatch:  # Allow manual trigger

jobs:
  generate-sitemap:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Generate sitemap
        run: node scripts/generate-sitemap.js
      
      - name: Commit and push if changed
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add sitemap.xml
          git diff --quiet && git diff --staged --quiet || (git commit -m "Update sitemap.xml" && git push)
```

This workflow will:
- Run automatically when changes are made to the poetry directory
- Can be triggered manually from the Actions tab
- Commit and push the updated sitemap.xml if it changes

## File Structure

```
/
├── sitemap.xml              # Generated sitemap (do not edit manually)
├── robots.txt               # Robots directives (references sitemap)
├── scripts/
│   └── generate-sitemap.js  # Sitemap generator script
└── poetry/
    ├── index.html
    ├── poem-syndrome/
    │   └── index.html
    ├── MAYBE SOMEDAY/
    │   └── index.html
    └── ...
```

## Technical Details

### URL Encoding

The script properly encodes URLs with:
- Spaces → `%20`
- Commas → `%2C`
- Other special characters as needed

Example: `NEEDS, A HUMAN DOES` → `NEEDS%2C%20A%20HUMAN%20DOES`

### Domain Configuration

The script uses the canonical domain defined in `CNAME`:
```
https://prasiddhasubedi1.com.np
```

If you change the domain, update the `DOMAIN` constant in `scripts/generate-sitemap.js`.

### Date Format

All `<lastmod>` entries use the ISO 8601 format (YYYY-MM-DD) based on the generation date.

## Verification

After generating the sitemap, verify it's correct:

1. **Check the file exists:**
   ```bash
   ls -la sitemap.xml
   ```

2. **View the contents:**
   ```bash
   cat sitemap.xml
   ```

3. **Validate XML syntax:**
   ```bash
   xmllint --noout sitemap.xml
   ```
   (or use an online validator like https://www.xml-sitemaps.com/validate-xml-sitemap.html)

4. **Test accessibility:**
   - After deploying, visit: `https://prasiddhasubedi1.com.np/sitemap.xml`
   - Should display the XML sitemap in your browser

## Submitting to Search Engines

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Navigate to **Sitemaps** in the left sidebar
4. Enter `sitemap.xml` and click Submit

### Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Select your site
3. Go to **Sitemaps** section
4. Submit the URL: `https://prasiddhasubedi1.com.np/sitemap.xml`

## Troubleshooting

### Script fails to run

**Error:** `Cannot find module 'fs'`
- **Solution:** This is a Node.js built-in module. Ensure you're running Node.js 12 or higher.

### No poem pages in sitemap

**Problem:** Only homepage and poetry index are included
- **Check:** Each poem directory must contain an `index.html` file
- **Verify:** Run `ls poetry/*/index.html` to see all poem pages

### URLs not properly encoded

**Problem:** Spaces or special characters appear as-is in URLs
- **Check:** The script should handle encoding automatically
- **Verify:** Look for `%20` for spaces, `%2C` for commas in the generated sitemap

### Sitemap not updating

**Problem:** Changes to poetry directory don't reflect in sitemap
- **Solution:** Remember to run `node scripts/generate-sitemap.js` after any changes
- **Alternative:** Set up the GitHub Actions workflow for automatic updates

## Support

For issues or questions:
- Check the script logs when running `node scripts/generate-sitemap.js`
- Validate your sitemap at https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Review [Google's sitemap guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
