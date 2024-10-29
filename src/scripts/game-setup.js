// Check authentication
window.addEventListener('load', function() {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'index.html';
    }

    // Show/hide AI difficulty based on game mode
    document.getElementById('gameMode').addEventListener('change', function(e) {
        const difficultyGroup = document.getElementById('difficultyGroup');
        difficultyGroup.style.display = e.target.value === 'pvc' ? 'flex' : 'none';
    });
});

document.getElementById('gameSetupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect game settings
    const gameSettings = {
        gameMode: document.getElementById('gameMode').value,
        difficulty: document.getElementById('difficulty').value,
        boardSize: document.getElementById('boardSize').value,
        firstPlayer: document.getElementById('firstPlayer').value
    };
    
    // Store game settings
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
    
    // Redirect to game page
    window.location.href = 'game.html';
});
