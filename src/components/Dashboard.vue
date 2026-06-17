<template>
  <div class="dashboard-page">
    <!-- ── Date Range Filter Bar ── -->
    <div class="date-filter-bar">
      <!-- Quick Filter Pills -->
      <div class="quick-pills-container">
        <button 
          v-for="pill in quickFilterPills" 
          :key="pill.value" 
          class="pill-btn" 
          :class="{ active: activeQuickFilter === pill.value }"
          @click="applyQuickFilter(pill.value)"
        >
          {{ pill.label }}
        </button>
      </div>

      <!-- Custom Date Picker Inputs -->
      <div class="custom-range-picker">
        <div class="picker-group">
          <label class="picker-label">From</label>
          <input type="date" v-model="customFromDate" class="date-input" />
        </div>
        <div class="picker-group">
          <label class="picker-label">To</label>
          <input type="date" v-model="customToDate" class="date-input" />
        </div>
        <div class="picker-actions">
          <button class="apply-filter-btn" @click="applyCustomRange">Apply Range</button>
          <button class="reset-filter-btn" @click="resetFilters">Reset</button>
        </div>
      </div>
    </div>

    <!-- Active Filter Status -->
    <div class="date-range-display">
      <i class="pi pi-calendar"></i>
      <span>Showing data from <strong>{{ formattedDateRangeText }}</strong></span>
    </div>

    <!-- ── Summary Cards Grid ── -->
    <div class="cards-grid">
      <!-- Total Income -->
      <div class="card card--indigo">
        <div class="card-label">Total Income</div>
        <div class="card-value">{{ formatCurrency(totalIncomeFiltered) }}</div>
        <div class="card-hint">
          <i class="pi pi-info-circle"></i> Salary ({{ monthsCount }} mo) + Extra Income
        </div>
      </div>

      <!-- Total Expenses -->
      <div class="card card--rose">
        <div class="card-label">Total Expenses</div>
        <div class="card-value">{{ formatCurrency(totalExpensesFiltered) }}</div>
        <div class="card-hint">
          <i class="pi pi-chart-bar"></i> All outgoing transactions
        </div>
      </div>

      <!-- Net Balance -->
      <div class="card" :class="netBalanceFiltered >= 0 ? 'card--emerald' : 'card--red'">
        <div class="card-label">Net Balance</div>
        <div class="card-value">{{ formatCurrency(netBalanceFiltered) }}</div>
        <div class="card-hint">
          <i class="pi" :class="netBalanceFiltered >= 0 ? 'pi-check-circle' : 'pi-exclamation-circle'"></i>
          {{ netBalanceFiltered >= 0 ? 'Within budget' : 'Over budget' }}
        </div>
      </div>

      <!-- Disposable Income -->
      <div class="card card--emerald">
        <div class="card-label">Disposable Income</div>
        <div class="card-value">{{ formatCurrency(disposableIncome) }}</div>
        <div class="card-hint">
          <i class="pi pi-money-bill"></i> Income minus Fixed obligations
        </div>
      </div>

      <!-- Total Applied Commitments -->
      <div class="card card--purple">
        <div class="card-label font-bold">Applied Commitments</div>
        <div class="card-value">{{ formatCurrency(totalAppliedCommitmentsAmount) }}</div>
        <div class="card-hint">
          <i class="pi pi-check-square"></i> Logged commitments in range
        </div>
      </div>

      <!-- Savings Rate -->
      <div class="card card--indigo">
        <div class="card-label">Savings Rate</div>
        <div class="card-value" :class="savingsRate >= 15 ? 'text-emerald' : (savingsRate >= 0 ? 'text-amber' : 'text-rose')">
          {{ savingsRate.toFixed(1) }}%
        </div>
        <div class="card-hint">
          <i class="pi pi-percentage"></i> Net savings / Income ratio
        </div>
      </div>

      <!-- Transaction Count -->
      <div class="card card--slate">
        <div class="card-label">Transactions Count</div>
        <div class="card-value">{{ transactionCountFiltered }}</div>
        <div class="card-hint">
          <i class="pi pi-database"></i> {{ filteredTransactions.length }} exp / {{ filteredIncomes.length }} inc
        </div>
      </div>
    </div>

    <!-- ── KPI Secondary Grid ── -->
    <div class="kpis-grid">
      <div class="kpi-card">
        <span class="kpi-label">💰 Largest Expense</span>
        <span class="kpi-value">{{ formatCurrency(largestSingleExpense) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">📈 Peak Income Month</span>
        <span class="kpi-value kpi-value--small">{{ peakIncomeMonth }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">📉 Peak Expense Month</span>
        <span class="kpi-value kpi-value--small">{{ peakExpenseMonth }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">🧾 Avg Monthly Exp</span>
        <span class="kpi-value">{{ formatCurrency(avgMonthlyExpense) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">💵 Avg Monthly Inc</span>
        <span class="kpi-value">{{ formatCurrency(avgMonthlyIncome) }}</span>
      </div>
    </div>

    <!-- ── Dashboard Charts Grid ── -->
    <div class="dashboard-grid">
      <!-- 1. Income vs Expense Comparison -->
      <div class="chart-card chart-card--large">
        <div class="chart-card-header">
          <span class="chart-card-title">Income vs Expenses Comparison</span>
          <span class="chart-card-sub">Grouped bar comparison per month in range</span>
        </div>
        <div class="chart-wrapper">
          <Bar :data="barChartData" :options="barOptions" />
        </div>
      </div>

      <!-- 2. Monthly Net Savings Line Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-card-title">Monthly Net Savings</span>
          <span class="chart-card-sub">Income minus Expenses with zero baseline</span>
        </div>
        <div class="chart-wrapper">
          <Line :data="netSavingsChartData" :options="savingsLineOptions" />
        </div>
      </div>

      <!-- 3. Expense Trend Line Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-card-title">Expense Trend</span>
          <span class="chart-card-sub">Monthly expense totals over time</span>
        </div>
        <div class="chart-wrapper">
          <Line :data="expenseTrendChartData" :options="trendLineOptions" />
        </div>
      </div>

      <!-- 4. Top 5 Expense Categories Bar Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-card-title">Top 5 Expense Categories</span>
          <span class="chart-card-sub">Ranked by total spend</span>
        </div>
        <div class="chart-wrapper">
          <Bar v-if="hasFilteredExpenses" :data="topCategoriesChartData" :options="horizontalBarOptions" />
          <div v-else class="chart-empty">
            <i class="pi pi-chart-bar"></i>
            <span>No expense data available</span>
          </div>
        </div>
      </div>

      <!-- 5. Income Sources Donut Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-card-title">Income Sources Breakdown</span>
          <span class="chart-card-sub">Distribution of funds by source</span>
        </div>
        <div class="chart-wrapper">
          <Doughnut v-if="hasFilteredIncomes" :data="incomeSourcesChartData" :options="pieOptions" />
          <div v-else class="chart-empty">
            <i class="pi pi-chart-pie"></i>
            <span>No income data available</span>
          </div>
        </div>
      </div>

      <!-- 6. Commitments Type Breakdown Chart -->
      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-card-title">Commitments Breakdown</span>
          <span class="chart-card-sub">Distribution of applied obligations by type</span>
        </div>
        <div class="chart-wrapper">
          <Doughnut v-if="hasAppliedCommitments" :data="commitmentsBreakdownChartData" :options="pieOptions" />
          <div v-else class="chart-empty">
            <i class="pi pi-calendar-times"></i>
            <span>No applied commitments in range</span>
          </div>
        </div>
      </div>

      <!-- 7. Fixed Commitments Overview Widget -->
      <div class="chart-card chart-card--large">
        <div class="chart-card-header">
          <span class="chart-card-title">Applied Fixed Commitments Details</span>
          <span class="chart-card-sub">List of commitments applied during the selected date range</span>
        </div>
        
        <!-- Desktop Table view -->
        <DataTable 
          v-if="hasAppliedCommitments"
          :value="appliedCommitmentsInRange"
          class="modern-table desktop-table-only"
          :paginator="true"
          :rows="5"
          paginatorTemplate="PrevPageLink PageLinks NextPageLink"
        >
          <Column field="name" header="Name" sortable></Column>
          <Column field="amount" header="Amount" sortable>
            <template #body="{ data }">
              {{ formatCurrency(data.amount) }}
            </template>
          </Column>
          <Column field="type" header="Type" sortable>
            <template #body="{ data }">
              <span class="type-badge" :class="'badge--' + data.type.toLowerCase()">{{ data.type }}</span>
            </template>
          </Column>
          <Column field="recurrence" header="Recurrence" sortable></Column>
          <Column field="month" header="Month Applied" sortable>
            <template #body="{ data }">
              <span class="month-chip">{{ data.month }}</span>
            </template>
          </Column>
        </DataTable>

        <!-- Mobile card list view -->
        <div v-if="hasAppliedCommitments" class="mobile-table-list">
          <div v-for="item in appliedCommitmentsInRange" :key="item.id" class="mobile-widget-card">
            <div class="mwc-top">
              <span class="mwc-name">{{ item.name }}</span>
              <span class="mwc-amount">{{ formatCurrency(item.amount) }}</span>
            </div>
            <div class="mwc-bottom">
              <span class="type-badge" :class="'badge--' + item.type.toLowerCase()">{{ item.type }}</span>
              <span class="month-chip">{{ item.month }}</span>
            </div>
          </div>
        </div>

        <div v-else class="chart-empty" style="height: 150px;">
          <i class="pi pi-calendar-times"></i>
          <span>No commitments applied in this date range.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useTransactionStore } from '../stores/Transaction';
import { Bar, Line, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
);

const transactionStore = useTransactionStore();
const toast = useToast();

const formatCurrency = (v) =>
  (v !== undefined && v !== null)
    ? Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '$0.00';

// ── Date Filters & Persistence ──
const quickFilterPills = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'Last 90 Days', value: 'last90' },
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
    case 'yesterday':
      from = new Date(now);
      from.setDate(from.getDate() - 1);
      to = new Date(from);
      to.setHours(23, 59, 59, 999);
      break;
    case 'last7':
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      break;
    case 'last30':
      from = new Date(now);
      from.setDate(from.getDate() - 29);
      break;
    case 'last90':
      from = new Date(now);
      from.setDate(from.getDate() - 89);
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
  customFromDate.value = '';
  customToDate.value = '';
  const bounds = calculatePillDates(value);
  filterFromDate.value = bounds.from;
  filterToDate.value = bounds.to;
  saveFilterState();
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

const formattedDateRangeText = computed(() => {
  if (!filterFromDate.value || !filterToDate.value) return '';
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return `${filterFromDate.value.toLocaleDateString('en-US', options)} to ${filterToDate.value.toLocaleDateString('en-US', options)}`;
});

// ── Date Parser Helper ──
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else if (parts.length === 2) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
    }
  }
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else if (parts[2].length === 4) {
        return new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      }
    }
  }
  const d = new Date(dateStr);
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

