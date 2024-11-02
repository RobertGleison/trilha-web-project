// First, wrap the board creation code in a function that waits for the container
function initializeGame() {
    const board = document.getElementById('board');
    if (!board) {
        console.error('Board element not found');
        return;
    }

    function createSquares(n) {
        const initialSize = 125;
        const sizeIncrement = 125;
        var game_list = [];
        
        for (let i = 0; i < n; i++) {
            const size = initialSize + i * sizeIncrement;
            const square = document.createElement('div');
            square.classList.add('square');
            square.style.width = `${size}px`;
            square.style.height = `${size}px`;
            square.style.left = `calc(50% - ${size / 2}px)`;
            square.style.top = `calc(50% - ${size / 2}px)`;
            
            function createButton(i, x, y) {
                const button = document.createElement('div');
                button.id = i.toString().concat(x.toString().concat(y.toString()));
                button.classList.add('button');
                button.style.left = `${x}px`;
                button.style.top = `${y}px`;
                square.appendChild(button);
                button.addEventListener('click', selectTile);
            }
            
            const halfSize = size / 2;
            createButton(i, 0, 0);
            createButton(i, size, 0);
            createButton(i, 0, size);
            createButton(i, size, size);
            createButton(i, halfSize, 0);
            createButton(i, halfSize, size);
            createButton(i, 0, halfSize);
            createButton(i, size, halfSize);
            
            board.appendChild(square);
            game_list.push(['empty','empty','empty','empty','empty','empty','empty','empty']);
        }
    }

    function setupPieces(playerId, pieceImage, count) {
        const container = document.getElementById(playerId);
        if (!container) {
            console.error(`Container ${playerId} not found`);
            return;
        }
        
        for (let i = 0; i < count; i++) {
            const piece = document.createElement("img");
            piece.src = pieceImage;
            piece.classList.add("piece");
            
            piece.onerror = () => {
                console.error(`Failed to load image: ${pieceImage}`);
                const fallbackPiece = document.createElement('div');
                fallbackPiece.classList.add('piece');
                fallbackPiece.style.backgroundColor = playerId === 'red-pieces' ? 'red' : 'black';
                fallbackPiece.style.borderRadius = '50%';
                container.replaceChild(fallbackPiece, piece);
            };
            
            container.appendChild(piece);
        }
    }

    function selectTile() {
        console.log(this.id);
    }

    // Initialize the game with the specified size
    const n = 4;
    createSquares(n);
    const numPieces = 3 * n;
    setupPieces("red-pieces", "assets/red_piece.png", numPieces);
    setupPieces("black-pieces", "assets/black_piece.png", numPieces);
}

// Export the initialization function
window.initializeGame = initializeGame;