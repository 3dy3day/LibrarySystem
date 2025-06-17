<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores/book';
import { useLoanStore } from '@/stores/loan';
import DataTable from '@/components/DataTable.vue';
import StatusBadge from '@/components/StatusBadge.vue';

const props = defineProps<{ id: string }>();
const router = useRouter();
const bookStore = useBookStore();
const loanStore = useLoanStore();

const book = ref<any>(null);
const loans = ref([]);
const loading = ref(true);
const loansLoading = ref(true);
const statusLoading = ref(false);

const loanHeaders = ['Borrower', 'Lent At', 'Due At', 'Status'];
const statusOptions = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'LENT', label: 'Lent' },
  { value: 'LOST', label: 'Lost' }
];

onMounted(async () => {
  try {
    const [bookData, loansData] = await Promise.all([
      bookStore.get(props.id),
      loanStore.list(props.id)
    ]);
    
    book.value = bookData;
    loans.value = loansData;
  } catch (error) {
    console.error('Error loading book details:', error);
    router.push('/books');
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

async function changeStatus(newStatus: string) {
  if (!book.value || statusLoading.value) return;
  
  try {
    statusLoading.value = true;
    book.value = await bookStore.setStatus(props.id, newStatus);
  } catch (error) {
    console.error('Error updating book status:', error);
  } finally {
    statusLoading.value = false;
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="text-blue-600 hover:text-blue-800 mr-4">
        ← Back
      </button>
      <h1 class="text-3xl font-bold text-gray-900">Book Details</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading book...</p>
    </div>

    <div v-else-if="book" class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start mb-6">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ book.title }}</h2>
            <p class="text-lg text-gray-600 mb-2">by {{ book.author }}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p class="text-sm text-gray-500">Publisher</p>
                <p class="font-medium">{{ book.publisher || 'N/A' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">Published Date</p>
                <p class="font-medium">{{ book.publishedAt ? new Date(book.publishedAt).toLocaleDateString() : 'N/A' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">ISBN-10</p>
                <p class="font-medium">{{ book.isbn10 || 'N/A' }}</p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500">ISBN-13</p>
                <p class="font-medium">{{ book.isbn13 || 'N/A' }}</p>
              </div>
            </div>
            
            <div v-if="book.comment" class="mt-4">
              <p class="text-sm text-gray-500">Comment</p>
              <p class="font-medium">{{ book.comment }}</p>
            </div>
          </div>
          
          <div class="ml-6 flex flex-col space-y-3">
            <router-link
              :to="`/books/${book.id}/edit`"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
            >
              Edit Book
            </router-link>
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Status:</span>
            <StatusBadge :status="book.status" type="book" />
            
            <select
              :value="book.status"
              @change="changeStatus($event.target.value)"
              :disabled="statusLoading"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            
            <span v-if="statusLoading" class="text-sm text-gray-500">Updating...</span>
          </div>
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
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>