// Count unique months within the filter range
const monthsCount = computed(() => {
  if (!filterFromDate.value || !filterToDate.value) return 1;
  const start = filterFromDate.value;
  const end = filterToDate.value;
  const sYear = start.getFullYear();
  const sMonth = start.getMonth();
  const eYear = end.getFullYear();
  const eMonth = end.getMonth();
  const diff = (eYear - sYear) * 12 + (eMonth - sMonth) + 1;
  return diff <= 0 ? 1 : diff;
});

const monthsInRange = computed(() => {
  if (!filterFromDate.value || !filterToDate.value) return [];
  const list = [];
  let current = new Date(filterFromDate.value.getFullYear(), filterFromDate.value.getMonth(), 1);
  const last = new Date(filterToDate.value.getFullYear(), filterToDate.value.getMonth(), 1);
  while (current <= last) {
    list.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    current.setMonth(current.getMonth() + 1);
  }
  return list;
});

const activeMonths = computed(() => {
  return monthsInRange.value;
});

// ── Filtered Summary Metrics ──
const totalExpensesFiltered = computed(() => {
  return filteredTransactions.value.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
});

const totalIncomeFiltered = computed(() => {
  const extraIncome = filteredIncomes.value.reduce((acc, i) => acc + Number(i.amount || 0), 0);
  const baseSalaryContribution = Number(transactionStore.salary || 0) * monthsCount.value;
  return extraIncome + baseSalaryContribution;
});

