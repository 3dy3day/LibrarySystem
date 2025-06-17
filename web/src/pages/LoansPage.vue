<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLoanStore } from '@/stores/loan';
import DataTable from '@/components/DataTable.vue';
import StatusBadge from '@/components/StatusBadge.vue';

const router = useRouter();
const loanStore = useLoanStore();

const loans = ref([]);
const loading = ref(true);
const statusFilter = ref('');

const headers = ['Book', 'Borrower', 'Lent At', 'Due At', 'Status', 'Actions'];
const statusOptions = [
  { value: '', label: 'All Loans' },
  { value: 'active', label: 'Active' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'returned', label: 'Returned' }
];

onMounted(async () => {
  await loadLoans();
});

async function loadLoans() {
  try {
    loading.value = true;
    const overdue = statusFilter.value === 'overdue' ? true : undefined;
    const allLoans = await loanStore.list(undefined, undefined, overdue);
    
    if (statusFilter.value === 'active') {
      loans.value = allLoans.filter((l: any) => !l.returnedAt && new Date(l.dueAt) >= new Date());
    } else if (statusFilter.value === 'returned') {
      loans.value = allLoans.filter((l: any) => l.returnedAt);
    } else {
      loans.value = allLoans;
    }
  } catch (error) {
    console.error('Error loading loans:', error);
  } finally {
    loading.value = false;
  }
}

async function handleStatusFilter() {
  await loadLoans();
}

function getLoanStatus(loan: any) {
  if (loan.returnedAt) return 'returned';
  if (new Date(loan.dueAt) < new Date()) return 'overdue';
  return 'active';
}

function viewLoan(loan: any) {
  router.push(`/loans/${loan.id}`);
}

async function returnLoan(loan: any) {
  try {
    await loanStore.returnLoan(loan.id);
    await loadLoans();
  } catch (error) {
    console.error('Error returning loan:', error);
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Loans</h1>
      <router-link
        to="/loans/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create Loan
      </router-link>
    </div>

    <div class="mb-6">
      <div class="w-48">
        <select
          v-model="statusFilter"
          @change="handleStatusFilter"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <DataTable
        :headers="headers"
        :rows="loans"
        :loading="loading"
        @row-click="viewLoan"
      >
        <template #book="{ row }">
          {{ row.book?.title || 'Unknown Book' }}
        </template>
        <template #borrower="{ row }">
          {{ row.borrower?.name || 'Unknown User' }}
        </template>
        <template #lent\ at="{ row }">
          {{ new Date(row.lentAt).toLocaleDateString() }}
        </template>
        <template #due\ at="{ row }">
          {{ new Date(row.dueAt).toLocaleDateString() }}
        </template>
        <template #status="{ row }">
          <StatusBadge :status="getLoanStatus(row)" type="loan" />
        </template>
        <template #actions="{ row }">
          <div class="flex space-x-2">
            <button
              v-if="!row.returnedAt"
              @click.stop="returnLoan(row)"
              class="text-green-600 hover:text-green-800"
            >
              Return
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
