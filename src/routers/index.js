import {createRouter} from 'vue-router'
import login from '../components/login.vue'
import {createWebHistory} from 'vue-router'
import {useUserStore} from '../stores/user'

import transcation from '../components/transcation.vue'
const routes=[
    {
        path:'/',
        name:'login',
        component:login
    },
    {
        path:'/transcation',
        name:'transcation',
        component:transcation
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
router.beforeEach((to, from, next) => {
const userStore = useUserStore()
if(to.name !== 'login' && !userStore.isLoggedIn) {
    next({ name: 'login' })
}
else if(to.name==='login' && userStore.isLoggedIn){
    next({name:'transcation'})}
    else{next()}

})
export default router;