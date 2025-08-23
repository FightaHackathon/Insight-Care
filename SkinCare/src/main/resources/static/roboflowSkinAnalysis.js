/**
 * Roboflow Skin Analysis Integration - TypeScript/Frontend Version
 *
 * This file contains functions to integrate Roboflow skin condition analysis
 * into your TypeScript/React frontend application.
 *
 * Usage:
 * 1. Copy this file to your project
 * 2. Update the API_KEY and BACKEND_URL constants
 * 3. Import and use the functions in your components
 */
// Configuration - UPDATE THESE FOR YOUR SETUP
const API_KEY = "AATAFwaxsawXABvmDHls"; // Replace with your API key
const ROBOFLOW_API_URL = "https://serverless.roboflow.com";
const MODEL_ID = "skin-problem-multilabel-c1i6e/1";
const BACKEND_URL = "http://localhost:8080/api"; // Your Spring Boot backend URL
/**
 * Option 1: Direct Roboflow API call from frontend
 * Use this if you want to call Roboflow directly from your frontend
 */
export async function analyzeSkinDirectly(file) {
    try {
        // Convert file to base64
        const base64Image = await fileToBase64(file);
        // Make API call to Roboflow
        const apiUrl = `${ROBOFLOW_API_URL}/${MODEL_ID}?api_key=${API_KEY}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: base64Image
        });
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        const data = await response.json();
        // Process the response
        const conditions = processPredictions(data);
        if (conditions.length === 0) {
            return {
                success: false,
                message: "No skin conditions detected"
            };
        }
        // Sort by confidence
        conditions.sort((a, b) => b.confidence - a.confidence);
        const mainCondition = conditions[0];
        const otherConditions = conditions.slice(1).filter(c => c.confidence >= 0.5);
        return {
            success: true,
            message: "Analysis completed successfully",
            mainCondition,
            otherConditions
        };
    }
    catch (error) {
        return {
            success: false,
            message: `Analysis failed: ${error.message}`
        };
    }
}
/**
 * Option 2: Call your Spring Boot backend
 * Use this if you want to go through your backend (recommended for production)
 */
export async function analyzeSkinViaBackend(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${BACKEND_URL}/analyze-skin`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Backend call failed: ${response.status}`);
        }
        const result = await response.json();
        return result;
    }
    catch (error) {
        return {
            success: false,
            message: `Analysis failed: ${error.message}`
        };
    }
}
/**
 * Convert File to base64 string
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            // Remove the data:image/jpeg;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}
/**
 * Process predictions from Roboflow API response
 */
function processPredictions(responseData) {
    const conditions = [];
    const confidenceThreshold = 0.1;
    // Handle different response formats
    if (responseData.predictions && Array.isArray(responseData.predictions)) {
        // Standard object detection format
        responseData.predictions.forEach((prediction) => {
            conditions.push({
                name: prediction.class,
                confidence: prediction.confidence,
                confidencePercentage: formatConfidencePercent(prediction.confidence)
            });
        });
    }
    else if (responseData.predicted_classes && Array.isArray(responseData.predicted_classes)) {
        // Multi-label classification format
        responseData.predicted_classes.forEach((className, index) => {
            const confidence = responseData.confidence ? responseData.confidence[index] : 0.5;
            conditions.push({
                name: className,
                confidence: confidence,
                confidencePercentage: formatConfidencePercent(confidence)
            });
        });
    }
    else {
        // Direct object format (class names as keys)
        Object.keys(responseData).forEach(key => {
            const value = responseData[key];
            // Skip metadata fields and only process numeric confidence values
            if (!isMetadataField(key) && typeof value === 'number') {
                conditions.push({
                    name: key,
                    confidence: value,
                    confidencePercentage: formatConfidencePercent(value)
                });
            }
        });
    }
    // Filter by confidence threshold
    return conditions.filter(condition => condition.confidence >= confidenceThreshold);
}
/**
 * Check if a field is metadata (not a skin condition)
 */
function isMetadataField(key) {
    return ['time', 'inference_id', 'image', 'predictions'].includes(key);
}
/**
 * Format confidence percentage with appropriate decimal places
 * @param {number} confidence - Confidence value (0-1)
 * @returns {number} Formatted percentage number
 */
function formatConfidencePercent(confidence) {
    const percent = confidence * 100;
    
    // Always show actual precision with up to 3 decimal places
    // This will show the true decimal values from the backend
    return parseFloat(percent.toFixed(3));
}
/**
 * React Hook for skin analysis
 * Use this in your React components
 */
export function useSkinAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState(null);
    const analyze = async (file, useBackend = true) => {
        setIsAnalyzing(true);
        setError(null);
        setResult(null);
        try {
            const analysisResult = useBackend
                ? await analyzeSkinViaBackend(file)
                : await analyzeSkinDirectly(file);
            setResult(analysisResult);
            if (!analysisResult.success) {
                setError(analysisResult.message);
            }
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const reset = () => {
        setResult(null);
        setError(null);
        setIsAnalyzing(false);
    };
    return {
        analyze,
        reset,
        isAnalyzing,
        result,
        error
    };
}
// Import React if using the hook
import React from 'react';
/*
 * USAGE EXAMPLES:
 *
 * // Option 1: Direct function call
 * const handleFileUpload = async (file: File) => {
 *   const result = await analyzeSkinViaBackend(file);
 *   console.log(result);
 * };
 *
 * // Option 2: Using the React hook
 * function SkinAnalysisComponent() {
 *   const { analyze, isAnalyzing, result, error } = useSkinAnalysis();
 *
 *   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = event.target.files?.[0];
 *     if (file) {
 *       analyze(file);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" accept="image/*" onChange={handleFileSelect} />
 *       {isAnalyzing && <p>Analyzing...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {result?.success && (
 *         <div>
 *           <h3>Main Condition: {result.mainCondition?.name}</h3>
 *           <p>Confidence: {result.mainCondition?.confidencePercentage}%</p>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */
