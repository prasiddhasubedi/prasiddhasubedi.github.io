# Firebase Engagement Features - Testing Checklist

This document provides step-by-step instructions for testing all engagement features.

## Pre-Testing Setup

### 1. Verify Firebase Project Configuration

- [ ] Firebase project created at console.firebase.google.com
- [ ] Firestore Database enabled and in production mode
- [ ] Firebase Analytics enabled
- [ ] Web app registered in Firebase project
- [ ] Firebase configuration copied to `js/firebase-config.js`

### 2. Verify Firestore Rules

Recommended: Start with testing rules, then upgrade to production rules after verifying functionality.

**Testing Rules (Use First):**

ℹ️ **Note:** Read access is public (`if true`) by design - this is a public website that needs to display engagement stats to all visitors. Write operations are restricted and validated.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      // Public read access (required for displaying stats on public website)
      allow read: if true;
      // Create only with valid structure
      allow create: if request.resource.data.slug is string
                    && request.resource.data.views is number
                    && request.resource.data.likes is number
                    && request.resource.data.comments is list;
      // Update only allowed fields
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['views', 'likes', 'comments', 'lastViewed']);
    }
  }
}
```

- [ ] Firestore rules configured in Firebase Console
- [ ] Rules published successfully

### 3. Prepare Testing Environment

- [ ] Modern web browser installed (Chrome, Firefox, Edge, or Safari)
- [ ] Developer tools access (F12 or Cmd+Option+I)
- [ ] Internet connection active
- [ ] Firebase Console open in another tab

---

## Testing Procedure

## Test 1: Page Load and View Counter

### Objective
Verify that Firebase initializes correctly and tracks page views.

### Steps
1. [ ] Open any poetry page (e.g., "IF STARS HAD WINDOWS")
2. [ ] Open browser console (F12)
3. [ ] Observe console output

### Expected Results
- [ ] See: `[FIREBASE] Starting engagement features initialization...`
- [ ] See: `[FIREBASE] ✓ App initialized successfully`
- [ ] See: `[FIREBASE] ✓ Firestore initialized successfully`
- [ ] See: `[FIREBASE] ✓ Analytics initialized successfully`
- [ ] See: `[FIREBASE] Tracking page view for slug: ...`
- [ ] See: `[FIREBASE] ✓ New page document created successfully` (first visit)
- [ ] OR: `[FIREBASE] ✓ View count incremented successfully` (subsequent visits)
- [ ] See: `[FIREBASE] ✓✓✓ All engagement features initialized successfully ✓✓✓`
- [ ] View counter shows a number (should be 1 on first visit)
- [ ] No red error messages in console

### Firebase Console Verification
1. [ ] Open Firebase Console → Firestore Database
2. [ ] See 'pages' collection created
3. [ ] See document with name matching page slug
4. [ ] Document has fields: slug, views, likes, comments, createdAt, lastViewed
5. [ ] views = 1 (or higher on subsequent tests)

### Troubleshooting
If test fails:
- Check console for error messages
- Verify firebase-config.js has correct credentials
- Try permissive Firestore rules (see TROUBLESHOOTING.md)
- Check Network tab for failed requests

---

## Test 2: View Counter Increment

### Objective
Verify that view counter increments on each page reload.

### Steps
1. [ ] Note current view count
2. [ ] Refresh the page (Ctrl+R or Cmd+R)
3. [ ] Observe console output
4. [ ] Check view counter

### Expected Results
- [ ] See: `[FIREBASE] Document exists, incrementing view count...`
- [ ] See: `[FIREBASE] ✓ View count incremented successfully`
- [ ] See: `[FIREBASE] Current view count: X` (where X = previous count + 1)
- [ ] View counter in UI shows incremented number
- [ ] No errors in console

### Firebase Console Verification
1. [ ] Refresh Firestore document view
2. [ ] views field has incremented
3. [ ] lastViewed timestamp updated

---

## Test 3: Like Button (First Click)

### Objective
Verify like button functionality and localStorage tracking.

### Steps
1. [ ] Locate like button on page
2. [ ] Note current like count
3. [ ] Click like button once
4. [ ] Observe console output and UI changes

### Expected Results
- [ ] See: `[FIREBASE] Like button clicked for slug: ...`
- [ ] See: `[FIREBASE] Incrementing like count...`
- [ ] See: `[FIREBASE] ✓ Like count incremented successfully`
- [ ] See: `[FIREBASE] Marked as liked in localStorage`
- [ ] See: `[FIREBASE] Current like count: X`
- [ ] Green notification: "Thank you for liking this page!"
- [ ] Like button changes color (gradient pink/red)
- [ ] Like button becomes disabled
- [ ] Like button shows filled heart icon
- [ ] Like count increments by 1

### Firebase Console Verification
1. [ ] Refresh Firestore document view
2. [ ] likes field has incremented by 1

### localStorage Verification
Open console and run:
```javascript
Object.keys(localStorage).filter(k => k.startsWith('liked_'))
```
- [ ] See entry for current page slug

---

## Test 4: Like Button (Duplicate Prevention)

### Objective
Verify that like button prevents multiple likes from same browser.

### Steps
1. [ ] Try clicking like button again (should be disabled)
2. [ ] Refresh page
3. [ ] Try clicking like button

### Expected Results
- [ ] Button remains disabled after page refresh
- [ ] If somehow clicked: See notification "You already liked this page!"
- [ ] Like count does NOT increment
- [ ] Button shows filled heart and different color

---

## Test 5: Like Button (New Browser)

### Objective
Verify like button works in incognito/different browser.

### Steps
1. [ ] Open page in incognito window (Ctrl+Shift+N or Cmd+Shift+N)
2. [ ] Click like button

### Expected Results
- [ ] Like button is active (not disabled)
- [ ] Like button works normally
- [ ] Like count increments
- [ ] New localStorage entry created in incognito session

---

## Test 6: Comment System - Validation

### Objective
Verify comment form validation works correctly.

### Steps
1. [ ] Try submitting empty comment
2. [ ] Type 1-2 characters and submit
3. [ ] Type exactly 3 characters and submit

### Expected Results

**Empty comment:**
- [ ] Form validation prevents submission (HTML5 required attribute)

**Too short (< 3 characters):**
- [ ] See: `[FIREBASE] Comment too short: X characters`
- [ ] Red notification: "Comment must be at least 3 characters"
- [ ] Comment NOT added

**Valid length (≥ 3 characters):**
- [ ] Comment submission proceeds (tested in next test)

---

## Test 7: Comment System - Adding Comments

### Objective
Verify comments are saved and displayed correctly.

### Steps
1. [ ] Enter name: "Test User" (optional field)
2. [ ] Enter comment: "This is a test comment."
3. [ ] Click "Post Comment" button
4. [ ] Observe console output

### Expected Results
- [ ] See: `[FIREBASE] Adding comment: {name: "Test User", textLength: ...}`
- [ ] See: `[FIREBASE] Saving comment to Firestore...`
- [ ] See: `[FIREBASE] ✓ Comment saved successfully`
- [ ] See: `[FIREBASE] Reloading comments...`
- [ ] Green notification: "Comment added successfully!"
- [ ] Form clears automatically
- [ ] Button shows "Posting..." briefly then returns to "Post Comment"
- [ ] Comment appears in list below
- [ ] Comment shows: name, text, timestamp
- [ ] Comment count increments

### Firebase Console Verification
1. [ ] Refresh Firestore document view
2. [ ] comments array contains new comment object
3. [ ] Comment has: name, text, timestamp fields

---

## Test 8: Comment System - Anonymous Comments

### Objective
Verify anonymous comments (no name) work correctly.

### Steps
1. [ ] Leave name field empty
2. [ ] Enter comment text: "Anonymous test comment"
3. [ ] Submit comment

### Expected Results
- [ ] Comment saves successfully
- [ ] Comment displays with author name "Anonymous"
- [ ] All other functionality works as expected

---

## Test 9: Comment System - Display Order

### Objective
Verify comments display in chronological order.

### Steps
1. [ ] Add 2-3 comments with different content
2. [ ] Observe order in UI
3. [ ] Check Firebase Console

### Expected Results
- [ ] Comments appear in chronological order (oldest first)
- [ ] Each comment has visible timestamp
- [ ] All comments display correctly

---

## Test 10: Social Sharing - Twitter

### Objective
Verify Twitter sharing generates correct URL.

### Steps
1. [ ] Click Twitter share button
2. [ ] Observe console output
3. [ ] Check opened window/tab

### Expected Results
- [ ] See: `[FIREBASE] Share button clicked for platform: twitter`
- [ ] See: `[FIREBASE] Share URL generated: https://twitter.com/intent/tweet?url=...`
- [ ] See: `[FIREBASE] ✓ Analytics event logged: share - twitter`
- [ ] Blue notification: "Sharing via twitter"
- [ ] New window opens with Twitter share dialog
- [ ] URL includes current page URL and title
- [ ] No errors in console

