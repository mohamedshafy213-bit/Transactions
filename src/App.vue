<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import { useTransactionStore } from './stores/Transaction';
import { useI18nStore } from './stores/i18n';
import Toast from 'primevue/toast';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const transactionStore = useTransactionStore();
const i18nStore = useI18nStore();

const showNav = computed(() => {
  return userStore.isLoggedIn && route.path !== '/';
});

const isMobileMenuOpen = ref(false);
const isNotifDropdownOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const toggleNotifDropdown = () => {
  isNotifDropdownOpen.value = !isNotifDropdownOpen.value;
};

const closeNotifDropdown = () => {
  isNotifDropdownOpen.value = false;
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

const unreadCount = computed(() => {
  return transactionStore.notifications.filter(n => !n.isRead).length;
});

const markRead = (id) => {
  transactionStore.MarkNotificationAsRead(id);
};

const markAllRead = () => {
  transactionStore.MarkAllNotificationsAsRead();
};

const deleteNotif = (id) => {
  transactionStore.DeleteNotification(id);
};

onMounted(() => {
  i18nStore.initLocale();
  if (userStore.isLoggedIn) {
    transactionStore.migrateSalaryToIncome();
    transactionStore.CheckAndGenerateReminders();
  }
});
</script>

<template>
  <div class="app-container" :class="{ 'theme-sama': userStore.loggedInUser === 'Sama' }">
    <Toast />
    
    <!-- Desktop Sidebar (visible >= 1024px) -->
    <aside v-if="showNav" class="desktop-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><i class="pi pi-wallet"></i></div>
        <span class="brand-name">{{ i18nStore.t('salaryTracker') }}</span>
      </div>

      <!-- Desktop Language and Notification Row -->
      <div class="sidebar-actions-row">
        <!-- Language Switcher -->
        <select :value="i18nStore.locale" @change="e => i18nStore.setLocale(e.target.value)" class="lang-select">
          <option value="en">🇺🇸 EN</option>
          <option value="ar">🇸🇦 AR</option>
        </select>
        
        <!-- Notification Bell Button -->
        <div class="notif-bell-wrapper">
          <button class="notif-bell-btn" @click="toggleNotifDropdown" aria-label="Notifications">
            <i class="pi pi-bell"></i>
            <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/dashboard' }" 
          @click="navigateTo('/dashboard')"
        >
          <i class="pi pi-chart-pie"></i>
          <span>{{ i18nStore.t('dashboard') }}</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/transcation' }" 
          @click="navigateTo('/transcation')"
        >
          <i class="pi pi-list"></i>
          <span>{{ i18nStore.t('transactions') }}</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/fixed-money' }" 
          @click="navigateTo('/fixed-money')"
        >
          <i class="pi pi-calendar-plus"></i>
          <span>{{ i18nStore.t('fixedMoney') }}</span>
        </button>
      </nav>
      
      <div class="sidebar-footer">
        <button class="logout-btn-global" @click="logout">
          <i class="pi pi-sign-out"></i>
          <span>{{ i18nStore.t('logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Top Navbar (visible < 1024px) -->
    <header v-if="showNav" class="mobile-navbar">
      <div class="mobile-navbar-left">
        <button class="hamburger-btn" @click="toggleMobileMenu" aria-label="Menu">
          <i class="pi pi-bars"></i>
        </button>
        <div class="navbar-brand">
          <div class="brand-icon"><i class="pi pi-wallet"></i></div>
          <span class="brand-name" v-if="userStore.loggedInUser === 'Sama'">hi sama 🩷</span>
          <span class="brand-name" v-else-if="userStore.loggedInUser === 'admin'">Hi Admin 👋</span>
          <span class="brand-name" v-else>{{ i18nStore.t('salaryTracker') }}</span>
        </div>
      </div>
      
      <div class="mobile-navbar-right">
        <!-- Mobile Language Switcher -->
        <select :value="i18nStore.locale" @change="e => i18nStore.setLocale(e.target.value)" class="lang-select-mobile">
          <option value="en">🇺🇸</option>
          <option value="ar">🇸🇦</option>
        </select>
        
        <!-- Mobile Notification Bell -->
        <div class="notif-bell-wrapper">
          <button class="notif-bell-btn" @click="toggleNotifDropdown" aria-label="Notifications">
            <i class="pi pi-bell"></i>
            <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Global Notification Dropdown Overlay Panel -->
    <div v-if="showNav && isNotifDropdownOpen" class="notif-dropdown-overlay" @click="closeNotifDropdown"></div>
    <div v-if="showNav && isNotifDropdownOpen" class="notif-dropdown-panel" :class="{ 'panel-rtl': i18nStore.locale === 'ar' }">
      <div class="notif-panel-header">
        <span class="panel-header-title">{{ i18nStore.t('notifications') }}</span>
        <button v-if="unreadCount > 0" class="mark-all-read-btn" @click="markAllRead">
          {{ i18nStore.t('markAllRead') }}
        </button>
      </div>
      
      <div class="notif-panel-body">
        <div v-if="transactionStore.notifications.length === 0" class="notif-empty-state">
          <i class="pi pi-bell-slash"></i>
          <span>{{ i18nStore.t('noNotifications') }}</span>
        </div>
        
        <div 
          v-else 
          v-for="n in transactionStore.notifications" 
          :key="n.id" 
          class="notif-item-row"
          :class="{ 'unread-item': !n.isRead }"
        >
          <div class="notif-item-top">
            <span class="notif-item-title">{{ n.title }}</span>
            <button class="notif-item-delete" @click="deleteNotif(n.id)" aria-label="Delete">
              <i class="pi pi-trash"></i>
            </button>
          </div>
          <p class="notif-item-msg">{{ n.message }}</p>
          <div class="notif-item-actions" v-if="!n.isRead">
            <button class="notif-item-check" @click="markRead(n.id)" aria-label="Mark read">
              <i class="pi pi-check"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

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
          <span class="brand-name" v-if="userStore.loggedInUser === 'Sama'">hi sama 🩷</span>
          <span class="brand-name" v-else-if="userStore.loggedInUser === 'admin'">Hi Admin 👋</span>
          <span class="brand-name" v-else>{{ i18nStore.t('salaryTracker') }}</span>
        </div>
        <button class="close-btn" @click="closeMobileMenu" :aria-label="i18nStore.t('closeMenu')">
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
          <span>{{ i18nStore.t('dashboard') }}</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/transcation' }" 
          @click="navigateTo('/transcation')"
        >
          <i class="pi pi-list"></i>
          <span>{{ i18nStore.t('transactions') }}</span>
        </button>
        <button 
          class="nav-item" 
          :class="{ active: route.path === '/fixed-money' }" 
          @click="navigateTo('/fixed-money')"
        >
          <i class="pi pi-calendar-plus"></i>
          <span>{{ i18nStore.t('fixedMoney') }}</span>
        </button>
      </nav>
      
      <div class="drawer-footer">
        <button class="logout-btn-global" @click="logout">
          <i class="pi pi-sign-out"></i>
          <span>{{ i18nStore.t('logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="content-container">
      <router-view />
    </main>
  </div>
</template>
