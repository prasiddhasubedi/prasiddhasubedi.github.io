// ==========================================
// LOGIN PAGE FUNCTIONALITY
// Handles the login form and UI interactions
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[LOGIN] Initializing login page');

    // Check if already logged in
    if (window.auth.isAuthenticated()) {
        console.log('[LOGIN] User already authenticated, redirecting...');
        window.location.href = 'dashboard.html';
        return;
    }

    // Initialize UI elements
    initializeLoginForm();
    initializePasswordToggle();
    
    console.log('[LOGIN] Login page initialized successfully');
});

// ==========================================
// LOGIN FORM HANDLING
// ==========================================

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginBtn = document.getElementById('loginBtn');
    const alertBox = document.getElementById('alertBox');

    if (!loginForm) {
        console.error('[LOGIN] Login form not found');
        return;
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear any existing alerts
        hideAlert();

        // Get form values
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        // Validate inputs
        if (!username || !password) {
            showAlert('Please enter both username and password', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            // Attempt login
            const result = await window.auth.login(username, password, rememberMe);
            
            if (result.success) {
                showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        } catch (error) {
            console.error('[LOGIN] Login error:', error);
            showAlert(error.message, 'error');
            
            // Clear password field on error
            passwordInput.value = '';
            passwordInput.focus();
        } finally {
            setLoadingState(false);
        }
    });

    // Add input validation
    usernameInput.addEventListener('input', function() {
        validateInput(this);
    });

    passwordInput.addEventListener('input', function() {
        validateInput(this);
    });

    // Focus username field on load
    usernameInput.focus();
}

// ==========================================
// PASSWORD TOGGLE FUNCTIONALITY
// ==========================================

function initializePasswordToggle() {
    const toggleBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');
    const eyeOffIcon = document.querySelector('.eye-off-icon');

    if (!toggleBtn || !passwordInput) {
        console.error('[LOGIN] Password toggle elements not found');
        return;
    }

    toggleBtn.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        
        // Toggle input type
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Toggle icons
        eyeIcon.classList.toggle('hidden', isPassword);
        eyeOffIcon.classList.toggle('hidden', !isPassword);
        
        // Update aria-label
        toggleBtn.setAttribute('aria-label', 
            isPassword ? 'Hide password' : 'Show password'
        );
        
        // Keep focus on input
        passwordInput.focus();
    });
}

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================

function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeHTML(message);

    alertBox.textContent = sanitizedMessage;
    alertBox.className = `alert ${type}`;
    alertBox.classList.remove('hidden');

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideAlert();
        }, 5000);
    }
}

function hideAlert() {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    alertBox.classList.add('hidden');
    alertBox.textContent = '';
}

function setLoadingState(isLoading) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (isLoading) {
        loginBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        usernameInput.disabled = true;
        passwordInput.disabled = true;
    } else {
        loginBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        usernameInput.disabled = false;
        passwordInput.disabled = false;
    }
}

function validateInput(input) {
    if (!input) return;

    // Remove invalid characters in real-time for username
    if (input.id === 'username') {
        input.value = input.value.replace(/[<>]/g, '');
    }

    // Add visual feedback for validation
    if (input.value.length > 0) {
        input.style.borderColor = 'var(--primary-color)';
    } else {
        input.style.borderColor = 'var(--border-color)';
    }
}

// ==========================================
// SECURITY HELPER FUNCTIONS
// ==========================================

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', function(e) {
    // Press Escape to clear the form
    if (e.key === 'Escape') {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput && passwordInput) {
            usernameInput.value = '';
            passwordInput.value = '';
            hideAlert();
            usernameInput.focus();
        }
    }
});

// ==========================================
// PREVENT FORM RESUBMISSION ON REFRESH
// ==========================================

if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
