
    // Check for saved user preference
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check if user previously enabled dark mode
    if (localStorage.getItem('darkMode') === 'enabled') {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
    }
    
    // Add event listener to toggle button
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        // Enable dark mode
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
      } else {
        // Disable dark mode
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
      }
    });