package com.skincare.controller;

import com.skincare.integration.RoboflowSkinToneIntegration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/skin-tone")
@CrossOrigin(origins = "*")
public class SkinToneAnalysisController {
    
    @Autowired
    private RoboflowSkinToneIntegration skinToneIntegration;
    
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeSkinTone(@RequestParam("image") MultipartFile imageFile) {
        System.out.println("🎨 Received skin tone analysis request");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file
            if (imageFile == null || imageFile.isEmpty()) {
                System.err.println("❌ No image file provided");
                response.put("success", false);
                response.put("error", "No image file provided");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check file type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.err.println("❌ Invalid file type: " + contentType);
                response.put("success", false);
                response.put("error", "Please upload a valid image file");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check file size (limit to 10MB)
            if (imageFile.getSize() > 10 * 1024 * 1024) {
                System.err.println("❌ File too large: " + imageFile.getSize() + " bytes");
                response.put("success", false);
                response.put("error", "Image file is too large. Please upload an image smaller than 10MB");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("✅ File validation passed - Type: " + contentType + ", Size: " + imageFile.getSize() + " bytes");
            
            // Perform skin tone analysis
            Map<String, Object> analysisResult = skinToneIntegration.analyzeSkinTone(imageFile);
            
            if ((Boolean) analysisResult.get("success")) {
                System.out.println("✅ Skin tone analysis completed successfully");
                return ResponseEntity.ok(analysisResult);
            } else {
                System.err.println("❌ Skin tone analysis failed: " + analysisResult.get("error"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(analysisResult);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error during skin tone analysis: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("error", "An error occurred during skin tone analysis: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Skin Tone Analysis API");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
