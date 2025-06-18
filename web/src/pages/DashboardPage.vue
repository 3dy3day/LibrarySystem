<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useLoanStore } from '@/stores/loan';

const bookStore = useBookStore();
const userStore = useUserStore();
const loanStore = useLoanStore();

const stats = ref({
  totalBooks: 0,
  availableBooks: 0,
  totalUsers: 0,
  activeLoans: 0,
  overdueLoans: 0
});

const recentLoans = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [books, users, loans] = await Promise.all([
      bookStore.list(),
      userStore.list(),
      loanStore.list()
    ]);

    stats.value.totalBooks = books.length;
    stats.value.availableBooks = books.filter((b: any) => b.status === 'AVAILABLE').length;
    stats.value.totalUsers = users.length;
    
    const activeLoans = loans.filter((l: any) => !l.returnedAt);
    stats.value.activeLoans = activeLoans.length;
    
    const now = new Date();
    stats.value.overdueLoans = activeLoans.filter((l: any) => new Date(l.dueAt) < now).length;
    
    recentLoans.value = loans.slice(0, 5);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Library Dashboard</h1>
    
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading dashboard data...</p>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Books</h3>
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalBooks }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Available Books</h3>
          <p class="text-2xl font-bold text-green-600">{{ stats.availableBooks }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Users</h3>
          <p class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Active Loans</h3>
          <p class="text-2xl font-bold text-blue-600">{{ stats.activeLoans }}</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Overdue Loans</h3>
          <p class="text-2xl font-bold text-red-600">{{ stats.overdueLoans }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Recent Loans</h2>
        </div>
        <div class="p-6">
          <div v-if="recentLoans.length === 0" class="text-center text-gray-500 py-4">
            No recent loans
          </div>
          <div v-else class="space-y-4">
            <div v-for="loan in recentLoans" :key="loan.id" 
                 class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p class="font-medium">{{ loan.book?.title || 'Unknown Book' }}</p>
                <p class="text-sm text-gray-500">{{ loan.borrower?.name || 'Unknown User' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm">{{ new Date(loan.lentAt).toLocaleDateString() }}</p>
                <p class="text-sm text-gray-500">Due: {{ new Date(loan.dueAt).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
