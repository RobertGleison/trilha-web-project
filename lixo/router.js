class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentView = null;
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
        
        // Handle initial route
        this.handleInitialRoute();
    }

    handleInitialRoute() {
        // Get current path or default to '/' if empty
        let path = window.location.pathname;
        if (path === '' || path === '/') {
            path = '/login';
            window.history.replaceState({}, '', path);
        }
        this.handleRoute(path);
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute(path);
    }

    handleRoute(path) {
        // Default to login if not authenticated (except for login page)
        if (!localStorage.getItem('isAuthenticated') && path !== '/login') {
            this.navigate('/login');
            return;
        }

        // If authenticated and trying to access login, redirect to main menu
        if (localStorage.getItem('isAuthenticated') && path === '/login') {
            this.navigate('/menu');
            return;
        }

        // Find the matching route or use 404 route
        const route = this.routes[path] || this.routes['/404'];
        const app = document.getElementById('app');
        
        // Clear previous view
        if (this.currentView && this.currentView.cleanup) {
            this.currentView.cleanup();
        }
        
        // Initialize new view
        this.currentView = new route.view();
        this.currentView.setRouter(this); // Set router reference
        app.innerHTML = this.currentView.render();
        
        if (this.currentView.initialize) {
            this.currentView.initialize();
        }
    }
}