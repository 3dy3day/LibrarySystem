<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/lib/api';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores/book';

const props = defineProps<{ id: string }>();
const router = useRouter();
const bookStore = useBookStore();
const book = ref<any>(null);
const isDeleting = ref(false);

onMounted(async () => {
  const { data } = await api.get(`/books/${props.id}`);
  book.value = data;
});

function goBack() {
  // Try to go back in history, but if there's no history, go to books page
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/books');
  }
}

function editBook() {
  router.push(`/books/${book.value.id}/edit`);
}

async function deleteBook() {
  if (!book.value) return;
  
  const confirmed = confirm(`Are you sure you want to delete "${book.value.title}"? This action cannot be undone.`);
  if (!confirmed) return;
  
  try {
    isDeleting.value = true;
    await bookStore.deleteBook(book.value.id);
    router.push('/books');
  } catch (error: any) {
    console.error('Error deleting book:', error);
    
    // Extract error message from API response
    let errorMessage = 'Failed to delete book. Please try again.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Breadcrumb Navigation -->
      <nav class="mb-6 flex items-center space-x-2 text-sm">
        <router-link 
          to="/" 
          class="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Dashboard
        </router-link>
        <span class="text-gray-400">/</span>
        <router-link 
          to="/books" 
          class="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Book Collection
        </router-link>
        <span class="text-gray-400">/</span>
        <span class="text-gray-700 font-medium">
          {{ book?.title || 'Loading...' }}
        </span>
      </nav>

      <div v-if="book" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row gap-8">
            <!-- Book thumbnail -->
            <div v-if="book.thumbnail" class="flex-shrink-0">
              <img 
                :src="book.thumbnail" 
                :alt="book.title"
                class="w-48 h-72 object-cover rounded-lg shadow-md mx-auto lg:mx-0"
              />
            </div>
            
            <!-- Book information -->
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ book.title }}</h1>
              
              <div class="space-y-3 mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center">
                  <span class="font-medium text-gray-700 w-24">Author:</span>
                  <span class="text-gray-900">{{ book.author }}</span>
                </div>
                
                <div v-if="book.publisher" class="flex flex-col sm:flex-row sm:items-center">
                  <span class="font-medium text-gray-700 w-24">Publisher:</span>
                  <span class="text-gray-900">{{ book.publisher }}</span>
                </div>
                
                <div v-if="book.publishedAt" class="flex flex-col sm:flex-row sm:items-center">
                  <span class="font-medium text-gray-700 w-24">Published:</span>
                  <span class="text-gray-900">{{ new Date(book.publishedAt).toLocaleDateString() }}</span>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center">
                  <span class="font-medium text-gray-700 w-24">ISBN-13:</span>
                  <span class="text-gray-900 font-mono">{{ book.isbn13 || 'N/A' }}</span>
                </div>
                
                <div v-if="book.isbn10" class="flex flex-col sm:flex-row sm:items-center">
                  <span class="font-medium text-gray-700 w-24">ISBN-10:</span>
                  <span class="text-gray-900 font-mono">{{ book.isbn10 }}</span>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center">
                  <span class="font-medium text-gray-700 w-24">Status:</span>
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': book.status === 'AVAILABLE',
                      'bg-yellow-100 text-yellow-800': book.status === 'LENT',
                      'bg-red-100 text-red-800': book.status === 'LOST'
                    }"
                  >
                    {{ book.status }}
                  </span>
                </div>
                
                <div v-if="book.createdAt" class="flex flex-col sm:flex-row sm:items-center">
                  <span class="font-medium text-gray-700 w-24">Added:</span>
                  <span class="text-gray-900">{{ new Date(book.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="book.description" class="mt-8 pt-6 border-t border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <div class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed">{{ book.description }}</p>
            </div>
          </div>
          
          <!-- Comment -->
          <div v-if="book.comment" class="mt-6 pt-6 border-t border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Notes</h2>
            <p class="text-gray-700">{{ book.comment }}</p>
          </div>
          
          <!-- Action buttons -->
          <div class="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button 
              @click="editBook"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Book
            </button>
            
            <button 
              @click="deleteBook"
              :disabled="isDeleting"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <svg v-if="isDeleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              {{ isDeleting ? 'Deleting...' : 'Delete Book' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-else class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading book details...</p>
      </div>
    </div>
  </div>
</template>
