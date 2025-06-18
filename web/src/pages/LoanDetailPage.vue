<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLoanStore } from '@/stores/loan';
import StatusBadge from '@/components/StatusBadge.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();
const loanStore = useLoanStore();

const loan = ref<any>(null);
const loading = ref(true);
const returning = ref(false);

onMounted(async () => {
  try {
    loan.value = await loanStore.get(props.id);
  } catch (error) {
    console.error('Error loading loan:', error);
    router.push('/loans');
  } finally {
    loading.value = false;
  }
});

function getLoanStatus(loan: any) {
  if (loan.returnedAt) return 'returned';
  if (new Date(loan.dueAt) < new Date()) return 'overdue';
  return 'active';
}

async function returnLoan() {
  if (!loan.value || returning.value) return;
  
  try {
    returning.value = true;
    loan.value = await loanStore.returnLoan(props.id);
  } catch (error) {
    console.error('Error returning loan:', error);
  } finally {
    returning.value = false;
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="text-blue-600 hover:text-blue-800 mr-4">
        ← Back
      </button>
      <h1 class="text-3xl font-bold text-gray-900">Loan Details</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading loan...</p>
    </div>

    <div v-else-if="loan" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-start mb-6">
        <div class="flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Book Information</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-500">Title</p>
                  <p class="font-medium">{{ loan.book?.title || 'Unknown Book' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Author</p>
                  <p class="font-medium">{{ loan.book?.author || 'Unknown Author' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">ISBN</p>
                  <p class="font-medium">{{ loan.book?.isbn13 || loan.book?.isbn10 || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Borrower Information</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-500">Name</p>
                  <p class="font-medium">{{ loan.borrower?.name || 'Unknown User' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium">{{ loan.borrower?.email || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t pt-6 mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Loan Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-500">Lent At</p>
                <p class="font-medium">{{ new Date(loan.lentAt).toLocaleDateString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Due At</p>
                <p class="font-medium">{{ new Date(loan.dueAt).toLocaleDateString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Returned At</p>
                <p class="font-medium">{{ loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : 'Not returned' }}</p>
              </div>
            </div>
            
            <div class="mt-4">
              <p class="text-sm text-gray-500">Status</p>
              <StatusBadge :status="getLoanStatus(loan)" type="loan" />
            </div>
          </div>
        </div>

        <div v-if="!loan.returnedAt" class="ml-6">
          <button
            @click="returnLoan"
            :disabled="returning"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {{ returning ? 'Returning...' : 'Return Book' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
