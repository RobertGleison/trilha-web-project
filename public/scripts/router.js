// Remove the import at the top
// import { BaseView, RulesView, GameView, HowToPlayView, RankingView, GameRunnerView, LoginView, NotFoundView } from './views.js';

// Define routes after the navigateTo function is defined
function navigateTo(url){
    history.pushState(null, null, url);
    router();
}

function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

// Import views dynamically to avoid circular dependency
let views = null;
async function getViews() {
    if (!views) {
        views = await import('./views.js');
    }
    return views;
}

const router = async () => {
    const views = await getViews();
    const routes = [
        { path: "/login", view: views.LoginView },
        { path: "/", view: views.BaseView },
        { path: "/rules", view: views.RulesView },
        { path: "/game-setup", view: views.GameView },
        { path: "/how-to-play", view: views.HowToPlayView },
        { path: "/ranking", view: views.RankingView },
        { path: "/game", view: views.GameRunnerView }
    ];
    
    const potentialMatches = routes.map(route => ({
        route: route,
        isMatch: location.pathname === route.path
    }));

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: { view: views.NotFoundView },
            isMatch: true
        };
    }

    if (!isAuthenticated() && location.pathname !== '/login') {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    const view = new match.route.view();
    try {
        const html = await view.getHtml();
        document.querySelector("#app").innerHTML = html;
        if (typeof view.initialize === 'function') {
            view.initialize();
            logout();
        }
    } catch (error) {
        console.error('Error in router:', error);
    }
};

function loadInitialContent() {
    localStorage.removeItem('isAuthenticated');
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });
    !isAuthenticated() ? navigateTo('/login') : router();
}

const logout = () => {
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem('isAuthenticated');
            navigateTo("/login");
        });
    }
};

window.addEventListener("popstate", router);
document.addEventListener("DOMContentLoaded", loadInitialContent);

export { navigateTo };