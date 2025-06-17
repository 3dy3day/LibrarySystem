import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const api = axios.create({
  baseURL: 'http://localhost:3000',   // TODO: move to env config
  timeout: 8_000
});

api.interceptors.request.use((config) => {
  const { user, pass } = useAuthStore();
  if (user && pass) {
    const token = btoa(`${user}:${pass}`);
    config.headers.set('Authorization', `Basic ${token}`);
  }
  return config;
});
