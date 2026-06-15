import { defineStore } from "pinia";

export const useTransactionStore = defineStore("transaction", {
  // 1. state is a function that returns an object
  state: () => {
    const storedTransactions = localStorage.getItem("transactions");
    const storedSalary = localStorage.getItem("salary");
    return {
      transactions: storedTransactions ? JSON.parse(storedTransactions) : [],
      salary: storedSalary ? Number(storedSalary) : 0,
      remind: 0
    };
  },
  
  // 2. actions is an object full of methods
  actions: {
    saveToStorage() {
      localStorage.setItem("transactions", JSON.stringify(this.transactions));
      localStorage.setItem("salary", this.salary.toString());
    },
    AddTransaction(transactionDetails) {
      const txn = {
        id: transactionDetails.id || Math.random().toString(36).substring(2, 9),
        date: transactionDetails.date || new Date().toLocaleDateString(),
        Transcation: Number(transactionDetails.Transcation || 0),
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
    Setremind() {
      const total = this.transactions.reduce((acc, t) => acc + Number(t.Transcation || 0), 0);
      this.remind = Number(this.salary || 0) - total;
    },
    UpdateSalary(newSalary) {
      this.salary = Number(newSalary || 0);
      this.saveToStorage();
      this.Setremind();
    }
    
  }
});