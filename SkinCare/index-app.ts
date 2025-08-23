// TypeScript for index.html - converted from original JavaScript

import { DropdownComponent, ChatComponent } from './components.js';
import { AnimationUtils, DOMUtils } from './utils.js';

interface ChatResponses {
  [key: string]: string;
}

class IndexPageApp {
  private profileDropdown: DropdownComponent | null = null;
  private chatComponent: ChatComponent | null = null;
  private chatResponses: ChatResponses;

  constructor() {
    this.chatResponses = {
      "What's the best skincare routine for oily skin?": "For oily skin, cleanse twice daily with a gentle foaming cleanser, use a BHA exfoliant 2-3 times per week, apply an oil-free moisturizer, and never skip broad-spectrum SPF 30+ sunscreen during the day.",
      "Do your products contain parabens?": "No, all our products are completely paraben-free! We use natural preservatives and safe alternatives to ensure product safety without compromising your skin's health.",
      "Are your products cruelty-free?": "Absolutely! We are 100% cruelty-free and never test on animals. We're also certified by Leaping Bunny, the gold standard for cruelty-free cosmetics.",
      "How long does shipping take?": "Standard shipping takes 3-5 business days within the country, 7-14 days internationally. We also offer express shipping (1-2 days) and same-day delivery in select cities.",
      "Can I return a product?": "Yes! We offer a 30-day satisfaction guarantee. You can return unopened products within 30 days for a full refund, and opened products within 15 days if you're not completely satisfied."
    };

    this.init();
  }

