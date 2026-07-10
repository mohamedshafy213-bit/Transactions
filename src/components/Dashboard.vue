<template>
  <div class="dashboard-page">
    
    <!-- ── 1. PERSONALIZED GREETING & SALARY PILL ── -->
    <header class="greeting-section">
      <div v-if="userStore.loggedInUser === 'Sama'" class="greeting-block">
        <h1 class="greeting-title">{{ i18nStore.t('helloCutieSama') }}</h1>
        <p class="greeting-subtitle">{{ i18nStore.t('moneyLately') }}</p>
      </div>
      <div v-else-if="userStore.loggedInUser === 'admin'" class="greeting-block">
        <h1 class="greeting-title">{{ i18nStore.t('helloAdmin') }}</h1>
        <p class="greeting-subtitle">{{ i18nStore.t('financialSummary') }}</p>
      </div>
      <div v-else class="greeting-block">
        <h1 class="greeting-title">{{ i18nStore.t('welcomeBack') }}</h1>
        <p class="greeting-subtitle">{{ i18nStore.t('financialOverview') }}</p>
      </div>

      <!-- Salary Detection Chip (sum of Salary incomes in range) -->
      <div v-if="salaryFiltered > 0" class="salary-chip">
        <span>{{ i18nStore.t('yourSalaryThisMonth', { amount: formatCurrency(salaryFiltered) }) }}</span>
      </div>
    </header>

    <!-- ── Warning Alerts Banner ── -->
    <div v-if="dashboardAlerts.length > 0" class="dashboard-alerts-container">
      <div 
        v-for="alert in dashboardAlerts" 
        :key="alert.id" 
        class="alert-warning-card" 
        :class="'alert-' + alert.type"
      >
        <span class="alert-icon">⚠️</span>
        <span class="alert-text">{{ alert.text }}</span>
      </div>
    </div>

    <!-- ── 2A. DATE FILTER REDESIGN ── -->
    <div class="date-filter-container">
      
      <!-- Mobile Only Native Select Selector -->
      <div class="mobile-only filter-mobile-select-wrapper">
        <div class="mobile-select-box">
          <select 
            v-model="activeQuickFilter" 
            @change="applyQuickFilter(activeQuickFilter)" 
            class="mobile-native-select"
          >
            <option value="today">{{ i18nStore.t('today') }}</option>
            <option value="last7">{{ i18nStore.t('last7') }}</option>
            <option value="last30">{{ i18nStore.t('last30') }}</option>
            <option value="thisMonth">{{ i18nStore.t('thisMonth') }}</option>
            <option value="lastMonth">{{ i18nStore.t('lastMonth') }}</option>
            <option value="thisYear">{{ i18nStore.t('thisYear') }}</option>
            <option value="allTime">{{ i18nStore.t('allTime') }}</option>
            <option value="custom">{{ i18nStore.t('filterCustom') }}</option>
          </select>
          <div class="select-chevron">▼</div>
        </div>

        <!-- Mobile Custom Range Inputs (Shown when "Custom Range" is selected) -->
        <div v-if="activeQuickFilter === 'custom'" class="mobile-custom-range-inputs">
          <div class="custom-range-row">
            <div class="input-group">
              <label>{{ i18nStore.t('startDate') }}</label>
              <input type="date" v-model="customFromDate" class="date-input" />
            </div>
            <div class="input-group">
              <label>TO</label>
              <input type="date" v-model="customToDate" class="date-input" />
            </div>
          </div>
          <button class="apply-filter-btn full-width" @click="applyCustomRange">{{ i18nStore.t('btnAdd') }}</button>
        </div>
      </div>

      <!-- Desktop Only Filter Pills & Custom Inputs -->
      <div class="desktop-only filter-desktop-layout">
        <div class="quick-pills-container">
          <button 
            v-for="pill in quickFilterPills" 
            :key="pill.value" 
            class="pill-btn" 
            :class="{ active: activeQuickFilter === pill.value }"
            @click="applyQuickFilter(pill.value)"
          >
            {{ i18nStore.t(pill.value) }}
          </button>
          <button 
            class="pill-btn" 
            :class="{ active: activeQuickFilter === 'custom' }"
            @click="activeQuickFilter = 'custom'"
          >
            {{ i18nStore.t('filterCustom') }}
          </button>
        </div>

        <!-- Desktop Custom Range Inputs -->
        <div v-if="activeQuickFilter === 'custom'" class="desktop-custom-range-picker">
          <div class="picker-group">
            <label class="picker-label">{{ i18nStore.t('startDate') }}</label>
            <input type="date" v-model="customFromDate" class="date-input" />
          </div>
          <div class="picker-group">
            <label class="picker-label">To</label>
            <input type="date" v-model="customToDate" class="date-input" />
          </div>
          <button class="apply-filter-btn" @click="applyCustomRange">{{ i18nStore.t('btnAdd') }}</button>
          <button class="reset-filter-btn" @click="resetFilters">{{ i18nStore.t('btnCancel') }}</button>
        </div>
      </div>

      <!-- Showing Range Text -->
      <div class="date-range-display-text">
        <span>{{ i18nStore.t('showingData', { range: friendlyDateRangeText }) }}</span>
      </div>
    </div>

    <!-- ── 2B. KPI CARDS IN A 2x2 GRID ON MOBILE ── -->
    <div class="simplified-kpis-grid">
      <!-- Card 1: Money In (soft green tint) -->
      <div class="kpi-card-redesign tint-green">
        <div class="card-header-row">
          <span class="card-emoji">💰</span>
          <span class="card-title">{{ i18nStore.t('moneyIn') }}</span>
        </div>
        <div class="card-value">{{ formatCurrency(totalIncomeFiltered) }}</div>
        <div class="card-desc">{{ i18nStore.t('whatYouReceived') }}</div>
      </div>

      <!-- Card 2: Money Out (soft red/pink tint) -->
      <div class="kpi-card-redesign tint-red">
        <div class="card-header-row">
          <span class="card-emoji">💸</span>
          <span class="card-title">{{ i18nStore.t('moneyOut') }}</span>
        </div>
        <div class="card-value">{{ formatCurrency(totalExpensesFiltered) }}</div>
        <div class="card-desc">{{ i18nStore.t('whatYouSpent') }}</div>
      </div>

      <!-- Card 3: Left Over (soft blue tint) -->
      <div class="kpi-card-redesign tint-blue">
        <div class="card-header-row">
          <span class="card-emoji">🏦</span>
          <span class="card-title">{{ i18nStore.t('leftOver') }}</span>
        </div>
        <div class="card-value">{{ formatCurrency(netBalanceFiltered) }}</div>
        <div class="card-desc">{{ i18nStore.t('yourBalancePeriod') }}</div>
      </div>

      <!-- Card 4: Saved (soft purple tint) -->
      <div class="kpi-card-redesign tint-purple">
        <div class="card-header-row">
          <span class="card-emoji">📊</span>
          <span class="card-title">{{ i18nStore.t('saved') }}</span>
        </div>
        <div class="card-value">{{ Math.max(0, savingsRate).toFixed(0) }}%</div>
        <div class="card-desc">{{ i18nStore.t('ofIncomeSaved') }}</div>
      </div>
    </div>

    <!-- Health Banner below cards (full width) -->
    <div class="health-banner-full" :class="healthBannerClass">
      <span class="banner-icon">{{ healthBannerEmoji }}</span>
      <span class="banner-text">{{ healthBannerText }}</span>
    </div>

    <!-- ── 1. INSTALLMENT DASHBOARD SUMMARY CARDS ── -->
    <div class="installment-summary-grid">
      <!-- Card 1: Total Active Installments -->
      <div class="inst-card tint-indigo">
        <div class="inst-card-header">
          <span class="inst-card-emoji">📋</span>
          <span class="inst-card-title">{{ i18nStore.t('totalActiveInstallments') }}</span>
        </div>
        <div class="inst-card-value">{{ installmentDashboardStats.activeCount }}</div>
        <div class="inst-card-desc">{{ i18nStore.t('activeInstallmentsDesc') }}</div>
      </div>

      <!-- Card 2: Monthly Installments Due -->
      <div class="inst-card tint-amber">
        <div class="inst-card-header">
          <span class="inst-card-emoji">📅</span>
          <span class="inst-card-title">{{ i18nStore.t('monthlyInstallmentsDue') }}</span>
        </div>
        <div class="inst-card-value">{{ formatCurrency(installmentDashboardStats.monthlyDueSum) }}</div>
        <div class="inst-card-desc">{{ i18nStore.t('monthlyDueDesc') }}</div>
      </div>

      <!-- Card 3: Total Remaining Balance -->
      <div class="inst-card tint-rose">
        <div class="inst-card-header">
          <span class="inst-card-emoji">💸</span>
          <span class="inst-card-title">{{ i18nStore.t('totalRemainingBalance') }}</span>
        </div>
        <div class="inst-card-value">{{ formatCurrency(installmentDashboardStats.totalRemainingBalance) }}</div>
        <div class="inst-card-desc">{{ i18nStore.t('remainingBalanceDesc') }}</div>
      </div>

      <!-- Card 4: Upcoming Payments This Month -->
      <div class="inst-card tint-purple">
        <div class="inst-card-header">
          <span class="inst-card-emoji">⏰</span>
          <span class="inst-card-title">{{ i18nStore.t('upcomingPaymentsThisMonth') }}</span>
        </div>
        <div class="inst-card-value">{{ installmentDashboardStats.upcomingCount }}</div>
        <div class="inst-card-desc">{{ i18nStore.t('upcomingPaymentsDesc') }}</div>
      </div>
    </div>

    <!-- ── 2C. CHARTS SECTION ── -->
    <div class="dashboard-charts-layout">
      <!-- Chart 1: Donut -->
      <div class="chart-card-redesign">
        <div class="chart-card-header">
          <h3 class="chart-title">{{ i18nStore.t('whereMoneyGo') }}</h3>
          <p class="chart-subtitle">{{ i18nStore.t('spendingSplit') }}</p>
        </div>
        <div class="chart-container-inner">
          <Doughnut v-if="hasFilteredExpenses" :data="expenseCategoryChartData" :options="pieOptions" />
          <div v-else class="chart-empty-state">
            <i class="pi pi-chart-pie"></i>
            <span>{{ i18nStore.t('noSpendingRecorded') }}</span>
          </div>
        </div>
      </div>

      <!-- Chart 2: Grouped Bar -->
      <div class="chart-card-redesign">
        <div class="chart-card-header">
          <h3 class="chart-title">{{ i18nStore.t('incomeVsSpending') }}</h3>
          <p class="chart-subtitle">{{ i18nStore.t('monthMonthComparison') }}</p>
        </div>
        <div class="chart-container-inner">
          <Bar v-if="hasLast6MonthsData" :data="last6MonthsChartData" :options="barOptionsRedesign" />
          <div v-else class="chart-empty-state">
            <i class="pi pi-chart-bar"></i>
            <span>{{ i18nStore.t('nothingToShow') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 2D. FIXED COMMITMENTS SECTION ── -->
    <div class="commitments-bottom-card">
      <div class="commitments-header">
        <h3 class="commitments-title">{{ i18nStore.t('monthlyCommitments') }}</h3>
        <p class="commitments-subtitle">{{ i18nStore.t('regularBills') }}</p>
      </div>

      <div v-if="transactionStore.fixedCommitments.length > 0" class="commitments-content">
        <ul class="commitments-list">
          <li v-for="item in transactionStore.fixedCommitments" :key="item.id" class="commitment-row-item">
            <span class="commitment-item-name">
              {{ getCommitmentEmoji(item) }} {{ item.name }}
            </span>
            <span class="commitment-item-amount">${{ (item.installmentAmount || item.amount).toLocaleString() }}/mo</span>
          </li>
        </ul>
        <div class="commitments-divider-line"></div>
        <div class="commitments-total-row">
          <span>{{ i18nStore.t('totalThisMonth') }}</span>
          <strong>${{ totalCommitmentsAmount.toLocaleString() }}</strong>
        </div>
      </div>
      <div v-else class="commitments-empty-msg">
        {{ i18nStore.t('noCommitmentsYet') }}
      </div>

      <div class="commitments-action-link">
        <router-link to="/fixed-money" class="commitments-link">{{ i18nStore.t('manageCommitments') }}</router-link>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useTransactionStore, getInstallmentStats } from '../stores/Transaction';
import { useUserStore } from '../stores/user';
import { useI18nStore } from '../stores/i18n';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

const transactionStore = useTransactionStore();
const userStore = useUserStore();
const i18nStore = useI18nStore();
const toast = useToast();

const formatCurrency = (v) =>
  (v !== undefined && v !== null)
    ? Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '$0.00';

const formatAbbreviated = (value) => {
  if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'k';
  }
  return '$' + value;
};

