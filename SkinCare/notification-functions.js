/**
 * Notification System for SkinCare Application
 * 
 * How to use:
 * 1. Include this file in your HTML: <script src="notification-functions.js"></script>
 * 2. Call addNotification(type, title, message) anywhere in your code
 * 3. Notifications will appear in the bell dropdown automatically
 */

// Global notification counter
let notificationCount = 0;

// Persistent notification storage key
const NOTIFICATION_STORAGE_KEY = 'skincare_notifications';

/**
 * Save notifications to localStorage
 */
function saveNotificationsToStorage(notifications) {
    try {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
        console.warn('Could not save notifications to localStorage:', error);
    }
}

/**
 * Load notifications from localStorage
 */
function loadNotificationsFromStorage() {
    try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Could not load notifications from localStorage:', error);
        return [];
    }
}

/**
 * Add a new notification to the system (with persistence)
 * @param {string} type - Type of notification ('booking', 'reminder', 'update', 'clinic-update')
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function addNotification(type, title, message) {
    // Create notification object
    const notification = {
        id: Date.now() + Math.random(), // Unique ID
        type: type,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };

    // Save to localStorage
    const notifications = loadNotificationsFromStorage();
    notifications.unshift(notification); // Add to beginning

    // Keep only last 50 notifications to prevent storage bloat
    if (notifications.length > 50) {
        notifications.splice(50);
    }

    saveNotificationsToStorage(notifications);

    // Update UI
    renderNotifications();

    // Show toast notification
    showToastNotification(type, title, message);

    console.log(`Notification added and saved: ${title}`);
}

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Icon HTML or emoji
 */
function getNotificationIcon(type) {
    const icons = {
        'booking': '📅',
        'reminder': '⏰', 
        'update': '📝',
        'clinic-update': '🏥',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'info': 'ℹ️'
    };
    return icons[type] || '🔔';
}

/**
 * Get relative time string
 * @param {Date} date - Date object
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

/**
 * Render all notifications from storage
 */
function renderNotifications() {
    const notificationList = document.getElementById('notification-list') || document.getElementById('nav-notification-list');
    const emptyNotifications = document.getElementById('empty-notifications') || document.getElementById('nav-empty-notifications');

    if (!notificationList) {
        console.warn('Notification list not found');
        return;
    }

    // Load notifications from storage
    const notifications = loadNotificationsFromStorage();

    // Clear existing notifications (except empty state)
    const existingNotifications = notificationList.querySelectorAll('.notification-item');
    existingNotifications.forEach(item => item.remove());

    if (notifications.length === 0) {
        // Show empty state
        if (emptyNotifications) {
            emptyNotifications.style.display = 'flex';
        }
    } else {
        // Hide empty state
        if (emptyNotifications) {
            emptyNotifications.style.display = 'none';
        }

        // Render each notification
        notifications.forEach(notif => {
            const notificationElement = createNotificationElement(notif);
            notificationList.appendChild(notificationElement);
        });
    }

    // Update badge count
    updateNotificationBadge();
}

/**
 * Create notification DOM element
 */
function createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification-item ${notification.read ? '' : 'unread'}`;
    element.dataset.notificationId = notification.id;

    element.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon ${notification.type}">
                ${getNotificationIcon(notification.type)}
            </div>
            <div class="notification-text">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${getTimeAgo(new Date(notification.timestamp))}</div>
            </div>
        </div>
    `;

    // Add click handler to mark as read
    element.addEventListener('click', function() {
        markNotificationAsRead(notification.id);
    });

    return element;
}

/**
 * Mark notification as read
 */
function markNotificationAsRead(notificationId) {
    const notifications = loadNotificationsFromStorage();
    const notification = notifications.find(n => n.id === notificationId);

    if (notification && !notification.read) {
        notification.read = true;
        saveNotificationsToStorage(notifications);

        // Update UI
        const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (element) {
            element.classList.remove('unread');
        }

        updateNotificationBadge();
    }
}

