import { navigateTo } from "./router.js";



class BaseView {
    constructor() {}
    setTitle(title) { document.title = title;}
    async getHtml() { return await TemplateLoader.loadTemplate("base"); }
  }



class HowToPlayView extends BaseView {
    constructor() {
        super();
        this.setTitle("How to Play");
    }
    async getHtml() { return await TemplateLoader.loadTemplate("how-to-play"); }
    async initialize() { addSPABackButton.addBackButtonListener.call(this); }}



class RulesView extends BaseView {
    constructor() {
        super();
        this.setTitle("Rules");
    }

    async getHtml() { return await TemplateLoader.loadTemplate("rules"); }
    async initialize() { addSPABackButton.addBackButtonListener.call(this); }}



class RankingView extends BaseView {
    constructor() {
        super();
        this.setTitle("Ranking");
    }
    
    async getHtml() { return await TemplateLoader.loadTemplate("ranking"); }
    initialize() { addSPABackButton.addBackButtonListener.call(this); }}    



class LoginView extends BaseView {
    constructor() {
        super();
        this.setTitle("Login");
    }

    async getHtml() { return await TemplateLoader.loadTemplate("login"); }
    async initialize() {
        document.getElementById("authForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (username && password) {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("username", username);
                navigateTo("/"); // Use navigateTo instead of this.router.navigate
            }
        });
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

    async getHtml() { return await TemplateLoader.loadTemplate("game-setup"); }
    async initialize() {
        const gameModeSelect = document.getElementById("gameMode");

        // Add  AI difficulty option in form
        if (gameModeSelect) {
        gameModeSelect.addEventListener("change", (e) => {
            const difficultyGroup = document.getElementById("difficultyGroup");
            difficultyGroup.style.display =
            e.target.value === "pvc" ? "flex" : "none";
        });}

        
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

        addSPABackButton.addBackButtonListener.call(this);}}



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
        if (typeof boardModule.run_game === "function") { await boardModule.run_game(gameSettings); } 
        else { console.error("run_game function not found in board module"); }
        } 
        
        catch (error) {
        console.error("Error initializing game:", error);
        }
    }}




class TemplateLoader {
    static async loadTemplate(name) {
        try {
            const response = await fetch(`/templates/${name}.html`);
            if (!response.ok) { throw new Error(`Failed to load template: ${name}`); }
        return await response.text();
    } 
    
    catch (error) {
        console.error("Template loading error:", error);
        return "";
    }}}



const addSPABackButton = {
    addBackButtonListener() {
        const backBtn = document.getElementById("backBtn");
        if (backBtn) {
            backBtn.addEventListener("click", (e) => {
            e.preventDefault();
            navigateTo("/");
        });}},};


export {
  BaseView,
  RulesView,
  GameView,
  HowToPlayView,
  RankingView,
  GameRunnerView,
  LoginView,
};