// ── Date Filters & Persistence ──
const quickFilterPills = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'All Time', value: 'allTime' }
];

const activeQuickFilter = ref('thisMonth');
const customFromDate = ref('');
const customToDate = ref('');

const filterFromDate = ref(new Date());
const filterToDate = ref(new Date());

const calculatePillDates = (value) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let from = null;
  let to = new Date(now);
  to.setHours(23, 59, 59, 999);
  
  switch (value) {
    case 'today':
      from = new Date(now);
      break;
    case 'last7':
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      break;
    case 'last30':
      from = new Date(now);
      from.setDate(from.getDate() - 29);
      break;
    case 'thisMonth':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'lastMonth':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'thisYear':
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'allTime':
    default:
      from = new Date(2000, 0, 1);
      to = new Date(now.getFullYear() + 10, 11, 31, 23, 59, 59, 999);
      break;
  }
  return { from, to };
};

const saveFilterState = () => {
  localStorage.setItem('dashboard_filters_new', JSON.stringify({
    activeQuickFilter: activeQuickFilter.value,
    customFromDate: customFromDate.value,
    customToDate: customToDate.value
  }));
};

const applyQuickFilter = (value) => {
  activeQuickFilter.value = value;
  if (value !== 'custom') {
    customFromDate.value = '';
    customToDate.value = '';
    const bounds = calculatePillDates(value);
    filterFromDate.value = bounds.from;
    filterToDate.value = bounds.to;
    saveFilterState();
  }
};

