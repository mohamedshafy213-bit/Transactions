<template>
  <div class="payment-dispatcher-page px-4 py-6 md:px-8 md:py-8 w-full max-w-7xl mx-auto overflow-x-hidden">
    <!-- Header Section -->
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-indigo-500/10">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <i class="pi pi-send text-indigo-400 text-3xl animate-pulse"></i>
          <span>{{ i18nStore.t('paymentDispatcher') }}</span>
        </h1>
        <p class="text-xs md:text-sm text-slate-400 mt-1.5">
          {{ i18nStore.locale === 'ar' ? 'قم بإدارة روابط الدفع الخاصة بك وإرسالها بسهولة عبر الواتساب لجهات الاتصال.' : 'Manage your payment links and easily dispatch them to contacts via WhatsApp.' }}
        </p>
      </div>
      <Button
        :label="i18nStore.t('btnAddNewLink')"
        icon="pi pi-plus"
        severity="primary"
        class="w-full sm:w-auto font-bold min-h-[46px] sm:min-h-0 text-sm shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-violet-600 border-none hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        @click="openAddDialog"
      />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- LEFT SECTION: Link Management Settings (5 cols on lg) -->
      <section class="lg:col-span-5 flex flex-col gap-6">
        <div class="glass-card p-5 rounded-2xl border border-slate-700/40 bg-slate-900/40 backdrop-blur-md shadow-xl">
          <h2 class="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <i class="pi pi-cog text-indigo-400"></i>
            <span>{{ i18nStore.t('paymentLinks') }}</span>
          </h2>

          <div class="flex flex-col gap-3">
            <div 
              v-for="link in paymentStore.paymentLinks" 
              :key="link.id"
              class="link-row group flex items-center justify-between p-4 rounded-xl border transition-all duration-300"
              :class="link.isDefault 
                ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5' 
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'"
            >
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div class="mt-1 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  :class="link.isDefault ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-950/40'"
                >
                  <i :class="link.isDefault ? 'pi pi-check-circle' : 'pi pi-link'"></i>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-sm md:text-base text-slate-200 truncate">{{ link.label }}</span>
                    <span v-if="link.isDefault" class="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      {{ i18nStore.locale === 'ar' ? 'افتراضي' : 'Default' }}
                    </span>
                    <span v-if="link.isPrimary" class="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                      {{ i18nStore.locale === 'ar' ? 'أساسي' : 'Primary' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 truncate mt-1 font-mono select-all max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-[220px]">{{ link.url }}</p>
                </div>
              </div>

              <!-- Action Row -->
              <div class="flex items-center gap-1.5 ml-2">
                <Button 
                  v-if="!link.isDefault"
                  icon="pi pi-star" 
                  severity="secondary" 
                  text 
                  rounded 
                  class="hover:text-amber-400 transition-colors duration-200"
                  v-tooltip.top="i18nStore.t('makeDefault')"
                  @click="paymentStore.setDefaultLink(link.id)"
                  aria-label="Set Default"
                />
                <Button 
                  icon="pi pi-pencil" 
                  severity="secondary" 
                  text 
                  rounded 
                  class="hover:text-indigo-400 transition-colors duration-200"
                  @click="openEditDialog(link)"
                  aria-label="Edit"
                />
                <Button 
                  v-if="!link.isPrimary" 
                  icon="pi pi-trash" 
                  severity="danger" 
                  text 
                  rounded 
                  class="hover:text-rose-400 transition-colors duration-200"
                  @click="paymentStore.deleteLink(link.id)"
                  aria-label="Delete"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- RIGHT SECTION: Contact Selection & Dispatch (7 cols on lg) -->
      <section class="lg:col-span-7 flex flex-col gap-6">
        <div class="glass-card p-6 rounded-2xl border border-slate-700/40 bg-slate-900/40 backdrop-blur-md shadow-xl">
          <h2 class="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
            <i class="pi pi-user-plus text-emerald-400"></i>
            <span>{{ i18nStore.t('contactSelected') }}</span>
          </h2>

          <!-- Contact Selection Buttons -->
          <div class="flex flex-col gap-4 mb-6">
            <!-- Native Contact Picker Activation -->
            <button
              v-if="isContactPickerSupported"
              type="button"
              class="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 active:scale-[0.99] transition-all duration-300"
              @click="triggerContactPicker"
            >
              <i class="pi pi-phone text-lg"></i>
              <span>{{ i18nStore.t('selectContact') }}</span>
            </button>

            <!-- Browser Support Alert for Desktop / iOS -->
            <div 
              v-else 
              class="flex items-start gap-3 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-slate-300"
            >
              <i class="pi pi-info-circle text-indigo-400 mt-0.5 text-lg"></i>
              <div class="flex-1 text-xs md:text-sm">
                <span class="font-bold text-slate-200 block mb-1">
                  {{ i18nStore.t('manualEntry') }}
                </span>
                <span>{{ i18nStore.t('manualEntryDesc') }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Detail Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div class="flex flex-col gap-2">
              <label for="contactName" class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {{ i18nStore.t('contactName') }}
              </label>
              <div class="relative">
                <i class="pi pi-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <InputText 
                  id="contactName" 
                  v-model="contactName" 
                  placeholder="e.g. John Doe"
                  class="w-full pl-10 border border-slate-700 bg-slate-950/40 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 transition-all duration-300 h-11"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label for="contactPhone" class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {{ i18nStore.t('contactPhone') }}
              </label>
              <div class="relative">
                <i class="pi pi-whatsapp absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <InputText 
                  id="contactPhone" 
                  v-model="contactPhone" 
                  placeholder="e.g. 01012345678"
                  class="w-full pl-10 border border-slate-700 bg-slate-950/40 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 transition-all duration-300 h-11"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label for="amountDue" class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {{ i18nStore.locale === 'ar' ? 'المبلغ المطلوب' : 'Amount Due' }}
              </label>
              <div class="relative">
                <i class="pi pi-dollar absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <InputText 
                  id="amountDue" 
                  v-model="amountDue" 
                  placeholder="e.g. 150.00"
                  class="w-full pl-10 border border-slate-700 bg-slate-950/40 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 transition-all duration-300 h-11"
                />
              </div>
            </div>
          </div>

          <!-- Link Selection & Dispatch Area -->
          <div class="border-t border-slate-800/80 pt-6">
            <div class="flex flex-col gap-2 mb-6">
              <label for="paymentLinkSelect" class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {{ i18nStore.t('selectPaymentLink') }}
              </label>
              <Select 
                id="paymentLinkSelect"
                v-model="selectedLinkId" 
                :options="paymentStore.paymentLinks" 
                optionLabel="label" 
                optionValue="id"
                placeholder="Choose Link"
                fluid
                class="border border-slate-700 bg-slate-950/40 text-slate-200 rounded-xl focus:border-indigo-500 transition-all duration-300 h-11 flex items-center"
              />
            </div>

            <!-- Beautiful Chat Message Preview -->
            <div class="mb-8">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {{ i18nStore.locale === 'ar' ? 'معاينة الرسالة' : 'Message Preview' }}
              </span>
              <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 relative overflow-hidden">
                <!-- Chat Bubble UI -->
                <div class="flex items-end gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs">
                    <i class="pi pi-whatsapp"></i>
                  </div>
                  <div class="relative bg-emerald-950/40 border border-emerald-500/20 text-slate-200 p-3.5 rounded-2xl rounded-bl-none text-sm leading-relaxed max-w-[85%]">
                    <p class="whitespace-pre-line font-medium text-slate-100">
                      {{ messageContent }}
                    </p>
                    <span class="text-[10px] text-slate-500 mt-2 block text-right font-mono">
                      {{ formatTime(new Date()) }} ✓✓
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Send Button -->
            <button
              type="button"
              class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/10 disabled:shadow-none min-h-[52px]"
              :disabled="!contactPhone || !selectedLinkId"
              @click="dispatchWhatsApp"
            >
              <i class="pi pi-whatsapp text-xl"></i>
              <span>{{ i18nStore.t('btnSendWhatsApp') }}</span>
            </button>
          </div>
        </div>
      </section>

    </div>

    <!-- Add/Edit Payment Link Modal -->
    <Dialog 
      v-model:visible="isDialogVisible" 
      modal 
      :header="isEditing ? i18nStore.t('dialogEditTitle') : i18nStore.t('dialogAddTitle')"
      :style="{ width: '450px' }"
      class="custom-dialog-panel border border-slate-700 bg-slate-900 text-slate-100 rounded-2xl overflow-hidden p-6"
    >
      <div class="flex flex-col gap-4 py-2 text-slate-300">
        <div class="flex flex-col gap-2">
          <label for="linkLabel" class="text-sm font-semibold text-slate-400">{{ i18nStore.t('labelInput') }}</label>
          <InputText 
            id="linkLabel" 
            v-model="dialogLabel" 
            class="w-full border border-slate-700 bg-slate-950 text-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 transition-all duration-300"
            placeholder="e.g. My Vodafone Cash"
            autofocus
          />
          <small v-if="dialogSubmitted && !dialogLabel" class="text-rose-400 text-xs flex items-center gap-1 mt-0.5">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ i18nStore.t('validationLabelRequired') }}</span>
          </small>
        </div>

        <div class="flex flex-col gap-2">
          <label for="linkUrl" class="text-sm font-semibold text-slate-400">{{ i18nStore.t('urlInput') }}</label>
          <InputText 
            id="linkUrl" 
            v-model="dialogUrl" 
            class="w-full border border-slate-700 bg-slate-950 text-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 transition-all duration-300"
            placeholder="e.g. https://instapay.eg/something"
          />
          <small v-if="dialogSubmitted && !dialogUrl" class="text-rose-400 text-xs flex items-center gap-1 mt-0.5">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ i18nStore.t('validationUrlRequired') }}</span>
          </small>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
          <Button 
            :label="i18nStore.t('btnCancel')" 
            severity="secondary" 
            text
            class="font-semibold text-sm hover:bg-slate-800 py-2.5 px-4 rounded-xl transition-all duration-200" 
            @click="closeDialog" 
          />
          <Button 
            :label="i18nStore.t('btnSave')" 
            severity="primary" 
            class="font-bold text-sm bg-indigo-600 hover:bg-indigo-500 border-none py-2.5 px-5 rounded-xl shadow-md transition-all duration-200" 
            @click="saveLink" 
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePaymentStore } from '../stores/PaymentStore';
import { useI18nStore } from '../stores/i18n';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const paymentStore = usePaymentStore();
const i18nStore = useI18nStore();
const toast = useToast();

