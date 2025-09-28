<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-content">
        <!-- 404 Icon -->
        <div class="error-icon">
          <el-icon size="120" color="#E6A23C">
            <WarningFilled />
          </el-icon>
        </div>

        <!-- Error message -->
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">页面不存在</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被删除。
        </p>

        <!-- Actions -->
        <div class="error-actions">
          <el-button type="primary" size="large" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上页
          </el-button>
        </div>

        <!-- Suggestions -->
        <div class="suggestions">
          <p class="suggestions-title">您可以尝试：</p>
          <ul class="suggestions-list">
            <li>检查网址是否正确</li>
            <li>
              <router-link to="/documents">浏览文档列表</router-link>
            </li>
            <li>
              <router-link to="/">回到首页</router-link>
            </li>
            <li v-if="!authStore.isAuthenticated">
              <router-link to="/login">登录账号</router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Decorative elements -->
      <div class="decoration">
        <div class="floating-docs">
          <el-icon v-for="i in 6" :key="i" class="floating-doc" :style="getFloatingStyle(i)">
            <Document />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { WarningFilled, HomeFilled, ArrowLeft, Document } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}

const getFloatingStyle = (index) => {
  const positions = [
    { top: '10%', left: '10%', animationDelay: '0s' },
    { top: '20%', right: '15%', animationDelay: '1s' },
    { top: '45%', left: '5%', animationDelay: '2s' },
    { bottom: '30%', right: '10%', animationDelay: '3s' },
    { bottom: '20%', left: '20%', animationDelay: '4s' },
    { top: '60%', right: '25%', animationDelay: '5s' }
  ]
  
  return positions[index - 1] || {}
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.not-found-container {
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.not-found-content {
  background: var(--el-bg-color);
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
}

.error-icon {
  margin-bottom: 30px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.error-title {
  font-size: 72px;
  font-weight: 900;
  color: var(--el-color-warning);
  margin-bottom: 20px;
  background: linear-gradient(45deg, #E6A23C, #F56C6C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-subtitle {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.error-description {
  font-size: 18px;
  color: var(--el-text-color-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.suggestions {
  text-align: left;
  background: var(--el-bg-color-page);
  padding: 24px;
  border-radius: 12px;
  margin-top: 30px;
}

.suggestions-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions-list li {
  padding: 8px 0;
  color: var(--el-text-color-secondary);
  position: relative;
  padding-left: 20px;
}

.suggestions-list li::before {
  content: '•';
  color: var(--el-color-primary);
  position: absolute;
  left: 0;
  font-weight: bold;
}

.suggestions-list a {
  color: var(--el-color-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.suggestions-list a:hover {
  color: var(--el-color-primary-dark-2);
  text-decoration: underline;
}

.decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.floating-docs {
  position: relative;
  width: 100%;
  height: 100%;
}

.floating-doc {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  font-size: 40px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@media (max-width: 768px) {
  .not-found-page {
    padding: 16px;
  }
  
  .not-found-content {
    padding: 40px 24px;
  }
  
  .error-title {
    font-size: 48px;
  }
  
  .error-subtitle {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 16px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .suggestions {
    text-align: center;
  }
  
  .suggestions-list {
    text-align: left;
    display: inline-block;
  }
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 30px 20px;
  }
  
  .error-title {
    font-size: 36px;
  }
  
  .error-subtitle {
    font-size: 20px;
  }
}
</style>
