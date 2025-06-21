import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DashboardPage from '@/pages/DashboardPage.vue';
import BooksPage from '@/pages/BooksPage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import ScanPage from '@/pages/ScanPage.vue';
import ScanConfirmPage from '@/pages/ScanConfirmPage.vue';
import ScanBookInfoPage from '@/pages/ScanBookInfoPage.vue';
import BookDetail from '@/pages/BookDetail.vue';
import BookEdit from '@/pages/BookEdit.vue';
import ManualBookEntry from '@/pages/ManualBookEntry.vue';
import LoginPage from '@/pages/LoginPage.vue';
import UserPage from '@/pages/UserPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage },
    { path: '/', component: DashboardPage, meta: { requiresAuth: true } },
    { path: '/books', component: BooksPage, meta: { requiresAuth: true } },
    { path: '/register', component: RegisterPage, meta: { requiresAuth: true } },
    { path: '/books/add', component: ManualBookEntry, meta: { requiresAuth: true } },
    { path: '/scan', component: ScanPage, meta: { requiresAuth: true } },
    { path: '/scan/confirm/:isbn', component: ScanConfirmPage, props: true, meta: { requiresAuth: true } },
    { path: '/scan/book-info/:isbn', component: ScanBookInfoPage, props: true, meta: { requiresAuth: true } },
    { path: '/books/:id', component: BookDetail, props: true, meta: { requiresAuth: true } },
    { path: '/books/:id/edit', component: BookEdit, props: true, meta: { requiresAuth: true } },
    { path: '/profile', component: UserPage, meta: { requiresAuth: true } }
  ]
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth state from localStorage
  authStore.initializeAuth();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});
