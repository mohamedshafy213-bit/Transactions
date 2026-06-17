import {createRouter} from 'vue-router'
import login from '../components/login.vue'
import {createWebHistory} from 'vue-router'
import {useUserStore} from '../stores/user'
import transcation from '../components/transcation.vue'
import Dashboard from '../components/Dashboard.vue'
import FixedMoney from '../components/FixedMoney.vue'

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
    },
    {
        path:'/dashboard',
        name:'dashboard',
        component:Dashboard
    },
    {
        path:'/fixed-money',
        name:'fixed-money',
        component:FixedMoney
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
    next({name:'dashboard'})}
    else{next()}

})
export default router;