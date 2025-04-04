/**
 * AI-based Product Recommendation System
 * This script provides product recommendations based on user browsing and purchase history
 */

class AIRecommendationEngine {
    constructor() {
        this.userHistory = this.loadUserHistory();
        this.categoryAffinities = this.calculateCategoryAffinities();
        this.recommendationCache = {};
    }

    /**
     * Load user's browsing and purchase history from localStorage
     */
    loadUserHistory() {
        // Get history from localStorage or initialize if not present
        const history = JSON.parse(localStorage.getItem('userHistory') || '{"viewed": [], "purchased": []}');
        
        // Ensure the history object has the correct structure
        if (!history.viewed) history.viewed = [];
        if (!history.purchased) history.purchased = [];
        
        return history;
    }

    /**
     * Save user history to localStorage
     */
    saveUserHistory() {
        localStorage.setItem('userHistory', JSON.stringify(this.userHistory));
    }

    /**
     * Track when a user views a product
     * @param {Object} product - The product being viewed
     */
    trackProductView(product) {
        if (!product || !product.id) return;
        
        // Add to viewed products if not already present
        const existingIndex = this.userHistory.viewed.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
            // Increment view count if already viewed
            this.userHistory.viewed[existingIndex].count = (this.userHistory.viewed[existingIndex].count || 1) + 1;
            this.userHistory.viewed[existingIndex].lastViewed = new Date().toISOString();
        } else {
            // Add new product to viewed history
            this.userHistory.viewed.push({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                count: 1,
                lastViewed: new Date().toISOString()
            });
        }
        
        // Keep only the most recent 50 viewed products
        if (this.userHistory.viewed.length > 50) {
            this.userHistory.viewed = this.userHistory.viewed
                .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
                .slice(0, 50);
        }
        
        // Update category affinities
        this.categoryAffinities = this.calculateCategoryAffinities();
        