const applyCustomRange = () => {
  if (!customFromDate.value || !customToDate.value) {
    toast.add({ severity: 'warn', summary: 'Missing Dates', detail: 'Select both start and end dates.', life: 3000 });
    return;
  }
  const from = new Date(customFromDate.value);
  from.setHours(0, 0, 0, 0);
  const to = new Date(customToDate.value);
  to.setHours(23, 59, 59, 999);
  
  if (from > to) {
    toast.add({ severity: 'error', summary: 'Invalid Range', detail: 'From date cannot be after To date.', life: 3000 });
    return;
  }
  
  activeQuickFilter.value = 'custom';
  filterFromDate.value = from;
  filterToDate.value = to;
  saveFilterState();
};

const resetFilters = () => {
  applyQuickFilter('thisMonth');
};

const loadFilterState = () => {
  const stored = localStorage.getItem('dashboard_filters_new');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      activeQuickFilter.value = parsed.activeQuickFilter || 'thisMonth';
      customFromDate.value = parsed.customFromDate || '';
      customToDate.value = parsed.customToDate || '';
      
      if (activeQuickFilter.value === 'custom' && customFromDate.value && customToDate.value) {
        const from = new Date(customFromDate.value);
        from.setHours(0, 0, 0, 0);
        const to = new Date(customToDate.value);
        to.setHours(23, 59, 59, 999);
        filterFromDate.value = from;
        filterToDate.value = to;
      } else {
        const bounds = calculatePillDates(activeQuickFilter.value);
        filterFromDate.value = bounds.from;
        filterToDate.value = bounds.to;
      }
    } catch {
      applyQuickFilter('thisMonth');
    }
  } else {
    applyQuickFilter('thisMonth');
  }
};

