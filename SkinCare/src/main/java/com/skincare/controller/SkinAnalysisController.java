package com.skincare.controller;

import com.skincare.service.RoboflowSkinAnalysisIntegration;
import com.skincare.service.RoboflowSkinAnalysisIntegration.SkinAnalysisResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/skin-analysis")
@CrossOrigin(origins = "*")
public class SkinAnalysisController {

    @Autowired
    private RoboflowSkinAnalysisIntegration skinAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeSkin(@RequestParam("image") MultipartFile image) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file
            if (image.isEmpty()) {
                response.put("success", false);
                response.put("error", "No image file provided");
                return ResponseEntity.badRequest().body(response);
            }

            // Check file type
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("error", "Invalid file type. Please upload an image file.");
                return ResponseEntity.badRequest().body(response);
            }

            // Check file size (limit to 10MB)
            if (image.getSize() > 10 * 1024 * 1024) {
                response.put("success", false);
                response.put("error", "File size too large. Please upload an image smaller than 10MB.");
                return ResponseEntity.badRequest().body(response);
            }

            // Perform skin analysis
            SkinAnalysisResult result = skinAnalysisService.analyzeSkinCondition(image);

            // Format response
            response.put("success", true);
            response.put("analysis", formatAnalysisResult(result));
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Analysis failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Map<String, Object> formatAnalysisResult(SkinAnalysisResult result) {
        Map<String, Object> formattedResult = new HashMap<>();

        // Basic analysis info
        if (result.getMainCondition() != null) {
            formattedResult.put("confidence", result.getMainCondition().getConfidence());
        }

        // Convert conditions to map format (maintaining order by confidence)
        Map<String, Double> detectedConditions = new LinkedHashMap<>();
        if (result.getMainCondition() != null) {
            detectedConditions.put(result.getMainCondition().getName(), result.getMainCondition().getConfidence());
        }
        if (result.getOtherConditions() != null) {
            // Sort other conditions by confidence (highest first) before adding
            result.getOtherConditions().stream()
                .sorted((a, b) -> Double.compare(b.getConfidence(), a.getConfidence()))
                .forEach(condition -> detectedConditions.put(condition.getName(), condition.getConfidence()));
        }
        formattedResult.put("detectedConditions", detectedConditions);

        // Generate user-friendly summary
        String summary = generateSummary(result);
        formattedResult.put("summary", summary);

        // Generate recommendations
        String recommendations = generateRecommendations(result);
        formattedResult.put("recommendations", recommendations);

        return formattedResult;
    }

    private String generateSummary(SkinAnalysisResult result) {
        StringBuilder summary = new StringBuilder();

        if (!result.isSuccess()) {
            summary.append("❌ Analysis could not be completed: ").append(result.getMessage());
            return summary.toString();
        }

        boolean hasConditions = result.getMainCondition() != null ||
                               (result.getOtherConditions() != null && !result.getOtherConditions().isEmpty());

        if (!hasConditions) {
            summary.append("✨ Great news! Your skin appears to be in good condition with no major concerns detected.");
        } else {
            summary.append("📊 Analysis detected the following skin conditions:\n");

            if (result.getMainCondition() != null) {
                summary.append(String.format("• %s (%.2f%% confidence) - Primary concern\n",
                    formatConditionName(result.getMainCondition().getName()),
                    result.getMainCondition().getConfidence() * 100));
            }

            if (result.getOtherConditions() != null) {
                for (var condition : result.getOtherConditions()) {
                    summary.append(String.format("• %s (%.2f%% confidence)\n",
                        formatConditionName(condition.getName()),
                        condition.getConfidence() * 100));
                }
            }
        }

        return summary.toString();
    }

    private String generateRecommendations(SkinAnalysisResult result) {
        StringBuilder recommendations = new StringBuilder();
        recommendations.append("💡 Personalized Recommendations:\n\n");

        boolean hasConditions = result.getMainCondition() != null ||
                               (result.getOtherConditions() != null && !result.getOtherConditions().isEmpty());

        if (!hasConditions) {
            recommendations.append("• Continue your current skincare routine\n");
            recommendations.append("• Use daily SPF protection\n");
            recommendations.append("• Maintain proper hydration\n");
            recommendations.append("• Consider regular professional skin checkups\n");
        } else {
            // Add specific recommendations based on detected conditions
            if (result.getMainCondition() != null) {
                recommendations.append(getConditionRecommendations(result.getMainCondition().getName()));
            }

            if (result.getOtherConditions() != null) {
                for (var condition : result.getOtherConditions()) {
                    recommendations.append(getConditionRecommendations(condition.getName()));
                }
            }

            // General recommendations
            recommendations.append("\n🌟 General Care Tips:\n");
            recommendations.append("• Consult with a dermatologist for professional advice\n");
            recommendations.append("• Use gentle, fragrance-free products\n");
            recommendations.append("• Always apply sunscreen (SPF 30+)\n");
            recommendations.append("• Maintain a consistent skincare routine\n");
        }

        return recommendations.toString();
    }

    private String getConditionRecommendations(String condition) {
        switch (condition.toLowerCase()) {
            case "acne":
                return "• Use salicylic acid or benzoyl peroxide treatments\n" +
                       "• Avoid over-cleansing which can irritate skin\n" +
                       "• Consider non-comedogenic products\n\n";
            case "dark spots":
            case "hyperpigmentation":
                return "• Use vitamin C serum in the morning\n" +
                       "• Consider retinol products (start slowly)\n" +
                       "• Extra sun protection is crucial\n\n";
            case "wrinkles":
            case "fine lines":
                return "• Use retinol or retinoid products\n" +
                       "• Apply moisturizer with hyaluronic acid\n" +
                       "• Consider anti-aging serums\n\n";
            case "dryness":
                return "• Use a gentle, hydrating cleanser\n" +
                       "• Apply moisturizer while skin is still damp\n" +
                       "• Consider using a humidifier\n\n";
            default:
                return "• Follow a gentle skincare routine\n" +
                       "• Monitor the condition regularly\n\n";
        }
    }

    private String formatConditionName(String condition) {
        // Convert API condition names to user-friendly names
        switch (condition.toLowerCase()) {
            case "acne": return "Acne";
            case "dark spots": return "Dark Spots";
            case "hyperpigmentation": return "Hyperpigmentation";
            case "wrinkles": return "Wrinkles";
            case "fine lines": return "Fine Lines";
            case "dryness": return "Dry Skin";
            case "oiliness": return "Oily Skin";
            default: return condition.substring(0, 1).toUpperCase() + condition.substring(1);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Skin Analysis API");
        return ResponseEntity.ok(response);
    }
}
