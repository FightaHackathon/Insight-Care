package com.skincare.controller;

import com.skincare.dao.UserDao;
import com.skincare.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserDao userDao = new UserDao();

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📝 Registration request received via REST API");
            
            // Ensure table exists
            userDao.createTableIfNotExists();
            
            System.out.println("📋 Registration data - Name: " + name + ", Email: " + email);

            // Validation
            if (name == null || email == null || password == null || 
                name.isBlank() || email.isBlank() || password.isBlank()) {
                System.err.println("❌ Missing required fields");
                response.put("error", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }

            // Basic email validation
            if (!email.contains("@") || !email.contains(".")) {
                System.err.println("❌ Invalid email format: " + email);
                response.put("error", "Invalid email format");
                return ResponseEntity.badRequest().body(response);
            }

            // Password length validation
            if (password.length() < 6) {
                System.err.println("❌ Password too short");
                response.put("error", "Password must be at least 6 characters long");
                return ResponseEntity.badRequest().body(response);
            }

            User user = new User();
            user.setName(name.trim());
            user.setEmail(email.trim().toLowerCase());
            user.setPassword(password); // In production, this should be hashed

            boolean ok = userDao.insert(user);
            if (ok) {
                System.out.println("✅ User registered successfully: " + user.getEmail());

                // Automatically log in the newly registered user
                session.setAttribute("user", user);
                System.out.println("✅ User automatically logged in after registration: " + user.getName());

                response.put("status", "ok");
                response.put("message", "User registered successfully");
                response.put("autoLogin", true);
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Insert operation failed");
                response.put("error", "Registration failed - please try again");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (SQLException e) {
            System.err.println("❌ SQL Exception during registration: " + e.getMessage());
            e.printStackTrace();
            
            if (e.getMessage().contains("Email already exists")) {
                response.put("error", "Email address is already registered");
            } else {
                response.put("error", "Database error: " + e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during registration: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("🔐 Login request received via REST API");
            System.out.println("📧 Login attempt for email: " + email);
            
            if (email == null || password == null || email.isBlank() || password.isBlank()) {
                System.err.println("❌ Missing email or password");
                response.put("error", "Missing email or password");
                return ResponseEntity.badRequest().body(response);
            }
            
            User u = userDao.findByEmailAndPassword(email.trim().toLowerCase(), password);
            if (u != null) {
                session.setAttribute("user", u);
                System.out.println("✅ Login successful for user: " + u.getName());
                
                response.put("status", "ok");
                response.put("name", u.getName());
                response.put("email", u.getEmail());
                
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Invalid credentials for email: " + email);
                response.put("error", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (SQLException e) {
            System.err.println("❌ SQL Exception during login: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        if (session != null) {
            session.invalidate();
        }
        
        response.put("status", "ok");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        if (session != null) {
            User user = (User) session.getAttribute("user");
            if (user != null) {
                response.put("authenticated", true);
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("name", user.getName());
                userInfo.put("email", user.getEmail());
                response.put("user", userInfo);
                return ResponseEntity.ok(response);
            }
        }
        
        response.put("authenticated", false);
        return ResponseEntity.ok(response);
    }
}
