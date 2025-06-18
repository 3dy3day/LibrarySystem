<script setup lang="ts">
defineProps<{
  headers: string[];
  rows: any[];
  loading?: boolean;
}>();

defineEmits<{
  rowClick: [row: any];
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th v-for="header in headers" :key="header" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-if="loading">
          <td :colspan="headers.length" class="px-6 py-4 text-center text-gray-500">
            Loading...
          </td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="headers.length" class="px-6 py-4 text-center text-gray-500">
            No data available
          </td>
        </tr>
        <tr v-else v-for="row in rows" :key="row.id" 
            class="hover:bg-gray-50 cursor-pointer"
            @click="$emit('rowClick', row)">
          <td v-for="header in headers" :key="header" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <slot :name="header.toLowerCase()" :row="row">
              {{ row[header.toLowerCase()] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
