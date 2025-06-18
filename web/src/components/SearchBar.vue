<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  placeholder?: string;
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  search: [query: string];
}>();

const searchQuery = ref(props.modelValue || '');

function handleSearch() {
  emit('update:modelValue', searchQuery.value);
  emit('search', searchQuery.value);
}
</script>

<template>
  <div class="flex gap-2">
    <input
      v-model="searchQuery"
      type="text"
      :placeholder="placeholder || 'Search...'"
      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      @keyup.enter="handleSearch"
    />
    <button
      @click="handleSearch"
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Search
    </button>
  </div>
</template>
