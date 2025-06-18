import { defineStore } from 'pinia';
import { api } from '@/lib/api';

export const useUserStore = defineStore('user', {
  state: () => ({ 
    cache: new Map<string, any>(),
    users: [] as any[]
  }),

  actions: {
    async list(query?: string) {
      const params = query ? { q: query } : {};
      const { data } = await api.get('/users', { params });
      this.users = data;
      return data;
    },

    async get(id: string) {
      if (this.cache.has(id)) return this.cache.get(id);
      
      const { data } = await api.get(`/users/${id}`);
      this.cache.set(id, data);
      return data;
    },

    async create(userData: any) {
      const { data } = await api.post('/users', userData);
      this.users.push(data);
      this.cache.set(data.id, data);
      return data;
    },

    async update(id: string, userData: any) {
      const { data } = await api.patch(`/users/${id}`, userData);
      this.cache.set(id, data);
      const index = this.users.findIndex(u => u.id === id);
      if (index !== -1) this.users[index] = data;
      return data;
    },

    async remove(id: string) {
      await api.delete(`/users/${id}`);
      this.cache.delete(id);
      this.users = this.users.filter(u => u.id !== id);
    }
  }
});