const netBalanceFiltered = computed(() => {
  return totalIncomeFiltered.value - totalExpensesFiltered.value;
});

const transactionCountFiltered = computed(() => {
  return filteredTransactions.value.length + filteredIncomes.value.length;
});

// ── Advanced KPIs ──
const disposableIncome = computed(() => {
  // Total Income minus expenses labeled as Type 'Fixed' (or commitment logs)
  const fixedExpenses = filteredTransactions.value
    .filter(t => t.Type === 'Fixed' || t.commitmentId)
    .reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
  return totalIncomeFiltered.value - fixedExpenses;
});

const appliedCommitmentsInRange = computed(() => {
  const rangeMonths = monthsInRange.value;
  const list = [];
  transactionStore.fixedCommitments.forEach(c => {
    const intersection = (c.appliedMonths || []).filter(m => rangeMonths.includes(m));
    intersection.forEach(m => {
      list.push({
        id: `${c.id}-${m}`,
        commitmentId: c.id,
        name: c.name,
        amount: c.amount,
        type: c.type,
        recurrence: c.recurrence,
        month: m
      });
    });
  });
  return list;
});

const totalAppliedCommitmentsAmount = computed(() => {
  return appliedCommitmentsInRange.value.reduce((acc, c) => acc + Number(c.amount || 0), 0);
});

