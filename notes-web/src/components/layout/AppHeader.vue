<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo and title -->
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <el-icon size="28" color="#409EFF">
            <Document />
          </el-icon>
          <span class="logo-text">SimpleNotes</span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="header-nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/documents" class="nav-link">文档</router-link>
      </nav>

      <!-- User menu -->
      <div class="header-right">
        <!-- Dark mode toggle -->
        <el-switch
          v-model="isDark"
          @change="toggleDarkMode"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          style="margin-right: 16px"
        />

        <!-- User menu -->
        <template v-if="authStore.isAuthenticated">
          <el-dropdown @command="handleUserMenuCommand">
            <span class="user-menu-trigger">
              <el-avatar :size="32" :src="authStore.user?.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ authStore.user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item v-if="authStore.isAdmin" command="admin" divided>
                  <el-icon><Setting /></el-icon>
                  管理后台
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><Switch /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- Email verification notice -->
          <el-badge 
            v-if="!authStore.isEmailVerified" 
            is-dot 
            class="verification-badge"
          >
            <el-tooltip content="邮箱未验证" placement="bottom">
              <el-button 
                type="warning" 
                size="small" 
                text
                @click="showVerificationDialog = true"
              >
                <el-icon><Warning /></el-icon>
              </el-button>
            </el-tooltip>
          </el-badge>
        </template>

        <!-- Login/Register buttons -->
        <template v-else>
          <el-button type="primary" plain @click="$router.push('/login')">
            登录
          </el-button>
          <el-button type="primary" @click="$router.push('/register')">
            注册
          </el-button>
        </template>

        <!-- Mobile menu toggle -->
        <el-button 
          class="mobile-menu-btn"
          text
          @click="showMobileMenu = true"
        >
          <el-icon size="20"><Menu /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- Mobile menu drawer -->
    <el-drawer
      v-model="showMobileMenu"
      direction="rtl"
      size="280px"
      title="菜单"
    >
      <div class="mobile-menu">
        <div class="mobile-nav">
          <router-link 
            to="/" 
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            <el-icon><House /></el-icon>
            首页
          </router-link>
          <router-link 
            to="/documents" 
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            <el-icon><Document /></el-icon>
            文档
          </router-link>
        </div>

        <el-divider />

        <div v-if="authStore.isAuthenticated" class="mobile-user-menu">
          <div class="mobile-user-info">
            <el-avatar :size="40" :src="authStore.user?.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="mobile-user-details">
              <div class="mobile-username">{{ authStore.user?.username }}</div>
              <div class="mobile-user-email">{{ authStore.user?.email }}</div>
            </div>
          </div>

          <div class="mobile-user-actions">
            <el-button 
              type="info" 
              plain 
              @click="handleUserMenuCommand('profile')"
            >
              <el-icon><User /></el-icon>
              个人资料
            </el-button>
            <el-button 
              v-if="authStore.isAdmin"
              type="primary" 
              plain 
              @click="handleUserMenuCommand('admin')"
            >
              <el-icon><Setting /></el-icon>
              管理后台
            </el-button>
            <el-button 
              type="danger" 
              plain 
              @click="handleUserMenuCommand('logout')"
            >
              <el-icon><Switch /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>

        <div v-else class="mobile-auth-buttons">
          <el-button type="primary" plain @click="$router.push('/login')">
            登录
          </el-button>
          <el-button type="primary" @click="$router.push('/register')">
            注册
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- Email verification dialog -->
    <el-dialog
      v-model="showVerificationDialog"
      title="邮箱验证"
      width="400px"
    >
      <div class="verification-content">
        <el-icon size="48" color="#E6A23C"><Warning /></el-icon>
        <p>您的邮箱尚未验证，请检查您的邮箱并点击验证链接。</p>
        <p>如果您没有收到验证邮件，可以重新发送。</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showVerificationDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="authStore.loading"
            @click="resendVerification"
          >
            重新发送
          </el-button>
        </div>
      </template>
    </el-dialog>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  User,
  ArrowDown,
  Setting,
  Switch,
  Warning,
  Menu,
  House,
  Moon,
  Sunny
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const showMobileMenu = ref(false)
const showVerificationDialog = ref(false)
const isDark = ref(false)

// Toggle dark mode
const toggleDarkMode = () => {
  const html = document.documentElement
  if (isDark.value) {
    html.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    html.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Initialize theme
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  toggleDarkMode()
}

// Initialize theme on component mount
initTheme()

// Handle user menu commands
const handleUserMenuCommand = async (command) => {
  showMobileMenu.value = false
  
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'admin':
      router.push('/admin')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '退出登录',
          {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          }
        )
        
        await authStore.logout()
        ElMessage.success('已退出登录')
        
        // Redirect to home if on protected route
        if (router.currentRoute.value.meta.requiresAuth) {
          router.push('/')
        }
      } catch (error) {
        // User cancelled
      }
      break
  }
}

// Resend email verification
const resendVerification = async () => {
  const result = await authStore.resendVerification()
  if (result.success) {
    ElMessage.success('验证邮件已发送，请检查您的邮箱')
    showVerificationDialog.value = false
  } else {
    ElMessage.error(result.message)
  }
}
</script>

<style scoped>
.app-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 18px;
}

.logo-text {
  margin-left: 8px;
  background: linear-gradient(45deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--el-text-color-primary);
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-menu-trigger:hover {
  background: var(--el-bg-color-page);
}

.username {
  font-weight: 500;
}

.verification-badge {
  margin-left: 8px;
}

.mobile-menu-btn {
  display: none;
}

.verification-content {
  text-align: center;
  padding: 20px 0;
}

.verification-content p {
  margin: 16px 0 8px;
  color: var(--el-text-color-regular);
}

.mobile-menu {
  padding: 20px 0;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--el-text-color-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.mobile-user-menu {
  padding: 16px 0;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 16px;
}

.mobile-user-details {
  flex: 1;
}

.mobile-username {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.mobile-user-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
  
  .header-nav {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .mobile-menu-btn {
    display: inline-flex;
  }
}

@media (max-width: 480px) {
  .header-container {
    height: 56px;
  }
  
  .logo-text {
    display: none;
  }
}
</style>
