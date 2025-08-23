package com.skincare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Roboflow Skin Analysis Integration
 * 
 * This service integrates with Roboflow's skin-problem-multilabel-c1i6e/1 model
 * to analyze skin conditions from uploaded images.
 * 
 * Usage:
 * 1. Add this file to your Spring Boot project
 * 2. Update the API_KEY constant with your Roboflow API key
 * 3. Inject this service into your controller
 * 4. Call analyzeSkinCondition(MultipartFile image) method
 */
@Service
public class RoboflowSkinAnalysisIntegration {

    // Configuration constants - UPDATE THESE FOR YOUR SETUP
    private static final String API_KEY = "AATAFwaxsawXABvmDHls"; // Replace with your API key
    private static final String API_URL = "https://serverless.roboflow.com";
    private static final String MODEL_ID = "skin-problem-multilabel-c1i6e/1";
    private static final double CONFIDENCE_THRESHOLD = 0.1;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public RoboflowSkinAnalysisIntegration() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Main method to analyze skin condition from uploaded image
     * 
     * @param image MultipartFile containing the skin image
     * @return SkinAnalysisResult containing detected conditions
     * @throws IOException if image processing fails
     */
    public SkinAnalysisResult analyzeSkinCondition(MultipartFile image) throws IOException {
        // Convert image to base64
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        
        try {
            // Make API call to Roboflow
            String apiUrl = String.format("%s/%s?api_key=%s", API_URL, MODEL_ID, API_KEY);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<String> request = new HttpEntity<>(base64Image, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Roboflow API call failed: " + response.getStatusCode());
            }
            
            // Parse and process response
            JsonNode responseData = objectMapper.readTree(response.getBody());
            System.out.println("ROBOFLOW API RESPONSE: " + response.getBody());
            List<SkinCondition> conditions = processPredictions(responseData);
            
            if (conditions.isEmpty()) {
                return new SkinAnalysisResult(false, "No skin conditions detected", null, null);
            }
            
            // Sort by confidence (highest first)
            conditions.sort((a, b) -> Double.compare(b.getConfidence(), a.getConfidence()));
            
            // Get main condition and other significant conditions
            SkinCondition mainCondition = conditions.get(0);
            List<SkinCondition> otherConditions = conditions.stream()
                .skip(1)
                .filter(condition -> condition.getConfidence() >= 0.5) // Show conditions with 50% or higher confidence
                .collect(Collectors.toList());
            
            return new SkinAnalysisResult(true, "Analysis completed", mainCondition, otherConditions);
            
        } catch (Exception e) {
            return new SkinAnalysisResult(false, "Analysis failed: " + e.getMessage(), null, null);
        }
    }

    /**
     * Process predictions from Roboflow API response
     */
    private List<SkinCondition> processPredictions(JsonNode responseData) {
        List<SkinCondition> conditions = new ArrayList<>();
        
        // Handle the actual Roboflow response format we're getting
        if (responseData.has("predictions") && responseData.get("predictions").isObject()) {
            // Current Roboflow format: predictions is an object with condition names as keys
            JsonNode predictions = responseData.get("predictions");
            Iterator<Map.Entry<String, JsonNode>> fields = predictions.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String conditionName = field.getKey();
                JsonNode conditionData = field.getValue();

                if (conditionData.has("confidence")) {
                    double confidence = conditionData.get("confidence").asDouble();
                    conditions.add(new SkinCondition(conditionName, confidence));
                }
            }
        } else if (responseData.has("predictions") && responseData.get("predictions").isArray()) {
            // Standard object detection format (array)
            for (JsonNode prediction : responseData.get("predictions")) {
                String className = prediction.get("class").asText();
                double confidence = prediction.get("confidence").asDouble();
                conditions.add(new SkinCondition(className, confidence));
            }
        } else if (responseData.has("predicted_classes") && responseData.get("predicted_classes").isArray()) {
            // Multi-label classification format
            JsonNode predictedClasses = responseData.get("predicted_classes");
            JsonNode confidences = responseData.get("confidence");
            
            for (int i = 0; i < predictedClasses.size(); i++) {
                String className = predictedClasses.get(i).asText();
                double confidence = confidences != null ? confidences.get(i).asDouble() : 0.5;
                conditions.add(new SkinCondition(className, confidence));
            }
        } else {
            // Direct object format (class names as keys)
            Iterator<Map.Entry<String, JsonNode>> fields = responseData.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String key = field.getKey();
                JsonNode value = field.getValue();
                
                // Skip metadata fields and only process numeric confidence values
                if (!isMetadataField(key) && value.isNumber()) {
                    conditions.add(new SkinCondition(key, value.asDouble()));
                }
            }
        }
        
        // Filter by confidence threshold
        return conditions.stream()
            .filter(condition -> condition.getConfidence() >= CONFIDENCE_THRESHOLD)
            .collect(Collectors.toList());
    }

    /**
     * Check if a field is metadata (not a skin condition)
     */
    private boolean isMetadataField(String key) {
        return key.equals("time") || key.equals("inference_id") || 
               key.equals("image") || key.equals("predictions");
    }

    // Data classes for results
    public static class SkinAnalysisResult {
        private boolean success;
        private String message;
        private SkinCondition mainCondition;
        private List<SkinCondition> otherConditions;

        public SkinAnalysisResult(boolean success, String message, 
                                 SkinCondition mainCondition, List<SkinCondition> otherConditions) {
            this.success = success;
            this.message = message;
            this.mainCondition = mainCondition;
            this.otherConditions = otherConditions;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public SkinCondition getMainCondition() { return mainCondition; }
        public List<SkinCondition> getOtherConditions() { return otherConditions; }
    }

    public static class SkinCondition {
        private String name;
        private double confidence;
        private int confidencePercentage;

        public SkinCondition(String name, double confidence) {
            this.name = name;
            this.confidence = confidence;
            this.confidencePercentage = (int) Math.round(confidence * 100);
        }

        // Getters
        public String getName() { return name; }
        public double getConfidence() { return confidence; }
        public int getConfidencePercentage() { return confidencePercentage; }
    }
}

/*
 * USAGE EXAMPLE IN YOUR CONTROLLER:
 * 
 * @RestController
 * @RequestMapping("/api")
 * public class SkinAnalysisController {
 * 
 *     @Autowired
 *     private RoboflowSkinAnalysisIntegration skinAnalysisService;
 * 
 *     @PostMapping("/analyze-skin")
 *     public ResponseEntity<?> analyzeSkin(@RequestParam("image") MultipartFile image) {
 *         try {
 *             RoboflowSkinAnalysisIntegration.SkinAnalysisResult result = 
 *                 skinAnalysisService.analyzeSkinCondition(image);
 *             
 *             if (result.isSuccess()) {
 *                 return ResponseEntity.ok(result);
 *             } else {
 *                 return ResponseEntity.badRequest().body(result);
 *             }
 *         } catch (Exception e) {
 *             return ResponseEntity.internalServerError()
 *                 .body("Error: " + e.getMessage());
 *         }
 *     }
 * }
 */
