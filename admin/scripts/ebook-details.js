// ==========================================
// EBOOK DETAILS PAGE
// Manages individual ebook and its chapters
// ==========================================

let currentEbookId = null;
let currentEbook = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get ebook ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentEbookId = urlParams.get('id');
    
    if (!currentEbookId) {
        showToast('No ebook selected', 'error');
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
        return;
    }
    
    // Load ebook
    loadEbook();
    
    // Initialize event listeners
    initializeEventListeners();
});

function loadEbook() {
    currentEbook = ebookManager.getEbook(currentEbookId);
    
    if (!currentEbook) {
        showToast('Ebook not found', 'error');
        setTimeout(() => window.location.href = 'dashboard.html', 2000);
        return;
    }
    
    // Update header
    document.getElementById('ebookTopic').textContent = currentEbook.topic;
    document.getElementById('ebookAuthor').textContent = currentEbook.author || 'Prasiddha Subedi';
    document.getElementById('ebookGenre').textContent = currentEbook.genre || 'Uncategorized';
    document.getElementById('ebookChapterCount').textContent = `${currentEbook.chapters.length} Chapter${currentEbook.chapters.length !== 1 ? 's' : ''}`;
    document.getElementById('ebookDescription').textContent = currentEbook.description || 'No description provided.';
    
    // Update cover
    const coverEl = document.getElementById('ebookCover');
    if (currentEbook.coverImage) {
        coverEl.classList.remove('empty');
        coverEl.innerHTML = `<img src="${currentEbook.coverImage}" alt="${currentEbook.topic} cover">`;
    }
    
    // Load chapters
    loadChapters();
}

function loadChapters() {
    const chapterList = document.getElementById('chapterList');
    const chapters = currentEbook.chapters || [];
    
    if (chapters.length === 0) {
        chapterList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <p style="font-size: 1.1rem; margin-bottom: 10px;">No chapters yet</p>
                <p style="font-size: 0.9rem;">Start by adding your first chapter</p>
            </div>
        `;
        return;
    }
    
    // Sort chapters by number
    chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    
    chapterList.innerHTML = chapters.map(chapter => `
        <div class="chapter-card" data-chapter-id="${chapter.id}">
            <div class="chapter-number">${chapter.chapterNumber}</div>
            <div class="chapter-content">
                <div class="chapter-title">${chapter.title}</div>
                <div class="chapter-summary">${chapter.summary || 'No summary'}</div>
                ${chapter.link ? `<div style="color: #6366f1; font-size: 0.85rem; margin-top: 5px;">🔗 ${chapter.link}</div>` : ''}
            </div>
            <div class="chapter-actions">
                <button class="icon-btn" onclick="editChapter('${chapter.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="icon-btn delete" onclick="deleteChapter('${chapter.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function initializeEventListeners() {
    document.getElementById('addChapterBtn').addEventListener('click', () => showChapterModal());
    document.getElementById('editEbookBtn').addEventListener('click', () => showEditEbookModal());
    document.getElementById('publishEbookBtn').addEventListener('click', () => publishEbook());
}

function showChapterModal(chapterId = null) {
    const chapter = chapterId ? currentEbook.chapters.find(c => c.id === chapterId) : null;
    const isEdit = !!chapter;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h2 class="modal-title">${isEdit ? 'Edit' : 'Add'} Chapter</h2>
                <button class="modal-close" onclick="closeModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="chapterForm">
                    <div class="form-row" style="display: grid; grid-template-columns: 100px 1fr; gap: 15px;">
                        <div class="form-group">
                            <label>Chapter #</label>
                            <input type="number" id="chapterNumber" min="1" value="${chapter?.chapterNumber || currentEbook.chapters.length + 1}" required>
                        </div>
                        <div class="form-group">
                            <label>Chapter Title <span style="color: #ef4444;">*</span></label>
                            <input type="text" id="chapterTitle" value="${chapter?.title || ''}" placeholder="e.g., The Beginning" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Summary</label>
                        <textarea id="chapterSummary" rows="3" placeholder="Brief description of this chapter">${chapter?.summary || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Link/URL (Optional)</label>
                        <input type="url" id="chapterLink" value="${chapter?.link || ''}" placeholder="https://example.com/chapter-1">
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 5px;">Link to external content (Google Docs, PDF, etc.)</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Content (Optional)</label>
                        <div id="chapterContentEditor" style="min-height: 200px;"></div>
                        <textarea id="chapterContent" style="display: none;">${chapter?.content || ''}</textarea>
                        <p style="color: #64748b; font-size: 0.85rem; margin-top: 5px;">Add content directly or use the link above</p>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveChapter(${isEdit ? `'${chapterId}'` : 'null'})">
                    ${isEdit ? 'Update' : 'Add'} Chapter
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').appendChild(modal);
    
    // Initialize Quill editor
    setTimeout(() => {
        const quill = new Quill('#chapterContentEditor', {
            theme: 'snow',
            placeholder: 'Write chapter content here...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['blockquote', 'link']
                ]
            }
        });
        
        if (chapter?.content) {
            quill.root.innerHTML = chapter.content;
        }
        
        quill.on('text-change', () => {
            document.getElementById('chapterContent').value = quill.root.innerHTML;
        });
    }, 100);
}

function saveChapter(chapterId) {
    const chapterData = {
        title: document.getElementById('chapterTitle').value,
        chapterNumber: parseInt(document.getElementById('chapterNumber').value),
        summary: document.getElementById('chapterSummary').value,
        link: document.getElementById('chapterLink').value,
        content: document.getElementById('chapterContent').value
    };
    
    if (!chapterData.title) {
        showToast('Please enter a chapter title', 'error');
        return;
    }
    
    if (chapterId) {
        ebookManager.updateChapter(currentEbookId, chapterId, chapterData);
        showToast('Chapter updated successfully', 'success');
    } else {
        ebookManager.addChapter(currentEbookId, chapterData);
        showToast('Chapter added successfully', 'success');
    }
    
    closeModal();
    loadEbook();
}

function editChapter(chapterId) {
    showChapterModal(chapterId);
}

function deleteChapter(chapterId) {
    if (!confirm('Are you sure you want to delete this chapter?')) {
        return;
    }
    
    ebookManager.deleteChapter(currentEbookId, chapterId);
    showToast('Chapter deleted', 'success');
    loadEbook();
}

function showEditEbookModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="modal-title">Edit Ebook Details</h2>
                <button class="modal-close" onclick="closeModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <form id="editEbookForm">
                    <div class="form-group">
                        <label>Topic/Title <span style="color: #ef4444;">*</span></label>
                        <input type="text" id="editTopic" value="${currentEbook.topic}" required>
                    </div>
                    
                    <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label>Author</label>
                            <input type="text" id="editAuthor" value="${currentEbook.author}">
                        </div>
                        <div class="form-group">
                            <label>Genre</label>
                            <input type="text" id="editGenre" value="${currentEbook.genre}" placeholder="e.g., Poetry, Fiction">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editDescription" rows="4">${currentEbook.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Cover Image URL</label>
                        <input type="url" id="editCoverImage" value="${currentEbook.coverImage}" placeholder="https://...">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveEbookDetails()">
                    Save Changes
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').appendChild(modal);
}

