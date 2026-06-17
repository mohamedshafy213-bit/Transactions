import { defineStore } from 'pinia';

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: localStorage.getItem('locale') || 'en'
  }),
  actions: {
    setLocale(lang) {
      this.locale = lang;
      localStorage.setItem('locale', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    },
    initLocale() {
      const lang = this.locale;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    },
    t(key, replacements = {}) {
      const lang = this.locale;
      let text = translations[lang]?.[key] || translations['en']?.[key] || key;
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
      return text;
    }
  }
});

export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    transactions: "Transactions",
    fixedMoney: "My Bills",
    logout: "Logout",
    login: "Login",
    salaryTracker: "Salary Tracker",
    closeMenu: "Close menu",

    // Date Filters
    today: "Today",
    yesterday: "Yesterday",
    last7: "Last 7 Days",
    last30: "Last 30 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisYear: "This Year",
    allTime: "All Time",
    filterCustom: "Custom Range",

    // Dashboard Greetings
    helloCutieSama: "hello cutie sama 🩷",
    moneyLately: "here's how your money is doing lately 💸",
    helloAdmin: "Hello, Admin 👋",
    financialSummary: "Here's your financial summary",
    welcomeBack: "Welcome Back 👋",
    financialOverview: "Here is your financial overview",
    yourSalaryThisMonth: "💼 Your salary this month: {amount}",
    showingData: "📅 Showing: {range}",

    // Dashboard KPI Cards
    moneyIn: "Money In",
    moneyOut: "Money Out",
    leftOver: "Left Over",
    saved: "Saved",
    whatYouReceived: "what you received",
    whatYouSpent: "what you spent",
    yourBalancePeriod: "your balance this period",
    ofIncomeSaved: "of your income was saved",

    // Dashboard Installments Cards
    totalActiveInstallments: "Total Active Installments",
    monthlyInstallmentsDue: "Monthly Installments Due",
    totalRemainingBalance: "Total Remaining Balance",
    upcomingPaymentsThisMonth: "Upcoming Payments This Month",
    activeInstallmentsDesc: "Active commitments",
    monthlyDueDesc: "Due this month",
    remainingBalanceDesc: "Total debt balance",
    upcomingPaymentsDesc: "Payments this month",

    // Health Banner
    savingWell: "Great job! You're saving well this month!",
    cutSpending: "Not bad! Try to cut a little spending.",
    spentMost: "Heads up! You spent most of your income.",
    addIncomeStart: "Add your income to start tracking!",

    // Warnings / Alerts
    paymentDueAlert: "⚠️ {name} payment due {dayText}",
    paymentOverdueAlert: "⚠️ {name} bill overdue by {days} day(s)",

    // Dashboard Charts
    whereMoneyGo: "Where did your money go? 💸",
    spendingSplit: "Your spending split by category",
    noSpendingRecorded: "No spending recorded yet 🎉",
    incomeVsSpending: "Income vs Spending 📊",
    monthMonthComparison: "Month by month comparison",
    nothingToShow: "Nothing to show yet — add income or expenses!",

    // Dashboard Commitments Widget
    monthlyCommitments: "Your Monthly Commitments 📋",
    regularBills: "These are your regular bills and installments",
    totalThisMonth: "Total this month:",
    noCommitmentsYet: "No commitments added yet. Add them in Fixed Money!",
    manageCommitments: "Manage commitments →",

    // Notification Center
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No notifications yet",
    notificationUpcoming: "Upcoming Payment: {name}",
    notificationUpcomingMsg: "{name} payment of {amount} is due in {days} days ({date})",
    notificationUpcomingTomorrow: "{name} payment of {amount} is due tomorrow! ({date})",
    notificationDueToday: "Payment Due Today: {name}",
    notificationDueTodayMsg: "{name} payment of {amount} is due today!",
    notificationOverdue: "Overdue Payment: {name}",
    notificationOverdueMsg: "{name} payment of {amount} is overdue by {days} day(s)!",
    notificationSubscription: "Subscription Renewal: {name}",
    notificationBillReminder: "Monthly Bill: {name}",

    // Fixed Money Page
    newCommitment: "New Installment",
    editCommitment: "Edit Installment",
    searchPlaceholder: "Search...",
    filterAll: "All Statuses",
    filterActive: "Active",
    filterCompleted: "Completed",
    filterDueSoon: "Due Soon",
    filterOverdue: "Overdue",
    sortBy: "Sort By",
    sortDueDate: "Due Date",
    sortProgress: "Progress",
    sortAmount: "Amount",
    sortName: "Name",

    // Fixed Money Table / Cards
    colName: "Name",
    colTotalAmount: "Total Amount",
    colMonthlyPayment: "Monthly Payment",
    colPaidAmount: "Paid Amount",
    colRemainingBalance: "Remaining Balance",
    colTotalMonths: "Total Months",
    colRemainingMonths: "Remaining Months",
    colNextDueDate: "Next Due Date",
    colStatus: "Status",
    colProgress: "Progress",
    colActions: "Actions",

    // Fixed Money Dialog Fields
    fieldName: "Name / Purpose",
    fieldTotalAmount: "Total Commitment Amount",
    fieldInstallmentAmount: "Installment Amount Per Month",
    fieldTotalMonths: "Total Number of Months",
    fieldStartDate: "Start Date",
    fieldDueDay: "Due Day of Month",
    fieldType: "Commitment Type",
    fieldStatus: "Status",
    fieldNotes: "Notes / Description (optional)",
    btnCancel: "Cancel",
    btnSave: "Save",
    btnUpdate: "Update",
    validationNameRequired: "Name is required.",
    validationTotalRequired: "Total Amount must be greater than 0.",
    validationInstallmentRequired: "Monthly Installment must be greater than 0.",
    validationMonthsRequired: "Total Months must be at least 1.",
    validationStartRequired: "Start Date is required.",
    validationDueDayRequired: "Due Day must be between 1 and 31.",

    // Commitments Statuses & Types
    statusActive: "Active",
    statusCompleted: "Completed",
    statusPaused: "Paused",
    typeBill: "Bill",
    typeLoan: "Loan",
    typeInstallment: "Installment",
    typeSubscription: "Subscription",
    typeOther: "Other",

    // Quick Actions
    btnPaid: "Paid",
    btnSkip: "Skip",
    btnHistory: "History",
    btnDelete: "Delete",
    btnEdit: "Edit",
    confirmDeleteHeader: "Delete Installment",
    confirmDeleteMsg: "Are you sure you want to delete {name}? This will remove all associated payment logs.",
    confirmSkipHeader: "Skip This Month",
    confirmSkipMsg: "Are you sure you want to skip {name} for this month? The due date will advance but no payment will be recorded.",

    // Payment History Modal
    paymentHistoryTitle: "Payment History - {name}",
    historyColDate: "Payment Date",
    historyColAmount: "Amount",
    historyColInstallmentNum: "Installment #",
    historyColNotes: "Notes",
    historyEmpty: "No payments logged yet.",
    historySkip: "Skipped",

    // Transactions Page
    expenses: "Expenses",
    incomes: "Incomes",
    btnNew: "New",
    btnExport: "Export",
    expenseTotal: "Total Expenses:",
    incomeTotal: "Total Incomes:",
    searchExpensesPlaceholder: "Search expenses...",
    searchIncomesPlaceholder: "Search incomes...",
    filterType: "Filter Type",
    allTypes: "All Types",
    addIncome: "Add New Income",
    editIncome: "Edit Income",
    amount: "Amount",
    category: "Category",
    type: "Type",
    reason: "Reason",
    source: "Source",
    note: "Note (optional)",
    newCategoryName: "New Category Name",
    btnAdd: "Add",
    deleteExpenseHeader: "Delete Expense",
    deleteExpenseConfirm: "Are you sure you want to delete this expense?",
    toastSuccess: "Success",
    toastDeleted: "Deleted",
    toastUpdated: "Updated",
    toastCreated: "Created",
    toastAdded: "Added"
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    transactions: "المعاملات",
    fixedMoney: "فواتيري",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    salaryTracker: "متبع الراتب",
    closeMenu: "إغلاق القائمة",

    // Date Filters
    today: "اليوم",
    yesterday: "أمس",
    last7: "آخر 7 أيام",
    last30: "آخر 30 يوماً",
    thisMonth: "هذا الشهر",
    lastMonth: "الشهر الماضي",
    thisYear: "هذه السنة",
    allTime: "كل الأوقات",
    filterCustom: "نطاق مخصص",

    // Dashboard Greetings
    helloCutieSama: "أهلاً يا حلوة سما 🩷",
    moneyLately: "إليكِ كيف يبدو وضع أموالكِ مؤخراً 💸",
    helloAdmin: "أهلاً، المسؤول 👋",
    financialSummary: "إليك ملخصك المالي",
    welcomeBack: "مرحباً بعودتك 👋",
    financialOverview: "إليك نظرة عامة على أموالك",
    yourSalaryThisMonth: "💼 راتبك هذا الشهر: {amount}",
    showingData: "📅 يعرض: {range}",

    // Dashboard KPI Cards
    moneyIn: "المداخيل",
    moneyOut: "المصاريف",
    leftOver: "المتبقي",
    saved: "الادخار",
    whatYouReceived: "ما تلقيته",
    whatYouSpent: "ما أنفقته",
    yourBalancePeriod: "رصيدك في هذه الفترة",
    ofIncomeSaved: "من دخلك تم ادخاره",

    // Dashboard Installments Cards
    totalActiveInstallments: "إجمالي الأقساط النشطة",
    monthlyInstallmentsDue: "الأقساط المستحقة شهرياً",
    totalRemainingBalance: "إجمالي الرصيد المتبقي",
    upcomingPaymentsThisMonth: "المدفوعات القادمة هذا الشهر",
    activeInstallmentsDesc: "الالتزامات النشطة حالياً",
    monthlyDueDesc: "مستحق هذا الشهر",
    remainingBalanceDesc: "إجمالي رصيد الديون المتبقي",
    upcomingPaymentsDesc: "دفعات مستحقة هذا الشهر",

    // Health Banner
    savingWell: "عمل رائع! أنت تدخر بشكل جيد هذا الشهر!",
    cutSpending: "ليس سيئاً! حاول تقليل الإنفاق قليلاً.",
    spentMost: "تنبيه! لقد أنفقت معظم دخلك.",
    addIncomeStart: "أضف دخلك للبدء في التتبع!",

    // Warnings / Alerts
    paymentDueAlert: "⚠️ قسط {name} مستحق {dayText}",
    paymentOverdueAlert: "⚠️ فاتورة {name} متأخرة بمقدار {days} يوم/أيام",

    // Dashboard Charts
    whereMoneyGo: "أين ذهبت أموالك؟ 💸",
    spendingSplit: "توزيع نفقاتك حسب الفئة",
    noSpendingRecorded: "لم يتم تسجيل أي إنفاق بعد 🎉",
    incomeVsSpending: "الدخل مقابل الإنفاق 📊",
    monthMonthComparison: "مقارنة شهراً بشهر",
    nothingToShow: "لا يوجد شيء لعرضه — أضف دخلاً أو مصاريف!",

    // Dashboard Commitments Widget
    monthlyCommitments: "التزاماتك الشهرية 📋",
    regularBills: "هذه هي فواتيرك وأقساطك الدورية",
    totalThisMonth: "الإجمالي هذا الشهر:",
    noCommitmentsYet: "لم يتم إضافة أي التزامات بعد. أضفها في الأقساط!",
    manageCommitments: "إدارة الالتزامات ←",

    // Notification Center
    notifications: "التنبيهات",
    markAllRead: "تحديد الكل كمقروء",
    noNotifications: "لا توجد تنبيهات بعد",
    notificationUpcoming: "دفعة قادمة: {name}",
    notificationUpcomingMsg: "قسط {name} بمبلغ {amount} مستحق خلال {days} أيام ({date})",
    notificationUpcomingTomorrow: "قسط {name} بمبلغ {amount} مستحق غداً! ({date})",
    notificationDueToday: "قسط مستحق اليوم: {name}",
    notificationDueTodayMsg: "قسط {name} بمبلغ {amount} مستحق اليوم!",
    notificationOverdue: "قسط متأخر: {name}",
    notificationOverdueMsg: "قسط {name} بمبلغ {amount} متأخر بمقدار {days} يوم/أيام!",
    notificationSubscription: "تجديد اشتراك: {name}",
    notificationBillReminder: "فاتورة شهرية: {name}",

    // Fixed Money Page
    newCommitment: "قسط جديد",
    editCommitment: "تعديل القسط",
    searchPlaceholder: "بحث...",
    filterAll: "كل الحالات",
    filterActive: "نشط",
    filterCompleted: "مكتمل",
    filterDueSoon: "يستحق قريباً",
    filterOverdue: "متأخر",
    sortBy: "ترتيب حسب",
    sortDueDate: "تاريخ الاستحقاق",
    sortProgress: "نسبة التقدم",
    sortAmount: "المبلغ",
    sortName: "الاسم",

    // Fixed Money Table / Cards
    colName: "الاسم",
    colTotalAmount: "إجمالي المبلغ",
    colMonthlyPayment: "الدفع الشهري",
    colPaidAmount: "المبلغ المدفوع",
    colRemainingBalance: "الرصيد المتبقي",
    colTotalMonths: "إجمالي الأشهر",
    colRemainingMonths: "الأشهر المتبقية",
    colNextDueDate: "تاريخ الاستحقاق التالي",
    colStatus: "الحالة",
    colProgress: "التقدم",
    colActions: "إجراءات",

    // Fixed Money Dialog Fields
    fieldName: "الاسم / الغرض",
    fieldTotalAmount: "إجمالي مبلغ الالتزام",
    fieldInstallmentAmount: "مبلغ القسط الشهري",
    fieldTotalMonths: "إجمالي عدد الأشهر",
    fieldStartDate: "تاريخ البدء",
    fieldDueDay: "يوم الاستحقاق في الشهر",
    fieldType: "نوع الالتزام",
    fieldStatus: "الحالة",
    fieldNotes: "ملاحظات / وصف (اختياري)",
    btnCancel: "إلغاء",
    btnSave: "حفظ",
    btnUpdate: "تحديث",
    validationNameRequired: "الاسم مطلوب.",
    validationTotalRequired: "يجب أن يكون المبلغ الإجمالي أكبر من 0.",
    validationInstallmentRequired: "يجب أن يكون القسط الشهري أكبر من 0.",
    validationMonthsRequired: "يجب أن يكون عدد الأشهر 1 على الأقل.",
    validationStartRequired: "تاريخ البدء مطلوب.",
    validationDueDayRequired: "يجب أن يكون يوم الاستحقاق بين 1 و 31.",

    // Commitments Statuses & Types
    statusActive: "نشط",
    statusCompleted: "مكتمل",
    statusPaused: "موقوف مؤقتاً",
    typeBill: "فاتورة",
    typeLoan: "قرض",
    typeInstallment: "قسط",
    typeSubscription: "اشتراك",
    typeOther: "أخرى",

    // Quick Actions
    btnPaid: "دفع",
    btnSkip: "تخطي",
    btnHistory: "السجل",
    btnDelete: "حذف",
    btnEdit: "تعديل",
    confirmDeleteHeader: "حذف القسط",
    confirmDeleteMsg: "هل أنت متأكد من حذف {name}؟ سيؤدي ذلك لحذف كل سجلات الدفع المرتبطة به.",
    confirmSkipHeader: "تخطي هذا الشهر",
    confirmSkipMsg: "هل أنت متأكد من تخطي {name} هذا الشهر؟ سيتم تقديم تاريخ الاستحقاق دون تسجيل دفعة مادية.",

    // Payment History Modal
    paymentHistoryTitle: "سجل الدفعيات - {name}",
    historyColDate: "تاريخ الدفع",
    historyColAmount: "المبلغ",
    historyColInstallmentNum: "دفعة رقم",
    historyColNotes: "ملاحظات",
    historyEmpty: "لا توجد دفعات مسجلة بعد.",
    historySkip: "تم تخطيه",

    // Transactions Page
    expenses: "المصاريف",
    incomes: "المداخيل",
    btnNew: "جديد",
    btnExport: "تصدير",
    expenseTotal: "إجمالي النفقات:",
    incomeTotal: "إجمالي الإيرادات:",
    searchExpensesPlaceholder: "البحث في المصاريف...",
    searchIncomesPlaceholder: "البحث في المداخيل...",
    filterType: "تصفية حسب النوع",
    allTypes: "كل الأنواع",
    addIncome: "إضافة دخل جديد",
    editIncome: "تعديل الدخل",
    amount: "المبلغ",
    category: "الفئة",
    type: "النوع",
    reason: "السبب",
    source: "المصدر",
    note: "ملاحظة (اختياري)",
    newCategoryName: "اسم الفئة الجديدة",
    btnAdd: "إضافة",
    deleteExpenseHeader: "حذف المصروف",
    deleteExpenseConfirm: "هل أنت متأكد من حذف هذا المصروف؟",
    toastSuccess: "تم بنجاح",
    toastDeleted: "تم الحذف",
    toastUpdated: "تم التحديث",
    toastCreated: "تم الإنشاء",
    toastAdded: "تمت الإضافة"
  }
};
