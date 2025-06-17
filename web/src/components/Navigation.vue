<template>
  <nav class="bg-blue-600 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold">Library System</router-link>
      <div class="space-x-4">
        <router-link to="/dashboard" class="hover:text-blue-200">Dashboard</router-link>
        <router-link to="/books" class="hover:text-blue-200">Books</router-link>
        <router-link to="/users" class="hover:text-blue-200">Users</router-link>
        <router-link to="/loans" class="hover:text-blue-200">Loans</router-link>
        <router-link to="/scan" class="hover:text-blue-200">Scan</router-link>
      </div>
    </div>
  </nav>
</template>
