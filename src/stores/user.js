import {defineStore} from 'pinia'
import {ref,computed} from 'vue'
export const useUserStore = defineStore('user',{
    state:()=>{
        return{user:ref(null)}
    },
    actions:{
        login(username,password){
            
            // Login logic here
            if(username === 'admin' && password === 'password') {
                this.user = { username: 'admin',
                    token: 'fake-jwt',
                    role:"admin"
                 }
                return true
            }
            return false
        },
        logout(){
            this.user = null
        }
    },
    getters:{
        isLoggedIn: (state) => {
            return state.user !== null
        }
    }
})