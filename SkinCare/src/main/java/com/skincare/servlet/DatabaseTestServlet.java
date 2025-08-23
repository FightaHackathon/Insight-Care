package com.skincare.servlet;

import com.skincare.DBconnection;
import com.skincare.dao.UserDao;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

@WebServlet(name = "DatabaseTestServlet", urlPatterns = "/test-db")
public class DatabaseTestServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        
        out.println("<!DOCTYPE html>");
        out.println("<html><head><title>Database Connection Test</title>");
        out.println("<style>");
        out.println("body { font-family: Arial, sans-serif; margin: 40px; }");
        out.println(".success { color: green; }");
        out.println(".error { color: red; }");
        out.println(".info { color: blue; }");
        out.println("pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }");
        out.println("</style></head><body>");
        out.println("<h1>SkinCare Database Connection Test</h1>");
        
        try {
            // Test 1: Basic Connection
            out.println("<h2>Test 1: Database Connection</h2>");
            Connection conn = DBconnection.getConnection();
            if (conn != null) {
                out.println("<p class='success'>✅ Successfully connected to MySQL database!</p>");
                
                // Get database info
                DatabaseMetaData metaData = conn.getMetaData();
                out.println("<p class='info'>Database URL: " + metaData.getURL() + "</p>");
                out.println("<p class='info'>Database Product: " + metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion() + "</p>");
                out.println("<p class='info'>Driver: " + metaData.getDriverName() + " " + metaData.getDriverVersion() + "</p>");
                
                // Test 2: Table Creation
                out.println("<h2>Test 2: Table Creation</h2>");
                UserDao userDao = new UserDao();
                userDao.createTableIfNotExists();
                out.println("<p class='success'>✅ Users table created/verified successfully!</p>");
                
                // Test 3: Check if table exists and show structure
                out.println("<h2>Test 3: Table Structure</h2>");
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("DESCRIBE users");
                out.println("<table border='1' style='border-collapse: collapse;'>");
                out.println("<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>");
                while (rs.next()) {
                    out.println("<tr>");
                    out.println("<td>" + rs.getString("Field") + "</td>");
                    out.println("<td>" + rs.getString("Type") + "</td>");
                    out.println("<td>" + rs.getString("Null") + "</td>");
                    out.println("<td>" + rs.getString("Key") + "</td>");
                    out.println("<td>" + rs.getString("Default") + "</td>");
                    out.println("<td>" + rs.getString("Extra") + "</td>");
                    out.println("</tr>");
                }
                out.println("</table>");
                
                // Test 4: Count existing users
                out.println("<h2>Test 4: Existing Data</h2>");
                rs = stmt.executeQuery("SELECT COUNT(*) as count FROM users");
                if (rs.next()) {
                    int count = rs.getInt("count");
                    out.println("<p class='info'>Current number of users in database: " + count + "</p>");
                }
                
                // Test 5: Show recent users (if any)
                if (rs.getInt("count") > 0) {
                    out.println("<h3>Recent Users:</h3>");
                    rs = stmt.executeQuery("SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT 5");
                    out.println("<table border='1' style='border-collapse: collapse;'>");
                    out.println("<tr><th>ID</th><th>Name</th><th>Email</th><th>Created</th></tr>");
                    while (rs.next()) {
                        out.println("<tr>");
                        out.println("<td>" + rs.getInt("id") + "</td>");
                        out.println("<td>" + rs.getString("name") + "</td>");
                        out.println("<td>" + rs.getString("email") + "</td>");
                        out.println("<td>" + rs.getTimestamp("created_at") + "</td>");
                        out.println("</tr>");
                    }
                    out.println("</table>");
                }
                
                conn.close();
                out.println("<p class='success'>✅ All database tests completed successfully!</p>");
                
            } else {
                out.println("<p class='error'>❌ Failed to connect to MySQL database.</p>");
            }
            
        } catch (Exception e) {
            out.println("<p class='error'>❌ Database Error:</p>");
            out.println("<pre class='error'>" + e.getMessage() + "</pre>");
            out.println("<h3>Stack Trace:</h3>");
            out.println("<pre>");
            e.printStackTrace(out);
            out.println("</pre>");
        }
        
        out.println("<hr>");
        out.println("<p><a href='/'>← Back to Home</a></p>");
        out.println("</body></html>");
    }
}