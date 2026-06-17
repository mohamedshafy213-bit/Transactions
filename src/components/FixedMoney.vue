<template>
  <div class="fixed-money-page">
    
    <!-- ── Top Metrics ── -->
    <div class="metrics-grid">
      <!-- Total Monthly Commitments -->
      <div class="metric-card metric-card--primary">
        <div class="metric-label">{{ i18nStore.t('monthlyInstallmentsDue') }}</div>
        <div class="metric-value">{{ formatCurrency(totalMonthlyAmount) }}</div>
        <div class="metric-hint">
          <i class="pi pi-info-circle"></i> {{ i18nStore.t('monthlyDueDesc') }}
        </div>
      </div>

      <!-- Breakdown by Type -->
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">{{ i18nStore.t('leftOver') }} - {{ i18nStore.t('totalRemainingBalance') }}</div>
        <div class="metric-value font-bold" style="font-size: 1.5rem; color: #fb7185;">
          {{ formatCurrency(totalRemainingDebt) }}
        </div>
        <div class="metric-hint">
          <i class="pi pi-exclamation-circle"></i> {{ i18nStore.t('remainingBalanceDesc') }}
        </div>
      </div>
    </div>

    <!-- ── Main Panel ── -->
    <div class="table-panel">
      
      <!-- UX Actions: Search, Filter, Sort, Add -->
      <div class="table-actions">
        <div class="action-group">
          <Button :label="i18nStore.t('newCommitment')" icon="pi pi-plus" size="small" @click="openNew" />
        </div>
        
        <div class="action-group search-filter-row">
          <!-- Search Input -->
          <IconField class="search-field">
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText v-model="searchQuery" :placeholder="i18nStore.t('searchPlaceholder')" />
          </IconField>
          
          <!-- Status Filter -->
          <select v-model="selectedStatusFilter" class="ux-select">
            <option value="All">{{ i18nStore.t('filterAll') }}</option>
            <option value="Active">{{ i18nStore.t('filterActive') }}</option>
            <option value="Completed">{{ i18nStore.t('filterCompleted') }}</option>
            <option value="DueSoon">{{ i18nStore.t('filterDueSoon') }}</option>
            <option value="Overdue">{{ i18nStore.t('filterOverdue') }}</option>
          </select>
          
          <!-- Sort Dropdown -->
          <select v-model="selectedSort" class="ux-select">
            <option value="dueDate">{{ i18nStore.t('sortBy') }}: {{ i18nStore.t('sortDueDate') }}</option>
            <option value="progress">{{ i18nStore.t('sortBy') }}: {{ i18nStore.t('sortProgress') }}</option>
            <option value="amount">{{ i18nStore.t('sortBy') }}: {{ i18nStore.t('sortAmount') }}</option>
            <option value="name">{{ i18nStore.t('sortBy') }}: {{ i18nStore.t('sortName') }}</option>
          </select>
        </div>
      </div>

      <!-- Desktop Table View (Visible >= 768px) -->
      <div class="desktop-table-wrapper desktop-only">
        <table class="custom-installment-table">
          <thead>
            <tr>
              <th>{{ i18nStore.t('colName') }}</th>
              <th>{{ i18nStore.t('colTotalAmount') }}</th>
              <th>{{ i18nStore.t('colMonthlyPayment') }}</th>
              <th>{{ i18nStore.t('colPaidAmount') }}</th>
              <th>{{ i18nStore.t('colRemainingBalance') }}</th>
              <th>{{ i18nStore.t('colTotalMonths') }}</th>
              <th>{{ i18nStore.t('colRemainingMonths') }}</th>
              <th>{{ i18nStore.t('colNextDueDate') }}</th>
              <th>{{ i18nStore.t('colStatus') }}</th>
              <th>{{ i18nStore.t('colProgress') }}</th>
              <th>{{ i18nStore.t('colActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredCommitments.length === 0">
              <td colspan="11" class="table-empty-row">{{ i18nStore.t('noSpendingRecorded') }}</td>
            </tr>
            <tr v-for="item in filteredCommitments" :key="item.id">
              <td>
                <div class="item-name-cell">
                  <span class="item-title-name">{{ item.name }}</span>
                  <span class="type-badge badge-inline" :class="'badge--' + item.type.toLowerCase()">{{ i18nStore.t('type' + item.type) }}</span>
                </div>
              </td>
              <td>{{ formatCurrency(item.totalAmount) }}</td>
              <td>{{ formatCurrency(item.installmentAmount || item.amount) }}</td>
              <td>{{ formatCurrency(getStats(item).paidAmount) }}</td>
              <td>{{ formatCurrency(getStats(item).remainingBalance) }}</td>
              <td>{{ item.totalMonths }}</td>
              <td>{{ getStats(item).remainingMonths }}</td>
              <td>
                <span class="due-date-text" :class="getDateColorClass(item)">
                  {{ getStats(item).nextPaymentDate || '—' }}
                </span>
              </td>
              <td>
                <span class="status-chip" :class="'status-' + item.status.toLowerCase()">
                  {{ i18nStore.t('status' + item.status) }}
                </span>
              </td>
              <td>
                <div class="table-progress-container">
                  <div class="progress-bar-bg">
                    <div 
                      class="progress-bar-fill" 
                      :class="getProgressColor(item)"
                      :style="{ width: getStats(item).progress + '%' }"
                    ></div>
                  </div>
                  <span class="progress-pct">{{ getStats(item).progress.toFixed(0) }}%</span>
                </div>
              </td>
              <td>
                <div class="action-buttons-cell">
                  <!-- Quick actions -->
                  <button 
                    v-if="item.status === 'Active'" 
                    class="quick-action-btn btn-action-paid"
                    @click="markAsPaid(item)"
                    :title="i18nStore.t('btnPaid')"
                  >
                    💰
                  </button>
                  <button 
                    v-if="item.status === 'Active'" 
                    class="quick-action-btn btn-action-skip"
                    @click="promptSkip(item)"
                    :title="i18nStore.t('btnSkip')"
                  >
                    ⏭️
                  </button>
                  <button 
                    class="quick-action-btn btn-action-history"
                    @click="viewHistory(item)"
                    :title="i18nStore.t('btnHistory')"
                  >
                    📜
                  </button>
                  <button class="quick-action-btn" @click="editCommitment(item)" :title="i18nStore.t('btnEdit')">
                    ✏️
                  </button>
                  <button class="quick-action-btn btn-delete" @click="confirmDeleteCommitment(item)" :title="i18nStore.t('btnDelete')">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards List View (Visible < 768px) -->
      <div class="mobile-list-view mobile-only">
        <div v-if="filteredCommitments.length === 0" class="mobile-empty">
          {{ i18nStore.t('noSpendingRecorded') }}
        </div>
        <div v-for="item in filteredCommitments" :key="item.id" class="mobile-installment-card">
          <div class="mic-top-row">
            <div class="mic-title-block">
              <span class="mic-title">{{ item.name }}</span>
              <span class="type-badge" :class="'badge--' + item.type.toLowerCase()">{{ i18nStore.t('type' + item.type) }}</span>
            </div>
            <span class="status-chip" :class="'status-' + item.status.toLowerCase()">
              {{ i18nStore.t('status' + item.status) }}
            </span>
          </div>

          <div class="mic-details-grid">
            <div class="mic-detail-item">
              <span class="mcd-label">{{ i18nStore.t('colTotalAmount') }}</span>
              <span class="mcd-value">{{ formatCurrency(item.totalAmount) }}</span>
            </div>
            <div class="mic-detail-item">
              <span class="mcd-label">{{ i18nStore.t('colMonthlyPayment') }}</span>
              <span class="mcd-value font-bold" style="color: #818cf8;">{{ formatCurrency(item.installmentAmount || item.amount) }}</span>
            </div>
            <div class="mic-detail-item">
              <span class="mcd-label">{{ i18nStore.t('colPaidAmount') }}</span>
              <span class="mcd-value">{{ formatCurrency(getStats(item).paidAmount) }}</span>
            </div>
            <div class="mic-detail-item">
              <span class="mcd-label">{{ i18nStore.t('colRemainingBalance') }}</span>
              <span class="mcd-value" style="color: #fb7185;">{{ formatCurrency(getStats(item).remainingBalance) }}</span>
            </div>
            <div class="mic-detail-item">
              <span class="mcd-label">{{ i18nStore.t('colTotalMonths') }}</span>
              <span class="mcd-value">{{ item.totalMonths }} mo</span>
            </div>
            <div class="mic-detail-item">
              <span class="mcd-label">{{ i18nStore.t('colRemainingMonths') }}</span>
              <span class="mcd-value">{{ getStats(item).remainingMonths }} mo</span>
            </div>
          </div>

          <div class="mic-due-row">
            <span class="mic-due-label">{{ i18nStore.t('colNextDueDate') }}:</span>
            <span class="mic-due-val" :class="getDateColorClass(item)">
              {{ getStats(item).nextPaymentDate || '—' }}
            </span>
          </div>

          <div class="mic-progress-row">
            <div class="progress-bar-bg">
              <div 
                class="progress-bar-fill" 
                :class="getProgressColor(item)"
                :style="{ width: getStats(item).progress + '%' }"
              ></div>
            </div>
            <span class="progress-pct">{{ getStats(item).progress.toFixed(0) }}%</span>
          </div>

          <div class="mic-actions-footer">
            <!-- Mobile touch actions -->
            <button 
              v-if="item.status === 'Active'" 
              class="mobile-action-btn btn-mob-paid"
              @click="markAsPaid(item)"
            >
              💰 {{ i18nStore.t('btnPaid') }}
            </button>
            <button 
              v-if="item.status === 'Active'" 
              class="mobile-action-btn btn-mob-skip"
              @click="promptSkip(item)"
            >
              ⏭️ {{ i18nStore.t('btnSkip') }}
            </button>
            <button 
              class="mobile-action-btn btn-mob-history"
              @click="viewHistory(item)"
            >
              📜 {{ i18nStore.t('btnHistory') }}
            </button>
            <button class="mobile-action-btn" @click="editCommitment(item)">
              ✏️ {{ i18nStore.t('btnEdit') }}
            </button>
            <button class="mobile-action-btn btn-mob-delete" @click="confirmDeleteCommitment(item)">
              🗑️ {{ i18nStore.t('btnDelete') }}
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Dialogs ── -->

    <!-- Add/Edit Commitment Dialog -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :style="{ width: '92vw', maxWidth: '520px' }"
      :header="commitment.id ? i18nStore.t('editCommitment') : i18nStore.t('newCommitment')" 
      :modal="true" 
      class="p-fluid"
    >
      <div class="dialog-body">
        <!-- Name -->
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('fieldName') }}</label>
          <InputText v-model="commitment.name" placeholder="e.g. Car Loan, iPhone installment..." fluid autofocus />
          <small v-if="submitted && !commitment.name" class="field-error">{{ i18nStore.t('validationNameRequired') }}</small>
        </div>

        <!-- Total Amount & Monthly Installment side-by-side -->
        <div class="fields-row-grid">
          <div class="field-group">
            <label class="field-label">{{ i18nStore.t('fieldTotalAmount') }}</label>
            <InputNumber v-model="commitment.totalAmount" mode="currency" currency="USD" locale="en-US" :min="0" fluid />
            <small v-if="submitted && (!commitment.totalAmount || commitment.totalAmount <= 0)" class="field-error">{{ i18nStore.t('validationTotalRequired') }}</small>
          </div>
          <div class="field-group">
            <label class="field-label">{{ i18nStore.t('fieldInstallmentAmount') }}</label>
            <InputNumber v-model="commitment.installmentAmount" mode="currency" currency="USD" locale="en-US" :min="0" fluid />
            <small v-if="submitted && (!commitment.installmentAmount || commitment.installmentAmount <= 0)" class="field-error">{{ i18nStore.t('validationInstallmentRequired') }}</small>
          </div>
        </div>

        <!-- Duration Months & Start Date side-by-side -->
        <div class="fields-row-grid">
          <div class="field-group">
            <label class="field-label">{{ i18nStore.t('fieldTotalMonths') }}</label>
            <InputNumber v-model="commitment.totalMonths" :min="1" fluid />
            <small v-if="submitted && (!commitment.totalMonths || commitment.totalMonths < 1)" class="field-error">{{ i18nStore.t('validationMonthsRequired') }}</small>
          </div>
          <div class="field-group">
            <label class="field-label">{{ i18nStore.t('fieldStartDate') }}</label>
            <input type="date" v-model="commitment.startDate" class="dialog-date-input" />
            <small v-if="submitted && !commitment.startDate" class="field-error">{{ i18nStore.t('validationStartRequired') }}</small>
          </div>
        </div>

        <!-- Due Day & Commitment Type -->
        <div class="fields-row-grid">
          <div class="field-group">
            <label class="field-label">{{ i18nStore.t('fieldDueDay') }}</label>
            <InputNumber v-model="commitment.dueDay" :min="1" :max="31" fluid />
            <small v-if="submitted && (!commitment.dueDay || commitment.dueDay < 1 || commitment.dueDay > 31)" class="field-error">{{ i18nStore.t('validationDueDayRequired') }}</small>
          </div>
          <div class="field-group">
            <label class="field-label">{{ i18nStore.t('fieldType') }}</label>
            <Select 
              v-model="commitment.type" 
              :options="typesList" 
              :placeholder="i18nStore.t('fieldType')" 
              fluid 
            >
              <template #option="slotProps">
                {{ i18nStore.t('type' + slotProps.option) }}
              </template>
            </Select>
          </div>
        </div>

        <!-- Status -->
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('fieldStatus') }}</label>
          <Select 
            v-model="commitment.status" 
            :options="statusOptions" 
            placeholder="Select status" 
            fluid 
          >
            <template #option="slotProps">
              {{ i18nStore.t('status' + slotProps.option) }}
            </template>
          </Select>
        </div>

        <!-- Notes -->
        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('fieldNotes') }}</label>
          <Textarea v-model="commitment.notes" rows="2" placeholder="Notes..." fluid />
        </div>
      </div>
      
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" icon="pi pi-times" text @click="hideDialog" />
        <Button :label="commitment.id ? i18nStore.t('btnUpdate') : i18nStore.t('btnSave')" icon="pi pi-check" @click="saveCommitment" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteVisible" 
      :style="{ width: '92vw', maxWidth: '400px' }" 
      :header="i18nStore.t('confirmDeleteHeader')" 
      :modal="true"
    >
      <div class="confirm-body">
        <i class="pi pi-exclamation-triangle confirm-icon"></i>
        <span>{{ i18nStore.t('confirmDeleteMsg', { name: commitment.name }) }}</span>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" icon="pi pi-times" text @click="deleteVisible = false" />
        <Button :label="i18nStore.t('btnDelete')" icon="pi pi-check" severity="danger" @click="deleteCommitment" />
      </template>
    </Dialog>

    <!-- Skip Month Confirmation Dialog -->
    <Dialog 
      v-model:visible="skipVisible" 
      :style="{ width: '92vw', maxWidth: '400px' }" 
      :header="i18nStore.t('confirmSkipHeader')" 
      :modal="true"
    >
      <div class="confirm-body">
        <i class="pi pi-exclamation-triangle confirm-icon" style="color: #fbbf24;"></i>
        <span>{{ i18nStore.t('confirmSkipMsg', { name: commitmentToSkip?.name }) }}</span>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" icon="pi pi-times" text @click="skipVisible = false" />
        <Button :label="i18nStore.t('btnSkip')" icon="pi pi-check" severity="warning" @click="confirmSkip" />
      </template>
    </Dialog>

    <!-- Payment History Modal Dialog -->
    <Dialog 
      v-model:visible="historyVisible" 
      :style="{ width: '92vw', maxWidth: '600px' }" 
      :header="i18nStore.t('paymentHistoryTitle', { name: commitmentForHistory?.name })" 
      :modal="true"
    >
      <div class="history-dialog-body">
        <table class="history-table-grid">
          <thead>
            <tr>
              <th>{{ i18nStore.t('historyColInstallmentNum') }}</th>
              <th>{{ i18nStore.t('historyColDate') }}</th>
              <th>{{ i18nStore.t('historyColAmount') }}</th>
              <th>{{ i18nStore.t('historyColNotes') }}</th>
              <th>{{ i18nStore.t('colActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paymentsHistory.length === 0">
              <td colspan="5" class="table-empty-row">{{ i18nStore.t('historyEmpty') }}</td>
            </tr>
            <tr v-for="(p, idx) in paymentsHistory" :key="p.id">
              <td>#{{ idx + 1 }}</td>
              <td>{{ p.payment_date }}</td>
              <td>
                <span v-if="p.isSkipped" style="color:#94a3b8;font-weight:700;">{{ i18nStore.t('historySkip') }}</span>
                <span v-else>{{ formatCurrency(p.amount) }}</span>
              </td>
              <td>{{ p.notes }}</td>
              <td>
                <button class="row-btn row-btn--danger" @click="deleteHistoryPayment(p.id)">
                  <i class="pi pi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" icon="pi pi-times" text @click="historyVisible = false" />
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTransactionStore, getInstallmentStats } from '../stores/Transaction';
import { useI18nStore } from '../stores/i18n';
import { useToast } from 'primevue/usetoast';

const transactionStore = useTransactionStore();
const i18nStore = useI18nStore();
const toast = useToast();

// Dictionaries lists
const typesList = ['Bill', 'Loan', 'Installment', 'Subscription', 'Other'];
const statusOptions = ['Active', 'Completed', 'Paused'];

// UX Search & filters state
const searchQuery = ref('');
const selectedStatusFilter = ref('All');
const selectedSort = ref('dueDate');

// Dialog visibility states
const dialogVisible = ref(false);
const deleteVisible = ref(false);
const skipVisible = ref(false);
const historyVisible = ref(false);
const submitted = ref(false);

// Refs for target items
const commitmentToSkip = ref(null);
const commitmentForHistory = ref(null);

const commitment = ref({
  id: null,
  name: '',
  totalAmount: null,
  installmentAmount: null,
  totalMonths: null,
  startDate: '',
  dueDay: null,
  type: 'Bill',
  status: 'Active',
  notes: '',
  appliedMonths: []
});

// Dynamic calculations
const totalMonthlyAmount = computed(() => {
  return transactionStore.fixedCommitments
    .filter(c => c.status === 'Active')
    .reduce((acc, c) => acc + Number(c.installmentAmount || c.amount || 0), 0);
});

const totalRemainingDebt = computed(() => {
  return transactionStore.fixedCommitments
    .filter(c => c.status === 'Active')
    .reduce((acc, c) => {
      const stats = getInstallmentStats(c, transactionStore.installmentPayments);
      return acc + stats.remainingBalance;
    }, 0);
});

const getStats = (item) => {
  return getInstallmentStats(item, transactionStore.installmentPayments);
};

const getProgressColor = (item) => {
  const stats = getStats(item);
  if (item.status === 'Completed' || stats.progress >= 100) return 'progress-green';
  
  if (item.status === 'Active' && stats.nextPaymentDate) {
    const nextDate = new Date(stats.nextPaymentDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'progress-red';
    if (diffDays <= 7) return 'progress-orange';
  }
  return 'progress-blue';
};

const getDateColorClass = (item) => {
  const stats = getStats(item);
  if (item.status !== 'Active' || !stats.nextPaymentDate) return '';
  const nextDate = new Date(stats.nextPaymentDate);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'text-red font-bold';
  if (diffDays <= 7) return 'text-orange font-bold';
  return 'text-green';
};

const filteredCommitments = computed(() => {
  let list = transactionStore.fixedCommitments;
  
  // Status filter
  const statusF = selectedStatusFilter.value;
  if (statusF !== 'All') {
    list = list.filter(c => {
      const stats = getStats(c);
      if (statusF === 'Active') return c.status === 'Active';
      if (statusF === 'Completed') return c.status === 'Completed';
      if (statusF === 'Paused') return c.status === 'Paused';
      
      if (statusF === 'DueSoon') {
        if (c.status !== 'Active') return false;
        const nextDateStr = stats.nextPaymentDate;
        if (!nextDateStr) return false;
        const nextDate = new Date(nextDateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }
      
      if (statusF === 'Overdue') {
        if (c.status !== 'Active') return false;
        const nextDateStr = stats.nextPaymentDate;
        if (!nextDateStr) return false;
        const nextDate = new Date(nextDateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        return nextDate < today;
      }
      return true;
    });
  }
  
  // Search query
  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    list = list.filter(c => 
      (c.name || '').toLowerCase().includes(query) ||
      (c.notes || '').toLowerCase().includes(query) ||
      (c.type || '').toLowerCase().includes(query)
    );
  }
  
  // Sort
  const sortVal = selectedSort.value;
  list = [...list].sort((a, b) => {
    const statsA = getStats(a);
    const statsB = getStats(b);
    
    if (sortVal === 'dueDate') {
      const dateA = statsA.nextPaymentDate || '9999-99-99';
      const dateB = statsB.nextPaymentDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    }
    if (sortVal === 'progress') {
      return statsB.progress - statsA.progress;
    }
    if (sortVal === 'amount') {
      return (b.installmentAmount || b.amount || 0) - (a.installmentAmount || a.amount || 0);
    }
    if (sortVal === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });
  
  return list;
});

// History payments
const paymentsHistory = computed(() => {
  if (!commitmentForHistory.value) return [];
  return transactionStore.installmentPayments.filter(p => p.installment_id === commitmentForHistory.value.id);
});

// Formatting
const formatCurrency = (v) => {
  return (v !== undefined && v !== null)
    ? Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '$0.00';
};

// Quick Actions
const markAsPaid = (item) => {
  const nextPaymentDate = getStats(item).nextPaymentDate;
  transactionStore.AddInstallmentPayment(item.id, item.installmentAmount || item.amount, nextPaymentDate);
  toast.add({
    severity: 'success',
    summary: i18nStore.t('toastSuccess'),
    detail: `${item.name}: Payment logged successfully`,
    life: 3000
  });
};

const promptSkip = (item) => {
  commitmentToSkip.value = item;
  skipVisible.value = true;
};

const confirmSkip = () => {
  if (commitmentToSkip.value) {
    const nextPaymentDate = getStats(commitmentToSkip.value).nextPaymentDate;
    transactionStore.SkipInstallmentMonth(commitmentToSkip.value.id, nextPaymentDate);
    toast.add({
      severity: 'warn',
      summary: i18nStore.t('toastSuccess'),
      detail: `${commitmentToSkip.value.name}: Payment skipped for this month`,
      life: 3000
    });
  }
  skipVisible.value = false;
  commitmentToSkip.value = null;
};

const viewHistory = (item) => {
  commitmentForHistory.value = item;
  historyVisible.value = true;
};

const deleteHistoryPayment = (paymentId) => {
  transactionStore.DeleteInstallmentPayment(paymentId);
  toast.add({
    severity: 'info',
    summary: i18nStore.t('toastDeleted'),
    detail: `Logged payment removed`,
    life: 3000
  });
};

const openNew = () => {
  commitment.value = {
    id: null,
    name: '',
    totalAmount: null,
    installmentAmount: null,
    totalMonths: null,
    startDate: '',
    dueDay: 1,
    type: 'Bill',
    status: 'Active',
    notes: '',
    appliedMonths: []
  };
  submitted.value = false;
  dialogVisible.value = true;
};

const editCommitment = (item) => {
  commitment.value = { 
    id: item.id,
    name: item.name,
    totalAmount: item.totalAmount || item.amount * (item.totalMonths || 1),
    installmentAmount: item.installmentAmount || item.amount,
    totalMonths: item.totalMonths || 1,
    startDate: item.startDate || new Date().toISOString().split('T')[0],
    dueDay: item.dueDay || 1,
    type: item.type,
    status: item.status || 'Active',
    notes: item.notes,
    appliedMonths: [...(item.appliedMonths || [])]
  };
  submitted.value = false;
  dialogVisible.value = true;
};

const hideDialog = () => {
  dialogVisible.value = false;
  submitted.value = false;
};

const saveCommitment = () => {
  submitted.value = true;
  const c = commitment.value;
  if (!c.name.trim() || !c.totalAmount || c.totalAmount <= 0 || !c.installmentAmount || c.installmentAmount <= 0 || !c.totalMonths || c.totalMonths < 1 || !c.startDate || !c.dueDay) {
    return;
  }

  const payload = {
    id: c.id,
    name: c.name,
    totalAmount: Number(c.totalAmount),
    installmentAmount: Number(c.installmentAmount),
    amount: Number(c.installmentAmount),
    totalMonths: Number(c.totalMonths),
    startDate: c.startDate,
    dueDay: Number(c.dueDay),
    type: c.type,
    status: c.status,
    notes: c.notes,
    appliedMonths: c.appliedMonths
  };

  if (c.id) {
    transactionStore.UpdateCommitment(payload);
    toast.add({ severity: 'success', summary: i18nStore.t('toastUpdated'), detail: payload.name, life: 3000 });
  } else {
    transactionStore.AddCommitment(payload);
    toast.add({ severity: 'success', summary: i18nStore.t('toastCreated'), detail: payload.name, life: 3000 });
  }

  dialogVisible.value = false;
  submitted.value = false;
};

const confirmDeleteCommitment = (item) => {
  commitment.value = { ...item };
  deleteVisible.value = true;
};

const deleteCommitment = () => {
  transactionStore.RemoveCommitment(commitment.value.id);
  deleteVisible.value = false;
  toast.add({
    severity: 'info',
    summary: i18nStore.t('toastDeleted'),
    detail: commitment.value.name,
    life: 3000
  });
};
</script>

<style scoped>
.fixed-money-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Metrics Cards */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.metric-card {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  justify-content: center;
}

.metric-card--primary {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
}

.metric-label {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  color: #f1f5f9;
}

.metric-hint {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* Table Panel & Controls */
.table-panel {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1rem;
  box-sizing: border-box;
}

.table-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 768px) {
  .table-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.search-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}
@media (min-width: 768px) {
  .search-filter-row {
    width: auto;
    justify-content: flex-end;
  }
}

.ux-select {
  height: 44px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #cbd5e1;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 0.8125rem;
  font-weight: 700;
  outline: none;
  cursor: pointer;
}

.search-field {
  width: 100%;
}
@media (min-width: 576px) {
  .search-field {
    width: 220px;
  }
}

/* Custom Styled Table */
.desktop-table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.custom-installment-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.custom-installment-table th {
  padding: 12px;
  background: rgba(15, 23, 42, 0.4);
  color: #94a3b8;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.custom-installment-table td {
  padding: 14px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  vertical-align: middle;
}

.custom-installment-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.01);
}

.table-empty-row {
  text-align: center;
  color: #64748b;
  padding: 3rem !important;
}

.item-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-title-name {
  font-weight: 700;
  color: #f1f5f9;
}
.badge-inline {
  width: fit-content;
}

.due-date-text {
  font-weight: 600;
}
.text-red { color: #f43f5e; }
.text-orange { color: #fbbf24; }
.text-green { color: #34d399; }

.status-chip {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
}
.status-active { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.status-completed { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-paused { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); }

/* Progress bar inside table */
.table-progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 110px;
}
.progress-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.progress-pct {
  font-size: 0.75rem;
  font-weight: 700;
  color: #cbd5e1;
  min-width: 30px;
}

/* Progress Colors */
.progress-green { background: #10b981; }
.progress-orange { background: #fbbf24; }
.progress-red { background: #f43f5e; }
.progress-blue { background: #3b82f6; }

.action-buttons-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.quick-action-btn {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-action-btn:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
}
.btn-action-paid:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}
.btn-action-skip:hover {
  background: rgba(251, 191, 36, 0.15);
  border-color: #fbbf24;
}
.btn-action-history:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
}
.btn-delete:hover {
  background: rgba(244, 63, 94, 0.15);
  border-color: #f43f5e;
}

/* ── Mobile installment card list ── */
.mobile-installment-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  box-sizing: border-box;
}

.mic-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.mic-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mic-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #f8fafc;
}
.mic-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: rgba(15, 23, 42, 0.25);
  padding: 10px;
  border-radius: 10px;
}
.mic-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mcd-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}
.mcd-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #e2e8f0;
}
.mic-due-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: #cbd5e1;
}
.mic-due-label {
  font-weight: 600;
}
.mic-due-val {
  font-weight: 700;
}
.mic-progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mic-actions-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 10px;
  justify-content: flex-end;
}
.mobile-action-btn {
  padding: 6px 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.btn-mob-paid { background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.2); color: #34d399; }
.btn-mob-skip { background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.btn-mob-history { background: rgba(139, 92, 246, 0.08); border-color: rgba(139, 92, 246, 0.2); color: #a78bfa; }
.btn-mob-delete { background: rgba(244, 63, 94, 0.08); border-color: rgba(244, 63, 94, 0.2); color: #fb7185; }

/* Dialog Body structure */
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}
.fields-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.dialog-date-input {
  height: 38px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 0.875rem;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

/* History Modal styles */
.history-dialog-body {
  max-height: 320px;
  overflow-y: auto;
}

.history-table-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  text-align: left;
}

.history-table-grid th {
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.4);
  color: #94a3b8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.history-table-grid td {
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
}

.row-btn--danger {
  background: rgba(244, 63, 94, 0.05);
  border: 1px solid rgba(244, 63, 94, 0.15);
  color: #fb7185;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.row-btn--danger:hover {
  background: rgba(244, 63, 94, 0.2);
}
</style>