const largestSingleExpense = computed(() => {
  if (filteredTransactions.value.length === 0) return 0;
  return Math.max(...filteredTransactions.value.map(t => Number(t.Transcation || 0)));
});

const monthlyBreakdownFiltered = computed(() => {
  const monthsMap = {};
  activeMonths.value.forEach(k => {
    monthsMap[k] = { income: Number(transactionStore.salary || 0), expense: 0 };
  });

  filteredTransactions.value.forEach(t => {
    const parsed = parseDate(t.date);
    if (parsed) {
      const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[key]) {
        monthsMap[key].expense += Number(t.Transcation || 0);
      }
    }
  });

  filteredIncomes.value.forEach(i => {
    const parsed = parseDate(i.date);
    if (parsed) {
      const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[key]) {
        monthsMap[key].income += Number(i.amount || 0);
      }
    }
  });

  return monthsMap;
});

const peakIncomeMonth = computed(() => {
  let maxVal = -1;
  let maxLabel = '—';
  Object.entries(monthlyBreakdownFiltered.value).forEach(([k, v]) => {
    if (v.income > maxVal) {
      maxVal = v.income;
      const [year, month] = k.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      maxLabel = `${d.toLocaleDateString('en-US', { month: 'short' })} ${year.slice(2)} (${formatCurrency(v.income)})`;
    }
  });
  return maxLabel;
});

const peakExpenseMonth = computed(() => {
  let maxVal = -1;
  let maxLabel = '—';
  Object.entries(monthlyBreakdownFiltered.value).forEach(([k, v]) => {
    if (v.expense > maxVal) {
      maxVal = v.expense;
      const [year, month] = k.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      maxLabel = `${d.toLocaleDateString('en-US', { month: 'short' })} ${year.slice(2)} (${formatCurrency(v.expense)})`;
    }
  });
  return maxLabel;
});

