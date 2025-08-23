package com.skincare.controller;

import com.skincare.dao.ClinicDao;
import com.skincare.model.Clinic;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/clinics")
@CrossOrigin(origins = "*")
public class ClinicController {

    private final ClinicDao clinicDao = new ClinicDao();

    // Initialize clinic table
    public ClinicController() {
        try {
            clinicDao.createTableIfNotExists();
            System.out.println("✅ ClinicController initialized successfully");
        } catch (SQLException e) {
            System.err.println("❌ Error initializing ClinicController: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllClinics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📋 Getting all clinics");
            List<Clinic> clinics = clinicDao.findAll();
            
            response.put("success", true);
            response.put("clinics", clinics);
            response.put("count", clinics.size());
            
            return ResponseEntity.ok(response);
        } catch (SQLException e) {
            System.err.println("❌ Error getting clinics: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getClinicById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📋 Getting clinic with ID: " + id);
            Clinic clinic = clinicDao.findById(id);
            
            if (clinic != null) {
                response.put("success", true);
                response.put("clinic", clinic);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Clinic not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (SQLException e) {
            System.err.println("❌ Error getting clinic: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getClinicsByStatus(@PathVariable String status) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📋 Getting clinics with status: " + status);
            List<Clinic> clinics = clinicDao.findByStatus(status);
            
            response.put("success", true);
            response.put("clinics", clinics);
            response.put("count", clinics.size());
            
            return ResponseEntity.ok(response);
        } catch (SQLException e) {
            System.err.println("❌ Error getting clinics by status: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createClinic(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam String address,
            @RequestParam String city,
            @RequestParam String postCode,
            @RequestParam String phone,
            @RequestParam String email,
            @RequestParam(required = false) String openingHours,
            @RequestParam(defaultValue = "active") String status,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(required = false) String popularTreatment,
            @RequestParam(defaultValue = "$$") String priceRange,
            @RequestParam(defaultValue = "4.5") double rating) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📝 Creating new clinic: " + name);
            
            // Validation
            if (name == null || name.isBlank() || address == null || address.isBlank() ||
                city == null || city.isBlank() || phone == null || phone.isBlank() ||
                email == null || email.isBlank()) {
                response.put("success", false);
                response.put("error", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }

            Clinic clinic = new Clinic();
            clinic.setName(name.trim());
            clinic.setDescription(description != null ? description.trim() : "");
            clinic.setAddress(address.trim());
            clinic.setCity(city.trim());
            clinic.setPostCode(postCode.trim());
            clinic.setPhone(phone.trim());
            clinic.setEmail(email.trim());
            clinic.setOpeningHours(openingHours != null ? openingHours.trim() : "");
            clinic.setStatus(status);
            clinic.setImageUrl(imageUrl != null ? imageUrl.trim() : "Pics/photo_2025-07-02_23-55-49.jpg");
            clinic.setPopularTreatment(popularTreatment != null ? popularTreatment.trim() : "Acne Removal");
            clinic.setPriceRange(priceRange);
            clinic.setRating(rating);

            boolean success = clinicDao.insert(clinic);
            if (success) {
                System.out.println("✅ Clinic created successfully: " + clinic.getName());
                response.put("success", true);
                response.put("message", "Clinic created successfully");
                response.put("clinic", clinic);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to create clinic");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (SQLException e) {
            System.err.println("❌ Error creating clinic: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateClinic(
            @PathVariable int id,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam String address,
            @RequestParam String city,
            @RequestParam String postCode,
            @RequestParam String phone,
            @RequestParam String email,
            @RequestParam(required = false) String openingHours,
            @RequestParam String status,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(required = false) String popularTreatment,
            @RequestParam(required = false) String priceRange,
            @RequestParam(required = false) Double rating) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📝 Updating clinic with ID: " + id);
            
            // Check if clinic exists
            Clinic existingClinic = clinicDao.findById(id);
            if (existingClinic == null) {
                response.put("success", false);
                response.put("error", "Clinic not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Validation
            if (name == null || name.isBlank() || address == null || address.isBlank() ||
                city == null || city.isBlank() || phone == null || phone.isBlank() ||
                email == null || email.isBlank()) {
                response.put("success", false);
                response.put("error", "Missing required fields");
                return ResponseEntity.badRequest().body(response);
            }

            // Update clinic data
            existingClinic.setName(name.trim());
            existingClinic.setDescription(description != null ? description.trim() : existingClinic.getDescription());
            existingClinic.setAddress(address.trim());
            existingClinic.setCity(city.trim());
            existingClinic.setPostCode(postCode.trim());
            existingClinic.setPhone(phone.trim());
            existingClinic.setEmail(email.trim());
            existingClinic.setOpeningHours(openingHours != null ? openingHours.trim() : existingClinic.getOpeningHours());
            existingClinic.setStatus(status);
            if (imageUrl != null) existingClinic.setImageUrl(imageUrl.trim());
            if (popularTreatment != null) existingClinic.setPopularTreatment(popularTreatment.trim());
            if (priceRange != null) existingClinic.setPriceRange(priceRange);
            if (rating != null) existingClinic.setRating(rating);

            boolean success = clinicDao.update(existingClinic);
            if (success) {
                System.out.println("✅ Clinic updated successfully: " + existingClinic.getName());
                response.put("success", true);
                response.put("message", "Clinic updated successfully");
                response.put("clinic", existingClinic);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to update clinic");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (SQLException e) {
            System.err.println("❌ Error updating clinic: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteClinic(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("🗑️ Deleting clinic with ID: " + id);
            
            // Check if clinic exists
            Clinic existingClinic = clinicDao.findById(id);
            if (existingClinic == null) {
                response.put("success", false);
                response.put("error", "Clinic not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            boolean success = clinicDao.delete(id);
            if (success) {
                System.out.println("✅ Clinic deleted successfully");
                response.put("success", true);
                response.put("message", "Clinic deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Failed to delete clinic");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (SQLException e) {
            System.err.println("❌ Error deleting clinic: " + e.getMessage());
            response.put("success", false);
            response.put("error", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
