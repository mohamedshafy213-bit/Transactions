<template>
  <div class="fixed-money-page">
    <!-- ── Top Metrics ── -->
    <div class="metrics-grid">
      <!-- Total Monthly Commitments -->
      <div class="metric-card metric-card--primary">
        <div class="metric-label">Total Monthly Commitments</div>
        <div class="metric-value">{{ formatCurrency(totalMonthlyAmount) }}</div>
        <div class="metric-hint">
          <i class="pi pi-info-circle"></i> Sum of all active commitments
        </div>
      </div>

      <!-- Breakdown badges/subtotals -->
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">Breakdown by Type</div>
        <div class="type-badges-container">
          <div v-for="(amount, type) in typeSubtotals" :key="type" class="type-badge-item">
            <span class="type-badge-label" :class="'badge--' + type.toLowerCase()">{{ type }}</span>
            <span class="type-badge-value">{{ formatCurrency(amount) }}</span>
          </div>
          <div v-if="Object.keys(typeSubtotals).length === 0" class="no-commitments-hint">
            No active commitments yet.
          </div>
        </div>
      </div>
    </div>

    <!-- ── Main Panel ── -->
    <div class="table-panel">
      <div class="table-actions">
        <div class="action-group">
          <Button label="New Commitment" icon="pi pi-plus" size="small" @click="openNew" />
        </div>
        <div class="action-group">
          <IconField class="search-field">
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText v-model="filters.global.value" placeholder="Search..." />
          </IconField>
        </div>
      </div>

      <!-- Desktop table (Visible >= 768px) -->
      <DataTable 
        :value="transactionStore.fixedCommitments"
        dataKey="id" 
        :paginator="true" 
        :rows="8" 
        :filters="filters"
        paginatorTemplate="PrevPageLink PageLinks NextPageLink"
        class="modern-table desktop-table-view"
      >
        <template #header>
          <div class="table-header">
            <span class="table-title">Monthly Commitments</span>
          </div>
        </template>
        
        <Column field="name" header="Name" sortable style="min-width:12rem">
          <template #body="{ data }">
            <div class="commitment-name-cell">
              <span class="c-name">{{ data.name }}</span>
              <span v-if="data.notes" class="c-notes" :title="data.notes">{{ data.notes }}</span>
            </div>
          </template>
        </Column>

        <Column field="amount" header="Amount" sortable style="min-width:8rem">
          <template #body="{ data }">
            <span class="amount-val">{{ formatCurrency(data.amount) }}</span>
          </template>
        </Column>

        <Column field="type" header="Type" sortable style="min-width:8rem">
          <template #body="{ data }">
            <span class="type-badge" :class="'badge--' + data.type.toLowerCase()">{{ data.type }}</span>
          </template>
        </Column>

        <Column field="recurrence" header="Recurrence" sortable style="min-width:8rem"></Column>

        <Column header="Applied This Month" style="min-width:12rem">
          <template #body="{ data }">
            <div class="apply-status-cell">
              <button 
                v-if="isAppliedThisMonth(data)"
                class="applied-status-badge"
                @click="promptUnapply(data)"
              >
                <i class="pi pi-check"></i> Applied
              </button>
              <button 
                v-else
                class="apply-action-btn"
                @click="applyCommitment(data)"
              >
                Apply Now
              </button>
            </div>
          </template>
        </Column>

        <Column :exportable="false" style="min-width:6rem">
          <template #body="{ data }">
            <div class="row-actions">
              <button class="row-btn" @click="editCommitment(data)" title="Edit"><i class="pi pi-pencil"></i></button>
              <button class="row-btn row-btn--danger" @click="confirmDeleteCommitment(data)" title="Delete"><i class="pi pi-trash"></i></button>
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Mobile cards (Visible < 768px) -->
      <div class="mobile-list-view">
        <div v-if="filteredCommitments.length === 0" class="mobile-empty">
          No commitments found.
        </div>
        <div v-for="item in filteredCommitments" :key="item.id" class="mobile-card">
          <div class="mc-top">
            <div class="mc-info">
              <span class="mc-name">{{ item.name }}</span>
              <span class="type-badge" :class="'badge--' + item.type.toLowerCase()">{{ item.type }}</span>
            </div>
            <span class="mc-amount">{{ formatCurrency(item.amount) }}</span>
          </div>
          
          <div v-if="item.notes" class="mc-notes-snippet">
            {{ item.notes }}
          </div>

          <div class="mc-middle">
            <span class="mc-recurrence"><i class="pi pi-sync"></i> {{ item.recurrence }}</span>
            
            <div class="mc-apply-action">
              <button 
                v-if="isAppliedThisMonth(item)"
                class="applied-status-badge"
                @click="promptUnapply(item)"
              >
                <i class="pi pi-check"></i> Applied
              </button>
              <button 
                v-else
                class="apply-action-btn"
                @click="applyCommitment(item)"
              >
                Apply Now
              </button>
            </div>
          </div>

          <div class="mc-bottom">
            <div class="row-actions" style="margin-left: auto;">
              <button class="row-btn" @click="editCommitment(item)"><i class="pi pi-pencil"></i> Edit</button>
              <button class="row-btn row-btn--danger" @click="confirmDeleteCommitment(item)"><i class="pi pi-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Dialogs ── -->

    <!-- Add/Edit Commitment Dialog -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :style="{ width: '92vw', maxWidth: '480px' }"
      :header="commitment.id ? 'Edit Commitment' : 'New Commitment'" 
      :modal="true" 
      class="p-fluid"
    >
      <div class="dialog-body">
        <div class="field-group">
          <label class="field-label">Name</label>
          <InputText v-model="commitment.name" placeholder="e.g. Internet Bill, Netflix, Rent..." fluid autofocus />
          <small v-if="submitted && !commitment.name" class="field-error">Name is required.</small>
        </div>

        <div class="field-group">
          <label class="field-label">Amount</label>
          <InputNumber v-model="commitment.amount" mode="currency" currency="USD" locale="en-US" :min="0" fluid />
          <small v-if="submitted && (!commitment.amount || commitment.amount <= 0)" class="field-error">A positive amount is required.</small>
        </div>

        <div class="field-group">
          <label class="field-label">Type</label>
          <Select 
            v-model="commitment.type" 
            :options="typesList" 
            placeholder="Select type" 
            fluid 
          />
        </div>

        <div class="field-group">
          <label class="field-label">Recurrence</label>
          <Select 
            v-model="commitment.recurrence" 
            :options="recurrenceOptions" 
            placeholder="Select recurrence" 
            fluid 
          />
        </div>

        <div class="field-group">
          <label class="field-label">Notes / Description <span style="color:#64748b;font-weight:400">(optional)</span></label>
          <Textarea v-model="commitment.notes" rows="3" placeholder="Additional details..." fluid />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button :label="commitment.id ? 'Update' : 'Save'" icon="pi pi-check" @click="saveCommitment" />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteVisible" 
      :style="{ width: '92vw', maxWidth: '400px' }" 
      header="Delete Commitment" 
      :modal="true"
    >
      <div class="confirm-body">
        <i class="pi pi-exclamation-triangle confirm-icon"></i>
        <span>Are you sure you want to delete <strong>{{ commitment.name }}</strong>? This will also remove any auto-generated expense records for this commitment.</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteVisible = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteCommitment" />
      </template>
    </Dialog>

    <!-- Unapply Confirmation Dialog -->
    <Dialog 
      v-model:visible="unapplyVisible" 
      :style="{ width: '92vw', maxWidth: '400px' }" 
      header="Unapply Commitment" 
      :modal="true"
    >
      <div class="confirm-body">
        <i class="pi pi-exclamation-triangle confirm-icon" style="color: #f87171;"></i>
        <span>Are you sure you want to unapply <strong>{{ commitmentToUnapply?.name }}</strong> for this month? This will delete the logged transaction (<strong>{{ formatCurrency(commitmentToUnapply?.amount) }}</strong>) from your Expenses list.</span>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="cancelUnapply" />
        <Button label="Unapply" icon="pi pi-check" severity="danger" @click="confirmUnapply" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTransactionStore } from '../stores/Transaction';
