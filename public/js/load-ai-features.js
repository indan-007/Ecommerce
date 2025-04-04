/**
 * AI Features Bootstrap Script
 * Makes sure AI recommendation features are properly loaded
 */

(function() {
    // Helper function to load script
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        script.onload = function() {
            if (callback) callback();
        };
        
        script.onerror = function() {
            console.error('Error loading script: ' + src);
        };
        
        document.head.appendChild(script);
    }
    
    // Helper function to load stylesheet
    function loadStylesheet(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    
    // Load AI recommendation scripts in proper order
    function loadAIFeatures() {
        console.log('Loading AI features...');
        
        // Load stylesheets first
        loadStylesheet('styles/ai-recommendations.css');
        loadStylesheet('styles/navbar-ai.css');
        
        // Load the main AI recommendation engine first
        loadScript('js/ai-recommendations.js', function() {
            // After the engine is loaded, load the navbar integration
            loadScript('js/navbar-ai-integration.js', function() {
                console.log('AI features loaded successfully!');
                
                // Initialize manually in case DOMContentLoaded already fired
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    if (window.aiRecommendations) {
                        // Force reload of the AI navbar
                        if (typeof addAiIndicator === 'function') {
                            addAiIndicator();
                            createRecommendationsDropdown();
                            updateRecommendationsCount();
                        }
                    }
                }
            });
        });
    }
    
    // Load features when DOM is ready or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAIFeatures);
    } else {
        loadAIFeatures();
    }
})(); 