  private init(): void {
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
      this.initializeNavigationEffects();
    } catch (error) {
      console.warn('Some components could not be initialized:', error);
    }
  }

  private initializeProfileDropdown(): void {
    const profileIcon = document.querySelector('.profile-icon') as HTMLElement;
    const profileDropdown = document.querySelector('.profile-dropdown') as HTMLElement;
    
    if (profileIcon && profileDropdown) {
      // Enhanced profile dropdown with TypeScript
      this.profileDropdown = new DropdownComponent('.profile-icon', '.profile-dropdown');
      
      // Add keyboard navigation
      profileIcon.addEventListener('keydown', (event: KeyboardEvent) => {
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
      profileIcon.setAttribute('role', 'button');
      profileIcon.setAttribute('tabindex', '0');
      profileDropdown.setAttribute('role', 'menu');
      
      // Add focus management
      const dropdownLinks = profileDropdown.querySelectorAll('a');
      dropdownLinks.forEach((link, index) => {
        link.setAttribute('role', 'menuitem');
        link.addEventListener('keydown', (event: KeyboardEvent) => {
          this.handleDropdownKeyNavigation(event, dropdownLinks, index);
        });
      });
    }
  }

  private handleDropdownKeyNavigation(event: KeyboardEvent, links: NodeListOf<Element>, currentIndex: number): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % links.length;
        (links[nextIndex] as HTMLElement).focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + links.length) % links.length;
        (links[prevIndex] as HTMLElement).focus();
        break;
      case 'Escape':
        event.preventDefault();
        this.profileDropdown?.close();
        document.querySelector('.profile-icon')?.focus();
        break;
    }
  }

  private initializeChatComponent(): void {
    const chatBox = document.getElementById('chatbox');
    const chatIcon = document.querySelector('.chatbox-icon') as HTMLElement;
    const closeButton = document.getElementById('close-chat') as HTMLElement;
    const responseArea = document.getElementById('chat-response') as HTMLElement;
    const questions = document.querySelectorAll('.question') as NodeListOf<HTMLElement>;

    if (chatBox && chatIcon && closeButton && responseArea) {
      // Enhanced chat component with TypeScript
      this.setupChatEventListeners(chatIcon, chatBox, closeButton, questions, responseArea);
      
      // Add keyboard accessibility
      chatIcon.setAttribute('role', 'button');
      chatIcon.setAttribute('tabindex', '0');
      chatIcon.setAttribute('aria-label', 'Open chat support');
      
      chatIcon.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.openChat(chatBox);
        }
      });
    }
  }

  private setupChatEventListeners(
    chatIcon: HTMLElement,
    chatBox: HTMLElement,
    closeButton: HTMLElement,
    questions: NodeListOf<HTMLElement>,
    responseArea: HTMLElement
  ): void {
    // Open chat
    chatIcon.addEventListener('click', (event: MouseEvent) => {
      AnimationUtils.rippleEffect(chatIcon, event);
      this.openChat(chatBox);
    });

    // Close chat
    closeButton.addEventListener('click', () => {
      this.closeChat(chatBox);
    });

    // Handle questions
    questions.forEach((question: HTMLElement) => {
      question.addEventListener('click', () => {
        this.handleQuestionClick(question, responseArea);
      });
      
      // Keyboard support for questions
      question.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.handleQuestionClick(question, responseArea);
        }
      });
    });

    // Close chat on escape key
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !chatBox.classList.contains('hidden')) {
        this.closeChat(chatBox);
      }
    });
  }

  private openChat(chatBox: HTMLElement): void {
    chatBox.classList.remove('hidden');
    chatBox.classList.add('chat-open');
    
    // Focus management
    const firstFocusable = chatBox.querySelector('button') as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    AnimationUtils.slideIn(chatBox, 'up', { duration: 300 });
  }

  private closeChat(chatBox: HTMLElement): void {
    chatBox.classList.add('hidden');
    chatBox.classList.remove('chat-open');
    
    // Return focus to chat icon
    const chatIcon = document.querySelector('.chatbox-icon') as HTMLElement;
    if (chatIcon) {
      chatIcon.focus();
    }
  }

  private handleQuestionClick(question: HTMLElement, responseArea: HTMLElement): void {
    const questionText = question.textContent?.trim() || '';
    const answer = this.chatResponses[questionText] || 
      "I'm sorry, I don't have an answer for that question right now. Please contact our support team for personalized assistance.";
    
    this.displayResponse(questionText, answer, responseArea);
    
    // Visual feedback
    question.classList.add('question-selected');
    setTimeout(() => question.classList.remove('question-selected'), 300);
  }

  private displayResponse(question: string, answer: string, responseArea: HTMLElement): void {
    responseArea.innerHTML = `
      <div class="chat-message user-message">
        <div class="message-content">${this.escapeHtml(question)}</div>
      </div>
      <div class="chat-message bot-message">
        <div class="message-avatar">🤖</div>
        <div class="message-content">${this.escapeHtml(answer)}</div>
      </div>
    `;

    // Animate the response
    const messages = responseArea.querySelectorAll('.chat-message');
    messages.forEach((message, index) => {
      AnimationUtils.slideIn(message as HTMLElement, 'up', { 
        duration: 300, 
        delay: index * 150,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      });
    });

    // Scroll to response
    responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private initializeNavigationEffects(): void {
    // Add hover effects to navigation items
    const navLinks = document.querySelectorAll('.link') as NodeListOf<HTMLElement>;
    
    navLinks.forEach((link: HTMLElement) => {
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-2px)';
        link.style.transition = 'transform 0.2s ease';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0)';
      });
    });

    // Add dropdown menu enhancements
    const dropdown = document.querySelector('.dropdown') as HTMLElement;
    const dropdownMenu = document.querySelector('.dropdown-menu') as HTMLElement;
    
    if (dropdown && dropdownMenu) {
      let hoverTimeout: NodeJS.Timeout;
      
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
  public getChatComponent(): ChatComponent | null {
    return this.chatComponent;
  }

  public getProfileDropdown(): DropdownComponent | null {
    return this.profileDropdown;
  }
}

// Initialize the application
const indexApp = new IndexPageApp();

// Make available globally for debugging
(window as any).indexApp = indexApp;

export default IndexPageApp;