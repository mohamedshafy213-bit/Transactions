import { defineStore } from "pinia";

export const useTransactionStore = defineStore("transaction", {
  state: () => {
    const storedTransactions = localStorage.getItem("transactions");
    const storedSalary = localStorage.getItem("salary");
    const storedIncomes = localStorage.getItem("incomes");
    return {
      transactions: storedTransactions ? JSON.parse(storedTransactions) : [],
      salary: storedSalary ? Number(storedSalary) : 0,
      incomes: storedIncomes ? JSON.parse(storedIncomes) : [],
      remind: 0
    };
  },

  actions: {
    saveToStorage() {
      localStorage.setItem("transactions", JSON.stringify(this.transactions));
      localStorage.setItem("salary", this.salary.toString());
      localStorage.setItem("incomes", JSON.stringify(this.incomes));
    },

    AddTransaction(transactionDetails) {
      const txn = {
        id: transactionDetails.id || Math.random().toString(36).substring(2, 9),
        date: transactionDetails.date || new Date().toLocaleDateString(),
        Transcation: Number(transactionDetails.Transcation || 0),
        Category: transactionDetails.Category || "",
        Reason: transactionDetails.Reason || ""
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
          Transcation: Number(updatedTxn.Transcation || 0)
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

    RemoveIncome(id) {
      this.incomes = this.incomes.filter(i => i.id !== id);
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