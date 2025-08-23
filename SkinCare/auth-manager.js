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
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.textContent = message;
        
        // Add styles if not present
        if (!document.querySelector('#message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'message-styles';
            styles.textContent = `
                .auth-message {
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
                .auth-message-success { background: linear-gradient(135deg, #10b981, #059669); }
                .auth-message-error { background: linear-gradient(135deg, #ef4444, #dc2626); }
                .auth-message-info { background: linear-gradient(135deg, #3b82f6, #2563eb); }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
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
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}