/**
 * Update notification badge count
 */
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    const notifications = loadNotificationsFromStorage();
    const unreadCount = notifications.filter(n => !n.read).length;

    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';

        // Add animation class
        if (unreadCount > 0) {
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
}

/**
 * Show temporary toast notification
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
function showToastNotification(type, title, message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-content">
            <div class="notification-icon ${type}">
                ${getNotificationIcon(type)}
            </div>
            <div class="toast-text">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

/**
 * Clear all notifications
 */
function clearAllNotifications() {
    // Clear from storage
    saveNotificationsToStorage([]);

    // Re-render UI
    renderNotifications();

    console.log('All notifications cleared');
}

/**
 * Initialize notification system
 * Call this when the page loads
 */
function initNotificationSystem() {
    console.log('Initializing notification system...');

    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        // Notification dropdown toggle
        const notificationBtn = document.getElementById('notification-btn');
        const notificationDropdown = document.getElementById('notification-dropdown');

        console.log('Notification button found:', !!notificationBtn);
        console.log('Notification dropdown found:', !!notificationDropdown);

        if (notificationBtn && notificationDropdown) {
            // Remove any existing listeners to prevent duplicates
            notificationBtn.removeEventListener('click', handleNotificationClick);

            // Add click handler
            notificationBtn.addEventListener('click', handleNotificationClick);

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                    notificationDropdown.classList.remove('show');
                }
            });

            console.log('Notification click handler attached');
        } else {
            console.warn('Notification elements not found');
        }

        // Clear all notifications button
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', clearAllNotifications);
        }

        // Load and render existing notifications
        renderNotifications();

        console.log('Notification system initialized successfully');
    }, 100);
}

/**
 * Handle notification button click
 */
function handleNotificationClick(e) {
    console.log('Notification button clicked');
    e.preventDefault();
    e.stopPropagation();

    const notificationDropdown = document.getElementById('notification-dropdown');
    if (notificationDropdown) {
        const isVisible = notificationDropdown.classList.contains('show');
        if (isVisible) {
            notificationDropdown.classList.remove('show');
            console.log('Notification dropdown hidden');
        } else {
            notificationDropdown.classList.add('show');
            console.log('Notification dropdown shown');
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initNotificationSystem);

// Also initialize when window loads (backup)
window.addEventListener('load', function() {
    setTimeout(initNotificationSystem, 500);
});

// Manual initialization function for troubleshooting
window.initNotifications = initNotificationSystem;

// ===== QUICK EXAMPLES =====

/**
 * Example functions you can call from anywhere in your app
 */

// Booking confirmation
function notifyBookingConfirmed(appointmentDate, appointmentTime) {
    addNotification(
        'booking',
        'Appointment Confirmed!',
        `Your skincare consultation is scheduled for ${appointmentDate} at ${appointmentTime}`
    );
}

// Test completion
function notifyTestComplete(testType) {
    addNotification(
        'update',
        `${testType} Complete!`,
        'Your personalized results and recommendations are ready to view'
    );
}

// Profile update
function notifyProfileUpdated() {
    addNotification(
        'success',
        'Profile Updated',
        'Your profile information has been successfully saved'
    );
}

// Reminder notification
function notifySkincareReminder() {
    addNotification(
        'reminder',
        'Skincare Reminder',
        "Don't forget your evening skincare routine!"
    );
}

// Clinic update
function notifyClinicUpdate(clinicName) {
    addNotification(
        'clinic-update',
        'New Services Available',
        `${clinicName} has added new treatments. Check them out!`
    );
}

// Error notification
function notifyError(errorMessage) {
    addNotification(
        'error',
        'Something went wrong',
        errorMessage
    );
}

// Success notification
function notifySuccess(message) {
    addNotification(
        'success',
        'Success!',
        message
    );
}
