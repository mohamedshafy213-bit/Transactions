<template>
  <div class="history-page">
    <main class="app-main" style="padding: 0; max-width: 100%;">
      
      <!-- Page Header -->
      <div class="page-header-row mb-6">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <i class="pi pi-history text-indigo-400"></i>
          <span>{{ i18nStore.t('history') }}</span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          {{ i18nStore.t('monthMonthComparison') }}
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="!transactionStore.history || transactionStore.history.length === 0" class="empty-state-card text-center p-12">
        <div class="empty-state-icon mb-4 text-indigo-400">
          <i class="pi pi-folder-open text-5xl"></i>
        </div>
        <h2 class="text-xl font-bold text-slate-200 mb-2">{{ i18nStore.t('noHistory') }}</h2>
        <p class="text-slate-400 max-w-md mx-auto mb-6">
          Use the "Reset Month" button on the Transactions page to archive your current cycle and generate reports here.
        </p>
      </div>

      <!-- History Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="report in transactionStore.history" :key="report.id" class="card card--indigo history-item-card flex flex-col justify-between">
          <div class="card-top">
            <div class="flex justify-between items-start mb-2">
              <span class="report-period-badge">
                <i class="pi pi-calendar text-xs mr-1"></i>
                {{ report.startDate }} to {{ report.endDate }}
              </span>
              <span class="savings-rate-badge" :class="getSavingsRate(report) > 30 ? 'badge-high' : getSavingsRate(report) > 10 ? 'badge-med' : 'badge-low'">
                {{ getSavingsRate(report).toFixed(0) }}% Saved
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mt-4 py-2 border-b border-t border-indigo-500/10">
              <div>
                <span class="block text-xs uppercase tracking-wider text-slate-400">{{ i18nStore.t('moneyIn') }}</span>
                <span class="text-lg font-bold text-emerald-400">{{ formatCurrency(report.totalIncome) }}</span>
              </div>
              <div>
                <span class="block text-xs uppercase tracking-wider text-slate-400">{{ i18nStore.t('moneyOut') }}</span>
                <span class="text-lg font-bold text-rose-400">{{ formatCurrency(report.totalExpenses) }}</span>
              </div>
            </div>

            <div class="mt-4">
              <span class="block text-xs uppercase tracking-wider text-slate-400 mb-1">{{ i18nStore.t('leftOver') }}</span>
              <span class="text-xl font-extrabold text-slate-100">{{ formatCurrency(report.totalIncome - report.totalExpenses) }}</span>
            </div>
          </div>

          <div class="card-bottom mt-6 pt-4 border-t border-indigo-500/10">
            <Button 
              :label="i18nStore.t('viewReport')" 
              icon="pi pi-eye" 
              class="w-full text-sm font-semibold"
              outlined
              @click="openReport(report)" 
            />
          </div>
        </div>
      </div>

    </main>

    <!-- Monthly Report Details Modal -->
    <Dialog 
      v-model:visible="reportDialog" 
      :style="{ width: '92vw', maxWidth: '850px' }" 
      :header="i18nStore.t('archivedReportTitle', { start: selectedReport?.startDate, end: selectedReport?.endDate })" 
      :modal="true" 
      class="p-fluid report-detail-dialog"
    >
      <div v-if="selectedReport" class="dialog-report-content flex flex-col gap-6 py-4">
        
        <!-- Summary Cards Row -->
        <div class="grid grid-cols-3 gap-4">
          <div class="report-summary-card card--emerald p-4 rounded-xl flex flex-col gap-1 border border-emerald-500/20">
            <span class="text-xs uppercase tracking-wider text-slate-400">{{ i18nStore.t('moneyIn') }}</span>
            <span class="text-lg md:text-xl font-bold text-emerald-400">{{ formatCurrency(selectedReport.totalIncome) }}</span>
            <span class="text-xxs text-emerald-500/60 font-medium">Sum of all income streams</span>
          </div>
          <div class="report-summary-card card--rose p-4 rounded-xl flex flex-col gap-1 border border-rose-500/20">
            <span class="text-xs uppercase tracking-wider text-slate-400">{{ i18nStore.t('moneyOut') }}</span>
            <span class="text-lg md:text-xl font-bold text-rose-400">{{ formatCurrency(selectedReport.totalExpenses) }}</span>
            <span class="text-xxs text-rose-500/60 font-medium">Sum of all spending entries</span>
          </div>
          <div class="report-summary-card card--indigo p-4 rounded-xl flex flex-col gap-1 border border-indigo-500/20">
            <span class="text-xs uppercase tracking-wider text-slate-400">{{ i18nStore.t('leftOver') }}</span>
            <span class="text-lg md:text-xl font-bold text-indigo-400">{{ formatCurrency(selectedReport.totalIncome - selectedReport.totalExpenses) }}</span>
            <span class="text-xxs text-indigo-500/60 font-medium">{{ getSavingsRate(selectedReport).toFixed(0) }}% income savings rate</span>
          </div>
        </div>

        <!-- Top 5 Categories Progress Bars -->
        <div class="top-categories-box p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <i class="pi pi-chart-bar text-indigo-400"></i>
            {{ i18nStore.t('topSpendingCategories') }}
          </h3>
          
          <div v-if="getTopCategoriesList(selectedReport).length === 0" class="text-slate-400 text-xs text-center py-4">
            {{ i18nStore.t('noSpendingRecorded') }}
          </div>
          
          <div v-else class="flex flex-col gap-4">
            <div v-for="(cat, idx) in getTopCategoriesList(selectedReport)" :key="idx" class="category-progress-item">
              <div class="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1">
                <span class="category-chip">{{ cat.category }}</span>
                <span>{{ formatCurrency(cat.amount) }} ({{ getCategoryPercentage(cat.amount, selectedReport) }}%)</span>
              </div>
              <div class="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500" 
                  :style="{ width: `${getCategoryPercentage(cat.amount, selectedReport)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Details Tab Bar -->
        <div class="report-tables-container flex flex-col gap-4">
          <div class="switcher-bar">
            <button 
              class="switcher-btn" 
              :class="{ active: detailViewMode === 'expenses' }" 
              @click="detailViewMode = 'expenses'"
            >
              <i class="pi pi-arrow-up-right"></i> {{ i18nStore.t('expenses') }}
              <span class="switcher-badge">{{ selectedReport.transactions?.length || 0 }}</span>
            </button>
            <button 
              class="switcher-btn" 
              :class="{ active: detailViewMode === 'incomes' }" 
              @click="detailViewMode = 'incomes'"
            >
              <i class="pi pi-arrow-down-left"></i> {{ i18nStore.t('incomes') }}
              <span class="switcher-badge">{{ selectedReport.incomes?.length || 0 }}</span>
            </button>
          </div>

          <!-- Expenses Detail list -->
          <div v-if="detailViewMode === 'expenses'">
            <div class="w-full overflow-x-auto rounded-xl border border-slate-700/50">
              <DataTable 
                :value="selectedReport.transactions || []" 
                dataKey="id" 
                :paginator="true" 
                :rows="5"
                :rowsPerPageOptions="[5, 10, 15]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                class="modern-table text-xs"
              >
                <Column field="date" header="Date" sortable style="min-width:6rem"></Column>
                <Column field="Transcation" :header="i18nStore.t('amount')" sortable style="min-width:7rem">
                  <template #body="{ data }">
                    <span class="amount-out">{{ formatCurrency(data.Transcation) }}</span>
                  </template>
                </Column>
                <Column field="Category" :header="i18nStore.t('category')" sortable style="min-width:8rem">
                  <template #body="{ data }">
                    <span class="category-chip">{{ data.Category || '—' }}</span>
                  </template>
                </Column>
                <Column field="Type" :header="i18nStore.t('type')" sortable style="min-width:6rem">
                  <template #body="{ data }">
                    <span class="type-badge" :class="'badge--' + (data.Type || 'Variable').toLowerCase().replace(' ', '')">
                      {{ i18nStore.t('type' + (data.Type || 'Variable')) }}
                    </span>
                  </template>
                </Column>
                <Column field="Reason" :header="i18nStore.t('reason')" style="min-width:11rem">
                  <template #body="{ data }">
                    {{ data.Reason || '—' }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>

          <!-- Incomes Detail list -->
          <div v-if="detailViewMode === 'incomes'">
            <div class="w-full overflow-x-auto rounded-xl border border-slate-700/50">
              <DataTable 
                :value="selectedReport.incomes || []" 
                dataKey="id" 
                :paginator="true" 
                :rows="5"
                :rowsPerPageOptions="[5, 10, 15]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                class="modern-table text-xs"
              >
                <Column field="date" header="Date" sortable style="min-width:6rem"></Column>
                <Column field="amount" :header="i18nStore.t('amount')" sortable style="min-width:7rem">
                  <template #body="{ data }">
                    <span class="amount-in">+{{ formatCurrency(data.amount) }}</span>
                  </template>
                </Column>
                <Column field="source" :header="i18nStore.t('source')" sortable style="min-width:8rem">
                  <template #body="{ data }">
                    {{ data.source || '—' }}
                  </template>
                </Column>
                <Column field="note" :header="i18nStore.t('note')" style="min-width:11rem">
                  <template #body="{ data }">
                    {{ data.note || '—' }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>

      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" icon="pi pi-times" text @click="reportDialog = false" />
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTransactionStore } from '../stores/Transaction';
import { useI18nStore } from '../stores/i18n';

const transactionStore = useTransactionStore();
const i18nStore = useI18nStore();

const reportDialog = ref(false);
const selectedReport = ref(null);
const detailViewMode = ref('expenses');

const formatCurrency = (v) =>
  (v !== undefined && v !== null)
    ? Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '$0.00';

const getSavingsRate = (report) => {
  const income = report.totalIncome || 0;
  const expenses = report.totalExpenses || 0;
  if (income <= 0) return 0;
  return Math.min(100, Math.max(0, ((income - expenses) / income) * 100));
};

const getTopCategoriesList = (report) => {
  if (report.topCategories && report.topCategories.length > 0) {
    return report.topCategories;
  }
  // Resilient fallback logic
  const categorySums = {};
  (report.transactions || []).forEach(t => {
    const cat = t.Category || 'Uncategorized';
    const amt = Number(t.Transcation || 0);
    categorySums[cat] = (categorySums[cat] || 0) + amt;
  });
  return Object.entries(categorySums)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

const getCategoryPercentage = (amount, report) => {
  const total = report.totalExpenses || 0;
  if (total <= 0) return 0;
  return Number(((amount / total) * 100).toFixed(0));
};

const openReport = (report) => {
  selectedReport.value = report;
  detailViewMode.value = 'expenses';
  reportDialog.value = true;
};
</script>

<style scoped>
.history-page {
  font-family: 'Inter', system-ui, sans-serif;
  color: #f1f5f9;
}

.empty-state-card {
  background: rgba(30, 41, 59, 0.45);
  border: 1px dashed rgba(99, 102, 241, 0.25);
  border-radius: 20px;
}

.card {
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid;
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

.card--indigo { background: rgba(99, 102, 241, 0.12); border-color: rgba(99, 102, 241, 0.3); }
.card--emerald{ background: rgba(16, 185, 129, 0.10); border-color: rgba(16, 185, 129, 0.25); }
.card--rose   { background: rgba(244, 63, 94, 0.10); border-color: rgba(244, 63, 94, 0.25); }

.report-period-badge {
  background: rgba(99, 102, 241, 0.18);
  color: #cbd5e1;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid rgba(99, 102, 241, 0.35);
  display: inline-flex;
  align-items: center;
}

.savings-rate-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}
.badge-high { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.badge-med  { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.badge-low  { background: rgba(244, 63, 94, 0.2); color: #f87171; }

.category-chip {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid rgba(99, 102, 241, 0.25);
  white-space: nowrap;
}

.text-xxs {
  font-size: 0.65rem;
}

/* ── Switcher ── */
.switcher-bar {
  display: flex;
  border-bottom: 1px solid rgba(99,102,241,0.15);
}
.switcher-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 0.375rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.825rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.switcher-btn.active { color: #a5b4fc; background: rgba(99,102,241,0.1); }
.switcher-btn.active { border-bottom: 2px solid #6366f1; }
.switcher-badge {
  background: rgba(99,102,241,0.15);
  color: #a5b4fc;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border-radius: 9999px;
}
.switcher-btn.active .switcher-badge { background: rgba(99,102,241,0.35); }

/* ── Amount styles ── */
.amount-out { color: #f87171; font-weight: 700; }
.amount-in  { color: #34d399; font-weight: 700; }

/* ── PrimeVue overrides for dialog ── */
:deep(.p-datatable) { background: transparent !important; }
:deep(.p-datatable-header) { background: transparent !important; border: none !important; padding: 0.5rem 0.875rem !important; }
:deep(.p-datatable-thead > tr > th) {
  background: rgba(99,102,241,0.08) !important;
  color: #94a3b8 !important;
  border-color: rgba(99,102,241,0.1) !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
}
:deep(.p-datatable-tbody > tr) { background: transparent !important; border-color: rgba(99,102,241,0.08) !important; transition: background 0.15s; }
:deep(.p-datatable-tbody > tr:hover) { background: rgba(99,102,241,0.07) !important; }
:deep(.p-datatable-tbody > tr > td) { border-color: rgba(99,102,241,0.08) !important; color: #cbd5e1 !important; font-size: 0.825rem !important; }
:deep(.p-paginator) { background: transparent !important; border: none !important; padding: 0.5rem !important; color: #64748b !important; }
:deep(.p-paginator-page.p-highlight) { background: #6366f1 !important; color: white !important; border-radius: 8px !important; }

:deep(.p-dialog .p-dialog-header) { background: #1e293b !important; color: #f1f5f9 !important; border-bottom: 1px solid rgba(99,102,241,0.15) !important; border-radius: 16px 16px 0 0 !important; }
:deep(.p-dialog .p-dialog-content) { background: #1e293b !important; color: #f1f5f9 !important; }
:deep(.p-dialog .p-dialog-footer) { background: #1e293b !important; border-top: 1px solid rgba(99,102,241,0.1) !important; border-radius: 0 0 16px 16px !important; }
:deep(.p-dialog) { border-radius: 16px !important; box-shadow: 0 25px 80px rgba(0,0,0,0.6) !important; }

/* ── Type Badges ── */
.type-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
}
.badge--fixed { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.badge--variable { background: rgba(56,189,248,0.15); color: #38bdf8; }
.badge--onetime { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge--emergency { background: rgba(244,63,94,0.15); color: #f87171; }
.badge--investment { background: rgba(16,185,129,0.15); color: #34d399; }
.badge--personal { background: rgba(236,72,153,0.15); color: #f472b6; }
</style>
