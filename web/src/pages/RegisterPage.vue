<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-semibold text-gray-900 hover:text-gray-700">
              Library System
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </router-link>
            <router-link 
              to="/books" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Books
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Breadcrumb Navigation -->
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <nav class="flex items-center space-x-2 text-sm">
        <router-link 
          to="/" 
          class="text-blue-600 hover:text-blue-800 hover:underline"
        >
          Dashboard
        </router-link>
        <span class="text-gray-400">/</span>
        <span class="text-gray-700 font-medium">Register Book</span>
      </nav>
    </div>

    <!-- Page Content -->
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Register New Book</h1>
        <p class="text-lg text-gray-600">Choose how you'd like to add a book to your library</p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
        <!-- Scan Barcode Option -->
        <router-link 
          to="/scan" 
          class="group relative bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
        >
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-4">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Scan Barcode</h3>
            <p class="text-gray-600 mb-4">Use your camera to scan the ISBN barcode on the book</p>
            <div class="inline-flex items-center text-blue-600 group-hover:text-blue-700">
              <span class="text-sm font-medium">Start Scanning</span>
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </router-link>

        <!-- Manual Entry Option -->
        <router-link 
          to="/books/add" 
          class="group relative bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-500"
        >
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mb-4">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Manual Entry</h3>
            <p class="text-gray-600 mb-4">Type in the book details manually or enter an ISBN number</p>
            <div class="inline-flex items-center text-green-600 group-hover:text-green-700">
              <span class="text-sm font-medium">Enter Manually</span>
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Additional Information -->
      <div class="mt-12 bg-blue-50 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Tips for registering books</h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc list-inside space-y-1">
                <li><strong>Scanning:</strong> Point your camera at the barcode on the back of the book for automatic book information retrieval</li>
                <li><strong>Manual Entry:</strong> Perfect for books without barcodes or when you want to add custom information</li>
                <li>Both methods will allow you to review and edit book details before saving</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page serves as a choice between scanning and manual entry
// No additional logic needed as it's just navigation
</script>
