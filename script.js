const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar && nav) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close && nav) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const websiteURL = "http://127.0.0.1:5501/index.html"; // Replace with your actual website URL

    let qrCode = new QRCode(document.getElementById("qrcode"), {
        text: websiteURL,
        width: 150,
        height: 150
    });
});




document.addEventListener('DOMContentLoaded', function() {
    const mainImg = document.getElementById("MainImg");
    const smallImgCols = document.querySelectorAll(".small-img-col");
    const smallImgs = document.querySelectorAll(".small-img");
    
    // Store the original src values of all small images
    const originalImgSrcs = Array.from(smallImgs).map(img => img.src);
    
    // Set up click handlers for each thumbnail
    smallImgCols.forEach((imgCol, index) => {
        imgCol.addEventListener('click', function() {
            // Fade out main image slightly for transition effect
            mainImg.style.opacity = 0.7;
            
            // Update main image with clicked thumbnail
            setTimeout(() => {
                mainImg.src = smallImgs[index].src;
                mainImg.style.opacity = 1;
            }, 200);
            
            // Create stack-like animation for thumbnails
            // First thumbnail becomes the clicked one, others shift
            const clickedImgSrc = smallImgs[index].src;
            
            // Temporarily hide thumbnails during animation
            smallImgCols.forEach(col => {
                col.style.transform = 'scale(0.95)';
                col.style.opacity = '0.7';
            });
            
            // Animate and rearrange thumbnails after a short delay
            setTimeout(() => {
                // Create new array of sources with clicked image first, followed by others
                let newSrcs = [clickedImgSrc];
                originalImgSrcs.forEach(src => {
                    if (src !== clickedImgSrc) {
                        newSrcs.push(src);
                    }
                });
                
                // Update thumbnails with new order (limit to first 4 images)
                newSrcs = newSrcs.slice(0, 4);
                smallImgs.forEach((img, i) => {
                    img.src = newSrcs[i];
                });
                
                // Restore visibility with animation
                smallImgCols.forEach(col => {
                    col.style.transform = 'scale(1)';
                    col.style.opacity = '1';
                });
            }, 300);
        });
    });
});












// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage or create empty cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartSection = document.getElementById('empty-cart');
    const cartSection = document.getElementById('cart');
    const cartSummarySection = document.getElementById('cart-summary');
    
    // updateCartCount();

    // Add event listeners to "Add to Cart" buttons on product detail page
    const addToCartBtn = document.querySelector('.single-pro-details button.normal');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const product = {
                id: generateProductId(),
                name: document.querySelector('.single-pro-details h4').textContent,
                price: document.querySelector('.single-pro-details h2').textContent,
                image: document.getElementById('MainImg').src,
                quantity: parseInt(document.querySelector('.single-pro-details input[type="number"]').value) || 1,
                size: document.querySelector('.single-pro-details select').value
            };
            
            addToCart(product);
            // showNotification('Product added to cart!');
        });
    }

    // Add event listeners to "Add to Cart" icons on product cards
    const productCardCartIcons = document.querySelectorAll('.pro a i.fa-cart-shopping');
    productCardCartIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product information from the parent product card
            const productCard = this.closest('.pro');
            const product = {
                id: generateProductId(),
                name: productCard.querySelector('h5').textContent,
                price: productCard.querySelector('h4').textContent,
                image: productCard.querySelector('img').src,
                quantity: 1,
                size: 'Default'
            };
            
            addToCart(product);
            // showNotification('Product added to cart!');
        });
    });

    // Cart page functionality
    if (window.location.href.includes('cart.html')) {
        // Display empty cart message if cart is empty
        if (cart.length === 0) {
            emptyCartSection.style.display = 'block';
            cartSection.style.display = 'none';
            cartSummarySection.style.display = 'none';
        } else {
            renderCartItems();
            updateCartTotals();
        }
        
        // Clear cart button functionality
        const clearCartBtn = document.querySelector('.clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function() {
                localStorage.removeItem('cart');
                location.reload();
            });
        }
        
        // Checkout button functionality
        // const checkoutBtn = document.getElementById('checkout-btn');
        // if (checkoutBtn) {
        //     checkoutBtn.addEventListener('click', function() {
        //         alert('Thank you for your order! This is a demo, so no actual checkout will occur.');
                // In a real application, you would redirect to a checkout page
                // window.location.href = 'checkout.html';
        //     });
        // }

        // Coupon code functionality
        const couponInput = document.querySelector('#coupon input');
        const couponButton = document.querySelector('#coupon button');
        let discountApplied = false;
        
        // Check if discount was previously applied
        if (localStorage.getItem('discountApplied') === 'true') {
            discountApplied = true;
            
            // Show applied coupon
            if (couponInput) {
                couponInput.value = localStorage.getItem('appliedCoupon') || '';
                couponInput.disabled = true;
                couponButton.textContent = 'Remove';
            }
        }
        
        // Add event listener to coupon button
        if (couponButton) {
            couponButton.addEventListener('click', function() {
                // If discount already applied, remove it
                if (discountApplied) {
                    discountApplied = false;
                    localStorage.removeItem('discountApplied');
                    localStorage.removeItem('appliedCoupon');
                    
                    // Reset UI
                    couponInput.value = '';
                    couponInput.disabled = false;
                    couponButton.textContent = 'Apply';
                    
                    // Show notification
                    showNotification('Discount removed');
                    
                    // Update totals
                    updateCartTotals();
                    return;
                }
                
                // Get entered coupon code
                const couponCode = couponInput.value.trim();
                
                // Check if valid coupon
                if (couponCode.toUpperCase() === 'UNIVERSAL 2ND YEAR') {
                    // Apply discount
                    discountApplied = true;
                    localStorage.setItem('discountApplied', 'true');
                    localStorage.setItem('appliedCoupon', couponCode);
                    
                    // Update UI
                    couponInput.disabled = true;
                    couponButton.textContent = 'Remove';
                    
                    // Show success notification
                    showNotification('50% discount applied!');
                    
                    // Update totals with discount
                    updateCartTotals();
                } else {
                    // Show error notification
                    showNotification('Invalid coupon code', true);
                }
            });
        }
    }

    // Function to add a product to cart
    function addToCart(product) {
        // Check if product already exists in cart (by name and size)
        const existingProductIndex = cart.findIndex(item => 
            item.name === product.name && item.size === product.size
        );
        
        if (existingProductIndex > -1) {
            // Product exists, increase quantity
            cart[existingProductIndex].quantity += product.quantity;
        } else {
            // Product doesn't exist, add to cart
            cart.push(product);
        }
        
        // Save cart to localStorage and update UI
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Function to generate a unique product ID
    function generateProductId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Function to update cart count in the navbar
    function updateCartCount() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Create or update cart count indicator
        let cartLink = document.querySelector('#navbar li a[href="cart.html"]');
        if (cartLink) {
            // Check if count badge already exists
            let countBadge = cartLink.querySelector('.cart-count');
            
            if (!countBadge && cartCount > 0) {
                // Create new badge
                countBadge = document.createElement('span');
                countBadge.classList.add('cart-count');
                cartLink.appendChild(countBadge);
            }
            
            if (countBadge) {
                if (cartCount > 0) {
                    countBadge.textContent = cartCount;
                    countBadge.style.display = 'inline-block';
                } else {
                    countBadge.style.display = 'none';
                }
            }
        }
    }

    // Function to render cart items
    function renderCartItems() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        cart.forEach((item, index) => {
            // Calculate subtotal for this item
            const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
            const subtotal = price * item.quantity;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <a href="#" class="remove-item" data-index="${index}">
                        <i class="far fa-times-circle"></i>
                    </a>
                </td>
                <td><img src="${item.image}" alt="${item.name}"></td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.size}</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-index="${index}">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="10" data-index="${index}" class="quantity-input">
                        <button class="quantity-btn increase" data-index="${index}">+</button>
                    </div>
                </td>
                <td>₹${subtotal.toFixed(2)}</td>
            `;
            
            cartItemsContainer.appendChild(row);
        });
        
        // Add event listeners to quantity controls and remove buttons
        addEventListeners();
    }
    
    // Function to add event listeners to cart controls
    function addEventListeners() {
        // Remove item buttons
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const index = parseInt(this.getAttribute('data-index'));
                removeCartItem(index);
            });
        });
        
        // Quantity decrease buttons
        const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updateItemQuantity(index, -1);
            });
        });
        
        // Quantity increase buttons
        const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updateItemQuantity(index, 1);
            });
        });
        
        // Quantity input fields
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const newQuantity = parseInt(this.value);
                setItemQuantity(index, newQuantity);
            });
        });
    }
    
    // Function to remove an item from cart
    function removeCartItem(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // If cart is now empty, show empty cart message
        if (cart.length === 0) {
            emptyCartSection.style.display = 'block';
            cartSection.style.display = 'none';
            cartSummarySection.style.display = 'none';
        } else {
            renderCartItems();
        }
        
        updateCartTotals();
        updateCartCount();
    }
    
    // Function to update item quantity
    function updateItemQuantity(index, change) {
        const newQuantity = cart[index].quantity + change;
        if (newQuantity > 0 && newQuantity <= 10) {
            cart[index].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
            updateCartTotals();
            updateCartCount();
        }
    }
    
    // Function to set exact item quantity
    function setItemQuantity(index, quantity) {
        if (quantity > 0 && quantity <= 10) {
            cart[index].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartTotals();
            updateCartCount();
        } else {
            // Reset to valid quantity
            const inputs = document.querySelectorAll('.quantity-input');
            inputs[index].value = cart[index].quantity;
        }
    }
    
    // Function to update cart totals
    function updateCartTotals() {
        const subtotalElement = document.getElementById('cart-subtotal');
        const totalElement = document.getElementById('cart-total');
        if (!subtotalElement || !totalElement) return;
        
        let subtotal = 0;
        
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
            subtotal += price * item.quantity;
        });
        
        // Calculate discount if applicable
        let finalTotal = subtotal;
        let discountAmount = 0;
        
        if (localStorage.getItem('discountApplied') === 'true') {
            discountAmount = subtotal * 0.5; // 50% discount
            finalTotal = subtotal - discountAmount;
            
            // Add discount row if applicable
            const discountRow = document.querySelector('.discount-row');
            if (!discountRow) {
                // Create discount row if it doesn't exist
                const table = document.querySelector('#subtotal table');
                const newRow = document.createElement('tr');
                newRow.classList.add('discount-row');
                newRow.innerHTML = `
                    <td>Discount (50%)</td>
                    <td id="discount-amount">-₹${discountAmount.toFixed(2)}</td>
                `;
                
                // Insert before the total row
                const totalRow = table.querySelector('tr:last-child');
                table.insertBefore(newRow, totalRow);
            } else {
                // Update existing discount row
                document.getElementById('discount-amount').textContent = `-₹${discountAmount.toFixed(2)}`;
            }
        } else {
            // Remove discount row if discount is not applied
            const discountRow = document.querySelector('.discount-row');
            if (discountRow) {
                discountRow.remove();
            }
        }
        
        // Update UI
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        totalElement.textContent = `₹${finalTotal.toFixed(2)}`;
    }

    // Function to show notification when product is added
    function showNotification(message, isError = false) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            document.body.appendChild(notification);
        }
        
        // Set error class if applicable
        if (isError) {
            notification.classList.add('error');
        } else {
            notification.classList.remove('error');
        }
        
        // Update notification content and show it
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});






// This script will handle product clicks and redirect to the product detail page with parameters

// Add this to your script.js file
document.addEventListener('DOMContentLoaded', function() {
    // Get all product items
    const productItems = document.querySelectorAll('.pro');
    
    // Add click event listener to each product
    productItems.forEach(product => {
        product.addEventListener('click', function() {
            // Get product details
            const productName = this.querySelector('h5').innerText;
            const productPrice = this.querySelector('h4').innerText;
            const productBrand = this.querySelector('span').innerText;
            const productImage = this.querySelector('img').src;
            
            // Create URL with parameters
            const productUrl = `sproduct.html?name=${encodeURIComponent(productName)}&price=${encodeURIComponent(productPrice)}&brand=${encodeURIComponent(productBrand)}&image=${encodeURIComponent(productImage)}`;
            
            // Navigate to the product page
            window.location.href = productUrl;
        });
    });
});








































// Message functionality:

  // Handle payment method selection
  document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        // Hide all payment details sections
        document.querySelectorAll('.card-details, .bank-select, .upi-section, .emi-select').forEach(el => {
            el.style.display = 'none';
        });

        // Show relevant section based on selection
        switch(this.value) {
            case 'card':
                this.closest('.payment-option').querySelector('.card-details').style.display = 'block';
                break;
            case 'netbanking':
                this.closest('.payment-option').querySelector('.bank-select').style.display = 'block';
                break;
            case 'upi':
                this.closest('.payment-option').querySelector('.upi-section').style.display = 'block';
                break;
            case 'emi':
                this.closest('.payment-option').querySelector('.emi-select').style.display = 'block';
                break;
        }
    });
});

// Handle form submission
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get cart items and customer details from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const customerDetails = JSON.parse(localStorage.getItem('customerDetails')) || {};
    
    // Calculate total
    let total = 0;
    cartItems.forEach(item => {
        total += item.price * item.quantity;
    });
    total += 50; // Add shipping cost
    
    // Format phone number (remove any non-digit characters)
    let formattedPhone = customerDetails.phone.replace(/\D/g, '');
    
    // If number doesn't start with country code, add it
    if (!formattedPhone.startsWith('91')) {
        formattedPhone = '91' + formattedPhone;
    }
    
    // Calculate total of all items
let subtotal = 0;
cartItems.forEach(item => {
    subtotal += item.price * item.quantity;
});

// Add shipping charge to get final total
const shippingCharge = 50;
const finalTotal = subtotal + shippingCharge;

// // Create order details message
// let orderDetails = '';
// cartItems.forEach(item => {
//     orderDetails += `${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}\n`;
// });

// // Create WhatsApp message
// const message = `🛍️ *New Order Placed!*\n\n*Customer Name:* ${customerDetails.name}\n*Order Details:*\n${orderDetails}\n*Shipping:* ₹${shippingCharge.toFixed(2)}\n*Total Amount:* ₹${finalTotal.toFixed(2)}\n*Phone:* +91${customerDetails.phone}\n\nThank you for shopping with RIOS! Your order has been confirmed and will be processed soon.\n\nFor any queries, please contact our support team.`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and customer details
    localStorage.removeItem('cartItems');
    localStorage.removeItem('customerDetails');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
});

// Handle UPI ID verification
document.querySelector('.verify-btn').addEventListener('click', function() {
    const upiId = document.querySelector('input[name="upi_id"]').value;
    // Add UPI verification logic here
    if (upiId.includes('@')) {
        alert('UPI ID verified successfully!');
    } else {
        alert('Invalid UPI ID format!');
    }
});

// Format card number with spaces
document.querySelector('input[name="card_number"]')?.addEventListener('input', function(e) {
    let value = this.value.replace(/\D/g, '');
    this.value = value;
});

// Format expiry date
document.querySelector('input[name="expiry"]')?.addEventListener('input', function(e) {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    this.value = value;
});