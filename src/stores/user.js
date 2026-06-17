import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
export const useUserStore = defineStore('user', {
    state: () => {
        const stored = localStorage.getItem('user');
        return {
            user: stored ? JSON.parse(stored) : null,
            loggedInUser: localStorage.getItem('loggedInUser') || null,
        };
    },
    actions: {
        login(username, password) {

            // Login logic here
            if ((username === 'admin' && password === 'password') || (username === 'Sama' && password === '2810')) {
                this.user = {
                    username: 'admin',
                    token: 'fake-jwt',
                    role: "admin"
                }
                localStorage.setItem('user', JSON.stringify(this.user));
                localStorage.setItem('loggedInUser', username);
                this.loggedInUser = username;
                return true
            }
            return false
        },
        logout() {

            this.user = null;
            this.loggedInUser = null;
            localStorage.removeItem('user');
            localStorage.removeItem('loggedInUser');

        }
    },
    getters: {
        isLoggedIn: (state) => {
            return state.user !== null
        }
    }
})