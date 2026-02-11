// ==========================================
// AUTHENTICATION MODULE
// Secure authentication with hashing and session management
// ==========================================

const AUTH_CONFIG = {
    SESSION_KEY: 'admin_session',
    SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 900000, // 15 minutes in milliseconds
    ATTEMPTS_KEY: 'login_attempts',
    LOCKOUT_KEY: 'login_lockout'
};

// Simple hash function for password comparison (client-side only)
// In production, this should be handled server-side with proper hashing like bcrypt
async function simpleHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default admin credentials (hashed)
// In production, these should be stored securely on the server
// NOTE: This is a simplified client-side hash for demonstration.
// For production, use proper server-side authentication with bcrypt, scrypt, or Argon2
const ADMIN_CREDENTIALS = {
    username: 'admin',
    // Password: prasiddha@592 (pre-hashed)
    passwordHash: 'd20a1cc6f8029548ffe263d0ce11e51ddfde6ba68fbd258ecb3121079eeb9be8'
};

class Auth {
    constructor() {
        this.session = null;
        this.loadSession();
    }

    // Load session from localStorage
    loadSession() {
        try {
            const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                // Check if session is expired
                if (this.isSessionValid(session)) {
                    this.session = session;
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.clearSession();
        }
    }

    // Check if session is valid and not expired
    isSessionValid(session) {
        if (!session || !session.timestamp) return false;
        
        const now = Date.now();
        const elapsed = now - session.timestamp;
        
        return elapsed < AUTH_CONFIG.SESSION_TIMEOUT;
    }

    // Save session to localStorage
    saveSession(username) {
        const session = {
            username: username,
            timestamp: Date.now(),
            id: this.generateSessionId()
        };
        
        localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
        this.session = session;
    }

    // Generate a random session ID
    generateSessionId() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Clear session
    clearSession() {
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        this.session = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        if (!this.session) return false;
        
        if (!this.isSessionValid(this.session)) {
            this.clearSession();
            return false;
        }
        
        return true;
    }

    // Get current user
    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        return this.session.username;
    }

    // Check for login lockout
    isLockedOut() {
        const lockoutData = localStorage.getItem(AUTH_CONFIG.LOCKOUT_KEY);
        if (!lockoutData) return false;
        
        const lockoutTime = parseInt(lockoutData, 10);
        const now = Date.now();
        
        if (now - lockoutTime < AUTH_CONFIG.LOCKOUT_TIME) {
            return true;
        }
        
        // Lockout expired, clear it
        localStorage.removeItem(AUTH_CONFIG.LOCKOUT_KEY);
        localStorage.removeItem(AUTH_CONFIG.ATTEMPTS_KEY);
        return false;
    }

    // Get remaining lockout time in minutes
    getRemainingLockoutTime() {
        const lockoutData = localStorage.getItem(AUTH_CONFIG.LOCKOUT_KEY);
        if (!lockoutData) return 0;
        
        const lockoutTime = parseInt(lockoutData, 10);
        const now = Date.now();
        const remaining = AUTH_CONFIG.LOCKOUT_TIME - (now - lockoutTime);
        
        return Math.ceil(remaining / 60000); // Convert to minutes
    }

    // Record failed login attempt
    recordFailedAttempt() {
        const attemptsData = localStorage.getItem(AUTH_CONFIG.ATTEMPTS_KEY);
        const attempts = attemptsData ? parseInt(attemptsData, 10) : 0;
        const newAttempts = attempts + 1;
        
        localStorage.setItem(AUTH_CONFIG.ATTEMPTS_KEY, newAttempts.toString());
        
        if (newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
            localStorage.setItem(AUTH_CONFIG.LOCKOUT_KEY, Date.now().toString());
            localStorage.removeItem(AUTH_CONFIG.ATTEMPTS_KEY);
            return true; // Locked out
        }
        
        return false; // Not locked out yet
    }

    // Get remaining login attempts
    getRemainingAttempts() {
        const attemptsData = localStorage.getItem(AUTH_CONFIG.ATTEMPTS_KEY);
        const attempts = attemptsData ? parseInt(attemptsData, 10) : 0;
        return Math.max(0, AUTH_CONFIG.MAX_LOGIN_ATTEMPTS - attempts);
    }

    // Clear failed attempts
    clearFailedAttempts() {
        localStorage.removeItem(AUTH_CONFIG.ATTEMPTS_KEY);
    }

    // Login function
    async login(username, password, rememberMe = false) {
        // Check if locked out
        if (this.isLockedOut()) {
            const minutes = this.getRemainingLockoutTime();
            throw new Error(`Too many failed attempts. Please try again in ${minutes} minute(s).`);
        }

        // Sanitize inputs
        username = this.sanitizeInput(username);
        
        // Validate inputs
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Hash the password
        const passwordHash = await simpleHash(password);
        
        // Check credentials
        if (username === ADMIN_CREDENTIALS.username && 
            passwordHash === ADMIN_CREDENTIALS.passwordHash) {
            
            // Clear failed attempts on successful login
            this.clearFailedAttempts();
            
            // Save session
            this.saveSession(username);
            
            return {
                success: true,
                username: username
            };
        } else {
            // Record failed attempt
            const lockedOut = this.recordFailedAttempt();
            
            if (lockedOut) {
                const minutes = this.getRemainingLockoutTime();
                throw new Error(`Too many failed attempts. Account locked for ${minutes} minute(s).`);
            }
            
            const remaining = this.getRemainingAttempts();
            throw new Error(`Invalid credentials. ${remaining} attempt(s) remaining.`);
        }
    }

    // Logout function
    logout() {
        this.clearSession();
    }

    // Hash password (simplified for demo - use proper server-side hashing in production)
    async hashPassword(password) {
        // Using MD5-like simple hash for demo purposes
        // In production, use bcrypt or similar on the server
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
    }

    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove < and > to prevent script injection
            .substring(0, 100); // Limit length
    }

    // Refresh session timestamp
    refreshSession() {
        if (this.session) {
            this.session.timestamp = Date.now();
            localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(this.session));
        }
    }
}

// Create global auth instance
window.auth = new Auth();

// Automatically refresh session on user activity
let activityTimeout;
function resetActivityTimer() {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        if (window.auth.isAuthenticated()) {
            window.auth.refreshSession();
        }
    }, 60000); // Refresh every minute of activity
}

// Listen for user activity
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, true);
});

// Check session periodically
setInterval(() => {
    if (window.auth && !window.auth.isAuthenticated()) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && currentPath.includes('admin')) {
            window.location.href = 'login.html';
        }
    }
}, 30000); // Check every 30 seconds
