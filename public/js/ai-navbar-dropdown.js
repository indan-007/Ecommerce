/**
 * AI Navbar Dropdown
 * Handles the dropdown functionality for the AI button in the navbar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find the AI button
    const aiButton = document.querySelector('.ai-recommendation-btn');
    
    if (!aiButton) {
        console.error('AI button not found');
        return;
    }
    
    // Make sure the parent li has position relative
    const parentLi = aiButton.closest('li');
    if (parentLi) {
        parentLi.style.position = 'relative';
    }
    
    // Get position of cart button for proper alignment
    const cartButton = document.querySelector('a[href="cart.html"]');
    let cartLeftPosition = 0;
    if (cartButton) {
        const cartRect = cartButton.getBoundingClientRect();
        cartLeftPosition = cartRect.left;
    }
    
    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.className = 'ai-dropdown';
    
    // Position dropdown relative to the button
    dropdown.style.right = '0';
    dropdown.style.marginTop = '10px';
    
    // Dropdown header
    dropdown.innerHTML = `
        <div class="ai-dropdown-header">
            <h3 class="ai-dropdown-title">AI Recommendations</h3>
            <button class="ai-close-btn">×</button>
        </div>
        
        <div class="ai-tabs">
            <button class="ai-tab active" data-tab="for-you">For You</button>
            <button class="ai-tab" data-tab="recently-viewed">Recently Viewed</button>
        </div>
        
        <div class="ai-content">
            <div id="ai-for-you" style="display: block;">
                <div class="ai-product">
                    <div class="ai-product-image" style="background-color: #5956e9;">🎧</div>
                    <div class="ai-product-info">
                        <p class="ai-product-name">Bluetooth Headphones</p>
                        <p class="ai-product-price">$59.99</p>
                    </div>
                </div>
                <div class="ai-product">
                    <div class="ai-product-image" style="background-color: #7678ED;">⌚</div>
                    <div class="ai-product-info">
                        <p class="ai-product-name">Smart Watch</p>
                        <p class="ai-product-price">$129.99</p>
                    </div>
                </div>
                <div class="ai-product">
                    <div class="ai-product-image" style="background-color: #9747FF;">🔌</div>
                    <div class="ai-product-info">
                        <p class="ai-product-name">Wireless Charger</p>
                        <p class="ai-product-price">$49.99</p>
                    </div>
                </div>
            </div>
            
            <div id="ai-recently-viewed" style="display: none;">
                <p style="text-align: center; color: #999; padding: 20px 0;">
                    No recently viewed products.
                </p>
            </div>
        </div>
        
        <div class="ai-dropdown-footer">
            <a href="#" class="ai-view-all">View All Recommendations</a>
        </div>
    `;
    
    // Add dropdown to the parent li instead of the button
    if (parentLi) {
        parentLi.appendChild(dropdown);
    } else {
        // Fallback to the button if li not found
        aiButton.appendChild(dropdown);
    }
    
    // Handle click on AI button
    aiButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        // Toggle active state for the button
        if (isVisible) {
            aiButton.classList.remove('active');
        } else {
            aiButton.classList.add('active');
        }
    });
    
    // Handle click on close button
    dropdown.querySelector('.ai-close-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropdown.style.display = 'none';
        aiButton.classList.remove('active');
    });
    
    // Handle tab switching
    dropdown.querySelectorAll('.ai-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update tab styles
            dropdown.querySelectorAll('.ai-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show correct content
            if (tabId === 'for-you') {
                document.getElementById('ai-for-you').style.display = 'block';
                document.getElementById('ai-recently-viewed').style.display = 'none';
            } else {
                document.getElementById('ai-for-you').style.display = 'none';
                document.getElementById('ai-recently-viewed').style.display = 'block';
            }
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (dropdown.style.display === 'block' && !dropdown.contains(e.target) && e.target !== aiButton) {
            dropdown.style.display = 'none';
            aiButton.classList.remove('active');
        }
    });
    
    // Prevent clicks inside dropdown from bubbling to document
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // For demo purposes - highlight the AI button on first load
    setTimeout(() => {
        aiButton.classList.add('highlight');
        setTimeout(() => {
            aiButton.classList.remove('highlight');
        }, 2000);
    }, 1000);
}); 