---

## Test 11: Social Sharing - Facebook

### Objective
Verify Facebook sharing generates correct URL.

### Steps
1. [ ] Click Facebook share button
2. [ ] Observe console output
3. [ ] Check opened window/tab

### Expected Results
- [ ] See: `[FIREBASE] Share button clicked for platform: facebook`
- [ ] New window opens with Facebook share dialog
- [ ] URL includes current page URL
- [ ] Analytics event logged
- [ ] Notification shows

---

## Test 12: Social Sharing - WhatsApp

### Objective
Verify WhatsApp sharing generates correct URL.

### Steps
1. [ ] Click WhatsApp share button
2. [ ] Observe console output
3. [ ] Check opened window/tab

### Expected Results
- [ ] See: `[FIREBASE] Share button clicked for platform: whatsapp`
- [ ] New window opens with WhatsApp share dialog
- [ ] URL includes current page URL and title
- [ ] Analytics event logged
- [ ] Notification shows

---

## Test 13: Firebase Analytics - Events

### Objective
Verify all analytics events are logged correctly.

### Steps
1. [ ] Enable DebugView in Firebase Console
2. [ ] Add `?debug_mode=true` to page URL
3. [ ] Perform actions: view page, like, comment, share
4. [ ] Check DebugView in Firebase Console

