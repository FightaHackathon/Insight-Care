// Utility functions for the SkinCare application

import { Theme, AnimationConfig } from './types.js';

export class ThemeManager {
  private currentTheme: Theme['name'] = 'light';
  private readonly storageKey = 'skincare-theme';

  constructor() {
    this.loadTheme();
    this.applyTheme();
  }

  private loadTheme(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'dark' || saved === 'light') {
      this.currentTheme = saved;
    } else {
      // Auto-detect system preference
      this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  }

  public toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.saveTheme();
    this.applyTheme();
  }

  private saveTheme(): void {
    localStorage.setItem(this.storageKey, this.currentTheme);
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  public getCurrentTheme(): Theme['name'] {
    return this.currentTheme;
  }
}

export class AnimationUtils {
  static fadeIn(element: HTMLElement, config: AnimationConfig = { duration: 300, easing: 'ease-out' }): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${config.duration}ms ${config.easing}`;
      
      if (config.delay) {
        setTimeout(() => {
          element.style.opacity = '1';
        }, config.delay);
      } else {
        element.style.opacity = '1';
      }

      setTimeout(() => {
        resolve();
      }, config.duration + (config.delay || 0));
    });
  }

  static slideIn(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up', config: AnimationConfig = { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }): Promise<void> {
    return new Promise((resolve) => {
      const transforms = {
        up: 'translateY(20px)',
        down: 'translateY(-20px)',
        left: 'translateX(20px)',
        right: 'translateX(-20px)'
      };

      element.style.transform = transforms[direction];
      element.style.opacity = '0';
      element.style.transition = `transform ${config.duration}ms ${config.easing}, opacity ${config.duration}ms ${config.easing}`;

      requestAnimationFrame(() => {
        element.style.transform = 'translate(0)';
        element.style.opacity = '1';
      });

      setTimeout(() => {
        resolve();
      }, config.duration);
    });
  }

  static rippleEffect(element: HTMLElement, event: MouseEvent): void {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}

export class DOMUtils {
  static createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    className?: string,
    textContent?: string
  ): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  static addEventListeners(element: HTMLElement, events: Record<string, EventListener>): void {
    Object.entries(events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }

  static debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

export class ScrollAnimations {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  }

  public observe(element: HTMLElement): void {
    element.classList.add('animate-on-scroll');
    this.observer.observe(element);
  }

  public unobserve(element: HTMLElement): void {
    this.observer.unobserve(element);
  }

  public disconnect(): void {
    this.observer.disconnect();
  }
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};