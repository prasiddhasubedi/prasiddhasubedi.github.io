# Integration Guide - Firebase Engagement Features

This guide explains how to add engagement features (views, likes, comments, sharing) to your poetry pages.

## Quick Start

### Option 1: Using the Template (Recommended)

1. Open `engagement-template.html`
2. Copy the entire content
3. Paste it into your poetry page HTML before the closing `</body>` tag
4. Add the CSS link in the `<head>` section:
   ```html
   <link rel="stylesheet" href="../../css/engagement.css">
   ```

### Option 2: Manual Integration

Follow the steps below to manually add engagement features.

## Step-by-Step Integration

### 1. Add CSS Link

In the `<head>` section of your HTML file, add:

```html
<link rel="stylesheet" href="../../css/engagement.css">
```

Example:
```html
<head>
  <meta charset="UTF-8">
  <title>Your Poem Title</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="../../css/engagement.css">
</head>
```

### 2. Add Firebase SDK Scripts

Before the closing `</body>` tag, add the Firebase SDK scripts:

```html
<!-- Firebase SDK Scripts -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
```

### 3. Add Engagement Container HTML

Add this HTML structure where you want the engagement features to appear (typically after the poem content):

```html
<div class="engagement-container">
  <!-- Stats Bar -->
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
    
    <div class="stat-item">
      <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="stat-value" id="comment-count">0</span>
      <span class="stat-label">Comments</span>
    </div>
  </div>
  
  <!-- Like Button -->
  <div class="like-section">
    <button id="like-button" aria-label="Like this poem">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      Like
    </button>
  </div>
  
  <!-- Share Buttons -->
  <div class="share-section">
    <h3>Share this poem</h3>
    <div class="share-buttons">
      <button class="share-button twitter" data-share="twitter">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
        </svg>
        Twitter
      </button>
      <button class="share-button facebook" data-share="facebook">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
        Facebook
      </button>
      <button class="share-button whatsapp" data-share="whatsapp">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
        </svg>
        WhatsApp
      </button>
    </div>
  </div>
  
  <!-- Comments Section -->
  <div class="comment-section">
    <h3>Comments <span id="comment-count">0</span></h3>
    
    <form id="comment-form">
      <div class="form-group">
        <label for="comment-name">Name (optional)</label>
        <input type="text" id="comment-name" placeholder="Your name" maxlength="50">
      </div>
      
      <div class="form-group">
        <label for="comment-text">Comment *</label>
        <textarea id="comment-text" placeholder="Share your thoughts..." required minlength="3" maxlength="500" rows="4"></textarea>
        <small style="color: rgba(255, 255, 255, 0.5); font-size: 0.85rem;">
          Min 3 characters, max 500 characters
        </small>
      </div>
      
      <button type="submit">Post Comment</button>
    </form>
    
    <div id="comments-list">
      <p class="engagement-loading">Loading comments</p>
    </div>
  </div>
</div>
```

### 4. Add Engagement Script

After the Firebase SDK scripts and before the closing `</body>` tag, add:

```html
<script src="../../js/firebase-engagement.js"></script>
```

### 5. Complete Example

Here's what your HTML structure should look like:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Poem Title</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="../../css/engagement.css">
</head>
<body>
  <!-- Your poem content here -->
  <div class="container">
    <h1>Your Poem Title</h1>
    <div class="poem-text">
      <!-- Poem verses -->
    </div>
  </div>
  
  <!-- Engagement features -->
  <div class="engagement-container">
    <!-- Copy the engagement HTML from above -->
  </div>
  
  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>
  
  <!-- Your existing scripts -->
  <script src="script.js"></script>
  
  <!-- Engagement script -->
  <script src="../../js/firebase-engagement.js"></script>
</body>
</html>
```

## Customization

### Adjusting Relative Paths

The paths in the example assume your poetry pages are in a structure like:
```
/poetry/POEM_NAME/index.html
```

If your structure is different, adjust the paths accordingly:
- CSS: `../../css/engagement.css` (go up 2 levels to reach css folder)
- JS: `../../js/firebase-engagement.js` (go up 2 levels to reach js folder)
- Firebase SDK: No adjustment needed (uses CDN)

### Styling Customization

You can customize the appearance by overriding CSS variables in your poem's `style.css`:

```css
/* Custom engagement colors */
.engagement-container {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background: rgba(255, 255, 255, 0.05);
}

/* Custom like button color */
#like-button {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## Troubleshooting

### Features Not Appearing

1. Check that all file paths are correct
2. Open browser console (F12) and look for errors
3. Verify Firebase SDK is loading (check Network tab)

### Stats Showing 0

1. Ensure Firebase is properly configured in `firebase-engagement.js`
2. Check that Firestore is enabled in Firebase Console
3. Verify security rules allow reads and writes

### Like Button Not Working

1. Check browser console for errors
2. Verify localStorage is enabled in browser
3. Try clearing localStorage and refreshing

## Next Steps

After integration:
1. Test all features on a single poem page
2. Once confirmed working, add to all poem pages
3. Monitor Firebase Console for data
4. Check Analytics for user engagement metrics

## Support

See `FIREBASE_SETUP.md` for detailed Firebase configuration instructions.