// State refs
const isContactPickerSupported = ref(false);
const contactName = ref('');
const contactPhone = ref('');
const amountDue = ref('');
const selectedLinkId = ref('');

// Dialog state refs
const isDialogVisible = ref(false);
const isEditing = ref(false);
const editingLinkId = ref(null);
const dialogLabel = ref('');
const dialogUrl = ref('');
const dialogSubmitted = ref(false);

onMounted(() => {
  // Check API availability
  isContactPickerSupported.value = typeof navigator !== 'undefined' && 'contacts' in navigator && 'select' in navigator.contacts;
  
  // Read query params from route
  const queryName = route.query.name;
  const queryAmount = route.query.amount;
  const queryMethod = route.query.method;

  if (queryName) {
    contactName.value = queryName;
  }
  if (queryAmount) {
    amountDue.value = queryAmount;
  }

  // Pre-select link based on queryMethod (Instapay, Vodafone Cash, etc.)
  if (queryMethod) {
    const searchStr = String(queryMethod).toLowerCase();
    const matchedLink = paymentStore.paymentLinks.find(link => 
      link.label.toLowerCase().includes(searchStr) || 
      link.url.toLowerCase().includes(searchStr)
    );
    if (matchedLink) {
      selectedLinkId.value = matchedLink.id;
    } else {
      const defaultLink = paymentStore.defaultLink;
      if (defaultLink) {
        selectedLinkId.value = defaultLink.id;
      }
    }
  } else {
    // Set initial selected link to default Instapay
    const defaultLink = paymentStore.defaultLink;
    if (defaultLink) {
      selectedLinkId.value = defaultLink.id;
    }
  }
});

