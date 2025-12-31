// ==========================================
// MODAL MANAGER
// Handles all modal operations for content management
// ==========================================

class ModalManager {
    constructor() {
        this.currentModal = null;
        this.modalContainer = document.getElementById('modalContainer');
        this.initializeStyles();
    }

    // Initialize modal styles
    initializeStyles() {
        // Add modal styles link if not already present
        if (!document.querySelector('link[href*="modal.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'styles/modal.css';
            document.head.appendChild(link);
        }
    }

    // Show modal for content type
    show(type, data = null) {
        const isEdit = data !== null;
        let content = '';

        switch(type) {
            case 'poetry':
                content = this.createPoetryModal(data, isEdit);
                break;
            case 'article':
                content = this.createArticleModal(data, isEdit);
                break;
            case 'ebook':
                content = this.createEbookModal(data, isEdit);
                break;
            case 'photo':
                content = this.createPhotoModal(data, isEdit);
                break;
            default:
                return;
        }

        this.render(content, type, data);
    }

    // Render modal
    render(content, type, data) {
        if (!this.modalContainer) return;

        this.modalContainer.innerHTML = `
            <div class="modal-overlay" id="modalOverlay">
                ${content}
            </div>
        `;

        this.currentModal = { type, data };
        this.attachEventListeners();
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.modalContainer.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Create Poetry Modal
    createPoetryModal(data, isEdit) {
        const currentDate = data?.postedDate ? new Date(data.postedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z"></path>
                            <path d="M2 17L12 22L22 17"></path>
                            <path d="M2 12L12 17L22 12"></path>
                        </svg>
                        ${isEdit ? 'Edit' : 'Add New'} Poem
                    </h2>
                    <button class="modal-close" onclick="modalManager.close()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="modal-form" id="poetryForm">
                        <div class="form-group">
                            <label for="poetryTitle">Title<span class="required">*</span></label>
                            <input 
                                type="text" 
                                id="poetryTitle" 
                                name="title" 
                                required 
                                placeholder="Enter poem title"
                                value="${data ? this.escapeHTML(data.title) : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="poetryAuthor">Author</label>
                            <input 
                                type="text" 
                                id="poetryAuthor" 
                                name="author" 
                                placeholder="Author name"
                                value="${data ? this.escapeHTML(data.author || '') : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="poetryDescription">Description</label>
                            <textarea 
                                id="poetryDescription" 
                                name="description" 
                                placeholder="Brief description of the poem..."
                                rows="2"
                            >${data ? this.escapeHTML(data.description || '') : ''}</textarea>
                            <span class="form-hint">A short description that will appear in listings</span>
                        </div>

                        <div class="form-group">
                            <label for="poetryPostedDate">Posted Date</label>
                            <input 
                                type="datetime-local" 
                                id="poetryPostedDate" 
                                name="postedDate" 
                                value="${currentDate}"
                            >
                            <span class="form-hint">When this poem was/will be published</span>
                        </div>

                        <div class="form-group">
                            <label for="poetryMedia">Featured Image (Optional)</label>
                            <div class="file-upload-area" id="poetryFileUploadArea">
                                <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div class="file-upload-text">Click to upload or drag and drop</div>
                                <div class="file-upload-hint">PNG, JPG up to 5MB</div>
                                <input type="file" id="poetryMediaInput" class="file-upload-input" accept="image/*">
                            </div>
                            <div id="poetryPreviewContainer" class="preview-container" style="display: ${data?.mediaUrl ? 'block' : 'none'};">
                                <span class="preview-label">Preview:</span>
                                <img id="poetryMediaPreview" class="preview-image" src="${data?.mediaUrl || ''}" alt="Preview">
                                <button type="button" class="btn-remove-preview" onclick="modalManager.removePoetryMedia()">Remove</button>
                            </div>
                        </div>

                        <div class="form-group large">
                            <label for="poetryContent">Content<span class="required">*</span></label>
                            <textarea 
                                id="poetryContent" 
                                name="content" 
                                required 
                                placeholder="Write your poem here..."
                            >${data ? this.escapeHTML(data.content) : ''}</textarea>
                            <span class="form-hint">Write your poem using line breaks to separate stanzas</span>
                        </div>

                        <div class="form-group">
                            <label for="poetryTags">Tags</label>
                            <input 
                                type="text" 
                                id="poetryTags" 
                                name="tags" 
                                placeholder="love, nature, life (comma-separated)"
                                value="${data ? this.escapeHTML(data.tags || '') : ''}"
                            >
                            <span class="form-hint">Add tags separated by commas to categorize your poem</span>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                    <button type="submit" form="poetryForm" class="btn btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        ${isEdit ? 'Update' : 'Save'} Poem
                    </button>
                </div>
            </div>
        `;
    }

    // Create Article Modal
    createArticleModal(data, isEdit) {
        const currentDate = data?.postedDate ? new Date(data.postedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        ${isEdit ? 'Edit' : 'Add New'} Article
                    </h2>
                    <button class="modal-close" onclick="modalManager.close()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="modal-form" id="articleForm">
                        <div class="form-group">
                            <label for="articleTitle">Title<span class="required">*</span></label>
                            <input 
                                type="text" 
                                id="articleTitle" 
                                name="title" 
                                required 
                                placeholder="Enter article title"
                                value="${data ? this.escapeHTML(data.title) : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="articleAuthor">Author</label>
                            <input 
                                type="text" 
                                id="articleAuthor" 
                                name="author" 
                                placeholder="Author name"
                                value="${data ? this.escapeHTML(data.author || '') : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="articleExcerpt">Excerpt</label>
                            <textarea 
                                id="articleExcerpt" 
                                name="excerpt" 
                                placeholder="Brief summary of the article..."
                            >${data ? this.escapeHTML(data.excerpt || '') : ''}</textarea>
                            <span class="form-hint">A short summary that will appear in article listings</span>
                        </div>

                        <div class="form-group">
                            <label for="articlePostedDate">Posted Date</label>
                            <input 
                                type="datetime-local" 
                                id="articlePostedDate" 
                                name="postedDate" 
                                value="${currentDate}"
                            >
                            <span class="form-hint">When this article was/will be published</span>
                        </div>

                        <div class="form-group">
                            <label for="articleMedia">Featured Image (Optional)</label>
                            <div class="file-upload-area" id="articleFileUploadArea">
                                <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div class="file-upload-text">Click to upload or drag and drop</div>
                                <div class="file-upload-hint">PNG, JPG up to 5MB</div>
                                <input type="file" id="articleMediaInput" class="file-upload-input" accept="image/*">
                            </div>
                            <div id="articlePreviewContainer" class="preview-container" style="display: ${data?.mediaUrl ? 'block' : 'none'};">
                                <span class="preview-label">Preview:</span>
                                <img id="articleMediaPreview" class="preview-image" src="${data?.mediaUrl || ''}" alt="Preview">
                                <button type="button" class="btn-remove-preview" onclick="modalManager.removeArticleMedia()">Remove</button>
                            </div>
                        </div>

                        <div class="form-group large">
                            <label for="articleContent">Content<span class="required">*</span></label>
                            <textarea 
                                id="articleContent" 
                                name="content" 
                                required 
                                placeholder="Write your article here..."
                            >${data ? this.escapeHTML(data.content) : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label for="articleTags">Tags</label>
                            <input 
                                type="text" 
                                id="articleTags" 
                                name="tags" 
                                placeholder="technology, lifestyle, opinion (comma-separated)"
                                value="${data ? this.escapeHTML(data.tags || '') : ''}"
                            >
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                    <button type="submit" form="articleForm" class="btn btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        ${isEdit ? 'Update' : 'Save'} Article
                    </button>
                </div>
            </div>
        `;
    }

    // Create eBook Modal
    createEbookModal(data, isEdit) {
        const currentDate = data?.postedDate ? new Date(data.postedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        ${isEdit ? 'Edit' : 'Add New'} eBook
                    </h2>
                    <button class="modal-close" onclick="modalManager.close()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="modal-form" id="ebookForm">
                        <div class="form-group">
                            <label for="ebookTitle">Title<span class="required">*</span></label>
                            <input 
                                type="text" 
                                id="ebookTitle" 
                                name="title" 
                                required 
                                placeholder="Enter eBook title"
                                value="${data ? this.escapeHTML(data.title) : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="ebookAuthor">Author</label>
                            <input 
                                type="text" 
                                id="ebookAuthor" 
                                name="author" 
                                placeholder="Author name"
                                value="${data ? this.escapeHTML(data.author || '') : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="ebookGenre">Genre</label>
                            <input 
                                type="text" 
                                id="ebookGenre" 
                                name="genre" 
                                placeholder="Fiction, Non-fiction, Poetry, etc."
                                value="${data ? this.escapeHTML(data.genre || '') : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="ebookPostedDate">Posted Date</label>
                            <input 
                                type="datetime-local" 
                                id="ebookPostedDate" 
                                name="postedDate" 
                                value="${currentDate}"
                            >
                            <span class="form-hint">When this eBook was/will be published</span>
                        </div>

                        <div class="form-group">
                            <label for="ebookCover">Cover Image (Optional)</label>
                            <div class="file-upload-area" id="ebookFileUploadArea">
                                <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div class="file-upload-text">Click to upload or drag and drop</div>
                                <div class="file-upload-hint">PNG, JPG up to 5MB</div>
                                <input type="file" id="ebookCoverInput" class="file-upload-input" accept="image/*">
                            </div>
                            <div id="ebookPreviewContainer" class="preview-container" style="display: ${data?.coverImageUrl ? 'block' : 'none'};">
                                <span class="preview-label">Preview:</span>
                                <img id="ebookCoverPreview" class="preview-image" src="${data?.coverImageUrl || ''}" alt="Preview">
                                <button type="button" class="btn-remove-preview" onclick="modalManager.removeEbookCover()">Remove</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="ebookDescription">Description<span class="required">*</span></label>
                            <textarea 
                                id="ebookDescription" 
                                name="description" 
                                required 
                                placeholder="Describe the eBook..."
                            >${data ? this.escapeHTML(data.description || '') : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label for="ebookTags">Tags</label>
                            <input 
                                type="text" 
                                id="ebookTags" 
                                name="tags" 
                                placeholder="adventure, mystery, romance (comma-separated)"
                                value="${data ? this.escapeHTML(data.tags || '') : ''}"
                            >
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                    <button type="submit" form="ebookForm" class="btn btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        ${isEdit ? 'Update' : 'Save'} eBook
                    </button>
                </div>
            </div>
        `;
    }

    // Create Photo Upload Modal
    createPhotoModal(data, isEdit) {
        return `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        Upload Photo
                    </h2>
                    <button class="modal-close" onclick="modalManager.close()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="modal-form" id="photoForm">
                        <div class="form-group">
                            <label>Photo<span class="required">*</span></label>
                            <div class="file-upload-area" id="fileUploadArea">
                                <svg class="file-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <div class="file-upload-text">Click to upload or drag and drop</div>
                                <div class="file-upload-hint">PNG, JPG, GIF up to 5MB</div>
                                <input type="file" id="photoInput" class="file-upload-input" accept="image/*" required>
                            </div>
                            <div id="previewContainer" class="preview-container" style="display: none;">
                                <span class="preview-label">Preview:</span>
                                <img id="photoPreview" class="preview-image" alt="Preview">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="photoTitle">Title<span class="required">*</span></label>
                            <input 
                                type="text" 
                                id="photoTitle" 
                                name="title" 
                                required 
                                placeholder="Photo title"
                            >
                        </div>

                        <div class="form-group">
                            <label for="photoCaption">Caption</label>
                            <textarea 
                                id="photoCaption" 
                                name="caption" 
                                placeholder="Add a caption..."
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label for="photoTags">Tags</label>
                            <input 
                                type="text" 
                                id="photoTags" 
                                name="tags" 
                                placeholder="landscape, portrait, nature (comma-separated)"
                            >
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="modalManager.close()">Cancel</button>
                    <button type="submit" form="photoForm" class="btn btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload Photo
                    </button>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    attachEventListeners() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // Handle form submission
        const forms = {
            'poetryForm': () => this.handlePoetrySubmit(),
            'articleForm': () => this.handleArticleSubmit(),
            'ebookForm': () => this.handleEbookSubmit(),
            'photoForm': () => this.handlePhotoSubmit()
        };

        Object.keys(forms).forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    forms[formId]();
                });
            }
        });

        // Handle photo upload
        this.attachPhotoUploadListeners();
        
        // Handle poetry media upload
        this.attachPoetryMediaListeners();
        
        // Handle article media upload
        this.attachArticleMediaListeners();
        
        // Handle ebook cover upload
        this.attachEbookCoverListeners();

        // ESC key to close
        document.addEventListener('keydown', this.handleEscape.bind(this));
    }

