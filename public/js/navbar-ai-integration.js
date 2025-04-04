/**
 * Navbar AI Integration
 * Adds AI-powered features to the site navbar
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if AI recommendations are available
    if (typeof window.aiRecommendations === 'undefined') {
        console.warn('AI Recommendations not available');
        return;
    }

    // Add AI indicator to navbar
    addAiIndicator();
    
    // Create and append quick recommendations dropdown
    createRecommendationsDropdown();
    
    // Update recommendations count badge
    updateRecommendationsCount();
});

/**
 * Adds AI indicator to the navbar
 */
function addAiIndicator() {
    // Try different selectors to find the nav element in various layouts
    let navContainer = document.querySelector('header nav ul');
    
    // If the standard selector doesn't work, try alternative selectors based on the screenshot
    if (!navContainer) {
        navContainer = document.querySelector('header nav');
    }
    
    // If we still can't find it, try to find any navigation-like container
    if (!navContainer) {
        // Look for links in the header that might be navigation
        const header = document.querySelector('header');
        if (header) {
            // Create a new container if none exists
            navContainer = header.querySelector('nav') || header;
        }
    }
    
    if (!navContainer) return;
    
    // Create AI nav item
    const aiNavItem = document.createElement('a');
    aiNavItem.href = '#';
    aiNavItem.className = 'ai-nav-item';
    
    // Create AI recommendations button content
    aiNavItem.innerHTML = `
        <span class="ai-icon">🧠</span>
        <span class="ai-label">AI</span>
        <span class="ai-badge">0</span>
    `;
    
    // Insert the AI button before the Cart link if it exists,
    // otherwise append it to the navigation container
    const cartLink = document.querySelector('a[href*="cart" i]');
    if (cartLink && cartLink.parentNode) {
        cartLink.parentNode.insertBefore(aiNavItem, cartLink);
    } else {
        navContainer.appendChild(aiNavItem);
    }
    
    // Add event listener to toggle dropdown
    aiNavItem.addEventListener('click', function(e) {
        e.preventDefault();
        const dropdown = document.querySelector('.ai-recommendations-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
            
            // Close dropdown when clicking outside
            if (dropdown.classList.contains('active')) {
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && !aiNavItem.contains(e.target)) {
                        dropdown.classList.remove('active');
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }
        }
    });
}

/**
 * Creates a dropdown with personalized recommendations
 */
function createRecommendationsDropdown() {
    const header = document.querySelector('header');
    if (!header) return;
    
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'ai-recommendations-dropdown';
    
    // Add dropdown header
    dropdown.innerHTML = `
        <div class="dropdown-header">
            <h3>AI Recommendations</h3>
            <div class="dropdown-tabs">
                <button class="tab-button active" data-tab="for-you">For You</button>
                <button class="tab-button" data-tab="recently-viewed">Recently Viewed</button>
            </div>
        </div>
        <div class="dropdown-content">
            <div class="tab-content active" id="tab-for-you">
                <p class="loading">Loading recommendations...</p>
            </div>
            <div class="tab-content" id="tab-recently-viewed">
                <p class="loading">Loading recently viewed items...</p>
            </div>
        </div>
        <div class="dropdown-footer">
            <a href="#" class="ai-preferences">Preferences</a>
            <a href="#" class="clear-history">Clear History</a>
        </div>
    `;
    
    // Append dropdown to header
    header.appendChild(dropdown);
    
    // Add tab switching functionality
    const tabButtons = dropdown.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            dropdown.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            // Activate clicked tab
            this.classList.add('active');
            const tabId = 'tab-' + this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Load recommendations data
    loadRecommendationsData(dropdown);
    
    // Add clear history functionality
    const clearButton = dropdown.querySelector('.clear-history');
    clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirm('Are you sure you want to clear your browsing and recommendation history?')) {
            window.aiRecommendations.clearHistory();
            updateRecommendationsCount();
            
            // Reload recommendations
            loadRecommendationsData(dropdown);
            
            alert('Your history has been cleared.');
        }
    });
    
    // Add preferences functionality
    const preferencesButton = dropdown.querySelector('.ai-preferences');
    preferencesButton.addEventListener('click', function(e) {
        e.preventDefault();
        // For now just show a placeholder message
        alert('AI recommendation preferences will be available soon!');
    });
}

