<template>
  <div class="transaction-page">
    <main class="app-main" style="padding: 0; max-width: 100%;">

      <!-- ── View Switcher + Table ── -->
      <div class="table-panel">

        <!-- Cycle Control Banner -->
        <div class="cycle-control-bar">
          <div class="cycle-title">
            <i class="pi pi-sync" style="color:#8b5cf6;"></i>
            <span>{{ i18nStore.t('salaryTracker') }} Cycle</span>
          </div>
          <div class="cycle-actions">
            <Button :label="i18nStore.t('btnResetMonth')" icon="pi pi-refresh" severity="danger" size="small" outlined :disabled="!transactionStore.isMonthStarted" @click="confirmResetMonth" />
            <Button :label="i18nStore.t('btnStartNextMonth')" icon="pi pi-step-forward" severity="success" size="small" :disabled="transactionStore.isMonthStarted" @click="confirmStartNextMonth" />
          </div>
        </div>

        <!-- Switcher -->
        <div class="switcher-bar">
          <button class="switcher-btn" :class="{ active: viewMode === 'expenses' }" @click="viewMode = 'expenses'">
            <i class="pi pi-arrow-up-right"></i> {{ i18nStore.t('expenses') }}
            <span class="switcher-badge">{{ transactionStore.transactions.length }}</span>
          </button>
          <button class="switcher-btn" :class="{ active: viewMode === 'incomes' }" @click="viewMode = 'incomes'">
            <i class="pi pi-arrow-down-left"></i> {{ i18nStore.t('incomes') }}
            <span class="switcher-badge">{{ transactionStore.incomes.length }}</span>
          </button>
        </div>

        <!-- ── EXPENSES VIEW ── -->
        <div v-if="viewMode === 'expenses'">
          <div class="table-actions">
            <div class="action-group">
              <Button :label="i18nStore.t('btnNew')" icon="pi pi-plus" size="small" :disabled="!transactionStore.isMonthStarted" @click="openNew" />
            </div>
            <div class="action-group">
              <Button :label="i18nStore.t('btnExport')" icon="pi pi-upload" severity="secondary" size="small" @click="exportCSV" />
            </div>
          </div>

          <!-- Desktop table -->
          <div class="w-full overflow-x-auto">
            <DataTable ref="dt" :value="expensesList"
                       dataKey="id" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 15, 20]" :filters="filters"
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                       class="modern-table desktop-table">
            <template #header>
              <div class="table-header" style="flex-wrap: wrap; gap: 0.75rem;">
                <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap: wrap;">
                  <span class="table-title">{{ i18nStore.t('expenses') }}</span>
                  <span class="expense-total-badge">{{ i18nStore.t('expenseTotal') }} {{ formatCurrency(transactionStore.totalExpenses) }}</span>
                  <Select v-model="selectedTypeFilter" :options="typeFilterOptions" :placeholder="i18nStore.t('filterType')" style="width: 140px; margin-left: 0.5rem;" />
                </div>
                <IconField class="search-field">
                  <InputIcon><i class="pi pi-search" /></InputIcon>
                  <InputText v-model="filters['global'].value" :placeholder="i18nStore.t('searchPlaceholder')" />
                </IconField>
              </div>
            </template>
            <Column field="date" header="Date" sortable style="min-width:7rem"></Column>
            <Column field="Transcation" :header="i18nStore.t('amount')" sortable style="min-width:8rem">
              <template #body="{ data }">
                <span class="amount-out">{{ formatCurrency(data.Transcation) }}</span>
              </template>
            </Column>
            <Column field="Type" :header="i18nStore.t('type')" sortable style="min-width:8rem">
              <template #body="{ data }">
                <span class="type-badge" :class="'badge--' + (data.Type || 'Variable').toLowerCase().replace(' ', '')">
                  {{ i18nStore.t('type' + (data.Type || 'Variable')) }}
                </span>
              </template>
            </Column>
            <Column field="Category" :header="i18nStore.t('category')" sortable style="min-width:9rem">
              <template #body="{ data }">
                <span class="category-chip">{{ data.Category || '—' }}</span>
              </template>
            </Column>
            <Column field="Reason" :header="i18nStore.t('reason')" sortable style="min-width:12rem">
              <template #body="{ data }">
                {{ data.Reason || '—' }}
              </template>
            </Column>
            <Column :exportable="false" style="min-width:6rem">
              <template #body="{ data }">
                <div class="row-actions">
                  <button class="row-btn" @click="editTransaction(data)"><i class="pi pi-pencil"></i></button>
                  <button class="row-btn row-btn--danger" @click="confirmDeleteTransaction(data)"><i class="pi pi-trash"></i></button>
                </div>
              </template>
            </Column>
            </DataTable>
          </div>

          <!-- Mobile cards -->
          <div class="mobile-list">
            <div class="table-header" style="padding:0.875rem 0.875rem 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <span class="table-title">{{ i18nStore.t('expenses') }}</span>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="expense-total-badge">{{ formatCurrency(transactionStore.totalExpenses) }}</span>
                <Select v-model="selectedTypeFilter" :options="typeFilterOptions" :placeholder="i18nStore.t('filterType')" style="width: 120px;" />
              </div>
            </div>
            <div class="mobile-search">
              <i class="pi pi-search"></i>
              <input v-model="mobileSearch" :placeholder="i18nStore.t('searchExpensesPlaceholder')" class="mobile-search-input" />
            </div>
            <div v-if="filteredExpenses.length === 0" class="mobile-empty">{{ i18nStore.t('noSpendingRecorded') }}</div>
            <div v-for="item in filteredExpenses" :key="item.id" class="mobile-card">
              <div class="mc-top">
                <span class="mc-amount amount-out">{{ formatCurrency(item.Transcation) }}</span>
                <span class="type-badge" :class="'badge--' + (item.Type || 'Variable').toLowerCase().replace(' ', '')">
                  {{ i18nStore.t('type' + (item.Type || 'Variable')) }}
                </span>
                <span class="category-chip">{{ item.Category || '—' }}</span>
              </div>
              <div class="mc-reason">{{ item.Reason || '—' }}</div>
              <div class="mc-bottom">
                <span class="mc-date"><i class="pi pi-calendar"></i> {{ item.date }}</span>
                <div class="row-actions">
                  <button class="row-btn" @click="editTransaction(item)"><i class="pi pi-pencil"></i></button>
                  <button class="row-btn row-btn--danger" @click="confirmDeleteTransaction(item)"><i class="pi pi-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── INCOMES VIEW ── -->
        <div v-if="viewMode === 'incomes'">
          <div class="table-actions">
            <div class="action-group">
              <Button :label="i18nStore.t('addIncome')" icon="pi pi-plus" size="small" class="add-income-btn" :disabled="!transactionStore.isMonthStarted" @click="openIncomeDialog" />
            </div>
            <div class="action-group">
              <Button :label="i18nStore.t('btnExport')" icon="pi pi-upload" severity="secondary" size="small" @click="exportIncomesCSV" />
            </div>
          </div>

          <!-- Desktop table -->
          <div class="w-full overflow-x-auto">
            <DataTable ref="dtIncomes" :value="transactionStore.incomes" dataKey="id" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 15, 20]"
                       paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                       class="modern-table desktop-table">
            <template #header>
              <div class="table-header">
                <span class="table-title">{{ i18nStore.t('incomes') }}</span>
                <span class="income-total-badge">{{ i18nStore.t('incomeTotal') }} {{ formatCurrency(transactionStore.totalExtraIncome) }}</span>
              </div>
            </template>
            <Column field="date" header="Date" sortable style="min-width:7rem"></Column>
            <Column field="amount" :header="i18nStore.t('amount')" sortable style="min-width:8rem">
              <template #body="{ data }">
                <span class="amount-in">+{{ formatCurrency(data.amount) }}</span>
              </template>
            </Column>
            <Column field="source" :header="i18nStore.t('source')" sortable style="min-width:10rem">
              <template #body="{ data }">
                {{ data.source }}
              </template>
            </Column>
            <Column field="note" :header="i18nStore.t('note')" style="min-width:12rem"></Column>
            <Column :exportable="false" style="min-width:6rem">
              <template #body="{ data }">
                <div class="row-actions">
                  <button class="row-btn" @click="editIncome(data)"><i class="pi pi-pencil"></i></button>
                  <button class="row-btn row-btn--danger" @click="removeIncome(data.id)"><i class="pi pi-trash"></i></button>
                </div>
              </template>
            </Column>
            </DataTable>
          </div>

          <!-- Mobile cards -->
          <div class="mobile-list">
            <div class="table-header" style="padding:0.875rem 0.875rem 0; display: flex; justify-content: space-between; align-items: center;">
              <span class="table-title">{{ i18nStore.t('incomes') }}</span>
              <span class="income-total-badge">{{ formatCurrency(transactionStore.totalExtraIncome) }}</span>
            </div>
            <div class="mobile-actions-row" style="padding: 0.5rem 0.875rem; display: flex; gap: 0.5rem;">
              <Button :label="i18nStore.t('addIncome')" icon="pi pi-plus" size="small" class="add-income-btn" style="width: 100%;" :disabled="!transactionStore.isMonthStarted" @click="openIncomeDialog" />
              <Button :label="i18nStore.t('btnExport')" icon="pi pi-upload" severity="secondary" size="small" @click="exportIncomesCSV" />
            </div>
            <div v-if="transactionStore.incomes.length === 0" class="mobile-empty">{{ i18nStore.t('historyEmpty') }}</div>
            <div v-for="item in transactionStore.incomes" :key="item.id" class="mobile-card mobile-card--income">
              <div class="mc-top">
                <span class="mc-amount amount-in">+{{ formatCurrency(item.amount) }}</span>
                <span class="mc-source">{{ item.source }}</span>
              </div>
              <div v-if="item.note" class="mc-reason">{{ item.note }}</div>
              <div class="mc-bottom">
                <span class="mc-date"><i class="pi pi-calendar"></i> {{ item.date }}</span>
                <div class="row-actions">
                  <button class="row-btn" @click="editIncome(item)"><i class="pi pi-pencil"></i></button>
                  <button class="row-btn row-btn--danger" @click="removeIncome(item.id)"><i class="pi pi-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ─────── DIALOGS ─────── -->

    <!-- Add/Edit Transaction -->
    <Dialog v-model:visible="transactionDialog" :style="{ width: '92vw', maxWidth: '460px' }"
            :header="transaction.id ? i18nStore.t('editCommitment') : i18nStore.t('newCommitment')" :modal="true" class="p-fluid">
      <div class="dialog-body">
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('amount') }}</label>
          <InputNumber v-model="transaction.Transcation" mode="currency" currency="USD" locale="en-US" fluid autofocus />
          <small v-if="submitted && !transaction.Transcation" class="field-error">{{ i18nStore.t('validationInstallmentRequired') }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('category') }}</label>
          <div class="cat-row">
            <Select v-model="transaction.Category" :options="categories" placeholder="Select category" filter class="flex-1" />
            <button class="icon-btn icon-btn--secondary" @click="showNewCategoryInput = !showNewCategoryInput">
              <i class="pi pi-plus"></i>
            </button>
          </div>
          <small v-if="submitted && !transaction.Category" class="field-error">{{ i18nStore.t('category') }} {{ i18nStore.t('validationNameRequired') }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('type') }}</label>
          <Select v-model="transaction.Type" :options="typesOptions" placeholder="Select type" fluid />
        </div>
        <div v-if="showNewCategoryInput" class="custom-cat-box">
          <label class="field-label">{{ i18nStore.t('newCategoryName') }}</label>
          <div class="cat-row">
            <InputText v-model="newCategoryName" placeholder="Category name..." class="flex-1" />
            <Button :label="i18nStore.t('btnAdd')" size="small" @click="addNewCategory" />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('reason') }}</label>
          <Textarea v-model="transaction.Reason" rows="3" placeholder="e.g. Grocery, Rent, Internet..." fluid />
        </div>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" icon="pi pi-times" text @click="hideDialog" />
        <Button :label="transaction.id ? i18nStore.t('btnUpdate') : i18nStore.t('btnSave')" icon="pi pi-check" @click="saveTransaction" />
      </template>
    </Dialog>

    <!-- Delete Single -->
    <Dialog v-model:visible="deleteTransactionDialog" :style="{ width: '92vw', maxWidth: '400px' }" :header="i18nStore.t('deleteExpenseHeader')" :modal="true">
      <div class="confirm-body">
        <div class="confirm-icon"><i class="pi pi-exclamation-triangle"></i></div>
        <p>{{ i18nStore.t('deleteExpenseConfirm') }}</p>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" text @click="deleteTransactionDialog = false" severity="secondary" />
        <Button :label="i18nStore.t('btnDelete')" icon="pi pi-trash" @click="deleteTransaction" severity="danger" />
      </template>
    </Dialog>

    <!-- Reset Month Confirmation -->
    <Dialog v-model:visible="resetMonthDialog" :style="{ width: '92vw', maxWidth: '440px' }" :header="i18nStore.t('resetMonthHeader')" :modal="true">
      <div class="confirm-body">
        <div class="confirm-icon"><i class="pi pi-exclamation-triangle"></i></div>
        <p>{{ i18nStore.t('resetMonthConfirm') }}</p>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" text @click="resetMonthDialog = false" severity="secondary" />
        <Button :label="i18nStore.t('btnResetMonth')" icon="pi pi-refresh" @click="handleResetMonth" severity="danger" />
      </template>
    </Dialog>

    <!-- Start Next Month Confirmation -->
    <Dialog v-model:visible="startNextMonthDialog" :style="{ width: '92vw', maxWidth: '440px' }" :header="i18nStore.t('startNextMonthHeader')" :modal="true">
      <div class="confirm-body">
        <div class="confirm-icon"><i class="pi pi-question-circle"></i></div>
        <p>{{ i18nStore.t('startNextMonthConfirm') }}</p>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" text @click="startNextMonthDialog = false" severity="secondary" />
        <Button :label="i18nStore.t('btnStartNextMonth')" icon="pi pi-step-forward" @click="handleStartNextMonth" severity="success" />
      </template>
    </Dialog>

    <!-- Add Income Dialog -->
    <Dialog v-model:visible="incomeDialog" :style="{ width: '92vw', maxWidth: '440px' }" :header="newIncome.id ? i18nStore.t('editIncome') : i18nStore.t('addIncome')" :modal="true" class="p-fluid">
      <div class="dialog-body">
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('amount') }}</label>
          <InputNumber v-model="newIncome.amount" mode="currency" currency="USD" locale="en-US" fluid autofocus @keyup.enter="addIncome" />
          <small v-if="incomeSubmitted && !newIncome.amount" class="field-error">{{ i18nStore.t('validationInstallmentRequired') }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('source') }}</label>
          <Select v-model="newIncome.source" :options="incomeSources" placeholder="Select source" filter fluid />
          <small v-if="incomeSubmitted && !newIncome.source" class="field-error">{{ i18nStore.t('source') }} {{ i18nStore.t('validationNameRequired') }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('note') }}</label>
          <InputText v-model="newIncome.note" placeholder="Any additional details..." fluid />
        </div>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" icon="pi pi-times" text @click="incomeDialog = false; incomeSubmitted = false" />
        <Button :label="newIncome.id ? i18nStore.t('editIncome') : i18nStore.t('addIncome')" icon="pi pi-check" class="add-income-btn" @click="addIncome" />
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useTransactionStore } from '../stores/Transaction';
import { useUserStore } from '../stores/user';
import { useI18nStore } from '../stores/i18n';
import { useRouter } from 'vue-router';

