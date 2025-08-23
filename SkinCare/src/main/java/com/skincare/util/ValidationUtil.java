package com.skincare.util;

import java.util.regex.Pattern;

public class ValidationUtil {
    
    // Email validation patterns
    private static final Pattern GMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@gmail\\.com$", Pattern.CASE_INSENSITIVE);
    
    private static final Pattern GENERAL_EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", Pattern.CASE_INSENSITIVE);
    
    // Password validation patterns
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");
    
    /**
     * Validates name according to requirements:
     * - Cannot be blank
     * - Cannot be more than 9 characters
     */
    public static ValidationResult validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return new ValidationResult(false, "Name cannot be blank");
        }
        
        String trimmedName = name.trim();
        if (trimmedName.length() > 9) {
            return new ValidationResult(false, "Name cannot be more than 9 characters");
        }
        
        return new ValidationResult(true, "Valid name");
    }
    
    /**
     * Validates email according to requirements:
     * - Cannot be blank
     * - Must end with @gmail.com or be a valid email format
     */
    public static ValidationResult validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return new ValidationResult(false, "Email cannot be blank");
        }
        
        String trimmedEmail = email.trim().toLowerCase();
        
        // Check if it's a Gmail address
        if (GMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            return new ValidationResult(true, "Valid Gmail address");
        }
        
        // Check if it's a valid general email format
        if (GENERAL_EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            return new ValidationResult(true, "Valid email address");
        }
        
        return new ValidationResult(false, "Email must be a valid email address (preferably @gmail.com)");
    }
    
    /**
     * Validates password according to requirements:
     * - No more than 15 characters
     * - At least 1 uppercase letter
     * - At least 1 special character
     */
    public static ValidationResult validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            return new ValidationResult(false, "Password cannot be blank");
        }
        
        if (password.length() > 15) {
            return new ValidationResult(false, "Password cannot be more than 15 characters");
        }
        
        if (password.length() < 6) {
            return new ValidationResult(false, "Password must be at least 6 characters long");
        }
        
        if (!UPPERCASE_PATTERN.matcher(password).matches()) {
            return new ValidationResult(false, "Password must contain at least 1 uppercase letter");
        }
        
        if (!SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
            return new ValidationResult(false, "Password must contain at least 1 special character (!@#$%^&*()_+-=[]{}|;':\"\\,.<>?/)");
        }
        
        return new ValidationResult(true, "Valid password");
    }
    
    /**
     * Validates that password and confirm password match
     */
    public static ValidationResult validatePasswordMatch(String password, String confirmPassword) {
        if (password == null || confirmPassword == null) {
            return new ValidationResult(false, "Both password fields are required");
        }
        
        if (!password.equals(confirmPassword)) {
            return new ValidationResult(false, "Password and confirm password must match");
        }
        
        return new ValidationResult(true, "Passwords match");
    }
    
    /**
     * Validates that terms and conditions are accepted
     */
    public static ValidationResult validateTermsAccepted(String termsAccepted) {
        if (termsAccepted == null || !termsAccepted.equals("on") && !termsAccepted.equals("true")) {
            return new ValidationResult(false, "You must agree to the Terms & Conditions to proceed");
        }
        
        return new ValidationResult(true, "Terms accepted");
    }
    
    /**
     * Validation result class
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String message;
        
        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getMessage() {
            return message;
        }
    }
}
