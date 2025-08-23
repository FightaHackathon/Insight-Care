package com.skincare.servlet;

import com.skincare.dao.UserDao;
import com.skincare.model.User;
import com.skincare.util.ValidationUtil;
import com.skincare.util.PasswordUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

@WebServlet(name="RegisterServlet", urlPatterns = "/RegisterServlet")
public class RegisterServlet extends HttpServlet {

    private final UserDao userDao = new UserDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");
        
        System.out.println("📝 Registration request received");
        
        try {
            // Ensure table exists
            userDao.createTableIfNotExists();
            
            String name = req.getParameter("name");
            String email = req.getParameter("email");
            String password = req.getParameter("password");
            String confirmPassword = req.getParameter("confirmPassword");
            String termsAccepted = req.getParameter("terms");

            System.out.println("📋 Registration data - Name: " + name + ", Email: " + email);

            // Comprehensive validation using ValidationUtil

            // Validate name
            ValidationUtil.ValidationResult nameValidation = ValidationUtil.validateName(name);
            if (!nameValidation.isValid()) {
                System.err.println("❌ Name validation failed: " + nameValidation.getMessage());
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"" + nameValidation.getMessage() + "\"}");
                return;
            }

            // Validate email
            ValidationUtil.ValidationResult emailValidation = ValidationUtil.validateEmail(email);
            if (!emailValidation.isValid()) {
                System.err.println("❌ Email validation failed: " + emailValidation.getMessage());
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"" + emailValidation.getMessage() + "\"}");
                return;
            }

            // Validate password
            ValidationUtil.ValidationResult passwordValidation = ValidationUtil.validatePassword(password);
            if (!passwordValidation.isValid()) {
                System.err.println("❌ Password validation failed: " + passwordValidation.getMessage());
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"" + passwordValidation.getMessage() + "\"}");
                return;
            }

            // Validate password match
            ValidationUtil.ValidationResult passwordMatchValidation = ValidationUtil.validatePasswordMatch(password, confirmPassword);
            if (!passwordMatchValidation.isValid()) {
                System.err.println("❌ Password match validation failed: " + passwordMatchValidation.getMessage());
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"" + passwordMatchValidation.getMessage() + "\"}");
                return;
            }

            // Validate terms acceptance
            ValidationUtil.ValidationResult termsValidation = ValidationUtil.validateTermsAccepted(termsAccepted);
            if (!termsValidation.isValid()) {
                System.err.println("❌ Terms validation failed: " + termsValidation.getMessage());
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"" + termsValidation.getMessage() + "\"}");
                return;
            }

            // Create user with encrypted password
            User user = new User();
            user.setName(name.trim());
            user.setEmail(email.trim().toLowerCase());

            // Encrypt password before storing
            String encryptedPassword = PasswordUtil.encryptPassword(password);
            user.setPassword(encryptedPassword);

            System.out.println("✅ All validations passed, creating user with encrypted password");

            boolean ok = userDao.insert(user);
            if (ok) {
                System.out.println("✅ User registered successfully: " + user.getEmail());
                resp.getWriter().write("{\"status\":\"ok\",\"message\":\"User registered successfully\"}");
            } else {
                System.err.println("❌ Insert operation failed");
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"error\":\"Registration failed - please try again\"}");
            }
        } catch (SQLException e) {
            System.err.println("❌ SQL Exception during registration: " + e.getMessage());
            e.printStackTrace();
            
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            if (e.getMessage().contains("Email already exists")) {
                resp.getWriter().write("{\"error\":\"Email address is already registered\"}");
            } else {
                resp.getWriter().write("{\"error\":\"Database error: " + e.getMessage().replace("\"","'") + "\"}");
            }
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during registration: " + e.getMessage());
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\":\"An unexpected error occurred\"}");
        }
    }
}
