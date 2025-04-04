# AI Recommendation System

This folder contains the AI recommendation system for your e-commerce website. The system provides personalized product recommendations based on user browsing history and purchase behavior.

## Quick Start

The quickest way to add AI recommendations to your site is to add this single line to any page:

```html
<script src="js/ai-button.js"></script>
```

This will automatically add an AI button to your navigation with a dropdown showing personalized recommendations.

## Demo Page

For a live demonstration, visit [ai-demo.html](ai-demo.html) to see the AI recommendation system in action.

## Implementation Options

### 1. Simple Implementation (One Line)

The simplest way to add AI features is by including the `ai-button.js` script:

```html
<script src="js/ai-button.js"></script>
```

**Features:**
- Automatically adds an AI button to your navigation
- Displays product recommendations in a dropdown
- Works without any HTML modifications
- Uses localStorage to track product views

### 2. Full Integration (Recommended for Production)

For a complete AI-powered shopping experience:

```html
<!-- In the head section -->
<link rel="stylesheet" href="styles/navbar-ai.css">

<!-- Before closing body tag -->
<script src="js/ai-recommendations.js"></script>
<script src="js/navbar-ai-integration.js"></script>
```

**Features:**
- Advanced product recommendations based on browsing history
- Category affinity calculations
- Purchase tracking
- Enhanced personalization over time
- Better styling integration with your site's theme

## File Structure

- `js/ai-button.js` - Standalone script that adds the AI button to any page
- `js/ai-recommendations.js` - Core recommendation engine
- `js/navbar-ai-integration.js` - Navbar integration for the AI features
- `js/load-ai-features.js` - Helper script to load AI features dynamically
- `styles/navbar-ai.css` - Styling for the AI navbar components
- `ai-demo.html` - Demo page showing implementation options

## How It Works

The AI recommendation system uses a combination of:

1. **Product View Tracking**: Records which products a user views
2. **Category Affinities**: Calculates user preferences for different product categories
3. **Recently Viewed**: Keeps track of recently viewed products for quick reference
4. **Purchase Behavior**: Analyses purchases to improve future recommendations

All data is stored locally in the user's browser using localStorage, ensuring privacy while still providing personalized recommendations.

## Adding to Existing Pages

### Adding to a Product Page

To add AI recommendations to a product page:

```html
<!-- At the end of your product details section -->
<div class="ai-recommendations-container">
  <h3>You Might Also Like</h3>
  <div id="ai-similar-products" class="product-grid"></div>
</div>

<script>
  // Assuming ai-recommendations.js is already loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Get current product ID and category from the page
    const productId = document.getElementById('product-id').value;
    const category = document.getElementById('product-category').value;
    
    // Track this product view
    trackProductView(productId, category);
    
    // Load similar products recommendations
    displaySimilarProducts('ai-similar-products', productId, 4);
  });
</script>
```

### Adding to Homepage

To add personalized recommendations to your homepage:

```html
<!-- Featured recommendations section -->
<section class="recommendations-section">
  <h2>Recommended For You</h2>
  <div id="personalized-recommendations" class="product-grid"></div>
</section>

<script>
  // Assuming ai-recommendations.js is already loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Display personalized recommendations
    displayPersonalizedRecommendations('personalized-recommendations', 4);
  });
</script>
```

## Customization

### Styling

You can customize the appearance of the AI components by modifying `navbar-ai.css` or by overriding the styles in your own stylesheet.

### Product Data

The system expects product data in a specific format. By default, it fetches from `api/products.php`, but you can modify this in the `ai-recommendations.js` file to point to your own product API.

### Recommendation Algorithms

The recommendation algorithms can be adjusted in `ai-recommendations.js` by modifying:

- `calculateCategoryAffinities()` - How category preferences are calculated
- `getPersonalizedRecommendations()` - How recommendations are selected
- `getSimilarProducts()` - How similar products are determined

## Troubleshooting

If the AI button doesn't appear:

1. Check browser console for errors
2. Ensure the script is correctly linked
3. Make sure your page has a navigation bar element
4. Try adding the button manually if needed:

```html
<a href="#" class="ai-button">
  <span class="ai-icon">🧠</span>
  <span class="ai-label">AI</span>
  <span class="ai-badge">5</span>
</a>
```

## Browser Support

- Chrome: Latest
- Firefox: Latest
- Safari: Latest
- Edge: Latest
- IE: Not supported

## Privacy Note

This recommendation system uses localStorage for storing user preferences and browsing history. All data remains on the user's device and is not sent to any server unless you implement such functionality. You may want to mention this in your privacy policy. 