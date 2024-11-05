export const authService = {
    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    },

    clearAuth() {
        localStorage.removeItem('isAuthenticated');
    },

    setAuth(value) {
        localStorage.setItem('isAuthenticated', value);
    }
};