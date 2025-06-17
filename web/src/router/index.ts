import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import ScanPage from '@/pages/ScanPage.vue';
import BookDetail from '@/pages/BookDetail.vue';
import DashboardPage from '@/pages/DashboardPage.vue';
import BooksPage from '@/pages/BooksPage.vue';
import CreateBookPage from '@/pages/CreateBookPage.vue';
import EditBookPage from '@/pages/EditBookPage.vue';
import UsersPage from '@/pages/UsersPage.vue';
import CreateUserPage from '@/pages/CreateUserPage.vue';
import EditUserPage from '@/pages/EditUserPage.vue';
import UserDetailPage from '@/pages/UserDetailPage.vue';
import LoansPage from '@/pages/LoansPage.vue';
import CreateLoanPage from '@/pages/CreateLoanPage.vue';
import LoanDetailPage from '@/pages/LoanDetailPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/scan', component: ScanPage },
    { path: '/dashboard', component: DashboardPage },
    
    { path: '/books', component: BooksPage },
    { path: '/books/create', component: CreateBookPage },
    { path: '/books/:id', component: BookDetail, props: true },
    { path: '/books/:id/edit', component: EditBookPage, props: true },
    
    { path: '/users', component: UsersPage },
    { path: '/users/create', component: CreateUserPage },
    { path: '/users/:id', component: UserDetailPage, props: true },
    { path: '/users/:id/edit', component: EditUserPage, props: true },
    
    { path: '/loans', component: LoansPage },
    { path: '/loans/create', component: CreateLoanPage },
    { path: '/loans/:id', component: LoanDetailPage, props: true }
  ]
});
