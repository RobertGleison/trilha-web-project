document.getElementById('authForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Here you would typically make an API call to verify credentials
    // For this example, we'll just simulate authentication
    if (username && password) {
        // Store auth state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        
        // Redirect to main menu
        window.location.href = 'main-menu.html';
    }
});

// Check if user is already authenticated
window.addEventListener('load', function() {
    if (localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'main-menu.html';
    }
});