const avgMonthlyExpense = computed(() => {
  if (monthsCount.value <= 0) return 0;
  return totalExpensesFiltered.value / monthsCount.value;
});

const avgMonthlyIncome = computed(() => {
  if (monthsCount.value <= 0) return 0;
  return totalIncomeFiltered.value / monthsCount.value;
});

const savingsRate = computed(() => {
  if (totalIncomeFiltered.value <= 0) return 0;
  return (netBalanceFiltered.value / totalIncomeFiltered.value) * 100;
});

// ── Chart Configs ──
const hasFilteredExpenses = computed(() => filteredTransactions.value.length > 0);
const hasFilteredIncomes = computed(() => filteredIncomes.value.length > 0 || transactionStore.salary > 0);
const hasAppliedCommitments = computed(() => appliedCommitmentsInRange.value.length > 0);

const activeLabels = computed(() => {
  return activeMonths.value.map(k => {
    const [year, month] = k.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });
});

const barChartData = computed(() => {
  return {
    labels: activeLabels.value,
    datasets: [
      {
        label: 'Income',
        data: activeMonths.value.map(k => monthlyBreakdownFiltered.value[k]?.income || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 5
      },
      {
        label: 'Expenses',
        data: activeMonths.value.map(k => monthlyBreakdownFiltered.value[k]?.expense || 0),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: '#f43f5e',
        borderWidth: 1,
        borderRadius: 5
      }
    ]
  };
});

const netSavingsChartData = computed(() => {
  return {
    labels: activeLabels.value,
    datasets: [{
      label: 'Net Savings',
      data: activeMonths.value.map(k => {
        const item = monthlyBreakdownFiltered.value[k];
        return item ? item.income - item.expense : 0;
      }),
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#6366f1',
      borderWidth: 2,
      fill: true,
      tension: 0.35,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#fff'
    }]
  };
});

const expenseTrendChartData = computed(() => {
  return {
    labels: activeLabels.value,
    datasets: [{
      label: 'Total Expenses',
      data: activeMonths.value.map(k => monthlyBreakdownFiltered.value[k]?.expense || 0),
      backgroundColor: 'rgba(244, 63, 94, 0.08)',
      borderColor: '#f43f5e',
      borderWidth: 2,
      fill: true,
      tension: 0.35,
      pointBackgroundColor: '#f43f5e',
      pointBorderColor: '#fff'
    }]
  };
});

const topCategoriesChartData = computed(() => {
  const catMap = {};
  filteredTransactions.value.forEach(t => {
    const cat = t.Category || 'Uncategorized';
    catMap[cat] = (catMap[cat] || 0) + Number(t.Transcation || 0);
  });

  const sorted = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labels: sorted.map(i => i[0]),
    datasets: [{
      label: 'Spend Amount',
      data: sorted.map(i => i[1]),
      backgroundColor: 'rgba(139, 92, 246, 0.75)',
      borderColor: '#8b5cf6',
      borderWidth: 1,
      borderRadius: 5
    }]
  };
});

const incomeSourcesChartData = computed(() => {
  const srcMap = {};
  const baseSalaryTotal = Number(transactionStore.salary || 0) * monthsCount.value;
  if (baseSalaryTotal > 0) {
    srcMap['Base Salary'] = baseSalaryTotal;
  }
  filteredIncomes.value.forEach(i => {
    const src = i.source || 'Other Income';
    srcMap[src] = (srcMap[src] || 0) + Number(i.amount || 0);
  });

  return {
    labels: Object.keys(srcMap),
    datasets: [{
      data: Object.values(srcMap),
      backgroundColor: [
        '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a7f3d0'
      ],
      borderWidth: 1,
      borderColor: '#1e293b'
    }]
  };
});

