// ==========================================
// ENHANCED MODAL HANDLERS
// Integrates rich text editor and GitHub publishing
// ==========================================

// Store Quill editor instances
let quillEditors = {};

// Enhanced submit handler for poetry
async function enhancedPoetrySubmit(form, isEdit, originalData) {
    const formData = new FormData(form);
    
    // Get content from Quill if available
    let content = formData.get('content');
    if (quillEditors['poetryContent']) {
        content = quillEditors['poetryContent'].root.innerHTML;
    }
    
    const poemData = {
        title: formData.get('title'),
        content: content,
        author: formData.get('author') || 'prasiddha',
        description: formData.get('description') || '',
        tags: formData.get('tags') || '',
        postedDate: formData.get('postedDate') || new Date().toISOString(),
        mediaUrl: formData.get('mediaUrl') || ''
    };

    // Ask user how to publish
    const publishOptions = await showPublishDialog();
    
    if (publishOptions.cancelled) {
        return;
    }

    try {
        showLoadingOverlay('Publishing...');
        
        if (publishOptions.github && githubPublisher.canPublish()) {
            // Publish to GitHub
            const result = await githubPublisher.publishPoem(poemData, {
                skipLocalSave: !publishOptions.local
            });
            
            if (result.success) {
                hideLoadingOverlay();
                showToast('Poem published successfully!', 'success');
                window.modalManager.close();
                
                // Reload content
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }
        } else if (publishOptions.local) {
            // Save locally only
            if (isEdit && originalData) {
                window.contentManager.updatePoetry(originalData.id, poemData);
            } else {
                window.contentManager.addPoetry(poemData);
            }
            
            hideLoadingOverlay();
            showToast('Poem saved locally!', 'success');
            window.modalManager.close();
            
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
        } else {
            hideLoadingOverlay();
            showToast('Please select at least one option', 'warning');
        }
    } catch (error) {
        hideLoadingOverlay();
        console.error('[Enhanced Modal] Submit failed:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Enhanced submit handler for articles
async function enhancedArticleSubmit(form, isEdit, originalData) {
    const formData = new FormData(form);
    
    // Get content from Quill if available
    let content = formData.get('content');
    if (quillEditors['articleContent']) {
        content = quillEditors['articleContent'].root.innerHTML;
    }
    
    const articleData = {
        title: formData.get('title'),
        content: content,
        author: formData.get('author') || 'Prasiddha Subedi',
        excerpt: formData.get('excerpt') || '',
        tags: formData.get('tags') || '',
        postedDate: formData.get('postedDate') || new Date().toISOString()
    };

    const publishOptions = await showPublishDialog();
    
    if (publishOptions.cancelled) {
        return;
    }

    try {
        showLoadingOverlay('Publishing...');
        
        if (publishOptions.github && githubPublisher.canPublish()) {
            const result = await githubPublisher.publishArticle(articleData, {
                skipLocalSave: !publishOptions.local
            });
            
            if (result.success) {
                hideLoadingOverlay();
                showToast('Article published successfully!', 'success');
                window.modalManager.close();
                
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }
        } else if (publishOptions.local) {
            if (isEdit && originalData) {
                window.contentManager.updateArticle(originalData.id, articleData);
            } else {
                window.contentManager.addArticle(articleData);
            }
            
            hideLoadingOverlay();
            showToast('Article saved locally!', 'success');
            window.modalManager.close();
            
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
        } else {
            hideLoadingOverlay();
            showToast('Please select at least one option', 'warning');
        }
    } catch (error) {
        hideLoadingOverlay();
        console.error('[Enhanced Modal] Submit failed:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Show publish dialog
function showPublishDialog() {
    return new Promise((resolve) => {
        const hasGitHub = githubPublisher.canPublish();
        
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h2 class="modal-title">Publish Options</h2>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 20px; color: #cbd5e1;">Choose how you want to save your content:</p>
                    
                    ${hasGitHub ? `
                        <label class="publish-option" style="display: flex; align-items: center; padding: 15px; background: rgba(99, 102, 241, 0.1); border: 2px solid rgba(99, 102, 241, 0.3); border-radius: 8px; margin-bottom: 15px; cursor: pointer;">
                            <input type="checkbox" id="publishGitHub" checked style="margin-right: 15px; width: 20px; height: 20px; cursor: pointer;">
                            <div>
                                <strong style="display: block; color: #6366f1; margin-bottom: 5px;">Publish to GitHub</strong>
                                <span style="font-size: 0.9rem; color: #94a3b8;">Automatically deploy to your website</span>
                            </div>
                        </label>
                    ` : `
                        <div class="publish-option" style="padding: 15px; background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 8px; margin-bottom: 15px;">
                            <strong style="display: block; color: #ef4444; margin-bottom: 5px;">⚠️ GitHub Not Connected</strong>
                            <span style="font-size: 0.9rem; color: #94a3b8;">Configure GitHub to enable auto-publishing</span>
                            <button onclick="window.location.href='github-setup.html'" style="margin-top: 10px; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">Setup Now</button>
                        </div>
                    `}
                    
                    <label class="publish-option" style="display: flex; align-items: center; padding: 15px; background: rgba(100, 116, 139, 0.1); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 8px; cursor: pointer;">
                        <input type="checkbox" id="publishLocal" checked style="margin-right: 15px; width: 20px; height: 20px; cursor: pointer;">
                        <div>
                            <strong style="display: block; color: #94a3b8; margin-bottom: 5px;">Save Locally</strong>
                            <span style="font-size: 0.9rem; color: #94a3b8;">Store in browser (backup)</span>
                        </div>
                    </label>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelPublish">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmPublish">Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        document.getElementById('cancelPublish').onclick = () => {
            document.body.removeChild(dialog);
            resolve({ cancelled: true });
        };
        
        document.getElementById('confirmPublish').onclick = () => {
            const github = hasGitHub && document.getElementById('publishGitHub')?.checked;
            const local = document.getElementById('publishLocal').checked;
            
            document.body.removeChild(dialog);
            resolve({ github, local, cancelled: false });
        };
    });
}

// Initialize Quill editor for content field
function initializeQuillEditor(elementId, placeholder = 'Write your content here...') {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    // Convert textarea to div for Quill
    const editorDiv = document.createElement('div');
    editorDiv.id = elementId + 'Editor';
    element.parentNode.insertBefore(editorDiv, element.nextSibling);
    
    // Hide original textarea
    element.style.display = 'none';
    
    // Initialize Quill
    const quill = new Quill(`#${editorDiv.id}`, {
        theme: 'snow',
        placeholder: placeholder,
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['blockquote', 'code-block'],
                [{ 'align': [] }],
                ['link'],
                ['clean']
            ]
        }
    });
    
    // Set initial content if exists
    if (element.value) {
        quill.root.innerHTML = element.value;
    }
    
    // Sync Quill content to hidden textarea
    quill.on('text-change', () => {
        element.value = quill.root.innerHTML;
    });
    
    quillEditors[elementId] = quill;
    return quill;
}

// Show loading overlay
function showLoadingOverlay(message = 'Loading...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div style="background: #1e293b; padding: 30px; border-radius: 12px; text-align: center; min-width: 200px;">
            <div style="width: 50px; height: 50px; border: 4px solid rgba(99, 102, 241, 0.3); border-top-color: #6366f1; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s linear infinite;"></div>
            <p style="color: #cbd5e1; font-size: 1.1rem;">${message}</p>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Make functions available globally
window.enhancedPoetrySubmit = enhancedPoetrySubmit;
window.enhancedArticleSubmit = enhancedArticleSubmit;
window.initializeQuillEditor = initializeQuillEditor;
window.showPublishDialog = showPublishDialog;
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;
