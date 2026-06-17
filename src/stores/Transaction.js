import { defineStore } from "pinia";

// Helper to standardise and extract month string (YYYY-MM) from transaction date
const getMonthString = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${String(parts[1]).padStart(2, '0')}`;
    }
  }
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${String(parts[1]).padStart(2, '0')}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${String(parts[1]).padStart(2, '0')}`;
      }
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  return "";
};

// Dynamic helper to calculate installment stats for any commitment
export const getInstallmentStats = (commitment, payments) => {
  if (!commitment) {
    return {
      paidAmount: 0,
      remainingBalance: 0,
      remainingMonths: 0,
      progress: 0,
      nextPaymentDate: ''
    };
  }
  const compPayments = (payments || []).filter(p => p.installment_id === commitment.id);
  const paidAmount = compPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const paymentsCount = compPayments.length;
  
  const totalAmount = Number(commitment.totalAmount || 0);
  const installmentAmount = Number(commitment.installmentAmount || commitment.amount || 0);
  const totalMonths = Number(commitment.totalMonths || 0);
  
  const remainingBalance = Math.max(0, totalAmount - paidAmount);
  const remainingMonths = Math.max(0, totalMonths - paymentsCount);
  
  const progress = totalAmount > 0 ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;
  
  let nextPaymentDate = commitment.nextPaymentDate || '';
  if (commitment.startDate && commitment.dueDay) {
    const start = new Date(commitment.startDate);
    if (!isNaN(start.getTime())) {
      const next = new Date(start.getFullYear(), start.getMonth() + paymentsCount, commitment.dueDay);
      if (!isNaN(next.getTime())) {
        nextPaymentDate = next.toISOString().split('T')[0];
      }
    }
  }
  
  return {
    paidAmount,
    remainingBalance,
    remainingMonths,
    progress,
    nextPaymentDate
  };
};

