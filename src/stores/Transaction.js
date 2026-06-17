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
      // Assuming DD/MM/YYYY or MM/DD/YYYY
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

export const useTransactionStore = defineStore("transaction", {
  state: () => {
    const storedTransactions = localStorage.getItem("transactions");
    const storedSalary = localStorage.getItem("salary");
    const storedIncomes = localStorage.getItem("incomes");
    const storedFixedCommitments = localStorage.getItem("fixedCommitments");
    return {
      transactions: storedTransactions ? JSON.parse(storedTransactions) : [],
      salary: storedSalary ? Number(storedSalary) : 0,
      incomes: storedIncomes ? JSON.parse(storedIncomes) : [],
      fixedCommitments: storedFixedCommitments ? JSON.parse(storedFixedCommitments) : [],
      remind: 0
    };
  },

  actions: {
    saveToStorage() {
      localStorage.setItem("transactions", JSON.stringify(this.transactions));
      localStorage.setItem("salary", this.salary.toString());
      localStorage.setItem("incomes", JSON.stringify(this.incomes));
      localStorage.setItem("fixedCommitments", JSON.stringify(this.fixedCommitments));
    },

    AddTransaction(transactionDetails) {
      const txn = {
        id: transactionDetails.id || Math.random().toString(36).substring(2, 9),
        date: transactionDetails.date || new Date().toLocaleDateString(),
        Transcation: Number(transactionDetails.Transcation || 0),
        Category: transactionDetails.Category || "",
        Reason: transactionDetails.Reason || "",
        Type: transactionDetails.Type || "Variable",
        commitmentId: transactionDetails.commitmentId || null
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
          commitmentId: updatedTxn.commitmentId || null
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

    // Income actions
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

    // Fixed Commitments Actions
    AddCommitment(details) {
      const commitment = {
        id: Math.random().toString(36).substring(2, 9),
        name: details.name || "",
        amount: Number(details.amount || 0),
        type: details.type || "Other",
        recurrence: details.recurrence || "Monthly",
        isActive: details.isActive !== undefined ? details.isActive : true,
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
          amount: Number(updated.amount || 0),
          appliedMonths: updated.appliedMonths || this.fixedCommitments[index].appliedMonths || []
        };
        this.saveToStorage();
        this.Setremind();
      }
    },

    RemoveCommitment(id) {
      // Also delete any associated auto-created expense entries
      this.transactions = this.transactions.filter(t => t.commitmentId !== id);
      this.fixedCommitments = this.fixedCommitments.filter(c => c.id !== id);
      this.saveToStorage();
      this.Setremind();
    },

    ApplyCommitmentThisMonth(commitmentId, yyyyMm) {
      const commitment = this.fixedCommitments.find(c => c.id === commitmentId);
      if (!commitment) return;
      
      // Prevent duplicates
      if (commitment.appliedMonths.includes(yyyyMm)) return;
      
      // Auto-create expense
      this.AddTransaction({
        Transcation: commitment.amount,
        Category: commitment.type, // Category matches commitment type
        Type: "Fixed", // New expense Type
        Reason: commitment.name, // Reason matches commitment name
        date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
        source: "Fixed Commitment", // locked source
        commitmentId: commitmentId
      });

      // Track applied month
      commitment.appliedMonths.push(yyyyMm);
      this.saveToStorage();
    },

    UnapplyCommitmentThisMonth(commitmentId, yyyyMm) {
      const commitment = this.fixedCommitments.find(c => c.id === commitmentId);
      if (!commitment) return;

      // Delete the expense entry that matches this commitmentId and month
      this.transactions = this.transactions.filter(t => {
        if (t.commitmentId === commitmentId) {
          const m = getMonthString(t.date);
          if (m === yyyyMm) {
            return false; // delete it
          }
        }
        return true; // keep it
      });

      // Remove from appliedMonths
      commitment.appliedMonths = commitment.appliedMonths.filter(m => m !== yyyyMm);
      this.saveToStorage();
      this.Setremind();
    },

    Setremind() {
      const totalExpenses = this.transactions.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
      const totalExtraIncome = this.incomes.reduce((acc, i) => acc + Number(i.amount || 0), 0);
      this.remind = Number(this.salary || 0) + totalExtraIncome - totalExpenses;
    },

    UpdateSalary(newSalary) {
      this.salary = Number(newSalary || 0);
      this.saveToStorage();
      this.Setremind();
    }
  },

  getters: {
    totalIncome: (state) => {
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