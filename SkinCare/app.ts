// Main application entry point for SkinCare website

import { ThemeManager, ScrollAnimations, DOMUtils } from './utils.js';
import { DropdownComponent, ChatComponent, TabComponent, ProfileComponent } from './components.js';

class SkinCareApp {
  private themeManager: ThemeManager;
  private scrollAnimations: ScrollAnimations;
  private profileDropdown: DropdownComponent | null = null;
  private chatComponent: ChatComponent | null = null;
  private tabComponent: TabComponent | null = null;
  private profileComponent: ProfileComponent | null = null;

  constructor() {
    this.themeManager = new ThemeManager();
    this.scrollAnimations = new ScrollAnimations();
    this.init();
  }

  private init(): void {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.initializeComponents.bind(this));
    } else {
      this.initializeComponents();
    }
  }

  private initializeComponents(): void {
    try {
      this.initializeProfileDropdown();
      this.initializeChatComponent();
      this.initializeTabComponent();
      this.initializeProfileComponent();
      this.initializeScrollAnimations();
      this.initializeThemeToggle();
      this.initializeRippleEffects();
      this.initializeKeyboardNavigation();
    } catch (error) {
      console.warn('Some components could not be initialized:', error);
    }
  }

  private initializeProfileDropdown(): void {
    const profileIcon = document.querySelector('.profile-icon');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileIcon && profileDropdown) {
      this.profileDropdown = new DropdownComponent('.profile-icon', '.profile-dropdown');
    }
  }

  private initializeChatComponent(): void {
    const chatBox = document.getElementById('chatbox');
    if (chatBox) {
      this.chatComponent = new ChatComponent();
    }
  }

  private initializeTabComponent(): void {
    const tabContainer = document.querySelector('.tabs');
    if (tabContainer) {
      this.tabComponent = new TabComponent('.tabs', '.tab-content');
      
      // Listen for tab changes
      tabContainer.addEventListener('tabchange', (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log('Tab changed to:', customEvent.detail.tabId);
        this.handleTabChange(customEvent.detail.tabId);
      });
    }
  }

  private initializeProfileComponent(): void {
    const profileForm = document.querySelector('form');
    if (profileForm) {
      this.profileComponent = new ProfileComponent('form');
    }
  }

  private initializeScrollAnimations(): void {
    // Add scroll animations to various elements
    const animatedElements = document.querySelectorAll('.card, .stat, .field, .btn');
    animatedElements.forEach(element => {
      this.scrollAnimations.observe(element as HTMLElement);
    });
  }

  private initializeThemeToggle(): void {
    // Create theme toggle button
    const themeToggle = this.createThemeToggle();
    document.body.appendChild(themeToggle);
  }

  private createThemeToggle(): HTMLElement {
    const toggle = DOMUtils.createElement('button', 'theme-toggle');
    toggle.innerHTML = `
      <svg class="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg class="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
      </svg>
    `;
    
    toggle.setAttribute('aria-label', 'Toggle theme');
    toggle.addEventListener('click', () => {
      this.themeManager.toggleTheme();
      this.updateThemeToggleIcon();
    });

    this.updateThemeToggleIcon();
    return toggle;
  }

  private updateThemeToggleIcon(): void {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      const isDark = this.themeManager.getCurrentTheme() === 'dark';
      toggle.classList.toggle('dark-theme', isDark);
    }
  }

  private initializeRippleEffects(): void {
    // Add ripple effects to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        if (!button.classList.contains('no-ripple')) {
          import('./utils.js').then(({ AnimationUtils }) => {
            AnimationUtils.rippleEffect(button as HTMLElement, event as MouseEvent);
          });
        }
      });
    });
  }

  private initializeKeyboardNavigation(): void {
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

  private handleEscapeKey(): void {
    // Close any open dropdowns or modals
    if (this.profileDropdown?.isOpen()) {
      this.profileDropdown.close();
    }
    
    if (this.chatComponent) {
      this.chatComponent.close();
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    // Ensure proper tab navigation
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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

  private handleEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Allow Enter key to activate buttons and links
    if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
      target.click();
    }
  }

  private handleTabChange(tabId: string): void {
    // Handle tab-specific logic
    switch (tabId) {
      case 'account-settings':
        this.loadAccountSettings();
        break;
      case 'security':
        this.loadSecuritySettings();
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

  private loadAccountSettings(): void {
    console.log('Loading account settings...');
    // Implementation for account settings
  }

  private loadSecuritySettings(): void {
    console.log('Loading security settings...');
    // Implementation for security settings
  }

  private loadDocuments(): void {
    console.log('Loading documents...');
    // Implementation for documents
  }

  private loadShippingSettings(): void {
    console.log('Loading shipping settings...');
    // Implementation for shipping settings
  }

  private loadNotificationSettings(): void {
    console.log('Loading notification settings...');
    // Implementation for notification settings
  }

  // Public API methods
  public getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  public getChatComponent(): ChatComponent | null {
    return this.chatComponent;
  }

  public getProfileComponent(): ProfileComponent | null {
    return this.profileComponent;
  }

  // Cleanup method
  public destroy(): void {
    this.scrollAnimations.disconnect();
    // Additional cleanup if needed
  }
}

// Initialize the application
const app = new SkinCareApp();

// Make app available globally for debugging
(window as any).skinCareApp = app;

// Export for module usage
export default SkinCareApp;