// Type definitions for the SkinCare application

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postCode: string;
  country: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface DropdownState {
  isOpen: boolean;
  element: HTMLElement | null;
}

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface ProfileStats {
  productStore: number;
  productSale: number;
  demoText: number;
}

export interface TabConfig {
  id: string;
  label: string;
  isActive: boolean;
  content?: string;
}