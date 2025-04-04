document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.signup'); // The button for logging in

    loginButton.addEventListener('click', () => {
        const email = document.querySelector('.google').value;
        const mobile = document.querySelector('.mobile').value;

        // Retrieve stored credentials from localStorage
        const storedEmail = localStorage.getItem('email');
        const storedMobile = localStorage.getItem('mobile');

        // Basic validation to check if fields are filled
        if (!email || !mobile) {
            displayError('Please fill in both fields.');
            return;
        }

        // If there are no stored credentials, suggest sign-up
        if (!storedEmail || !storedMobile) {
            displayError('No account found. Please sign up first.');
            return;
        }

        // Check if entered credentials match stored credentials
        if (email === storedEmail && mobile === storedMobile) {
            // Credentials are correct, redirect to home page
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect to home page
        } else {
            // Credentials are incorrect
            displayError('Incorrect email or mobile number. Please try again.');
        }
    });

    function displayError(message) {
        // Remove any previous error message
        clearErrorMessage();

        // Display the error message in a specific place on the page
        let errorDiv = document.querySelector('.error-message');
        
        // If there's no error message element, create it
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            errorDiv.style.color = 'red';
            errorDiv.style.backgroundColor = "transparent";
            errorDiv.style.marginTop = '10px';
            document.querySelector('.Google').appendChild(errorDiv);
        }

        // Set the error message text
        errorDiv.textContent = message;
    }

    function clearErrorMessage() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove(); // Remove previous error messages
        }
    }
});