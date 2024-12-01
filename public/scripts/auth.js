const API_URL = 'http://twserver.alunos.dcc.fc.up.pt:8008';

const authService = {
    // Local storage management
    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    },

    clearAuth() {
        localStorage.removeItem('isAuthenticated');
    },

    setAuth(value) {
        localStorage.setItem('isAuthenticated', value);
    },

    // API calls
    async register(nick, password) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                body: JSON.stringify({ nick, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};

export {authService}