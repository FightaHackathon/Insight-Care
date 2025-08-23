package com.skincare.dao;

import com.skincare.DBconnection;
import com.skincare.model.User;

import java.sql.*;

public class UserDao {
    public void createTableIfNotExists() throws SQLException {
        // Check if the table exists and matches your existing structure
        String sql = "CREATE TABLE IF NOT EXISTS users (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "name VARCHAR(255) NOT NULL, " +
                "email VARCHAR(255) NOT NULL UNIQUE, " +
                "password VARCHAR(255) NOT NULL, " +
                "role ENUM('user', 'admin') DEFAULT 'user', " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
        try (Connection conn = DBconnection.getConnection();
             Statement st = conn.createStatement()) {
            st.execute(sql);
            System.out.println("✅ Users table created/verified successfully");
        } catch (SQLException e) {
            System.err.println("❌ Error creating users table: " + e.getMessage());
            throw e;
        }
    }

    public boolean insert(User user) throws SQLException {
        String sql = "INSERT INTO users(name, email, password, role) VALUES(?,?,?,?)";
        try (Connection conn = DBconnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            System.out.println("🔄 Attempting to insert user: " + user.getEmail());

            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword());
            ps.setString(4, user.getRole() != null ? user.getRole() : "user");
            
            int rowsAffected = ps.executeUpdate();
            System.out.println("📊 Rows affected: " + rowsAffected);
            
            if (rowsAffected == 1) {
                // Get the generated ID
                try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        user.setId(generatedKeys.getInt(1));
                        System.out.println("✅ User inserted successfully with ID: " + user.getId());
                    }
                }
                return true;
            } else {
                System.err.println("❌ No rows were inserted");
                return false;
            }
        } catch (SQLIntegrityConstraintViolationException dup) {
            System.err.println("❌ Duplicate email error: " + user.getEmail());
            throw new SQLException("Email already exists", dup);
        } catch (SQLException e) {
            System.err.println("❌ Database error during insert: " + e.getMessage());
            throw e;
        }
    }

    public User findByEmailAndPassword(String email, String password) throws SQLException {
        String sql = "SELECT id, name, email, password, role FROM users WHERE email=? AND password=?";
        try (Connection conn = DBconnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            System.out.println("🔍 Attempting to find user: " + email);

            ps.setString(1, email);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    User u = new User();
                    u.setId(rs.getInt("id"));
                    u.setName(rs.getString("name"));
                    u.setEmail(rs.getString("email"));
                    u.setPassword(rs.getString("password"));
                    u.setRole(rs.getString("role"));
                    System.out.println("✅ User found: " + u.getName() + " (ID: " + u.getId() + ", Role: " + u.getRole() + ")");
                    return u;
                } else {
                    System.out.println("❌ No user found with email: " + email);
                    return null;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error during login: " + e.getMessage());
            throw e;
        }
    }
}