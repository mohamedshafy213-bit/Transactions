import {createRouter} from 'vue-router'
import login from '../components/login.vue'
import {createWebHistory} from 'vue-router'
import {useUserStore} from '../stores/user'
import transcation from '../components/transcation.vue'
import Dashboard from '../components/Dashboard.vue'
import FixedMoney from '../components/FixedMoney.vue'
import History from '../components/History.vue'
import CheckCalculator from '../components/CheckCalculator.vue'
import PaymentDispatcher from '../components/PaymentDispatcher.vue'

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
    },
    {
        path:'/history',
        name:'history',
        component:History
    },
    {
        path:'/check-calculator',
        name:'check-calculator',
        component:CheckCalculator
    },
    {
        path:'/payment-dispatcher',
        name:'payment-dispatcher',
        component:PaymentDispatcher
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
router.beforeEach((to, from) => {
  const userStore = useUserStore()
  console.log('[Router] Navigating to:', to.path, 'Name:', to.name, 'LoggedIn:', userStore.isLoggedIn)
  
  if (to.name !== 'login' && !userStore.isLoggedIn) {
    console.log('[Router] Redirecting to login')
    return { name: 'login' }
  }
  if (to.name === 'login' && userStore.isLoggedIn) {
    console.log('[Router] Redirecting to dashboard')
    return { name: 'dashboard' }
  }
  console.log('[Router] Resolving route transition')
})

export default router;