### Expected Results

**Console logs:**
- [ ] See: `[FIREBASE] ✓ Analytics event logged: page_view`
- [ ] See: `[FIREBASE] ✓ Analytics event logged: like`
- [ ] See: `[FIREBASE] ✓ Analytics event logged: comment`
- [ ] See: `[FIREBASE] ✓ Analytics event logged: share - [platform]`

**Firebase Console DebugView:**
- [ ] page_view event appears with page_path and page_title
- [ ] like event appears with page_path
- [ ] comment event appears with page_path
- [ ] share event appears with method, content_type, item_id

**Note:** Regular Analytics (without debug mode) may take 24-48 hours to show data.

---

## Test 14: Error Handling - Network Offline

### Objective
Verify graceful error handling when network is unavailable.

### Steps
1. [ ] Open DevTools → Network tab
2. [ ] Set to "Offline" mode
3. [ ] Refresh page
4. [ ] Try clicking like button
5. [ ] Try submitting comment

### Expected Results
- [ ] Page loads normally (static content)
- [ ] Firebase initialization fails gracefully
- [ ] See warning: `[FIREBASE] Engagement features disabled`
- [ ] UI shows but with 0 counts
- [ ] Like button shows error notification if clicked
- [ ] Comment submission shows error notification
- [ ] No JavaScript errors that break the page
- [ ] Rest of page remains functional