const transactionStore = useTransactionStore();
const userStore = useUserStore();
const i18nStore = useI18nStore();
const router = useRouter();
const toast = useToast();

const resetMonthDialog = ref(false);
const startNextMonthDialog = ref(false);

const confirmResetMonth = () => {
  resetMonthDialog.value = true;
};

const handleResetMonth = () => {
  transactionStore.archiveCurrentMonth();
  transactionStore.resetCurrentMonth();
  resetMonthDialog.value = false;
  toast.add({ 
    severity: 'success', 
    summary: i18nStore.t('toastSuccess'), 
    detail: i18nStore.t('toastArchived'), 
    life: 3000 
  });
};

const confirmStartNextMonth = () => {
  startNextMonthDialog.value = true;
};

const handleStartNextMonth = () => {
  transactionStore.startNextMonth();
  startNextMonthDialog.value = false;
  toast.add({ 
    severity: 'success', 
    summary: i18nStore.t('toastSuccess'), 
    detail: i18nStore.t('toastNextMonthStarted'), 
    life: 3000 
  });
};

onMounted(() => { 
  transactionStore.Setremind(); 
});

// ── View mode ──
const viewMode = ref('expenses');

// ── Currency ──
const formatCurrency = (v) =>
  (v !== undefined && v !== null)
    ? Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '$0.00';

