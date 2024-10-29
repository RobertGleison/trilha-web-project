// Check authentication on page load
window.addEventListener('load', function() {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'index.html';
    }
});

function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}
