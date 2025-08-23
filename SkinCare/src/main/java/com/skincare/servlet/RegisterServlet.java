package com.skincare.servlet;

import com.skincare.dao.UserDao;
import com.skincare.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.SQLException;

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

            System.out.println("📋 Registration data - Name: " + name + ", Email: " + email);

            if (name == null || email == null || password == null || name.isBlank() || email.isBlank() || password.isBlank()) {
                System.err.println("❌ Missing required fields");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"Missing required fields\"}");
                return;
            }

            // Basic email validation
            if (!email.contains("@") || !email.contains(".")) {
                System.err.println("❌ Invalid email format: " + email);
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"Invalid email format\"}");
                return;
            }

            // Password length validation
            if (password.length() < 6) {
                System.err.println("❌ Password too short");
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\":\"Password must be at least 6 characters long\"}");
                return;
            }

            User user = new User();
            user.setName(name.trim());
            user.setEmail(email.trim().toLowerCase());
            user.setPassword(password); // In production, this should be hashed

            boolean ok = userDao.insert(user);
            if (ok) {
                System.out.println("✅ User registered successfully: " + user.getEmail());

                // Automatically log in the newly registered user
                HttpSession session = req.getSession(true);
                session.setAttribute("user", user);
                System.out.println("✅ User automatically logged in after registration: " + user.getName());

                resp.getWriter().write("{\"status\":\"ok\",\"message\":\"User registered successfully\",\"autoLogin\":true,\"name\":\"" + user.getName().replace("\"","'") + "\",\"email\":\"" + user.getEmail() + "\"}");
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
