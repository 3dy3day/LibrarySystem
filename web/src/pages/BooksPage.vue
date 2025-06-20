<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-semibold text-gray-900 hover:text-gray-700">
              Library System
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/register" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Register Book
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Book Collection</h1>
            <p class="mt-2 text-gray-600">Manage your library's book inventory</p>
          </div>
          <div class="flex space-x-3">
            <router-link 
              to="/register" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Register Book
            </router-link>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="px-4 sm:px-0 mb-6">
        <div class="bg-white shadow rounded-lg p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search Books</label>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by title, author, or ISBN..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                id="status"
                v-model="statusFilter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Books</option>
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>
            <div>
              <label for="sort" class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                id="sort"
                v-model="sortBy"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="createdAt">Date Added</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="px-4 sm:px-0">
        <div class="bg-white shadow rounded-lg p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading books...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="px-4 sm:px-0">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error loading books</h3>
              <p class="mt-2 text-sm text-red-700">{{ error }}</p>
              <button 
                @click="loadBooks" 
                class="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Books Grid -->
      <div v-else class="px-4 sm:px-0">
        <div v-if="filteredBooks.length === 0" class="bg-white shadow rounded-lg p-8 text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p class="text-gray-600 mb-4">
            {{ searchQuery ? 'No books match your search criteria.' : 'Your library is empty. Start by adding some books!' }}
          </p>
          <router-link 
            to="/register" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Your First Book
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            @click="viewBook(book)"
          >
            <div class="p-6">
              <!-- Book Cover -->
              <div class="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="book.thumbnail" 
                  :src="book.thumbnail" 
                  :alt="book.title"
                  class="w-full h-full object-cover"
                />
                <svg v-else class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>

              <!-- Book Info -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{{ book.title }}</h3>
                <p class="text-sm text-gray-600 mb-2">by {{ book.author || 'Unknown Author' }}</p>
                
                <!-- Status Badge -->
                <div class="flex items-center justify-between">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="book.available !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ book.available !== false ? 'Available' : 'Borrowed' }}
                  </span>
                  
                  <!-- ISBN -->
                  <span class="text-xs text-gray-500">
                    {{ book.isbn13 || book.isbn10 || 'No ISBN' }}
                  </span>
                </div>

                <!-- Publication Info -->
                <div class="mt-3 text-xs text-gray-500">
                  <p v-if="book.publisher">{{ book.publisher }}</p>
                  <p v-if="book.publishedDate">{{ formatDate(book.publishedDate) }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <button
                  @click.stop="viewBook(book)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
                <div class="flex space-x-2">
                  <button
                    v-if="book.available !== false"
                    @click.stop="borrowBook(book)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Borrow
                  </button>
                  <button
                    v-else
                    @click.stop="returnBook(book)"
                    class="text-orange-600 hover:text-orange-800 text-sm font-medium"
                  >
                    Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredBooks.length > 0" class="mt-8 flex justify-center">
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'

const router = useRouter()

// State
const books = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('title')
const currentPage = ref(1)
const itemsPerPage = 12

// Computed
const filteredBooks = computed(() => {
  let filtered = [...books.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(book => 
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.isbn13?.includes(query) ||
      book.isbn10?.includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    if (statusFilter.value === 'available') {
      filtered = filtered.filter(book => book.available !== false)
    } else if (statusFilter.value === 'borrowed') {
      filtered = filtered.filter(book => book.available === false)
    }
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '')
      case 'author':
        return (a.author || '').localeCompare(b.author || '')
      case 'createdAt':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      default:
        return 0
    }
  })

  // Apply pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  let filtered = [...books.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(book => 
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.isbn13?.includes(query) ||
      book.isbn10?.includes(query)
    )
  }

  if (statusFilter.value) {
    if (statusFilter.value === 'available') {
      filtered = filtered.filter(book => book.available !== false)
    } else if (statusFilter.value === 'borrowed') {
      filtered = filtered.filter(book => book.available === false)
    }
  }

  return Math.ceil(filtered.length / itemsPerPage)
})

// Methods
const loadBooks = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await api.get('/books')
    books.value = response.data || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load books'
    // Fallback to mock data for demo
    books.value = [
      {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn13: '9780743273565',
        publisher: 'Scribner',
        publishedDate: '2004-09-30',
        available: true,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn13: '9780061120084',
        publisher: 'Harper Perennial',
        publishedDate: '2006-05-23',
        available: false,
        createdAt: '2024-01-10T14:30:00Z'
      },
      {
        id: 3,
        title: '1984',
        author: 'George Orwell',
        isbn13: '9780451524935',
        publisher: 'Signet Classics',
        publishedDate: '1961-01-01',
        available: true,
        createdAt: '2024-01-08T09:15:00Z'
      }
    ]
  } finally {
    loading.value = false
  }
}

const viewBook = (book: any) => {
  router.push(`/books/${book.id}`)
}

const borrowBook = async (book: any) => {
  try {
    // In a real app, this would create a loan record
    await api.post('/loans', {
      bookId: book.id,
      userId: 1, // Mock user ID
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
    })
    book.available = false
  } catch (err) {
    console.error('Failed to borrow book:', err)
    // For demo purposes, just update the local state
    book.available = false
  }
}

const returnBook = async (book: any) => {
  try {
    // In a real app, this would update the loan record
    await api.put(`/loans/return/${book.id}`)
    book.available = true
  } catch (err) {
    console.error('Failed to return book:', err)
    // For demo purposes, just update the local state
    book.available = true
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadBooks()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
