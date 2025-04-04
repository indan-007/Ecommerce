// Navbar Authentication Logic

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isLoggedIn = !!authToken;
    
    // Find navbar element - support multiple possible selectors
    const navbar = document.querySelector('#navbar, .navbar, nav ul');
    
    if (navbar) {
        // Create the auth elements
        const authElement = document.createElement('li');
        authElement.className = 'nav-auth';
        
        if (isLoggedIn) {
            // User is logged in - show user info and logout
            authElement.innerHTML = `
                <div class="user-menu">
                    <a href="#" class="user-trigger">
                        <i class="fas fa-user-circle"></i>
                        <span class="username">${user.username || 'User'}</span>
                    </a>
                    <div class="user-dropdown">
                        <a href="public/account.html">
                            <i class="fas fa-user"></i> My Account
                        </a>
                        ${user.role === 'admin' ? '<a href="public/admin/index.html"><i class="fas fa-cogs"></i> Admin Panel</a>' : ''}
                        <a href="#" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            `;
            
            // Add auth element to navbar
            navbar.appendChild(authElement);
            
            // Add logout functionality
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.reload();
            });
            
            // Toggle dropdown on mobile
            const userTrigger = document.querySelector('.user-trigger');
            if (userTrigger) {
                userTrigger.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelector('.user-menu').classList.toggle('active');
                });
            }
        } else {
            // User is not logged in - show login/signup buttons
            authElement.innerHTML = `
                <div class="auth-buttons">
                    <a href="public/login.html" class="login-btn">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                    <a href="public/signup.html" class="signup-btn">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </a>
                </div>
            `;
            
            // Add auth element to navbar
            navbar.appendChild(authElement);
        }
        
        // Add Font Awesome if not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }
    
    // Add click event listener to close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu && !userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
}); 