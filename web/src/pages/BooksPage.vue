<template>
  <div class="min-h-screen bg-gray-50">
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
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
            @click="viewBook(book)"
          >
            <div class="p-6 flex-1 flex flex-col">
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
              <div class="flex-1 flex flex-col">
                <h3 
                  class="text-lg font-medium text-gray-900 mb-2 leading-tight"
                  :class="book.title && book.title.length > 50 ? 'line-clamp-3' : 'line-clamp-2'"
                  :title="book.title"
                >
                  {{ book.title }}
                </h3>
                <p class="text-sm text-gray-600 mb-2">by {{ book.author || 'Unknown Author' }}</p>
                
                <!-- Status Badge -->
                <div class="flex items-center justify-between mb-3">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ book.status === 'AVAILABLE' ? 'Available' : 'Borrowed' }}
                  </span>
                  
                  <!-- ISBN -->
                  <span class="text-xs text-gray-500">
                    {{ book.isbn13 || book.isbn10 || 'No ISBN' }}
                  </span>
                </div>

                <!-- Publication Info -->
                <div class="mt-auto text-xs text-gray-500">
                  <p v-if="book.publisher">{{ book.publisher }}</p>
                  <p v-if="book.publishedDate">{{ formatDate(book.publishedDate) }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons - Always at bottom -->
            <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 mt-auto">
              <div class="flex justify-between items-center min-h-[2rem]">
                <button
                  @click.stop="viewBook(book)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
                <div class="flex space-x-2">
                  <button
                    v-if="book.status === 'AVAILABLE'"
                    @click.stop="borrowBook(book)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Borrow
                  </button>
                  <div v-else class="text-xs text-gray-600 text-right">
                    <div v-if="book.loans && book.loans.length > 0">
                      <button
                        v-if="canUserReturn(book)"
                        @click.stop="returnBook(book)"
                        class="text-orange-600 hover:text-orange-800 text-sm font-medium"
                      >
                        Return
                      </button>
                    </div>
                    <div v-else>
                      <p>Currently borrowed</p>
                    </div>
                  </div>
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

    <!-- Borrow Confirmation Modal -->
    <div v-if="showBorrowModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Confirm Book Borrowing</h3>
            <button @click="cancelBorrow" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Book Info -->
          <div v-if="selectedBook" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-900">{{ selectedBook.title }}</h4>
            <p class="text-sm text-gray-600">by {{ selectedBook.author }}</p>
          </div>

          <!-- User Info -->
          <div v-if="borrowingUser" class="mb-4">
            <h4 class="font-medium text-gray-900 mb-2">Borrower Information</h4>
            <div class="space-y-1 text-sm">
              <p><span class="font-medium">Name:</span> {{ borrowingUser.name }}</p>
              <p><span class="font-medium">Email:</span> {{ borrowingUser.email }}</p>
              <p><span class="font-medium">Tier:</span> {{ borrowingUser.tier }}</p>
              <div v-if="borrowingUser.borrowingInfo" class="mt-2 p-2 bg-blue-50 rounded">
                <p class="text-blue-800">
                  <span class="font-medium">Current Loans:</span> 
                  {{ borrowingUser.borrowingInfo.currentLoans }}
                  <span v-if="borrowingUser.borrowingInfo.maxLoans !== -1">
                    / {{ borrowingUser.borrowingInfo.maxLoans }}
                  </span>
                  <span v-else> (Unlimited)</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Borrowing Period -->
          <div class="mb-4">
            <label for="borrowDays" class="block text-sm font-medium text-gray-700 mb-2">
              Borrowing Period (days)
            </label>
            <select
              id="borrowDays"
              v-model="borrowDays"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
            </select>
            <p class="mt-1 text-sm text-gray-600">
              Due date: {{ getDueDate() }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3">
            <button
              @click="cancelBorrow"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              @click="confirmBorrow"
              :disabled="isProcessingBorrow"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isProcessingBorrow">Processing...</span>
              <span v-else>Confirm Borrow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const books = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('title')
const currentPage = ref(1)
const itemsPerPage = 12

// Borrow confirmation modal state
const showBorrowModal = ref(false)
const selectedBook = ref<any>(null)
const borrowingUser = ref<any>(null)
const borrowDays = ref(14)
const isProcessingBorrow = ref(false)

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
      filtered = filtered.filter(book => book.status === 'AVAILABLE')
    } else if (statusFilter.value === 'borrowed') {
      filtered = filtered.filter(book => book.status === 'LENT')
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
  selectedBook.value = book
  
  // Get current logged-in user ID
  const currentUserId = authStore.getUserId
  
  // Get current user info and borrowing limits
  try {
    const userResponse = await api.get(`/users/${currentUserId}`)
    borrowingUser.value = userResponse.data
    
    // Check borrowing limits
    const canBorrowResponse = await api.get(`/users/${currentUserId}/borrow-status`)
    borrowingUser.value.borrowingInfo = canBorrowResponse.data
    
    showBorrowModal.value = true
  } catch (err: any) {
    console.error('Failed to get user info:', err)
    alert('Failed to get user information. Please try again.')
  }
}

const confirmBorrow = async () => {
  if (!selectedBook.value || !borrowingUser.value) return
  
  try {
    isProcessingBorrow.value = true
    
    await api.post('/loans', {
      bookId: selectedBook.value.id,
      borrowerId: borrowingUser.value.id,
      days: borrowDays.value
    })
    
    // Update book status in local state
    const bookIndex = books.value.findIndex(b => b.id === selectedBook.value.id)
    if (bookIndex !== -1) {
      books.value[bookIndex].status = 'LENT'
      books.value[bookIndex].available = false
    }
    
    showBorrowModal.value = false
    selectedBook.value = null
    borrowingUser.value = null
    
    alert('Book borrowed successfully!')
  } catch (err: any) {
    console.error('Failed to borrow book:', err)
    const errorMessage = err.response?.data?.message || 'Failed to borrow book. Please try again.'
    alert(errorMessage)
  } finally {
    isProcessingBorrow.value = false
  }
}

const cancelBorrow = () => {
  showBorrowModal.value = false
  selectedBook.value = null
  borrowingUser.value = null
  borrowDays.value = 14
}

const getDueDate = () => {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + borrowDays.value)
  return dueDate.toLocaleDateString()
}