export const useTransactionStore = defineStore("transaction", {
  state: () => {
    const storedTransactions = localStorage.getItem("transactions");
    const storedSalary = localStorage.getItem("salary");
    const storedIncomes = localStorage.getItem("incomes");
    const storedFixedCommitments = localStorage.getItem("fixedCommitments");
    const storedInstallmentPayments = localStorage.getItem("installmentPayments");
    const storedNotifications = localStorage.getItem("notifications");
    
    return {
      transactions: storedTransactions ? JSON.parse(storedTransactions) : [],
      salary: storedSalary ? Number(storedSalary) : 0,
      incomes: storedIncomes ? JSON.parse(storedIncomes) : [],
      fixedCommitments: storedFixedCommitments ? JSON.parse(storedFixedCommitments) : [],
      installmentPayments: storedInstallmentPayments ? JSON.parse(storedInstallmentPayments) : [],
      notifications: storedNotifications ? JSON.parse(storedNotifications) : [],
      remind: 0
    };
  },

  actions: {
    saveToStorage() {
      localStorage.setItem("transactions", JSON.stringify(this.transactions));
      localStorage.setItem("salary", this.salary.toString());
      localStorage.setItem("incomes", JSON.stringify(this.incomes));
      localStorage.setItem("fixedCommitments", JSON.stringify(this.fixedCommitments));
      localStorage.setItem("installmentPayments", JSON.stringify(this.installmentPayments));
      localStorage.setItem("notifications", JSON.stringify(this.notifications));
    },

    // Legacy Salary Migration: convert static base salary to dynamic Income transactions
    migrateSalaryToIncome() {
      if (this.salary > 0) {
        const hasSalaryIncome = this.incomes.some(i => i.source === 'Salary');
        if (!hasSalaryIncome) {
          this.AddIncome({
            amount: this.salary,
            source: 'Salary',
            note: 'Migrated Base Salary',
            date: new Date().toISOString().split('T')[0]
          });
          this.salary = 0;
          this.saveToStorage();
        }
      }
    },

    AddTransaction(transactionDetails) {
      const txn = {
        id: transactionDetails.id || Math.random().toString(36).substring(2, 9),
        date: transactionDetails.date || new Date().toLocaleDateString(),
        Transcation: Number(transactionDetails.Transcation || 0),
        Category: transactionDetails.Category || "",
        Reason: transactionDetails.Reason || "",
        Type: transactionDetails.Type || "Variable",
        commitmentId: transactionDetails.commitmentId || null,
        paymentId: transactionDetails.paymentId || null
      };
      this.transactions.push(txn);
      this.saveToStorage();
      this.Setremind();
    },

    UpdateTransaction(updatedTxn) {
      const index = this.transactions.findIndex(t => t.id === updatedTxn.id);
      if (index !== -1) {
        this.transactions[index] = {
          ...updatedTxn,
          Transcation: Number(updatedTxn.Transcation || 0),
          Type: updatedTxn.Type || "Variable",
          commitmentId: updatedTxn.commitmentId || null,
          paymentId: updatedTxn.paymentId || null
        };
        this.saveToStorage();
        this.Setremind();
      }
    },

    RemoveTransaction(id) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.saveToStorage();
      this.Setremind();
    },

    RemoveTransactions(ids) {
      this.transactions = this.transactions.filter(t => !ids.includes(t.id));
      this.saveToStorage();
      this.Setremind();
    },

    AddIncome(incomeDetails) {
      const income = {
        id: Math.random().toString(36).substring(2, 9),
        date: incomeDetails.date || new Date().toLocaleDateString(),
        amount: Number(incomeDetails.amount || 0),
        source: incomeDetails.source || "",
        note: incomeDetails.note || ""
      };
      this.incomes.push(income);
      this.saveToStorage();
      this.Setremind();
    },

    UpdateIncome(updatedIncome) {
      const index = this.incomes.findIndex(i => i.id === updatedIncome.id);
      if (index !== -1) {
        this.incomes[index] = {
          id: updatedIncome.id,
          date: updatedIncome.date || new Date().toLocaleDateString(),
          amount: Number(updatedIncome.amount || 0),
          source: updatedIncome.source || "",
          note: updatedIncome.note || ""
        };
        this.saveToStorage();
        this.Setremind();
      }
    },

    RemoveIncome(id) {
      this.incomes = this.incomes.filter(i => i.id !== id);
      this.saveToStorage();
      this.Setremind();
    },

    // Fixed Commitments / Installments Actions
    AddCommitment(details) {
      const commitment = {
        id: Math.random().toString(36).substring(2, 9),
        name: details.name || "",
        amount: Number(details.installmentAmount || details.amount || 0), // monthly payment fallback
        installmentAmount: Number(details.installmentAmount || details.amount || 0),
        totalAmount: Number(details.totalAmount || 0),
        totalMonths: Number(details.totalMonths || 0),
        startDate: details.startDate || "",
        dueDay: Number(details.dueDay || 1),
        type: details.type || "Other", // Bill, Loan, Installment, Subscription, Other
        recurrence: details.recurrence || "Monthly",
        isActive: details.isActive !== undefined ? details.isActive : true,
        status: details.status || "Active", // Active, Completed, Paused
        notes: details.notes || "",
        appliedMonths: details.appliedMonths || []
      };
      this.fixedCommitments.push(commitment);
      this.saveToStorage();
    },

    UpdateCommitment(updated) {
      const index = this.fixedCommitments.findIndex(c => c.id === updated.id);
      if (index !== -1) {
        this.fixedCommitments[index] = {
          ...this.fixedCommitments[index],
          ...updated,
          amount: Number(updated.installmentAmount || updated.amount || 0),
          installmentAmount: Number(updated.installmentAmount || updated.amount || 0),
          totalAmount: Number(updated.totalAmount || 0),
          totalMonths: Number(updated.totalMonths || 0),
          dueDay: Number(updated.dueDay || 1)
        };
        this.saveToStorage();
        this.Setremind();
      }
    },

    RemoveCommitment(id) {
      this.transactions = this.transactions.filter(t => t.commitmentId !== id);
      this.installmentPayments = this.installmentPayments.filter(p => p.installment_id !== id);
      this.fixedCommitments = this.fixedCommitments.filter(c => c.id !== id);
      this.notifications = this.notifications.filter(n => n.commitmentId !== id);
      this.saveToStorage();
      this.Setremind();
    },

    // Dynamic Payment Logging
    AddInstallmentPayment(commitmentId, amount, paymentDate, notes = "") {
      const commitment = this.fixedCommitments.find(c => c.id === commitmentId);
      if (!commitment) return;

      const pCount = this.installmentPayments.filter(p => p.installment_id === commitmentId).length;
      const paymentVal = Number(amount || commitment.installmentAmount || commitment.amount || 0);
      
      const payment = {
        id: Math.random().toString(36).substring(2, 9),
        installment_id: commitmentId,
        amount: paymentVal,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
        notes: notes || `Installment #${pCount + 1}`,
        isSkipped: false
      };

      this.installmentPayments.push(payment);

      // Auto-log expense transaction in main history
      this.AddTransaction({
        Transcation: payment.amount,
        Category: commitment.type,
        Type: "Fixed",
        Reason: `${commitment.name} (${notes || `Installment #${pCount + 1}`})`,
        date: payment.payment_date,
        commitmentId: commitmentId,
        paymentId: payment.id
      });

      // Recalculate stats & auto-complete if remaining months/balance becomes 0
      const stats = getInstallmentStats(commitment, this.installmentPayments);
      if (stats.remainingBalance <= 0 || stats.remainingMonths <= 0) {
        commitment.status = "Completed";
      }

      this.saveToStorage();
      this.Setremind();
    },

    SkipInstallmentMonth(commitmentId, paymentDate) {
      const commitment = this.fixedCommitments.find(c => c.id === commitmentId);
      if (!commitment) return;

      const pCount = this.installmentPayments.filter(p => p.installment_id === commitmentId).length;

      const payment = {
        id: Math.random().toString(36).substring(2, 9),
        installment_id: commitmentId,
        amount: 0,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
        notes: "Skipped",
        isSkipped: true
      };

      this.installmentPayments.push(payment);

      const stats = getInstallmentStats(commitment, this.installmentPayments);
      if (stats.remainingMonths <= 0) {
        commitment.status = "Completed";
      }

      this.saveToStorage();
      this.Setremind();
    },

    DeleteInstallmentPayment(paymentId) {
      const payment = this.installmentPayments.find(p => p.id === paymentId);
      if (!payment) return;

      const commitmentId = payment.installment_id;
      this.installmentPayments = this.installmentPayments.filter(p => p.id !== paymentId);

      // Remove auto-created expense transaction
      this.transactions = this.transactions.filter(t => t.paymentId !== paymentId);

      // Reset status to Active if it was completed
      const commitment = this.fixedCommitments.find(c => c.id === commitmentId);
      if (commitment && commitment.status === "Completed") {
        commitment.status = "Active";
      }

      this.saveToStorage();
      this.Setremind();
    },

    ApplyCommitmentThisMonth(commitmentId, yyyyMm) {
      const commitment = this.fixedCommitments.find(c => c.id === commitmentId);
      if (!commitment) return;
      if (commitment.appliedMonths.includes(yyyyMm)) return;
      
      this.AddInstallmentPayment(
        commitmentId,
        commitment.installmentAmount || commitment.amount,
        new Date().toISOString().split('T')[0],
        `Monthly payment for ${yyyyMm}`
      );

      commitment.appliedMonths.push(yyyyMm);
      this.saveToStorage();
    },

    UnapplyCommitmentThisMonth(commitmentId, yyyyMm) {
      const commitment = this.fixedCommitments.find(c => c.id === commitmentId);
      if (!commitment) return;

      // Find payment logged for this commitment around this month
      const payment = this.installmentPayments.find(p => 
        p.installment_id === commitmentId && 
        p.notes.includes(yyyyMm)
      );

      if (payment) {
        this.DeleteInstallmentPayment(payment.id);
      }

      commitment.appliedMonths = commitment.appliedMonths.filter(m => m !== yyyyMm);
      this.saveToStorage();
    },

    Setremind() {
      const totalExpenses = this.transactions.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
      const totalExtraIncome = this.incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
      this.remind = totalExtraIncome - totalExpenses;
    },

    UpdateSalary(newSalary) {
      // Retained for legacy compatibility
      this.salary = Number(newSalary || 0);
      this.saveToStorage();
      this.Setremind();
    },

    // ── Notifications System Actions ──
    AddNotification(details) {
      const notif = {
        id: Math.random().toString(36).substring(2, 9),
        commitmentId: details.commitmentId || null,
        dueDate: details.dueDate || "",
        type: details.type || "info",
        title: details.title || "",
        message: details.message || "",
        isRead: false,
        createdAt: new Date().toISOString()
      };
      this.notifications.push(notif);
      this.saveToStorage();
    },

    MarkNotificationAsRead(id) {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) {
        notif.isRead = true;
        this.saveToStorage();
      }
    },

    MarkAllNotificationsAsRead() {
      this.notifications.forEach(n => {
        n.isRead = true;
      });
      this.saveToStorage();
    },

    DeleteNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.saveToStorage();
    },

    CheckAndGenerateReminders() {
      const today = new Date();
      today.setHours(0,0,0,0);

      this.fixedCommitments.forEach(c => {
        if (c.status !== 'Active') return;

        const stats = getInstallmentStats(c, this.installmentPayments);
        const dueDateStr = stats.nextPaymentDate;
        if (!dueDateStr) return;

        const dueDate = new Date(dueDateStr);
        dueDate.setHours(0,0,0,0);

        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let notifType = '';
        
        if (diffDays === 7) {
          notifType = 'upcoming_7';
        } else if (diffDays === 3) {
          notifType = 'upcoming_3';
        } else if (diffDays === 1) {
          notifType = 'upcoming_1';
        } else if (diffDays === 0) {
          notifType = 'due_today';
        } else if (diffDays < 0) {
          notifType = 'overdue';
        }

        if (notifType) {
          // Check for duplicate for this dueDate
          const duplicate = this.notifications.find(n => 
            n.commitmentId === c.id && 
            n.dueDate === dueDateStr && 
            (n.type === notifType || (notifType === 'overdue' && n.type === 'overdue'))
          );

          if (!duplicate) {
            const formattedAmt = Number(c.installmentAmount || c.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            let title = '';
            let message = '';

            if (notifType === 'upcoming_7' || notifType === 'upcoming_3') {
              title = `Upcoming Payment: ${c.name}`;
              message = `${c.name} payment of ${formattedAmt} is due in ${diffDays} days (${dueDateStr})`;
            } else if (notifType === 'upcoming_1') {
              title = `Upcoming Payment: ${c.name}`;
              message = `${c.name} payment of ${formattedAmt} is due tomorrow! (${dueDateStr})`;
            } else if (notifType === 'due_today') {
              title = `Payment Due Today: ${c.name}`;
              message = `${c.name} payment of ${formattedAmt} is due today!`;
            } else {
              const overdueDays = Math.abs(diffDays);
              title = `Overdue Payment: ${c.name}`;
              message = `${c.name} payment of ${formattedAmt} is overdue by ${overdueDays} day(s)!`;
            }

            this.AddNotification({
              commitmentId: c.id,
              dueDate: dueDateStr,
              type: notifType,
              title,
              message
            });
          }
        }
      });
    }
  },

  getters: {
    totalIncome: (state) => {
      // Include legacy salary or sum all incomes
      const extraIncome = state.incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
      return Number(state.salary || 0) + extraIncome;
    },
    totalExpenses: (state) => {
      return state.transactions.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
    },
    totalExtraIncome: (state) => {
      return state.incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    }
  }
});