function saveEbookDetails() {
    const updates = {
        topic: document.getElementById('editTopic').value,
        author: document.getElementById('editAuthor').value,
        genre: document.getElementById('editGenre').value,
        description: document.getElementById('editDescription').value,
        coverImage: document.getElementById('editCoverImage').value
    };
    
    ebookManager.updateEbook(currentEbookId, updates);
    showToast('Ebook details updated', 'success');
    closeModal();
    loadEbook();
}

async function publishEbook() {
    // Check if GitHub is configured
    if (!githubPublisher.canPublish()) {
        const setup = confirm('GitHub is not configured. Would you like to set it up now to enable ebook publishing?');
        if (setup) {
            window.location.href = 'github-setup.html';
        }
        return;
    }
    
    // Validate ebook has chapters
    if (!currentEbook.chapters || currentEbook.chapters.length === 0) {
        showToast('Cannot publish an eBook without chapters. Please add at least one chapter first.', 'error', 5000);
        return;
    }
    
    // Confirm publishing
    const confirmed = confirm(`This will publish "${currentEbook.topic}" with ${currentEbook.chapters.length} chapter(s) to GitHub. Continue?`);
    if (!confirmed) {
        return;
    }
    
    try {
        showLoadingOverlay('Publishing eBook to GitHub...');
        
        const result = await githubPublisher.publishEbook(currentEbook);
        
        if (result.success) {
            hideLoadingOverlay();
            showToast(`eBook published successfully! It will be live at: ${result.url}`, 'success', 8000);
            
            // Show a more detailed success message
            const viewNow = confirm(`eBook published successfully!\n\nIt will be available at:\n${result.url}\n\nWould you like to open it in a new tab?`);
            if (viewNow) {
                window.open(result.url, '_blank');
            }
        }
    } catch (error) {
        hideLoadingOverlay();
        console.error('[Ebook Details] Publish failed:', error);
        showToast(`Failed to publish eBook: ${error.message}`, 'error', 5000);
    }
}

// Add loading overlay helpers if not already defined
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

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = '';
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}
