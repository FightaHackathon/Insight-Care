// Skin Tone Analysis Integration with Roboflow API
class SkinToneAnalysisIntegration {
    constructor() {
        this.apiEndpoint = '/api/skin-tone/analyze';
        this.isAnalyzing = false;
    }

    /**
     * Analyzes skin tone from uploaded image file
     * @param {File} imageFile - The image file to analyze
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeSkinTone(imageFile) {
        if (this.isAnalyzing) {
            throw new Error('Analysis already in progress');
        }

        this.isAnalyzing = true;
        console.log('🎨 Starting skin tone analysis...');

        try {
            // Validate file
            if (!imageFile) {
                throw new Error('No image file provided');
            }

            // Check file type
            if (!imageFile.type.startsWith('image/')) {
                throw new Error('Please upload a valid image file');
            }

            // Check file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (imageFile.size > maxSize) {
                throw new Error('Image file is too large. Please upload an image smaller than 10MB');
            }

            console.log(`📷 Analyzing image: ${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)}MB)`);

            // Prepare form data
            const formData = new FormData();
            formData.append('image', imageFile);

            // Send request to backend
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            if (!result.success) {
                throw new Error(result.error || 'Skin tone analysis failed');
            }

            console.log('✅ Skin tone analysis completed successfully');
            return result;

        } catch (error) {
            console.error('❌ Skin tone analysis error:', error);
            throw error;
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * Formats the analysis result for display
     * @param {Object} result - Raw analysis result
     * @returns {Object} Formatted result for UI display
     */
    formatAnalysisResult(result) {
        if (!result.success || !result.skinTone) {
            return {
                success: false,
                error: result.error || 'Analysis failed'
            };
        }

        const skinTone = result.skinTone;
        
        return {
            success: true,
            undertone: skinTone.undertone || 'Not determined',
            depth: skinTone.depth || 'Not determined',
            description: skinTone.description || 'Skin tone analysis completed',
            confidence: skinTone.confidence || result.confidence || 'N/A',
            colorRecommendations: skinTone.colorRecommendations || [],
            makeupTips: skinTone.makeupTips || [],
            rawClass: result.rawClass || 'Unknown'
        };
    }

    /**
     * Generates HTML for displaying skin tone results
     * @param {Object} formattedResult - Formatted analysis result
     * @returns {string} HTML string for results display
     */
    generateResultsHTML(formattedResult) {
        if (!formattedResult.success) {
            return `
                <div style="color: var(--error); text-align: center; padding: 20px;">
                    <h3>❌ Analysis Failed</h3>
                    <p>${formattedResult.error}</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">
                        Please try uploading a different image with good lighting and clear skin visibility.
                    </p>
                </div>
            `;
        }

        const confidenceColor = this.getConfidenceColor(formattedResult.confidence);
        
        return `
            <div style="color: var(--text-primary);">
                <h3 style="margin-bottom: 16px; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                    🎨 Skin Tone Analysis Complete
                    <span style="font-size: 0.8rem; background: ${confidenceColor}; color: white; padding: 2px 8px; border-radius: 12px;">
                        ${formattedResult.confidence} confidence
                    </span>
                </h3>
                
                <div style="background: var(--surface-secondary); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                    <p style="margin-bottom: 8px;"><strong>🎯 Undertone:</strong> ${formattedResult.undertone}</p>
                    <p style="margin-bottom: 8px;"><strong>🌟 Tone Depth:</strong> ${formattedResult.depth}</p>
                    <p style="font-style: italic; color: var(--text-secondary);">${formattedResult.description}</p>
                </div>

                ${formattedResult.colorRecommendations.length > 0 ? `
                    <div style="margin-bottom: 16px;">
                        <h4 style="color: var(--primary); margin-bottom: 8px;">🎨 Color Recommendations:</h4>
                        <ul style="margin-left: 20px; margin-top: 8px;">
                            ${formattedResult.colorRecommendations.map(rec => `<li style="margin-bottom: 4px;">${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${formattedResult.makeupTips.length > 0 ? `
                    <div style="margin-bottom: 16px;">
                        <h4 style="color: var(--primary); margin-bottom: 8px;">💄 Makeup Tips:</h4>
                        <ul style="margin-left: 20px; margin-top: 8px;">
                            ${formattedResult.makeupTips.map(tip => `<li style="margin-bottom: 4px;">${tip}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div style="margin-top: 20px; padding: 12px; background: var(--info-bg); border-left: 4px solid var(--info); border-radius: 4px;">
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">
                        💡 <strong>Tip:</strong> These recommendations are based on AI analysis. Personal preferences and individual style should also be considered when choosing colors and makeup.
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Gets color for confidence display based on confidence level
     * @param {string} confidenceStr - Confidence percentage string
     * @returns {string} CSS color value
     */
    getConfidenceColor(confidenceStr) {
        const confidence = parseFloat(confidenceStr);
        if (confidence >= 80) return '#10b981'; // Green
        if (confidence >= 60) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    }

    /**
     * Shows loading state in results container
     * @param {HTMLElement} resultsContainer - Results display element
     */
    showLoadingState(resultsContainer) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 16px;">🎨</div>
                <h3 style="margin-bottom: 8px;">Analyzing Your Skin Tone...</h3>
                <p>Our AI is examining your photo to determine your unique skin tone characteristics.</p>
                <div style="margin-top: 20px;">
                    <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid var(--primary); border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
            </div>
        `;
    }

    /**
     * Checks if the API is available
     * @returns {Promise<boolean>} True if API is healthy
     */
    async checkApiHealth() {
        try {
            const response = await fetch('/api/skin-tone/health');
            return response.ok;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SkinToneAnalysisIntegration = SkinToneAnalysisIntegration;
}

// CSS for loading animation
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}
