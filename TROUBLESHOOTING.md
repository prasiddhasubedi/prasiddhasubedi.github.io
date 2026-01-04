# Firebase Engagement Features - Troubleshooting Guide

## Quick Reference: Common Issues

### Issue 0: Missing Poem Content (THE SKY BENEATH MY FEET or Other Poems)

**Symptoms:**
- Poem page loads but shows no poem text
- Engagement features (views, likes, comments) might work or not work
- Page shows title and layout but missing stanzas/verses

**Important:** This is usually NOT a Firestore/Firebase issue. The poem content and Firestore engagement data are **separate systems**.

**Two Separate Systems:**
1. **Poem Content** - Loaded from HTML or localStorage (handled by `/js/content-viewer.js`)
2. **Engagement Data** - Stored in Firestore (handled by `/js/firebase-engagement.js`)

**Solutions:**

#### If Poem Text is Missing:
1. **Check the HTML file** - The poem text should be embedded in the HTML:
   - Open `/poetry/THE SKY BENEATH MY FEET/index.html`
   - Look for the poem text in `<div class="poem-text">` section
   - If text is there, it's not a content issue

2. **Check Content Viewer** - The `content-viewer.js` tries to load from localStorage:
   - Open browser console
   - Look for `[ContentViewer]` messages
   - If it says "Content not found", the poem needs to be in localStorage or HTML

3. **Verify Poem Title Matches**:
   - The folder name must match: `THE SKY BENEATH MY FEET`
   - Case-sensitive
   - Spaces matter (not %20 in folder name)

#### If Engagement Features Not Working:
- This IS a Firestore issue
- See the other sections in this guide
- Check Firestore document exists with slug: `poetry/THE SKY BENEATH MY FEET`
- See `FIRESTORE_STRUCTURE.md` for slug requirements

#### Debug Steps:
1. Open browser console (F12)
2. Look for these messages:
   ```
   [ContentViewer] Type: poetry, Title: THE SKY BENEATH MY FEET
   [ContentViewer] Content found: THE SKY BENEATH MY FEET
   ```
3. If you see "Content not found", the poem isn't in localStorage
4. If you see "Content found" but no text appears, check HTML rendering
5. For Firestore issues, look for `[FIREBASE]` messages

**Quick Fix:**
- The poem text is already in the HTML file at `/poetry/THE SKY BENEATH MY FEET/index.html`
- If it's not showing, check for JavaScript errors in console
- The engagement features work independently of poem content

**See Also:**
- `FIRESTORE_STRUCTURE.md` - For Firestore slug and document structure
- Issue 1 below - For Firestore permission issues

---

## Common Issues and Solutions

### Issue 1: Pages Collection Not Created

**Symptoms:**
- View counter shows 0
- No documents appear in Firestore Console under 'pages' collection
- Console shows "Document created" but nothing appears in Firebase

**Possible Causes:**
1. **Firestore Rules Too Restrictive**: The security rules might be blocking writes
2. **Firebase Not Initialized**: Configuration errors prevent Firebase from connecting
3. **Network/CORS Issues**: Browser blocking requests to Firebase

**Solutions:**

#### Step 1: Verify Firebase Initialization
1. Open browser console (F12)
2. Look for these messages:
   ```
   [FIREBASE] Starting initialization...
   [FIREBASE] ✓ App initialized successfully
   [FIREBASE] ✓ Firestore initialized successfully
   ```
3. If you see errors instead, check your Firebase configuration

#### Step 2: Test with Permissive Rules (Temporary Testing Only)

⚠️ **SECURITY WARNING - FOR TESTING ONLY** ⚠️

For debugging, **temporarily** use these more permissive Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      // ⚠️ TEMPORARY: Allow all reads and writes for testing
      // 🚫 NEVER USE IN PRODUCTION
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**⚠️ CRITICAL WARNINGS:**
- These rules allow ANYONE to read/write ALL data
- Use ONLY for initial testing (< 1 hour)
- Replace with production rules immediately after testing
- Monitor Firebase Console while these rules are active
- See step 4 for production-ready rules