import { useToast } from 'primevue/usetoast';

const transactionStore = useTransactionStore();
const toast = useToast();

const currentMonth = computed(() => {
  return new Date().toISOString().substring(0, 7); // YYYY-MM
});

// Dropdowns
const typesList = ['Bill', 'Installment', 'Rent', 'Subscription', 'Insurance', 'Loan', 'Other'];
const recurrenceOptions = ['Monthly', 'Weekly', 'Yearly'];

// Filters
const filters = ref({
  global: { value: null }
});

// Commitment State
const dialogVisible = ref(false);
const deleteVisible = ref(false);
const unapplyVisible = ref(false);
const submitted = ref(false);

const commitment = ref({
  id: null,
  name: '',
  amount: null,
  type: 'Bill',
  recurrence: 'Monthly',
  notes: '',
  appliedMonths: []
});

const commitmentToUnapply = ref(null);

// Calculations
const totalMonthlyAmount = computed(() => {
  return transactionStore.fixedCommitments.reduce((acc, c) => acc + Number(c.amount || 0), 0);
});

const typeSubtotals = computed(() => {
  const totals = {};
  transactionStore.fixedCommitments.forEach(c => {
    totals[c.type] = (totals[c.type] || 0) + Number(c.amount || 0);
  });
  return totals;
});

