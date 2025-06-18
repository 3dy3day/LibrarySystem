<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores/book';

const props = defineProps<{ id: string }>();
const router = useRouter();
const bookStore = useBookStore();

const form = ref({
  title: '',
  author: '',
  publisher: '',
  publishedAt: '',
  isbn10: '',
  isbn13: '',
  comment: ''
});

const loading = ref(false);
const loadingBook = ref(true);
const errors = ref<any>({});

onMounted(async () => {
  try {
    const book = await bookStore.get(props.id);
    form.value.title = book.title;
    form.value.author = book.author;
    form.value.publisher = book.publisher || '';
    form.value.publishedAt = book.publishedAt ? new Date(book.publishedAt).toISOString().split('T')[0] : '';
    form.value.isbn10 = book.isbn10 || '';
    form.value.isbn13 = book.isbn13 || '';
    form.value.comment = book.comment || '';
  } catch (error) {
    console.error('Error loading book:', error);
    router.push('/books');
  } finally {
    loadingBook.value = false;
  }
});

async function handleSubmit() {
  errors.value = {};
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required';
  }
  
  if (!form.value.author.trim()) {
    errors.value.author = 'Author is required';
  }
  
  if (Object.keys(errors.value).length > 0) return;
  
  try {
    loading.value = true;
    const bookData = { ...form.value };
    if (bookData.publishedAt) {
      bookData.publishedAt = new Date(bookData.publishedAt).toISOString();
    }
    
    await bookStore.update(props.id, bookData);
    router.push('/books');
  } catch (error) {
    console.error('Error updating book:', error);
    errors.value.general = 'Failed to update book. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <button @click="router.back()" class="text-blue-600 hover:text-blue-800 mr-4">
          ← Back
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Edit Book</h1>
      </div>

      <div v-if="loadingBook" class="text-center py-8">
        <p class="text-gray-500">Loading book...</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.title }"
              />
              <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
            </div>

            <div>
              <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                id="author"
                v-model="form.author"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.author }"
              />
              <p v-if="errors.author" class="text-red-500 text-sm mt-1">{{ errors.author }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="publisher" class="block text-sm font-medium text-gray-700 mb-2">
                Publisher
              </label>
              <input
                id="publisher"
                v-model="form.publisher"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="publishedAt" class="block text-sm font-medium text-gray-700 mb-2">
                Published Date
              </label>
              <input
                id="publishedAt"
                v-model="form.publishedAt"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="isbn10" class="block text-sm font-medium text-gray-700 mb-2">
                ISBN-10
              </label>
              <input
                id="isbn10"
                v-model="form.isbn10"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="isbn13" class="block text-sm font-medium text-gray-700 mb-2">
                ISBN-13
              </label>
              <input
                id="isbn13"
                v-model="form.isbn13"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="mb-6">
            <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              v-model="form.comment"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
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
              {{ loading ? 'Updating...' : 'Update Book' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
