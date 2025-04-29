// Create chatbot HTML structure
function createChatbotHTML() {
    const chatbotHTML = `
        <div class="chat-widget">
            <button class="chat-button" id="chatButton">
                <i class="fas fa-comments"></i>
            </button>
            
            <div class="chat-container" id="chatContainer">
                <div class="chat-header">
                    <h3>RIOS Assistant</h3>
                    <button class="voice-button" id="voiceButton">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button class="chat-close" id="chatClose">×</button>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot-message">
                        Hi! I'm your RIOS shopping assistant. How can I help you today?
                        <br>You can also use voice commands by clicking the microphone icon.
                    </div>
                    <div class="quick-actions">
                        <button class="action-btn" onclick="window.riosChat.handleQuickAction('track')">📦 Track Order</button>
                        <button class="action-btn" onclick="window.riosChat.handleQuickAction('products')">🛍️ Browse Products</button>
                        <button class="action-btn" onclick="window.riosChat.handleQuickAction('sizes')">📏 Size Guide</button>
                        <button class="action-btn" onclick="window.riosChat.handleQuickAction('shipping')">🚚 Shipping Info</button>
                    </div>
                </div>
                
                <div class="typing-indicator" id="typingIndicator">
                    Assistant is typing<span>...</span>
                </div>
                
                <div class="chat-input">
                    <input type="text" id="userInput" placeholder="Type your message...">
                    <button class="send-button" id="sendMessage">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Base chatbot styles
    const baseStyles = `
        .chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }

        .chat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8956ff, #7240db);
            box-shadow: 0 4px 12px rgba(137, 86, 255, 0.3);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            z-index: 9999;
        }

        .chat-button i {
            color: white;
            font-size: 24px;
        }

        .chat-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(137, 86, 255, 0.4);
        }

        .chat-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background-color: #1a1a24;
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(137, 86, 255, 0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(137, 86, 255, 0.2);
            z-index: 9999;
        }

        .chat-header {
            padding: 15px 20px;
            background: linear-gradient(135deg, #8956ff, #7240db);
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chat-header h3 {
            margin: 0;
            font-size: 18px;
        }

        .chat-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 5px;
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            background-color: #1a1a24;
        }

        .message {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
            color: #e0e0e0;
        }

        .user-message {
            background-color: rgba(137, 86, 255, 0.1);
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .bot-message {
            background-color: rgba(40, 40, 55, 0.5);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }

        .chat-input {
            padding: 15px;
            background-color: rgba(30, 30, 42, 0.4);
            border-top: 1px solid #2e2e42;
            display: flex;
            gap: 10px;
        }

        .chat-input input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #2e2e42;
            border-radius: 8px;
            background-color: #232333;
            color: #e0e0e0;
            font-size: 14px;
        }

        .chat-input input:focus {
            outline: none;
            border-color: #8956ff;
            box-shadow: 0 0 0 2px rgba(137, 86, 255, 0.1);
        }

        .send-button {
            background: linear-gradient(135deg, #8956ff, #7240db);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            transition: all 0.3s;
        }

        .send-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(137, 86, 255, 0.2);
        }

        .quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
        }

        .action-btn {
            background: rgba(137, 86, 255, 0.1);
            border: 1px solid rgba(137, 86, 255, 0.2);
            border-radius: 20px;
            padding: 8px 16px;
            color: #e0e0e0;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s;
        }

        .action-btn:hover {
            background: rgba(137, 86, 255, 0.2);
            transform: translateY(-1px);
        }

        .voice-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 5px 10px;
            transition: all 0.3s;
            margin-right: 10px;
        }

        .voice-button:hover {
            transform: scale(1.1);
        }

        .voice-button.listening {
            animation: pulse 1.5s infinite;
            color: #ff4444;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .voice-tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            display: none;
        }

        .voice-button:hover .voice-tooltip {
            display: block;
        }

        .product-card {
            display: flex;
            gap: 12px;
            background: rgba(40, 40, 55, 0.5);
            padding: 12px;
            border-radius: 8px;
            margin: 8px 0;
        }

        .product-card img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
        }

        .product-info {
            flex: 1;
        }

        .product-info h4 {
            margin: 0 0 4px;
            color: #e0e0e0;
            font-size: 14px;
        }

        .product-info p {
            margin: 0;
            color: #a0a0a0;
            font-size: 12px;
        }

        .product-price {
            color: #8956ff;
            font-weight: bold;
            margin-top: 4px;
        }
    `;

    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = baseStyles;
    document.head.appendChild(styleElement);

    // Create and append chatbot HTML
    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotContainer);
}

// Initialize chatbot functionality
function initChatbot() {
    // Create global chatbot object
    window.riosChat = {
        productDatabase: {
            categories: ['Dresses', 'Jackets', 'Suits', 'Ethnic Wear', 'Party Wear', 'Casual Wear'],
            products: [
                {
                    id: 1,
                    name: 'Floral Maxi Dress',
                    brand: 'Zara',
                    price: '₹2,499',
                    image: 'images/f1.jpg',
                    category: 'Dresses',
                    description: 'Beautiful floral print maxi dress perfect for summer occasions.',
                    sizes: ['XS', 'S', 'M', 'L', 'XL'],
                    colors: ['Blue', 'Pink', 'White'],
                    inStock: true
                },
                {
                    id: 2,
                    name: 'Casual Summer Dress',
                    brand: 'H&M',
                    price: '₹1,799',
                    image: 'images/f2.jpg',
                    category: 'Dresses',
                    description: 'Light and comfortable summer dress for casual wear.',
                    sizes: ['S', 'M', 'L'],
                    colors: ['Yellow', 'Green'],
                    inStock: true
                },
                {
                    id: 3,
                    name: 'Denim Jacket Dress',
                    brand: "Levi's",
                    price: '₹3,299',
                    image: 'images/f3.jpg',
                    category: 'Jackets',
                    description: 'Stylish denim jacket dress with modern design.',
                    sizes: ['M', 'L', 'XL'],
                    colors: ['Blue'],
                    inStock: true
                },
                {
                    id: 4,
                    name: 'Classic Black Suit',
                    brand: 'Fashion Era',
                    price: '₹9,999',
                    image: 'images/n3.jpg',
                    category: 'Suits',
                    description: 'Premium black suit for formal occasions.',
                    sizes: ['S', 'M', 'L', 'XL'],
                    colors: ['Black'],
                    inStock: true
                },
                {
                    id: 5,
                    name: 'Ethnic Kurti Dress',
                    brand: 'FabIndia',
                    price: '₹2,799',
                    image: 'images/f8.jpg',
                    category: 'Ethnic Wear',
                    description: 'Traditional ethnic kurti with modern touch.',
                    sizes: ['S', 'M', 'L'],
                    colors: ['Red', 'Blue', 'Green'],
                    inStock: true
                }
            ]
        },
        
        // Add order tracking database
        orderDatabase: {
            orders: [
                {
                    orderId: "ORD123456",
                    status: "Delivered",
                    items: ["Classic Black Suit", "Floral Maxi Dress"],
                    date: "2024-03-10",
                    deliveryDate: "2024-03-15",
                    trackingId: "TRK789012"
                },
                {
                    orderId: "ORD789012",
                    status: "In Transit",
                    items: ["Ethnic Kurti Dress"],
                    date: "2024-03-18",
                    deliveryDate: "2024-03-22",
                    trackingId: "TRK345678"
                }
            ]
        },

        // Add FAQ database
        faqDatabase: {
            shipping: {
                "delivery time": "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days.",
                "shipping cost": "Free shipping on orders above ₹999. Standard shipping fee is ₹99.",
                "international shipping": "Yes, we ship internationally to select countries. Delivery time varies by location.",
                "track order": "You can track your order using the order ID or tracking number provided in your confirmation email."
            },
            payment: {
                "payment methods": "We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery.",
                "emi": "EMI is available on orders above ₹3,000 with select banks.",
                "refund": "Refunds are processed within 5-7 business days after return approval.",
                "secure": "All payments are secured with 256-bit SSL encryption."
            },
            returns: {
                "return policy": "7 days return window for unused items with tags intact.",
                "return process": "Initiate return from your order history, and we'll arrange pickup.",
                "refund time": "Refunds are processed within 5-7 business days after return approval.",
                "exchange": "Size exchanges are free and processed on priority."
            },
            sizing: {
                "size guide": "Check our size guide for detailed measurements.",
                "measurement": "Measure yourself and compare with our size chart for the best fit.",
                "fit": "Our items are true to size. For a relaxed fit, go one size up."
            }
        },

        // Add user context tracking
        userContext: {
            lastQuery: null,
            lastProduct: null,
            lastCategory: null,
            searchHistory: [],
            viewedProducts: [],
            currentPage: window.location.pathname
        },

        // Add recommendation engine
        recommendProducts: function(context) {
            const recommendations = [];
            if (context.lastProduct) {
                // Find similar products in same category
                const similarProducts = this.productDatabase.products.filter(p => 
                    p.category === context.lastProduct.category && p.id !== context.lastProduct.id
                );
                recommendations.push(...similarProducts);
            }
            return recommendations.slice(0, 3); // Return top 3 recommendations
        },

        // Enhanced message handling
        handleUserMessage: function(message) {
            // Update context
            this.userContext.lastQuery = message;
            this.userContext.searchHistory.push(message);

            // Process message
            const intent = this.detectIntent(message);
            this.processIntent(intent, message);
        },

        // Intent detection
        detectIntent: function(message) {
            const msg = message.toLowerCase();
            
            // Define intent patterns
            const intents = {
                search: /show|find|search|looking for|where|want|browse/i,
                price: /price|cost|how much|rate/i,
                availability: /available|in stock|do you have/i,
                order: /order|track|status|delivery/i,
                return: /return|refund|exchange|cancel/i,
                size: /size|fit|measurement|guide/i,
                payment: /payment|pay|emi|card|upi|cash/i,
                shipping: /shipping|delivery|international|free/i,
                help: /help|support|assist|guide/i,
                recommendation: /recommend|suggest|similar|like/i
            };

            // Return matched intent
            for (const [intent, pattern] of Object.entries(intents)) {
                if (pattern.test(msg)) return intent;
            }

            return 'general';
        },

        // Process detected intent
        processIntent: function(intent, message) {
            switch(intent) {
                case 'search':
                    this.handleSearchIntent(message);
                    break;
                case 'price':
                    this.handlePriceIntent(message);
                    break;
                case 'availability':
                    this.handleAvailabilityIntent(message);
                    break;
                case 'order':
                    this.handleOrderIntent(message);
                    break;
                case 'return':
                    this.handleReturnIntent(message);
                    break;
                case 'size':
                    this.handleSizeIntent(message);
                    break;
                case 'payment':
                    this.handlePaymentIntent(message);
                    break;
                case 'shipping':
                    this.handleShippingIntent(message);
                    break;
                case 'help':
                    this.handleHelpIntent(message);
                    break;
                case 'recommendation':
                    this.handleRecommendationIntent(message);
                    break;
                default:
                    this.handleGeneralQuery(message);
            }
        },

        // Intent handlers
        handleSearchIntent: function(message) {
            const searchTerms = this.extractSearchTerms(message);
            if (searchTerms) {
                this.searchProducts(searchTerms);
                
                // Add recommendations
                setTimeout(() => {
                    if (this.userContext.lastProduct) {
                        const recommendations = this.recommendProducts(this.userContext);
                        if (recommendations.length > 0) {
                            this.showRecommendations(recommendations);
                        }
                    }
                }, 1000);
            }
        },

        handleOrderIntent: function(message) {
            const orderMatch = message.match(/order.*?([A-Z0-9]{6,})/i);
            if (orderMatch) {
                const orderId = orderMatch[1];
                const order = this.orderDatabase.orders.find(o => o.orderId === orderId);
                
                if (order) {
                    const orderHTML = `
                        <div class="bot-message">
                            <h4>Order Details: ${order.orderId}</h4>
                            <p>Status: ${order.status}</p>
                            <p>Order Date: ${order.date}</p>
                            <p>Expected Delivery: ${order.deliveryDate}</p>
                            <p>Items: ${order.items.join(', ')}</p>
                            <p>Tracking ID: ${order.trackingId}</p>
                            <button class="action-btn" onclick="window.open('tracking.html?id=${order.trackingId}')">Track Package</button>
                        </div>
                    `;
                    this.addMessage(orderHTML, 'bot', true);
                } else {
                    this.addMessage("I couldn't find that order. Please check the order ID and try again.", 'bot');
                }
            } else {
                this.addMessage("Please provide your order ID to track your order. It should be in the format 'ORD123456'.", 'bot');
            }
        },

        handleRecommendationIntent: function(message) {
            let recommendations = [];
            
            if (this.userContext.lastProduct) {
                recommendations = this.recommendProducts(this.userContext);
            } else if (this.userContext.lastCategory) {
                recommendations = this.productDatabase.products
                    .filter(p => p.category === this.userContext.lastCategory)
                    .slice(0, 3);
            } else {
                // Default recommendations
                recommendations = this.productDatabase.products
                    .filter(p => p.inStock)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);
            }

            this.showRecommendations(recommendations);
        },

        showRecommendations: function(products) {
            let html = `
                <div class="bot-message">
                    <h4>You might also like:</h4>
                    <div class="recommendations">
            `;

            products.forEach(product => {
                html += `
                    <div class="product-card">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <p>${product.brand}</p>
                            <div class="product-price">${product.price}</div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            this.addMessage(html, 'bot', true);
        },

        // Enhanced FAQ handling
        handleFAQ: function(message) {
            const msg = message.toLowerCase();
            let response = null;

            // Check each FAQ category
            for (const [category, questions] of Object.entries(this.faqDatabase)) {
                for (const [question, answer] of Object.entries(questions)) {
                    if (msg.includes(question.toLowerCase())) {
                        response = answer;
                        break;
                    }
                }
                if (response) break;
            }

            if (response) {
                this.addMessage(response, 'bot');
            }
        },

        // Utility functions
        extractSearchTerms: function(message) {
            return message
                .toLowerCase()
                .replace(/show( me)?|find|search( for)?|looking for|where can i find|i want|to buy/g, '')
                .replace(/[?.,]/g, '')
                .trim();
        },

        // Update existing functions
        getBotResponse: async function(userMessage) {
            try {
                // Update user context
                this.userContext.lastQuery = userMessage;
                
                // Handle message based on intent
                this.handleUserMessage(userMessage);
    } catch (error) {
                console.error('Error getting bot response:', error);
                this.addMessage('I apologize, but I encountered an error. Please try again later.', 'bot');
            }
        },

        handleQuickAction: function(action) {
            switch(action) {
                case 'track':
                    this.addMessage('Please enter your order number:', 'bot');
                    break;
                case 'products':
                    this.showCategories();
                    break;
                case 'sizes':
                    this.showSizeGuide();
                    break;
                case 'shipping':
                    this.showShippingInfo();
                    break;
            }
        },

        showCategories: function() {
            let categoriesHTML = `
                <div class="bot-message">
                    Browse products by category:
                    <div class="category-buttons">
                        ${this.productDatabase.categories.map(category => 
                            `<button class="category-btn" onclick="window.riosChat.showCategoryProducts('${category}')">${category}</button>`
                        ).join('')}
                    </div>
                </div>
            `;
            this.addMessage(categoriesHTML, 'bot', true);
        },

        showCategoryProducts: function(category) {
            const categoryProducts = this.productDatabase.products.filter(p => p.category === category);
            let productsHTML = `<div class="bot-message">Products in ${category}:<br>`;
            
            categoryProducts.forEach(product => {
                productsHTML += `
                    <div class="product-card">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <p>${product.brand}</p>
                            <p class="product-description">${product.description}</p>
                            <div class="product-details">
                                <span>Sizes: ${product.sizes.join(', ')}</span>
                                <span>Colors: ${product.colors.join(', ')}</span>
                            </div>
                            <div class="product-price">${product.price}</div>
                            <div class="stock-status">${product.inStock ? '✅ In Stock' : '❌ Out of Stock'}</div>
      </div>
    </div>
                `;
            });
            productsHTML += '</div>';
            this.addMessage(productsHTML, 'bot', true);
        },

        searchProducts: function(query) {
            const searchResults = this.productDatabase.products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.brand.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );

            if (searchResults.length > 0) {
                let resultsHTML = `<div class="bot-message">Found ${searchResults.length} products matching "${query}":<br>`;
                searchResults.forEach(product => {
                    resultsHTML += `
                        <div class="product-card">
                            <img src="${product.image}" alt="${product.name}">
                            <div class="product-info">
                                <h4>${product.name}</h4>
                                <p>${product.brand}</p>
                                <p class="product-description">${product.description}</p>
                                <div class="product-details">
                                    <span>Sizes: ${product.sizes.join(', ')}</span>
                                    <span>Colors: ${product.colors.join(', ')}</span>
                                </div>
                                <div class="product-price">${product.price}</div>
                                <div class="stock-status">${product.inStock ? '✅ In Stock' : '❌ Out of Stock'}</div>
                            </div>
                        </div>
                    `;
                });
                resultsHTML += '</div>';
                this.addMessage(resultsHTML, 'bot', true);
            } else {
                this.addMessage(`I couldn't find any products matching "${query}". Try different keywords or browse our categories.`, 'bot');
            }
        },

        addMessage: function(text, sender, html = false) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            if (html) {
                messageDiv.innerHTML = text;
            } else {
                messageDiv.textContent = text;
            }
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        },

        // Add voice recognition properties
        recognition: null,
        synthesis: window.speechSynthesis,
        isListening: false,
        lastRecognitionSuccessful: false,

        // Initialize voice recognition
        initVoiceRecognition: function() {
            // Check for browser compatibility
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                console.error('Speech recognition not supported');
                const voiceButton = document.getElementById('voiceButton');
                voiceButton.style.display = 'none';
                this.addMessage('Voice recognition is not supported in your browser. Please use Chrome or Edge.', 'bot');
                return;
            }

            // Use standard SpeechRecognition if available, otherwise use webkitSpeechRecognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition settings
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                this.isListening = true;
                const voiceButton = document.getElementById('voiceButton');
                voiceButton.classList.add('listening');
                this.addMessage('Listening... Speak now', 'bot');
                
                // Add visual feedback
                voiceButton.innerHTML = '<i class="fas fa-microphone" style="color: #ff4444;"></i>';
            };

            this.recognition.onend = () => {
                this.isListening = false;
                const voiceButton = document.getElementById('voiceButton');
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
                
                // Check if recognition was successful
                if (!this.lastRecognitionSuccessful) {
                    this.addMessage('No speech was detected. Please try again.', 'bot');
                }
            };

            this.recognition.onresult = (event) => {
                this.lastRecognitionSuccessful = true;
                const voiceInput = event.results[0][0].transcript;
                const confidence = event.results[0][0].confidence;
                
                // Update UI with recognized text
                document.getElementById('userInput').value = voiceInput;
                this.addMessage(voiceInput, 'user');
                
                // Process the voice input
                this.handleUserMessage(voiceInput);
                
                // Log confidence level for debugging
                console.log('Speech recognition confidence:', confidence);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.lastRecognitionSuccessful = false;
                
                let errorMessage = 'An error occurred with voice recognition. ';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage += 'No speech was detected. Please try again.';
                        break;
                    case 'audio-capture':
                        errorMessage += 'No microphone was found. Ensure it is plugged in and allowed.';
                        break;
                    case 'not-allowed':
                        errorMessage += 'Microphone permission was denied. Please allow microphone access.';
                        break;
                    case 'network':
                        errorMessage += 'Network error occurred. Please check your internet connection.';
                        break;
                    default:
                        errorMessage += 'Please try again.';
                }
                
                this.addMessage(errorMessage, 'bot');
                
                // Reset UI
                const voiceButton = document.getElementById('voiceButton');
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            };
        },

        // Start voice recognition with timeout
        startListening: function() {
            if (this.recognition && !this.isListening) {
                try {
                    this.lastRecognitionSuccessful = false;
                    this.recognition.start();
                    
                    // Set timeout to stop listening if no speech is detected
                    setTimeout(() => {
                        if (this.isListening) {
                            this.stopListening();
                        }
                    }, 7000); // Stop after 7 seconds of no speech
                } catch (error) {
                    console.error('Error starting speech recognition:', error);
                    this.addMessage('Error starting voice recognition. Please try again.', 'bot');
                }
            }
        },

        // Stop voice recognition
        stopListening: function() {
            if (this.recognition && this.isListening) {
                try {
                    this.recognition.stop();
                } catch (error) {
                    console.error('Error stopping speech recognition:', error);
                }
            }
        },

        // Speak response
        speak: function(text) {
            // Remove HTML tags from text
            const plainText = text.replace(/<[^>]*>/g, '');
            
            if (this.synthesis) {
                const utterance = new SpeechSynthesisUtterance(plainText);
                utterance.lang = 'en-US';
                utterance.rate = 1;
                utterance.pitch = 1;
                this.synthesis.speak(utterance);
            }
        },

        // Override addMessage to include speech
        addMessage: function(text, sender, html = false) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            
            if (html) {
                messageDiv.innerHTML = text;
            } else {
                messageDiv.textContent = text;
            }
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Speak bot messages
            if (sender === 'bot' && !html) {
                this.speak(text);
            }
        }
    };

    // Initialize event listeners
    const chatButton = document.getElementById('chatButton');
    const chatContainer = document.getElementById('chatContainer');
    const chatClose = document.getElementById('chatClose');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');

    // Toggle chat window
    chatButton.addEventListener('click', () => {
        chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
    });

    chatClose.addEventListener('click', () => {
        chatContainer.style.display = 'none';
    });

    // Send message function
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        window.riosChat.addMessage(message, 'user');
        userInput.value = '';

        // Get bot response
        setTimeout(() => {
            window.riosChat.getBotResponse(message);
        }, 1000);
    }

    // Event listeners
    sendMessage.addEventListener('click', sendUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });

    // Initialize voice recognition
    window.riosChat.initVoiceRecognition();

    // Add voice button event listener
    const voiceButton = document.getElementById('voiceButton');
    voiceButton.addEventListener('click', () => {
        if (window.riosChat.isListening) {
            window.riosChat.stopListening();
        } else {
            window.riosChat.startListening();
        }
    });
}

// Add styles for new features
const additionalStyles = `
    .recommendations {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
    }

    .recommendations .product-card {
        flex: 1;
        min-width: 150px;
        max-width: 200px;
    }

    .order-status {
        background: rgba(137, 86, 255, 0.1);
        padding: 10px;
        border-radius: 8px;
        margin-top: 10px;
    }

    .order-status h4 {
        margin: 0 0 8px;
        color: #8956ff;
    }

    .track-button {
        background: linear-gradient(135deg, #8956ff, #7240db);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.3s;
    }

    .track-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(137, 86, 255, 0.2);
    }
`;

// Add the styles to the existing styleElement
document.addEventListener('DOMContentLoaded', () => {
    const styleElement = document.createElement('style');
    styleElement.textContent += additionalStyles;
    document.head.appendChild(styleElement);
    createChatbotHTML();
    initChatbot();
});
