/**
 * AI Button Quick Setup
 * Adds the AI button to the navigation menu without modifying HTML
 */

(function() {
    // Wait for page to load
    window.addEventListener('load', function() {
        // Create the AI button
        const aiButton = document.createElement('a');
        aiButton.href = '#';
        aiButton.className = 'ai-button';
        aiButton.innerHTML = `
            <span class="ai-icon">🧠</span>
            <span class="ai-label">AI</span>
            <span class="ai-badge">5</span>
        `;
        
        // Style the button to match the site
        aiButton.style.display = 'inline-flex';
        aiButton.style.alignItems = 'center';
        aiButton.style.padding = '8px 16px';
        aiButton.style.margin = '0 5px';
        aiButton.style.color = '#fff';
        aiButton.style.fontWeight = '600';
        aiButton.style.textDecoration = 'none';
        aiButton.style.backgroundColor = 'rgb(89, 86, 233)';
        aiButton.style.borderRadius = '20px';
        aiButton.style.position = 'relative';
        
        // Style the badge
        const badge = aiButton.querySelector('.ai-badge');
        if (badge) {
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.width = '18px';
            badge.style.height = '18px';
            badge.style.backgroundColor = '#fff';
            badge.style.color = '#5956e9';
            badge.style.borderRadius = '50%';
            badge.style.fontSize = '11px';
            badge.style.fontWeight = '700';
            badge.style.marginLeft = '6px';
        }
        
        // Create dropdown element (hidden initially)
        const dropdown = document.createElement('div');
        dropdown.className = 'ai-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.right = '0';
        dropdown.style.width = '320px';
        dropdown.style.backgroundColor = '#fff';
        dropdown.style.borderRadius = '8px';
        dropdown.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
        dropdown.style.zIndex = '1000';
        dropdown.style.marginTop = '10px';
        dropdown.style.maxHeight = '500px';
        dropdown.style.overflowY = 'auto';
        
        // Dropdown header
        const dropdownHeader = document.createElement('div');
        dropdownHeader.style.padding = '15px';
        dropdownHeader.style.borderBottom = '1px solid #eee';
        dropdownHeader.style.display = 'flex';
        dropdownHeader.style.justifyContent = 'space-between';
        dropdownHeader.style.alignItems = 'center';
        
        const headerTitle = document.createElement('h3');
        headerTitle.textContent = 'AI Recommendations';
        headerTitle.style.margin = '0';
        headerTitle.style.fontSize = '16px';
        headerTitle.style.fontWeight = '600';
        headerTitle.style.color = '#333';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = '#999';
        
        dropdownHeader.appendChild(headerTitle);
        dropdownHeader.appendChild(closeButton);
        dropdown.appendChild(dropdownHeader);
        
        // Tabs for different recommendation types
        const tabsContainer = document.createElement('div');
        tabsContainer.style.display = 'flex';
        tabsContainer.style.borderBottom = '1px solid #eee';
        
        const tabs = [
            { id: 'for-you', label: 'For You' },
            { id: 'recently-viewed', label: 'Recently Viewed' }
        ];
        
        tabs.forEach((tab, index) => {
            const tabElement = document.createElement('button');
            tabElement.textContent = tab.label;
            tabElement.dataset.tab = tab.id;
            tabElement.style.flex = '1';
            tabElement.style.padding = '10px';
            tabElement.style.border = 'none';
            tabElement.style.background = 'none';
            tabElement.style.cursor = 'pointer';
            tabElement.style.fontWeight = index === 0 ? '600' : '400';
            tabElement.style.color = index === 0 ? '#5956e9' : '#666';
            tabElement.style.borderBottom = index === 0 ? '2px solid #5956e9' : 'none';
            
            tabElement.addEventListener('click', function() {
                // Update active tab
                tabsContainer.querySelectorAll('button').forEach(btn => {
                    btn.style.fontWeight = '400';
                    btn.style.color = '#666';
                    btn.style.borderBottom = 'none';
                });
                tabElement.style.fontWeight = '600';
                tabElement.style.color = '#5956e9';
                tabElement.style.borderBottom = '2px solid #5956e9';
                
                // Show correct content
                tabContentsContainer.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                const activeContent = tabContentsContainer.querySelector(`[data-content="${tab.id}"]`);
                if (activeContent) {
                    activeContent.style.display = 'block';
                }
            });
            
            tabsContainer.appendChild(tabElement);
        });
        
        dropdown.appendChild(tabsContainer);
        
        // Tab contents
        const tabContentsContainer = document.createElement('div');
        tabContentsContainer.className = 'tab-contents';
        
        // Sample recommendations data - in production this would come from your AI system
        const sampleRecommendations = [
            { id: 1, name: 'Bluetooth Headphones', price: '$59.99', image: '#5956e9' },
            { id: 2, name: 'Smart Watch', price: '$129.99', image: '#34c759' },
            { id: 3, name: 'Wireless Charger', price: '$29.99', image: '#ff9500' }
        ];
        
        const recentlyViewed = [
            { id: 4, name: 'Laptop Stand', price: '$24.99', image: '#5ac8fa' },
            { id: 5, name: 'USB-C Hub', price: '$39.99', image: '#ff2d55' }
        ];
        
        // For You tab content
        const forYouContent = document.createElement('div');
        forYouContent.className = 'tab-content';
        forYouContent.dataset.content = 'for-you';
        forYouContent.style.display = 'block';
        forYouContent.style.padding = '15px';
        
        // Recently Viewed tab content
        const recentlyViewedContent = document.createElement('div');
        recentlyViewedContent.className = 'tab-content';
        recentlyViewedContent.dataset.content = 'recently-viewed';
        recentlyViewedContent.style.display = 'none';
        recentlyViewedContent.style.padding = '15px';
        
        // Helper function to create product cards
        function createProductCard(product) {
            const card = document.createElement('div');
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.padding = '10px';
            card.style.borderBottom = '1px solid #eee';
            card.style.cursor = 'pointer';
            
            const imageContainer = document.createElement('div');
            imageContainer.style.width = '50px';
            imageContainer.style.height = '50px';
            imageContainer.style.backgroundColor = product.image;
            imageContainer.style.borderRadius = '4px';
            imageContainer.style.marginRight = '12px';
            imageContainer.style.flexShrink = '0';
            
            const infoContainer = document.createElement('div');
            infoContainer.style.flex = '1';
            
            const productName = document.createElement('p');
            productName.textContent = product.name;
            productName.style.margin = '0 0 5px 0';
            productName.style.fontWeight = '500';
            
            const productPrice = document.createElement('p');
            productPrice.textContent = product.price;
            productPrice.style.margin = '0';
            productPrice.style.fontSize = '14px';
            productPrice.style.color = '#5956e9';
            
            infoContainer.appendChild(productName);
            infoContainer.appendChild(productPrice);
            
            card.appendChild(imageContainer);
            card.appendChild(infoContainer);
            
            return card;
        }
        
        // Populate For You tab
        sampleRecommendations.forEach(product => {
            const card = createProductCard(product);
            forYouContent.appendChild(card);
        });
        
        // Populate Recently Viewed tab
        if (recentlyViewed.length > 0) {
            recentlyViewed.forEach(product => {
                const card = createProductCard(product);
                recentlyViewedContent.appendChild(card);
            });
        } else {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No recently viewed products.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#999';
            emptyMessage.style.padding = '20px 0';
            recentlyViewedContent.appendChild(emptyMessage);
        }
        
        // Footer with link to see all recommendations
        const footer = document.createElement('div');
        footer.style.padding = '15px';
        footer.style.borderTop = '1px solid #eee';
        footer.style.textAlign = 'center';
        
        const seeAllLink = document.createElement('a');
        seeAllLink.href = '#';
        seeAllLink.textContent = 'See All Recommendations';
        seeAllLink.style.color = '#5956e9';
        seeAllLink.style.textDecoration = 'none';
        seeAllLink.style.fontWeight = '600';
        seeAllLink.style.fontSize = '14px';
        
        footer.appendChild(seeAllLink);
        
        // Add tab contents to dropdown
        tabContentsContainer.appendChild(forYouContent);
        tabContentsContainer.appendChild(recentlyViewedContent);
        dropdown.appendChild(tabContentsContainer);
        dropdown.appendChild(footer);
        
        // Add dropdown to button
        aiButton.appendChild(dropdown);
        
        // Try to insert the button in the navigation
        // Find the right place to insert the button
        let inserted = false;
        
        // Try to insert before the Cart link
        const cartLink = document.querySelector('a[href*="cart" i]');
        if (cartLink && cartLink.parentNode) {
            cartLink.parentNode.insertBefore(aiButton, cartLink);
            inserted = true;
        }
        
        // Or try to add it to the navigation
        if (!inserted) {
            const nav = document.querySelector('nav');
            if (nav) {
                nav.appendChild(aiButton);
                inserted = true;
            }
        }
        
        // Last resort: add to header
        if (!inserted) {
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(aiButton);
            }
        }
        
        // Add click handler to toggle dropdown
        aiButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
            
            // If dropdown was just shown, try to load full AI features
            if (!isVisible && !window.aiFeaturesLoaded) {
                console.log('Attempting to load full AI features...');
                try {
                    const script = document.createElement('script');
                    script.src = 'js/load-ai-features.js';
                    script.onload = function() {
                        console.log('AI features loaded successfully');
                        window.aiFeaturesLoaded = true;
                    };
                    script.onerror = function() {
                        console.warn('Could not load AI features script');
                    };
                    document.head.appendChild(script);
                } catch (error) {
                    console.error('Error loading AI features:', error);
                }
            }
        });
        
        // Close button handler
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.style.display = 'none';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (dropdown.style.display === 'block' && !dropdown.contains(e.target) && e.target !== aiButton) {
                dropdown.style.display = 'none';
            }
        });
        
        // Prevent clicks inside dropdown from bubbling to document
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
})(); 