/**
 * AI Button for Main Site
 * Designed to match the dark theme shown in the screenshot
 */

(function() {
    // Wait for page to load
    window.addEventListener('DOMContentLoaded', function() {
        // Create the AI button
        const aiButton = document.createElement('a');
        aiButton.href = '#';
        aiButton.className = 'ai-recommendation-btn';
        aiButton.innerHTML = `
            <span>AI</span>
            <span class="ai-badge">5</span>
        `;
        
        // Style the button to match the site
        aiButton.style.display = 'inline-flex';
        aiButton.style.alignItems = 'center';
        aiButton.style.color = '#fff';
        aiButton.style.fontWeight = '500';
        aiButton.style.textDecoration = 'none';
        aiButton.style.marginLeft = '15px';
        aiButton.style.position = 'relative';
        
        // Style the badge
        const badge = aiButton.querySelector('.ai-badge');
        if (badge) {
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.width = '18px';
            badge.style.height = '18px';
            badge.style.backgroundColor = '#5956e9';
            badge.style.color = '#fff';
            badge.style.borderRadius = '50%';
            badge.style.fontSize = '11px';
            badge.style.fontWeight = '700';
            badge.style.marginLeft = '6px';
        }
        
        // Find the best place to insert the button
        // Strategy 1: Insert before the Cart link
        const cartLinks = Array.from(document.querySelectorAll('a')).filter(
            link => link.textContent.toLowerCase().includes('cart')
        );
        
        let inserted = false;
        if (cartLinks.length > 0) {
            const cartLink = cartLinks[0];
            const parentElement = cartLink.parentNode;
            if (parentElement) {
                parentElement.insertBefore(aiButton, cartLink);
                inserted = true;
            }
        }
        
        // Strategy 2: Insert after the About link
        if (!inserted) {
            const aboutLinks = Array.from(document.querySelectorAll('a')).filter(
                link => link.textContent.toLowerCase().includes('about')
            );
            if (aboutLinks.length > 0) {
                const aboutLink = aboutLinks[0];
                const parentElement = aboutLink.parentNode;
                if (parentElement && aboutLink.nextSibling) {
                    parentElement.insertBefore(aiButton, aboutLink.nextSibling);
                    inserted = true;
                } else if (parentElement) {
                    parentElement.appendChild(aiButton);
                    inserted = true;
                }
            }
        }
        
        // Strategy 3: Add to the main navigation
        if (!inserted) {
            const mainNav = document.querySelector('nav');
            if (mainNav) {
                mainNav.appendChild(aiButton);
                inserted = true;
            }
        }
        
        // Create dropdown element (hidden initially)
        const dropdown = document.createElement('div');
        dropdown.className = 'ai-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.right = '0';
        dropdown.style.width = '320px';
        dropdown.style.backgroundColor = '#1a1a1a';
        dropdown.style.borderRadius = '8px';
        dropdown.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
        dropdown.style.zIndex = '1000';
        dropdown.style.marginTop = '15px';
        dropdown.style.color = '#fff';
        
        // Dropdown header
        dropdown.innerHTML = `
            <div style="padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; color: #fff;">AI Recommendations</h3>
                <button style="background: none; border: none; color: #999; font-size: 18px; cursor: pointer;">×</button>
            </div>
            
            <div style="display: flex; border-bottom: 1px solid #333;">
                <button data-tab="for-you" style="flex: 1; padding: 10px; border: none; background: none; cursor: pointer; font-weight: 600; color: #5956e9; border-bottom: 2px solid #5956e9;">For You</button>
                <button data-tab="recently-viewed" style="flex: 1; padding: 10px; border: none; background: none; cursor: pointer; color: #999;">Recently Viewed</button>
            </div>
            
            <div id="ai-for-you" style="padding: 15px; max-height: 300px; overflow-y: auto;">
                <div class="ai-product">
                    <div style="width: 50px; height: 50px; background-color: #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">🎧</div>
                    <div>
                        <p style="margin: 0 0 5px 0; font-weight: 500;">Bluetooth Headphones</p>
                        <p style="margin: 0; font-size: 14px; color: #5956e9;">$59.99</p>
                    </div>
                </div>
                <div class="ai-product">
                    <div style="width: 50px; height: 50px; background-color: #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">⌚</div>
                    <div>
                        <p style="margin: 0 0 5px 0; font-weight: 500;">Smart Watch</p>
                        <p style="margin: 0; font-size: 14px; color: #5956e9;">$129.99</p>
                    </div>
                </div>
                <div class="ai-product">
                    <div style="width: 50px; height: 50px; background-color: #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">🔌</div>
                    <div>
                        <p style="margin: 0 0 5px 0; font-weight: 500;">Wireless Charger</p>
                        <p style="margin: 0; font-size: 14px; color: #5956e9;">$49.99</p>
                    </div>
                </div>
            </div>
            
            <div id="ai-recently-viewed" style="padding: 15px; display: none; max-height: 300px; overflow-y: auto;">
                <p style="text-align: center; color: #999; padding: 20px 0;">
                    No recently viewed products.
                </p>
            </div>
            
            <div style="padding: 15px; border-top: 1px solid #333; text-align: center;">
                <a href="#" style="color: #5956e9; text-decoration: none; font-size: 14px;">View All Recommendations</a>
            </div>
        `;
        
        // Style the products
        const productStyle = `
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #333;
            cursor: pointer;
        `;
        
        dropdown.querySelectorAll('.ai-product').forEach(product => {
            product.style.cssText = productStyle;
            product.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#252525';
            });
            product.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'transparent';
            });
        });
        
        // Add dropdown to button
        aiButton.appendChild(dropdown);
        
        // Add click handler to toggle dropdown
        aiButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        // Tab switching
        dropdown.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update tab styles
                dropdown.querySelectorAll('[data-tab]').forEach(t => {
                    t.style.fontWeight = '400';
                    t.style.color = '#999';
                    t.style.borderBottom = 'none';
                });
                this.style.fontWeight = '600';
                this.style.color = '#5956e9';
                this.style.borderBottom = '2px solid #5956e9';
                
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
        
        // Close button handler
        dropdown.querySelector('button').addEventListener('click', function(e) {
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
    });
})(); 