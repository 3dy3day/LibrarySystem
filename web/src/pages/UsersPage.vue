<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import DataTable from '@/components/DataTable.vue';
import SearchBar from '@/components/SearchBar.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const userStore = useUserStore();

const users = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const showDeleteDialog = ref(false);
const userToDelete = ref<any>(null);

const headers = ['Name', 'Email', 'Created At', 'Actions'];

onMounted(async () => {
  await loadUsers();
});

async function loadUsers() {
  try {
    loading.value = true;
    users.value = await userStore.list(searchQuery.value);
  } catch (error) {
    console.error('Error loading users:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSearch(query: string) {
  searchQuery.value = query;
  await loadUsers();
}

function viewUser(user: any) {
  router.push(`/users/${user.id}`);
}

function editUser(user: any) {
  router.push(`/users/${user.id}/edit`);
}

function confirmDelete(user: any) {
  userToDelete.value = user;
  showDeleteDialog.value = true;
}

async function deleteUser() {
  if (userToDelete.value) {
    try {
      await userStore.remove(userToDelete.value.id);
      users.value = users.value.filter((u: any) => u.id !== userToDelete.value.id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
  showDeleteDialog.value = false;
  userToDelete.value = null;
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Users</h1>
      <router-link
        to="/users/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add User
      </router-link>
    </div>

    <div class="mb-6">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search users by name or email..."
        @search="handleSearch"
      />
    </div>

    <div class="bg-white rounded-lg shadow">
      <DataTable
        :headers="headers"
        :rows="users"
        :loading="loading"
        @row-click="viewUser"
      >
        <template #name="{ row }">
          {{ row.name }}
        </template>
        <template #email="{ row }">
          {{ row.email }}
        </template>
        <template #created\ at="{ row }">
          {{ new Date(row.createdAt).toLocaleDateString() }}
        </template>
        <template #actions="{ row }">
          <div class="flex space-x-2">
            <button
              @click.stop="editUser(row)"
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
      title="Delete User"
      :message="`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`"
      @confirm="deleteUser"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>