const filteredCommitments = computed(() => {
  const query = filters.value.global.value?.toLowerCase() || '';
  if (!query) return transactionStore.fixedCommitments;
  return transactionStore.fixedCommitments.filter(c => 
    c.name?.toLowerCase().includes(query) ||
    c.type?.toLowerCase().includes(query) ||
    c.notes?.toLowerCase().includes(query)
  );
});

// Actions
const formatCurrency = (v) => {
  return (v !== undefined && v !== null)
    ? Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : '$0.00';
};

const isAppliedThisMonth = (item) => {
  return item.appliedMonths && item.appliedMonths.includes(currentMonth.value);
};

const applyCommitment = (item) => {
  transactionStore.ApplyCommitmentThisMonth(item.id, currentMonth.value);
  toast.add({
    severity: 'success',
    summary: 'Commitment Applied',
    detail: `Logged "${item.name}" expense for ${currentMonth.value}`,
    life: 3000
  });
};

const promptUnapply = (item) => {
  commitmentToUnapply.value = item;
  unapplyVisible.value = true;
};

const cancelUnapply = () => {
  commitmentToUnapply.value = null;
  unapplyVisible.value = false;
};

const confirmUnapply = () => {
  if (commitmentToUnapply.value) {
    transactionStore.UnapplyCommitmentThisMonth(commitmentToUnapply.value.id, currentMonth.value);
    toast.add({
      severity: 'warn',
      summary: 'Commitment Unapplied',
      detail: `Removed "${commitmentToUnapply.value.name}" expense entry for ${currentMonth.value}`,
      life: 3000
    });
  }
  unapplyVisible.value = false;
  commitmentToUnapply.value = null;
};

const openNew = () => {
  commitment.value = {
    id: null,
    name: '',
    amount: null,
    type: 'Bill',
    recurrence: 'Monthly',
    notes: '',
    appliedMonths: []
  };
  submitted.value = false;
  dialogVisible.value = true;
};

const hideDialog = () => {
  dialogVisible.value = false;
  submitted.value = false;
};

const editCommitment = (item) => {
  // Deep clone to avoid proxy side effects
  commitment.value = { 
    id: item.id,
    name: item.name,
    amount: item.amount,
    type: item.type,
    recurrence: item.recurrence,
    notes: item.notes,
    appliedMonths: [...(item.appliedMonths || [])]
  };
  submitted.value = false;
  dialogVisible.value = true;
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
    summary: 'Deleted',
    detail: `Removed commitment "${commitment.value.name}"`,
    life: 3000
  });
};

const saveCommitment = () => {
  submitted.value = true;
  if (!commitment.value.name.trim() || !commitment.value.amount || commitment.value.amount <= 0) {
    return;
  }

  // Pinia store action checks
  const payload = {
    id: commitment.value.id,
    name: commitment.value.name,
    amount: Number(commitment.value.amount),
    type: commitment.value.type,
    recurrence: commitment.value.recurrence,
    notes: commitment.value.notes,
    appliedMonths: commitment.value.appliedMonths
  };

  if (commitment.value.id) {
    transactionStore.UpdateCommitment(payload);
    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: `Commitment "${payload.name}" updated`,
      life: 3000
    });
  } else {
    transactionStore.AddCommitment(payload);
    toast.add({
      severity: 'success',
      summary: 'Created',
      detail: `Commitment "${payload.name}" created`,
      life: 3000
    });
  }

  dialogVisible.value = false;
  submitted.value = false;
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
}

