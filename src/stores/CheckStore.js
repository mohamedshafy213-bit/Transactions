import { defineStore } from 'pinia';

// Abstraction placeholder for future OCR / AI integrations
export const ReceiptScannerService = {
  /**
   * Scan receipt image files and structured items.
   * TODO: Integrate with OCR/AI services (e.g. Gemini, Cloud Vision) in the future.
   */
  async scanReceipt(file) {
    console.warn("ReceiptScannerService.scanReceipt is currently a placeholder stub.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          restaurantName: "OCR Restaurant Preview",
          title: "OCR Scan " + new Date().toLocaleDateString(),
          total: 850,
          tax: 119,
          grandTotal: 969,
          items: [
            { itemName: "Burger Combo", price: 250, quantity: 2, subtotal: 500 },
            { itemName: "Appetizer Platter", price: 200, quantity: 1, subtotal: 200 },
            { itemName: "Soft Drink", price: 50, quantity: 3, subtotal: 150 }
          ]
        });
      }, 1000);
    });
  }
};

export const useCheckStore = defineStore('checks', {
  state: () => {
    const storedChecks = localStorage.getItem("checks");
    return {
      checks: storedChecks ? JSON.parse(storedChecks) : []
    };
  },

  actions: {
    saveToStorage() {
      localStorage.setItem("checks", JSON.stringify(this.checks));
      this.checks = [...this.checks];
    },

    addCheck(checkData) {
      const taxRate = checkData.taxIncluded ? Number(checkData.taxRate || 0) : 0;
      const totalAmount = Number(checkData.total || 0);
      const taxAmount = Math.round(totalAmount * (taxRate / 100) * 100) / 100;
      const grandTotal = totalAmount + taxAmount;

      const newCheck = {
        id: Math.random().toString(36).substring(2, 9),
        title: checkData.restaurantName || `Check #${this.checks.length + 1}`,
        restaurantName: checkData.restaurantName || "Unnamed Restaurant",
        total: totalAmount,
        taxRate: taxRate,
        tax: taxAmount,
        taxIncluded: !!checkData.taxIncluded,
        grandTotal: grandTotal,
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
        participants: (checkData.participants || []).map(p => ({
          id: Math.random().toString(36).substring(2, 9),
          name: p.name,
          paid: false,
          paymentMethod: 'Cash', // Default
          total: 0,
          orders: []
        }))
      };

      this.checks.push(newCheck);
      this.saveToStorage();
      return newCheck;
    },

    updateCheck(checkId, checkData) {
      const index = this.checks.findIndex(c => c.id === checkId);
      if (index !== -1) {
        const taxRate = checkData.taxIncluded ? Number(checkData.taxRate || 0) : 0;
        const totalAmount = Number(checkData.total || 0);
        const taxAmount = Math.round(totalAmount * (taxRate / 100) * 100) / 100;
        const grandTotal = totalAmount + taxAmount;

        this.checks[index] = {
          ...this.checks[index],
          title: checkData.restaurantName || this.checks[index].restaurantName,
          restaurantName: checkData.restaurantName || this.checks[index].restaurantName,
          total: totalAmount,
          taxRate: taxRate,
          tax: taxAmount,
          taxIncluded: !!checkData.taxIncluded,
          grandTotal: grandTotal
        };
        this.saveToStorage();
      }
    },

    deleteCheck(checkId) {
      this.checks = this.checks.filter(c => c.id !== checkId);
      this.saveToStorage();
    },

    addParticipant(checkId, name) {
      const check = this.checks.find(c => c.id === checkId);
      if (check) {
        check.participants.push({
          id: Math.random().toString(36).substring(2, 9),
          name: name,
          paid: false,
          paymentMethod: 'Cash',
          total: 0,
          orders: []
        });
        this.saveToStorage();
      }
    },

    updateParticipantName(checkId, participantId, newName) {
      const check = this.checks.find(c => c.id === checkId);
      if (check) {
        const p = check.participants.find(part => part.id === participantId);
        if (p) {
          p.name = newName;
          this.saveToStorage();
        }
      }
    },

    deleteParticipant(checkId, participantId) {
      const check = this.checks.find(c => c.id === checkId);
      if (check) {
        check.participants = check.participants.filter(p => p.id !== participantId);
        this.saveToStorage();
      }
    },

    updateParticipantOrders(checkId, participantId, orders, paymentMethod) {
      const check = this.checks.find(c => c.id === checkId);
      if (check) {
        const p = check.participants.find(part => part.id === participantId);
        if (p) {
          p.orders = orders.map(o => ({
            id: o.id || Math.random().toString(36).substring(2, 9),
            itemName: o.itemName || "Item",
            quantity: Number(o.quantity || 1),
            price: Number(o.price || 0),
            subtotal: Number(o.quantity || 1) * Number(o.price || 0)
          }));
          
          // Recompute participant total
          p.total = p.orders.reduce((sum, o) => sum + o.subtotal, 0);
          p.paymentMethod = paymentMethod || 'Cash';
          
          this.saveToStorage();
        }
      }
    },

    toggleParticipantPaid(checkId, participantId, paid) {
      const check = this.checks.find(c => c.id === checkId);
      if (check) {
        const p = check.participants.find(part => part.id === participantId);
        if (p) {
          p.paid = paid;
          this.saveToStorage();
        }
      }
    },

    finishCheck(checkId) {
      const check = this.checks.find(c => c.id === checkId);
      if (check) {
        check.completed = true;
        check.completedAt = new Date().toISOString();
        this.saveToStorage();
      }
    }
  },

  getters: {
    stats: (state) => {
      const allChecks = state.checks;
      const totalChecks = allChecks.length;
      const completedChecks = allChecks.filter(c => c.completed).length;
      const pendingChecks = allChecks.filter(c => !c.completed).length;

      let moneyCollected = 0;
      let moneyRemaining = 0;
      let totalValueSum = 0;

      allChecks.forEach(c => {
        totalValueSum += c.grandTotal;
        const totalGrand = c.grandTotal;
        
        // Sum up paid participants totals
        let collectedForThisCheck = 0;
        c.participants.forEach(p => {
          if (p.paid) {
            collectedForThisCheck += p.total;
          }
        });
        
        // Cap collected amount to check grand total
        moneyCollected += collectedForThisCheck;
        
        if (c.completed) {
          // If check finished, remaining is zero
          moneyRemaining += 0;
        } else {
          moneyRemaining += Math.max(0, totalGrand - collectedForThisCheck);
        }
      });

      const averageCheckValue = totalChecks > 0 ? (totalValueSum / totalChecks) : 0;

      return {
        totalChecks,
        completedChecks,
        pendingChecks,
        moneyCollected,
        moneyRemaining,
        averageCheckValue
      };
    }
  }
});