onMounted(() => {
  transactionStore.Setremind();
  loadFilterState();
});

// ── Date Parser Helper ──
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = String(dateStr).trim();
  
  let isDayFirst = true;
  try {
    const testDate = new Date(2026, 11, 25);
    const testStr = testDate.toLocaleDateString();
    const testParts = testStr.split(/[-/]/);
    if (testParts.length === 3) {
      const first = parseInt(testParts[0], 10);
      const second = parseInt(testParts[1], 10);
      if (first === 25) {
        isDayFirst = true;
      } else if (second === 25) {
        isDayFirst = false;
      }
    }
  } catch (e) {
    isDayFirst = true;
  }

  if (cleanStr.includes('-')) {
    const parts = cleanStr.split('-');
    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 > 1000) {
        return new Date(p0, p1 - 1, p2);
      } else if (p2 > 1000) {
        if (p0 > 12) return new Date(p2, p1 - 1, p0);
        if (p1 > 12) return new Date(p2, p0 - 1, p1);
        return isDayFirst ? new Date(p2, p1 - 1, p0) : new Date(p2, p0 - 1, p1);
      }
    } else if (parts.length === 2) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      if (p0 > 1000) {
        return new Date(p0, p1 - 1, 1);
      }
    }
  }

  if (cleanStr.includes('/')) {
    const parts = cleanStr.split('/');
    if (parts.length === 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 > 1000) {
        return new Date(p0, p1 - 1, p2);
      } else if (p2 > 1000) {
        if (p0 > 12) return new Date(p2, p1 - 1, p0);
        if (p1 > 12) return new Date(p2, p0 - 1, p1);
        return isDayFirst ? new Date(p2, p1 - 1, p0) : new Date(p2, p0 - 1, p1);
      }
    }
  }

  const d = new Date(cleanStr);
  if (!isNaN(d.getTime())) {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null;
};

