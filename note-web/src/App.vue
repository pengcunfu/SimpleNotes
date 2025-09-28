<template>
  <div class="app-container">
    <!-- Navigation -->
    <AppHeader v-if="!isAdminRoute" />
    
    <!-- Main content -->
    <main class="main-content" :class="{ 'admin-content': isAdminRoute }">
      <router-view />
    </main>
    
    <!-- Footer -->
    <AppFooter v-if="!isAdminRoute" />
    
    <!-- Loading overlay -->
    <el-loading 
      v-loading="globalLoading" 
      element-loading-text="加载中..."
      element-loading-background="rgba(0, 0, 0, 0.7)"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const route = useRoute()
const authStore = useAuthStore()

const globalLoading = ref(false)

// Check if current route is admin route
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

// Initialize app
onMounted(async () => {
  try {
    globalLoading.value = true
    
    // Initialize auth store
    await authStore.initialize()
    
    // Add any other initialization logic here
    
  } catch (error) {
    console.error('App initialization error:', error)
  } finally {
    globalLoading.value = false
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.admin-content {
  max-width: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .admin-content {
    padding: 0;
  }
}
</style>
