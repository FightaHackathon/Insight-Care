// TypeScript for index.html - converted from original JavaScript - Compiled to JS

import { DropdownComponent, ChatComponent } from './components.js';
import { AnimationUtils, DOMUtils } from './utils.js';

class IndexPageApp {
  constructor() {
    this.profileDropdown = null;
    this.chatComponent = null;

    this.init();
  }

  init() {
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
      this.initializeNavigationEffects();
    } catch (error) {
      console.warn('Some components could not be initialized:', error);
    }
  }

  initializeProfileDropdown() {
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileBtn && profileDropdown) {
      // Enhanced profile dropdown with TypeScript
      this.profileDropdown = new DropdownComponent('.profile-btn', '.profile-dropdown');
      
      // Add keyboard navigation
      profileBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (this.profileDropdown) {
            if (this.profileDropdown.isOpen()) {
              this.profileDropdown.close();
            } else {
              this.profileDropdown.open();
            }
          }
        }
      });

      // Add ARIA attributes
      profileBtn.setAttribute('role', 'button');
      profileBtn.setAttribute('tabindex', '0');
      profileDropdown.setAttribute('role', 'menu');
      
      // Add focus management
      const dropdownLinks = profileDropdown.querySelectorAll('a');
      dropdownLinks.forEach((link, index) => {
        link.setAttribute('role', 'menuitem');
        link.addEventListener('keydown', (event) => {
          this.handleDropdownKeyNavigation(event, dropdownLinks, index);
        });
      });
    }
  }

  handleDropdownKeyNavigation(event, links, currentIndex) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % links.length;
        links[nextIndex].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + links.length) % links.length;
        links[prevIndex].focus();
        break;
      case 'Escape':
        event.preventDefault();
        this.profileDropdown?.close();
        document.querySelector('.profile-btn')?.focus();
        break;
    }
  }

  initializeChatComponent() {
    const chatBox = document.getElementById('chatbox');
    const chatIcon = document.querySelector('.chatbox-icon');
    const closeButton = document.getElementById('close-chat');

    if (chatBox && chatIcon && closeButton) {
      // Use the ChatComponent class for better functionality
      this.chatComponent = new ChatComponent();
      
      // Add keyboard accessibility
      chatIcon.setAttribute('role', 'button');
      chatIcon.setAttribute('tabindex', '0');
      chatIcon.setAttribute('aria-label', 'Open chat support');
      
      chatIcon.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.chatComponent.open();
        }
      });
    }
  }



  initializeNavigationEffects() {
    // Add hover effects to navigation items
    const navLinks = document.querySelectorAll('.link');
    
    navLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-2px)';
        link.style.transition = 'transform 0.2s ease';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0)';
      });
    });

    // Add dropdown menu enhancements
    const dropdown = document.querySelector('.dropdown');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdown && dropdownMenu) {
      let hoverTimeout;
      
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        dropdownMenu.style.display = 'block';
        AnimationUtils.fadeIn(dropdownMenu, { duration: 200 });
      });
      
      dropdown.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          dropdownMenu.style.display = 'none';
        }, 300);
      });
    }
  }

  // Public API
  getChatComponent() {
    return this.chatComponent;
  }

  getProfileDropdown() {
    return this.profileDropdown;
  }
}

// Initialize the application
const indexApp = new IndexPageApp();

// Make available globally for debugging
window.indexApp = indexApp;

export default IndexPageApp;