        // Save updated history
        this.saveUserHistory();
    }

    /**
     * Track when a user purchases a product
     * @param {Object} product - The product being purchased
     * @param {Number} quantity - The quantity purchased
     */
    trackPurchase(product, quantity = 1) {
        if (!product || !product.id) return;
        
        // Add to purchased products
        const existingIndex = this.userHistory.purchased.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
            // Increment purchase count if already purchased
            this.userHistory.purchased[existingIndex].count = (this.userHistory.purchased[existingIndex].count || 1) + quantity;
            this.userHistory.purchased[existingIndex].lastPurchased = new Date().toISOString();
        } else {
            // Add new product to purchase history
            this.userHistory.purchased.push({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                count: quantity,
                lastPurchased: new Date().toISOString()
            });
        }
        
        // Update category affinities
        this.categoryAffinities = this.calculateCategoryAffinities();
        
        // Save updated history
        this.saveUserHistory();
    }

    /**
     * Calculate user's affinity for each product category
     * @returns {Object} - Category affinity scores
     */
    calculateCategoryAffinities() {
        const affinities = {};
        
        // Calculate from viewed products (lower weight)
        this.userHistory.viewed.forEach(product => {
            if (!product.category) return;
            
            const category = product.category;
            if (!affinities[category]) affinities[category] = 0;
            
            // Views are weighted by recency and count
            const daysSinceView = (new Date() - new Date(product.lastViewed)) / (1000 * 60 * 60 * 24);
            const recencyFactor = Math.max(0.1, 1 - (daysSinceView / 30)); // Higher for more recent views
            
            affinities[category] += (product.count || 1) * 0.3 * recencyFactor;
        });
        
        // Calculate from purchased products (higher weight)
        this.userHistory.purchased.forEach(product => {
            if (!product.category) return;
            
            const category = product.category;
            if (!affinities[category]) affinities[category] = 0;
            
            // Purchases are weighted higher than views
            const daysSincePurchase = (new Date() - new Date(product.lastPurchased)) / (1000 * 60 * 60 * 24);
            const recencyFactor = Math.max(0.2, 1 - (daysSincePurchase / 60)); // Higher for more recent purchases
            
            affinities[category] += (product.count || 1) * 1.0 * recencyFactor;
        });
        
        return affinities;
    }

    /**
     * Get personalized recommendations for the user
     * @param {Array} availableProducts - All available products to recommend from
     * @param {Object} options - Configuration options
     * @returns {Array} - Recommended products
     */
    getRecommendations(availableProducts, options = {}) {
        if (!availableProducts || !Array.isArray(availableProducts)) {
            return [];
        }
        
        const {
            limit = 6,
            excludeViewed = false,
            excludePurchased = true,
            preferSimilarPrice = true
        } = options;
        
        // Check if we have a cached result for these exact parameters
        const cacheKey = `${limit}_${excludeViewed}_${excludePurchased}_${preferSimilarPrice}`;
        if (this.recommendationCache[cacheKey]) {
            const cacheAge = (new Date() - this.recommendationCache[cacheKey].timestamp) / 1000 / 60;
            if (cacheAge < 10) { // Cache for 10 minutes
                return this.recommendationCache[cacheKey].recommendations;
            }
        }
        
        // Get IDs of products to exclude
        const excludedIds = [];
        
        if (excludePurchased) {
            this.userHistory.purchased.forEach(item => excludedIds.push(item.id));
        }
        
        if (excludeViewed) {
            this.userHistory.viewed.forEach(item => {
                if (!excludedIds.includes(item.id)) {
                    excludedIds.push(item.id);
                }
            });
        }
        
        // Filter available products to exclude viewed/purchased
        let candidateProducts = availableProducts.filter(product => !excludedIds.includes(product.id));
        
        // If we have no candidates, include viewed products
        if (candidateProducts.length === 0 && excludeViewed) {
            candidateProducts = availableProducts.filter(product => 
                !this.userHistory.purchased.some(item => item.id === product.id)
            );
        }
        
        // If still no candidates, just use all products
        if (candidateProducts.length === 0) {
            candidateProducts = availableProducts;
        }
        
        // Score each product
        const scoredProducts = candidateProducts.map(product => {
            let score = 0;
            
            // Base score from category affinity
            if (product.category && this.categoryAffinities[product.category]) {
                score += this.categoryAffinities[product.category] * 2;
            }
            
            // Boost score for products similar to recently viewed items
            if (this.userHistory.viewed.length > 0) {
                // Get the most recently viewed product
                const recentlyViewed = [...this.userHistory.viewed]
                    .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))[0];
                
                // Boost score if in same category
                if (recentlyViewed.category && product.category === recentlyViewed.category) {
                    score += 1.5;
                }
                
                // Boost score if similar price range (within 20%)
                if (preferSimilarPrice && recentlyViewed.price && product.price) {
                    const priceDifference = Math.abs(product.price - recentlyViewed.price) / recentlyViewed.price;
                    if (priceDifference < 0.2) {
                        score += 1.0 - priceDifference * 2; // Higher boost for closer prices
                    }
                }
            }
            
            // Add some randomness for diversity (0-0.5 random boost)
            score += Math.random() * 0.5;
            
            return { ...product, score };
        });
        
        // Sort by score and get top recommendations
        const recommendations = scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => {
                // Remove the score property before returning
                const { score, ...product } = item;
                return product;
            });
        
        // Save to cache
        this.recommendationCache[cacheKey] = {
            timestamp: new Date(),
            recommendations
        };
        
        return recommendations;
    }

    /**
     * Get similar products to a given product
     * @param {Object} product - The reference product
     * @param {Array} availableProducts - All available products
     * @param {Object} options - Configuration options
     * @returns {Array} - Similar products
     */
    getSimilarProducts(product, availableProducts, options = {}) {
        if (!product || !availableProducts || !Array.isArray(availableProducts)) {
            return [];
        }
        
        const { limit = 4, excludeSelf = true } = options;
        
        // Filter out the reference product if needed
        const candidates = excludeSelf 
            ? availableProducts.filter(p => p.id !== product.id)
            : availableProducts;
        
        // Score products by similarity
        const scoredProducts = candidates.map(candidate => {
            let score = 0;
            
            // Highest score for same category
            if (product.category && candidate.category === product.category) {
                score += 3;
            }
            
            // Score for price similarity
            if (product.price && candidate.price) {
                const priceDifference = Math.abs(candidate.price - product.price) / product.price;
                if (priceDifference < 0.3) {
                    score += 1.5 - priceDifference * 3; // Higher score for closer prices
                }
            }
            
            // Additional score for tag/attribute matches could be added here
            
            // Add slight randomness
            score += Math.random() * 0.3;
            
            return { ...candidate, score };
        });
        
        // Sort by score and get top similar products
        return scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => {
                // Remove the score property before returning
                const { score, ...product } = item;
                return product;
            });
    }

    /**
     * Clear user history
     */
    clearHistory() {
        this.userHistory = { viewed: [], purchased: [] };
        this.categoryAffinities = {};
        this.recommendationCache = {};
        this.saveUserHistory();
    }
}

// Initialize the recommendation engine
const aiRecommendations = new AIRecommendationEngine();

// Expose globally
window.aiRecommendations = aiRecommendations;

/**
 * DOM-ready handler to set up recommendation UI
 */
document.addEventListener('DOMContentLoaded', function() {
    // Track current product view if on a product page
    const productElement = document.querySelector('[data-product-id]');
    if (productElement) {
        const productId = productElement.getAttribute('data-product-id');
        const productName = productElement.getAttribute('data-product-name') || '';
        const productCategory = productElement.getAttribute('data-product-category') || '';
        const productPrice = parseFloat(productElement.getAttribute('data-product-price') || '0');
        
        // Track this product view
        aiRecommendations.trackProductView({
            id: productId,
            name: productName,
            category: productCategory,
            price: productPrice
        });
        
        // Load similar products
        loadSimilarProducts(productId, productName, productCategory, productPrice);
    }
    
    // Setup recommendation containers on any page
    setupRecommendationContainers();
    
    // Track purchases on order confirmation page
    if (window.location.pathname.includes('order-confirmation')) {
        trackOrderPurchases();
    }
});

