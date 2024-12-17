import { authService } from './auth.js';
import * as serverRequests from "./serverRequests.js" 
import { BoardUtils } from './board_utils.js';

window.Views = (function() {

    const GROUP = 24;
    let NICKNAME;
    let PASSWORD;

    class BaseView {
        constructor() {}
        setTitle(title) {
            document.title = title;
        }
        async getHtml() {
            return await window.TemplateLoader.loadTemplate("base");
        }
    }

    class HowToPlayView extends BaseView {
        constructor() {
            super();
            this.setTitle("How to Play");
        }
        async getHtml() {
            return await window.TemplateLoader.loadTemplate("how-to-play");
        }
        async initialize() {
            window.addSPABackButton.addBackButtonListener.call(this);
        }
    }

    class RulesView extends BaseView {
        constructor() {
            super();
            this.setTitle("Rules");
        }

        async getHtml() {
            return await window.TemplateLoader.loadTemplate("rules");
        }
        async initialize() {
            window.addSPABackButton.addBackButtonListener.call(this);
        }
    }

    class RankingView extends BaseView {
        constructor() {
            super();
            this.setTitle("Ranking");
            this.currentRankingType = 'local'; // Default to local ranking
        }
    
        async getHtml() {
            return await window.TemplateLoader.loadTemplate("ranking");
        }
    
        addRankingSelector() {
            const table = document.querySelector('.ranking-table');
            if (!table) return;
    
            // Create selector container
            const selectorContainer = document.createElement('div');
            selectorContainer.className = 'ranking-selector';
            selectorContainer.style.cssText = 'margin-bottom: 20px; text-align: center;';
    
            // Create select element
            const selector = document.createElement('select');
            selector.style.cssText = 'padding: 8px 16px; border-radius: 4px; border: 1px solid #ccc; font-size: 16px;';
            selector.innerHTML = `
                <option value="local">Local Ranking</option>
                <option value="online">Online Ranking</option>
            `;
    
            // Add event listener
            selector.addEventListener('change', (e) => {
                this.currentRankingType = e.target.value;
                if (this.currentRankingType === 'local') {
                    this.loadRankings();
                } else {
                    this.loadOnlineRankings();
                }
            });
    
            selectorContainer.appendChild(selector);
            table.parentNode.insertBefore(selectorContainer, table);
        }
    
        loadRankings() {
            try {
                const rankings = JSON.parse(localStorage.getItem('gameRankings')) || [];
                this.updateTable(rankings);
            } catch (error) {
                this.handleError("Error loading rankings:", error);
            }
        }
    
        loadOnlineRankings() {
            try {
                // Placeholder for online rankings
                // Replace this with your online rankings implementation
                const onlineRankings = []; // This should be replaced with actual online data
                this.updateTable(onlineRankings);
            } catch (error) {
                this.handleError("Error loading online rankings:", error);
            }
        }
    
        updateTable(rankings) {
            const tbody = document.querySelector('.ranking-table tbody');
            if (!tbody) {
                console.error("Ranking table not found");
                return;
            }
    
            if (rankings.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">No games played yet</td>
                    </tr>
                `;
                return;
            }
    
            tbody.innerHTML = ''; // Clear existing rows
            rankings.forEach((ranking, index) => {
                const row = `
                    <tr>
                        <td><span class="rank rank-${index + 1}">${index + 1}</span></td>
                        <td>${ranking.winner}</td>
                        <td>${ranking.piecesLeft}</td>
                        <td>${ranking.gameMode}</td>
                        <td>${ranking.aiDifficulty}</td>
                        <td>${ranking.score}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    
        handleError(message, error) {
            console.error(message, error);
            const tbody = document.querySelector('.ranking-table tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">Error loading rankings</td>
                    </tr>
                `;
            }
        }
    
        initialize() {
            window.addSPABackButton.addBackButtonListener.call(this);
            this.addRankingSelector();
            this.loadRankings(); // Load local rankings by default
        }
    }

    class LoginView extends BaseView {
        constructor() {
            super();
            this.setTitle("Login");
            this.handleSubmit = this.handleSubmit.bind(this);  // Bind the handler
        }
    
        async getHtml() {
            return await window.TemplateLoader.loadTemplate("login");
        }
    
        async handleSubmit(e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            sessionStorage.setItem("nickname", username);
            sessionStorage.setItem("password", password);
            NICKNAME = sessionStorage.getItem("nickname");
            PASSWORD = sessionStorage.getItem("password");
    
            if (!username || !password) {
                alert("Please enter both username and password");
                return;
            }
    
            try {
                await authService.register(username, password);
                localStorage.setItem('isAuthenticated', 'true')
                authService.setAuth(true);
                alert("Login successful!");
                window.Router.navigateTo("#");  
            } catch (error) {
                alert(`Login failed: ${error.message}`);
                console.error('Login error:', error);
            }
        }
    
        async initialize() {
            const form = document.getElementById("authForm");
            if (form) {
                form.addEventListener("submit", this.handleSubmit);
            }
        }
    
        cleanup() {
            const form = document.getElementById("authForm");
            if (form) {
                form.removeEventListener("submit", this.handleSubmit);
            }
        }
    }

    class GameView extends BaseView {
        constructor() {
            super();
            this.setTitle("Game");
        }

        async getHtml() {
            return await window.TemplateLoader.loadTemplate("game-setup");
        }
        async initialize() {
            const gameModeSelect = document.getElementById("gameMode");

            // Add AI difficulty option in form
            if (gameModeSelect) {
                gameModeSelect.addEventListener("change", (e) => {
                    const difficultyGroup = document.getElementById("difficultyGroup");
                    difficultyGroup.style.display =
                        e.target.value === "pvc" ? "flex" : "none";
                });
            }

            if (gameModeSelect) {
                gameModeSelect.addEventListener("change", (e) => {
                    const firstPlayer = document.getElementById("firstPlayer");
                    firstPlayer.style.display =
                        e.target.value === "pvpo" ? "none" : "flex";
                });
            }

            // Form submission handler
            const gameSetupForm = document.getElementById("gameSetupForm");
            if (gameSetupForm) {
                gameSetupForm.addEventListener("submit", async (e) => {
                    e.preventDefault();

                    // Collect form data
                    const gameSettings = {
                        gameMode: document.getElementById("gameMode").value,
                        difficulty: document.getElementById("difficulty").value,
                        boardSize: document.getElementById("boardSize").value,
                        firstPlayer: document.getElementById("firstPlayer").value,
                    };
                    localStorage.setItem("boardSize", document.getElementById("boardSize").value )
                    console.log(localStorage.getItem("boardSize"))

                    // Store settings in sessionStorage
                    sessionStorage.setItem("gameSettings", JSON.stringify(gameSettings));
                    
                    console.log("gameMode = " + gameSettings.gameMode)

                    if (gameSettings.gameMode === "pvpo"){
                        try {
                            const gameCode = await serverRequests.requestJoin(GROUP, NICKNAME, PASSWORD, gameSettings.boardSize);
                            sessionStorage.setItem("game", gameCode.game)
                            console.log("Entrei no jogo online");
                            window.Router.navigateTo("#game-online");
                        }
                        catch(error) { console.log("Error in join method", error) }
                    }    
                    else {
                        console.log("Entrei no jogo local");
                        window.Router.navigateTo("#game");}
                });
            }

            window.addSPABackButton.addBackButtonListener.call(this);
        }
    }

    class GameRunnerView extends BaseView {
        constructor() {
            super();
            this.setTitle("Nine Men's Morris");
        }

        async getHtml() {
            return await window.TemplateLoader.loadTemplate("game");
        }
        async initialize() {
            try {
                const boardElement = document.getElementById("board");
                if (!boardElement) {
                    console.error("Board element not found");
                    return;
                }

                // Get game settings from sessionStorage
                const gameSettings = JSON.parse(
                    sessionStorage.getItem("gameSettings") || "{}"
                );

                // Add event listeners
                const exitBtn = document.getElementById("exit-btn");
                if (exitBtn) {
                    exitBtn.addEventListener("click", async (e) => {
                        e.preventDefault();
                        window.Router.navigateTo("#");
                    });
                }

                // Initial game start
                if (typeof window.Board.run_game === "function") {
                
                
                    if (gameSettings === null) console.log("gameSettings is null");
    
                    console.log(gameSettings.boardSize);
                    console.log(gameSettings.gameMode);
                    console.log(gameSettings.difficulty);
                    console.log(gameSettings.firstPlayer);
    
                    await window.Board.run_game(gameSettings);
    
                } else {
                    console.error("run_game function not found in board module");
                }
            } catch (error) {
                console.error("Error initializing game:", error);
            }
        }
    }

    class GameRunnerServerView extends BaseView {
        constructor() {
            super();
            this.setTitle("Nine Men's Morris");
        }

        async getHtml() {
            return await window.TemplateLoader.loadTemplate("game");
        }
        async initialize() {
            try {
                const boardUtils = new BoardUtils(serverRequests, NICKNAME, PASSWORD, null, null);
                console.log(localStorage.getItem("boardSize"))
                boardUtils.createSquares(localStorage.getItem("boardSize"))
                boardUtils.game_info = sessionStorage.getItem("game")

                const processCollectedData = serverRequests.processDataPeriodically((data) => {
                    boardUtils.redrawBoard(data.board);
                    if(data.turn != boardUtils.login){
                        console.log("sai aq")
                        console.log(data.turn, boardUtils.login)
                        return;  
                    }
                    boardUtils.removeGlowEffect();
                    console.log("Processed data:", data.board);
                    boardUtils.data = data;
                    if(data.phase == "move" || data.step == "from"){
                        addColorToOwnPieces(data)
                        console.log("estive aq")
                    }
                    else if(data.phase == "move" || data.step == "to"){
                        addColorToNeighbors(data);
                        console.log("estive aq tbm")
                    }
                    else if(data.phase == "move" || data.step == "take"){
                        
                    }
                });
                const boardElement = document.getElementById("board");
                if (!boardElement) {
                    console.error("Board element not found");
                    return;
                }

                const game = sessionStorage.getItem("game")

                // Get game settings from sessionStorage
                const gameSettings = JSON.parse(
                    sessionStorage.getItem("gameSettings") || "{}"
                );

                serverRequests.requestUpdate(
                    sessionStorage.getItem("game"),
                    NICKNAME, 
                    serverRequests.processDataPeriodically(processCollectedData)
                )

                // Add event listeners
                const exitBtn = document.getElementById("exit-btn");
                if (exitBtn) {
                    exitBtn.addEventListener("click", async (e) => {
                        e.preventDefault();
                        sessionStorage.removeItem("gameSettings");
                        serverRequests.requestLeave(NICKNAME, PASSWORD, game);
                        sessionStorage.removeItem("game");
                        window.Router.navigateTo("#");
                    });
                }

            } catch (error) {
                console.error("Error initializing game:", error);
            }
        }
    }
    

    class NotFoundView extends BaseView {
        constructor() {
            super();
            this.setTitle("404 - Page Not Found");
        }

        async getHtml() {
            return await window.TemplateLoader.loadTemplate("404");
        }

        initialize() {
            const homeBtn = document.getElementById("homeBtn");
            const backBtn = document.getElementById("backBtn");

            if (homeBtn) {
                homeBtn.addEventListener("click", () => {
                    window.Router.navigateTo("#");
                });
            }

            if (backBtn) {
                backBtn.addEventListener("click", () => {
                    window.history.back();
                });
            }
        }

        cleanup() {
            const homeBtn = document.getElementById("homeBtn");
            const backBtn = document.getElementById("backBtn");

            homeBtn?.removeEventListener("click", this.handleHomeClick);
            backBtn?.removeEventListener("click", this.handleBackClick);
        }
    }

    // Return all view classes as part of the Views object
    return {
        BaseView,
        HowToPlayView,
        RulesView,
        RankingView,
        LoginView,
        GameView,
        GameRunnerView,
        GameRunnerServerView,
        NotFoundView
    };
})();

window.TemplateLoader = {
  templates : {
    "base": `
        <div class="home">
            <h1>Nine Men's Morris</h1>
            <img 
                src="assets/logo.jpg" 
                alt="Nine Men's Morris Logo"
                class="logo-image"
            />
        </div>
        `,
    "how-to-play": `
        <div class="content-container">
            <h2 class="content-title">How to Play</h2>

            <div class="content-section">
                <h3>Game Interface</h3>
                <ul>
                <li>
                    Available positions where you can place or move pieces are highlighted
                    in <span class="highlight-green">green</span>
                </li>
                <li>
                    Your pieces are displayed in <span class="highlight-black">black</span>,
                    opponent's pieces in <span class="highlight-white">white</span>
                </li>
                <li>Current player's turn is shown at the top of the board</li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Placing Pieces (Phase 1)</h3>
                <ul>
                <li>
                    To place a piece: Click any green highlighted position on the board
                </li>
                <li>You'll start with 9 pieces to place</li>
                <li>Take turns with your opponent placing pieces</li>
                <li>The placement phase ends when all 18 pieces are on the board</li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Moving Pieces (Phase 2)</h3>
                <ul>
                <li>
                    To move a piece:
                    <ol>
                    <li>First, click one of your pieces</li>
                    <li>Green highlights will show valid moves</li>
                    <li>Click a green position to complete your move</li>
                    </ol>
                </li>
                <li>You can only move to adjacent positions along the lines</li>
                <li>Click anywhere else to cancel your selection</li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Making Mills & Removing Pieces</h3>
                <ul>
                <li>
                    When you form a mill (three pieces in a row):
                    <ol>
                    <li>
                        Opponent's pieces that can be removed will be highlighted in
                        <span class="highlight-red">red</span>
                    </li>
                    <li>Click any highlighted opponent's piece to remove it</li>
                    </ol>
                </li>
                <li>You must remove a piece when you form a mill</li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Flying Pieces (Late Game)</h3>
                <ul>
                <li>
                    When you only have 3 pieces left:
                    <ol>
                    <li>Click one of your pieces</li>
                    <li>All empty positions will be highlighted in green</li>
                    <li>You can move to any green position, not just adjacent ones</li>
                    </ol>
                </li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Game Controls</h3>
                <ul>
                <li>
                    Use the "Undo" button to take back your last move (when available)
                </li>
                <li>The "Restart" button begins a new game</li>
                <li>Game status and messages appear above the board</li>
                </ul>
            </div>
            <div class="button-group">
                <button type="button" id="backBtn">Back</button>
            </div>
            </div>

        `,
    "rules": `
        <div class="content-container">
            <h2 class="content-title">Game Rules</h2>

            <div class="content-section">
                <h3>Game Overview</h3>
                <p>
                Nine Men's Morris is a strategic board game dating back to the Roman
                Empire. The game combines elements of positional strategy and piece
                capture mechanics.
                </p>
            </div>

            <div class="content-section">
                <h3>Game Components</h3>
                <ul>
                <li>A board with intersections connected by lines</li>
                <li>9 black pieces and 9 white pieces</li>
                <li>Mills are formed by placing three pieces in a row along the lines</li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Core Rules</h3>
                <ul>
                <li>Players take turns placing or moving pieces</li>
                <li>A mill allows removal of an opponent's piece</li>
                <li>
                    Cannot remove pieces that are part of a mill unless no other option
                    exists
                </li>
                <li>
                    When reduced to three pieces, that player's pieces can "fly" to any
                    empty spot
                </li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Winning Conditions</h3>
                <ul>
                <li>Reduce opponent to 2 pieces</li>
                <li>Block all opponent's pieces so they cannot make a legal move</li>
                </ul>
            </div>

            <div class="content-section">
                <h3>Additional Rules</h3>
                <ul>
                <li>Opening a mill and closing it again counts as a new mill</li>
                <li>Multiple mills can be formed in one move</li>
                <li>Only one piece can be removed per mill formed</li>
                <li>A player must move if possible, no passing turns</li>
                </ul>
            </div>
            <div class="button-group">
                <button type="button" id="backBtn">Back</button>
            </div>
            </div>

        `,
    "ranking": `
        <div class="content-container">
            <h2 class="content-title">Game History</h2>

            <div class="ranking-container">
                <table class="ranking-table">
                <thead>
                    <tr>
                    <th>Rank</th>
                    <th>Winner</th>
                    <th>Pieces Left</th>
                    <th>Game Mode</th>
                    <th>AI Difficulty</th>
                    <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                </table>
            </div>
            <div class="button-group">
                <button type="button" id="backBtn">Back</button>
            </div>
            </div>

        `,
        "login": `
        <div class="auth-container">
            <h1>Nine Men's Morris</h1>
            <form id="authForm" class="auth-form">
                <input type="text" id="username" placeholder="Username" required />
                <input type="password" id="password" placeholder="Password" required />
                <button type="submit" class="login-button">Login</button>
            </form>
        </div>
    `,
    "game-setup": `
        <div class="setup-container">
            <h2 id="gameSetupTitle">Game Setup</h2>
            <form id="gameSetupForm" class="setup-form">
                <div class="form-group">
                <label>Game Mode:</label>
                <select id="gameMode">
                    <option value="pvp">Player vs Player</option>
                    <option value="pvc">Player vs Computer</option>
                    <option value="pvpo">Player vs Player (Online)</option>
                </select>
                </div>
                <div class="form-group" id="difficultyGroup" style="display: none">
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
                    <option value="2">Tiny (2)</option>
                    <option value="3">Standard (3)</option>
                    <option value="4">Large (4)</option>
                </select>
                </div>
                <div class="form-group" id="firstPlayer">
                <label>First Player:</label>
                <select>
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
        `,
    "game": `
        <div class="game-container">
            <div class="game-info">
                <span id="current-player">Current Turn:</span>
                <span id="game-message">Game Started</span>
                <button id="exit-btn">Exit Game</button>
            </div>

            <div id="game-screen">
                <div class="piece-container" id="red-pieces">Red Pieces</div>
                <div id="board"></div>
                <div class="piece-container" id="black-pieces">Black Pieces</div>
            </div>
            </div>

        `,
    "404": `
        <!-- templates/404.html -->
            <div class="not-found-container">
                <h1>404</h1>
                <div class="not-found-content">
                    <h2>Page Not Found</h2>
                    <p>Oops! The page you're looking for does not exist.</p>
                    <p class="not-found-text">Let's get you back on track!</p>
                    <div class="button-group">
                        <button type="button" id="backBtn">Go Back</button>
                        <button type="button" id="homeBtn">Go Home</button>
                    </div>
                </div>
            </div>
        `,
  },

  async loadTemplate(name) {
    try {
      const template = this.templates[name];
      if (!template) {
        throw new Error(`Failed to load template: ${name}`);
      }
      return template;
    } catch (error) {
      console.error("Template loading error:", error);
      return "";
    }
  }
}

window.addSPABackButton = {
    addBackButtonListener() {
        const backBtn = document.getElementById("backBtn");
        if (backBtn) {
            backBtn.addEventListener("click", (e) => {
                e.preventDefault();
                window.Router.navigateTo("#");  // Changed from navigateTo to window.Router.navigateTo
            });
        }
    }
};
