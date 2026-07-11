<template>
  <div class="check-calculator-page px-2.5 py-4 md:px-6 md:py-6 w-full max-w-7xl mx-auto overflow-x-hidden">
    <Toast />
    
    <!-- Canvas for Confetti Settle Celebration -->
    <canvas ref="confettiCanvas" class="fixed inset-0 pointer-events-none z-[9999]"></canvas>

    <!-- ── PAGE HEADER ── -->
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-indigo-500/10">
      <div>
        <h1 class="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
          <i class="pi pi-calculator text-indigo-400"></i>
          <span>{{ i18nStore.t('checkCalculator') }}</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          Settle and split restaurant checks among friends with ease.
        </p>
      </div>
      <Button 
        :label="i18nStore.t('btnNewCheck')" 
        icon="pi pi-plus" 
        severity="primary" 
        class="w-full sm:w-auto font-bold min-h-[44px] sm:min-h-0 text-sm shadow-md"
        @click="openCreateCheckDialog" 
      />
    </header>

    <!-- ── TABS SELECTOR (Active Checks vs Completed History) ── -->
    <div class="switcher-bar flex mb-6 rounded-xl overflow-hidden bg-slate-800/40 p-1 border border-indigo-500/10">
      <button 
        class="switcher-btn flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all"
        :class="currentTab === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
        @click="currentTab = 'active'"
      >
        <i class="pi pi-bolt"></i>
        <span>Active Checks</span>
        <span class="switcher-badge bg-indigo-700/60 px-2 py-0.5 rounded-full text-[10px] text-indigo-200">{{ pendingChecksList.length }}</span>
      </button>
      <button 
        class="switcher-btn flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all"
        :class="currentTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
        @click="currentTab = 'history'"
      >
        <i class="pi pi-history"></i>
        <span>{{ i18nStore.t('checkHistory') }}</span>
        <span class="switcher-badge bg-indigo-700/60 px-2 py-0.5 rounded-full text-[10px] text-indigo-200">{{ completedChecksList.length }}</span>
      </button>
    </div>

    <!-- ── ACTIVE TAB VIEW ── -->
    <div v-if="currentTab === 'active'">
      <div v-if="pendingChecksList.length === 0" class="empty-state-card text-center p-10 mb-6 bg-slate-900/30 rounded-2xl border border-dashed border-indigo-500/20">
        <div class="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 text-indigo-400 text-2xl">
          <i class="pi pi-calculator"></i>
        </div>
        <h2 class="text-lg font-extrabold text-slate-200 mb-1">No Active Bills</h2>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          Start a new bill split by clicking "+ Add New Check" at the top of the page.
        </p>
      </div>

      <!-- Active checks responsive card list -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div 
          v-for="check in pendingChecksList" 
          :key="check.id" 
          class="check-summary-card bg-slate-800/40 border border-indigo-500/10 hover:border-indigo-500/25 p-5 rounded-2xl cursor-pointer flex flex-col justify-between transition-all"
          :class="{ 'ring-2 ring-indigo-500/60 bg-indigo-950/10': selectedCheck?.id === check.id }"
          @click="selectCheck(check)"
        >
          <div>
            <div class="flex justify-between items-start gap-2 mb-3">
              <span class="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{{ check.restaurantName }}</span>
              <span class="text-[10px] text-slate-400 flex items-center gap-1"><i class="pi pi-calendar"></i> {{ formatDateShort(check.createdAt) }}</span>
            </div>
            
            <h3 class="text-base font-bold text-slate-200 mb-4">{{ check.restaurantName }} Split</h3>
            
            <div class="grid grid-cols-2 gap-4 py-2.5 border-t border-b border-indigo-500/5 mb-4 text-xs">
              <div>
                <span class="block text-slate-400 text-[10px] uppercase font-semibold">Friends</span>
                <span class="font-bold text-slate-200 mt-0.5 block">{{ check.participants.length }} joined</span>
              </div>
              <div>
                <span class="block text-slate-400 text-[10px] uppercase font-semibold">Total Bill</span>
                <span class="font-black text-indigo-400 mt-0.5 block">{{ formatCurrency(check.grandTotal) }}</span>
              </div>
            </div>

            <!-- Settle bar -->
            <div class="flex flex-col gap-1 mb-2">
              <div class="flex justify-between text-[10px] font-bold">
                <span class="text-slate-400">Settle progress</span>
                <span class="text-indigo-400">{{ getCheckProgressPercent(check) }}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  class="bg-indigo-500 h-full rounded-full transition-all"
                  :style="{ width: `${getCheckProgressPercent(check)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-indigo-500/5 flex justify-between gap-2">
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              outlined 
              class="h-9 w-9 p-0 flex items-center justify-center flex-shrink-0"
              @click.stop="confirmDeleteCheck(check)" 
            />
            <Button 
              label="Open Split Details" 
              icon="pi pi-chevron-right" 
              severity="secondary" 
              size="small" 
              text 
              class="text-xs font-bold"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── COMPLETED CHECKS HISTORY TAB VIEW ── -->
    <div v-if="currentTab === 'history'">
      <div v-if="completedChecksList.length === 0" class="empty-state-card text-center p-10 mb-6 bg-slate-900/30 rounded-2xl border border-dashed border-indigo-500/20">
        <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
          <i class="pi pi-folder-open"></i>
        </div>
        <h2 class="text-lg font-extrabold text-slate-200 mb-1">History is Empty</h2>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          Completed checks appear here once they are fully paid and finished.
        </p>
      </div>

      <!-- Completed checks cards grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div 
          v-for="check in completedChecksList" 
          :key="check.id" 
          class="check-summary-card bg-slate-800/20 border border-emerald-500/10 p-5 rounded-2xl flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-start gap-2 mb-3">
              <span class="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{{ check.restaurantName }}</span>
              <span class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Fully Paid</span>
            </div>
            
            <h3 class="text-base font-bold text-slate-200 mb-3">{{ check.restaurantName }} Split</h3>
            
            <div class="flex flex-col gap-2 py-2 border-t border-b border-indigo-500/5 mb-4 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-400 font-semibold">Total Settle:</span>
                <span class="font-extrabold text-slate-200">{{ formatCurrency(check.grandTotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400 font-semibold">Participants:</span>
                <span class="font-bold text-slate-200">{{ check.participants.length }} friends</span>
              </div>
              <div class="flex justify-between" v-if="check.completedAt">
                <span class="text-slate-400 font-semibold">Settle date:</span>
                <span class="text-[10px] text-slate-400 font-bold">{{ formatDate(check.completedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="pt-1">
            <Button 
              label="View Summary Report" 
              icon="pi pi-search-plus" 
              severity="success" 
              outlined
              class="w-full text-xs font-bold py-2.5 min-h-[44px]"
              @click="openCompletedReport(check)" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── SELECTED ACTIVE CHECK DETAILS VIEW (Redesigned) ── -->
    <div 
      v-if="selectedCheck && !selectedCheck.completed && currentTab === 'active'" 
      class="selected-check-details border border-indigo-500/15 p-4 md:p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md mb-6 w-full"
    >
      <!-- Details Header (Stacks vertically on Mobile) -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-700/50 mb-6">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              {{ selectedCheck.restaurantName }}
            </span>
            <span class="status-badge status--pending text-[9px] font-bold uppercase tracking-wider">
              Active Settle
            </span>
          </div>
          <h2 class="text-lg md:text-xl font-extrabold text-slate-100">Bill Split Check</h2>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button 
            :label="i18nStore.t('finishCheck')" 
            icon="pi pi-check-square" 
            severity="success" 
            class="w-full sm:w-auto font-black text-sm shadow-md min-h-[44px]"
            :disabled="!isCheckFullyCollected"
            @click="handleFinishCheck" 
          />
          <Button 
            label="Close Details" 
            icon="pi pi-times" 
            severity="secondary" 
            outlined 
            class="w-full sm:w-auto font-bold min-h-[44px]" 
            @click="selectedCheck = null" 
          />
        </div>
      </div>

      <!-- Summary metrics cards grid (Adaptive 2-column mobile to 5-column desktop) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        <!-- Grand Total Card -->
        <div class="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-slate-700/30 flex items-center justify-center text-slate-300 text-base flex-shrink-0">
            <i class="pi pi-wallet"></i>
          </div>
          <div class="min-w-0">
            <span class="block text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Grand Total</span>
            <span class="block text-xs md:text-sm font-black text-slate-200 truncate">{{ formatCurrency(selectedCheck.grandTotal) }}</span>
            <span class="block text-[8px] text-slate-500 truncate">{{ formatCurrency(selectedCheck.total) }} + Tax</span>
          </div>
        </div>

        <!-- Collected Card -->
        <div class="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-base flex-shrink-0">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="min-w-0">
            <span class="block text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Collected</span>
            <span class="block text-xs md:text-sm font-black text-emerald-400 truncate">{{ formatCurrency(getCollectedAmount(selectedCheck)) }}</span>
            <span class="block text-[8px] text-emerald-500/60 font-bold truncate">{{ getPaidRatio(selectedCheck) }} paid</span>
          </div>
        </div>

        <!-- Remaining Card -->
        <div class="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 text-base flex-shrink-0">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="min-w-0">
            <span class="block text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Remaining</span>
            <span class="block text-xs md:text-sm font-black text-rose-400 truncate">{{ formatCurrency(getRemainingAmount(selectedCheck)) }}</span>
            <span class="block text-[8px] text-rose-500/60 font-bold truncate">{{ getRemainingRatio(selectedCheck) }} pending</span>
          </div>
        </div>

        <!-- Settle Rate Card -->
        <div class="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-base flex-shrink-0">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="min-w-0">
            <span class="block text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Settle Rate</span>
            <span class="block text-xs md:text-sm font-black text-indigo-300 truncate">{{ getCheckProgressPercent(selectedCheck) }}%</span>
            <span class="block text-[8px] text-indigo-500/60 font-bold">Completion</span>
          </div>
        </div>

        <!-- Unassigned Card (Spans full on mobile layout) -->
        <div class="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div class="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 text-base flex-shrink-0">
            <i class="pi pi-users"></i>
          </div>
          <div class="min-w-0">
            <span class="block text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Unassigned</span>
            <span class="block text-xs md:text-sm font-black text-amber-500 truncate">{{ formatCurrency(getUnassignedAmount(selectedCheck)) }}</span>
            <span class="block text-[8px] text-amber-500/60 font-bold truncate">Unallocated items</span>
          </div>
        </div>
      </div>

      <!-- Vertical Progress Section -->
      <div class="mb-6 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
        <div class="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            class="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-md"
            :style="{ width: `${getCheckProgressPercent(selectedCheck)}%` }"
          ></div>
        </div>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span class="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <i class="pi pi-percentage"></i> {{ getCheckProgressPercent(selectedCheck) }}% Settle Rate
          </span>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 
              Collected: <strong class="text-slate-200">{{ formatCurrency(getCollectedAmount(selectedCheck)) }}</strong>
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span> 
              Remaining: <strong class="text-slate-200">{{ formatCurrency(getRemainingAmount(selectedCheck)) }}</strong>
            </span>
          </div>
        </div>
      </div>

      <!-- ── PARTICIPANTS SECTION ── -->
      <div class="participants-list-section mt-6">
        <!-- Actions Toolbar -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h3 class="text-base font-extrabold text-slate-200">Participants Checklist</h3>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <IconField class="search-field w-full sm:w-44">
              <InputIcon><i class="pi pi-search" /></InputIcon>
              <InputText v-model="participantSearch" placeholder="Search name..." class="p-inputtext-sm w-full" />
            </IconField>
            
            <div class="flex gap-2 w-full sm:w-auto">
              <Select 
                v-model="participantSortBy" 
                :options="sortOptions" 
                optionLabel="label" 
                optionValue="value" 
                placeholder="Sort" 
                class="p-inputtext-sm flex-1 sm:w-36 sm:flex-initial" 
              />
              <Button 
                label="Add Person"
                icon="pi pi-user-plus" 
                severity="secondary" 
                size="small" 
                outlined 
                class="min-h-[44px] sm:min-h-0 font-semibold flex-shrink-0"
                @click="openAddParticipantDialog" 
              />
            </div>
          </div>
        </div>

        <!-- Participants Table on Desktop & Tablet -->
        <div class="w-full overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/20 desktop-table">
          <DataTable 
            :value="filteredParticipants" 
            dataKey="id" 
            class="modern-table text-xs"
          >
            <Column field="paid" header="Paid" style="width: 3rem">
              <template #body="{ data }">
                <div class="flex justify-center items-center min-w-[44px] min-h-[44px]">
                  <input 
                    type="checkbox" 
                    :id="`table-check-${data.id}`"
                    :checked="data.paid" 
                    class="custom-check-box scale-110"
                    @change="e => togglePaidStatus(data.id, e.target.checked)" 
                  />
                </div>
              </template>
            </Column>
            <Column field="name" header="Name" sortable style="min-width: 8rem">
              <template #body="{ data }">
                <span class="font-semibold text-slate-200">{{ data.name }}</span>
              </template>
            </Column>
            <Column field="total" header="Order Total" sortable style="min-width: 7rem">
              <template #body="{ data }">
                <span class="font-bold text-slate-200">{{ formatCurrency(data.total) }}</span>
              </template>
            </Column>
            <Column field="paymentMethod" header="Payment Method" sortable style="min-width: 9rem">
              <template #body="{ data }">
                <span class="flex items-center gap-1.5">
                  <i :class="getPaymentIcon(data.paymentMethod)" class="text-indigo-400"></i>
                  {{ i18nStore.t(data.paymentMethod.toLowerCase()) }}
                </span>
              </template>
            </Column>
            <Column field="paid" header="Status" sortable style="min-width: 6rem">
              <template #body="{ data }">
                <span 
                  class="status-badge text-[10px]" 
                  :class="getParticipantStatusClass(data)"
                >
                  {{ getParticipantStatusLabel(data) }}
                </span>
              </template>
            </Column>
            <Column header="Actions" style="min-width: 12rem">
              <template #body="{ data }">
                <div class="row-actions flex gap-2">
                  <Button 
                    label="Orders" 
                    icon="pi pi-pencil" 
                    severity="secondary" 
                    size="small" 
                    outlined 
                    @click="editParticipantOrders(data)" 
                  />
                  <Button 
                    label="Rename"
                    icon="pi pi-user-edit" 
                    severity="secondary" 
                    size="small" 
                    outlined 
                    @click="editParticipantNamePrompt(data)" 
                  />
                  <Button 
                    icon="pi pi-trash" 
                    severity="danger" 
                    size="small" 
                    outlined 
                    @click="deleteParticipantRow(data)" 
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Participants Responsive Mobile Cards Stack -->
        <div class="mobile-list flex flex-col gap-3">
          <div 
            v-for="item in filteredParticipants" 
            :key="item.id" 
            class="mobile-card"
            :class="{ 'border-emerald-500/25 bg-emerald-950/5': item.paid }"
          >
            <!-- Card Header -->
            <div class="flex justify-between items-start gap-2">
              <div class="flex items-start gap-3">
                <div class="flex items-center justify-center min-w-[44px] min-h-[44px]">
                  <input 
                    type="checkbox" 
                    :id="`check-p-${item.id}`"
                    :checked="item.paid" 
                    class="custom-check-box scale-125"
                    @change="e => togglePaidStatus(item.id, e.target.checked)" 
                  />
                </div>
                <label :for="`check-p-${item.id}`" class="font-bold text-slate-200 text-sm select-none cursor-pointer pt-2">
                  {{ item.name }}
                </label>
              </div>
              
              <span 
                class="status-badge mt-1 flex-shrink-0 text-[10px]" 
                :class="getParticipantStatusClass(item)"
              >
                {{ getParticipantStatusLabel(item) }}
              </span>
            </div>
            
            <!-- Card Details -->
            <div class="grid grid-cols-2 gap-3 mt-2 py-2.5 border-t border-b border-indigo-500/10 text-xs text-slate-300">
              <div>
                <span class="text-slate-400 block text-xxs uppercase tracking-wider font-semibold">Order Total</span>
                <span class="font-extrabold text-sm text-slate-100">{{ formatCurrency(item.total) }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-xxs uppercase tracking-wider font-semibold">Payment Method</span>
                <span class="flex items-center gap-1.5 font-medium mt-0.5">
                  <i :class="getPaymentIcon(item.paymentMethod)" class="text-indigo-400"></i>
                  {{ i18nStore.t(item.paymentMethod.toLowerCase()) }}
                </span>
              </div>
              <div class="col-span-2">
                <span class="text-slate-400 block text-xxs uppercase tracking-wider font-semibold">Orders Detail</span>
                <span class="font-medium mt-0.5 block text-slate-300">
                  {{ item.orders && item.orders.length ? `${item.orders.length} items (${item.orders.map(o => o.itemName).join(', ')})` : '0 items' }}
                </span>
              </div>
            </div>
            
            <!-- Card Actions -->
            <div class="flex flex-col sm:flex-row gap-2 mt-2">
              <Button 
                label="View / Edit Orders" 
                icon="pi pi-pencil" 
                severity="secondary" 
                size="small" 
                outlined 
                class="w-full py-2.5 text-xs font-semibold justify-center min-h-[44px]"
                @click="editParticipantOrders(item)" 
              />
              <div class="flex gap-2 w-full">
                <Button 
                  label="Rename" 
                  icon="pi pi-user-edit" 
                  severity="secondary" 
                  size="small" 
                  outlined 
                  class="flex-1 py-2.5 text-xs font-semibold justify-center min-h-[44px]"
                  @click="editParticipantNamePrompt(item)" 
                />
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  size="small" 
                  outlined 
                  class="px-3.5 py-2.5 min-h-[44px] flex items-center justify-center"
                  @click="deleteParticipantRow(item)" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─────── RESPONSIVE DIALOGS ─────── -->

    <!-- Create Check Dialog -->
    <Dialog 
      v-model:visible="createCheckVisible" 
      :style="{ width: '95vw', maxWidth: '520px' }" 
      header="Create New Bill Split" 
      :modal="true" 
      class="p-fluid check-setup-dialog"
    >
      <div class="dialog-body max-h-[70vh] overflow-y-auto pr-1">
        
        <!-- Future OCR support slot -->
        <div class="ocr-section-preview mb-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">OCR Receipt Scanner</span>
            <span class="text-xxs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-bold">Planned</span>
          </div>
          <Button 
            :label="i18nStore.t('uploadCheckImage')" 
            icon="pi pi-camera" 
            severity="secondary" 
            size="small"
            disabled 
            class="w-full text-xs font-semibold min-h-[44px] sm:min-h-0"
          />
          <span class="text-[10px] text-slate-500 italic">
            * Future feature: Upload receipt image to extract items, tax rate, and totals automatically.
          </span>
        </div>

        <div class="field-group">
          <label class="field-label">{{ i18nStore.t('restaurantName') }}</label>
          <InputText v-model="checkForm.restaurantName" placeholder="e.g. Buffalo Burger" class="min-h-[44px] sm:min-h-0" />
        </div>

        <div class="field-group">
          <label class="field-label">Bill Subtotal (Excluding Tax)</label>
          <InputNumber v-model="checkForm.total" mode="decimal" placeholder="EGP 0.00" locale="en-US" :minFractionDigits="2" autofocus class="min-h-[44px] sm:min-h-0" />
          <small v-if="checkFormSubmitted && !checkForm.total" class="field-error">Bill total is required.</small>
        </div>

        <div class="field-group checkbox-row flex items-center gap-2 mt-2">
          <div class="flex items-center justify-center min-w-[44px] min-h-[44px]">
            <input type="checkbox" id="taxIncluded" v-model="checkForm.taxIncluded" class="custom-check-box scale-125" />
          </div>
          <label for="taxIncluded" class="text-slate-300 text-sm font-semibold select-none cursor-pointer">Has additional Taxes / Fees</label>
        </div>

        <div v-if="checkForm.taxIncluded" class="field-group mt-2">
          <label class="field-label">Tax Rate (%)</label>
          <InputNumber v-model="checkForm.taxRate" mode="decimal" placeholder="e.g. 14%" locale="en-US" :minFractionDigits="0" :maxFractionDigits="2" prefix="%" class="min-h-[44px] sm:min-h-0" />
          <small v-if="checkFormSubmitted && checkForm.taxIncluded && checkForm.taxRate === null" class="field-error">Tax rate percentage is required.</small>
        </div>

        <!-- Calculated preview -->
        <div class="mt-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center text-sm font-bold">
          <span class="text-slate-400">Total Settle Estimate:</span>
          <span class="text-indigo-400 text-lg">{{ formatCurrency(calculatedGrandTotal) }}</span>
        </div>

        <!-- Add Initial Participants -->
        <div class="mt-4 pt-4 border-t border-slate-700/50">
          <label class="field-label mb-2 block">Initial Participants</label>
          <div class="flex gap-2">
            <InputText v-model="newParticipantName" placeholder="Participant name..." class="min-h-[44px] sm:min-h-0" @keyup.enter="addFormParticipant" />
            <Button icon="pi pi-plus" class="w-12 flex-shrink-0 min-h-[44px] sm:min-h-0" @click="addFormParticipant" />
          </div>
          
          <div v-if="checkForm.participants.length > 0" class="flex flex-wrap gap-2 mt-3 p-2 bg-slate-800/20 rounded-xl max-h-36 overflow-y-auto border border-slate-700/20">
            <span 
              v-for="(p, idx) in checkForm.participants" 
              :key="idx" 
              class="flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 px-2.5 py-1.2 rounded-full font-semibold"
            >
              {{ p.name }}
              <i class="pi pi-times cursor-pointer text-[10px] hover:text-indigo-100" @click="removeFormParticipant(idx)"></i>
            </span>
          </div>
        </div>

      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row gap-2 w-full justify-end">
          <Button :label="i18nStore.t('btnCancel')" text @click="createCheckVisible = false" severity="secondary" class="w-full sm:w-auto order-2 sm:order-1 min-h-[44px] text-sm" />
          <Button :label="i18nStore.t('btnSaveCheck')" icon="pi pi-check" @click="saveCheck" class="w-full sm:w-auto order-1 sm:order-2 min-h-[44px] text-sm font-bold" />
        </div>
      </template>
    </Dialog>

    <!-- Participant Orders Dialog -->
    <Dialog 
      v-model:visible="ordersDialogVisible" 
      :style="{ width: '95vw', maxWidth: '640px' }" 
      :header="ordersDialogTitle" 
      :modal="true" 
      class="p-fluid order-editor-dialog"
    >
      <div class="dialog-body max-h-[70vh] overflow-y-auto pr-1">
        
        <!-- Add items toolbar -->
        <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 mb-4">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 block">Add Item to Order</span>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div class="field-group">
              <label class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Item Name</label>
              <InputText v-model="itemForm.itemName" placeholder="e.g. Double Burger" class="p-inputtext-sm min-h-[44px] md:min-h-0" />
            </div>
            <div class="field-group">
              <label class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Price</label>
              <InputNumber v-model="itemForm.price" mode="decimal" placeholder="EGP 0.00" :minFractionDigits="2" class="p-inputtext-sm min-h-[44px] md:min-h-0" />
            </div>
            <div class="field-group flex gap-2 items-end">
              <div class="flex-1">
                <label class="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Qty</label>
                <InputNumber v-model="itemForm.quantity" showButtons :min="1" class="p-inputtext-sm min-h-[44px] md:min-h-0" />
              </div>
              <Button icon="pi pi-plus" class="h-11 w-11 md:h-9 md:w-9 flex-shrink-0 flex items-center justify-center" severity="primary" @click="addOrderItem" />
            </div>
          </div>
        </div>

        <!-- Orders list Table -->
        <div class="mb-4">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 block">Orders Summary</span>
          <div v-if="orderItemsList.length === 0" class="text-center p-6 bg-slate-800/10 rounded-xl border border-dashed border-slate-700/50 text-slate-400 text-xs italic">
            No items added yet. Enter item name, price, and click '+' above.
          </div>
          
          <div v-else class="w-full overflow-x-auto rounded-xl border border-slate-700/50">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-800/60 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <th class="p-3">Item</th>
                  <th class="p-3 text-right">Price</th>
                  <th class="p-3 text-center">Qty</th>
                  <th class="p-3 text-right">Subtotal</th>
                  <th class="p-3 text-center" style="width: 3rem"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="(item, idx) in orderItemsList" :key="idx" class="text-slate-300">
                  <td class="p-3 font-semibold text-slate-200">{{ item.itemName }}</td>
                  <td class="p-3 text-right font-medium">{{ formatCurrency(item.price) }}</td>
                  <td class="p-3 text-center font-medium">{{ item.quantity }}</td>
                  <td class="p-3 text-right font-bold text-indigo-400">{{ formatCurrency(item.price * item.quantity) }}</td>
                  <td class="p-3 text-center">
                    <button 
                      class="text-rose-400 hover:text-rose-200 transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                      @click="removeOrderItem(idx)"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-700/50">
          <!-- Select Payment Method -->
          <div class="field-group">
            <label class="field-label mb-1.5 block">{{ i18nStore.t('paymentMethod') }}</label>
            <Select 
              v-model="orderPaymentMethod" 
              :options="paymentMethodOptions" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Select Payment Method"
              class="w-full min-h-[44px] md:min-h-0"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2">
                  <i :class="getPaymentIcon(slotProps.value)" class="text-indigo-400"></i>
                  <span>{{ i18nStore.t(slotProps.value.toLowerCase()) }}</span>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div class="flex items-center gap-2">
                  <i :class="getPaymentIcon(slotProps.option.value)" class="text-indigo-400"></i>
                  <span>{{ slotProps.option.label }}</span>
                </div>
              </template>
            </Select>
          </div>

          <!-- Total Calculation Card -->
          <div class="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/25 flex justify-between items-center text-sm font-bold">
            <span class="text-slate-300">Total Calculated:</span>
            <span class="text-lg text-indigo-400">{{ formatCurrency(calculatedOrdersTotal) }}</span>
          </div>
        </div>

      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row gap-2 w-full justify-end">
          <Button :label="i18nStore.t('btnCancel')" text @click="ordersDialogVisible = false" severity="secondary" class="w-full sm:w-auto order-2 sm:order-1 min-h-[44px]" />
          <Button :label="i18nStore.t('btnSave')" icon="pi pi-check" @click="saveParticipantOrders" class="w-full sm:w-auto order-1 sm:order-2 min-h-[44px] font-bold" />
        </div>
      </template>
    </Dialog>

    <!-- Check Deletion Dialog -->
    <Dialog 
      v-model:visible="deleteCheckVisible" 
      :style="{ width: '95vw', maxWidth: '400px' }" 
      :header="i18nStore.t('confirmDeleteCheckHeader')" 
      :modal="true"
    >
      <div class="confirm-body flex items-start gap-3 py-2">
        <div class="confirm-icon text-amber-500 text-xl"><i class="pi pi-exclamation-triangle"></i></div>
        <p class="text-sm text-slate-300 leading-relaxed">{{ i18nStore.t('confirmDeleteCheckMsg') }}</p>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row gap-2 w-full justify-end">
          <Button :label="i18nStore.t('btnCancel')" text @click="deleteCheckVisible = false; checkToDelete = null" severity="secondary" class="w-full sm:w-auto order-2 sm:order-1 min-h-[44px]" />
          <Button :label="i18nStore.t('btnDelete')" icon="pi pi-trash" @click="deleteCheckConfirm" severity="danger" class="w-full sm:w-auto order-1 sm:order-2 min-h-[44px]" />
        </div>
      </template>
    </Dialog>

    <!-- Settle Success Celebration Dialog -->
    <Dialog 
      v-model:visible="celebrationVisible" 
      :style="{ width: '95vw', maxWidth: '440px' }" 
      :header="i18nStore.t('checkFullyPaidHeader')" 
      :modal="true"
      @hide="stopCelebration"
    >
      <div class="flex flex-col items-center gap-4 text-center py-6">
        <div class="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
          <i class="pi pi-check text-3xl"></i>
        </div>
        <h3 class="text-base font-extrabold text-slate-100">{{ i18nStore.t('checkFullyPaidHeader') }}</h3>
        <p class="text-slate-300 text-xs max-w-xs leading-relaxed">
          {{ i18nStore.t('checkFullyPaidMsg') }}
        </p>
      </div>
      <template #footer>
        <Button label="Awesome!" severity="success" class="w-full font-bold min-h-[44px]" @click="celebrationVisible = false; stopCelebration()" />
      </template>
    </Dialog>

    <!-- View Completed Summary Report Dialog -->
    <Dialog 
      v-model:visible="completedReportVisible" 
      :style="{ width: '95vw', maxWidth: '640px' }" 
      header="Completed Check Summary" 
      :modal="true"
    >
      <div v-if="completedReportCheck" class="dialog-body flex flex-col gap-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
        <div class="flex justify-between items-start pb-3 border-b border-slate-700/50">
          <div>
            <span class="text-xxs uppercase tracking-wider text-slate-400">{{ completedReportCheck.restaurantName }}</span>
            <h3 class="text-base font-bold text-slate-200">{{ completedReportCheck.title }}</h3>
          </div>
          <span class="text-xxs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">Fully Paid</span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center py-2 bg-slate-800/20 rounded-xl border border-slate-700/30">
          <div>
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Subtotal</span>
            <span class="font-bold text-slate-200 text-sm">{{ formatCurrency(completedReportCheck.total) }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Tax/Fees</span>
            <span class="font-bold text-slate-200 text-sm">{{ formatCurrency(completedReportCheck.tax) }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase font-bold">Grand Total</span>
            <span class="font-extrabold text-emerald-400 text-sm">{{ formatCurrency(completedReportCheck.grandTotal) }}</span>
          </div>
        </div>

        <div class="mt-2">
          <span class="text-[10px] font-bold text-slate-300 uppercase block mb-2">Participant Details</span>
          <div class="flex flex-col gap-2 max-h-[35vh] overflow-y-auto pr-1">
            <div 
              v-for="p in completedReportCheck.participants" 
              :key="p.id" 
              class="flex justify-between items-center p-2.5 rounded-lg bg-slate-800/30 border border-slate-800/50 text-slate-300"
            >
              <div>
                <span class="font-bold text-slate-200 text-xs">{{ p.name }}</span>
                <span class="text-[9px] text-slate-500 block">Method: {{ i18nStore.t(p.paymentMethod.toLowerCase()) }}</span>
              </div>
              <span class="font-bold text-slate-200 text-xs">{{ formatCurrency(p.total) }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button :label="i18nStore.t('btnCancel')" text class="w-full sm:w-auto min-h-[44px]" @click="completedReportVisible = false; completedReportCheck = null" />
      </template>
    </Dialog>

    <!-- Add Participant Dialog -->
    <Dialog 
      v-model:visible="addParticipantVisible" 
      :style="{ width: '95vw', maxWidth: '400px' }" 
      header="Add Participant" 
      :modal="true"
    >
      <div class="dialog-body py-2">
        <div class="field-group">
          <label class="field-label">Participant Name</label>
          <InputText v-model="singleParticipantName" placeholder="Enter name..." autofocus class="min-h-[44px]" @keyup.enter="saveSingleParticipant" />
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row gap-2 w-full justify-end">
          <Button :label="i18nStore.t('btnCancel')" text @click="addParticipantVisible = false; singleParticipantName = ''" severity="secondary" class="w-full sm:w-auto order-2 sm:order-1 min-h-[44px]" />
          <Button :label="i18nStore.t('addParticipant')" icon="pi pi-check" @click="saveSingleParticipant" class="w-full sm:w-auto order-1 sm:order-2 min-h-[44px] font-bold" />
        </div>
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useCheckStore } from '../stores/CheckStore';
import { useI18nStore } from '../stores/i18n';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const store = useCheckStore();
const i18nStore = useI18nStore();
const toast = useToast();
const router = useRouter();

const currentTab = ref('active');
const selectedCheck = ref(null);

const formatCurrency = (v) =>
  (v !== undefined && v !== null)
    ? Number(v).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })
    : 'EGP 0.00';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit' 
  });
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getCheckProgressPercent = (check) => {
  if (check.grandTotal <= 0) return 0;
  const collected = check.participants.reduce((sum, p) => sum + (p.paid ? p.total : 0), 0);
  return Math.min(100, Math.round((collected / check.grandTotal) * 100));
};

const getCollectedAmount = (check) => {
  return check.participants.reduce((sum, p) => sum + (p.paid ? p.total : 0), 0);
};

const getRemainingAmount = (check) => {
  const collected = getCollectedAmount(check);
  return Math.max(0, check.grandTotal - collected);
};

const getUnassignedAmount = (check) => {
  const allocated = check.participants.reduce((sum, p) => sum + p.total, 0);
  return Math.max(0, check.grandTotal - allocated);
};

const getPaidRatio = (check) => {
  const paidCount = check.participants.filter(p => p.paid).length;
  return `${paidCount} / ${check.participants.length}`;
};

const getRemainingRatio = (check) => {
  const pendingCount = check.participants.filter(p => !p.paid).length;
  return pendingCount;
};

const isCheckFullyCollected = computed(() => {
  if (!selectedCheck.value) return false;
  return getRemainingAmount(selectedCheck.value) <= 0 && selectedCheck.value.participants.length > 0;
});

const pendingChecksList = computed(() => store.checks.filter(c => !c.completed));
const completedChecksList = computed(() => store.checks.filter(c => c.completed));

const selectCheck = (check) => {
  selectedCheck.value = check;
  participantSearch.value = '';
};

// ── CRUD CHECKS ──
const createCheckVisible = ref(false);
const checkFormSubmitted = ref(false);
const newParticipantName = ref('');
const checkForm = ref({
  title: '',
  restaurantName: '',
  total: null,
  taxIncluded: false,
  taxRate: null,
  participants: []
});

const calculatedGrandTotal = computed(() => {
  const total = Number(checkForm.value.total || 0);
  const taxRate = checkForm.value.taxIncluded ? Number(checkForm.value.taxRate || 0) : 0;
  const taxAmount = Math.round(total * (taxRate / 100) * 100) / 100;
  return total + taxAmount;
});

const openCreateCheckDialog = () => {
  checkForm.value = {
    title: '',
    restaurantName: '',
    total: null,
    taxIncluded: false,
    taxRate: null,
    participants: []
  };
  newParticipantName.value = '';
  checkFormSubmitted.value = false;
  createCheckVisible.value = true;
};

const addFormParticipant = () => {
  const name = newParticipantName.value.trim();
  if (name) {
    if (!checkForm.value.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      checkForm.value.participants.push({ name });
      newParticipantName.value = '';
    } else {
      toast.add({ severity: 'warn', summary: 'Duplicate Name', detail: 'This name has already been added.', life: 3000 });
    }
  }
};

const removeFormParticipant = (index) => {
  checkForm.value.participants.splice(index, 1);
};

const saveCheck = () => {
  checkFormSubmitted.value = true;
  if (!checkForm.value.total) return;
  if (checkForm.value.taxIncluded && checkForm.value.taxRate === null) return;

  const newCheck = store.addCheck(checkForm.value);
  createCheckVisible.value = false;
  selectedCheck.value = store.checks.find(c => c.id === newCheck.id);
  toast.add({ severity: 'success', summary: 'Check Created', detail: 'Check successfully created.', life: 3000 });
};

const deleteCheckVisible = ref(false);
const checkToDelete = ref(null);
const confirmDeleteCheck = (check) => {
  checkToDelete.value = check;
  deleteCheckVisible.value = true;
};
const deleteCheckConfirm = () => {
  if (checkToDelete.value) {
    store.deleteCheck(checkToDelete.value.id);
    if (selectedCheck.value?.id === checkToDelete.value.id) {
      selectedCheck.value = null;
    }
    deleteCheckVisible.value = false;
    checkToDelete.value = null;
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Check deleted successfully.', life: 3000 });
  }
};

// ── PARTICIPANTS checklists search & sort ──
const participantSearch = ref('');
const participantSortBy = ref('name');
const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Total (Desc)', value: 'totalDesc' },
  { label: 'Total (Asc)', value: 'totalAsc' },
  { label: 'Paid Status', value: 'paid' }
];

const getParticipantStatus = (p) => {
  if (p.paid) return 'paid';
  if (!p.orders || p.orders.length === 0 || p.total <= 0) return 'pendingSetup';
  return 'awaitingPayment';
};

const getParticipantStatusClass = (p) => {
  const status = getParticipantStatus(p);
  if (status === 'paid') return 'status--paid';
  if (status === 'pendingSetup') return 'status--pending';
  return 'status--awaiting';
};

const getParticipantStatusLabel = (p) => {
  const status = getParticipantStatus(p);
  if (status === 'paid') return i18nStore.t('statusSettled');
  if (status === 'pendingSetup') return i18nStore.t('statusPendingSetup');
  return i18nStore.t('statusAwaitingPayment');
};

const filteredParticipants = computed(() => {
  if (!selectedCheck.value) return [];
  let list = [...selectedCheck.value.participants];
  const q = participantSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }
  
  // Sort by weight: Awaiting Payment (1) -> Pending Setup (2) -> Settled (3)
  list.sort((a, b) => {
    const statusA = getParticipantStatus(a);
    const statusB = getParticipantStatus(b);
    
    const getWeight = (status) => {
      if (status === 'awaitingPayment') return 1;
      if (status === 'pendingSetup') return 2;
      return 3;
    };
    
    const weightA = getWeight(statusA);
    const weightB = getWeight(statusB);
    
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    
    if (participantSortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (participantSortBy.value === 'totalDesc') {
      return b.total - a.total;
    } else if (participantSortBy.value === 'totalAsc') {
      return a.total - b.total;
    }
    return 0;
  });
  return list;
});

const togglePaidStatus = (participantId, checked) => {
  if (selectedCheck.value) {
    store.toggleParticipantPaid(selectedCheck.value.id, participantId, checked);
    selectedCheck.value = store.checks.find(c => c.id === selectedCheck.value.id);
    const p = selectedCheck.value.participants.find(part => part.id === participantId);
    toast.add({ 
      severity: 'info', 
      summary: checked ? 'Paid' : 'Pending', 
      detail: `${p.name} status updated.`, 
      life: 2000 
    });
  }
};

const addParticipantVisible = ref(false);
const singleParticipantName = ref('');
const openAddParticipantDialog = () => {
  singleParticipantName.value = '';
  addParticipantVisible.value = true;
};
const saveSingleParticipant = () => {
  const name = singleParticipantName.value.trim();
  if (name && selectedCheck.value) {
    if (!selectedCheck.value.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      store.addParticipant(selectedCheck.value.id, name);
      selectedCheck.value = store.checks.find(c => c.id === selectedCheck.value.id);
      addParticipantVisible.value = false;
      toast.add({ severity: 'success', summary: 'Added', detail: 'Participant added.', life: 2000 });
    } else {
      toast.add({ severity: 'warn', summary: 'Duplicate Name', detail: 'This name has already been added.', life: 3000 });
    }
  }
};

const editParticipantNamePrompt = (participant) => {
  const newName = prompt("Rename participant:", participant.name);
  if (newName && newName.trim()) {
    store.updateParticipantName(selectedCheck.value.id, participant.id, newName.trim());
    selectedCheck.value = store.checks.find(c => c.id === selectedCheck.value.id);
    toast.add({ severity: 'success', summary: 'Updated', detail: 'Participant renamed.', life: 2000 });
  }
};

const deleteParticipantRow = (participant) => {
  if (selectedCheck.value) {
    store.deleteParticipant(selectedCheck.value.id, participant.id);
    selectedCheck.value = store.checks.find(c => c.id === selectedCheck.value.id);
    toast.add({ severity: 'success', summary: 'Deleted', detail: `${participant.name} removed.`, life: 2000 });
  }
};

// ── EDIT ORDERS DIALOG ──
const ordersDialogVisible = ref(false);
const ordersDialogTitle = ref('');
const selectedParticipantId = ref(null);
const orderItemsList = ref([]);
const orderPaymentMethod = ref('Cash');
const itemForm = ref({ itemName: '', price: null, quantity: 1 });

const paymentMethodOptions = [
  { label: 'Cash', value: 'Cash' },
  { label: 'InstaPay', value: 'InstaPay' },
  { label: 'Vodafone Cash', value: 'Vodafone Cash' },
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Visa', value: 'Visa' },
  { label: 'Other', value: 'Other' }
];

const getPaymentIcon = (method) => {
  switch (method) {
    case 'Cash': return 'pi pi-money-bill';
    case 'InstaPay': return 'pi pi-bolt';
    case 'Vodafone Cash': return 'pi pi-mobile';
    case 'Credit Card': return 'pi pi-credit-card';
    case 'Visa': return 'pi pi-credit-card';
    default: return 'pi pi-ellipsis-h';
  }
};

const calculatedOrdersTotal = computed(() => {
  return orderItemsList.value.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
});

const editParticipantOrders = (participant) => {
  selectedParticipantId.value = participant.id;
  ordersDialogTitle.value = `Order items for ${participant.name}`;
  orderItemsList.value = participant.orders ? JSON.parse(JSON.stringify(participant.orders)) : [];
  orderPaymentMethod.value = participant.paymentMethod || 'Cash';
  
  itemForm.value = { itemName: '', price: null, quantity: 1 };
  ordersDialogVisible.value = true;
};

const addOrderItem = () => {
  const name = itemForm.value.itemName.trim();
  const price = Number(itemForm.value.price || 0);
  const qty = Number(itemForm.value.quantity || 1);

  if (name && price > 0) {
    orderItemsList.value.push({
      id: Math.random().toString(36).substring(2, 9),
      itemName: name,
      price: price,
      quantity: qty,
      subtotal: price * qty
    });
    itemForm.value = { itemName: '', price: null, quantity: 1 };
  } else {
    toast.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Item name and price > 0 are required.', life: 2500 });
  }
};

const removeOrderItem = (index) => {
  orderItemsList.value.splice(index, 1);
};

const saveParticipantOrders = () => {
  if (selectedCheck.value && selectedParticipantId.value) {
    const name = itemForm.value.itemName ? itemForm.value.itemName.trim() : '';
    const price = Number(itemForm.value.price || 0);
    const qty = Number(itemForm.value.quantity || 1);

    if (name && price > 0) {
      orderItemsList.value.push({
        id: Math.random().toString(36).substring(2, 9),
        itemName: name,
        price: price,
        quantity: qty,
        subtotal: price * qty
      });
      itemForm.value = { itemName: '', price: null, quantity: 1 };
    }

    const pName = selectedCheck.value.participants.find(p => p.id === selectedParticipantId.value)?.name || '';
    const pTotal = calculatedOrdersTotal.value;
    const pMethod = orderPaymentMethod.value;

    store.updateParticipantOrders(
      selectedCheck.value.id,
      selectedParticipantId.value,
      orderItemsList.value,
      pMethod
    );
    ordersDialogVisible.value = false;
    selectedCheck.value = store.checks.find(c => c.id === selectedCheck.value.id);
    toast.add({ severity: 'success', summary: 'Orders Saved', detail: 'Participant order details updated.', life: 3000 });

    if (pMethod === 'InstaPay' || pMethod === 'Vodafone Cash') {
      router.push({
        path: '/payment-dispatcher',
        query: {
          name: pName,
          amount: pTotal.toFixed(2),
          method: pMethod
        }
      });
    }
  }
};

// ── VIEW HISTORIC REPORT DETAILS ──
const completedReportVisible = ref(false);
const completedReportCheck = ref(null);
const openCompletedReport = (check) => {
  completedReportCheck.value = check;
  completedReportVisible.value = true;
};

// ── CELEBRATION ANIMATION SYSTEM ──
const celebrationVisible = ref(false);
const confettiCanvas = ref(null);
let animationFrameId = null;

const startCelebration = () => {
  celebrationVisible.value = true;
  const canvas = confettiCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
  const particles = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 6 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 4 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 5 - 2.5
    });
  }

  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      
      if (p.y < canvas.height) {
        alive = true;
        ctx.save();
        ctx.translate(p.x + p.size/2, p.y + p.size/2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive && celebrationVisible.value) {
      animationFrameId = requestAnimationFrame(render);
    }
  };

  animationFrameId = requestAnimationFrame(render);
};

const stopCelebration = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const canvas = confettiCanvas.value;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

onBeforeUnmount(() => {
  stopCelebration();
});

const handleFinishCheck = () => {
  if (selectedCheck.value) {
    store.finishCheck(selectedCheck.value.id);
    startCelebration();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Check successfully completed!', life: 4000 });
    selectedCheck.value = null;
  }
};
</script>

<style scoped>
.check-calculator-page {
  font-family: 'Inter', system-ui, sans-serif;
  color: #f1f5f9;
}

.custom-check-box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(99, 102, 241, 0.4);
  background: rgba(30, 41, 59, 0.9);
  cursor: pointer;
  accent-color: #6366f1;
  outline: none;
  transition: transform 0.1s;
}
.custom-check-box:active {
  transform: scale(0.9);
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
}
.status--paid { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.status--awaiting { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.status--pending { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

.dialog-body { display: flex; flex-direction: column; gap: 1.25rem; }
.field-group { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.field-error { color: #f87171; font-size: 0.75rem; }

.confirm-body { display: flex; align-items: start; gap: 0.875rem; }
.text-xxs { font-size: 0.7rem; }
.text-xs { font-size: 0.8rem; }

/* ── PrimeVue Responsive style integrations ── */
:deep(.p-datatable) { background: transparent !important; }
:deep(.p-datatable-thead > tr > th) {
  background: rgba(99,102,241,0.08) !important;
  color: #94a3b8 !important;
  border-color: rgba(99,102,241,0.1) !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
}
:deep(.p-datatable-tbody > tr) { background: transparent !important; border-color: rgba(99,102,241,0.08) !important; }
:deep(.p-datatable-tbody > tr > td) { border-color: rgba(99,102,241,0.08) !important; color: #cbd5e1 !important; }

:deep(.p-inputtext), :deep(.p-inputnumber-input) {
  background: rgba(30,41,59,0.85) !important;
  border-color: rgba(99,102,241,0.2) !important;
  color: #f1f5f9 !important;
  border-radius: 10px !important;
  padding: 0.75rem 1rem !important;
}
:deep(.p-select) {
  background: rgba(30,41,59,0.85) !important;
  border-color: rgba(99,102,241,0.2) !important;
  color: #f1f5f9 !important;
  border-radius: 10px !important;
}

:deep(.p-dialog) {
  border-radius: 18px !important;
  background: #1e293b !important;
  border: 1px solid rgba(99, 102, 241, 0.15) !important;
}
:deep(.p-dialog-header) {
  background: #1e293b !important;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1) !important;
  padding: 1.25rem !important;
}
:deep(.p-dialog-content) {
  background: #1e293b !important;
  padding: 1.25rem !important;
}
:deep(.p-dialog-footer) {
  background: #1e293b !important;
  border-top: 1px solid rgba(99, 102, 241, 0.1) !important;
  padding: 1rem 1.25rem !important;
}

/* ── Responsive breakpoints layout switches ── */
.desktop-table { display: none; }
.mobile-list { display: flex; flex-direction: column; }

@media (min-width: 768px) {
  .desktop-table { display: block; }
  .mobile-list { display: none; }
}

.mobile-card {
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: border 0.2s, background 0.2s;
}
.mobile-card:hover {
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(30, 41, 59, 0.7);
}
</style>