---

## Test 15: Multiple Pages

### Objective
Verify each poetry page works independently.

### Steps
1. [ ] Test another poetry page
2. [ ] Verify it gets its own Firestore document
3. [ ] Verify localStorage tracks likes separately

### Expected Results
- [ ] Each page has its own slug
- [ ] Each page creates/updates its own Firestore document
- [ ] Like status is tracked per page
- [ ] View/like/comment counts are independent

### Firebase Console Verification
- [ ] Multiple documents in 'pages' collection
- [ ] Each document has correct slug matching page path

---

## Test 16: Cross-Browser Compatibility

### Objective
Test in multiple browsers.

### Browsers to Test
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (Mac only)
- [ ] Edge

### Expected Results
- [ ] All features work in all browsers
- [ ] No console errors
- [ ] UI displays correctly
- [ ] localStorage works properly

---

## Test 17: Mobile Responsiveness

### Objective
Verify features work on mobile devices.

### Steps
1. [ ] Open DevTools → Toggle device toolbar
2. [ ] Select mobile device
3. [ ] Test all features

### Expected Results
- [ ] Engagement container displays properly
- [ ] Stats bar wraps appropriately
- [ ] Buttons are touch-friendly
- [ ] Forms are usable
- [ ] Comments display well
- [ ] No horizontal scrolling

---

## Post-Testing Verification

### Firestore Data Structure Check
In Firebase Console, verify a document has this structure:
```javascript
{
  slug: "poetry/IF-STARS-HAD-WINDOWS",
  views: <number>,
  likes: <number>,
  comments: [
    {
      name: <string>,
      text: <string>,
      timestamp: <Timestamp>
    }
  ],
  createdAt: <Timestamp>,
  lastViewed: <Timestamp>
}
```

- [ ] All fields present
- [ ] Types are correct
- [ ] Timestamps are valid

### Analytics Verification
- [ ] Events appear in DebugView (with ?debug_mode=true)
- [ ] Event parameters are correct
- [ ] No error events logged

### Security Verification
- [ ] Firebase config not exposed in git repository
- [ ] Firestore rules restrict operations appropriately
- [ ] No sensitive data in console logs (except expected debug info)

---

## Common Issues Reference

| Issue | Console Message | Solution |
|-------|----------------|----------|
| Firebase not loading | `Firebase SDK not loaded` | Check SDK script tags, internet connection |
| Permission denied | `permission-denied` | Update Firestore rules, see TROUBLESHOOTING.md |
| Document not found | `not-found` | Visit page first to create document |
| Config error | Initialization error | Verify firebase-config.js credentials |
| Like not saving | Update failed | Check Firestore rules, see console for details |
| Comment not saving | Comment too short/long | Check validation, see TROUBLESHOOTING.md |

For detailed troubleshooting, see **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

---

## Sign-off

Once all tests pass:

- [ ] All 17 tests completed successfully
- [ ] No console errors observed
- [ ] Firestore data structure correct
- [ ] Analytics events logging properly
- [ ] Features work across browsers
- [ ] Mobile responsive
- [ ] Documentation reviewed
- [ ] Production Firestore rules applied (if desired)

**Tested by:** ___________________  
**Date:** ___________________  
**Notes:** ___________________

---

## Next Steps After Testing

1. **Monitor Firebase Usage:**
   - Check Firestore reads/writes in Firebase Console
   - Ensure staying within free tier limits
   - Monitor Analytics for user engagement

2. **Apply Production Rules:**
   - After confirming everything works
   - Apply stricter Firestore rules from FIREBASE_SETUP.md
   - Re-test critical features

3. **Documentation:**
   - Update any specific findings
   - Note any browser-specific quirks
   - Document any customizations

4. **Maintenance:**
   - Regularly check Firebase Console for unusual activity
   - Review Analytics data monthly
   - Update Firebase SDK periodically
