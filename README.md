# Prasiddha Subedi - Personal Literary Website

A premium, modern personal website with an integrated content management system for poetry, articles, eBooks, and photography.

## 🌟 Features

### Public Website
- **Modern Design**: Premium, responsive UI with smooth animations
- **Poetry Collection**: Showcase your poems with beautiful layouts
- **Articles Section**: Share long-form content and thoughts
- **eBooks Showcase**: Display your published works
- **Photography Gallery**: Visual storytelling through images
- **Engagement Features**: Views, likes, comments, and social sharing
- **Firebase Integration**: Real-time analytics and user engagement
- **SEO Optimized**: Meta tags, Open Graph, and Twitter Cards
- **Mobile Responsive**: Perfect experience on all devices

### Admin Panel (CMS)
- **🔐 Secure Authentication**: Username/password with session management
- **✍️ Rich Text Editor**: Quill-powered WYSIWYG editing
- **🚀 GitHub Integration**: Auto-publish directly to your repository
- **📝 Content Management**: Add, edit, delete all content types
- **🖼️ Media Manager**: Upload and manage images
- **⚙️ Site Settings**: Configure site metadata, about page, footer
- **📊 Analytics Dashboard**: View content statistics and engagement
- **💾 Dual Save**: Publish to GitHub or save locally (or both)
- **📱 Mobile Friendly**: Full admin functionality on mobile

## 🚀 Quick Start

### For Website Visitors
Simply visit: **https://prasiddhasubedi.github.io/byprasiddha/**

### For Admin (Content Publishing)
1. Navigate to: **https://prasiddhasubedi.github.io/byprasiddha/admin/**
2. Login with credentials
3. Setup GitHub integration (first time only)
4. Start publishing!

## 📖 Documentation

### Admin Panel Guide
Complete guide for using the CMS: [Admin Panel User Guide](admin/ADMIN_PANEL_GUIDE.md)

### Key Topics:
- 🔑 **First-time setup** - Configure GitHub integration
- ✍️ **Publishing content** - Step-by-step instructions
- 🎨 **Rich text editing** - Format your content beautifully
- 🖼️ **Media management** - Upload and optimize images
- ⚙️ **Site settings** - Customize your website
- 🆘 **Troubleshooting** - Common issues and solutions

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Client-side functionality
- **Quill** - Rich text editor
- **GSAP** - Premium animations
- **AOS** - Scroll animations

### Backend/Services
- **GitHub Pages** - Static site hosting (free!)
- **GitHub API** - Content publishing and version control
- **Firebase** - Analytics and user engagement
- **GitHub Actions** - CI/CD (automatic deployment)

### Admin Panel
- **Vanilla JavaScript** - No framework dependencies
- **LocalStorage** - Client-side data persistence
- **GitHub REST API** - Repository operations
- **Quill Editor** - WYSIWYG content editing

## 📁 Project Structure

```
byprasiddha/
├── admin/                          # Admin panel (CMS)
│   ├── dashboard.html             # Main dashboard
│   ├── login.html                 # Authentication
│   ├── github-setup.html          # GitHub configuration
│   ├── settings.html              # Site settings
│   ├── scripts/                   # Admin JavaScript
│   │   ├── auth.js               # Authentication system
│   │   ├── github-api.js         # GitHub API client
│   │   ├── github-publisher.js   # Publishing system
│   │   ├── content-manager.js    # Content CRUD operations
│   │   ├── modal.js              # Modal dialogs
│   │   ├── enhanced-modal.js     # Rich editor integration
│   │   └── dashboard.js          # Dashboard logic
│   ├── styles/                    # Admin CSS
│   └── ADMIN_PANEL_GUIDE.md      # Complete admin guide
├── poetry/                         # Poetry collection
│   ├── index.html                 # Poetry listing
│   └── [POEM NAME]/              # Individual poems
│       ├── index.html
│       ├── style.css
│       └── script.js
├── articles/                       # Articles section
│   └── index.html
├── ebooks/                         # eBooks showcase
│   └── index.html
├── photography/                    # Photo gallery
│   └── index.html
├── js/                            # JavaScript files
│   ├── firebase-config.js        # Firebase setup
│   ├── firebase-engagement.js    # Engagement features
│   └── main.js                   # Main site logic
├── css/                           # Stylesheets
│   ├── styles.css                # Main styles
│   └── engagement.css            # Engagement UI styles
├── index.html                     # Homepage
└── README.md                      # This file
```

