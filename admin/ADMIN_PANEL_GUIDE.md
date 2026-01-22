# Admin Panel User Guide

## Welcome to Your Personal CMS! 🎨

This admin panel provides a complete content management system for your poetry website. No coding required – just write, publish, and share your work with the world.

---

## 📍 Accessing the Admin Panel

### URL
Navigate to: **`https://prasiddhasubedi.github.io/byprasiddha/admin/`**

Or locally: **`/admin/`**

### Default Credentials
```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT:** Change these credentials after first login for security!

---

## 🚀 Quick Start Guide

### Step 1: First Time Setup (5 minutes)

1. **Login** to the admin panel
2. **Click the GitHub status indicator** in the top right (or the settings icon)
3. **Setup GitHub Integration:**
   - Follow the link to create a GitHub Personal Access Token
   - Grant `repo` permissions
   - Paste the token in the admin panel
   - Click "Test & Save Token"

### Step 2: Start Publishing!

Once GitHub is configured, you can:
- ✍️ Write new poems
- 📝 Create articles
- 📚 Add eBooks
- 📸 Upload photography

---

## 📖 Publishing Content

### Writing a New Poem

1. **Navigate to Poetry** section from the sidebar
2. **Click "Add New Poem"** button
3. **Fill in the form:**
   - **Title** (required): Your poem's title
   - **Content** (required): Use the rich text editor to write your poem
     - Format text with bold, italic, etc.
     - Add line breaks for stanzas
     - Keep your natural poetic structure
   - **Author** (optional): Defaults to "prasiddha"
   - **Description** (optional): Brief summary for SEO and social sharing
   - **Date** (auto-filled): Published date
   - **Cover Image** (optional): Upload a visual to accompany your poem

4. **Click "Save Poem"**
5. **Choose publishing options:**
   - ✅ **Publish to GitHub**: Automatically deploys to your website (recommended)
   - ✅ **Save Locally**: Keeps a backup in your browser
   - You can choose both for maximum safety!

6. **Wait for confirmation** – Your poem will be live in 1-2 minutes!

### Creating an Article

1. **Navigate to Articles** section
2. **Click "Add New Article"**
3. **Fill in the details:**
   - **Title** (required)
   - **Content** (required): Full article text with rich formatting
   - **Excerpt** (optional): Short teaser for article listings
   - **Author** (optional): Defaults to "Prasiddha Subedi"
   - **Tags** (optional): Comma-separated keywords
   - **Date** (auto-filled)

4. **Save and publish** using the same process as poems

### Adding an eBook

1. **Navigate to eBooks** section
2. **Click "Add New eBook"**
3. **Provide information:**
   - **Title** (required)
   - **Description** (required)
   - **Author** (optional)
   - **Genre** (optional): fiction, poetry, non-fiction, etc.
   - **Cover Image** (optional)
   - **Tags** (optional)

4. **Save to publish**

### Uploading Photography

1. **Navigate to Photography** section
2. **Click "Upload Photos"**
3. **Add your image:**
   - Drag-and-drop an image, or click to select
   - Supported formats: JPG, PNG, GIF
   - Maximum size: 5MB
4. **Add details:**
   - **Title** (required)
   - **Caption** (optional)
   - **Tags** (optional)
5. **Upload to publish**

---

## ✏️ Editing & Managing Content

### Editing Existing Content

1. Navigate to the relevant section (Poetry, Articles, etc.)
2. Find the content you want to edit
3. Click the **Edit icon** (pencil)
4. Make your changes
5. Save – changes will be published immediately

### Deleting Content

1. Navigate to the content section
2. Click the **Delete icon** (trash)
3. Confirm deletion
4. If GitHub is configured, content will be removed from the website

---

## 🎨 Using the Rich Text Editor

The admin panel includes a powerful rich text editor with these features:

### Formatting Options
- **Headers**: H1, H2, H3 for section titles
- **Bold**, *Italic*, Underline, ~~Strikethrough~~
- Bullet lists and numbered lists
- Indentation controls
- Block quotes
- Code blocks
- Text alignment
- Links
- Clean formatting button

### Tips for Poetry
- Use line breaks naturally – press Enter for new lines
- Each stanza can be a separate paragraph
- Use the formatting sparingly to maintain poetic simplicity
- Preview your work before publishing

### Tips for Articles
- Use headers (H2, H3) to organize sections
- Add bullet points for lists
- Use block quotes for emphasis
- Add links to reference external sources

---

## 🔐 GitHub Integration

### Why GitHub?

GitHub integration allows your content to be:
- ✅ Automatically deployed to your website
- ✅ Version controlled (track all changes)
- ✅ Backed up securely
- ✅ Accessible from anywhere
- ✅ Free forever!

### Setting Up GitHub Token

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"

2. **Configure the token:**
   - **Name**: "byprasiddha-admin"
   - **Expiration**: No expiration (recommended)
   - **Scopes**: Select `repo` (full repository access)

3. **Generate and copy the token**
   - **Important**: You'll only see the token once!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`

4. **Save in admin panel:**
   - Click settings icon in admin panel
   - Paste the token
   - Click "Test & Save Token"
   - Verify connection shows your GitHub username

### Security Notes

- ⚠️ **Never share your token** with anyone
- ⚠️ The token gives full access to your repository
- ✅ The token is stored **only in your browser**
- ✅ No external server has access to your token
- ✅ You can revoke the token anytime from GitHub settings

---