const commitmentsBreakdownChartData = computed(() => {
  const group = {};
  appliedCommitmentsInRange.value.forEach(item => {
    group[item.type] = (group[item.type] || 0) + Number(item.amount || 0);
  });
  return {
    labels: Object.keys(group),
    datasets: [{
      data: Object.values(group),
      backgroundColor: [
        '#6366f1', '#fbbf24', '#f87171', '#a78bfa', '#4ade80', '#fb7185', '#94a3b8'
      ],
      borderWidth: 1,
      borderColor: '#1e293b'
    }]
  };
});

// ── Standard Chart Options ──
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#cbd5e1',
        font: { family: 'Inter, system-ui, sans-serif', size: 10 },
        padding: 12
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      padding: 10,
      bodyFont: { family: 'Inter, system-ui, sans-serif' }
    }
  }
};

const barOptions = {
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
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      padding: 10
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99, 102, 241, 0.15)' },
      ticks: { color: '#94a3b8', font: { family: 'Inter, system-ui, sans-serif', size: 10 } }
    },
    y: {
      grid: { color: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99, 102, 241, 0.15)' },
      ticks: {
        color: '#94a3b8',
        font: { family: 'Inter, system-ui, sans-serif', size: 10 },
        callback: (value) => '$' + value.toLocaleString()
      }
    }
  }
};

const horizontalBarOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      padding: 10
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99, 102, 241, 0.15)' },
      ticks: {
        color: '#94a3b8',
        font: { family: 'Inter, system-ui, sans-serif', size: 10 },
        callback: (value) => '$' + value.toLocaleString()
      }
    },
    y: {
      grid: { display: false },
      ticks: { color: '#cbd5e1', font: { family: 'Inter, system-ui, sans-serif', size: 10 } }
    }
  }
};

const savingsLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      padding: 10
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99, 102, 241, 0.15)' },
      ticks: { color: '#94a3b8', font: { family: 'Inter, system-ui, sans-serif', size: 10 } }
    },
    y: {
      grid: { color: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99, 102, 241, 0.15)' },
      ticks: {
        color: '#94a3b8',
        font: { family: 'Inter, system-ui, sans-serif', size: 10 },
        callback: (value) => '$' + value.toLocaleString()
      }
    }
  }
};

const trendLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      padding: 10
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99, 102, 241, 0.15)' },
      ticks: { color: '#94a3b8', font: { family: 'Inter, system-ui, sans-serif', size: 10 } }
    },
    y: {
      grid: { color: 'rgba(99, 102, 241, 0.06)', borderColor: 'rgba(99, 102, 241, 0.15)' },
      ticks: {
        color: '#94a3b8',
        font: { family: 'Inter, system-ui, sans-serif', size: 10 },
        callback: (value) => '$' + value.toLocaleString()
      }
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Date Filter Bar ── */
.date-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 20px;
  padding: 1.25rem;
}

.quick-pills-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(99,102,241,0.2) transparent;
}
.quick-pills-container::-webkit-scrollbar {
  height: 4px;
}
.quick-pills-container::-webkit-scrollbar-thumb {
  background: rgba(99,102,241,0.2);
  border-radius: 2px;
}

.pill-btn {
  padding: 0.4rem 0.875rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 9999px;
  color: #cbd5e1;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.pill-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.4);
  color: #f1f5f9;
}

.pill-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.custom-range-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  align-items: flex-end;
}

.picker-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
  min-width: 140px;
}

.picker-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.date-input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #f1f5f9;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.date-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.picker-actions {
  display: flex;
  gap: 0.5rem;
}

.apply-filter-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  height: 38px;
  white-space: nowrap;
}
.apply-filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.reset-filter-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  height: 38px;
}
.reset-filter-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f1f5f9;
}

.date-range-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
  padding-left: 0.25rem;
}
.date-range-display strong {
  color: #f1f5f9;
}

