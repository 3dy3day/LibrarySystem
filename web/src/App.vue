<template>
  <div id="app">
    <!-- Header - only show when authenticated and not on login page -->
    <header v-if="authStore.isAuthenticated && $route.path !== '/login'" class="app-header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/" class="logo-link">
            📚 Library System
          </router-link>
        </div>
        
        <div class="search-container">
          <div class="search-box">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              v-model="searchQuery"
              @keyup.enter="performSearch"
              type="text" 
              placeholder="Search books by title, author, or ISBN..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-search">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/register" class="nav-link">Register Book</router-link>
        </nav>
        
        <div class="user-menu">
          <div class="user-info" @click="toggleUserMenu">
            <div class="user-avatar">
              {{ getUserInitials(authStore.getUserName) }}
            </div>
            <span class="user-name">{{ authStore.getUserName }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>
          
          <div v-if="showUserMenu" class="user-dropdown">
            <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
              👤 Profile
            </router-link>
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="dropdown-item logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Main content -->
    <main :class="{ 'with-header': authStore.isAuthenticated && $route.path !== '/login' }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)
const searchQuery = ref('')

const getUserInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
  router.push('/login')
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/books?search=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.logo-link {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.logo-link:hover {
  color: #667eea;
}

.search-container {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #666;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  background: #f8f9fa;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #999;
}

.clear-search {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.clear-search:hover {
  background: #f0f0f0;
  color: #333;
}

.clear-search svg {
  width: 16px;
  height: 16px;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #667eea;
  background: #f8f9fa;
}

.nav-link.router-link-active {
  color: #667eea;
  background: #e8f0fe;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f8f9fa;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: #666;
  transition: transform 0.3s;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-divider {
  height: 1px;
  background: #e1e5e9;
  margin: 4px 0;
}

.logout-btn {
  color: #dc3545;
}

.logout-btn:hover {
  background: #fff5f5;
}

main {
  flex: 1;
  overflow-x: hidden;
}

main.with-header {
  padding-top: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    padding: 0 15px;
  }
  
  .search-container {
    margin: 0 10px;
    max-width: 200px;
  }
  
  .search-input {
    font-size: 13px;
    padding: 8px 10px 8px 35px;
  }
  
  .search-input::placeholder {
    font-size: 13px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .user-name {
    display: none;
  }
}
</style>
