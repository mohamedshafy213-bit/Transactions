<template>
    <div class="max-w-7xl mx-auto px-4 py-8">
        <Toast />
        
        <!-- Dashboard Summary Header -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Total Salary Card -->
            <div class="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-sm p-6 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                    <span class="text-sm font-semibold text-indigo-700/80 dark:text-indigo-400">Total Monthly Salary</span>
                    <div class="flex items-center gap-2 mt-2">
                        <span v-if="!editingSalary" class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {{ formatCurrency(transactionStore.salary) }}
                        </span>
                        <InputNumber v-else v-model="tempSalary" mode="currency" currency="USD" locale="en-US" class="w-full" size="small" autofocus @keyup.enter="saveSalary" @blur="saveSalary" />
                        <Button v-if="!editingSalary" icon="pi pi-pencil" text rounded severity="secondary" size="small" @click="startEditSalary" />
                    </div>
                </div>
                <div class="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium mt-3 flex items-center gap-1">
                    <i class="pi pi-info-circle text-[10px]"></i> Click edit icon to change salary
                </div>
            </div>

            <!-- Total Expenses Card -->
            <div class="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 shadow-sm p-6 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                    <span class="text-sm font-semibold text-rose-700/80 dark:text-rose-400">Total Expenses</span>
                    <div class="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">
                        {{ formatCurrency(totalExpenses) }}
                    </div>
                </div>
                <div class="text-xs text-rose-600/80 dark:text-rose-400/80 font-medium mt-3 flex items-center gap-1">
                    <i class="pi pi-chart-bar text-[10px]"></i> Total of all transactions
                </div>
            </div>

            <!-- Remaining Balance Card -->
            <div class="shadow-sm p-6 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md"
                 :class="transactionStore.remind >= 0 ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20' : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20'">
                <div>
                    <span class="text-sm font-semibold" :class="transactionStore.remind >= 0 ? 'text-emerald-700/80 dark:text-emerald-400' : 'text-red-700/80 dark:text-red-400'">Remaining Budget</span>
                    <div class="text-3xl font-extrabold tracking-tight mt-2"
                         :class="transactionStore.remind >= 0 ? 'text-emerald-600' : 'text-red-600'">
                        {{ formatCurrency(transactionStore.remind) }}
                    </div>
                </div>
                <div class="text-xs font-medium mt-3 flex items-center gap-1"
                     :class="transactionStore.remind >= 0 ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-red-600/80 dark:text-red-400/80'">
                    <i class="pi" :class="transactionStore.remind >= 0 ? 'pi-check-circle' : 'pi-exclamation-circle'"></i>
                    {{ transactionStore.remind >= 0 ? 'You are within budget limits' : 'Alert: You are over budget!' }}
                </div>
            </div>
        </div>

        <div class="card p-6 border border-slate-100 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="danger" variant="outlined" @click="confirmDeleteSelected" :disabled="!selectedTransactions || !selectedTransactions.length" />
                </template>

                <template #end>
                    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" customUpload chooseLabel="Import" class="mr-2" auto :chooseButtonProps="{ severity: 'secondary' }" />
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedTransactions"
                :value="transactions"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0 text-xl font-bold text-slate-800 dark:text-white">Manage Transactions</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="date" header="Date" sortable style="min-width: 8rem"></Column>
                <Column field="Transcation" header="Amount" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.Transcation) }}
                    </template>
                </Column>
                <Column field="Reason" header="Reason" sortable style="min-width: 16rem"></Column>
                
                <Column :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" variant="outlined" rounded class="mr-2" @click="editTransaction(slotProps.data)" />
                        <Button icon="pi pi-trash" variant="outlined" rounded severity="danger" @click="confirmDeleteTransaction(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Create/Edit Transaction Dialog -->
        <Dialog v-model:visible="transactionDialog" :style="{ width: '450px' }" header="Transaction Details" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label for="price" class="block font-bold mb-2 text-slate-700 dark:text-slate-200">Amount</label>
                    <InputNumber id="price" v-model="transaction.Transcation" mode="currency" currency="USD" locale="en-US" fluid autofocus />
                    <small v-if="submitted && !transaction.Transcation" class="text-rose-500 block mt-1">Amount is required.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-2 text-slate-700 dark:text-slate-200">Reason / Description</label>
                    <Textarea id="description" v-model="transaction.Reason" required="true" rows="3" cols="20" placeholder="e.g. Grocery, Rent, Internet bill..." fluid />
                    <small v-if="submitted && !transaction.Reason?.trim()" class="text-rose-500 block mt-1">Reason is required.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveTransaction" />
            </template>
        </Dialog>

        <!-- Single Delete Dialog -->
        <Dialog v-model:visible="deleteTransactionDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true">
            <div class="flex items-center gap-4 py-2">
                <i class="pi pi-exclamation-triangle text-rose-500 text-3xl" />
                <span v-if="transaction">Are you sure you want to delete this transaction for <b>{{ transaction.Reason }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTransactionDialog = false" severity="secondary" />
                <Button label="Yes" icon="pi pi-check" @click="deleteTransaction" severity="danger" />
            </template>
        </Dialog>

        <!-- Bulk Delete Dialog -->
        <Dialog v-model:visible="deleteTransactionsDialog" :style="{ width: '450px' }" header="Confirm Bulk Delete" :modal="true">
            <div class="flex items-center gap-4 py-2">
                <i class="pi pi-exclamation-triangle text-rose-500 text-3xl" />
                <span>Are you sure you want to delete the selected transactions?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTransactionsDialog = false" severity="secondary" />
                <Button label="Yes" icon="pi pi-check" @click="deleteSelectedTransactions" severity="danger" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useTransactionStore } from '../stores/Transaction';

