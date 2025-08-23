/**
 * Skin Analysis Integration for InsightCare
 * Connects to the Spring Boot backend for Roboflow skin analysis
 */

class SkinAnalysisIntegration {
    constructor() {
        this.baseUrl = 'http://localhost:8085'; // Spring Boot server URL
        this.isAnalyzing = false;
    }

    /**
     * Analyze skin condition via backend API
     * @param {File} imageFile - The image file to analyze
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeSkin(imageFile) {
        if (this.isAnalyzing) {
            throw new Error('Analysis already in progress');
        }

        this.isAnalyzing = true;

        try {
            // Validate file
            if (!imageFile) {
                throw new Error('No image file provided');
            }

            if (!imageFile.type.startsWith('image/')) {
                throw new Error('Invalid file type. Please upload an image file.');
            }

            if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
                throw new Error('File size too large. Please upload an image smaller than 10MB.');
            }

            // Create FormData
            const formData = new FormData();
            formData.append('image', imageFile);

            // Make API call
            const response = await fetch(`${this.baseUrl}/api/skin-analysis/analyze`, {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type header - let browser set it with boundary
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Analysis failed');
            }



            return result.analysis;

        } catch (error) {
            console.error('Skin analysis error:', error);
            throw error;
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * Check if the backend service is available
     * @returns {Promise<boolean>} Service availability
     */
    async checkServiceHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/api/skin-analysis/health`);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    /**
     * Format analysis result for display
     * @param {Object} analysis - Raw analysis result
     * @returns {string} Formatted HTML string
     */
    formatAnalysisForDisplay(analysis) {
        if (!analysis) {
            return '<p style="color: var(--error);">No analysis data available.</p>';
        }

        let html = '<div style="color: var(--text-primary);">';
        
        // Add confidence score if available
        if (analysis.confidence !== undefined) {
            const confidencePercent = this.formatConfidencePercent(analysis.confidence);
            html += `<div style="margin-bottom: 16px; padding: 12px; background: rgba(255,107,157,0.1); border-radius: 8px;">
                <strong>🎯 Analysis Confidence: ${confidencePercent}%</strong>
            </div>`;
        }

        // Add summary
        if (analysis.summary) {
            html += `<div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 12px; color: var(--primary);">📊 Analysis Results</h3>
                <div style="white-space: pre-line; line-height: 1.6;">${this.escapeHtml(analysis.summary)}</div>
            </div>`;
        }

        // Add recommendations
        if (analysis.recommendations) {
            html += `<div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 12px; color: var(--primary);">💡 Recommendations</h3>
                <div style="white-space: pre-line; line-height: 1.6; background: var(--background); padding: 16px; border-radius: 8px; border-left: 4px solid var(--primary);">
                    ${this.escapeHtml(analysis.recommendations)}
                </div>
            </div>`;
        }

        // Add detected conditions if available
        if (analysis.detectedConditions && Object.keys(analysis.detectedConditions).length > 0) {
            html += `<div style="margin-top: 16px;">
                <h4 style="margin-bottom: 8px; color: var(--text-secondary);">🔍 Detected Conditions (sorted by confidence):</h4>
                <ul style="margin-left: 20px;">`;
            
            let isFirst = true;
            for (const [condition, confidence] of Object.entries(analysis.detectedConditions)) {
                // Format confidence with appropriate decimal places
                const confidencePercent = this.formatConfidencePercent(confidence);
                const primaryLabel = isFirst ? ' <strong style="color: var(--primary);">(Primary Concern)</strong>' : '';
                html += `<li>${this.escapeHtml(condition)}: ${confidencePercent}% confidence${primaryLabel}</li>`;
                isFirst = false;
            }
            
            html += '</ul></div>';
        }

        // Add disclaimer
        html += `<div style="margin-top: 20px; padding: 12px; background: rgba(255,193,7,0.1); border-radius: 8px; font-size: 0.9rem; color: var(--text-secondary);">
            <strong>⚠️ Important:</strong> This analysis is for informational purposes only and should not replace professional medical advice. 
            Please consult with a qualified dermatologist for proper diagnosis and treatment.
        </div>`;

        html += '</div>';
        return html;
    }

    /**
     * Format confidence percentage with appropriate decimal places
     * @param {number} confidence - Confidence value (could be 0-1 or 0-100)
     * @returns {string} Formatted percentage string
     */
    formatConfidencePercent(confidence) {
        // Handle both decimal (0-1) and percentage (0-100) formats
        let percent;
        if (confidence <= 1) {
            // Decimal format (0-1), convert to percentage
            percent = confidence * 100;
        } else {
            // Already in percentage format (0-100)
            percent = confidence;
        }

        // Debug: Log the formatting process
        console.log(`Formatting confidence: ${confidence} -> ${percent}% -> ${percent.toFixed(2)}`);

        // Always show 2 decimal places for precision
        return percent.toFixed(2);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show loading state in results container
     * @param {HTMLElement} container - Results container element
     */
    showLoadingState(container) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 16px;">🔍</div>
                <h3 style="margin-bottom: 8px; color: var(--primary);">Analyzing Your Skin...</h3>
                <p>Our AI is examining your photo for skin conditions and concerns.</p>
                <div style="margin-top: 16px;">
                    <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid var(--primary); border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                </div>
                <p style="font-size: 0.9rem; margin-top: 12px; color: var(--text-secondary);">
                    This usually takes 10-30 seconds...
                </p>
            </div>
        `;
    }

    /**
     * Show error state in results container
     * @param {HTMLElement} container - Results container element
     * @param {string} errorMessage - Error message to display
     */
    showErrorState(container, errorMessage) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--error);">
                <div style="font-size: 2rem; margin-bottom: 16px;">❌</div>
                <h3 style="margin-bottom: 8px;">Analysis Failed</h3>
                <p style="margin-bottom: 16px;">${this.escapeHtml(errorMessage)}</p>
                <div style="background: rgba(220, 53, 69, 0.1); padding: 12px; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Troubleshooting Tips:</strong><br>
                    • Make sure the image is clear and well-lit<br>
                    • Try a different image format (JPG, PNG)<br>
                    • Check your internet connection<br>
                    • Refresh the page and try again
                </div>
            </div>
        `;
    }
}

// Create global instance
window.skinAnalysisIntegration = new SkinAnalysisIntegration();

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
