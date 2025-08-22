// Shared Chat Functionality for all pages
// This script provides consistent chat behavior across all pages

class UniversalChatComponent {
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

        // Open chat
        this.chatIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.open();
        });

        // Close chat
        this.closeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            this.close();
        });

        // Handle questions
        this.questions.forEach(question => {
            question.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.handleQuestionClick(question);
            });
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });

        // Close chat when pressing Escape key
        document.addEventListener('keydown', (e) => {
            this.handleEscapeKey(e);
        });

        // Prevent chat box clicks from closing the chat
        this.chatBox.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Add keyboard accessibility
        this.chatIcon.setAttribute('role', 'button');
        this.chatIcon.setAttribute('tabindex', '0');
        this.chatIcon.setAttribute('aria-label', 'Open chat support');
        
        this.chatIcon.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.open();
            }
        });
    }

    open() {
        this.chatBox.classList.remove('hidden');
        this.chatBox.classList.add('chat-open');
        
        // Focus management
        const firstFocusable = this.chatBox.querySelector('button');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    close() {
        this.chatBox.classList.add('hidden');
        this.chatBox.classList.remove('chat-open');
        
        // Return focus to chat icon
        if (this.chatIcon) {
            this.chatIcon.focus();
        }
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

    handleQuestionClick(question) {
        const questionText = question.textContent?.trim() || '';
        const answer = this.responses[questionText] || 
            "I'm sorry, I don't have an answer for that question right now. Please contact our support team for personalized assistance.";
        
        this.displayResponse(questionText, answer);
        
        // Visual feedback
        question.classList.add('question-selected');
        setTimeout(() => question.classList.remove('question-selected'), 300);
    }

    displayResponse(question, answer) {
        if (!this.responseArea) return;

        this.responseArea.innerHTML = `
            <div class="chat-message user-message">
                <div class="message-content">${this.escapeHtml(question)}</div>
            </div>
            <div class="chat-message bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">${this.escapeHtml(answer)}</div>
            </div>
        `;

        // Scroll to response
        this.responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isOpen() {
        return !this.chatBox.classList.contains('hidden');
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if chat elements exist on the page
    if (document.getElementById('chatbox') && document.querySelector('.chatbox-icon')) {
        window.universalChat = new UniversalChatComponent();
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    if (document.getElementById('chatbox') && document.querySelector('.chatbox-icon')) {
        window.universalChat = new UniversalChatComponent();
    }
}