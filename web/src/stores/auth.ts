import { defineStore } from 'pinia';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: 'admin',
    pass: 'changeme',
    currentUser: null as User | null,
    isAuthenticated: false
  }),
  
  getters: {
    getUserName: (state) => state.currentUser?.name || '',
    getUserRole: (state) => state.currentUser?.role || '',
    getUserTier: (state) => state.currentUser?.tier || '',
    getUserId: (state) => state.currentUser?.id || '',
    isAdmin: (state) => state.currentUser?.role === 'ADMIN'
  },
  
  actions: {
    login(userData: User) {
      this.currentUser = userData;
      this.isAuthenticated = true;
      // Store in localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
    },
    
    logout() {
      this.currentUser = null;
      this.isAuthenticated = false;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
    },
    
    initializeAuth() {
      // Check if user was previously logged in
      const storedUser = localStorage.getItem('currentUser');
      const storedAuth = localStorage.getItem('isAuthenticated');
      
      if (storedUser && storedAuth === 'true') {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      }
    }
  }
});
