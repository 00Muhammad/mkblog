class AuthSystem {
    constructor() {
        this.currentUser = localStorage.getItem('current_user');
        this.isLoggedIn = !!this.currentUser;
    }

    login(username, password) {
        if (username && password) {
            this.currentUser = username;
            this.isLoggedIn = true;
            localStorage.setItem('current_user', username);
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('current_user');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.isLoggedIn;
    }
}

window.authSystem = new AuthSystem();
