// Reusable components for the SkinCare application - Compiled from TypeScript

import { AnimationUtils, DOMUtils } from './utils.js';

export class DropdownComponent {
  constructor(triggerSelector, menuSelector) {
    this.state = { isOpen: false, element: null };
    this.trigger = document.querySelector(triggerSelector);
    this.menu = document.querySelector(menuSelector);
    
    if (!this.trigger || !this.menu) {
      throw new Error('Dropdown elements not found');
    }

    this.init();
  }

  init() {
    this.trigger.addEventListener('click', this.toggle.bind(this));
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // Add ARIA attributes for accessibility
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('role', 'menu');
  }

  toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.state.isOpen = !this.state.isOpen;
    this.updateUI();
  }

  handleOutsideClick(event) {
    const target = event.target;
    if (!this.trigger.contains(target) && !this.menu.contains(target)) {
      this.close();
    }
  }

  updateUI() {
    if (this.state.isOpen) {
      this.menu.classList.add('dropdown-open');
      this.trigger.setAttribute('aria-expanded', 'true');
      AnimationUtils.fadeIn(this.menu, { duration: 200, easing: 'ease-out' });
    } else {
      this.menu.classList.remove('dropdown-open');
      this.trigger.setAttribute('aria-expanded', 'false');
    }
  }

  open() {
    this.state.isOpen = true;
    this.updateUI();
  }

  close() {
    this.state.isOpen = false;
    this.updateUI();
  }

  isOpen() {
    return this.state.isOpen;
  }
}

export class ChatComponent {
  constructor() {
    this.chatBox = document.getElementById('chatbox');
    this.chatIcon = document.querySelector('.chatbox-icon');
    this.closeButton = document.getElementById('close-chat');
    this.responseArea = document.getElementById('chat-response');
    this.questions = document.querySelectorAll('.question');

    this.responses = {
      "What's the best skincare routine for oily skin?": "For oily skin, cleanse twice daily with a gentle foaming cleanser, use a BHA exfoliant 2-3 times per week, apply an oil-free moisturizer, and never skip broad-spectrum SPF 30+ sunscreen during the day.",
      "Do your products contain parabens?": "No, all our products are completely paraben-free! We use natural preservatives and safe alternatives to ensure product safety without compromising your skin's health.",
      "Are your products cruelty-free?": "Absolutely! We are 100% cruelty-free and never test on animals. We're also certified by Leaping Bunny, the gold standard for cruelty-free cosmetics.",
      "How long does shipping take?": "Standard shipping takes 3-5 business days within the country, 7-14 days internationally. We also offer express shipping (1-2 days) and same-day delivery in select cities.",
      "Can I return a product?": "Yes! We offer a 30-day satisfaction guarantee. You can return unopened products within 30 days for a full refund, and opened products within 15 days if you're not completely satisfied."
    };

    this.init();
  }

  init() {
    if (!this.chatBox || !this.chatIcon || !this.closeButton) {
      console.warn('Chat elements not found');
      return;
    }

    this.chatIcon.addEventListener('click', this.open.bind(this));
    this.closeButton.addEventListener('click', this.close.bind(this));

    this.questions.forEach(question => {
      question.addEventListener('click', this.handleQuestionClick.bind(this));
    });

    // Add ripple effect to chat icon
    this.chatIcon.addEventListener('click', (e) => {
      AnimationUtils.rippleEffect(this.chatIcon, e);
    });

    // Add outside click functionality to close chat
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // Add escape key functionality to close chat
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  handleQuestionClick(event) {
    const target = event.target;
    const questionText = target.textContent?.trim() || '';
    const answer = this.responses[questionText] || "I'm sorry, I don't have an answer for that question right now. Please contact our support team for personalized assistance.";
    
    this.displayResponse(questionText, answer);
    
    // Add visual feedback
    target.classList.add('question-selected');
    setTimeout(() => target.classList.remove('question-selected'), 300);
  }

  displayResponse(question, answer) {
    if (!this.responseArea) return;

    this.responseArea.innerHTML = `
      <div class="chat-message user-message">
        <div class="message-content">${question}</div>
      </div>
      <div class="chat-message bot-message">
        <div class="message-avatar">🤖</div>
        <div class="message-content">${answer}</div>
      </div>
    `;

    // Animate the response
    const messages = this.responseArea.querySelectorAll('.chat-message');
    messages.forEach((message, index) => {
      AnimationUtils.slideIn(message, 'up', { 
        duration: 300, 
        delay: index * 150,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)' 
      });
    });
  }

  open() {
    this.chatBox.classList.remove('hidden');
    this.chatBox.classList.add('chat-open');
    AnimationUtils.slideIn(this.chatBox, 'up', { duration: 300 });
  }

  close() {
    this.chatBox.classList.add('hidden');
    this.chatBox.classList.remove('chat-open');
  }

  handleOutsideClick(event) {
    const target = event.target;
    // Check if chat is open and click is outside chat elements
    if (!this.chatBox.classList.contains('hidden') && 
        !this.chatBox.contains(target) && 
        !this.chatIcon.contains(target)) {
      this.close();
    }
  }

  handleEscapeKey(event) {
    // Close chat when Escape key is pressed and chat is open
    if (event.key === 'Escape' && !this.chatBox.classList.contains('hidden')) {
      this.close();
    }
  }

  isOpen() {
    return !this.chatBox.classList.contains('hidden');
  }
}

export class TabComponent {
  constructor(containerSelector, contentSelector) {
    this.tabs = [];
    this.activeTabId = '';
    this.tabContainer = document.querySelector(containerSelector);
    this.contentContainer = document.querySelector(contentSelector);
    
    if (!this.tabContainer) {
      throw new Error('Tab container not found');
    }

    this.init();
  }

