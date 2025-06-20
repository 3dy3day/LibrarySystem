<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const isbn = ref('');
const editedIsbn = ref('');
const isEditing = ref(false);

onMounted(() => {
  isbn.value = route.params.isbn as string;
  editedIsbn.value = isbn.value;
});

function toggleEdit() {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    editedIsbn.value = isbn.value;
  }
}

function saveEdit() {
  isbn.value = editedIsbn.value;
  isEditing.value = false;
}

function proceedToBookInfo() {
  if (isbn.value) {
    router.push(`/scan/book-info/${isbn.value}`);
  }
}

function goBack() {
  router.push('/scan');
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          Confirm ISBN
        </h1>
        
        <div class="mb-6">
          <p class="text-gray-600 mb-4 text-center">
            Please verify that the scanned ISBN is correct:
          </p>
          
          <div class="bg-gray-100 rounded-lg p-4 mb-4">
            <div v-if="!isEditing" class="flex items-center justify-between">
              <span class="text-lg font-mono">{{ isbn }}</span>
              <button 
                @click="toggleEdit"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            
            <div v-else class="space-y-3">
              <input 
                v-model="editedIsbn"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Enter ISBN"
              />
              <div class="flex space-x-2">
                <button 
                  @click="saveEdit"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button 
                  @click="toggleEdit"
                  class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          <div class="text-sm text-gray-500 text-center">
            ISBN should be 10 or 13 digits long
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="goBack"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Scan
          </button>
          
          <button 
            @click="proceedToBookInfo"
            :disabled="!isbn"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Register Book
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
