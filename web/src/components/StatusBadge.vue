<script setup lang="ts">
defineProps<{
  status: string;
  type?: 'book' | 'loan';
}>();

function getStatusColor(status: string, type: string = 'book') {
  if (type === 'book') {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'LENT': return 'bg-yellow-100 text-yellow-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  } else {
    if (status === 'returned') return 'bg-green-100 text-green-800';
    if (status === 'overdue') return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  }
}
</script>

<template>
  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusColor(status, type)]">
    {{ status }}
  </span>
</template>
