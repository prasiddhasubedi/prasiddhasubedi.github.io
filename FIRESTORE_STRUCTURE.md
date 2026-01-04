# Firestore Structure Guide

This document explains the Firestore database structure used for engagement features on the byprasiddha website.

## Overview

The website uses Firestore to store engagement data (views, likes, comments) for poetry pages, articles, and ebooks. The data is organized in a simple, flat collection structure.

## Collection: `pages`

All page engagement data is stored in a single collection called `pages`. Each document represents one page on the website.

### Document Structure

Each document in the `pages` collection has the following structure:

```javascript
{
  slug: string,              // The page identifier from URL path
  views: number,             // Total number of page views
  likes: number,             // Total number of likes
  comments: array,           // Array of comment objects
  createdAt: timestamp,      // When the document was first created
  lastViewed: timestamp      // Last time the page was viewed
}
```

### Field Details

#### `slug` (string, required)
- The unique identifier for the page, derived from the URL pathname
- Automatically generated from the page URL
- Used as the document ID in Firestore

**Examples:**
- For URL `https://example.com/poetry/THE%20SKY%20BENEATH%20MY%20FEET/` → slug: `poetry/THE SKY BENEATH MY FEET`
- For URL `https://example.com/articles/the-art-of-storytelling.html` → slug: `articles/the-art-of-storytelling.html`
- For URL `https://example.com/` → slug: `home`

**Important Notes:**
- URL encoding is decoded (e.g., `%20` becomes space)
- Leading and trailing slashes are removed
- The slug must match exactly for engagement features to work

#### `views` (number, required)
- Total number of times the page has been viewed
- Starts at 1 when document is created (first view)
- Incremented atomically on each page load
- Cannot be negative

#### `likes` (number, required)
- Total number of likes the page has received
- Starts at 0 when document is created
- Incremented atomically when like button is clicked
- Cannot be negative
- Browser localStorage prevents multiple likes from same browser

#### `comments` (array, required)
- Array of comment objects
- Starts as empty array `[]` when document is created
- Comments are appended using Firestore's `arrayUnion()` operation

**Comment Object Structure:**
```javascript
{
  name: string,           // Commenter's name or "Anonymous"
  text: string,           // The comment text (3-500 characters)
  timestamp: number       // Unix timestamp (ms) from Date.now() when comment was posted
}
```

#### `createdAt` (timestamp, required)
- Server timestamp when the document was first created
- Uses `firebase.firestore.FieldValue.serverTimestamp()`
- Set only once during document creation

#### `lastViewed` (timestamp, required)
- Server timestamp of the most recent page view
- Uses `firebase.firestore.FieldValue.serverTimestamp()`
- Updated on every page view

## Document Creation

Documents are created automatically when a page is first visited:

1. User visits a page (e.g., `/poetry/THE SKY BENEATH MY FEET/`)
2. JavaScript extracts the slug from the URL
3. JavaScript checks if document exists in Firestore
4. If not, creates a new document with initial values:
   ```javascript
   {
     slug: "poetry/THE SKY BENEATH MY FEET",
     views: 1,
     likes: 0,
     comments: [],
     createdAt: serverTimestamp,
     lastViewed: serverTimestamp
   }
   ```

## Slug Path Requirements

### Poetry Pages

For poetry pages located at `/poetry/{POEM_TITLE}/index.html`:

- **URL Path:** `/poetry/THE SKY BENEATH MY FEET/`
- **Extracted Slug:** `poetry/THE SKY BENEATH MY FEET`
- **Document ID in Firestore:** `poetry/THE SKY BENEATH MY FEET`

**Important:** 
- The slug uses the decoded folder name (spaces, not `%20`)
- Folder name must match exactly
- Case-sensitive

### Article Pages

For article pages located at `/articles/{article-name}.html`:

- **URL Path:** `/articles/the-art-of-storytelling.html`
- **Extracted Slug:** `articles/the-art-of-storytelling.html`
- **Document ID in Firestore:** `articles/the-art-of-storytelling.html`

### Ebook Pages

For ebook pages located at `/ebooks/{ebook-name}.html`:

- **URL Path:** `/ebooks/beneath-the-surface.html`
- **Extracted Slug:** `ebooks/beneath-the-surface.html`
- **Document ID in Firestore:** `ebooks/beneath-the-surface.html`