  init() {
    const tabElements = this.tabContainer.querySelectorAll('.tab');
    
    tabElements.forEach((tabElement, index) => {
      const tab = {
        id: tabElement.getAttribute('data-tab-id') || `tab-${index}`,
        label: tabElement.textContent?.trim() || '',
        isActive: tabElement.classList.contains('active')
      };

      this.tabs.push(tab);
      
      if (tab.isActive) {
        this.activeTabId = tab.id;
      }

      tabElement.addEventListener('click', () => this.switchTab(tab.id));
    });
  }

  switchTab(tabId) {
    // Update tab states
    this.tabs.forEach(tab => {
      tab.isActive = tab.id === tabId;
    });

    this.activeTabId = tabId;
    this.updateUI();
    this.onTabChange(tabId);
  }

  updateUI() {
    const tabElements = this.tabContainer.querySelectorAll('.tab');
    
    tabElements.forEach((tabElement, index) => {
      const tab = this.tabs[index];
      if (tab.isActive) {
        tabElement.classList.add('active');
        // Add smooth underline animation
        AnimationUtils.slideIn(tabElement, 'up', { duration: 200 });
      } else {
        tabElement.classList.remove('active');
      }
    });
  }

  onTabChange(tabId) {
    // Emit custom event for tab change
    const event = new CustomEvent('tabchange', { 
      detail: { tabId, activeTab: this.getActiveTab() } 
    });
    this.tabContainer.dispatchEvent(event);
  }

  getActiveTab() {
    return this.tabs.find(tab => tab.isActive);
  }

  addTab(tab) {
    this.tabs.push(tab);
    this.renderTab(tab);
  }

  renderTab(tab) {
    const tabElement = DOMUtils.createElement('div', 'tab', tab.label);
    tabElement.setAttribute('data-tab-id', tab.id);
    
    if (tab.isActive) {
      tabElement.classList.add('active');
      this.activeTabId = tab.id;
    }

    tabElement.addEventListener('click', () => this.switchTab(tab.id));
    this.tabContainer.appendChild(tabElement);
  }
}

export class ProfileComponent {
  constructor(formSelector) {
    this.user = null;
    this.form = document.querySelector(formSelector);
    this.updateButton = document.querySelector('.update');
    
    if (!this.form) {
      throw new Error('Profile form not found');
    }

    this.init();
  }

  init() {
    this.loadUserData();
    this.setupFormValidation();
    this.updateButton?.addEventListener('click', this.handleUpdate.bind(this));
    
    // Add ripple effect to update button
    this.updateButton?.addEventListener('click', (e) => {
      AnimationUtils.rippleEffect(this.updateButton, e);
    });
  }

  loadUserData() {
    // Load user data from localStorage or API
    const savedUser = localStorage.getItem('skincare-user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.populateForm();
    }
  }

  populateForm() {
    if (!this.user) return;

    const fields = {
      'first': this.user.firstName,
      'last': this.user.lastName,
      'email': this.user.email,
      'phone': this.user.phone,
      'address': this.user.address,
      'city': this.user.city,
      'postcode': this.user.postCode,
      'country': this.user.country
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
      const input = document.getElementById(fieldId);
      if (input && value) {
        input.value = value;
      }
    });
  }

  setupFormValidation() {
    const inputs = this.form.querySelectorAll('input');
    
    inputs.forEach(input => {
      input.addEventListener('blur', this.validateField.bind(this));
      input.addEventListener('input', this.clearFieldError.bind(this));
    });
  }

  validateField(event) {
    const input = event.target;
    const field = input.closest('.field');
    
    if (!field) return;

    // Remove existing error
    this.clearFieldError(event);

    let isValid = true;
    let errorMessage = '';

    // Validation logic
    switch (input.type) {
      case 'email':
        isValid = this.validateEmail(input.value);
        errorMessage = 'Please enter a valid email address';
        break;
      case 'tel':
        isValid = this.validatePhone(input.value);
        errorMessage = 'Please enter a valid phone number';
        break;
      default:
        isValid = input.value.trim().length > 0;
        errorMessage = 'This field is required';
    }

    if (!isValid && input.value.trim() !== '') {
      this.showFieldError(field, errorMessage);
    }
  }

  clearFieldError(event) {
    const input = event.target;
    const field = input.closest('.field');
    const errorElement = field?.querySelector('.field-error');
    
    if (errorElement) {
      errorElement.remove();
    }
    
    field?.classList.remove('field-error');
    input.classList.remove('input-error');
  }

  showFieldError(field, message) {
    field.classList.add('field-error');
    const input = field.querySelector('input');
    input?.classList.add('input-error');

    const errorElement = DOMUtils.createElement('div', 'field-error', message);
    field.appendChild(errorElement);
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  handleUpdate(event) {
    event.preventDefault();
    
    // Validate all fields
    const inputs = this.form.querySelectorAll('input');
    let isFormValid = true;

    inputs.forEach(input => {
      const fakeEvent = { target: input };
      this.validateField(fakeEvent);
      
      if (input.classList.contains('input-error')) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      this.saveUserData();
      this.showSuccessMessage();
    }
  }

  saveUserData() {
    const formData = new FormData(this.form);
    const userData = {};

    formData.forEach((value, key) => {
      userData[key] = value;
    });

    // Save to localStorage (in real app, this would be an API call)
    localStorage.setItem('skincare-user', JSON.stringify(userData));
    this.user = userData;
  }

  showSuccessMessage() {
    const successMessage = DOMUtils.createElement('div', 'success-message', '✅ Profile updated successfully!');
    this.form.appendChild(successMessage);

    AnimationUtils.fadeIn(successMessage, { duration: 300 });

    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  }
}