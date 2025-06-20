<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '@/stores/book';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();

const isbn = ref('');
const loading = ref(true);
const error = ref('');
const bookExists = ref(false);

// Form data
const formData = ref({
  title: '',
  author: '',
  publisher: '',
  publishedAt: '',
  isbn10: '',
  isbn13: '',
  description: '',
  thumbnail: '',
  status: 'AVAILABLE'
});

onMounted(async () => {
  isbn.value = route.params.isbn as string;
  await fetchBookInfo();
});

async function fetchBookInfo() {
  try {
    loading.value = true;
    error.value = '';
    
    const bookInfo = await bookStore.getBookInfo(isbn.value);
    
    bookExists.value = bookInfo.exists || false;
    
    // Pre-fill form with book information
    formData.value = {
      title: bookInfo.title || '',
      author: bookInfo.author || '',
      publisher: bookInfo.publisher || '',
      publishedAt: bookInfo.publishedAt ? new Date(bookInfo.publishedAt).toISOString().split('T')[0] : '',
      isbn10: bookInfo.isbn10 || '',
      isbn13: bookInfo.isbn13 || isbn.value,
      description: bookInfo.description || '',
      thumbnail: bookInfo.thumbnail || '',
      status: bookInfo.status || 'AVAILABLE'
    };
    
  } catch (err) {
    console.error('Error fetching book info:', err);
    error.value = 'Failed to fetch book information';
    
    // Set minimal form data
    formData.value.isbn13 = isbn.value;
    formData.value.title = 'Unknown';
    formData.value.author = 'Unknown';
  } finally {
    loading.value = false;
  }
}

async function registerBook() {
  try {
    loading.value = true;
    error.value = '';
    
    const bookData = {
      ...formData.value,
      publishedAt: formData.value.publishedAt ? new Date(formData.value.publishedAt) : undefined
    };
    
    const registeredBook = await bookStore.register(bookData);
    
    // Navigate to the book detail page
    router.push(`/books/${registeredBook.id}`);
    
  } catch (err) {
    console.error('Error registering book:', err);
    error.value = 'Failed to register book';
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push(`/scan/confirm/${isbn.value}`);
}

function goToExistingBook() {
  if (bookExists.value) {
    router.push(`/books`);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          Book Information
        </h1>
        
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading book information...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {{ error }}
        </div>
        
        <!-- Book exists warning -->
        <div v-else-if="bookExists" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p class="font-medium">📚 This book already exists in the library!</p>
          <p class="text-sm mt-1">You can view it in the books list or register a new copy.</p>
          <button 
            @click="goToExistingBook"
            class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            View existing book
          </button>
        </div>
        
        <!-- Form -->
        <form v-else @submit.prevent="registerBook" class="space-y-6">
          <!-- Book thumbnail and basic info -->
          <div class="flex flex-col md:flex-row gap-6">
            <div v-if="formData.thumbnail" class="flex-shrink-0">
              <img 
                :src="formData.thumbnail" 
                :alt="formData.title"
                class="w-32 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
            
            <div class="flex-1 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input 
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input 
                  v-model="formData.author"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                <input 
                  v-model="formData.publisher"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <!-- Additional details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
              <input 
                v-model="formData.publishedAt"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                v-model="formData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="LENT">Lent</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
          </div>
          
          <!-- ISBN fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ISBN-10</label>
              <input 
                v-model="formData.isbn10"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ISBN-13</label>
              <input 
                v-model="formData.isbn13"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="formData.description">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="formData.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readonly
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">Description is automatically fetched and cannot be edited</p>
          </div>
          
          <!-- Action buttons -->
          <div class="flex space-x-3 pt-6">
            <button 
              type="button"
              @click="goBack"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {{ loading ? 'Registering...' : 'Register Book' }}
            </button>

          </div>
        </form>
      </div>
    </div>
  </div>
</template>