// ── New Income ──
const incomeDialog = ref(false);
const incomeSubmitted = ref(false);
const newIncome = ref({ amount: null, source: '', note: '' });

const incomeSources = [
  'Salary', 'Bonus', 'Instapay', 'Freelance', 'Consulting', 'Business Revenue',
  'Part-time Job', 'Overtime Pay', 'Commission', 'Rental Income',
  'Dividends', 'Stock Returns', 'Capital Gains', 'Interest Income',
  'Pension', 'Government Grant', 'Scholarship', 'Inheritance',
  'Gift', 'Side Project', 'Online Sales', 'Royalties', 'Other'
];

const openIncomeDialog = () => {
  newIncome.value = { amount: null, source: '', note: '' };
  incomeSubmitted.value = false;
  incomeDialog.value = true;
};

const editIncome = (incomeDetails) => {
  newIncome.value = {
    id: incomeDetails.id,
    amount: Number(incomeDetails.amount || 0),
    source: incomeDetails.source || '',
    note: incomeDetails.note || '',
    date: incomeDetails.date || ''
  };
  incomeSubmitted.value = false;
  incomeDialog.value = true;
};

const addIncome = () => {
  incomeSubmitted.value = true;
  if (!newIncome.value.amount || !newIncome.value.source) return;
  
  if (newIncome.value.id) {
    transactionStore.UpdateIncome(newIncome.value);
    toast.add({ severity: 'success', summary: i18nStore.t('toastSuccess'), detail: `${i18nStore.t('toastUpdated')}: ${newIncome.value.source}`, life: 3000 });
  } else {
    transactionStore.AddIncome(newIncome.value);
    toast.add({ severity: 'success', summary: i18nStore.t('toastSuccess'), detail: `${i18nStore.t('toastAdded')}: +${formatCurrency(newIncome.value.amount)}`, life: 3000 });
  }
  newIncome.value = { amount: null, source: '', note: '' };
  incomeSubmitted.value = false;
  incomeDialog.value = false;
};

