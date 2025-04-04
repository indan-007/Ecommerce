// Authentication JavaScript

// DOM Elements
const messageDiv = document.getElementById('message');

// Password Strength Meter
if (document.getElementById('password')) {
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.querySelector('.strength-meter');
    const strengthText = document.querySelector('.strength-text');

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        
        // Remove all classes
        strengthMeter.classList.remove('weak', 'medium', 'strong');
        
        if (password.length > 0) {
            strengthMeter.classList.add(strength);
            
            if (strength === 'weak') {
                strengthText.textContent = 'Weak password';
            } else if (strength === 'medium') {
                strengthText.textContent = 'Medium password';
            } else {
                strengthText.textContent = 'Strong password';
            }
        } else {
            strengthText.textContent = 'Password strength';
        }
    });
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    // If password length is less than 6 - weak
    if (password.length < 6) {
        return 'weak';
    }
    
    // If password length is greater than 8 - add 1 point
    if (password.length > 8) {
        strength += 1;
    }
    
    // If password contains lowercase and uppercase characters - add 1 point
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        strength += 1;
    }
    
    // If password has numbers - add 1 point
    if (password.match(/([0-9])/)) {
        strength += 1;
    }
    
    // If password has special characters - add 1 point
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
        strength += 1;
    }
    
    // Return strength - 2 or less is weak, 3 is medium, 4 or more is strong
    if (strength <= 2) {
        return 'weak';
    } else if (strength === 3) {
        return 'medium';
    } else {
        return 'strong';
    }
}

// Signup Form
if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phoneNumber = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const address = document.getElementById('address').value;
        
        // Validate passwords
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        // Check password strength
        const strength = checkPasswordStrength(password);
        if (strength === 'weak') {
            showMessage('Please use a stronger password', 'error');
            return;
        }
        
        // Create user data object
        const userData = {
            full_name: fullName,
            username: username,
            email: email,
            phone_number: phoneNumber,
            password: password,
            address: address
        };
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Account created successfully! Please check your email for verification.', 'success');
                
                // Clear form
                signupForm.reset();
                
                // Redirect to verification page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'email-verification.html?email=' + encodeURIComponent(email);
                }, 2000);
            } else {
                showMessage(data.message || 'Error creating account', 'error');
            }
        } catch (error) {
            showMessage('Error connecting to server', 'error');
        }
    });
}

// Login Form
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;
        
        const loginData = {
            username: username,
            password: password,
            remember: remember
        };
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Login successful!', 'success');
                
                // Store auth token
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin/index.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                showMessage(data.message || 'Invalid credentials', 'error');
            }
        } catch (error) {
            showMessage('Error connecting to server', 'error');
        }
    });
}

// Forgot Password Form
if (document.getElementById('forgotPasswordForm')) {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const verificationSection = document.getElementById('verificationSection');
    
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Verification code sent to your email!', 'success');
                
                // Hide forgot password form and show verification section
                forgotPasswordForm.style.display = 'none';
                verificationSection.style.display = 'block';
            } else {
                showMessage(data.message || 'Email not found', 'error');
            }
        } catch (error) {
            showMessage('Error connecting to server', 'error');
        }
    });
    
    // Verify code and reset password
    if (document.getElementById('verifyCodeForm')) {
        const verifyCodeForm = document.getElementById('verifyCodeForm');
        
        verifyCodeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const code = document.getElementById('verificationCode').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            if (newPassword !== confirmNewPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        code,
                        new_password: newPassword
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('Password reset successful!', 'success');
                    
                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage(data.message || 'Invalid verification code', 'error');
                }
            } catch (error) {
                showMessage('Error connecting to server', 'error');
            }
        });
    }
}

// Helper function to show messages
function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    
    // Auto-clear message after 5 seconds
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 5000);
} 