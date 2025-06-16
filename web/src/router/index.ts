import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import ScanPage from '@/pages/ScanPage.vue';
import BookDetail from '@/pages/BookDetail.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/scan', component: ScanPage },
    { path: '/books/:id', component: BookDetail, props: true }
  ]
});