const removeIncome = (id) => {
  transactionStore.RemoveIncome(id);
  toast.add({ severity: 'success', summary: i18nStore.t('toastSuccess'), detail: i18nStore.t('toastDeleted'), life: 2000 });
};

// ── Categories ──
const defaultCategories = [
  'Investments thndr', 'Car', 'Maintenance', 'Services', 'Obligations',
  'Credit Card Payments', 'Gifts', 'Family', 'Cafes', 'Outings',
  'Clothes', 'Electronics', 'Travel', 'Transport', 'Work', 'Sports', 'Food', 'House'
];
const stored = localStorage.getItem('custom_categories');
const categories = ref(stored ? JSON.parse(stored) : defaultCategories);
const showNewCategoryInput = ref(false);
const newCategoryName = ref('');
const addNewCategory = () => {
  const name = newCategoryName.value.trim();
  if (name && !categories.value.includes(name)) {
    categories.value.push(name);
    localStorage.setItem('custom_categories', JSON.stringify(categories.value));
  }
  if (name) {
    transaction.value.Category = name;
    newCategoryName.value = '';
    showNewCategoryInput.value = false;
    toast.add({ severity: 'success', summary: i18nStore.t('toastSuccess'), detail: name, life: 2000 });
  }
};

// ── Expenses CRUD ──
const dt = ref();
const transactionDialog = ref(false);
const deleteTransactionDialog = ref(false);
const transaction = ref({});
const submitted = ref(false);
const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });

