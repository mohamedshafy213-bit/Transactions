import { defineStore } from 'pinia';

export const usePaymentStore = defineStore('payment', {
  state: () => {
    const storedLinks = localStorage.getItem('paymentLinks');
    return {
      paymentLinks: storedLinks ? JSON.parse(storedLinks) : [
        { 
          id: '1', 
          label: 'My Default Instapay', 
          url: 'https://instapay.eg/default', 
          isDefault: true, 
          isPrimary: true 
        },
        { 
          id: '2', 
          label: 'Vodafone Cash', 
          url: 'https://wa.me/default', 
          isDefault: false, 
          isPrimary: false 
        }
      ]
    };
  },

  actions: {
    saveToStorage() {
      localStorage.setItem('paymentLinks', JSON.stringify(this.paymentLinks));
    },

    setDefaultLink(id) {
      this.paymentLinks.forEach(link => {
        link.isDefault = (link.id === id);
      });
      this.saveToStorage();
    },

    addCustomLink(label, url) {
      const newLink = {
        id: Date.now().toString(),
        label,
        url,
        isDefault: false,
        isPrimary: false
      };
      this.paymentLinks.push(newLink);
      this.saveToStorage();
      return newLink;
    },

    updateLink(id, label, url) {
      const link = this.paymentLinks.find(l => l.id === id);
      if (link) {
        link.label = label;
        link.url = url;
        this.saveToStorage();
      }
    },

    deleteLink(id) {
      const link = this.paymentLinks.find(l => l.id === id);
      // Prevent deleting the primary/default link
      if (link && !link.isPrimary) {
        const wasDefault = link.isDefault;
        this.paymentLinks = this.paymentLinks.filter(l => l.id !== id);
        if (wasDefault && this.paymentLinks.length > 0) {
          const primary = this.paymentLinks.find(l => l.isPrimary) || this.paymentLinks[0];
          if (primary) {
            primary.isDefault = true;
          }
        }
        this.saveToStorage();
      }
    }
  },

  getters: {
    defaultLink: (state) => {
      return state.paymentLinks.find(link => link.isDefault) || state.paymentLinks[0];
    }
  }
});