## 📊 Dashboard Overview

The dashboard shows:

### Statistics
- **Total Poems**: Count of published poems
- **Total Articles**: Count of articles
- **Total Views**: Overall page views (from Firebase)
- **Total Likes**: Engagement metrics

### Recent Activity
- Latest content additions
- Recent updates
- Engagement notifications

### Quick Actions
- Fast shortcuts to add new content
- Direct access to all content types

---

## 🔧 Settings & Configuration

### Changing Admin Password

1. Navigate to `admin/scripts/auth.js`
2. Update the `ADMIN_CREDENTIALS` object:
```javascript
const ADMIN_CREDENTIALS = {
    username: 'your-new-username',
    passwordHash: 'your-hashed-password'
};
```
3. Generate hash by running in browser console:
```javascript
auth.hashPassword('your-new-password').then(console.log);
```
4. Replace `passwordHash` with the output

### Session Settings

Sessions expire after **1 hour** of inactivity by default.

To change this, edit `admin/scripts/auth.js`:
```javascript
const AUTH_CONFIG = {
    SESSION_TIMEOUT: 3600000, // Time in milliseconds (1 hour)
    // ...
};
```

---

## 🆘 Troubleshooting

### Problem: Can't login

**Solutions:**
- Verify credentials: `admin` / `admin123`
- Clear browser cache and cookies
- Check browser console for errors (F12)
- Try incognito/private browsing mode

### Problem: GitHub not connecting

**Solutions:**
- Verify token has `repo` permissions
- Check if token is expired
- Test token at: https://github.com/settings/tokens
- Try generating a new token
- Ensure you copied the entire token (starts with `ghp_`)

### Problem: Content not publishing

**Solutions:**
- **Check GitHub status** in top right of dashboard
- Verify internet connection
- Check GitHub repository is accessible
- Look for error messages in browser console
- Try saving locally first, then republish

### Problem: Images not uploading

**Solutions:**
- Verify file size is under 5MB
- Use supported formats: JPG, PNG, GIF
- Compress large images before upload
- Check GitHub token has permissions
- Try a different image

### Problem: Rich text editor not working

**Solutions:**
- Refresh the page
- Clear browser cache
- Check if JavaScript is enabled
- Try a different browser
- Check browser console for errors

### Problem: Lost access to admin panel

**Recovery Steps:**

1. **Password Reset:**
   - Edit `admin/scripts/auth.js` directly in GitHub
   - Update credentials as shown in Settings section
   - Commit changes and wait for deployment

2. **Token Reset:**
   - Go to GitHub settings
   - Revoke old token
   - Create new token with same permissions
   - Re-enter in admin panel

3. **Complete Reset:**
   - Clear browser localStorage: `localStorage.clear()`
   - Delete and recreate GitHub token
   - Login with default credentials
   - Reconfigure everything

---

## 💡 Best Practices

### Content Organization
- ✅ Use descriptive titles
- ✅ Add descriptions for better SEO
- ✅ Tag content appropriately
- ✅ Keep consistent author attribution
- ✅ Set proper publication dates

### Image Management
- ✅ Optimize images before upload
- ✅ Use descriptive file names
- ✅ Add alt text (title/caption)
- ✅ Keep file sizes reasonable (< 1MB preferred)

### Workflow Tips
- ✅ Draft in editor, preview before publishing
- ✅ Save locally as backup when in doubt
- ✅ Publish to GitHub for live deployment
- ✅ Review published content on website
- ✅ Keep GitHub token secure and private

### Security
- ✅ Change default admin password immediately
- ✅ Never share GitHub token
- ✅ Use strong, unique passwords
- ✅ Logout when using shared computers
- ✅ Check token permissions regularly

---

## 📱 Mobile Usage

The admin panel is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktops

### Mobile Tips
- Use the hamburger menu (☰) to access sidebar
- Editor works with on-screen keyboard
- Upload images from phone gallery
- All features available on mobile

---

## ⚡ Performance Tips

### For Best Experience:
- Use modern browsers (Chrome, Firefox, Safari, Edge)
- Keep browsers updated
- Stable internet connection for publishing
- Don't edit in multiple tabs simultaneously

---

## 🎯 What Makes This CMS Special

### Writer-Friendly
- No coding required
- Intuitive interface
- Rich text editing
- Instant publishing

### Free & Open Source
- No monthly fees
- No usage limits
- Full control of content
- Powered by GitHub Pages

### Secure & Reliable
- Your content, your repository
- Version control included
- Free SSL certificate
- 99.9% uptime

### Modern & Fast
- Clean, minimal design
- Fast page loads
- Responsive on all devices
- Smooth animations

---

## 📞 Support & Resources

### Getting Help
- **Documentation**: Review this guide
- **Browser Console**: Press F12 for error details
- **GitHub Issues**: Report bugs in repository
- **Testing**: Use browser incognito mode to isolate issues

### Useful Links
- **Website**: https://prasiddhasubedi.github.io/byprasiddha/
- **Admin Panel**: https://prasiddhasubedi.github.io/byprasiddha/admin/
- **GitHub Repository**: https://github.com/prasiddhasubedi/byprasiddha
- **GitHub Tokens**: https://github.com/settings/tokens

---

## 🎊 Congratulations!

You now have a complete content management system for your poetry website. Write freely, publish easily, and share your work with the world!

**Happy Writing! ✍️📚**

---

*Last Updated: January 2026*
*Admin Panel Version: 2.0*