// ── Type Filtering & Dropdown Setup ──
const selectedTypeFilter = ref('All');
const typeFilterOptions = ['All', 'Fixed', 'Variable', 'One-time', 'Emergency', 'Investment', 'Personal'];
const typesOptions = ['Fixed', 'Variable', 'One-time', 'Emergency', 'Investment', 'Personal'];

const expensesList = computed(() => {
  let txns = transactionStore.transactions;
  if (selectedTypeFilter.value && selectedTypeFilter.value !== 'All') {
    txns = txns.filter(t => (t.Type || 'Variable') === selectedTypeFilter.value);
  }
  return txns;
});

// ── Mobile search & list ──
const mobileSearch = ref('');
const filteredExpenses = computed(() => {
  const q = mobileSearch.value.trim().toLowerCase();
  const base = expensesList.value;
  if (!q) return base;
  return base.filter(t =>
    (t.Reason || '').toLowerCase().includes(q) ||
    (t.Category || '').toLowerCase().includes(q) ||
    String(t.Transcation).includes(q) ||
    (t.date || '').toLowerCase().includes(q)
  );
});

const openNew = () => { 
  transaction.value = { Type: 'Variable' }; 
  submitted.value = false; 
  transactionDialog.value = true; 
};
const hideDialog = () => { transactionDialog.value = false; submitted.value = false; };