/**
 * Load recommendations data into the dropdown
 */
function loadRecommendationsData(dropdown) {
    // Find content containers
    const forYouContainer = dropdown.querySelector('#tab-for-you');
    const recentlyViewedContainer = dropdown.querySelector('#tab-recently-viewed');
    
    // Show loading indicator
    forYouContainer.innerHTML = '<p class="loading">Loading recommendations...</p>';
    recentlyViewedContainer.innerHTML = '<p class="loading">Loading recently viewed items...</p>';
    
    // Fetch product data
    fetch('api/products.php')
        .then(response => response.json())
        .then(products => {
            // Personalized recommendations (For You tab)
            const personalizedRecs = window.aiRecommendations.getRecommendations(products, { limit: 4 });
            renderDropdownItems(personalizedRecs, forYouContainer, 'No recommendations available yet. Browse more products to get personalized suggestions.');
            
            // Recently viewed (Recently Viewed tab)
            const viewedIds = window.aiRecommendations.userHistory.viewed
                .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
                .map(item => item.id);
                
            const recentlyViewed = products.filter(product => viewedIds.includes(product.id)).slice(0, 4);
            renderDropdownItems(recentlyViewed, recentlyViewedContainer, 'No recently viewed products.');
        })
        .catch(error => {
            console.error('Error loading recommendations for navbar:', error);
            forYouContainer.innerHTML = '<p class="error">Failed to load recommendations.</p>';
            recentlyViewedContainer.innerHTML = '<p class="error">Failed to load recently viewed items.</p>';
        });
}

/**
 * Render product items in the dropdown
 */
function renderDropdownItems(products, container, emptyMessage) {
    if (!products || products.length === 0) {
        container.innerHTML = `<p class="empty-message">${emptyMessage}</p>`;
        return;
    }
    
    // Create product list
    const list = document.createElement('ul');
    list.className = 'ai-product-list';
    
    // Add each product to the list
    products.forEach(product => {
        const item = document.createElement('li');
        item.className = 'ai-product-item';
        
        item.innerHTML = `
            <a href="product.html?id=${product.id}" class="product-link">
                <div class="product-image">
                    <img src="${product.image || 'images/placeholder.jpg'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
            </a>
        `;
        
        list.appendChild(item);
    });
    
    // Replace loading message with product list
    container.innerHTML = '';
    container.appendChild(list);
}

/**
 * Update the recommendation count badge in the navbar
 */
function updateRecommendationsCount() {
    const badge = document.querySelector('.ai-badge');
    if (!badge) return;
    
    // Count of products with high affinity that user hasn't viewed
    const highAffinityCategories = [];
    const affinities = window.aiRecommendations.categoryAffinities;
    
    // Find categories with high affinity scores
    for (const category in affinities) {
        if (affinities[category] > 1.0) {
            highAffinityCategories.push(category);
        }
    }
    
    // Get count of viewed products
    const viewedCount = window.aiRecommendations.userHistory.viewed.length;
    
    // Calculate badge count - we want to show a number that encourages interaction
    let badgeCount = 0;
    
    if (viewedCount === 0) {
        // New user - show a default number to encourage exploration
        badgeCount = 5;
    } else if (highAffinityCategories.length > 0) {
        // User has preferences - show a count based on that
        badgeCount = highAffinityCategories.length * 2;
    } else {
        // Regular user - show modest count
        badgeCount = Math.min(viewedCount, 3);
    }
    
    // Update the badge
    badge.textContent = badgeCount;
    
    // Pulse animation if count > 0
    if (badgeCount > 0) {
        badge.classList.add('pulse');
    } else {
        badge.classList.remove('pulse');
    }
} 