<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLoanStore } from '@/stores/loan';
import DataTable from '@/components/DataTable.vue';
import StatusBadge from '@/components/StatusBadge.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();
const userStore = useUserStore();
const loanStore = useLoanStore();

const user = ref<any>(null);
const loans = ref([]);
const loading = ref(true);
const loansLoading = ref(true);

const loanHeaders = ['Book', 'Lent At', 'Due At', 'Status'];

onMounted(async () => {
  try {
    const [userData, loansData] = await Promise.all([
      userStore.get(props.id),
      loanStore.list(undefined, props.id)
    ]);
    
    user.value = userData;
    loans.value = loansData;
  } catch (error) {
    console.error('Error loading user details:', error);
    router.push('/users');
  } finally {
    loading.value = false;
    loansLoading.value = false;
  }
});

function getLoanStatus(loan: any) {
  if (loan.returnedAt) return 'returned';
  if (new Date(loan.dueAt) < new Date()) return 'overdue';
  return 'active';
}

function viewLoan(loan: any) {
  router.push(`/loans/${loan.id}`);
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="text-blue-600 hover:text-blue-800 mr-4">
        ← Back
      </button>
      <h1 class="text-3xl font-bold text-gray-900">User Details</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading user...</p>
    </div>

    <div v-else-if="user" class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ user.name }}</h2>
            <p class="text-gray-600">{{ user.email }}</p>
            <p class="text-sm text-gray-500">Member since {{ new Date(user.createdAt).toLocaleDateString() }}</p>
          </div>
          <router-link
            :to="`/users/${user.id}/edit`"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit User
          </router-link>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Loan History</h3>
        </div>
        <div class="p-6">
          <DataTable
            :headers="loanHeaders"
            :rows="loans"
            :loading="loansLoading"
            @row-click="viewLoan"
          >
            <template #book="{ row }">
              {{ row.book?.title || 'Unknown Book' }}
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
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>