// Computed properties
const selectedLink = computed(() => {
  return paymentStore.paymentLinks.find(link => link.id === selectedLinkId.value) || paymentStore.defaultLink;
});

const messageContent = computed(() => {
  const name = contactName.value.trim() || (i18nStore.locale === 'ar' ? 'صديقي' : 'Friend');
  const url = selectedLink.value ? selectedLink.value.url : '';
  
  if (amountDue.value && amountDue.value.trim()) {
    return i18nStore.t('whatsAppTemplateWithAmount', { name, url, amount: amountDue.value.trim() });
  }
  return i18nStore.t('whatsAppTemplate', { name, url });
});

// Handlers
const triggerContactPicker = async () => {
  try {
    const props = ['name', 'tel'];
    const opts = { multiple: false };
    const contacts = await navigator.contacts.select(props, opts);
    if (contacts && contacts.length > 0) {
      const contact = contacts[0];
      
      const rawName = Array.isArray(contact.name) && contact.name.length > 0 ? contact.name[0] : contact.name;
      const rawPhone = Array.isArray(contact.tel) && contact.tel.length > 0 ? contact.tel[0] : contact.tel;
      
      contactName.value = rawName || '';
      contactPhone.value = rawPhone || '';
      
      toast.add({ 
        severity: 'success', 
        summary: i18nStore.t('toastSuccess'), 
        detail: i18nStore.locale === 'ar' ? 'تم اختيار جهة الاتصال بنجاح' : 'Contact selected successfully', 
        life: 3000 
      });
    }
  } catch (err) {
    console.warn('Contact picker cancelled or errored:', err);
  }
};

