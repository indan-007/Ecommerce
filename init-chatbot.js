// Initialize chatbot on all pages
(function() {
    // Check if chatbot script is already loaded
    if (document.querySelector('script[src="chatbot.js"]')) {
        return;
    }

    // Add Font Awesome if not present
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    // Add chatbot script
    const chatbotScript = document.createElement('script');
    chatbotScript.src = 'chatbot.js';
    chatbotScript.onload = function() {
        // Initialize chatbot after script is loaded
        if (typeof createChatbotHTML === 'function' && typeof initChatbot === 'function') {
            createChatbotHTML();
            initChatbot();
        }
    };
    document.body.appendChild(chatbotScript);

    // Add initialization to window load event as backup
    window.addEventListener('load', function() {
        if (typeof createChatbotHTML === 'function' && typeof initChatbot === 'function') {
            if (!document.querySelector('.chat-widget')) {
                createChatbotHTML();
                initChatbot();
            }
        }
    });
})(); 