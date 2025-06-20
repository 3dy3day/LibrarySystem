<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/lib/api';
import { useRouter } from 'vue-router';

const router = useRouter();

const book = ref({
  title: '',
  author: '',
  publisher: '',
  publishedAt: '',
  isbn10: '',
  isbn13: '',
  description: '',
  comment: '',
  thumbnail: '',
  status: 'AVAILABLE'
});

const isSaving = ref(false);
const error = ref('');
const showIsbnLookup = ref(false);
const isbnLookup = ref('');
const isLookingUp = ref(false);

async function lookupByIsbn() {
  if (!isbnLookup.value.trim()) {
    error.value = 'Please enter an ISBN';
    return;
  }

  try {
    isLookingUp.value = true;
    error.value = '';

    const { data } = await api.get(`/books/isbn/${isbnLookup.value.trim()}/info`);
    
    if (data.exists) {
      error.value = 'This book already exists in the library';
      return;
    }

    // Populate form with fetched data
    book.value = {
      title: data.title || '',
      author: data.author || '',
      publisher: data.publisher || '',
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().split('T')[0] : '',
      isbn10: data.isbn10 || '',
      isbn13: data.isbn13 || isbnLookup.value.trim(),
      description: data.description || '',
      comment: '',
      thumbnail: data.thumbnail || '',
      status: 'AVAILABLE'
    };

    showIsbnLookup.value = false;
  } catch (err: any) {
    console.error('Error looking up ISBN:', err);
    // If lookup fails, just populate the ISBN field
    if (isbnLookup.value.length === 10) {
      book.value.isbn10 = isbnLookup.value.trim();
    } else {
      book.value.isbn13 = isbnLookup.value.trim();
    }
    showIsbnLookup.value = false;
  } finally {
    isLookingUp.value = false;
  }
}

async function saveBook() {
  if (!book.value.title || !book.value.author) {
    error.value = 'Title and author are required';
    return;
  }

  if (!book.value.isbn10 && !book.value.isbn13) {
    error.value = 'At least one ISBN (ISBN-10 or ISBN-13) is required';
    return;
  }

  try {
    isSaving.value = true;
    error.value = '';

    const saveData = {
      ...book.value,
      publishedAt: book.value.publishedAt ? new Date(book.value.publishedAt).toISOString() : null,
      publisher: book.value.publisher || null,
      isbn10: book.value.isbn10 || null,
      isbn13: book.value.isbn13 || null,
      comment: book.value.comment || null,
      description: book.value.description || null
    };

    // Only include thumbnail if it's a valid URL
    if (book.value.thumbnail && book.value.thumbnail.trim()) {
      saveData.thumbnail = book.value.thumbnail.trim();
    }

    const { data } = await api.post('/books', saveData);
    router.push(`/books/${data.id}`);
  } catch (err: any) {
    console.error('Error saving book:', err);
    if (err.response?.data?.details) {
      // Show detailed validation errors
      const details = err.response.data.details;
      error.value = details.map((detail: any) => `${detail.path.join('.')}: ${detail.message}`).join(', ');
    } else {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to save book';
    }
  } finally {
    isSaving.value = false;
  }
}

function cancel() {
  router.push('/books');
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <button 
        class="text-blue-600 hover:text-blue-800 underline mb-6 flex items-center"
        @click="cancel"
      >
        ← Back to Books
      </button>

      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">Add New Book</h1>
          <p class="mt-1 text-sm text-gray-600">Enter book details manually or lookup by ISBN</p>
        </div>

        <div class="p-6">
          <!-- ISBN Lookup Section -->
          <div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-blue-900">Quick ISBN Lookup</h3>
              <button
                @click="showIsbnLookup = !showIsbnLookup"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {{ showIsbnLookup ? 'Hide' : 'Show' }} ISBN Lookup
              </button>
            </div>
            
            <div v-if="showIsbnLookup" class="space-y-4">
              <div>
                <label for="isbnLookup" class="block text-sm font-medium text-blue-700 mb-2">
                  Enter ISBN (10 or 13 digits)
                </label>
                <div class="flex space-x-3">
                  <input
                    id="isbnLookup"
                    v-model="isbnLookup"
                    type="text"
                    class="flex-1 px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter ISBN to auto-fill book details"
                    @keyup.enter="lookupByIsbn"
                  />
                  <button
                    @click="lookupByIsbn"
                    :disabled="isLookingUp"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                  >
                    <svg v-if="isLookingUp" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLookingUp ? 'Looking up...' : 'Lookup' }}
                  </button>
                </div>
              </div>
              <p class="text-sm text-blue-600">
                💡 Tip: Enter an ISBN to automatically fill in book details from our database or external sources.
              </p>
            </div>
          </div>

          <!-- Manual Entry Form -->
          <form @submit.prevent="saveBook">
            <!-- Error message -->
            <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-red-700">{{ error }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Title -->
              <div class="sm:col-span-2">
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  v-model="book.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter book title"
                />
              </div>

              <!-- Author -->
              <div class="sm:col-span-2">
                <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
                  Author <span class="text-red-500">*</span>
                </label>
                <input
                  id="author"
                  v-model="book.author"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter author name"
                />
              </div>

              <!-- Publisher -->
              <div>
                <label for="publisher" class="block text-sm font-medium text-gray-700 mb-2">
                  Publisher
                </label>
                <input
                  id="publisher"
                  v-model="book.publisher"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter publisher"
                />
              </div>

              <!-- Published Date -->
              <div>
                <label for="publishedAt" class="block text-sm font-medium text-gray-700 mb-2">
                  Published Date
                </label>
                <input
                  id="publishedAt"
                  v-model="book.publishedAt"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- ISBN-13 -->
              <div>
                <label for="isbn13" class="block text-sm font-medium text-gray-700 mb-2">
                  ISBN-13 <span class="text-red-500">*</span>
                </label>
                <input
                  id="isbn13"
                  v-model="book.isbn13"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ISBN-13 (13 digits)"
                />
              </div>

              <!-- ISBN-10 -->
              <div>
                <label for="isbn10" class="block text-sm font-medium text-gray-700 mb-2">
                  ISBN-10
                </label>
                <input
                  id="isbn10"
                  v-model="book.isbn10"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ISBN-10 (10 digits)"
                />
              </div>

              <!-- Status -->
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  v-model="book.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="LENT">Lent</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <!-- Thumbnail URL -->
              <div>
                <label for="thumbnail" class="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  id="thumbnail"
                  v-model="book.thumbnail"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter thumbnail image URL"
                />
              </div>

              <!-- Description -->
              <div class="sm:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="book.description"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter book description"
                ></textarea>
              </div>

              <!-- Comment -->
              <div class="sm:col-span-2">
                <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
                  Notes/Comments
                </label>
                <textarea
                  id="comment"
                  v-model="book.comment"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any notes or comments about this book"
                ></textarea>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                @click="cancel"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSaving ? 'Saving...' : 'Add Book' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