## Troubleshooting Missing Content

### Issue: "THE SKY BENEATH MY FEET" Poem Not Loading Content

If a specific poem shows the engagement features but not the actual poem content, this is typically a **different issue** from Firestore:

1. **Content Loading Issue (Not Firestore)**
   - The engagement features (views, likes, comments) are stored in Firestore
   - The actual poem content is loaded from `localStorage` or embedded in the HTML
   - See `/js/content-viewer.js` for content loading logic
   - The poem text should be in the HTML itself (see `/poetry/THE SKY BENEATH MY FEET/index.html`)

2. **Engagement Features Not Working (Firestore Issue)**
   - Check browser console for errors
   - Verify the document exists in Firestore Console
   - Document ID should be: `poetry/THE SKY BENEATH MY FEET`
   - If document doesn't exist, visit the page to auto-create it

### Verifying Firestore Document

To check if a poem page has a Firestore document:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Look for the `pages` collection
5. Search for document ID: `poetry/THE SKY BENEATH MY FEET`

**What to check:**
- ✅ Document exists with correct ID
- ✅ `slug` field matches: `poetry/THE SKY BENEATH MY FEET`
- ✅ `views`, `likes`, and `comments` fields exist
- ✅ Firestore rules allow read/write access

### Manual Document Creation (If Needed)

If auto-creation fails due to permission issues, you can manually create a document:

1. Go to Firestore Database in Firebase Console
2. Click `pages` collection (create if doesn't exist)
3. Add document with ID: `poetry/THE SKY BENEATH MY FEET`
4. Add fields:
   ```
   slug: "poetry/THE SKY BENEATH MY FEET" (string)
   views: 0 (number)
   likes: 0 (number)
   comments: [] (array)
   createdAt: (timestamp - use current time)
   lastViewed: (timestamp - use current time)
   ```

### Common Slug Issues

**Problem:** Engagement features don't work for a page

**Possible Causes:**
1. URL path changed but Firestore document ID didn't update
2. Special characters in folder name not matching
3. Case mismatch (Firestore is case-sensitive)
4. Extra/missing spaces in slug

**Solution:**
1. Check browser console for the slug being used:
   ```
   [FIREBASE] Tracking page view for slug: poetry/THE SKY BENEATH MY FEET
   ```
2. Create or rename Firestore document to match exactly
3. Or rename the folder to match the Firestore document ID

## Security Rules and Permissions

For engagement features to work, your Firestore rules must allow:

1. **Read Access:** Public read access to view stats and comments
2. **Create Access:** Allow creating new page documents
3. **Update Access:** Allow updating views, likes, and comments fields

See `FIREBASE_SETUP.md` for recommended security rules.

### Testing Rules

For testing, use these permissive rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      allow read: if true;
      allow write: if true;  // ⚠️ Only for testing!
    }
  }
}
```

### Production Rules

For production, use validated rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      allow read: if true;
      
      allow create: if request.resource.data.slug is string
                    && request.resource.data.views is number
                    && request.resource.data.likes is number
                    && request.resource.data.comments is list;
      
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['views', 'likes', 'comments', 'lastViewed']);
    }
  }
}
```

## Debugging

### Check Document Exists

Use browser console:
```javascript
// Get current page slug
const slug = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
console.log('Current slug:', slug);

// Check if document exists
firebase.firestore().collection('pages').doc(slug).get()
  .then(doc => {
    if (doc.exists) {
      console.log('Document exists:', doc.data());
    } else {
      console.log('Document does not exist');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### View All Pages

List all documents in pages collection:
```javascript
firebase.firestore().collection('pages').get()
  .then(snapshot => {
    console.log('Total documents:', snapshot.size);
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  });
```

## Best Practices

1. **Always use the auto-creation feature** - Documents are created automatically on first page view
2. **Don't manually modify documents** unless necessary for debugging
3. **Keep slug naming consistent** - Use URL-friendly names (lowercase, hyphens, no special chars when possible)
4. **Monitor Firestore usage** in Firebase Console to stay within free tier limits
5. **Use appropriate security rules** for your environment (testing vs production)

## Related Documentation

- `FIREBASE_SETUP.md` - Initial Firebase setup and configuration
- `TROUBLESHOOTING.md` - Detailed troubleshooting for Firebase issues
- `TESTING_CHECKLIST.md` - Testing procedures for engagement features