/* ── Summary Cards Grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
}
@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

.card {
  border-radius: 16px;
  padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent);
  pointer-events: none;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }

@media (min-width: 640px) { .card { padding: 1.25rem; border-radius: 20px; } }

.card--indigo { background: rgba(99, 102, 241, 0.12); border-color: rgba(99, 102, 241, 0.3); }
.card--rose   { background: rgba(244, 63, 94, 0.10); border-color: rgba(244, 63, 94, 0.25); }
.card--emerald{ background: rgba(16, 185, 129, 0.10); border-color: rgba(16, 185, 129, 0.25); }
.card--red    { background: rgba(239, 68, 68, 0.10); border-color: rgba(239, 68, 68, 0.25); }
.card--purple { background: rgba(139, 92, 246, 0.10); border-color: rgba(139, 92, 246, 0.25); }
.card--slate  { background: rgba(148, 163, 184, 0.08); border-color: rgba(148, 163, 184, 0.2); }

.card-label {
  font-size: clamp(0.6rem, 2vw, 0.75rem);
  font-weight: 700;
  color: rgba(148, 163, 184, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-value {
  font-size: clamp(0.75rem, 3.5vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f1f5f9;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-hint {
  font-size: clamp(0.55rem, 1.8vw, 0.68rem);
  color: rgba(148, 163, 184, 0.7);
  display: flex; align-items: center; gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.5rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-hint .pi { font-size: 0.68rem; }

.text-emerald { color: #34d399 !important; }
.text-amber { color: #fbbf24 !important; }
.text-rose { color: #f87171 !important; }

/* ── KPI Secondary Grid ── */
.kpis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
@media (min-width: 576px) {
  .kpis-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
}
@media (min-width: 992px) {
  .kpis-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }
}
.kpi-card {
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.kpi-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}
.kpi-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #e2e8f0;
}
.kpi-value--small {
  font-size: 0.75rem;
  font-weight: 700;
  color: #cbd5e1;
  word-break: break-all;
  line-height: 1.3;
}

/* ── Charts Grid ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 992px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-card--large {
    grid-column: span 2;
  }
}

.chart-card {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.chart-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.chart-card-title {
  font-size: 1.02rem;
  font-weight: 700;
  color: #f1f5f9;
}
.chart-card-sub {
  font-size: 0.72rem;
  color: #64748b;
}
.chart-wrapper {
  position: relative;
  height: 260px;
  width: 100%;
}
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  color: #475569;
  font-size: 0.875rem;
}
.chart-empty .pi {
  font-size: 2.25rem;
}

/* ── Widget Commitments Table & list ── */
.desktop-table-only {
  display: none;
}
.mobile-table-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
@media (min-width: 768px) {
  .desktop-table-only {
    display: block;
  }
  .mobile-table-list {
    display: none;
  }
}

.mobile-widget-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.mwc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mwc-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #f1f5f9;
}
.mwc-amount {
  font-size: 0.875rem;
  font-weight: 800;
  color: #6366f1;
}
.mwc-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-chip {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

/* Custom Select styling inside charts dashboard widgets */
:deep(.p-datatable) {
  background: transparent !important;
}
:deep(.p-datatable-thead > tr > th) {
  background: rgba(15, 23, 42, 0.4) !important;
  color: #94a3b8 !important;
  border-color: rgba(99, 102, 241, 0.15) !important;
  font-size: 0.8125rem !important;
  font-weight: 700 !important;
}
:deep(.p-datatable-tbody > tr) {
  background: transparent !important;
  color: #cbd5e1 !important;
  transition: background 0.2s;
}
:deep(.p-datatable-tbody > tr:hover) {
  background: rgba(99, 102, 241, 0.04) !important;
}
:deep(.p-datatable-tbody > tr > td) {
  border-color: rgba(255, 255, 255, 0.03) !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.875rem !important;
}
:deep(.p-paginator) {
  background: transparent !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  padding: 0.5rem !important;
}
</style>