## 🔐 Security

### Admin Panel
- Password hashing (client-side for demo)
- Session timeout (1 hour default)
- XSS protection (input sanitization)
- Brute-force protection (login attempts limit)
- CSRF considerations

### GitHub Integration
- Personal Access Token authentication
- Token stored in localStorage only
- Never transmitted to external servers
- Revocable anytime from GitHub settings

### Best Practices
- Change default admin credentials immediately
- Use strong GitHub tokens
- Regular token rotation
- HTTPS-only access
- No sensitive data in client code

## 🚀 Deployment

### GitHub Pages (Current)
Already deployed! Changes pushed to `main` branch automatically deploy.

### Custom Domain
1. Add `CNAME` file with your domain
2. Configure DNS settings:
   ```
   Type: CNAME
   Name: www
   Value: prasiddhasubedi.github.io
   ```
3. Enable HTTPS in GitHub Pages settings

## 🔧 Development

### Running Locally
```bash
# Clone the repository
git clone https://github.com/prasiddhasubedi/byprasiddha.git

# Navigate to directory
cd byprasiddha

# Serve with any static server, e.g.:
python -m http.server 8000
# or
npx serve

# Visit http://localhost:8000
```

### Admin Panel Development
1. Admin panel runs entirely client-side
2. No build process required
3. Edit files directly
4. Refresh browser to see changes

### Adding New Features
1. Create feature branch: `git checkout -b feature-name`
2. Make changes
3. Test thoroughly
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature-name`
6. Create Pull Request

## 📝 Content Guidelines

### Poetry
- Use meaningful titles
- Add descriptions for SEO
- Format with proper stanzas
- Include publication date
- Optional cover images

### Articles
- Write engaging excerpts
- Use headers for structure
- Add relevant tags
- Include author attribution
- Optimize for readability

### Images
- Maximum 5MB per image
- Supported formats: JPG, PNG, GIF
- Optimize before upload
- Use descriptive file names
- Add titles and captions

## 🎯 Roadmap

### Phase 1: Core CMS ✅
- [x] Authentication system
- [x] Content management (CRUD)
- [x] GitHub API integration
- [x] Rich text editor
- [x] Image uploads
- [x] Dashboard analytics

### Phase 2: Enhanced Features 🚧
- [x] Site settings management
- [x] About page editor
- [ ] Homepage customization
- [ ] Drag-and-drop content ordering
- [ ] Image optimization
- [ ] Bulk operations

### Phase 3: Advanced Features 📋
- [ ] Content scheduling
- [ ] Draft/publish workflow
- [ ] SEO analysis
- [ ] Social media auto-posting
- [ ] Email notifications
- [ ] Multi-language support

## 🤝 Contributing

This is a personal website project, but suggestions and bug reports are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

© 2026 Prasiddha Subedi. All rights reserved.

This project is for personal use. Content (poetry, articles, images) is copyrighted.
Code is provided as-is for educational purposes.

## 🙏 Acknowledgments

- **GitHub Pages** - Free hosting
- **Firebase** - Analytics and engagement
- **Quill** - Rich text editor
- **GSAP** - Animation library
- **AOS** - Scroll animations
- **Google Fonts** - Typography

## 📞 Contact

- **Website**: https://prasiddhasubedi.github.io/byprasiddha/
- **Email**: prasiddhasubedi592@gmail.com
- **Instagram**: [@oopy.prasidd](https://www.instagram.com/oopy.prasidd/)
- **Facebook**: [Prasiddha Subedi](https://www.facebook.com/prasiddha.subedi2)

## 💡 Tips for Success

### For Writers
- Write regularly, publish consistently
- Use rich formatting to enhance readability
- Engage with your audience
- Share on social media
- Backup content locally

### For Developers
- Keep code clean and documented
- Test on multiple devices
- Monitor Firebase analytics
- Regular security audits
- Keep dependencies updated

---

**Built with ❤️ by Prasiddha Subedi**

*Last Updated: January 2026*
