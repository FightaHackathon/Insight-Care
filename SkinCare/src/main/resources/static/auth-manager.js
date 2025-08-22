// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check if user is logged in on page load
        await this.checkAuthStatus();
        this.updateNavigation();
    }

    async checkAuthStatus() {
        try {
            console.log('Checking authentication status...');
            const response = await fetch('/api/auth/status');
            console.log('Auth status response:', response.status, response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Auth status data:', data);

                if (data.authenticated) {
                    this.currentUser = data.user;
                    console.log('User authenticated:', this.currentUser);
                } else {
                    console.log('User not authenticated');
                    this.currentUser = null;
                }
            } else {
                console.log('Auth status request failed:', response.status);
                this.currentUser = null;
            }
        } catch (error) {
            console.log('Error checking auth status:', error);
            this.currentUser = null;
        }
    }

    updateNavigation() {
        const profileContainer = document.querySelector('.profile-container');
        const profileBtn = document.querySelector('.profile-btn');
        const profileName = document.querySelector('.profile-name');
        const profileDropdown = document.querySelector('.profile-dropdown');

        if (this.currentUser) {
            // User is logged in
            // Update all elements with class 'profile-name' (both navigation and profile page)
            const profileNameElements = document.querySelectorAll('.profile-name');
            profileNameElements.forEach(element => {
                element.textContent = this.currentUser.name;
            });

            // Update profile page specific elements
            this.updateProfilePage();

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
            const profileNameElements = document.querySelectorAll('.profile-name');
            profileNameElements.forEach(element => {
                element.textContent = 'Guest';
            });

            // Reset profile page
            this.resetProfilePage();
        }
    }

    updateProfilePage() {
        if (!this.currentUser) return;

        // Update profile page title if it exists
        const profileTitle = document.querySelector('.profile-title');
        if (profileTitle) {
            profileTitle.textContent = this.currentUser.email;
        }

        // Update any other profile-specific elements here
        // For example, if there are input fields for editing profile
        const nameInput = document.querySelector('input[name="name"]');
        if (nameInput) {
            nameInput.value = this.currentUser.name;
        }

        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.value = this.currentUser.email;
        }
    }

    resetProfilePage() {
        // Reset profile page elements when user is not logged in
        const profileTitle = document.querySelector('.profile-title');
        if (profileTitle) {
            profileTitle.textContent = '';
        }

        const nameInput = document.querySelector('input[name="name"]');
        if (nameInput) {
            nameInput.value = '';
        }

        const emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.value = '';
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

            console.log('Login response:', response.status, response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Login response data:', data);

                if (data.status === 'ok') {
                    // Set user data from the response
                    this.currentUser = {
                        name: data.name,
                        email: data.email
                    };
                    console.log('Login successful, user set:', this.currentUser);

                    // Update navigation immediately
                    this.updateNavigation();

                    // Check auth status to ensure session is properly set
                    await this.checkAuthStatus();

                    return { success: true, user: this.currentUser };
                } else {
                    return { success: false, message: data.error || 'Login failed' };
                }
            } else {
                const data = await response.json();
                return { success: false, message: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error' };
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
                this.updateNavigation(); // Update UI immediately
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

    // Method to check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Method to get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}