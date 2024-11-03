// Define routes and their corresponding views
const routes = {
    '/login': {
        view: LoginView
    },
    '/menu': {
        view: MenuView
    },
    '/new-game': {
        view: GameSetupView
    },
    '/game': {
        view: GameView
    },
    '/ranking': {
        view: class extends TextView {
            constructor() {
                super('Ranking', `
                    <div class="ranking-list">
                        <h3>Top Players</h3>
                        <ol>
                            <li>Player 1 - 1200 points</li>
                            <li>Player 2 - 1150 points</li>
                            <li>Player 3 - 1100 points</li>
                        </ol>
                    </div>
                `);
            }
        }
    },
    '/rules': {
        view: class extends TextView {
            constructor() {
                super('Rules', `
                    <div class="rules">
                        <h3>Game Rules</h3>
                        <p>Nine Men's Morris is a strategy board game for two players...</p>
                        <!-- Add complete rules here -->
                    </div>
                `);
            }
        }
    },
    '/how-to-play': {
        view: class extends TextView {
            constructor() {
                super('How to Play', `
                    <div class="how-to-play">
                        <h3>Getting Started</h3>
                        <p>1. Each player starts with 9 pieces...</p>
                        <!-- Add complete instructions here -->
                    </div>
                `);
            }
        }
    },
    '/404': {
        view: NotFoundView
    }
};

// Initialize router with routes
const router = new Router(routes);