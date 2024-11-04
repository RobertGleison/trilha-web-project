import { BaseView, RulesView, GameView, HowToPlayView, RankingView, GameRunnerView, LoginView } from './views.js';

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};


const router = async () => {
    if (!isAuthenticated() && location.pathname !== '/login') {
        history.pushState(null, null, '/login');
    }

    const routes = [
        { path: "/login", view: LoginView },
        { path: "/", view: BaseView },
        { path: "/rules", view: RulesView },
        { path: "/game-setup", view: GameView },
        { path: "/how-to-play", view: HowToPlayView },
        { path: "/ranking", view: RankingView },
        { path: "/game", view: GameRunnerView }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    // If no match or not authenticated, default to login
    if (!match || (!isAuthenticated() && location.pathname !== '/login')) {
        match = {
            route: routes[0],    // LoginView
            isMatch: true
        };
    }

    const view = new match.route.view();
    document.querySelector("#app").innerHTML = await view.getHtml();
    if (typeof view.initialize === 'function') {
        view.initialize();
    }
};

function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    // Clear authentication on startup (optional - remove if you want to persist login)
    localStorage.removeItem('isAuthenticated');
    
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }});

    // Force check authentication and route accordingly
    if (!isAuthenticated()) {
        navigateTo('/login');
    } else {
        router();
    }
});

export { navigateTo };