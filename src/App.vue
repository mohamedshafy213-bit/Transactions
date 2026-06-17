<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import Toast from 'primevue/toast';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const showNav = computed(() => {
  return userStore.isLoggedIn && route.path !== '/';
});

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const navigateTo = (path) => {
  router.push(path);
  closeMobileMenu();
};

const logout = () => {
  userStore.logout();
  router.push('/');
  closeMobileMenu();
};
</script>

<template>
  <div class="app-container" :class="{ 'theme-sama': userStore.loggedInUser === 'Sama' }">
    <Toast />
    
    <!-- Desktop Sidebar (visible >= 1024px) -->
    <aside v-if="showNav" class="desktop-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><i class="pi pi-wallet"></i></div>
        <span class="brand-name">Salary Tracker</span>
      </div>
      
      <nav class="sidebar-nav">
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/dashboard' }" 
          @click="navigateTo('/dashboard')"
        >
          <i class="pi pi-chart-pie"></i>
          <span>Dashboard</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/transcation' }" 
          @click="navigateTo('/transcation')"
        >
          <i class="pi pi-list"></i>
          <span>Transactions</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/fixed-money' }" 
          @click="navigateTo('/fixed-money')"
        >
          <i class="pi pi-calendar-plus"></i>
          <span>Fixed Money</span>
        </button>
      </nav>
      
      <div class="sidebar-footer">
        <button class="logout-btn-global" @click="logout">
          <i class="pi pi-sign-out"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Top Navbar (visible < 1024px) -->
    <header v-if="showNav" class="mobile-navbar">
      <button class="hamburger-btn" @click="toggleMobileMenu" aria-label="Menu">
        <i class="pi pi-bars"></i>
      </button>
      <div class="navbar-brand">
        <div class="brand-icon"><i class="pi pi-wallet"></i></div>
        <span class="brand-name" v-if="userStore.loggedInUser === 'Sama'">hi sama 🩷</span>
        <span class="brand-name" v-else-if="userStore.loggedInUser === 'admin'">Hi Admin 👋</span>
        <span class="brand-name" v-else>Salary Tracker</span>
      </div>
      <div style="width: 44px;"></div>
    </header>

    <!-- Mobile Sliding Drawer Overlay (visible < 1024px) -->
    <div 
      v-if="showNav && isMobileMenuOpen" 
      class="drawer-overlay" 
      @click="closeMobileMenu"
    ></div>
    
    <aside 
      v-if="showNav" 
      class="mobile-drawer" 
      :class="{ open: isMobileMenuOpen }"
    >
      <div class="drawer-header">
        <div class="sidebar-brand">
          <div class="brand-icon"><i class="pi pi-wallet"></i></div>
          <span class="brand-name">Salary Tracker</span>
        </div>
        <button class="close-btn" @click="closeMobileMenu" aria-label="Close menu">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <nav class="drawer-nav">
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/dashboard' }" 
          @click="navigateTo('/dashboard')"
        >
          <i class="pi pi-chart-pie"></i>
          <span>Dashboard</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/transcation' }" 
          @click="navigateTo('/transcation')"
        >
          <i class="pi pi-list"></i>
          <span>Transactions</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/fixed-money' }" 
          @click="navigateTo('/fixed-money')"
        >
          <i class="pi pi-calendar-plus"></i>
          <span>Fixed Money</span>
        </button>
      </nav>
      
      <div class="drawer-footer">
        <button class="logout-btn-global" @click="logout">
          <i class="pi pi-sign-out"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="content-container">
      <router-view />
    </main>
  </div>
</template>