const saveTransaction = () => {
  submitted.value = true;
  if (transaction.value.Transcation && transaction.value.Category) {
    const payload = {
      ...transaction.value,
      Transcation: Number(transaction.value.Transcation),
      Type: transaction.value.Type || 'Variable'
    };
    if (payload.id) {
      transactionStore.UpdateTransaction(payload);
      toast.add({ severity: 'success', summary: i18nStore.t('toastSuccess'), detail: i18nStore.t('toastUpdated'), life: 3000 });
    } else {
      transactionStore.AddTransaction(payload);
      toast.add({ severity: 'success', summary: i18nStore.t('toastSuccess'), detail: i18nStore.t('toastAdded'), life: 3000 });
    }
    transactionDialog.value = false;
    transaction.value = {};
  }
};

const editTransaction = (txn) => { 
  transaction.value = { ...txn, Type: txn.Type || 'Variable' }; 
  transactionDialog.value = true; 
};
const confirmDeleteTransaction = (txn) => { transaction.value = txn; deleteTransactionDialog.value = true; };
const deleteTransaction = () => {
  transactionStore.RemoveTransaction(transaction.value.id);
  deleteTransactionDialog.value = false;
  transaction.value = {};
  toast.add({ severity: 'success', summary: i18nStore.t('toastSuccess'), detail: i18nStore.t('toastDeleted'), life: 2000 });
};

const exportCSV = () => dt.value.exportCSV();
const exportIncomesCSV = () => dtIncomes.value.exportCSV();
</script>