// ── Filtered Datasets ──
const filteredTransactions = computed(() => {
  return transactionStore.transactions.filter(t => {
    const d = parseDate(t.date);
    if (!d) return false;
    return d >= filterFromDate.value && d <= filterToDate.value;
  });
});

const filteredIncomes = computed(() => {
  return transactionStore.incomes.filter(i => {
    const d = parseDate(i.date);
    if (!d) return false;
    return d >= filterFromDate.value && d <= filterToDate.value;
  });
});

// ── Dynamic Audit: Dynamic Salary calculations ──
const salaryFiltered = computed(() => {
  return filteredIncomes.value
    .filter(i => i.source === 'Salary')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);
});

const totalExpensesFiltered = computed(() => {
  return filteredTransactions.value.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
});

const totalIncomeFiltered = computed(() => {
  return filteredIncomes.value.reduce((acc, i) => acc + Number(i.amount || 0), 0);
});

const netBalanceFiltered = computed(() => {
  return totalIncomeFiltered.value - totalExpensesFiltered.value;
});

const savingsRate = computed(() => {
  if (totalIncomeFiltered.value <= 0) return 0;
  return (netBalanceFiltered.value / totalIncomeFiltered.value) * 100;
});

// ── Warning Alerts Banner scanning active installments ──
const dashboardAlerts = computed(() => {
  const list = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  
  transactionStore.fixedCommitments.forEach(c => {
    if (c.status !== 'Active') return;
    
    const stats = getInstallmentStats(c, transactionStore.installmentPayments);
    const dueDateStr = stats.nextPaymentDate;
    if (!dueDateStr) return;
    
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0,0,0,0);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays <= 7) {
      const dayText = diffDays === 0 ? (i18nStore.locale === 'ar' ? 'اليوم' : 'today') : 
                      (diffDays === 1 ? (i18nStore.locale === 'ar' ? 'غداً' : 'tomorrow') : 
                      (i18nStore.locale === 'ar' ? `خلال ${diffDays} أيام` : `in ${diffDays} days`));
      list.push({
        id: `alert-${c.id}`,
        type: 'warning',
        text: i18nStore.t('paymentDueAlert', { name: c.name, dayText })
      });
    } else if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      list.push({
        id: `alert-${c.id}`,
        type: 'danger',
        text: i18nStore.t('paymentOverdueAlert', { name: c.name, days: overdueDays })
      });
    }
  });
  
  return list;
});

