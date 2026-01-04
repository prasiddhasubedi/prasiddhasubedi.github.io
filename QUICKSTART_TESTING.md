# Quick Start Testing Guide

Quick reference for testing Firebase engagement features.

## 1. One-Time Setup (5 minutes)

```bash
# 1. Verify files exist
ls -la js/firebase-config.js
ls -la js/firebase-engagement.js
ls -la css/engagement.css

# 2. Ensure firebase-config.js has your credentials
cat js/firebase-config.js
```

## 2. Configure Firestore Rules (2 minutes)

Go to Firebase Console → Firestore Database → Rules

**Use these testing-friendly rules first:**

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

## 3. Quick Feature Test (5 minutes)

### Open any poetry page:
```
poetry/IF STARS HAD WINDOWS/index.html
```

### Open browser console (F12)

### Look for these success messages:
```
============================================================
[FIREBASE] ✓ App initialized successfully
[FIREBASE] ✓ Firestore initialized successfully
[FIREBASE] ✓ Analytics initialized successfully
[FIREBASE] ✓ New page document created successfully
[FIREBASE] ✓✓✓ All engagement features initialized successfully ✓✓✓
============================================================
```

### Quick feature checks:
- [ ] View counter shows a number
- [ ] Click like button → see green notification
- [ ] Add comment → see it appear below
- [ ] Click share button → new window opens

## 4. Verify in Firebase Console (2 minutes)

Go to Firebase Console → Firestore Database

**Expected:**
- Collection: `pages`
- Document: `poetry/IF-STARS-HAD-WINDOWS` (or similar)
- Fields: slug, views, likes, comments, createdAt, lastViewed

## Console Commands for Quick Testing

```javascript
// Check Firebase loaded
typeof firebase !== 'undefined'

// Check Firestore initialized  
typeof db !== 'undefined'

// View current config (safe parts)
firebaseConfig.projectId

// Check page slug
window.location.pathname.replace(/^\/|\/$/g, '') || 'home'

// Check liked pages
Object.keys(localStorage).filter(k => k.startsWith('liked_'))

// Clear like status for retesting
localStorage.clear()

// Check view count element
document.getElementById('view-count').textContent

// Check like count element
document.getElementById('like-count').textContent

// Check comment count element
document.getElementById('comment-count').textContent
```

## Troubleshooting Quick Fixes

### Issue: Nothing works, view count shows 0
**Fix:** Check console for errors, verify firebase-config.js exists

### Issue: "permission-denied" error
**Fix:** Update Firestore rules to testing rules above

### Issue: Like button doesn't work
**Fix:** Refresh page first to create document, then try liking

### Issue: Comments don't save
**Fix:** Ensure page document exists (view the page first)

## Expected Console Output

### Successful initialization:
```
[FIREBASE] Starting engagement features initialization...
[FIREBASE] Starting initialization...
[FIREBASE] Config: {projectId: "...", authDomain: "...", hasApiKey: true}
[FIREBASE] ✓ App initialized successfully
[FIREBASE] ✓ Firestore initialized successfully
[FIREBASE] ✓ Analytics initialized successfully
[FIREBASE] Firebase initialized successfully, setting up features...
[FIREBASE] [1/5] Tracking page view...
[FIREBASE] Tracking page view for slug: poetry/IF-STARS-HAD-WINDOWS
[FIREBASE] Page reference created: pages/poetry/IF-STARS-HAD-WINDOWS
[FIREBASE] Fetching document from Firestore...
[FIREBASE] Document exists: false
[FIREBASE] Creating new page document...
[FIREBASE] ✓ New page document created successfully
[FIREBASE] Current view count: 1
[FIREBASE] ✓ Analytics event logged: page_view
[FIREBASE] ✓ Page view tracking completed successfully
[FIREBASE] [2/5] Initializing like button...
[FIREBASE] Current like count: 0
[FIREBASE] [3/5] Loading comments...
[FIREBASE] Document does not exist yet, no comments to load
[FIREBASE] [4/5] Initializing comment form...
[FIREBASE] [5/5] Initializing share buttons...
============================================================
[FIREBASE] ✓✓✓ All engagement features initialized successfully ✓✓✓
[FIREBASE] Features active:
[FIREBASE] • Views counter
[FIREBASE] • Like button
[FIREBASE] • Comment system
[FIREBASE] • Social sharing
[FIREBASE] • Analytics tracking
============================================================
```

### Successful like:
```
[FIREBASE] Like button clicked for slug: poetry/IF-STARS-HAD-WINDOWS
[FIREBASE] Incrementing like count...
[FIREBASE] ✓ Like count incremented successfully
[FIREBASE] Marked as liked in localStorage
[FIREBASE] Fetching updated like count...
[FIREBASE] Current like count: 1
[FIREBASE] ✓ Analytics event logged: like
[FIREBASE] ✓ Like action completed successfully
```

### Successful comment:
```
[FIREBASE] Adding comment: {name: "Test", textLength: 20}
[FIREBASE] Saving comment to Firestore...
[FIREBASE] ✓ Comment saved successfully
[FIREBASE] Reloading comments...
[FIREBASE] Loading comments for slug: poetry/IF-STARS-HAD-WINDOWS
[FIREBASE] Loaded 1 comments
[FIREBASE] ✓ Comments loaded and rendered successfully
[FIREBASE] ✓ Analytics event logged: comment
[FIREBASE] ✓ Comment action completed successfully
```

## Quick Links

- **Full Testing:** See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
- **Troubleshooting:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Setup Guide:** See [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Firebase Console:** https://console.firebase.google.com/

## Success Criteria

✅ **All working if you see:**
- No red errors in console
- View counter > 0
- Like button works once
- Comments can be added and appear
- Share buttons open new windows
- Firestore has 'pages' collection with documents

🎉 **Ready for production!**
