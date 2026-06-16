<template>
    <div class="max-w-7xl mx-auto px-4 py-8">
        <Toast />
        
        <!-- App Header Bar -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-850 dark:text-white flex items-center gap-2">
                <i class="pi pi-wallet text-indigo-600"></i> Salary Tracker
            </h1>
            <Button icon="pi pi-sign-out" severity="danger" text rounded label="Logout" class="hover:bg-red-500/10" @click="logout" />
        </div>
        
        <!-- Dashboard Summary Header -->
        <div class="grid grid-cols-3 gap-2 sm:gap-6 mb-8">
            <!-- Total Salary Card -->
            <div class="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                    <span class="text-[10px] sm:text-sm font-semibold text-indigo-700/80 dark:text-indigo-400 block truncate">Total Monthly Salary</span>
                    <div class="flex items-center gap-1 mt-1 sm:mt-2">
                        <span class="text-xs sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {{ formatCurrency(transactionStore.salary) }}
                        </span>
                        <Button icon="pi pi-pencil" text rounded severity="secondary" class="h-6 w-6 sm:h-8 sm:w-8 !p-0" size="small" @click="startEditSalary" />
                        <Button v-if="transactionStore.salary===0" label="Add" text rounded severity="secondary" class="h-6 px-1 text-[9px] sm:text-xs" size="small" @click="startAddSalary" />
                    </div>
                </div>
                <div class="text-[8px] sm:text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium mt-2 sm:mt-3 flex items-center gap-0.5">
                    <i class="pi pi-info-circle text-[8px] sm:text-[10px]"></i> <span class="truncate">Edit salary</span>
                </div>
            </div>

            <!-- Total Expenses Card -->
            <div class="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 shadow-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                    <span class="text-[10px] sm:text-sm font-semibold text-rose-700/80 dark:text-rose-400 block truncate">Total Expenses</span>
                    <div class="text-xs sm:text-3xl font-extrabold tracking-tight text-rose-600 mt-1 sm:mt-2">
                        {{ formatCurrency(totalExpenses) }}
                    </div>
                </div>
                <div class="text-[8px] sm:text-xs text-rose-600/80 dark:text-rose-400/80 font-medium mt-2 sm:mt-3 flex items-center gap-0.5">
                    <i class="pi pi-chart-bar text-[8px] sm:text-[10px]"></i> <span class="truncate">Total transactions</span>
                </div>
            </div>

            <!-- Remaining Balance Card -->
            <div class="shadow-sm p-3 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-between transition-all hover:shadow-md"
                 :class="transactionStore.remind >= 0 ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20' : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20'">
                <div>
                    <span class="text-[10px] sm:text-sm font-semibold block truncate" :class="transactionStore.remind >= 0 ? 'text-emerald-700/80 dark:text-emerald-400' : 'text-red-700/80 dark:text-red-400'">Remaining Budget</span>
                    <div class="text-xs sm:text-3xl font-extrabold tracking-tight mt-1 sm:mt-2"
                         :class="transactionStore.remind >= 0 ? 'text-emerald-600' : 'text-red-600'">
                        {{ formatCurrency(transactionStore.remind) }}
                    </div>
                </div>
                <div class="text-[8px] sm:text-xs font-medium mt-2 sm:mt-3 flex items-center gap-0.5"
                     :class="transactionStore.remind >= 0 ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-red-600/80 dark:text-red-400/80'">
                    <i class="pi text-[8px] sm:text-[10px]" :class="transactionStore.remind >= 0 ? 'pi-check-circle' : 'pi-exclamation-circle'"></i>
                    <span class="truncate">{{ transactionStore.remind >= 0 ? 'Within budget' : 'Over budget' }}</span>
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
                :scrollable="true"
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
                <Column field="Category" header="Category" sortable style="min-width: 12rem"></Column>
                <Column field="Reason" header="Reason" sortable style="min-width: 16rem"></Column>
                
                <Column :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" variant="outlined" rounded class="mr-2" @click="editTransaction(slotProps.data)" />
                        <Button icon="pi pi-trash" variant="outlined" rounded severity="danger" @click="confirmDeleteTransaction(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Edit Salary Dialog -->
        <Dialog v-model:visible="salaryDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Update Monthly Salary" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label for="salaryInput" class="block font-bold mb-2 text-slate-700 dark:text-slate-200">Monthly Salary</label>
                    <InputNumber id="salaryInput" v-model="tempSalary" mode="currency" currency="USD" locale="en-US" fluid autofocus @keyup.enter="saveSalary" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="salaryDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveSalary" />
            </template>
        </Dialog>

        <!-- Add Salary Dialog -->
        <Dialog v-model:visible="addSalaryDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Add Monthly Salary" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label for="addSalaryInput" class="block font-bold mb-2 text-slate-700 dark:text-slate-200">Monthly Salary</label>
                    <InputNumber id="addSalaryInput" v-model="addTempSalary" mode="currency" currency="USD" locale="en-US" fluid autofocus @keyup.enter="saveAddSalary" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="addSalaryDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveAddSalary" />
            </template>
        </Dialog>

        <!-- Create/Edit Transaction Dialog -->
        <Dialog v-model:visible="transactionDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Transaction Details" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label for="price" class="block font-bold mb-2 text-slate-700 dark:text-slate-200">Amount</label>
                    <InputNumber id="price" v-model="transaction.Transcation" mode="currency" currency="USD" locale="en-US" fluid autofocus />
                    <small v-if="submitted && !transaction.Transcation" class="text-rose-500 block mt-1">Amount is required.</small>
                </div>
                <div>
                    <label for="category" class="block font-bold mb-2 text-slate-700 dark:text-slate-200">Category</label>
                    <div class="flex gap-2">
                        <Select id="category" v-model="transaction.Category" :options="categories" placeholder="Select a Category" filter class="flex-1" />
                        <Button icon="pi pi-plus" severity="secondary" @click="showNewCategoryInput = !showNewCategoryInput" />
                    </div>
                    <small v-if="submitted && !transaction.Category" class="text-rose-500 block mt-1">Category is required.</small>
                </div>
                <div v-if="showNewCategoryInput" class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    <label class="block font-bold text-xs text-slate-600 dark:text-slate-300">Add Custom Category</label>
                    <div class="flex gap-2">
                        <InputText v-model="newCategoryName" placeholder="New Category Name..." size="small" class="flex-1" />
                        <Button label="Add" size="small" @click="addNewCategory" />
                    </div>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-2 text-slate-700 dark:text-slate-200">Reason / Description</label>
                    <Textarea id="description" v-model="transaction.Reason" required="true" rows="3" cols="20" placeholder="e.g. Grocery, Rent, Internet bill..." fluid />
                    <small v-if="submitted && !transaction.Reason?.trim()" class="text-rose-500 block mt-1">Reason is required.</small>
                </div>
            </div>

            <template #footer >
                <Button label="Save" icon="pi pi-check" @click="saveTransaction" />
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
            </template>
        </Dialog>

        <!-- Single Delete Dialog -->
        <Dialog v-model:visible="deleteTransactionDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Confirm Delete" :modal="true">
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
        <Dialog v-model:visible="deleteTransactionsDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Confirm Bulk Delete" :modal="true">
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
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