/* Metrics Cards */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr 2fr;
  }
}

.metric-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  justify-content: center;
}

.metric-card--primary {
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.08);
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

.type-badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.type-badge-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
}

.type-badge-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.type-badge-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #cbd5e1;
}

.no-commitments-hint {
  font-size: 0.875rem;
  color: #64748b;
}

/* Panel & Controls */
.table-panel {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 20px;
  padding: 1rem;
}
@media (min-width: 768px) {
  .table-panel {
    padding: 1.5rem;
  }
}

.table-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
@media (min-width: 576px) {
  .table-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.search-field {
  width: 100%;
}
@media (min-width: 576px) {
  .search-field {
    width: 240px;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
}

.table-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #f1f5f9;
}

/* Badge colors matching category designs */
.type-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
}

/* Global design tokens for type colors */
:global(.badge--bill) { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
:global(.badge--installment) { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
:global(.badge--rent) { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
:global(.badge--subscription) { background: rgba(167, 139, 250, 0.15); color: #a78bfa; border: 1px solid rgba(167, 139, 250, 0.3); }
:global(.badge--insurance) { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
:global(.badge--loan) { background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
:global(.badge--other) { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }

/* Apply Status Button styling */
.apply-status-cell {
  display: flex;
  align-items: center;
}

.applied-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.applied-status-badge:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}
.applied-status-badge:hover i::before {
  content: "\e90b"; /* PrimeIcons Pi-trash or Pi-times */
}

.apply-action-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.apply-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Actions styling */
.row-actions {
  display: flex;
  gap: 0.375rem;
}
.row-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8125rem;
}
.row-btn:hover {
  background: rgba(99,102,241,0.15);
  border-color: rgba(99,102,241,0.4);
  color: #f1f5f9;
}
.row-btn--danger:hover {
  background: rgba(239,68,68,0.15);
  border-color: rgba(239,68,68,0.4);
  color: #f87171;
}

/* Desktop vs Mobile View toggling */
.desktop-table-view {
  display: none;
}
.mobile-list-view {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
@media (min-width: 768px) {
  .desktop-table-view {
    display: block;
  }
  .mobile-list-view {
    display: none;
  }
}

/* Mobile card list styling */
.mobile-card {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mc-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.mc-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.mc-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f1f5f9;
}

.mc-amount {
  font-size: 1.125rem;
  font-weight: 800;
  color: #6366f1;
}

.mc-notes-snippet {
  font-size: 0.8125rem;
  color: #64748b;
  background: rgba(15, 23, 42, 0.3);
  padding: 0.5rem;
  border-radius: 8px;
}

.mc-middle {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mc-recurrence {
  font-size: 0.8125rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mc-bottom {
  display: flex;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.mobile-empty {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 0.875rem;
}

/* Dialog and confirmations styling */
.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-error {
  color: #f87171;
  font-size: 0.75rem;
}

.confirm-body {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  color: #cbd5e1;
}

.confirm-icon {
  font-size: 2rem;
  color: #fbbf24;
}

.commitment-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.c-name {
  font-weight: 600;
  color: #f1f5f9;
}

.c-notes {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 15rem;
}

/* PrimeVue Component customizations to match application dark mode theme */
:deep(.p-inputtext), :deep(.p-inputnumber-input), :deep(.p-select), :deep(.p-textarea) {
  background: rgba(30,41,59,0.8) !important;
  border-color: rgba(99,102,241,0.25) !important;
  color: #f1f5f9 !important;
  border-radius: 10px !important;
}
:deep(.p-inputtext:focus), :deep(.p-inputnumber-input:focus), :deep(.p-select:focus), :deep(.p-textarea:focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important;
}
:deep(.p-dialog .p-dialog-header) {
  background: #1e293b !important;
  color: #f1f5f9 !important;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15) !important;
  border-radius: 16px 16px 0 0 !important;
}
:deep(.p-dialog .p-dialog-content) {
  background: #1e293b !important;
  color: #f1f5f9 !important;
}
:deep(.p-dialog .p-dialog-footer) {
  background: #1e293b !important;
  border-top: 1px solid rgba(99, 102, 241, 0.1) !important;
  border-radius: 0 0 16px 16px !important;
}
:deep(.p-dialog) {
  border-radius: 16px !important;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6) !important;
}
</style>