/**
 * Load similar products into UI container
 * @param {String} productId - Current product ID
 * @param {String} productName - Current product name
 * @param {String} productCategory - Current product category
 * @param {Number} productPrice - Current product price
 */
function loadSimilarProducts(productId, productName, productCategory, productPrice) {
    const similarContainer = document.querySelector('.similar-products-container');
    if (!similarContainer) return;
    
    // Make API call to get all products (in real implementation, this would be filtered on the server)
    fetch('api/products.php')
        .then(response => response.json())
        .then(data => {
            const currentProduct = {
                id: productId,
                name: productName,
                category: productCategory,
                price: productPrice
            };
            
            // Get similar products
            const similarProducts = aiRecommendations.getSimilarProducts(
                currentProduct, 
                data.products || data, 
                { limit: 4 }
            );
            
            // Render similar products
            renderProducts(similarProducts, similarContainer, 'You might also like');
        })
        .catch(error => {
            console.error('Error loading similar products:', error);
        });
}

/**
 * Set up recommendation containers on the page
 */
function setupRecommendationContainers() {
    const recommendationContainers = document.querySelectorAll('.ai-recommendations');
    if (recommendationContainers.length === 0) return;
    
    // Make API call to get all products
    fetch('api/products.php')
        .then(response => response.json())
        .then(data => {
            const allProducts = data.products || data;
            
            // For each container, load appropriate recommendations
            recommendationContainers.forEach(container => {
                const recommendationType = container.getAttribute('data-recommendation-type') || 'personalized';
                const limit = parseInt(container.getAttribute('data-limit') || '6', 10);
                
                let recommendations = [];
                let title = 'Recommended for you';
                
                switch (recommendationType) {
                    case 'personalized':
                        recommendations = aiRecommendations.getRecommendations(allProducts, { limit });
                        break;
                    case 'trending':
                        // This would ideally come from the server, but we'll simulate trending items
                        recommendations = allProducts
                            .sort(() => 0.5 - Math.random()) // Random sort for demo
                            .slice(0, limit);
                        title = 'Trending now';
                        break;
                    case 'recently-viewed':
                        // Get user's recently viewed products, matching them with full product details
                        const viewedIds = aiRecommendations.userHistory.viewed
                            .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
                            .map(item => item.id);
                        
                        recommendations = allProducts
                            .filter(product => viewedIds.includes(product.id))
                            .slice(0, limit);
                        title = 'Recently viewed';
                        break;
                }
                
                // Render products in container
                renderProducts(recommendations, container, title);
            });
        })
        .catch(error => {
            console.error('Error loading recommendations:', error);
        });
}

/**
 * Track purchases from order confirmation page
 */
function trackOrderPurchases() {
    // Get order details from the page
    const orderItems = document.querySelectorAll('.order-item');
    
    if (orderItems.length === 0) return;
    
    // Track each purchased item
    orderItems.forEach(item => {
        const productId = item.getAttribute('data-product-id');
        const productName = item.getAttribute('data-product-name') || '';
        const productCategory = item.getAttribute('data-product-category') || '';
        const productPrice = parseFloat(item.getAttribute('data-product-price') || '0');
        const quantity = parseInt(item.getAttribute('data-quantity') || '1', 10);
        
        // Track this purchase
        aiRecommendations.trackPurchase({
            id: productId,
            name: productName,
            category: productCategory,
            price: productPrice
        }, quantity);
    });
}

/**
 * Render product cards in a container
 * @param {Array} products - Products to render
 * @param {HTMLElement} container - Container element
 * @param {String} title - Section title
 */
function renderProducts(products, container, title) {
    // Clear container
    container.innerHTML = '';
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.className = 'recommendation-title';
    titleElement.textContent = title;
    container.appendChild(titleElement);
    
    // If no products, show message
    if (!products || products.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-recommendations';
        emptyMessage.textContent = 'No recommendations available';
        container.appendChild(emptyMessage);
        return;
    }
    
    // Create product grid
    const productGrid = document.createElement('div');
    productGrid.className = 'product-grid';
    container.appendChild(productGrid);
    
    // Add product cards
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product.id);
        
        // Product image
        const productImage = document.createElement('div');
        productImage.className = 'product-image';
        if (product.image) {
            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.name;
            productImage.appendChild(img);
        }
        productCard.appendChild(productImage);
        
        // Product details
        const productDetails = document.createElement('div');
        productDetails.className = 'product-details';
        
        // Product name with link
        const productName = document.createElement('h4');
        const productLink = document.createElement('a');
        productLink.href = `/product.html?id=${product.id}`;
        productLink.textContent = product.name;
        productName.appendChild(productLink);
        productDetails.appendChild(productName);
        
        // Product price
        if (product.price) {
            const productPrice = document.createElement('p');
            productPrice.className = 'product-price';
            productPrice.textContent = `$${product.price.toFixed(2)}`;
            productDetails.appendChild(productPrice);
        }
        
        productCard.appendChild(productDetails);
        productGrid.appendChild(productCard);
    });
} 