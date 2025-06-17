import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: 'admin', pass: 'changeme' }),   // MVP: hardcoded for now
});
