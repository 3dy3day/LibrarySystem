import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '@/pages/DashboardPage.vue';
import BooksPage from '@/pages/BooksPage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import ScanPage from '@/pages/ScanPage.vue';
import ScanConfirmPage from '@/pages/ScanConfirmPage.vue';
import ScanBookInfoPage from '@/pages/ScanBookInfoPage.vue';
import BookDetail from '@/pages/BookDetail.vue';
import BookEdit from '@/pages/BookEdit.vue';
import ManualBookEntry from '@/pages/ManualBookEntry.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardPage },
    { path: '/books', component: BooksPage },
    { path: '/register', component: RegisterPage },
    { path: '/books/add', component: ManualBookEntry },
    { path: '/scan', component: ScanPage },
    { path: '/scan/confirm/:isbn', component: ScanConfirmPage, props: true },
    { path: '/scan/book-info/:isbn', component: ScanBookInfoPage, props: true },
    { path: '/books/:id', component: BookDetail, props: true },
    { path: '/books/:id/edit', component: BookEdit, props: true }
  ]
});
