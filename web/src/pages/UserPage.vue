<template>
  <div class="user-page">
    <div class="user-header">
      <div class="user-avatar">
        <div class="avatar-circle">
          {{ getUserInitials(authStore.getUserName) }}
        </div>
      </div>
      <div class="user-info">
        <h1>{{ authStore.getUserName }}</h1>
        <div class="user-badges">
          <span class="badge role-badge" :class="authStore.getUserRole.toLowerCase()">
            {{ authStore.getUserRole }}
          </span>
          <span class="badge tier-badge" :class="authStore.getUserTier.toLowerCase()">
            {{ authStore.getUserTier }}
          </span>
        </div>
        <p class="borrow-limit">
          Can borrow up to {{ getBorrowLimit(authStore.getUserTier) }} book(s)
        </p>
      </div>
    </div>

    <div class="user-content">
      <!-- Borrowing Status - Now at the top -->
      <div class="section">
        <h2>📊 Borrowing Status</h2>
        <div class="status-card">
          <div class="status-item">
            <span class="status-label">Current Rentals:</span>
            <span class="status-value">{{ borrowStatus.currentLoans }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Max Allowed:</span>
            <span class="status-value">{{ borrowStatus.maxLoans === -1 ? 'Unlimited' : borrowStatus.maxLoans }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Can Borrow:</span>
            <span class="status-value" :class="borrowStatus.canBorrow ? 'success' : 'error'">
              {{ borrowStatus.canBorrow ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Overdue Books:</span>
            <span class="status-value" :class="borrowStatus.overdueCount > 0 ? 'error' : 'success'">
              {{ borrowStatus.overdueCount || 0 }}
            </span>
          </div>
        </div>
        
        <!-- Penalty Warning -->
        <div v-if="borrowStatus.hasOverdueBooks" class="penalty-warning">
          <div class="warning-icon">⚠️</div>
          <div class="warning-content">
            <h3>Borrowing Suspended</h3>
            <p>{{ borrowStatus.reason }}</p>
            <p class="warning-note">Please return your overdue books to resume borrowing privileges.</p>
          </div>
        </div>
      </div>

      <!-- Currently Borrowed Books - Books you borrowed from others -->
      <div class="section">
        <h2>📚 Currently Borrowed Books</h2>
        <p class="section-description">Books you have borrowed from other users</p>
        <div v-if="borrowedBooks.length === 0" class="empty-state">
          <p>No books currently borrowed</p>
        </div>
        <div v-else class="books-grid">
          <div v-for="loan in borrowedBooks" :key="loan.id" class="book-card borrowed" :class="{ 'overdue': isOverdue(loan.dueAt) }">
            <div class="book-thumbnail">
              <img v-if="loan.book.thumbnail" :src="loan.book.thumbnail" :alt="loan.book.title" />
              <div v-else class="placeholder-thumbnail">📖</div>
            </div>
            <div class="book-info">
              <h3>{{ loan.book.title }}</h3>
              <p class="author">by {{ loan.book.author }}</p>
              <p class="due-date" :class="{ 'overdue-text': isOverdue(loan.dueAt) }">
                Due: {{ formatDate(loan.dueAt) }}
                <span v-if="isOverdue(loan.dueAt)" class="overdue-label">OVERDUE</span>
              </p>
              <span class="status-badge" :class="isOverdue(loan.dueAt) ? 'overdue' : 'borrowed'">
                {{ isOverdue(loan.dueAt) ? 'Overdue' : 'Borrowed' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Owned Books Section - Books you own (shows if borrowed by others) -->
      <div class="section">
        <h2>📖 Books I Own</h2>
        <p class="section-description">Books you have registered in the system</p>
        <div v-if="ownedBooks.length === 0" class="empty-state">
          <p>No books registered yet</p>
          <router-link to="/register" class="add-book-btn">
            Add Your First Book
          </router-link>
        </div>
        <div v-else class="books-grid">
          <div v-for="book in ownedBooks" :key="book.id" class="book-card owned">
            <div class="book-thumbnail">
              <img v-if="book.thumbnail" :src="book.thumbnail" :alt="book.title" />
              <div v-else class="placeholder-thumbnail">📖</div>
            </div>
            <div class="book-info">
              <h3>{{ book.title }}</h3>
              <p class="author">by {{ book.author }}</p>
              <span class="status-badge" :class="book.status.toLowerCase()">
                {{ book.status }}
              </span>
            </div>
            <div class="book-actions">
              <router-link :to="`/books/${book.id}`" class="view-btn">View</router-link>
              <router-link :to="`/books/${book.id}/edit`" class="edit-btn">Edit</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../lib/api'

interface Book {
  id: string
  title: string
  author: string
  status: string
  thumbnail?: string
  loans?: Array<{
    borrower: {
      name: string
    }
  }>
}

interface Loan {
  id: string
  dueAt: string
  book: {
    id: string
    title: string
    author: string
    thumbnail?: string
  }
}

interface BorrowStatus {
  canBorrow: boolean
  currentLoans: number
  maxLoans: number
  hasOverdueBooks: boolean
  overdueCount: number
  reason?: string
}

const authStore = useAuthStore()

const borrowedBooks = ref<Loan[]>([])
const ownedBooks = ref<Book[]>([])
const borrowStatus = ref<BorrowStatus>({
  canBorrow: false,
  currentLoans: 0,
  maxLoans: 1,
  hasOverdueBooks: false,
  overdueCount: 0
})

const getUserInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getBorrowLimit = (tier: string): number => {
  switch (tier) {
    case 'TIER_1': return 3
    case 'TIER_2': return 3
    case 'TIER_3': return 2
    case 'TIER_4': return 1
    default: return 1
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date()
}

const fetchUserData = async () => {
  try {
    const userId = authStore.getUserId
    
    // Fetch user details with borrowed books
    const userResponse = await api.get(`/users/${userId}`)
    if (userResponse.data.loans) {
      borrowedBooks.value = userResponse.data.loans
    }

    // Fetch owned books
    const ownedResponse = await api.get(`/users/${userId}/owned-books`)
    ownedBooks.value = ownedResponse.data

    // Fetch borrow status
    const statusResponse = await api.get(`/users/${userId}/borrow-status`)
    borrowStatus.value = statusResponse.data
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
}

onMounted(() => {
  fetchUserData()
})
</script>

<style scoped>
.user-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-info h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.user-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #ff6b6b;
  color: white;
}

.role-badge.user {
  background: #4ecdc4;
  color: white;
}

.tier-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.borrow-limit {
  margin: 0;
  opacity: 0.9;
}

.user-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section h2 {
  margin-bottom: 8px;
  color: #333;
  font-size: 1.5rem;
}

.section-description {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.add-book-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s;
}

.add-book-btn:hover {
  background: #5a6fd8;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.book-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.book-card.borrowed {
  border-left: 4px solid #4ecdc4;
}

.book-card.owned {
  border-left: 4px solid #667eea;
}

.book-card.overdue {
  border-left: 4px solid #ff6b6b;
  background: #fff5f5;
}

.book-thumbnail {
  width: 60px;
  height: 80px;
  margin-bottom: 15px;
}

.book-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 1.5rem;
}

.book-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.book-info .author {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9rem;
}

.due-date {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.borrowed {
  background: #4ecdc4;
  color: white;
}

.status-badge.available {
  background: #51cf66;
  color: white;
}

.status-badge.lent {
  background: #ffd43b;
  color: #333;
}

.status-badge.overdue {
  background: #ff6b6b;
  color: white;
}

.due-date.overdue-text {
  color: #c53030;
  font-weight: 600;
}

.overdue-label {
  margin-left: 8px;
  padding: 2px 6px;
  background: #ff6b6b;
  color: white;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
}

.book-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.view-btn, .edit-btn {
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background 0.3s;
}

.view-btn {
  background: #e9ecef;
  color: #495057;
}

.view-btn:hover {
  background: #dee2e6;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.edit-btn:hover {
  background: #5a6fd8;
}

.status-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-weight: 600;
  color: #666;
}

.status-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.status-value.success {
  color: #51cf66;
}

.status-value.error {
  color: #ff6b6b;
}

.penalty-warning {
  margin-top: 20px;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.warning-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.warning-content h3 {
  margin: 0 0 10px 0;
  color: #c53030;
  font-size: 1.2rem;
}

.warning-content p {
  margin: 0 0 8px 0;
  color: #742a2a;
  line-height: 1.5;
}

.warning-note {
  font-style: italic;
  color: #a0aec0;
  font-size: 0.9rem;
}
</style>
