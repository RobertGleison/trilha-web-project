import { navigateTo } from "./router.js";



class BaseView {
    constructor() {}
    setTitle(title) { document.title = title; }
    async getHtml() { return await TemplateLoader.loadTemplate("base"); }
}



class HowToPlayView extends BaseView {
    constructor() {
        super();
        this.setTitle("How to Play");
    }
    async getHtml() { return await TemplateLoader.loadTemplate("how-to-play"); }
    async initialize() { addSPABackButton.addBackButtonListener.call(this); }
}



class RulesView extends BaseView {
    constructor() {
        super();
        this.setTitle("Rules");
    }
    async getHtml() { return await TemplateLoader.loadTemplate("rules"); }
    async initialize() { addSPABackButton.addBackButtonListener.call(this); }
}



class RankingView extends BaseView {
    constructor() {
        super();
        this.setTitle("Ranking");
    }
    async getHtml() { return await TemplateLoader.loadTemplate("ranking"); }
    loadRankings() {
        try {
            const rankings = JSON.parse(localStorage.getItem('gameRankings')) || [];
            const tbody = document.querySelector('.ranking-table tbody');
            
            if (!tbody) {
                console.error("Ranking table not found");
                return;
            }

            if (rankings.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">No games played yet</td>
                    </tr>`;
                return;
            }

            tbody.innerHTML = '';
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
        } catch (error) {
            console.error("Error loading rankings:", error);
            const tbody = document.querySelector('.ranking-table tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center;">Error loading rankings</td>
                    </tr>
                `;
            }
        }
    }

    initialize() {
        addSPABackButton.addBackButtonListener.call(this);
        this.loadRankings();
    }
}



class LoginView extends BaseView {
    constructor() {
        super();
        this.setTitle("Login");
    }
    async getHtml() { return await TemplateLoader.loadTemplate("login"); }

    handleSubmit(e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username && password) {
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", username);
            navigateTo("/");
        }
    }

    async initialize() {
        const form = document.getElementById("authForm");
        if (form) {
            form.addEventListener("submit", this.handleSubmit);
        }
    }

    // Cleans up event listeners when the view is destroyed.
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
    async getHtml() { return await TemplateLoader.loadTemplate("game-setup"); }
    
    // Handles game form options
    async initialize() {
        const gameModeSelect = document.getElementById("gameMode");

        if (gameModeSelect) {
            gameModeSelect.addEventListener("change", (e) => {
                const difficultyGroup = document.getElementById("difficultyGroup");
                difficultyGroup.style.display =
                    e.target.value === "pvc" ? "flex" : "none";
            });
        }

        const gameSetupForm = document.getElementById("gameSetupForm");
        if (gameSetupForm) {
            gameSetupForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                const gameSettings = {
                    gameMode: document.getElementById("gameMode").value,
                    difficulty: document.getElementById("difficulty").value,
                    boardSize: document.getElementById("boardSize").value,
                    firstPlayer: document.getElementById("firstPlayer").value,
                };

                sessionStorage.setItem("gameSettings", JSON.stringify(gameSettings));
                navigateTo("/game");
            });
        }

        addSPABackButton.addBackButtonListener.call(this);
    }
}



class GameRunnerView extends BaseView {
    constructor() {
        super();
        this.setTitle("Nine Men's Morris");
    }
    async getHtml() { return await TemplateLoader.loadTemplate("game"); }
    async initialize() {
        try {
            const boardElement = document.getElementById("board");
            if (!boardElement) {
                console.error("Board element not found");
                return;
            }

            const gameSettings = JSON.parse(
                sessionStorage.getItem("gameSettings") || "{}"
            );

            const exitBtn = document.getElementById("exit-btn");
            if (exitBtn) {
                exitBtn.addEventListener("click", async (e) => {
                    e.preventDefault();
                    sessionStorage.removeItem("gameSettings");
                    navigateTo("/");
                });
            }

            if (typeof window.Board.run_game === "function") {
                await window.Board.run_game(gameSettings);
            } else {
                console.error("run_game function not found in board module");
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
    async getHtml() { return await TemplateLoader.loadTemplate('404'); }
    initialize() {
        const homeBtn = document.getElementById("homeBtn");
        const backBtn = document.getElementById("backBtn");

        if (homeBtn) {
            homeBtn.addEventListener("click", () => {
                navigateTo("/");
            });
        }

        if (backBtn) {
            backBtn.addEventListener("click", () => {
                window.history.back();
            });
        }
    }

    // Cleans up event listeners when the view is destroyed.
    cleanup() {
        const homeBtn = document.getElementById("homeBtn");
        const backBtn = document.getElementById("backBtn");

        homeBtn?.removeEventListener("click", this.handleHomeClick);
        backBtn?.removeEventListener("click", this.handleBackClick);
    }
}



/**
 * Utility class for loading HTML templates.
 */
class TemplateLoader {
    /**
     * Loads a template file by name.
     */
    static async loadTemplate(name) {
        try {
            const response = await fetch(`/templates/${name}.html`);
            if (!response.ok) { 
                throw new Error(`Failed to load template: ${name}`); 
            }
            return await response.text();
        } catch (error) {
            console.error("Template loading error:", error);
            return "";
        }
    }
}



/**
 * Utility object for adding back button functionality to views.
 */
const addSPABackButton = {
    addBackButtonListener() {
        const backBtn = document.getElementById("backBtn");
        if (backBtn) {
            backBtn.addEventListener("click", (e) => {
                e.preventDefault();
                navigateTo("/");
            });
        }
    }
};



export {
    BaseView,
    RulesView,
    GameView,
    HowToPlayView,
    RankingView,
    GameRunnerView,
    LoginView,
    NotFoundView,
};