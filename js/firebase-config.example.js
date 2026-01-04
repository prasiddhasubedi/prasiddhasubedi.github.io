// ==========================================
// FIREBASE CONFIGURATION EXAMPLE
// Copy this file to firebase-config.js and fill in your Firebase credentials
// ==========================================

// Replace these values with your actual Firebase project configuration
// Get these from Firebase Console > Project Settings > Your apps > Firebase SDK snippet

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                                    // Your Firebase API key
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",            // Your Firebase auth domain
    projectId: "YOUR_PROJECT_ID",                              // Your Firebase project ID
    storageBucket: "YOUR_PROJECT_ID.appspot.com",             // Your Firebase storage bucket
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",            // Your messaging sender ID
    appId: "YOUR_APP_ID",                                      // Your Firebase app ID
    measurementId: "YOUR_MEASUREMENT_ID"                       // Your Analytics measurement ID (optional)
};

// Example of what a real config looks like (these are fake values):
/*
const firebaseConfig = {
    apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuv",
    authDomain: "my-poetry-site.firebaseapp.com",
    projectId: "my-poetry-site",
    storageBucket: "my-poetry-site.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef",
    measurementId: "G-ABCDEFGHIJ"
};
*/

// Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Click on the gear icon (⚙️) > Project settings
// 4. Scroll down to "Your apps" section
// 5. If you haven't registered a web app, click "Add app" and select web (</>)
// 6. Copy the config object from the Firebase SDK snippet
// 7. Replace the values above with your actual configuration
// 8. Rename this file to firebase-config.js (remove .example)
// 9. Never commit firebase-config.js to git (it's in .gitignore)
