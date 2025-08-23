// Main application entry point for SkinCare website - Compiled from TypeScript

import { ScrollAnimations, DOMUtils } from './utils.js';
import { DropdownComponent, ChatComponent, TabComponent, ProfileComponent } from './components.js';

class SkinCareApp {
  constructor() {
    // ThemeManager removed - using light theme only
    this.scrollAnimations = new ScrollAnimations();
    this.profileDropdown = null;
    this.chatComponent = null;
    this.tabComponent = null;
    this.profileComponent = null;
    this.journalInitialized = false;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.initializeComponents.bind(this));
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      this.initializeProfileDropdown();
      this.initializeChatComponent();
      this.initializeTabComponent();
      this.initializeProfileComponent();
      this.initializeProfileEditMode();
      this.initializeNotificationSystem();
      this.initializeNavNotificationSystem();
      this.initializeScrollAnimations();
      // Theme toggle removed - using light theme only
      this.initializeRippleEffects();
      this.initializeKeyboardNavigation();
    } catch (error) {
      console.warn('Some components could not be initialized:', error);
    }
  }

  initializeProfileDropdown() {
    const profileIcon = document.querySelector('.profile-icon');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileIcon && profileDropdown) {
      this.profileDropdown = new DropdownComponent('.profile-icon', '.profile-dropdown');
    }
  }

  initializeChatComponent() {
    const chatBox = document.getElementById('chatbox');
    if (chatBox) {
      this.chatComponent = new ChatComponent();
    }
  }

  initializeTabComponent() {
    const tabContainer = document.querySelector('.tabs');
    if (tabContainer) {
      this.tabComponent = new TabComponent('.tabs', '.tab-content');
      
      // Listen for tab changes
      tabContainer.addEventListener('tabchange', (event) => {
        console.log('Tab changed to:', event.detail.tabId);
        this.handleTabChange(event.detail.tabId);
      });
    }
  }

  initializeProfileComponent() {
    const profileForm = document.querySelector('form');
    if (profileForm) {
      this.profileComponent = new ProfileComponent('form');
    }
  }

  initializeProfileEditMode() {
    const editBtn = document.getElementById('edit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const editActions = document.getElementById('edit-actions');
    const profileForm = document.getElementById('profile-form');

    if (!editBtn || !cancelBtn || !saveBtn || !editActions || !profileForm) {
      return; // Elements not found, probably not on profile page
    }

    // Store original values for cancel functionality
    let originalValues = {};

    // Edit button click handler
    editBtn.addEventListener('click', () => {
      this.enableEditMode();
    });

    // Cancel button click handler
    cancelBtn.addEventListener('click', () => {
      this.disableEditMode();
      this.restoreOriginalValues();
    });

    // Save button click handler (form submission)
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfileChanges();
    });
  }

  enableEditMode() {
    const editBtn = document.getElementById('edit-btn');
    const editActions = document.getElementById('edit-actions');
    const formInputs = document.querySelectorAll('#profile-form input, #profile-form select');

    // Store original values
    this.originalValues = {};
    formInputs.forEach(input => {
      this.originalValues[input.id] = input.value;
    });

    // Hide edit button, show save/cancel buttons
    editBtn.style.display = 'none';
    editActions.style.display = 'flex';

    // Enable all form inputs
    formInputs.forEach(input => {
      if (input.tagName === 'SELECT') {
        input.disabled = false;
      } else {
        input.readOnly = false;
      }
      input.classList.add('editable');
    });

    // Add visual feedback
    const profileForm = document.getElementById('profile-form');
    profileForm.classList.add('edit-mode');

    // Focus on first input
    const firstInput = document.querySelector('#profile-form input:not([readonly])');
    if (firstInput) {
      firstInput.focus();
    }
  }

  disableEditMode() {
    const editBtn = document.getElementById('edit-btn');
    const editActions = document.getElementById('edit-actions');
    const formInputs = document.querySelectorAll('#profile-form input, #profile-form select');

    // Show edit button, hide save/cancel buttons
    editBtn.style.display = 'flex';
    editActions.style.display = 'none';

    // Disable all form inputs
    formInputs.forEach(input => {
      if (input.tagName === 'SELECT') {
        input.disabled = true;
      } else {
        input.readOnly = true;
      }
      input.classList.remove('editable');
    });

    // Remove visual feedback
    const profileForm = document.getElementById('profile-form');
    profileForm.classList.remove('edit-mode');
  }

  restoreOriginalValues() {
    if (this.originalValues) {
      Object.keys(this.originalValues).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
          input.value = this.originalValues[inputId];
        }
      });
    }
  }

  saveProfileChanges() {
    const formData = new FormData(document.getElementById('profile-form'));
    const profileData = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
      profileData[key] = value;
    }

    // Show loading state
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="animate-spin">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      Saving...
    `;
    saveBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      // Reset button state
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;

      // Show success message
      this.showSuccessMessage('Profile updated successfully!');

      // Update profile header with new data
      this.updateProfileHeader(profileData);

      // Disable edit mode
      this.disableEditMode();

      // Store data in localStorage (for demo purposes)
      localStorage.setItem('skincare-profile', JSON.stringify(profileData));
    }, 1500);
  }

  showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>${message}</span>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  updateProfileHeader(profileData) {
    // Update profile name in header
    const profileName = document.querySelector('.profile-name');
    if (profileName && profileData.firstName && profileData.lastName) {
      profileName.textContent = `${profileData.firstName} ${profileData.lastName}`;
    }

    // Update navigation profile name
    const navProfileName = document.querySelector('.nav-actions .profile-name');
    if (navProfileName && profileData.firstName) {
      navProfileName.textContent = profileData.firstName;
    }
  }

  initializeNotificationSystem() {
    // Initialize notification system
    this.notifications = this.loadNotifications();
    this.renderNotifications();
    
    // Listen for new booking events
    this.setupBookingNotificationListener();
    
    // Setup demo button
    this.setupDemoButton();
  }

  initializeNavNotificationSystem() {
    // Initialize navigation notification bell
    this.setupNotificationBell();
    this.updateNotificationBadge();
    this.renderNavNotifications();
    
    // Setup notification dropdown functionality
    this.setupNotificationDropdown();
    
    // Setup clear all functionality
    this.setupClearAllNotifications();
  }

  loadNotifications() {
    // Load notifications from localStorage
    const stored = localStorage.getItem('skincare-notifications');
    return stored ? JSON.parse(stored) : [];
  }

  saveNotifications() {
    // Save notifications to localStorage
    localStorage.setItem('skincare-notifications', JSON.stringify(this.notifications));
  }

  addNotification(notification) {
    // Add new notification
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.renderNotifications();
    this.renderNavNotifications();
    this.updateNotificationBadge();
    
    // Show toast notification
    this.showToastNotification(newNotification);
  }

  renderNotifications() {
    const notificationList = document.getElementById('notification-list');
    const emptyState = document.getElementById('empty-notifications');
    
    if (!notificationList) return;

    if (this.notifications.length === 0) {
      // Show empty state
      emptyState.style.display = 'flex';
      return;
    }

    // Hide empty state and render notifications
    emptyState.style.display = 'none';
    
    const notificationsHTML = this.notifications.map(notification => 
      this.createNotificationHTML(notification)
    ).join('');
    
    notificationList.innerHTML = notificationsHTML;
    
    // Add click handlers
    this.addNotificationClickHandlers();
  }

  createNotificationHTML(notification) {
    const timeAgo = this.getTimeAgo(notification.timestamp);
    const iconClass = this.getNotificationIconClass(notification.type);
    const icon = this.getNotificationIcon(notification.type);
    
    return `
      <div class="notification-item-card ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
        <div class="notification-icon ${iconClass}">
          ${icon}
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">${notification.title}</span>
            <span class="notification-time">${timeAgo}</span>
          </div>
          <div class="notification-message">${notification.message}</div>
          ${notification.details ? `
            <div class="notification-details">
              ${notification.details.map(detail => `
                <span class="notification-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  ${detail}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getNotificationIconClass(type) {
    switch (type) {
      case 'booking': return 'booking';
      case 'reminder': return 'reminder';
      case 'update': return 'update';
      case 'clinic_update': return 'clinic-update';
      default: return 'booking';
    }
  }

  getNotificationIcon(type) {
    switch (type) {
      case 'booking':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      case 'reminder':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      case 'update':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      case 'clinic_update':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        </svg>`;
    }
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  }

  addNotificationClickHandlers() {
    const notificationCards = document.querySelectorAll('.notification-item-card');
    notificationCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.markNotificationAsRead(id);
      });
    });
  }

  markNotificationAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.renderNotifications();
    }
  }

  setupBookingNotificationListener() {
    // Listen for booking events from other pages and same page
    const handleStorageEvent = (e) => {
      if (e.key === 'skincare-new-booking' && e.newValue) {
        const bookingData = JSON.parse(e.newValue);
        this.handleNewBooking(bookingData);
        // Clear the trigger
        localStorage.removeItem('skincare-new-booking');
      }
      
      if (e.key === 'skincare-clinic-update' && e.newValue) {
        const clinicData = JSON.parse(e.newValue);
        this.handleClinicUpdate(clinicData);
        // Clear the trigger
        localStorage.removeItem('skincare-clinic-update');
      }
    };

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', handleStorageEvent);
    
    // Poll for new notifications every 10 seconds (reduced frequency for performance)
    // Only poll when page is visible to reduce CPU usage
    let pollInterval;

    const startPolling = () => {
      if (pollInterval) return; // Already polling

      pollInterval = setInterval(() => {
        // Only poll if page is visible
        if (document.hidden) return;

        const newBooking = localStorage.getItem('skincare-new-booking');
        if (newBooking) {
          const bookingData = JSON.parse(newBooking);
          this.handleNewBooking(bookingData);
          localStorage.removeItem('skincare-new-booking');
        }

        const clinicUpdate = localStorage.getItem('skincare-clinic-update');
        if (clinicUpdate) {
          const clinicData = JSON.parse(clinicUpdate);
          this.handleClinicUpdate(clinicData);
          localStorage.removeItem('skincare-clinic-update');
        }
      }, 10000); // Increased from 2 seconds to 10 seconds
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    // Start polling when page becomes visible, stop when hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    });

    // Start initial polling
    startPolling();

    // Also check for bookings when page loads
    const newBooking = localStorage.getItem('skincare-new-booking');
    if (newBooking) {
      const bookingData = JSON.parse(newBooking);
      this.handleNewBooking(bookingData);
      localStorage.removeItem('skincare-new-booking');
    }

    // Also check for clinic updates when page loads
    const clinicUpdate = localStorage.getItem('skincare-clinic-update');
    if (clinicUpdate) {
      const clinicData = JSON.parse(clinicUpdate);
      this.handleClinicUpdate(clinicData);
      localStorage.removeItem('skincare-clinic-update');
    }
  }

  handleNewBooking(bookingData) {
    const notification = {
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Your appointment at ${bookingData.clinicName} has been confirmed for ${bookingData.date} at ${bookingData.time}.`,
      details: [
        bookingData.service || 'Skincare Consultation',
        bookingData.clinicName,
        `${bookingData.date} ${bookingData.time}`
      ]
    };
    
    this.addNotification(notification);
  }

  handleClinicUpdate(clinicData) {
    const notification = {
      type: 'clinic_update',
      title: 'Clinic Information Updated',
      message: `${clinicData.clinicName} has updated their information. Check out the latest details and services.`,
      details: [
        clinicData.clinicName,
        clinicData.updateType || 'General Update',
        'View Details'
      ]
    };
    
    this.addNotification(notification);
  }

  showToastNotification(notification) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon ${this.getNotificationIconClass(notification.type)}">
          ${this.getNotificationIcon(notification.type)}
        </div>
        <div class="toast-text">
          <div class="toast-title">${notification.title}</div>
          <div class="toast-message">${notification.message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="m18 6-12 12" stroke="currentColor" stroke-width="2"/>
            <path d="m6 6 12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  setupDemoButton() {
    const demoBtn = document.getElementById('demo-booking-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        // Create sample booking data
        const sampleBookings = [
          {
            clinicName: 'Glow Skin Clinic',
            date: '2024-01-15',
            time: '2:30 PM',
            service: 'Hydrating Facial Treatment'
          },
          {
            clinicName: 'Radiance Beauty Center',
            date: '2024-01-18',
            time: '10:00 AM',
            service: 'Anti-Aging Consultation'
          },
          {
            clinicName: 'Pure Skin Spa',
            date: '2024-01-20',
            time: '4:15 PM',
            service: 'Acne Treatment Session'
          }
        ];
        
        // Pick a random booking
        const randomBooking = sampleBookings[Math.floor(Math.random() * sampleBookings.length)];
        
        // Add the notification
        this.handleNewBooking(randomBooking);
      });
    }

    // Setup demo clinic update button
    const demoClinicBtn = document.getElementById('demo-clinic-btn');
    if (demoClinicBtn) {
      demoClinicBtn.addEventListener('click', () => {
        // Create sample clinic update data
        const sampleClinicUpdates = [
          {
            clinicName: 'Glow Skin Clinic',
            updateType: 'New Services Available',
            description: 'Added advanced laser treatments'
          },
          {
            clinicName: 'Radiance Beauty Center',
            updateType: 'Schedule Update',
            description: 'Extended weekend hours'
          },
          {
            clinicName: 'Pure Skin Spa',
            updateType: 'Special Promotion',
            description: '20% off all facial treatments'
          }
        ];
        
        // Pick a random clinic update
        const randomUpdate = sampleClinicUpdates[Math.floor(Math.random() * sampleClinicUpdates.length)];
        
        // Add the notification
        this.handleClinicUpdate(randomUpdate);
      });
    }
  }

  // Public method to add booking notification (can be called from other pages)
  static addBookingNotification(bookingData) {
    // Store booking data to trigger notification
    localStorage.setItem('skincare-new-booking', JSON.stringify(bookingData));
    
    // Dispatch storage event for same-page updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'skincare-new-booking',
      newValue: JSON.stringify(bookingData)
    }));
  }

  // Public method to add clinic update notification (can be called from other pages)
  static addClinicUpdateNotification(clinicData) {
    // Store clinic data to trigger notification
    localStorage.setItem('skincare-clinic-update', JSON.stringify(clinicData));
    
    // Dispatch storage event for same-page updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'skincare-clinic-update',
      newValue: JSON.stringify(clinicData)
    }));
  }

  initializeScrollAnimations() {
    // Add scroll animations to various elements
    const animatedElements = document.querySelectorAll('.card, .stat, .field, .btn');
    animatedElements.forEach(element => {
      this.scrollAnimations.observe(element);
    });
  }

  // Theme toggle methods removed - using light theme only

  initializeRippleEffects() {
    // Add ripple effects to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        if (!button.classList.contains('no-ripple')) {
          import('./utils.js').then(({ AnimationUtils }) => {
            AnimationUtils.rippleEffect(button, event);
          });
        }
      });
    });
  }

  initializeKeyboardNavigation() {
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Escape':
          this.handleEscapeKey();
          break;
        case 'Tab':
          this.handleTabKey(event);
          break;
        case 'Enter':
          this.handleEnterKey(event);
          break;
      }
    });
  }

  handleEscapeKey() {
    // Close any open dropdowns or modals
    if (this.profileDropdown?.isOpen()) {
      this.profileDropdown.close();
    }
    
    if (this.chatComponent) {
      this.chatComponent.close();
    }
  }

  handleTabKey(event) {
    // Ensure proper tab navigation
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  handleEnterKey(event) {
    const target = event.target;
    
    // Allow Enter key to activate buttons and links
    if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
      target.click();
    }
  }

  handleTabChange(tabId) {
    // Hide all tab panels
    const allPanels = document.querySelectorAll('.tab-panel');
    allPanels.forEach(panel => {
      panel.classList.remove('active');
      panel.style.display = 'none';
    });

    // Show the selected tab panel
    const activePanel = document.getElementById(tabId);
    if (activePanel) {
      activePanel.classList.add('active');
      activePanel.style.display = 'block';
    }

    // Handle tab-specific logic
    switch (tabId) {
      case 'account-settings':
        this.loadAccountSettings();
        break;
      case 'journal':
        this.loadJournalSettings();
        break;
      case 'security':
        this.loadSecuritySettings();
        break;
      case 'preferences':
        this.loadPreferencesSettings();
        break;
      case 'documents':
        this.loadDocuments();
        break;
      case 'shipping':
        this.loadShippingSettings();
        break;
      case 'notifications':
        this.loadNotificationSettings();
        break;
    }
  }

  loadAccountSettings() {
    console.log('Loading account settings...');
    // Implementation for account settings
  }

  loadJournalSettings() {
    console.log('Loading journal settings...');
    // Initialize journal functionality if not already done
    if (!this.journalInitialized) {
      this.initializeJournalFunctionality();
      this.journalInitialized = true;
    }
  }

  loadSecuritySettings() {
    console.log('Loading security settings...');
    // Implementation for security settings
  }

  loadPreferencesSettings() {
    console.log('Loading preferences settings...');
    // Implementation for preferences settings
  }

  loadDocuments() {
    console.log('Loading documents...');
    // Implementation for documents
  }

  loadShippingSettings() {
    console.log('Loading shipping settings...');
    // Implementation for shipping settings
  }

  loadNotificationSettings() {
    console.log('Loading notification settings...');
    // Implementation for notification settings
  }

  // Public API methods
  // getThemeManager removed - using light theme only

  getChatComponent() {
    return this.chatComponent;
  }

  getProfileComponent() {
    return this.profileComponent;
  }

  // Navigation Notification System Methods
  setupNotificationBell() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    
    if (notificationBtn && notificationDropdown) {
      notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNotificationDropdown();
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
          this.closeNotificationDropdown();
        }
      });
    }
  }

  setupNotificationDropdown() {
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        this.openNotificationsSection();
        this.closeNotificationDropdown();
      });
    }
  }

  setupClearAllNotifications() {
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.clearAllNotifications();
      });
    }
  }

  toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  closeNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  }

  openNotificationsSection() {
    const notificationsSection = document.getElementById('notifications-section');
    if (notificationsSection) {
      notificationsSection.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
      const unreadCount = this.notifications.filter(n => !n.read).length;
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
      
      if (unreadCount > 0) {
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    }
  }

  renderNavNotifications() {
    const navNotificationList = document.getElementById('nav-notification-list');
    const navEmptyState = document.getElementById('nav-empty-notifications');
    
    if (!navNotificationList) return;

    if (this.notifications.length === 0) {
      // Show empty state
      navEmptyState.style.display = 'flex';
      return;
    }

    // Hide empty state and render notifications (show only recent 5)
    navEmptyState.style.display = 'none';
    
    const recentNotifications = this.notifications.slice(0, 5);
    const notificationsHTML = recentNotifications.map(notification => 
      this.createCompactNotificationHTML(notification)
    ).join('');
    
    navNotificationList.innerHTML = notificationsHTML + navEmptyState.outerHTML;
    
    // Add click handlers for nav notifications
    this.addNavNotificationClickHandlers();
  }

  createCompactNotificationHTML(notification) {
    const timeAgo = this.getTimeAgo(notification.timestamp);
    const iconClass = this.getNotificationIconClass(notification.type);
    const icon = this.getNotificationIcon(notification.type);
    
    return `
      <div class="notification-item-card ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
        <div class="notification-icon ${iconClass}">
          ${icon}
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">${notification.title}</span>
            <span class="notification-time">${timeAgo}</span>
          </div>
          <div class="notification-message">${notification.message}</div>
        </div>
      </div>
    `;
  }

  addNavNotificationClickHandlers() {
    const navNotificationCards = document.querySelectorAll('#nav-notification-list .notification-item-card');
    navNotificationCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        this.markNotificationAsRead(id);
        this.openNotificationsSection();
        this.closeNotificationDropdown();
      });
    });
  }

  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.renderNotifications();
    this.renderNavNotifications();
    this.updateNotificationBadge();
    this.closeNotificationDropdown();
  }

  markNotificationAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
      this.renderNotifications();
      this.renderNavNotifications();
      this.updateNotificationBadge();
    }
  }

  initializeJournalFunctionality() {
    console.log('Initializing journal functionality...');
    // This method will be called when the journal tab is first accessed
    // The journal functionality is already implemented in the HTML script tag
    // So we just need to ensure it's properly initialized
    
    // Trigger any journal-specific initialization if needed
    const journalPanel = document.getElementById('journal');
    if (journalPanel) {
      // The journal functionality is already set up in the HTML script
      // Just ensure the upload zone is properly initialized
      const uploadZone = document.getElementById('upload-zone');
      if (uploadZone && !uploadZone.classList.contains('initialized')) {
        uploadZone.classList.add('initialized');
        console.log('Journal upload zone initialized');
      }
    }
  }

  // Cleanup method
  destroy() {
    this.scrollAnimations.disconnect();
    // Additional cleanup if needed
  }
}

// Initialize the application
const app = new SkinCareApp();

// Make app available globally for debugging
window.skinCareApp = app;

// Export for module usage
export default SkinCareApp;