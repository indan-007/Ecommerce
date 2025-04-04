document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.querySelector('.signup');

    signupButton.addEventListener('click', () => {
        const name = document.querySelector('.name1').value;
        const email = document.querySelector('.google').value;
        const mobile = document.querySelector('.mobile').value;

        // Basic validation to check if all fields are filled
        if (!name || !email || !mobile) {
            displayError('Please fill in all fields.');
            return;
        }

        // Check if email contains '@' and further characters
        if (!email.includes('@') || email.indexOf('@') === email.length - 1) {
            displayError('Please enter a valid email address.');
            return;
        }

        // Check if mobile number has at least 10 digits
        if (mobile.length < 10) {
            displayError('Mobile number must be at least 10 digits long.');
            return;
        }

        // Store credentials in local storage
        localStorage.setItem('name', name);
        localStorage.setItem('email', email);
        localStorage.setItem('mobile', mobile);

        // Confirm successful sign-up and redirect to a login page
        alert('Sign up successful! Your credentials have been saved.');
        window.location.href = 'Login.html'; 
        // Redirect to login page
    });

    function displayError(message) {
        // Display the error message in a specific place on the page
        let errorDiv = document.querySelector('.error-message');
        
        // If there's no error message element, create it
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
            errorDiv.style.backgroundColor = "transparent";
            document.querySelector('.Google').appendChild(errorDiv);
        }

        // Set the error message text
        errorDiv.textContent = message;
    }
});
