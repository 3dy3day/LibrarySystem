<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLoanStore } from '@/stores/loan';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const loanStore = useLoanStore();
const bookStore = useBookStore();
const userStore = useUserStore();

const form = ref({
  bookId: '',
  borrowerId: '',
  days: 14
});

const books = ref([]);
const users = ref([]);
const loading = ref(false);
const loadingData = ref(true);
const errors = ref<any>({});

onMounted(async () => {
  try {
    const [booksData, usersData] = await Promise.all([
      bookStore.list(),
      userStore.list()
    ]);
    
    books.value = booksData.filter((b: any) => b.status === 'AVAILABLE');
    users.value = usersData;
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loadingData.value = false;
  }
});

async function handleSubmit() {
  errors.value = {};
  
  if (!form.value.bookId) {
    errors.value.bookId = 'Book is required';
  }
  
  if (!form.value.borrowerId) {
    errors.value.borrowerId = 'Borrower is required';
  }
  
  if (form.value.days < 1) {
    errors.value.days = 'Loan period must be at least 1 day';
  }
  
  if (Object.keys(errors.value).length > 0) return;
  
  try {
    loading.value = true;
    await loanStore.create(form.value);
    router.push('/loans');
  } catch (error) {
    console.error('Error creating loan:', error);
    errors.value.general = 'Failed to create loan. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6">
    <div class="max-w-md mx-auto">
      <div class="flex items-center mb-6">
        <button @click="router.back()" class="text-blue-600 hover:text-blue-800 mr-4">
          ← Back
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Create Loan</h1>
      </div>

      <div v-if="loadingData" class="text-center py-8">
        <p class="text-gray-500">Loading data...</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="bookId" class="block text-sm font-medium text-gray-700 mb-2">
              Book *
            </label>
            <select
              id="bookId"
              v-model="form.bookId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.bookId }"
            >
              <option value="">Select a book</option>
              <option v-for="book in books" :key="book.id" :value="book.id">
                {{ book.title }} - {{ book.author }}
              </option>
            </select>
            <p v-if="errors.bookId" class="text-red-500 text-sm mt-1">{{ errors.bookId }}</p>
          </div>

          <div class="mb-4">
            <label for="borrowerId" class="block text-sm font-medium text-gray-700 mb-2">
              Borrower *
            </label>
            <select
              id="borrowerId"
              v-model="form.borrowerId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.borrowerId }"
            >
              <option value="">Select a borrower</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
            <p v-if="errors.borrowerId" class="text-red-500 text-sm mt-1">{{ errors.borrowerId }}</p>
          </div>

          <div class="mb-6">
            <label for="days" class="block text-sm font-medium text-gray-700 mb-2">
              Loan Period (days) *
            </label>
            <input
              id="days"
              v-model.number="form.days"
              type="number"
              min="1"
              max="365"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.days }"
            />
            <p v-if="errors.days" class="text-red-500 text-sm mt-1">{{ errors.days }}</p>
          </div>

          <div v-if="errors.general" class="mb-4">
            <p class="text-red-500 text-sm">{{ errors.general }}</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="router.back()"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Creating...' : 'Create Loan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
