import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: 'admin', pass: 'changeme' }),   // MVP: env 固定
});
