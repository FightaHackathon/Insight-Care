// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is logged in on page load
        this.checkAuthStatus();
        this.updateNavigation();
        this.setupProfileDropdown();
    }

    async checkAuthStatus() {
        // First check session storage for auto-login after registration
        const userLoggedIn = sessionStorage.getItem('userLoggedIn');
        const userName = sessionStorage.getItem('userName');
        const userEmail = sessionStorage.getItem('userEmail');

        if (userLoggedIn === 'true' && userName && userEmail) {
            this.currentUser = {
                name: userName,
                email: userEmail
            };
            console.log('✅ User auto-logged in from session storage:', userName);
            return;
        }

        // Fallback: Check server session
        try {
            const response = await fetch('/api/auth/status');
            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    this.currentUser = data.user;
                }
            }
        } catch (error) {
            console.log('Not authenticated or error checking auth status');
        }
    }

    updateNavigation() {
        const profileContainer = document.querySelector('.profile-container');
        const profileBtn = document.querySelector('.profile-btn');
        const profileName = document.querySelector('.profile-name');
        const profileDropdown = document.querySelector('.profile-dropdown');

        if (this.currentUser) {
            // User is logged in
            if (profileName) {
                profileName.textContent = this.currentUser.name;
            }
            
            // Update dropdown to show logout option
            if (profileDropdown) {
                const loginItem = profileDropdown.querySelector('a[href*="Login"]');
                const signupItem = profileDropdown.querySelector('a[href*="SignUp"]');
                
                if (loginItem) {
                    loginItem.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/>
                            <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
                            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Log Out
                    `;
                    loginItem.href = '#';
                    loginItem.onclick = (e) => {
                        e.preventDefault();
                        this.logout();
                    };
                }
                
                if (signupItem) {
                    signupItem.style.display = 'none';
                }
            }
        } else {
            // User is not logged in
            if (profileName) {
                profileName.textContent = 'Guest';
            }
        }
    }

    async login(email, password) {
        try {
            console.log('Attempting login for:', email);

            // Use the existing LoginServlet endpoint with form data
            const formData = new URLSearchParams();
            formData.append('email', email);
            formData.append('password', password);

            const response = await fetch('/LoginServlet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.status === 'ok') {
                // Set user data
                this.currentUser = {
                    name: data.name,
                    email: data.email
                };

                // Store in session storage for persistence
                sessionStorage.setItem('userLoggedIn', 'true');
                sessionStorage.setItem('userName', data.name);
                sessionStorage.setItem('userEmail', data.email);

                this.updateNavigation();

                console.log('✅ Login successful for user:', data.name);

                return {
                    success: true,
                    message: 'Login successful',
                    user: this.currentUser
                };
            } else {
                console.error('❌ Login failed:', data.error || 'Unknown error');
                return {
                    success: false,
                    message: data.error || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Network error during login'
            };
        }
    }

    async logout() {
        try {
            const response = await fetch('/LogoutServlet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            if (response.ok) {
                this.currentUser = null;

                // Clear session storage
                sessionStorage.removeItem('userLoggedIn');
                sessionStorage.removeItem('userName');
                sessionStorage.removeItem('userEmail');

                this.showMessage('Logged out successfully', 'success');

                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Error during logout', 'error');
        }
    }

    showMessage(message, type = 'info') {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add toast styles if not already present
        if (!document.querySelector('#toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .toast-success { background: linear-gradient(135deg, #10b981, #059669); }
                .toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); }
                .toast-info { background: linear-gradient(135deg, #3b82f6, #2563eb); }
                .toast-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                    opacity: 0.8;
                }
                .toast-close:hover { opacity: 1; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Method to set user after successful login
    setUser(user) {
        this.currentUser = user;
        this.updateNavigation();
    }

    // Method to handle auto-login after registration
    setUserFromRegistration(userData) {
        this.currentUser = {
            name: userData.name,
            email: userData.email
        };

        // Store in session storage for persistence
        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('userName', userData.name);
        sessionStorage.setItem('userEmail', userData.email);

        this.updateNavigation();
        console.log('✅ User auto-logged in after registration:', userData.name);
    }

    // Method to check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Method to get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Setup profile dropdown functionality
    setupProfileDropdown() {
        // Use a small delay to ensure DOM is fully loaded
        setTimeout(() => {
            const profileBtn = document.querySelector('.profile-btn');
            const profileDropdown = document.querySelector('.profile-dropdown');

            console.log('Setting up profile dropdown...', { profileBtn, profileDropdown });

            if (profileBtn && profileDropdown) {
                // Remove any existing event listeners to avoid duplicates
                if (this.profileClickHandler) {
                    profileBtn.removeEventListener('click', this.profileClickHandler);
                }

                // Create bound handler
                this.profileClickHandler = (e) => {
                    console.log('Profile button clicked!');
                    e.preventDefault();
                    e.stopPropagation();
                    const isOpen = profileDropdown.classList.contains('dropdown-open');
                    console.log('Dropdown is currently open:', isOpen);
                    if (isOpen) {
                        profileDropdown.classList.remove('dropdown-open');
                        profileBtn.setAttribute('aria-expanded', 'false');
                        console.log('Closing dropdown');
                    } else {
                        profileDropdown.classList.add('dropdown-open');
                        profileBtn.setAttribute('aria-expanded', 'true');
                        console.log('Opening dropdown');
                    }
                };

                // Add click handler
                profileBtn.addEventListener('click', this.profileClickHandler);
                console.log('Profile dropdown event listener added');

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                        profileDropdown.classList.remove('dropdown-open');
                        profileBtn.setAttribute('aria-expanded', 'false');
                    }
                });
            } else {
                console.warn('Profile button or dropdown not found');
            }
        }, 100);
    }
}

// Make AuthManager available globally
window.AuthManager = AuthManager;

// Initialize auth manager when DOM is loaded
function initializeAuthManager() {
    if (!window.authManager) {
        console.log('Initializing AuthManager...');
        window.authManager = new AuthManager();
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthManager);
} else {
    // DOM is already loaded, initialize immediately
    initializeAuthManager();
}

// Also initialize on window load as a fallback
window.addEventListener('load', function() {
    if (!window.authManager) {
        console.log('Fallback: Initializing AuthManager on window load...');
        window.authManager = new AuthManager();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}