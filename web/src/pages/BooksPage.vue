<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores/book';
import DataTable from '@/components/DataTable.vue';
import SearchBar from '@/components/SearchBar.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const bookStore = useBookStore();

const books = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('');
const showDeleteDialog = ref(false);
const bookToDelete = ref<any>(null);

const headers = ['Title', 'Author', 'ISBN', 'Status', 'Actions'];
const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'LENT', label: 'Lent' },
  { value: 'LOST', label: 'Lost' }
];

onMounted(async () => {
  await loadBooks();
});

async function loadBooks() {
  try {
    loading.value = true;
    books.value = await bookStore.list(searchQuery.value, statusFilter.value);
  } catch (error) {
    console.error('Error loading books:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSearch(query: string) {
  searchQuery.value = query;
  await loadBooks();
}

async function handleStatusFilter() {
  await loadBooks();
}

function viewBook(book: any) {
  router.push(`/books/${book.id}`);
}

function editBook(book: any) {
  router.push(`/books/${book.id}/edit`);
}

function confirmDelete(book: any) {
  bookToDelete.value = book;
  showDeleteDialog.value = true;
}

async function deleteBook() {
  if (bookToDelete.value) {
    try {
      await bookStore.remove(bookToDelete.value.id);
      books.value = books.value.filter((b: any) => b.id !== bookToDelete.value.id);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }
  showDeleteDialog.value = false;
  bookToDelete.value = null;
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Books</h1>
      <router-link
        to="/books/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add Book
      </router-link>
    </div>

    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <SearchBar
          v-model="searchQuery"
          placeholder="Search books by title, author, or ISBN..."
          @search="handleSearch"
        />
      </div>
      <div class="w-48">
        <select
          v-model="statusFilter"
          @change="handleStatusFilter"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <DataTable
        :headers="headers"
        :rows="books"
        :loading="loading"
        @row-click="viewBook"
      >
        <template #title="{ row }">
          {{ row.title }}
        </template>
        <template #author="{ row }">
          {{ row.author }}
        </template>
        <template #isbn="{ row }">
          {{ row.isbn13 || row.isbn10 || 'N/A' }}
        </template>
        <template #status="{ row }">
          <StatusBadge :status="row.status" type="book" />
        </template>
        <template #actions="{ row }">
          <div class="flex space-x-2">
            <button
              @click.stop="editBook(row)"
              class="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              @click.stop="confirmDelete(row)"
              class="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <ConfirmDialog
      :show="showDeleteDialog"
      title="Delete Book"
      :message="`Are you sure you want to delete '${bookToDelete?.title}'? This action cannot be undone.`"
      @confirm="deleteBook"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>
