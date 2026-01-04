# Firebase Engagement Features

This implementation adds real, persistent engagement features to the static poetry website using Firebase Firestore and Analytics, without requiring any backend server.

## Features

### 1. **Views Counter**
- Atomically increments view counts on page load
- Creates page document if it doesn't exist
- Displays updated count in real-time

### 2. **Like Button**
- Atomically increments like counts on button click
- Prevents multiple likes per browser using localStorage
- Updates UI dynamically after clicking
- Visual feedback with gradient colors

### 3. **Comments System**
- Minimalist comment form with name (optional) and text (required)
- Validates against empty or spam-length comments (3-500 characters)
- Appends comments to Firestore with timestamps
- Loads and renders comments in chronological order
- XSS protection through input sanitization

### 4. **Social Sharing**
- Share buttons for Twitter/X, Facebook, and WhatsApp
- Generates share links using current page URL
- Tracks share events via Firebase Analytics

### 5. **Analytics**
- Logs page view events
- Tracks like events
- Tracks comment events
- Tracks share events with platform information

## Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Enable Google Analytics (recommended)

### Step 2: Register Web App

1. In your Firebase project, click "Add app" and select Web (</>)
2. Register your app with a nickname (e.g., "byprasiddha")
3. Copy the Firebase configuration object

### Step 3: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **production mode**
4. Choose a location closest to your users

### Step 4: Configure Firestore Rules

Set up security rules in Firestore:

#### For Testing (Recommended for Initial Setup)
Use these more permissive rules first to ensure everything works:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pages/{pageId} {
      allow read: if true;
      
      // Allow create with basic structure check
      allow create: if request.resource.data.slug is string
                    && request.resource.data.views is number
                    && request.resource.data.likes is number
                    && request.resource.data.comments is list;
      
      // Allow update to specific fields only
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['views', 'likes', 'comments', 'lastViewed']);
    }
  }
}
```

#### For Production (After Testing)
Once you've verified everything works, upgrade to stricter rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all pages
    match /pages/{pageId} {
      allow read: if true;
      
      // Allow write only for specific fields to prevent abuse
      allow create: if request.resource.data.keys().hasAll(['slug', 'views', 'likes', 'comments', 'createdAt', 'lastViewed'])
                    && request.resource.data.views is number
                    && request.resource.data.likes is number
                    && request.resource.data.comments is list;
      
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['views', 'likes', 'comments', 'lastViewed'])
                    && (request.resource.data.views == resource.data.views + 1
                       || request.resource.data.likes == resource.data.likes + 1
                       || request.resource.data.comments.size() == resource.data.comments.size() + 1);
    }
  }
}
```

These rules:
- Allow anyone to read page data
- Allow creating new page documents with correct structure
- Allow updating only views (increment by 1), likes (increment by 1), or comments (add one)
- Prevent malicious updates or deletions

**Note:** If you have trouble with the strict production rules, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for debugging help.

### Step 5: Enable Analytics

1. In Firebase Console, go to "Analytics"
2. Analytics should already be enabled if you selected it during project creation
3. No additional configuration needed

### Step 6: Update Firebase Configuration

Edit `/js/firebase-engagement.js` and replace the configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

Replace with your actual Firebase configuration from Step 2.

### Step 7: Add to Your Pages

Add the engagement features to your poetry pages by including the following in your HTML:

```html
<!-- Add in <head> section -->
<link rel="stylesheet" href="../../css/engagement.css">

<!-- Add before closing </body> tag -->
<!-- Firebase SDK Scripts -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>

<!-- Engagement Features Container -->
<!-- Copy the HTML from engagement-template.html -->

<!-- Engagement Script -->
<script src="../../js/firebase-engagement.js"></script>
```

## Architecture

### Data Model

Firestore collection: `pages`

Each document represents a page/poem with structure:
```javascript
{
    slug: "poetry/IF-STARS-HAD-WINDOWS",  // Document ID from pathname
    views: 123,                            // Number of views
    likes: 45,                             // Number of likes
    comments: [                            // Array of comments
        {
            name: "John Doe",
            text: "Beautiful poem!",
            timestamp: Timestamp
        }
    ],
    createdAt: Timestamp,                  // When document was created
    lastViewed: Timestamp                  // Last view timestamp
}
```

### Security Features

1. **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
2. **Rate Limiting**: LocalStorage prevents multiple likes from same browser
3. **Validation**: Comments must be 3-500 characters
4. **Firestore Rules**: Server-side rules prevent malicious data manipulation
5. **Error Handling**: Silent failures ensure site remains functional

### Performance Optimizations

1. **Atomic Operations**: Uses Firestore's atomic increment for views and likes
2. **Minimal Reads**: Only reads data when needed
3. **CDN Delivery**: Firebase SDK loaded from Google's CDN
4. **Lazy Loading**: Comments loaded after page renders
5. **Debouncing**: Prevents rapid-fire operations

## Testing

### Local Testing

1. Open a poetry page in your browser
2. Check browser console for initialization messages
3. Test view counter (should increment on page load)
4. Test like button (should work once per browser)
5. Test comments (add a comment and see it appear)
6. Test sharing (should open share dialog)

### Firebase Console Monitoring

1. Go to Firestore Database in Firebase Console
2. Check the `pages` collection for new documents
3. Verify data structure matches expected format
4. Go to Analytics to see event tracking

## Troubleshooting

### Features Not Working

1. Check browser console for errors
2. Verify Firebase configuration is correct
3. Ensure Firestore rules are properly set
4. Check that Firebase SDKs are loading (Network tab)

**For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

### No Data in Firestore

1. Verify Firestore is enabled in Firebase Console
2. Check that security rules allow writes
3. Look for JavaScript errors in console
4. **Try temporary permissive rules for testing** (see TROUBLESHOOTING.md)

**Common Issue:** The strict security rules might block writes during testing. See TROUBLESHOOTING.md for testing-friendly rules.

### Analytics Not Tracking

1. Ensure Analytics is enabled in Firebase Console
2. Check that measurementId is in config
3. Wait 24-48 hours for data to appear in Analytics dashboard
4. **Use DebugView** for real-time testing (add `?debug_mode=true` to URL)

### Debugging Console Logs

The engagement script provides detailed console logging. Open browser console (F12) to see:
- `[FIREBASE] Starting initialization...` - Firebase is loading
- `[FIREBASE] ✓ App initialized successfully` - Firebase connected
- `[FIREBASE] Tracking page view for slug: ...` - View tracking active
- `[FIREBASE] ✓ New page document created successfully` - Document created in Firestore
- `[FIREBASE] ✓✓✓ All engagement features initialized successfully ✓✓✓` - Everything working

**Error messages** will show with ✗ and include detailed error information.

For comprehensive debugging help, see **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

## Cost Considerations

Firebase free tier (Spark Plan) includes:
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day
- **Analytics**: Unlimited events

For a poetry website with moderate traffic, this should be sufficient. Monitor usage in Firebase Console.

### Optimizing Costs

The implementation already includes optimizations:
- Single read on page load for all data
- Atomic increments instead of read-modify-write
- No unnecessary real-time listeners
- Comments loaded once, not continuously

## Files

- `/js/firebase-engagement.js` - Main engagement logic
- `/css/engagement.css` - Engagement UI styles
- `/engagement-template.html` - HTML template for integration
- `/FIREBASE_SETUP.md` - This setup guide

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console logs
3. Verify Firestore rules are correct
4. Ensure Firebase configuration is accurate

## License

This implementation is part of the byprasiddha website project.
