package com.skincare.dao;

import com.skincare.DBconnection;
import com.skincare.model.Clinic;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ClinicDao {
    
    public void createTableIfNotExists() throws SQLException {
        String sql = "CREATE TABLE IF NOT EXISTS clinics (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "name VARCHAR(255) NOT NULL, " +
                "description TEXT, " +
                "address VARCHAR(500) NOT NULL, " +
                "city VARCHAR(100) NOT NULL, " +
                "post_code VARCHAR(20) NOT NULL, " +
                "phone VARCHAR(50) NOT NULL, " +
                "email VARCHAR(255) NOT NULL, " +
                "opening_hours VARCHAR(255), " +
                "status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active', " +
                "image_url VARCHAR(500), " +
                "popular_treatment VARCHAR(255), " +
                "price_range VARCHAR(10) DEFAULT '$$', " +
                "rating DECIMAL(3,2) DEFAULT 4.5, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";
        
        try (Connection conn = DBconnection.getConnection();
             Statement st = conn.createStatement()) {
            st.execute(sql);
            System.out.println("✅ Clinics table created/verified successfully");
        } catch (SQLException e) {
            System.err.println("❌ Error creating clinics table: " + e.getMessage());
            throw e;
        }
    }

    public boolean insert(Clinic clinic) throws SQLException {
        String sql = "INSERT INTO clinics(name, description, address, city, post_code, phone, email, " +
                    "opening_hours, status, image_url, popular_treatment, price_range, rating) " +
                    "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
        
        try (Connection conn = DBconnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            System.out.println("🔄 Attempting to insert clinic: " + clinic.getName());

            ps.setString(1, clinic.getName());
            ps.setString(2, clinic.getDescription());
            ps.setString(3, clinic.getAddress());
            ps.setString(4, clinic.getCity());
            ps.setString(5, clinic.getPostCode());
            ps.setString(6, clinic.getPhone());
            ps.setString(7, clinic.getEmail());
            ps.setString(8, clinic.getOpeningHours());
            ps.setString(9, clinic.getStatus());
            ps.setString(10, clinic.getImageUrl());
            ps.setString(11, clinic.getPopularTreatment());
            ps.setString(12, clinic.getPriceRange());
            ps.setDouble(13, clinic.getRating());
            
            int rowsAffected = ps.executeUpdate();
            System.out.println("📊 Rows affected: " + rowsAffected);
            
            if (rowsAffected == 1) {
                try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        clinic.setId(generatedKeys.getInt(1));
                        System.out.println("✅ Clinic inserted successfully with ID: " + clinic.getId());
                    }
                }
                return true;
            } else {
                System.err.println("❌ No rows were inserted");
                return false;
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error during clinic insert: " + e.getMessage());
            throw e;
        }
    }

    public boolean update(Clinic clinic) throws SQLException {
        String sql = "UPDATE clinics SET name=?, description=?, address=?, city=?, post_code=?, " +
                    "phone=?, email=?, opening_hours=?, status=?, image_url=?, popular_treatment=?, " +
                    "price_range=?, rating=?, updated_at=CURRENT_TIMESTAMP WHERE id=?";
        
        try (Connection conn = DBconnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            System.out.println("🔄 Attempting to update clinic: " + clinic.getName());

            ps.setString(1, clinic.getName());
            ps.setString(2, clinic.getDescription());
            ps.setString(3, clinic.getAddress());
            ps.setString(4, clinic.getCity());
            ps.setString(5, clinic.getPostCode());
            ps.setString(6, clinic.getPhone());
            ps.setString(7, clinic.getEmail());
            ps.setString(8, clinic.getOpeningHours());
            ps.setString(9, clinic.getStatus());
            ps.setString(10, clinic.getImageUrl());
            ps.setString(11, clinic.getPopularTreatment());
            ps.setString(12, clinic.getPriceRange());
            ps.setDouble(13, clinic.getRating());
            ps.setInt(14, clinic.getId());
            
            int rowsAffected = ps.executeUpdate();
            System.out.println("📊 Rows affected: " + rowsAffected);
            
            if (rowsAffected == 1) {
                System.out.println("✅ Clinic updated successfully: " + clinic.getName());
                return true;
            } else {
                System.err.println("❌ No rows were updated");
                return false;
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error during clinic update: " + e.getMessage());
            throw e;
        }
    }

    public boolean delete(int clinicId) throws SQLException {
        String sql = "DELETE FROM clinics WHERE id=?";
        
        try (Connection conn = DBconnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            System.out.println("🔄 Attempting to delete clinic with ID: " + clinicId);

            ps.setInt(1, clinicId);
            
            int rowsAffected = ps.executeUpdate();
            System.out.println("📊 Rows affected: " + rowsAffected);
            
            if (rowsAffected == 1) {
                System.out.println("✅ Clinic deleted successfully");
                return true;
            } else {
                System.err.println("❌ No rows were deleted");
                return false;
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error during clinic delete: " + e.getMessage());
            throw e;
        }
    }

    public Clinic findById(int id) throws SQLException {
        String sql = "SELECT * FROM clinics WHERE id=?";
        
        try (Connection conn = DBconnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToClinic(rs);
                } else {
                    System.out.println("❌ No clinic found with ID: " + id);
                    return null;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Database error during clinic findById: " + e.getMessage());
            throw e;
        }
    }

    public List<Clinic> findAll() throws SQLException {
        String sql = "SELECT * FROM clinics ORDER BY created_at DESC";
        List<Clinic> clinics = new ArrayList<>();
        
        try (Connection conn = DBconnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                clinics.add(mapResultSetToClinic(rs));
            }
            
            System.out.println("✅ Found " + clinics.size() + " clinics");
            return clinics;
        } catch (SQLException e) {
            System.err.println("❌ Database error during clinic findAll: " + e.getMessage());
            throw e;
        }
    }

    public List<Clinic> findByStatus(String status) throws SQLException {
        String sql = "SELECT * FROM clinics WHERE status=? ORDER BY created_at DESC";
        List<Clinic> clinics = new ArrayList<>();
        
        try (Connection conn = DBconnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status);
            
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    clinics.add(mapResultSetToClinic(rs));
                }
            }
            
            System.out.println("✅ Found " + clinics.size() + " clinics with status: " + status);
            return clinics;
        } catch (SQLException e) {
            System.err.println("❌ Database error during clinic findByStatus: " + e.getMessage());
            throw e;
        }
    }

    private Clinic mapResultSetToClinic(ResultSet rs) throws SQLException {
        Clinic clinic = new Clinic();
        clinic.setId(rs.getInt("id"));
        clinic.setName(rs.getString("name"));
        clinic.setDescription(rs.getString("description"));
        clinic.setAddress(rs.getString("address"));
        clinic.setCity(rs.getString("city"));
        clinic.setPostCode(rs.getString("post_code"));
        clinic.setPhone(rs.getString("phone"));
        clinic.setEmail(rs.getString("email"));
        clinic.setOpeningHours(rs.getString("opening_hours"));
        clinic.setStatus(rs.getString("status"));
        clinic.setImageUrl(rs.getString("image_url"));
        clinic.setPopularTreatment(rs.getString("popular_treatment"));
        clinic.setPriceRange(rs.getString("price_range"));
        clinic.setRating(rs.getDouble("rating"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            clinic.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            clinic.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return clinic;
    }
}
