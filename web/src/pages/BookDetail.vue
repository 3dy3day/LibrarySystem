<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/lib/api';
import { useRouter } from 'vue-router';

const props = defineProps<{ id: string }>();
const router = useRouter();
const book = ref<any>(null);

onMounted(async () => {
  const { data } = await api.get(`/books/${props.id}`);
  book.value = data;
});
</script>

<template>
  <div class="p-4">
    <button class="text-blue-600 underline mb-4" @click="router.back()">← Back</button>

    <div v-if="book">
      <h1 class="text-2xl font-bold mb-2">{{ book.title }}</h1>
      <p class="mb-1">Author: {{ book.author }}</p>
      <p class="mb-1">ISBN: {{ book.isbn13 || book.isbn10 }}</p>
      <p class="mb-1">Status: {{ book.status }}</p>
    </div>
  </div>
</template>