<style scoped>
/* ── Shell ── */
.app-shell {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  color: #f1f5f9;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ── Main ── */
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 0.875rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
@media (min-width: 640px) {
  .app-main { padding: 1.75rem 1.25rem 3rem; gap: 1.75rem; }
}

/* ── Summary Cards ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
@media (min-width: 640px) { .cards-grid { gap: 1rem; } }

.card {
  border-radius: 16px;
  padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.25rem;
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

@media (min-width: 640px) { .card { padding: 1.25rem; border-radius: 20px; } }

.card--indigo { background: rgba(99, 102, 241, 0.12); border-color: rgba(99, 102, 241, 0.3); }
.card--rose   { background: rgba(244, 63, 94, 0.10); border-color: rgba(244, 63, 94, 0.25); }
.card--emerald{ background: rgba(16, 185, 129, 0.10); border-color: rgba(16, 185, 129, 0.25); }
.card--red    { background: rgba(239, 68, 68, 0.10); border-color: rgba(239, 68, 68, 0.25); }

.card-label {
  font-size: clamp(0.6rem, 2vw, 0.75rem);
  font-weight: 600;
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
}

/* ── Icon Button ── */
.icon-btn {
  width: 28px; height: 28px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: rgba(203,213,225,0.8);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; cursor: pointer; transition: all 0.2s;
}
.icon-btn:hover { background: rgba(99,102,241,0.25); border-color: #6366f1; color: #a5b4fc; }
.icon-btn--secondary { width: 36px; height: 36px; font-size: 0.8rem; border-radius: 10px; }

.field-label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

.add-income-btn {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  border-color: transparent !important;
  font-weight: 700 !important;
}

/* ── Table Panel ── */
.table-panel {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 20px;
  overflow: hidden;
}

/* ── Switcher ── */
.switcher-bar {
  display: flex;
  border-bottom: 1px solid rgba(99,102,241,0.15);
}
.switcher-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 0.375rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.switcher-btn.active { color: #a5b4fc; background: rgba(99,102,241,0.1); }
.switcher-btn.active { border-bottom: 2px solid #6366f1; }
.switcher-badge {
  background: rgba(99,102,241,0.15);
  color: #a5b4fc;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
}
.switcher-btn.active .switcher-badge { background: rgba(99,102,241,0.35); }

/* ── Table Actions ── */
.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.875rem;
  justify-content: space-between;
  align-items: center;
}
.action-group { display: flex; gap: 0.375rem; flex-wrap: wrap; }

/* ── Table Header ── */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.table-title { font-size: 1rem; font-weight: 700; color: #e2e8f0; }
.income-total-badge {
  background: rgba(16,185,129,0.15);
  color: #34d399;
  font-size: 0.8rem; font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(16,185,129,0.3);
}
.expense-total-badge {
  background: rgba(244, 63, 94, 0.15);
  color: #f87171;
  font-size: 0.8rem; font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

/* ── Amount styles ── */
.amount-out { color: #f87171; font-weight: 700; }
.amount-in  { color: #34d399; font-weight: 700; }

/* ── Category Chip ── */
.category-chip {
  background: rgba(99,102,241,0.15);
  color: #a5b4fc;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(99,102,241,0.25);
  white-space: nowrap;
}

/* ── Row actions ── */
.row-actions { display: flex; gap: 0.375rem; }
.row-btn {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; cursor: pointer; transition: all 0.2s;
}
.row-btn:hover { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #a5b4fc; }
.row-btn--danger:hover { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #f87171; }

/* ── Search field ── */
.search-field { width: 100%; max-width: 220px; }

/* ── Dialog ── */
.dialog-body { display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0; }
.field-group { display: flex; flex-direction: column; gap: 0.375rem; }
.field-error { color: #f87171; font-size: 0.75rem; margin-top: 0.25rem; }
.cat-row { display: flex; gap: 0.5rem; align-items: center; }
.custom-cat-box {
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 12px;
  padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}

/* ── Confirm dialog ── */
.confirm-body { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; }
.confirm-icon { font-size: 2rem; color: #f59e0b; flex-shrink: 0; }

/* ── Details dialog ── */
.details-body { display: flex; flex-direction: column; gap: 0.875rem; padding: 0.5rem 0; }
.detail-row { display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(99,102,241,0.1); }
.detail-row--col { flex-direction: column; align-items: flex-start; gap: 0.375rem; }
.detail-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
.detail-value { font-size: 0.9375rem; color: #e2e8f0; font-weight: 500; }

/* ── PrimeVue overrides for dark theme ── */
:deep(.p-datatable) { background: transparent !important; }
:deep(.p-datatable-header) { background: transparent !important; border: none !important; padding: 0.5rem 0.875rem !important; }
:deep(.p-datatable-thead > tr > th) {
  background: rgba(99,102,241,0.08) !important;
  color: #94a3b8 !important;
  border-color: rgba(99,102,241,0.1) !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
}
:deep(.p-datatable-tbody > tr) { background: transparent !important; border-color: rgba(99,102,241,0.08) !important; transition: background 0.15s; }
:deep(.p-datatable-tbody > tr:hover) { background: rgba(99,102,241,0.07) !important; }
:deep(.p-datatable-tbody > tr > td) { border-color: rgba(99,102,241,0.08) !important; color: #cbd5e1 !important; font-size: 0.875rem !important; }
:deep(.p-paginator) { background: transparent !important; border: none !important; padding: 0.625rem !important; color: #64748b !important; }
:deep(.p-paginator-page.p-highlight) { background: #6366f1 !important; color: white !important; border-radius: 8px !important; }
:deep(.p-checkbox .p-checkbox-box) { background: rgba(99,102,241,0.1) !important; border-color: rgba(99,102,241,0.4) !important; border-radius: 6px !important; }
:deep(.p-checkbox .p-checkbox-box.p-highlight) { background: #6366f1 !important; border-color: #6366f1 !important; }
:deep(.p-toolbar) { background: transparent !important; border: none !important; padding: 0 !important; }
:deep(.p-inputtext), :deep(.p-inputnumber-input), :deep(.p-textarea) {
  background: rgba(30,41,59,0.8) !important;
  border-color: rgba(99,102,241,0.25) !important;
  color: #f1f5f9 !important;
  border-radius: 10px !important;
}
:deep(.p-inputtext:focus), :deep(.p-inputnumber-input:focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important;
}
:deep(.p-select), :deep(.p-select-panel) {
  background: #1e293b !important;
  border-color: rgba(99,102,241,0.25) !important;
  color: #f1f5f9 !important;
  border-radius: 10px !important;
}
:deep(.p-select-option:hover) { background: rgba(99,102,241,0.15) !important; }
:deep(.p-select-option.p-highlight) { background: rgba(99,102,241,0.25) !important; color: #a5b4fc !important; }
:deep(.p-dialog .p-dialog-header) { background: #1e293b !important; color: #f1f5f9 !important; border-bottom: 1px solid rgba(99,102,241,0.15) !important; border-radius: 16px 16px 0 0 !important; }
:deep(.p-dialog .p-dialog-content) { background: #1e293b !important; color: #f1f5f9 !important; }
:deep(.p-dialog .p-dialog-footer) { background: #1e293b !important; border-top: 1px solid rgba(99,102,241,0.1) !important; border-radius: 0 0 16px 16px !important; }
:deep(.p-dialog) { border-radius: 16px !important; box-shadow: 0 25px 80px rgba(0,0,0,0.6) !important; }

/* ─── Mobile / Desktop visibility ─── */
.desktop-table { display: none; }
.mobile-list { display: flex; flex-direction: column; }

@media (min-width: 768px) {
  .desktop-table { display: block; }
  .mobile-list { display: none; }
}

/* ─── Mobile search bar ─── */
.mobile-search {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(30,41,59,0.8);
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 12px;
  padding: 0.625rem 0.875rem;
  margin: 0.875rem 0.875rem 0.5rem;
}
.mobile-search .pi { color: #64748b; font-size: 0.875rem; flex-shrink: 0; }
.mobile-search-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #f1f5f9; font-size: 0.875rem; font-family: inherit;
}
.mobile-search-input::placeholder { color: #475569; }

/* ─── Mobile card ─── */
.mobile-empty {
  text-align: center; color: #475569; font-size: 0.875rem;
  padding: 2rem 1rem;
}
.mobile-card {
  background: rgba(30,41,59,0.7);
  border: 1px solid rgba(99,102,241,0.12);
  border-radius: 14px;
  margin: 0 0.875rem 0.625rem;
  padding: 0.875rem;
  display: flex; flex-direction: column; gap: 0.5rem;
  transition: background 0.2s;
}
.mobile-card:active { background: rgba(99,102,241,0.08); }
.mobile-card--income { border-color: rgba(16,185,129,0.2); }

.mc-top {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
}
.mc-amount {
  font-size: 1.125rem; font-weight: 800; letter-spacing: -0.02em;
}
.mc-reason {
  font-size: 0.875rem; color: #cbd5e1; line-height: 1.4;
  word-break: break-word;
}
.mc-source {
  font-size: 0.8125rem; font-weight: 600; color: #34d399;
}
.mc-bottom {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
  padding-top: 0.375rem;
  border-top: 1px solid rgba(99,102,241,0.1);
}
.mc-date {
  font-size: 0.75rem; color: #64748b;
  display: flex; align-items: center; gap: 0.25rem;
}
.mc-date .pi { font-size: 0.7rem; }

/* ── Cycle Control Banner ── */
.cycle-control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(30, 41, 59, 0.45);
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  flex-wrap: wrap;
  gap: 0.75rem;
}
.cycle-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #cbd5e1;
}
.cycle-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
