package com.skincare.servlet;

import com.skincare.dao.UserDao;
import com.skincare.model.User;
import com.skincare.util.PasswordUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet(name = "LoginServlet", urlPatterns = "/LoginServlet")
public class LoginServlet extends HttpServlet {

    private final UserDao userDao = new UserDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");
        
        System.out.println("🔐 Login request received");
        
        String email = req.getParameter("email");
        String password = req.getParameter("password");
        
        System.out.println("📧 Login attempt for email: " + email);
        
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            System.err.println("❌ Missing email or password");
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\":\"Missing email or password\"}");
            return;
        }
        
        try {
            User u = userDao.findByEmailAndPassword(email.trim().toLowerCase(), password);
            if (u != null) {
                HttpSession session = req.getSession(true);
                session.setAttribute("user", u);
                System.out.println("✅ Login successful for user: " + u.getName());
                resp.getWriter().write("{\"status\":\"ok\",\"name\":\"" + u.getName().replace("\"","'") + "\",\"email\":\"" + u.getEmail() + "\"}");
            } else {
                System.err.println("❌ Invalid credentials for email: " + email);
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write("{\"error\":\"Invalid email or password\"}");
            }
        } catch (SQLException e) {
            System.err.println("❌ SQL Exception during login: " + e.getMessage());
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\":\"Database error: " + e.getMessage().replace("\"","'") + "\"}");
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\":\"An unexpected error occurred\"}");
        }
    }
}