#### Step 3: Check Console Logs
Look for detailed Firebase operation logs:
- `[FIREBASE] Tracking page view for slug: ...`
- `[FIREBASE] Creating new page document...`
- `[FIREBASE] ✓ New page document created successfully`

If you see errors like "permission-denied", your Firestore rules are blocking writes.

#### Step 4: Verify Firestore is Enabled
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Ensure database is created and in production mode
4. Check that you're looking at the correct project

### Issue 2: Firestore Rules Blocking Writes

**Problem:** The production rules in FIREBASE_SETUP.md are very strict and might block legitimate writes.

**Issues with Current Rules:**
1. The update rule checks for exact increment by 1, which can fail with concurrent requests
2. Comment timestamps use Date.now() (numeric) instead of serverTimestamp()
3. arrayUnion for comments might not match the size check

**Recommended Testing Rules:**

⚠️ **SECURITY NOTE:** Read access is intentionally public (`if true`) because this is a public website that displays engagement stats to all visitors. Write operations are restricted by structure validation and field restrictions.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      // Allow public read access (required for public website displaying stats)
      allow read: if true;
      
      // Allow create with basic structure check
      allow create: if request.resource.data.slug is string
                    && request.resource.data.views is number
                    && request.resource.data.likes is number
                    && request.resource.data.comments is list;
      
      // Allow update with field restrictions but no increment validation
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['views', 'likes', 'comments', 'lastViewed']);
    }
  }
}
```

### Issue 3: Like Button Not Working

**Symptoms:**
- Can click like multiple times
- Like count doesn't increment
- No localStorage entry created

**Solutions:**
1. Check console for error messages
2. Clear localStorage: `localStorage.clear()` in console
3. Verify page slug is correct: Look for `[FIREBASE] Like button clicked for slug: ...`

### Issue 4: Comments Not Saving

**Symptoms:**
- Comment form submits but nothing appears
- "Failed to add comment" notification

**Common Causes:**
1. **Document doesn't exist yet**: Comments use `update()` which requires existing document
   - Solution: Visit the page first to create the document via view tracking
2. **Firestore rules blocking arrayUnion**: The size check in rules might fail
3. **Comment validation failing**: Check length requirements (3-500 characters)

**Solutions:**
1. Ensure page has been viewed at least once (creates document)
2. Check console for validation errors
3. Temporarily use permissive rules to test

### Issue 5: Analytics Not Tracking

**Symptoms:**
- No events appear in Firebase Analytics
- Console shows analytics initialized but no event logs

**Solutions:**
1. Wait 24-48 hours for data to appear in Analytics dashboard
2. Use DebugView in Firebase Console for real-time testing:
   - Add `?debug_mode=true` to URL
   - Go to Firebase Console → Analytics → DebugView
3. Verify measurementId is in config

### Issue 6: View Counter Not Incrementing

**Symptoms:**
- View count stays at 0 or doesn't change
- Page refreshes don't increment counter

**Solutions:**
1. Check console for detailed tracking logs
2. Verify document creation: `[FIREBASE] New page document created`
3. Check Firestore rules aren't blocking increments
4. Clear browser cache and try again

## Debugging Checklist

Use this checklist to systematically debug issues:

- [ ] Open browser console (F12)
- [ ] Refresh page and check for initialization messages
- [ ] Verify Firebase config is loaded (check for config object in console)
- [ ] Check for any red error messages
- [ ] Go to Firebase Console → Firestore Database
- [ ] Check if 'pages' collection exists
- [ ] If collection exists, check document structure
- [ ] If no collection, temporarily use permissive rules
- [ ] Test again with console open
- [ ] Check Network tab for failed requests
- [ ] Verify you're looking at correct Firebase project

## Testing Procedure

### 1. Basic Functionality Test
```
1. Open any poetry page
2. Open browser console (F12)
3. Refresh page
4. Look for: [FIREBASE] ✓✓✓ All engagement features initialized successfully ✓✓✓
5. Check view counter shows a number > 0
6. Go to Firebase Console → Firestore → pages collection
7. Verify document exists with correct fields
```

### 2. Like Button Test
```
1. Click like button
2. Should show "Thank you for liking this page!" notification
3. Button should change color and be disabled
4. Like count should increment
5. Open new incognito window
6. Visit same page and verify like button is active again
```

### 3. Comment Test
```
1. Fill in comment form (optional name, required text)
2. Click "Post Comment"
3. Should show "Comment added successfully!" notification
4. Comment should appear in list below
5. Go to Firebase Console → Check comments array in document
```

### 4. Share Test
```
1. Click each share button (Twitter, Facebook, WhatsApp)
2. New window should open with share dialog
3. Should show notification "Sharing via [platform]"
4. Check console for analytics event: [FIREBASE] ✓ Analytics event logged: share
```

## Console Commands for Testing

Use these commands in browser console for testing:

```javascript
// Check if Firebase is loaded
console.log('Firebase loaded:', typeof firebase !== 'undefined');

