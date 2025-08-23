package com.skincare.integration;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RoboflowSkinToneIntegration {
    
    private static final String API_URL = "https://serverless.roboflow.com/skin_color_analysis-wihi4/3";
    private static final String API_KEY = "AATAFwaxsawXABvmDHls";
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public RoboflowSkinToneIntegration() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Analyzes skin tone from uploaded image using Roboflow API
     */
    public Map<String, Object> analyzeSkinTone(MultipartFile imageFile) throws IOException, InterruptedException {
        System.out.println("🎨 Starting skin tone analysis with Roboflow API...");
        
        // Convert image to base64
        byte[] imageBytes = imageFile.getBytes();
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        
        System.out.println("📷 Image converted to base64, size: " + base64Image.length() + " characters");
        
        // Build HTTP request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + "?api_key=" + API_KEY))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(base64Image))
                .build();
        
        System.out.println("🚀 Sending request to Roboflow skin tone API...");
        
        // Send request and get response
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        System.out.println("📡 Received response with status: " + response.statusCode());
        System.out.println("📄 Response body: " + response.body());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("Roboflow API error: " + response.statusCode() + " - " + response.body());
        }
        
        // Parse response
        return parseApiResponse(response.body());
    }
    
    /**
     * Parses the Roboflow API response and extracts skin tone information
     */
    private Map<String, Object> parseApiResponse(String responseBody) throws IOException {
        System.out.println("🔍 Parsing Roboflow skin tone API response...");
        
        JsonNode rootNode = objectMapper.readTree(responseBody);
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Extract predictions from response
            JsonNode predictions = rootNode.get("predictions");
            
            if (predictions != null && predictions.isArray() && predictions.size() > 0) {
                // Get the first (highest confidence) prediction
                JsonNode firstPrediction = predictions.get(0);
                
                // Extract skin tone class and confidence
                String skinToneClass = firstPrediction.get("class").asText();
                double confidence = firstPrediction.get("confidence").asDouble();
                
                System.out.println("✅ Detected skin tone: " + skinToneClass + " (confidence: " + String.format("%.2f%%", confidence * 100) + ")");
                
                // Map the detected class to user-friendly information
                Map<String, Object> skinToneInfo = mapSkinToneClass(skinToneClass, confidence);
                
                result.put("success", true);
                result.put("skinTone", skinToneInfo);
                result.put("confidence", confidence);
                result.put("rawClass", skinToneClass);
                
            } else {
                System.out.println("⚠️ No skin tone predictions found in response");
                result.put("success", false);
                result.put("error", "No skin tone detected in the image");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error parsing skin tone API response: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("error", "Failed to parse skin tone analysis results");
        }
        
        return result;
    }
    
    /**
     * Maps the raw skin tone class to user-friendly information with recommendations
     */
    private Map<String, Object> mapSkinToneClass(String skinToneClass, double confidence) {
        Map<String, Object> skinToneInfo = new HashMap<>();
        
        // Determine undertone and depth based on the detected class
        String undertone = "Neutral";
        String depth = "Medium";
        List<String> colorRecommendations = new ArrayList<>();
        List<String> makeupTips = new ArrayList<>();
        String description = "";
        
        // Map different skin tone classes to appropriate information
        switch (skinToneClass.toLowerCase()) {
            case "fair":
            case "light":
            case "pale":
                depth = "Light";
                undertone = "Cool";
                description = "Light skin tone with cool undertones";
                colorRecommendations.add("Soft pastels and cool tones");
                colorRecommendations.add("Silver jewelry");
                colorRecommendations.add("Blues, purples, and cool greens");
                makeupTips.add("Use light coverage foundation");
                makeupTips.add("Opt for pink or berry lip colors");
                break;
                
            case "medium":
            case "olive":
                depth = "Medium";
                undertone = "Neutral";
                description = "Medium skin tone with neutral undertones";
                colorRecommendations.add("Earthy neutrals and warm tones");
                colorRecommendations.add("Gold or rose gold jewelry");
                colorRecommendations.add("Warm browns, oranges, and deep greens");
                makeupTips.add("Medium coverage foundation works well");
                makeupTips.add("Try coral or warm red lip colors");
                break;
                
            case "dark":
            case "deep":
            case "rich":
                depth = "Deep";
                undertone = "Warm";
                description = "Deep skin tone with warm undertones";
                colorRecommendations.add("Rich, vibrant colors");
                colorRecommendations.add("Gold jewelry");
                colorRecommendations.add("Deep purples, bright oranges, and emerald greens");
                makeupTips.add("Full coverage foundation for even tone");
                makeupTips.add("Bold lip colors like deep reds or plums");
                break;
                
            default:
                // Default mapping for unknown classes
                description = "Detected skin tone: " + skinToneClass;
                colorRecommendations.add("Versatile neutral colors");
                colorRecommendations.add("Mixed metal jewelry");
                makeupTips.add("Experiment with different shades");
        }
        
        skinToneInfo.put("undertone", undertone);
        skinToneInfo.put("depth", depth);
        skinToneInfo.put("description", description);
        skinToneInfo.put("colorRecommendations", colorRecommendations);
        skinToneInfo.put("makeupTips", makeupTips);
        skinToneInfo.put("confidence", String.format("%.1f%%", confidence * 100));
        
        return skinToneInfo;
    }
}
