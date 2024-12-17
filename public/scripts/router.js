

window.Router = (function() {
    const routes = [
        { path: "#login", view: window.Views.LoginView },
        { path: "#", view: window.Views.BaseView },
        { path: "#rules", view: window.Views.RulesView },
        { path: "#game-setup", view: window.Views.GameView },
        { path: "#how-to-play", view: window.Views.HowToPlayView },
        { path: "#ranking", view: window.Views.RankingView },
        { path: "#game", view: window.Views.GameRunnerView },
        { path: "#game-online", view: window.Views.GameRunnerServerView }
    ];

    function navigateTo(url) {
        window.location.hash = url.replace('#', '');
    }

    function isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    function loadInitialContent() {
        localStorage.removeItem('isAuthenticated');
        
        document.body.addEventListener("click", e => {
            if (e.target.matches("[data-link]")) {
                e.preventDefault();
                navigateTo(e.target.hash);
            }
        });
    }

    function getUrlMatch() {
        const currentPath = window.location.hash || '#';
        
        const potentialMatches = routes.map(route => ({
            route: route,
            isMatch: currentPath === route.path
        }));

        let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

        if (!match) {
            return {
                route: { view: window.Views.NotFoundView },
                isMatch: true
            };
        }

        if (!isAuthenticated() && currentPath !== '#login') {
            match = {
                route: routes[0],
                isMatch: true
            };
        }

        return match;
    }

    const logout = () => {
        const logoutBtn = document.getElementById("logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('gameRankings');
                navigateTo('#login');
            });
        }
    };

    const router = async () => {
        const match = getUrlMatch();
        const view = new match.route.view();
        try {
            const html = await view.getHtml();
            document.querySelector("#app").innerHTML = html;
            if (typeof view.initialize === 'function') {
                view.initialize();
            }
            logout();
        } catch (error) {
            console.error('Error in router:', error);
        }
    };

    // Initialize function
    function init() {
        loadInitialContent();
        window.addEventListener("hashchange", router);
        
        // Check if there's a hash, if not set it to login
        if (!window.location.hash) {
            window.location.hash = '#login';
        }
        
        // Run the router immediately
        router();
    }

    // Initialize when DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
        init();
    });

    return {
        navigateTo,
        isAuthenticated
    };
})();