// ── Installment summary cards stats ──
const installmentDashboardStats = computed(() => {
  let activeCount = 0;
  let monthlyDueSum = 0;
  let totalRemainingBalance = 0;
  
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  transactionStore.fixedCommitments.forEach(c => {
    if (c.status !== 'Active') return;
    activeCount++;
    
    const instAmt = Number(c.installmentAmount || c.amount || 0);
    monthlyDueSum += instAmt;
    
    const stats = getInstallmentStats(c, transactionStore.installmentPayments);
    totalRemainingBalance += stats.remainingBalance;
  });
  
  const upcomingCount = transactionStore.fixedCommitments.filter(c => {
    if (c.status !== 'Active') return false;
    const stats = getInstallmentStats(c, transactionStore.installmentPayments);
    return stats.nextPaymentDate && stats.nextPaymentDate.substring(0, 7) === currentMonthStr;
  }).length;

  return {
    activeCount,
    monthlyDueSum,
    totalRemainingBalance,
    upcomingCount
  };
});

// ── Chart Configurations ──
const hasFilteredExpenses = computed(() => filteredTransactions.value.length > 0);

const getCommitmentEmoji = (item) => {
  const name = (item.name || '').toLowerCase();
  const type = (item.type || '').toLowerCase();
  if (name.includes('internet') || name.includes('wifi') || name.includes('phone') || name.includes('bill') || type.includes('bill')) return '📶';
  if (name.includes('car') || name.includes('installment') || type.includes('installment')) return '🚗';
  if (name.includes('rent') || type.includes('rent') || name.includes('home') || name.includes('house')) return '🏠';
  return '📋';
};

const totalCommitmentsAmount = computed(() => {
  return transactionStore.fixedCommitments
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + Number(c.installmentAmount || c.amount || 0), 0);
});

