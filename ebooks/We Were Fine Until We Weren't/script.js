/* ==========================================
   WE WERE FINE UNTIL WE WEREN'T - EBOOK SCRIPT
   Interactive Functionality
   ========================================== */

(function() {
  'use strict';

  // Configuration
  const STORAGE_KEY = 'ebook_we_were_fine_engagement';
  const WORK_ID = 'we-were-fine-until-we-werent';

  // Initialize engagement data
  let engagementData = loadEngagementData();

  // DOM Elements
  const likeBtn = document.querySelector('.like-btn');
  const commentBtn = document.querySelector('.comment-btn');
  const shareBtn = document.querySelector('.share-btn');
  const commentModal = document.getElementById('commentModal');
  const closeModalBtn = document.getElementById('closeModal');
  const submitCommentBtn = document.getElementById('submitComment');
  const commentText = document.getElementById('commentText');
  const commentName = document.getElementById('commentName');
  const charCount = document.getElementById('charCount');
  const commentsContainer = document.getElementById('commentsContainer');
  const coverImage = document.getElementById('coverImage');
  const coverPlaceholder = document.getElementById('coverPlaceholder');

  // Initialize
  function init() {
    updateEngagementUI();
    attachEventListeners();
    loadComments();
    handleCoverImage();
  }

  // Handle cover image loading
  function handleCoverImage() {
    if (coverImage && coverPlaceholder) {
      coverImage.addEventListener('error', function() {
        coverImage.style.display = 'none';
        coverPlaceholder.style.display = 'flex';
      });
    }
  }

  // Load engagement data from localStorage
  function loadEngagementData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading engagement data:', e);
    }
    
    return {
      likes: 0,
      comments: [],
      shares: 0,
      userLiked: false
    };
  }

  // Save engagement data to localStorage
  function saveEngagementData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(engagementData));
    } catch (e) {
      console.error('Error saving engagement data:', e);
    }
  }

  // Update engagement UI
  function updateEngagementUI() {
    if (likeBtn) {
      const likeCount = likeBtn.querySelector('.count');
      if (likeCount) {
        likeCount.textContent = engagementData.likes;
      }
      if (engagementData.userLiked) {
        likeBtn.classList.add('active');
      } else {
        likeBtn.classList.remove('active');
      }
    }

    if (commentBtn) {
      const commentCount = commentBtn.querySelector('.count');
      if (commentCount) {
        commentCount.textContent = engagementData.comments.length;
      }
    }
  }

  // Attach event listeners
  function attachEventListeners() {
    // Like button
    if (likeBtn) {
      likeBtn.addEventListener('click', handleLike);
    }

    // Comment button
    if (commentBtn) {
      commentBtn.addEventListener('click', openCommentModal);
    }

    // Share button
    if (shareBtn) {
      shareBtn.addEventListener('click', handleShare);
    }

    // Modal close
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeCommentModal);
    }

    // Modal overlay click
    if (commentModal) {
      const overlay = commentModal.querySelector('.modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', closeCommentModal);
      }
      
      // Prevent modal content clicks from bubbling to overlay
      const modalContent = commentModal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.addEventListener('click', function(e) {
          e.stopPropagation();
        });
      }
    }

    // Submit comment
    if (submitCommentBtn) {
      submitCommentBtn.addEventListener('click', handleCommentSubmit);
    }

    // Character count
    if (commentText) {
      commentText.addEventListener('input', updateCharCount);
    }

    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && commentModal && commentModal.classList.contains('active')) {
        closeCommentModal();
      }
    });
  }

  // Handle like
  function handleLike() {
    if (engagementData.userLiked) {
      engagementData.likes = Math.max(0, engagementData.likes - 1);
      engagementData.userLiked = false;
    } else {
      engagementData.likes++;
      engagementData.userLiked = true;
      animateButton(likeBtn);
    }
    
    saveEngagementData();
    updateEngagementUI();
  }

  // Handle share
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'We Were Fine Until We Weren\'t - Prasiddha Subedi',
        text: 'Check out this ebook: We Were Fine Until We Weren\'t by Prasiddha Subedi',
        url: window.location.href
      }).then(() => {
        engagementData.shares++;
        saveEngagementData();
        animateButton(shareBtn);
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          fallbackShare();
        }
      });
    } else {
      fallbackShare();
    }
  }

  // Fallback share
  function fallbackShare() {
    const url = window.location.href;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showNotification('Link copied to clipboard!');
        engagementData.shares++;
        saveEngagementData();
        animateButton(shareBtn);
      }).catch((err) => {
        console.error('Failed to copy:', err);
        showNotification('Unable to copy link. Please copy manually: ' + url);
      });
    } else {
      // Fallback for browsers without Clipboard API
      showNotification('Share URL: ' + url);
    }
  }

  // Open comment modal
  function openCommentModal() {
    if (commentModal) {
      commentModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (commentText) {
        commentText.focus();
      }
    }
  }

  // Close comment modal
  function closeCommentModal() {
    if (commentModal) {
      commentModal.classList.remove('active');
      document.body.style.overflow = '';
      
      // Clear form
      if (commentText) commentText.value = '';
      if (commentName) commentName.value = '';
      if (charCount) charCount.textContent = '0';
    }
  }

  // Handle comment submit
  function handleCommentSubmit() {
    if (!commentText) return;
    
    const text = commentText.value.trim();
    const name = commentName ? commentName.value.trim() : '';
    
    if (!text) {
      showNotification('Please enter your thoughts');
      return;
    }
    
    const comment = {
      id: Date.now(),
      text: text,
      name: name || 'Anonymous',
      timestamp: new Date().toISOString()
    };
    
    engagementData.comments.unshift(comment);
    saveEngagementData();
    updateEngagementUI();
    loadComments();
    closeCommentModal();
    showNotification('Thank you for sharing your thoughts!');
  }

  // Update character count
  function updateCharCount() {
    if (charCount && commentText) {
      charCount.textContent = commentText.value.length;
    }
  }

  // Load comments
  function loadComments() {
    if (!commentsContainer) return;
    
    if (engagementData.comments.length === 0) {
      commentsContainer.innerHTML = '<p class="no-comments">No thoughts shared yet. Be the first!</p>';
      return;
    }
    
    const commentsHTML = engagementData.comments.map(comment => {
      const date = new Date(comment.timestamp);
      const formattedDate = formatDate(date);
      
      return `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(comment.name)}</span>
            <span class="comment-date">${formattedDate}</span>
          </div>
          <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
      `;
    }).join('');
    
    commentsContainer.innerHTML = commentsHTML;
  }

  // Format date
  function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Animate button
  function animateButton(button) {
    if (!button) return;
    
    button.classList.add('animate');
    setTimeout(() => {
      button.classList.remove('animate');
    }, 600);
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
