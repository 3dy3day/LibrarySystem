<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  name: '',
  email: ''
});

const loading = ref(false);
const errors = ref<any>({});

async function handleSubmit() {
  errors.value = {};
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required';
  }
  
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Email is invalid';
  }
  
  if (Object.keys(errors.value).length > 0) return;
  
  try {
    loading.value = true;
    await userStore.create(form.value);
    router.push('/users');
  } catch (error) {
    console.error('Error creating user:', error);
    errors.value.general = 'Failed to create user. Please try again.';
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
        <h1 class="text-3xl font-bold text-gray-900">Create User</h1>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>

          <div class="mb-6">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
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
              {{ loading ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
