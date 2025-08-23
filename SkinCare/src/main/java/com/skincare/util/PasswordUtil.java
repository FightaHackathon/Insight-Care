package com.skincare.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtil {
    
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Encrypts a plain text password using BCrypt
     * @param plainPassword The plain text password to encrypt
     * @return The encrypted password hash
     */
    public static String encryptPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        return passwordEncoder.encode(plainPassword);
    }
    
    /**
     * Verifies a plain text password against an encrypted password hash
     * @param plainPassword The plain text password to verify
     * @param encryptedPassword The encrypted password hash to verify against
     * @return true if the password matches, false otherwise
     */
    public static boolean verifyPassword(String plainPassword, String encryptedPassword) {
        if (plainPassword == null || encryptedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(plainPassword, encryptedPassword);
    }
    
    /**
     * Generates a strong password hash with default BCrypt strength (10 rounds)
     * This method is used for password encryption during user registration
     */
    public static String hashPassword(String password) {
        return encryptPassword(password);
    }
    
    /**
     * Checks if a password matches the stored hash
     * This method is used during user authentication
     */
    public static boolean checkPassword(String password, String hash) {
        return verifyPassword(password, hash);
    }
}
