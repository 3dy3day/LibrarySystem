import { defineStore } from 'pinia';
import { api } from '@/lib/api';

export const useLoanStore = defineStore('loan', {
  state: () => ({ 
    cache: new Map<string, any>(),
    loans: [] as any[]
  }),

  actions: {
    async list(bookId?: string, borrowerId?: string, overdue?: boolean) {
      const params: any = {};
      if (bookId) params.bookId = bookId;
      if (borrowerId) params.borrowerId = borrowerId;
      if (overdue !== undefined) params.overdue = overdue;
      
      const { data } = await api.get('/loans', { params });
      this.loans = data;
      return data;
    },

    async get(id: string) {
      if (this.cache.has(id)) return this.cache.get(id);
      
      const { data } = await api.get(`/loans/${id}`);
      this.cache.set(id, data);
      return data;
    },

    async create(loanData: { bookId: string, borrowerId: string, days: number }) {
      const { data } = await api.post('/loans', loanData);
      this.loans.push(data);
      this.cache.set(data.id, data);
      return data;
    },

    async returnLoan(id: string) {
      const { data } = await api.patch(`/loans/${id}/return`);
      this.cache.set(id, data);
      const index = this.loans.findIndex(l => l.id === id);
      if (index !== -1) this.loans[index] = data;
      return data;
    }
  }
});
