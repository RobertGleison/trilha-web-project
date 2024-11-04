export function initializeGameSetup() {
    const gameModeSelect = document.getElementById('gameMode');
    const difficultyGroup = document.getElementById('difficultyGroup');
    const gameSetupForm = document.getElementById('gameSetupForm');

    // Show/hide difficulty selection based on game mode
    gameModeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'pvc') {
            difficultyGroup.style.display = 'block';
        } else {
            difficultyGroup.style.display = 'none';
        }
    });

    // Handle form submission
    gameSetupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Gather form data
        const gameSettings = {
            gameMode: gameModeSelect.value,
            difficulty: document.getElementById('difficulty').value,
            boardSize: document.getElementById('boardSize').value,
            firstPlayer: document.getElementById('firstPlayer').value
        };

        // Store game settings in sessionStorage for access in the game
        sessionStorage.setItem('gameSettings', JSON.stringify(gameSettings));

        try {
            // Import the board.js module dynamically
            await import('./board.js');
            
            // Navigate to the game view
            window.navigateTo('/game');
        } catch (error) {
            console.error('Error loading board module:', error);
        }
    });

    // Initial check for game mode
    if (gameModeSelect.value === 'pvc') {
        difficultyGroup.style.display = 'block';
    }
}