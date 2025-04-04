document.addEventListener('DOMContentLoaded', () => {
    const toggle_btn = document.querySelector('#checkbox');
    const body = document.body;
    
    // Check for saved user preference
    const darkMode = localStorage.getItem('dark-mode');
    
    // Apply saved preference
    if (darkMode === 'enabled') {
        body.classList.add('dark-mode');
        if (toggle_btn) {
            toggle_btn.checked = true;
        }
    }

    // Handle toggle changes
    if (toggle_btn) {
        toggle_btn.addEventListener('change', () => {
            if (toggle_btn.checked) {
                body.classList.add('dark-mode');
                localStorage.setItem('dark-mode', 'enabled');
            } else {
                body.classList.remove('dark-mode');
                localStorage.setItem('dark-mode', 'disabled');
            }
        });
    }
}); 