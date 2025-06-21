<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Library System Login</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <select v-model="selectedUser" id="email" required>
            <option value="">Select a user...</option>
            <option v-for="user in availableUsers" :key="user.id" :value="user">
              {{ user.name }} ({{ user.email }}) - {{ user.role }} {{ user.tier }}
            </option>
          </select>
        </div>
        
        <button type="submit" :disabled="!selectedUser" class="login-btn">
          Login
        </button>
      </form>

      <div class="credentials-info">
        <h3>Available Test Users:</h3>
        <div class="user-list">
          <div v-for="user in availableUsers" :key="user.id" class="user-item">
            <strong>{{ user.name }}</strong><br>
            <small>{{ user.email }} | {{ user.role }} | {{ user.tier }}</small><br>
            <small>Can borrow: {{ getBorrowLimit(user.tier) }} book(s)</small>
          </div>
        </div>
        
        <div class="api-credentials">
          <h4>API Credentials (for testing):</h4>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> changeme</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectedUser = ref(null)
const availableUsers = ref([
  {
    id: '97e44342-8611-42f7-8354-82e16a669fb8',
    name: 'Admin User',
    email: 'admin@library.com',
    role: 'ADMIN',
    tier: 'TIER_1'
  },
  {
    id: 'd6cd411d-5619-4606-acc4-5374a7ee416d',
    name: 'Premium User',
    email: 'premium@library.com',
    role: 'USER',
    tier: 'TIER_1'
  },
  {
    id: '8f7f0f88-cb73-4df2-9d00-267ee283a68f',
    name: 'Standard User',
    email: 'standard@library.com',
    role: 'USER',
    tier: 'TIER_2'
  },
  {
    id: '0a4dc11a-bc16-44af-ae91-6cf13df18f5a',
    name: 'Basic User',
    email: 'basic@library.com',
    role: 'USER',
    tier: 'TIER_3'
  },
  {
    id: '0ce43844-e93e-4d0d-a371-ed52be41fe01',
    name: 'Free User',
    email: 'free@library.com',
    role: 'USER',
    tier: 'TIER_4'
  }
])

const getBorrowLimit = (tier: string): number => {
  switch (tier) {
    case 'TIER_1': return 3
    case 'TIER_2': return 3
    case 'TIER_3': return 2
    case 'TIER_4': return 1
    default: return 1
  }
}

const handleLogin = () => {
  if (selectedUser.value) {
    authStore.login(selectedUser.value)
    router.push('/')
  }
}

onMounted(() => {
  // If already logged in, redirect to home
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.credentials-info {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.credentials-info h3 {
  margin-bottom: 15px;
  color: #333;
}

.user-list {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.user-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.api-credentials {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
}

.api-credentials h4 {
  margin-bottom: 10px;
  color: #333;
}

.api-credentials p {
  margin: 5px 0;
  font-family: monospace;
  background: white;
  padding: 5px 8px;
  border-radius: 4px;
}
</style>