const transactionStore = useTransactionStore();
const userStore = useUserStore();
const router = useRouter();
const toast = useToast();

onMounted(() => {
    transactionStore.Setremind();
});

// Computed transactions array from store
const transactions = computed(() => transactionStore.transactions);

// Categories list loaded from localStorage or using user defaults
const defaultCategories = [
    ' Investments thndr',
    'Car',
    'Maintenance',
    'Services ',
    'Obligations',
    'Credit Card Payments',
    'Gifts ',
    'Family',
    'Cafes ',
    'Outings',
    'Clothes ',
    'Electronics',
    'Travel ',
    'Transport',
    'Work ',
    'Sports',
    'Food ',
    'House'
];
const storedCategories = localStorage.getItem('custom_categories');
const categories = ref(storedCategories ? JSON.parse(storedCategories) : defaultCategories);

const showNewCategoryInput = ref(false);
const newCategoryName = ref('');

const addNewCategory = () => {
    const name = newCategoryName.value.trim();
    if (name) {
        if (!categories.value.includes(name)) {
            categories.value.push(name);
            localStorage.setItem('custom_categories', JSON.stringify(categories.value));
        }
        transaction.value.Category = name;
        newCategoryName.value = '';
        showNewCategoryInput.value = false;
        toast.add({severity:'success', summary: 'Success', detail: 'Category added and selected', life: 2000});
    }
};

// Expenses calculation
const totalExpenses = computed(() => {
    return transactionStore.transactions.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
});

// Salary editing state
const salaryDialog = ref(false);
const tempSalary = ref(0);

const addSalaryDialog = ref(false);
const addTempSalary = ref(0);

const startEditSalary = () => {
    tempSalary.value = transactionStore.salary;
    salaryDialog.value = true;
};

const startAddSalary = () => {
    addTempSalary.value = 0;
    addSalaryDialog.value = true;
};

const saveSalary = () => {
    transactionStore.UpdateSalary(tempSalary.value);
    salaryDialog.value = false;
    toast.add({
        severity: 'success', 
        summary: 'Salary Updated', 
        detail: `Total monthly salary updated to ${formatCurrency(transactionStore.salary)}`, 
        life: 3000
    });
};

const saveAddSalary = () => {
    transactionStore.UpdateSalary(addTempSalary.value);
    addSalaryDialog.value = false;
    toast.add({
        severity: 'success', 
        summary: 'Salary Added', 
        detail: `Total monthly salary set to ${formatCurrency(transactionStore.salary)}`,
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

const logout = () => {
    debugger
    userStore.logout();
    router.push('/login');
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

    if (transaction.value.Transcation !== undefined && transaction.value.Category && transaction.value.Reason?.trim()) {
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