const openAddDialog = () => {
  isEditing.value = false;
  editingLinkId.value = null;
  dialogLabel.value = '';
  dialogUrl.value = '';
  dialogSubmitted.value = false;
  isDialogVisible.value = true;
};

const openEditDialog = (link) => {
  isEditing.value = true;
  editingLinkId.value = link.id;
  dialogLabel.value = link.label;
  dialogUrl.value = link.url;
  dialogSubmitted.value = false;
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
};

const saveLink = () => {
  dialogSubmitted.value = true;
  if (!dialogLabel.value.trim() || !dialogUrl.value.trim()) {
    return;
  }

  if (isEditing.value && editingLinkId.value) {
    paymentStore.updateLink(editingLinkId.value, dialogLabel.value.trim(), dialogUrl.value.trim());
    toast.add({ 
      severity: 'success', 
      summary: i18nStore.t('toastSuccess'), 
      detail: i18nStore.t('toastLinkUpdated'), 
      life: 3000 
    });
  } else {
    const newLink = paymentStore.addCustomLink(dialogLabel.value.trim(), dialogUrl.value.trim());
    if (paymentStore.paymentLinks.length === 1) {
      paymentStore.setDefaultLink(newLink.id);
    }
    toast.add({ 
      severity: 'success', 
      summary: i18nStore.t('toastSuccess'), 
      detail: i18nStore.t('toastLinkAdded'), 
      life: 3000 
    });
  }
  
  isDialogVisible.value = false;
};

const formatPhoneNumber = (num) => {
  if (!num) return '';
  // Clean all characters except digits
  let cleaned = num.replace(/[^\d]/g, '');
  // If it starts with local prefix '01' and is 11 digits (typical Egyptian mobile number)
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    cleaned = '2' + cleaned;
  }
  return cleaned;
};

const dispatchWhatsApp = () => {
  if (!contactPhone.value) return;
  const cleanedPhone = formatPhoneNumber(contactPhone.value);
  const waUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(messageContent.value)}`;
  window.open(waUrl, '_blank');
};

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.glass-card {
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.link-row {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.link-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.25);
}
</style>