const returnBook = async (book: any) => {
  try {
    // Find the active loan for this book
    if (book.loans && book.loans.length > 0) {
      const activeLoan = book.loans.find((loan: any) => !loan.returnedAt)
      if (activeLoan) {
        const currentUserId = authStore.getUserId
        await api.patch(`/loans/${activeLoan.id}/return`, {
          userId: currentUserId
        })
        
        // Update book status in local state
        const bookIndex = books.value.findIndex(b => b.id === book.id)
        if (bookIndex !== -1) {
          books.value[bookIndex].status = 'AVAILABLE'
        }
        
        alert('Book returned successfully!')
        return
      }
    }
    
    // Fallback: just update local state
    const bookIndex = books.value.findIndex(b => b.id === book.id)
    if (bookIndex !== -1) {
      books.value[bookIndex].status = 'AVAILABLE'
    }
  } catch (err: any) {
    console.error('Failed to return book:', err)
    const errorMessage = err.response?.data?.message || 'Failed to return book. Please try again.'
    alert(errorMessage)
  }
}

const canUserReturn = (book: any) => {
  // Get current logged-in user ID
  const currentUserId = authStore.getUserId
  const isAdmin = authStore.getUserRole === 'ADMIN'
  
  // Check if the current user is the borrower or an admin
  if (book.loans && book.loans.length > 0) {
    const activeLoan = book.loans.find((loan: any) => !loan.returnedAt)
    if (activeLoan) {
      // Only the borrower or admin can return the book
      return activeLoan.borrowerId === currentUserId || isAdmin
    }
  }
  return false
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
  text-overflow: ellipsis;
  word-wrap: break-word;
  hyphens: auto;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  hyphens: auto;
}

/* Fallback for browsers that don't support -webkit-line-clamp */
@supports not (-webkit-line-clamp: 2) {
  .line-clamp-2 {
    display: block;
    max-height: 3em; /* Approximate height for 2 lines */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .line-clamp-3 {
    display: block;
    max-height: 4.5em; /* Approximate height for 3 lines */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