// Friendly date range text for subtext display
const friendlyDateRangeText = computed(() => {
  if (!filterFromDate.value || !filterToDate.value) return '';
  const start = filterFromDate.value;
  const end = filterToDate.value;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();
  
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();
  const endDay = end.getDate();
  
  if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
    return `${monthNames[startMonth]} ${startDay}, ${startYear}`;
  }
  
  const lastOfEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
  if (startYear === endYear && startMonth === endMonth && startDay === 1 && endDay === lastOfEndMonth) {
    return `${monthNames[startMonth]} ${startYear}`;
  }
  
  if (startMonth === 0 && startDay === 1 && endMonth === 11 && endDay === 31 && startYear === endYear) {
    return `${startYear}`;
  }
  
  const formatD = (d) => `${shortMonthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  return `${formatD(start)} - ${formatD(end)}`;
});

// Health Banner Properties
const healthBannerEmoji = computed(() => {
  if (totalIncomeFiltered.value <= 0) return '👋';
  const rate = savingsRate.value;
  if (rate >= 20) return '🎉';
  if (rate >= 5) return '💡';
  return '⚠️';
});

const healthBannerText = computed(() => {
  if (totalIncomeFiltered.value <= 0) return i18nStore.t('addIncomeStart');
  const rate = savingsRate.value;
  if (rate >= 20) return i18nStore.t('savingWell');
  if (rate >= 5) return i18nStore.t('cutSpending');
  return i18nStore.t('spentMost');
});

const healthBannerClass = computed(() => {
  if (totalIncomeFiltered.value <= 0) return 'banner-no-income';
  const rate = savingsRate.value;
  if (rate >= 20) return 'banner-great';
  if (rate >= 5) return 'banner-good';
  return 'banner-warning';
});

// Category Donut Chart Data (Max 6 categories)
const expenseCategoryChartData = computed(() => {
  const catMap = {};
  filteredTransactions.value.forEach(t => {
    const cat = t.Category || 'Uncategorized';
    catMap[cat] = (catMap[cat] || 0) + Number(t.Transcation || 0);
  });

  const sorted = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1]);

  let finalLabels = [];
  let finalData = [];
  
  if (sorted.length <= 6) {
    finalLabels = sorted.map(i => i[0]);
    finalData = sorted.map(i => i[1]);
  } else {
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5);
    const otherSum = rest.reduce((sum, item) => sum + item[1], 0);
    finalLabels = [...top5.map(i => i[0]), 'Other'];
    finalData = [...top5.map(i => i[1]), otherSum];
  }

  const totalExp = finalData.reduce((sum, val) => sum + val, 0);

  const labelWithPercentage = finalLabels.map((lbl, idx) => {
    const amt = finalData[idx];
    const pct = totalExp > 0 ? ((amt / totalExp) * 100).toFixed(0) : 0;
    return `${lbl} (${formatCurrency(amt)} - ${pct}%)`;
  });

  return {
    labels: labelWithPercentage,
    datasets: [{
      data: finalData,
      backgroundColor: [
        '#f43f5e', // rose
        '#6366f1', // indigo
        '#10b981', // emerald
        '#fbbf24', // amber
        '#8b5cf6', // purple
        '#94a3b8'  // slate
      ],
      borderWidth: 1,
      borderColor: '#1e293b'
    }]
  };
});

// Last 6 Months Grouped Bar Chart Data
const last6Months = computed(() => {
  const list = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push(d);
  }
  return list;
});

const last6MonthsGroupedData = computed(() => {
  const months = last6Months.value;
  const labels = months.map(d => d.toLocaleDateString('en-US', { month: 'short' }));
  
  const incomesData = [];
  const expensesData = [];
  
  months.forEach(d => {
    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    
    // Sum incomes in this month
    const incomeVal = transactionStore.incomes
      .filter(i => {
        const parsed = parseDate(i.date);
        return parsed && parsed.getFullYear() === year && String(parsed.getMonth() + 1).padStart(2, '0') === monthStr;
      })
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
      
    incomesData.push(incomeVal);
    
    const expensesVal = transactionStore.transactions
      .filter(t => {
        const parsed = parseDate(t.date);
        return parsed && parsed.getFullYear() === year && String(parsed.getMonth() + 1).padStart(2, '0') === monthStr;
      })
      .reduce((sum, t) => sum + Number(t.Transcation || 0), 0);
      
    expensesData.push(expensesVal);
  });
  
  return {
    labels,
    incomesData,
    expensesData
  };
});

const hasLast6MonthsData = computed(() => {
  const data = last6MonthsGroupedData.value;
  const totalIn = data.incomesData.reduce((sum, v) => sum + v, 0);
  const totalOut = data.expensesData.reduce((sum, v) => sum + v, 0);
  return totalIn > 0 || totalOut > 0;
});

const last6MonthsChartData = computed(() => {
  const data = last6MonthsGroupedData.value;
  return {
    labels: data.labels,
    datasets: [
      {
        label: i18nStore.locale === 'ar' ? 'الدخل' : 'Income',
        data: data.incomesData,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 5
      },
      {
        label: i18nStore.locale === 'ar' ? 'الإنفاق' : 'Spending',
        data: data.expensesData,
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: '#f43f5e',
        borderWidth: 1,
        borderRadius: 5
      }
    ]
  };
});

// Chart Options
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#cbd5e1',
        font: { family: 'Inter, system-ui, sans-serif', size: 11 },
        padding: 12
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 10,
      bodyFont: { family: 'Inter, system-ui, sans-serif' }
    }
  }
};

const barOptionsRedesign = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: '#cbd5e1', font: { family: 'Inter, system-ui, sans-serif', size: 11 } }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 10
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' },
      ticks: { color: '#94a3b8', font: { family: 'Inter, system-ui, sans-serif', size: 10 } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' },
      ticks: {
        color: '#94a3b8',
        font: { family: 'Inter, system-ui, sans-serif', size: 10 },
        callback: (value) => formatAbbreviated(value)
      }
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* ── Greeting section ── */
.greeting-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.greeting-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f8fafc;
}
.greeting-subtitle {
  font-size: 0.95rem;
  color: #94a3b8;
}

/* Salary detection chip */
.salary-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8125rem;
  color: #cbd5e1;
  font-weight: 500;
}

/* Warning Alerts Banner */
.dashboard-alerts-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.alert-warning-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.alert-warning {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.25);
  color: #fbbf24;
}

.alert-danger {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.25);
  color: #f43f5e;
}

/* ── Date filter container ── */
.date-filter-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 12px;
  box-sizing: border-box;
}

/* Mobile selector box */
.filter-mobile-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mobile-select-box {
  position: relative;
  width: 100%;
}
.mobile-native-select {
  width: 100%;
  height: 44px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #f1f5f9;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  appearance: none;
  outline: none;
}
.select-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.75rem;
  pointer-events: none;
}
.mobile-custom-range-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.custom-range-row {
  display: flex;
  gap: 8px;
}
.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.input-group label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}
.date-input {
  height: 44px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #f1f5f9;
  border-radius: 10px;
  padding: 0 10px;
  font-size: 0.875rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.date-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}
.apply-filter-btn {
  height: 44px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.apply-filter-btn.full-width {
  width: 100%;
}
.apply-filter-btn:hover {
  transform: translateY(-1px);
}
.reset-filter-btn {
  height: 44px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0 16px;
  transition: all 0.2s;
}
.reset-filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.date-range-display-text {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 500;
  padding-left: 2px;
}

/* Desktop filter layout */
.filter-desktop-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.quick-pills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pill-btn {
  padding: 6px 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  color: #cbd5e1;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pill-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.4);
}
.pill-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.desktop-custom-range-picker {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.picker-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.picker-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

/* ── Simplified KPI Cards (2x2 on Mobile, 4 columns on desktop) ── */
.simplified-kpis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.kpi-card-redesign {
  background: rgba(30, 41, 59, 0.4);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
.card-header-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-emoji {
  font-size: 1.15rem;
}
.card-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}
.card-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-desc {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* Color Tints */
.tint-green {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.tint-red {
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.2);
}
.tint-blue {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.tint-purple {
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

/* ── Health Banner ── */
.health-banner-full {
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  box-sizing: border-box;
}
.banner-icon {
  font-size: 1rem;
}
.banner-great {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #34d399;
}
.banner-good {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #60a5fa;
}
.banner-warning {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
}
.banner-no-income {
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
}

/* ── Installment summary dashboard grid ── */
.installment-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
}

.inst-card {
  background: rgba(30, 41, 59, 0.4);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.inst-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.inst-card-emoji {
  font-size: 1.15rem;
}

.inst-card-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #cbd5e1;
  letter-spacing: 0.05em;
}

.inst-card-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inst-card-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.tint-indigo {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.tint-amber {
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.tint-rose {
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.2);
}

/* ── Charts section ── */
.dashboard-charts-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chart-card-redesign {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}
.chart-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f1f5f9;
}
.chart-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}
.chart-container-inner {
  position: relative;
  height: 240px;
  width: 100%;
  overflow: hidden;
}
.chart-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  color: #64748b;
  font-size: 0.8125rem;
  text-align: center;
}
.chart-empty-state .pi {
  font-size: 2rem;
  color: #475569;
}

/* ── Commitments Section ── */
.commitments-bottom-card {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}
.commitments-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f1f5f9;
}
.commitments-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}
.commitments-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.commitments-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.commitment-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #cbd5e1;
}
.commitment-item-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.commitment-item-amount {
  font-weight: 700;
  color: #94a3b8;
}
.commitments-divider-line {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}
.commitments-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #cbd5e1;
}
.commitments-total-row strong {
  font-size: 1rem;
  color: #f1f5f9;
}
.commitments-empty-msg {
  font-size: 0.8125rem;
  color: #64748b;
  text-align: center;
  padding: 12px 0;
}
.commitments-action-link {
  margin-top: 4px;
}
.commitments-link {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
  transition: opacity 0.2s;
  display: inline-block;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.commitments-link:hover {
  opacity: 0.8;
}

/* Responsive Hide/Show classes */
@media (max-width: 767px) {
  .desktop-only {
    display: none !important;
  }
}
@media (min-width: 768px) {
  .mobile-only {
    display: none !important;
  }
  
  .simplified-kpis-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .installment-summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .dashboard-charts-layout {
    flex-direction: row;
  }
  .dashboard-charts-layout > * {
    flex: 1;
    min-width: 0;
  }
  
  .date-filter-container {
    padding: 16px;
  }
  .quick-pills-container {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .desktop-custom-range-picker {
    flex-direction: row;
  }
  
  .greeting-title {
    font-size: 1.85rem;
  }
  .greeting-subtitle {
    font-size: 1rem;
  }
}
</style>