const transactionStore = useTransactionStore();
const toast = useToast();

onMounted(() => {
    transactionStore.Setremind();
});

// Computed transactions array from store
const transactions = computed(() => transactionStore.transactions);

// Expenses calculation
const totalExpenses = computed(() => {
    return transactionStore.transactions.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
});

// Salary editing state
const editingSalary = ref(false);
const tempSalary = ref(0);

const startEditSalary = () => {
    tempSalary.value = transactionStore.salary;
    editingSalary.value = true;
};

const saveSalary = () => {
    transactionStore.UpdateSalary(tempSalary.value);
    editingSalary.value = false;
    toast.add({
        severity: 'success', 
        summary: 'Salary Updated', 
        detail: `Total monthly salary updated to ${formatCurrency(transactionStore.salary)}`, 
        life: 3000
    });
};

// UI refs
const dt = ref();
const transactionDialog = ref(false);
const deleteTransactionDialog = ref(false);
const deleteTransactionsDialog = ref(false);
const transaction = ref({});
const selectedTransactions = ref();
const filters = ref({
    'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
});
const submitted = ref(false);

const formatCurrency = (value) => {
    if (value !== undefined && value !== null) {
        return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
    }
    return '$0.00';
};

const openNew = () => {
    transaction.value = {};
    submitted.value = false;
    transactionDialog.value = true;
};

const hideDialog = () => {
    transactionDialog.value = false;
    submitted.value = false;
};

const saveTransaction = () => {
    submitted.value = true;

    if (transaction.value.Transcation !== undefined && transaction.value.Reason?.trim()) {
        if (transaction.value.id) {
            transactionStore.UpdateTransaction(transaction.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Transaction Updated', life: 3000});
        } else {
            transactionStore.AddTransaction(transaction.value);
            toast.add({severity:'success', summary: 'Successful', detail: 'Transaction Created', life: 3000});
        }

        transactionDialog.value = false;
        transaction.value = {};
    }
};

const editTransaction = (txn) => {
    transaction.value = {...txn};
    transactionDialog.value = true;
};

const confirmDeleteTransaction = (txn) => {
    transaction.value = txn;
    deleteTransactionDialog.value = true;
};

const deleteTransaction = () => {
    transactionStore.RemoveTransaction(transaction.value.id);
    deleteTransactionDialog.value = false;
    transaction.value = {};
    toast.add({severity:'success', summary: 'Successful', detail: 'Transaction Deleted', life: 3000});
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteTransactionsDialog.value = true;
};

const deleteSelectedTransactions = () => {
    const ids = selectedTransactions.value.map(val => val.id);
    transactionStore.RemoveTransactions(ids);
    deleteTransactionsDialog.value = false;
    selectedTransactions.value = null;
    toast.add({severity:'success', summary: 'Successful', detail: 'Transactions Deleted', life: 3000});
};
</script>