    // Handle photo upload listeners
    attachPhotoUploadListeners() {
        const uploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('photoInput');
        const preview = document.getElementById('photoPreview');
        const previewContainer = document.getElementById('previewContainer');

        if (!uploadArea || !fileInput) return;

        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());

        // File selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handlePhotoFile(file);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handlePhotoFile(file);
            }
        });
    }

    // Handle photo file
    handlePhotoFile(file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            const previewContainer = document.getElementById('previewContainer');
            
            if (preview && previewContainer) {
                preview.src = e.target.result;
                previewContainer.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    // Handle poetry media upload listeners
    attachPoetryMediaListeners() {
        const uploadArea = document.getElementById('poetryFileUploadArea');
        const fileInput = document.getElementById('poetryMediaInput');
        
        if (!uploadArea || !fileInput) return;
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleMediaFile(file, 'poetryMediaPreview', 'poetryPreviewContainer');
            }
        });
        
        this.attachDragAndDrop(uploadArea, (file) => {
            this.handleMediaFile(file, 'poetryMediaPreview', 'poetryPreviewContainer');
        });
    }

    // Handle article media upload listeners
    attachArticleMediaListeners() {
        const uploadArea = document.getElementById('articleFileUploadArea');
        const fileInput = document.getElementById('articleMediaInput');
        
        if (!uploadArea || !fileInput) return;
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleMediaFile(file, 'articleMediaPreview', 'articlePreviewContainer');
            }
        });
        
        this.attachDragAndDrop(uploadArea, (file) => {
            this.handleMediaFile(file, 'articleMediaPreview', 'articlePreviewContainer');
        });
    }

    // Handle ebook cover upload listeners
    attachEbookCoverListeners() {
        const uploadArea = document.getElementById('ebookFileUploadArea');
        const fileInput = document.getElementById('ebookCoverInput');
        
        if (!uploadArea || !fileInput) return;
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleMediaFile(file, 'ebookCoverPreview', 'ebookPreviewContainer');
            }
        });
        
        this.attachDragAndDrop(uploadArea, (file) => {
            this.handleMediaFile(file, 'ebookCoverPreview', 'ebookPreviewContainer');
        });
    }

    // Generic drag and drop handler
    attachDragAndDrop(uploadArea, onFileDrop) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                onFileDrop(file);
            }
        });
    }

    // Handle media file upload
    handleMediaFile(file, previewId, containerId) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(previewId);
            const container = document.getElementById(containerId);
            
            if (preview && container) {
                preview.src = e.target.result;
                container.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    // Remove poetry media
    removePoetryMedia() {
        const preview = document.getElementById('poetryMediaPreview');
        const container = document.getElementById('poetryPreviewContainer');
        const input = document.getElementById('poetryMediaInput');
        
        if (preview) preview.src = '';
        if (container) container.style.display = 'none';
        if (input) input.value = '';
    }

    // Remove article media
    removeArticleMedia() {
        const preview = document.getElementById('articleMediaPreview');
        const container = document.getElementById('articlePreviewContainer');
        const input = document.getElementById('articleMediaInput');
        
        if (preview) preview.src = '';
        if (container) container.style.display = 'none';
        if (input) input.value = '';
    }

    // Remove ebook cover
    removeEbookCover() {
        const preview = document.getElementById('ebookCoverPreview');
        const container = document.getElementById('ebookPreviewContainer');
        const input = document.getElementById('ebookCoverInput');
        
        if (preview) preview.src = '';
        if (container) container.style.display = 'none';
        if (input) input.value = '';
    }

    // Handle Poetry Submit
    handlePoetrySubmit() {
        const form = document.getElementById('poetryForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Get media URL from preview
        const mediaPreview = document.getElementById('poetryMediaPreview');
        if (mediaPreview && mediaPreview.src && !mediaPreview.src.includes('undefined')) {
            data.mediaUrl = mediaPreview.src;
        }

        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        try {
            if (this.currentModal.data) {
                // Update existing
                window.contentManager.updatePoetry(this.currentModal.data.id, data);
                showToast('Poem updated successfully', 'success');
            } else {
                // Create new
                window.contentManager.addPoetry(data);
                showToast('Poem added successfully', 'success');
            }

            loadPoetryList();
            loadDashboardData();
            this.close();
        } catch (error) {
            showToast('Error saving poem', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        }
    }

    // Handle Article Submit
    handleArticleSubmit() {
        const form = document.getElementById('articleForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Get media URL from preview
        const mediaPreview = document.getElementById('articleMediaPreview');
        if (mediaPreview && mediaPreview.src && !mediaPreview.src.includes('undefined')) {
            data.mediaUrl = mediaPreview.src;
        }

        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        try {
            if (this.currentModal.data) {
                window.contentManager.updateArticle(this.currentModal.data.id, data);
                showToast('Article updated successfully', 'success');
            } else {
                window.contentManager.addArticle(data);
                showToast('Article added successfully', 'success');
            }

            loadArticlesList();
            loadDashboardData();
            this.close();
        } catch (error) {
            showToast('Error saving article', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        }
    }

    // Handle eBook Submit
    handleEbookSubmit() {
        const form = document.getElementById('ebookForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Get cover image URL from preview
        const coverPreview = document.getElementById('ebookCoverPreview');
        if (coverPreview && coverPreview.src && !coverPreview.src.includes('undefined')) {
            data.coverImageUrl = coverPreview.src;
        }

        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        try {
            if (this.currentModal.data) {
                window.contentManager.updateEbook(this.currentModal.data.id, data);
                showToast('eBook updated successfully', 'success');
            } else {
                window.contentManager.addEbook(data);
                showToast('eBook added successfully', 'success');
            }

            loadEbooksList();
            loadDashboardData();
            this.close();
        } catch (error) {
            showToast('Error saving eBook', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        }
    }

    // Handle Photo Submit
    handlePhotoSubmit() {
        const form = document.getElementById('photoForm');
        const formData = new FormData(form);
        const preview = document.getElementById('photoPreview');

        if (!preview || !preview.src) {
            showToast('Please select a photo', 'error');
            return;
        }

        const data = {
            title: formData.get('title'),
            caption: formData.get('caption'),
            tags: formData.get('tags'),
            url: preview.src // Base64 encoded image
        };

        const submitBtn = document.querySelector('.modal-footer .btn-primary');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        try {
            window.contentManager.addPhoto(data);
            showToast('Photo uploaded successfully', 'success');
            loadPhotoGallery();
            loadDashboardData();
            this.close();
        } catch (error) {
            showToast('Error uploading photo', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        }
    }

    // Handle escape key
    handleEscape(e) {
        if (e.key === 'Escape' && this.currentModal) {
            this.close();
        }
    }

    // Close modal
    close() {
        if (this.modalContainer) {
            this.modalContainer.innerHTML = '';
        }
        this.currentModal = null;
        document.removeEventListener('keydown', this.handleEscape);
    }

    // Escape HTML
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Create global instance
window.modalManager = new ModalManager();
