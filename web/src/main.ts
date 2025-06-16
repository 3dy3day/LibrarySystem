import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './router';
import './style.css';           // tailwind base/components/utilities
import App from './App.vue';

createApp(App).use(router).use(createPinia()).mount('#app');