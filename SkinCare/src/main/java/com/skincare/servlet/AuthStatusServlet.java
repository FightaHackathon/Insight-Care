package com.skincare.servlet;

import com.skincare.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet(name = "AuthStatusServlet", urlPatterns = "/api/auth/status")
public class AuthStatusServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        
        HttpSession session = req.getSession(false);
        if (session != null) {
            User user = (User) session.getAttribute("user");
            if (user != null) {
                resp.getWriter().write("{\"authenticated\":true,\"user\":{\"id\":" + user.getId() + 
                    ",\"name\":\"" + user.getName().replace("\"", "'") + 
                    "\",\"email\":\"" + user.getEmail() + "\"}}");
                return;
            }
        }
        
        resp.getWriter().write("{\"authenticated\":false}");
    }
}