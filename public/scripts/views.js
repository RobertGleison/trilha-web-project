import { navigateTo } from "./router.js";

class BaseView {
  constructor() {}

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return `
             <div class="home">
                <h1>Nine Men's Morris</h1>
                <img 
                    src="assets/logo.jpg" 
                    alt="Nine Men's Morris Logo"
                    class="logo-image"
                />
            </div>
        `;
  }
}

const WithBackButton = {
  addBackButtonListener() {
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("/");
      });
    }
  },
};

class LoginView extends BaseView {
    constructor(){
        super();
        this.setTitle("Login");
    }

    async getHtml() {
        return `
        <div class="auth-container">
                <h1>Nine Men's Morris</h1>
                <form id="authForm" class="auth-form">
                    <input type="text" id="username" placeholder="Username" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit" class="login-button">Login</button>
                    <button type="submit" class="login-button">Register</button>
                </form>
            </div>
        
        `
    };

    initialize() {
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('username', username);
                navigateTo('/');  // Use navigateTo instead of this.router.navigate
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



class HowToPlayView extends BaseView {
  constructor() {
    super();
    this.setTitle("How to Play");
  }

  async getHtml() {
    return `
            <div class="content-container">
                <h2 class="content-title">How to Play</h2>
                
                <div class="content-section">
                    <h3>Game Interface</h3>
                    <ul>
                        <li>Available positions where you can place or move pieces are highlighted in <span class="highlight-green">green</span></li>
                        <li>Your pieces are displayed in <span class="highlight-black">black</span>, opponent's pieces in <span class="highlight-white">white</span></li>
                        <li>Current player's turn is shown at the top of the board</li>
                    </ul>
                </div>

                <div class="content-section">
                    <h3>Placing Pieces (Phase 1)</h3>
                    <ul>
                        <li>To place a piece: Click any green highlighted position on the board</li>
                        <li>You'll start with 9 pieces to place</li>
                        <li>Take turns with your opponent placing pieces</li>
                        <li>The placement phase ends when all 18 pieces are on the board</li>
                    </ul>
                </div>

                <div class="content-section">
                    <h3>Moving Pieces (Phase 2)</h3>
                    <ul>
                        <li>To move a piece:
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
                        <li>When you form a mill (three pieces in a row):
                            <ol>
                                <li>Opponent's pieces that can be removed will be highlighted in <span class="highlight-red">red</span></li>
                                <li>Click any highlighted opponent's piece to remove it</li>
                            </ol>
                        </li>
                        <li>You must remove a piece when you form a mill</li>
                    </ul>
                </div>

                <div class="content-section">
                    <h3>Flying Pieces (Late Game)</h3>
                    <ul>
                        <li>When you only have 3 pieces left:
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
                        <li>Use the "Undo" button to take back your last move (when available)</li>
                        <li>The "Restart" button begins a new game</li>
                        <li>Game status and messages appear above the board</li>
                    </ul>
                </div>
                <div class="button-group">
                        <button type="button" id="backBtn">Back</button>
                </div>
            </div>
        `;
  }

  initialize() {
    WithBackButton.addBackButtonListener.call(this);
  }
}

class RulesView extends BaseView {
  constructor() {
    super();
    this.setTitle("Rules");
  }

  async getHtml() {
    return `
            <div class="content-container">
                <h2 class="content-title">Game Rules</h2>

                <div class="content-section">
                    <h3>Game Overview</h3>
                    <p>Nine Men's Morris is a strategic board game dating back to the Roman Empire. The game combines elements of positional strategy and piece capture mechanics.</p>
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
                        <li>Cannot remove pieces that are part of a mill unless no other option exists</li>
                        <li>When reduced to three pieces, that player's pieces can "fly" to any empty spot</li>
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
        `;
  }

  initialize() {
    WithBackButton.addBackButtonListener.call(this);
  }
}

class GameView extends BaseView {
  constructor() {
    super();
    this.setTitle("Game");
  }

  async getHtml() {
    return `
            <div class="setup-container">
                <h2 id="gameSetupTitle">Game Setup</h2>
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
                            <option value="2">Tiny</option>
                            <option value="3">Standard</option>
                            <option value="4">Large</option>
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
    // Game mode change handler
    const gameModeSelect = document.getElementById("gameMode");
    if (gameModeSelect) {
      gameModeSelect.addEventListener("change", (e) => {
        const difficultyGroup = document.getElementById("difficultyGroup");
        difficultyGroup.style.display =
          e.target.value === "pvc" ? "flex" : "none";
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

        // Store settings in sessionStorage
        sessionStorage.setItem("gameSettings", JSON.stringify(gameSettings));

        // Navigate to game page
        navigateTo("/game");
      });
    }

    WithBackButton.addBackButtonListener.call(this);
  }
}

class GameRunnerView extends BaseView {
  constructor() {
    super();
    this.setTitle("Nine Men's Morris");
  }

  async getHtml() {
    return `
            <div class="game-container">
    
    <div class="game-info">
      <span id="current-player">Current Turn: White</span>
      <span id="game-message">Game in progress - White to move</span>
      <button id="exit-btn">Exit Game</button>
    </div>

    <div id="game-screen">
      <div class="piece-container" id="red-pieces">
      Red Pieces
      </div>
      <div id="board">
      </div>
      <div class="piece-container" id="black-pieces"> 
      Black Pieces
      </div>
    </div>
  </div>
        `;
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

      // Import board module
      const boardModule = await import("./board.js");

      // Add event listeners
      const exitBtn = document.getElementById("exit-btn");
      if (exitBtn) {
        exitBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          boardModule.cleanup();
          sessionStorage.removeItem("gameSettings");
          navigateTo("/");
        });
      }

      // Initial game start
      if (typeof boardModule.run_game === "function") {
        await boardModule.run_game(gameSettings);
      } else {
        console.error("run_game function not found in board module");
      }
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  }
}

class RankingView extends BaseView {
  constructor() {
    super();
    this.setTitle("Ranking");
  }

  async getHtml() {
    return `
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
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Example rows (will be replaced with dynamic data) -->
                            <tr>
                                <td><span class="rank rank-1">1</span></td>
                                <td>Player 1</td>
                                <td>7</td>
                                <td>vs AI</td>
                                <td>Hard</td>
                            </tr>
                            <tr>
                                <td><span class="rank rank-2">2</span></td>
                                <td>Player 2</td>
                                <td>5</td>
                                <td>vs Player</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td><span class="rank rank-3">3</span></td>
                                <td>AI</td>
                                <td>6</td>
                                <td>vs AI</td>
                                <td>Medium</td>
                            </tr>
                            <tr>
                                <td><span class="rank rank-4">4</span></td>
                                <td>AI</td>
                                <td>6</td>
                                <td>vs AI</td>
                                <td>Medium</td>
                            </tr>
                            <tr>
                                <td><span class="rank rank-5">5</span></td>
                                <td>AI</td>
                                <td>6</td>
                                <td>vs AI</td>
                                <td>Medium</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="button-group">
                        <button type="button" id="backBtn">Back</button>
                </div>
            </div>
        `;
  }
  initialize() {
    WithBackButton.addBackButtonListener.call(this);
  }
}

export {
  BaseView,
  RulesView,
  GameView,
  HowToPlayView,
  RankingView,
  GameRunnerView,
  LoginView
};
