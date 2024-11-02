class View {
    constructor() {
        this.router = null;
    }

    setRouter(router) {
        this.router = router;
    }

    render() {
        return '';
    }

    cleanup() {
        // Override this method to clean up event listeners, etc.
    }
}

class LoginView extends View {
    render() {
        return `
            <div class="auth-container">
                <h1>Nine Men's Morris</h1>
                <form id="authForm" class="auth-form">
                    <input type="text" id="username" placeholder="Username" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        `;
    }

    initialize() {
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('username', username);
                this.router.navigate('/menu');
            }
        });
    }

    cleanup() {
        const form = document.getElementById('authForm');
        if (form) {
            form.removeEventListener('submit', this.handleSubmit);
        }
    }
}

class MenuView extends View {
    render() {
        return `
            <div class="menu-container">
                <h1>Nine Men's Morris</h1>
                <nav class="main-menu">
                    <button id="newGameBtn">New Game</button>
                    <button id="rankingBtn">Ranking</button>
                    <button id="rulesBtn">Rules</button>
                    <button id="howToPlayBtn">How to Play</button>
                    <button id="logoutBtn" class="logout-btn">Logout</button>
                </nav>
            </div>
        `;
    }

    initialize() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.router.navigate('/new-game'));
        document.getElementById('rankingBtn').addEventListener('click', () => this.router.navigate('/ranking'));
        document.getElementById('rulesBtn').addEventListener('click', () => this.router.navigate('/rules'));
        document.getElementById('howToPlayBtn').addEventListener('click', () => this.router.navigate('/how-to-play'));
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
            this.router.navigate('/login');
        });
    }
}

class GameSetupView extends View {
    render() {
        return `
            <div class="setup-container">
                <h2>Game Setup</h2>
                <form id="gameSetupForm" class="setup-form">
                    <div class="form-group">
                        <label>Game Mode:</label>
                        <select id="gameMode">
                            <option value="pvp">Player vs Player</option>
                            <option value="pvc">Player vs Computer</option>
                        </select>
                    </div>

                    <div class="form-group" id="difficultyGroup" style="display: none;">
                        <label>AI Difficulty:</label>
                        <select id="difficulty">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Board Size:</label>
                        <select id="boardSize">
                            <option value="standard">Standard</option>
                            <option value="large">Large</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>First Player:</label>
                        <select id="firstPlayer">
                            <option value="player1">Player 1</option>
                            <option value="player2">Player 2/AI</option>
                        </select>
                    </div>

                    <div class="button-group">
                        <button type="submit">Play</button>
                        <button type="button" id="backBtn">Back</button>
                    </div>
                </form>
            </div>
        `;
    }

    initialize() {
        document.getElementById('gameMode').addEventListener('change', (e) => {
            const difficultyGroup = document.getElementById('difficultyGroup');
            difficultyGroup.style.display = e.target.value === 'pvc' ? 'flex' : 'none';
        });

        document.getElementById('gameSetupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const gameSettings = {
                gameMode: document.getElementById('gameMode').value,
                difficulty: document.getElementById('difficulty').value,
                boardSize: document.getElementById('boardSize').value,
                firstPlayer: document.getElementById('firstPlayer').value
            };
            localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
            this.router.navigate('/game');
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            this.router.navigate('/menu');
        });
    }
}

// Simple text-based views
class TextView extends View {
    constructor(title, content) {
        super();
        this.title = title;
        this.content = content;
    }

    render() {
        return `
            <div class="text-container">
                <h2>${this.title}</h2>
                <div class="content">${this.content}</div>
                <button id="backBtn">Back to Menu</button>
            </div>
        `;
    }

    initialize() {
        document.getElementById('backBtn').addEventListener('click', () => {
            this.router.navigate('/menu');
        });
    }
}

class NotFoundView extends View {
    render() {
        return `
            <div class="not-found">
                <h2>404 - Page Not Found</h2>
                <button id="backBtn">Back to Menu</button>
            </div>
        `;
    }

    initialize() {
        document.getElementById('backBtn').addEventListener('click', () => {
            this.router.navigate('/menu');
        });
    }
}


class GameView extends View {
    render() {
        return `
            <div class="game-container">
                <header>
                    <h1>Nine Man Morris</h1>
                    <button id="backToMenu">Back to Menu</button>
                </header>
                <div id="container">
                    <div class="piece-container" id="red-pieces"></div>
                    <div id="board"></div>
                    <div class="piece-container" id="black-pieces"></div>
                </div>
            </div>
        `;
    }

    initialize() {
        // Setup back button handler
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.router.navigate('/menu');
        });

        // Get game settings from localStorage
        const gameSettings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
        
        // Initialize the board
        this.initializeBoard(gameSettings);
    }

    initializeBoard(settings) {
        const n = settings.boardSize === 'large' ? 5 : 4; // 5 for large, 4 for standard
        this.createSquares(n);
        const numPieces = 3 * n;
        this.setupPieces("red-pieces", "../assets/red_piece.png", numPieces);
        this.setupPieces("black-pieces", "../assets/black_piece.png", numPieces);
    }

    createSquares(n) {
        const board = document.getElementById('board');
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

            const createButton = (i, x, y) => {
                const button = document.createElement('div');
                button.id = i.toString().concat(x.toString().concat(y.toString()));
                button.classList.add('button');
                button.style.left = `${x}px`;
                button.style.top = `${y}px`;
                square.appendChild(button);
                button.addEventListener('click', this.handleTileClick.bind(this));
            };

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
            game_list.push(['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty']);
        }
    }

    setupPieces(playerId, pieceImage, count) {
        const container = document.getElementById(playerId);
        for (let i = 0; i < count; i++) {
            const piece = document.createElement("img");
            piece.src = pieceImage;
            piece.classList.add("piece");
            container.appendChild(piece);
        }
    }

    handleTileClick(event) {
        console.log(event.target.id);
        // Add your game logic here
    }

    cleanup() {
        // Remove event listeners
        const backButton = document.getElementById('backToMenu');
        if (backButton) {
            backButton.removeEventListener('click', () => {});
        }

        // Clean up board buttons
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => {
            button.removeEventListener('click', this.handleTileClick);
        });
    }
}