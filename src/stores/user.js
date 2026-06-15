import {defineStore} from 'pinia'
import {ref,computed} from 'vue'
export const useUserStore = defineStore('user',{
    state:()=>{
        const stored = localStorage.getItem('user');
        return {
            user: stored ? JSON.parse(stored) : null,
        };
    },
    actions:{
        login(username,password){
            
            // Login logic here
            if(username === 'admin' && password === 'password') {
                this.user = { username: 'admin',
                    token: 'fake-jwt',
                    role:"admin"
                 }
                localStorage.setItem('user', JSON.stringify(this.user));
                return true
            }
            return false
        },
        logout(){
            
            this.user = null
            localStorage.removeItem('user');
       
        }
    },
    getters:{
        isLoggedIn: (state) => {
            return state.user !== null
        }
    }
})