// Check if Firestore is initialized
console.log('Firestore:', window.db);

// Check config
console.log('Config:', window.firebaseConfig);

// Get current page slug
console.log('Page slug:', window.location.pathname.replace(/^\/|\/$/g, '') || 'home');

// Check localStorage for like status
console.log('Liked pages:', Object.keys(localStorage).filter(k => k.startsWith('liked_')));

// Clear like status (for testing)
localStorage.clear();

// Manually test view tracking (if needed)
// Note: This is already called automatically, but useful for debugging
// firebase.firestore().collection('pages').doc('test-slug').set({
//   slug: 'test-slug',
//   views: 1,
//   likes: 0,
//   comments: [],
//   createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//   lastViewed: firebase.firestore.FieldValue.serverTimestamp()
// }).then(() => console.log('Test document created'));
```

## Getting Help

If issues persist after following this guide:

1. **Check browser console** for complete error messages
2. **Check Firebase Console** → Firestore Database for actual data
3. **Check Firebase Console** → Analytics → DebugView (with ?debug_mode=true)
4. **Verify Firestore rules** in Firebase Console → Firestore → Rules
5. **Check Network tab** in browser developer tools for failed requests

## Common Error Messages

### "permission-denied"
- **Cause**: Firestore rules blocking the operation
- **Solution**: Use permissive rules for testing, then refine

### "not-found"
- **Cause**: Trying to update a document that doesn't exist
- **Solution**: Visit page first to create document via view tracking

### "failed-precondition"
- **Cause**: Usually firestore rules validation failed
- **Solution**: Check rules match your data structure exactly

### "unavailable"
- **Cause**: Network issue or Firebase service down
- **Solution**: Check internet connection, try again later

## Production-Ready Rules

Once testing is complete, use these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      allow read: if true;
      
      // Allow create with required fields
      allow create: if request.resource.data.keys().hasAll(['slug', 'views', 'likes', 'comments', 'createdAt', 'lastViewed'])
                    && request.resource.data.slug is string
                    && request.resource.data.views is number
                    && request.resource.data.views >= 0
                    && request.resource.data.likes is number
                    && request.resource.data.likes >= 0
                    && request.resource.data.comments is list;
      
      // Allow update to specific fields only
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['views', 'likes', 'comments', 'lastViewed'])
                    // Views can only increase
                    && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['views'])
                       || request.resource.data.views >= resource.data.views)
                    // Likes can only increase
                    && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['likes'])
                       || request.resource.data.likes >= resource.data.likes)
                    // Comments can only grow
                    && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['comments'])
                       || request.resource.data.comments.size() >= resource.data.comments.size());
    }
  }
}
```

These rules:
- Allow anyone to read
- Validate structure on create
- Allow increments without strict "increment by 1" validation
- Prevent decrementing counters
- Prevent comment deletion
- More lenient but still secure
