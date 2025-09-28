<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <router-link to="/" class="logo-link">
          <el-icon size="32" color="#409EFF">
            <Document />
          </el-icon>
          <span v-if="!sidebarCollapsed" class="logo-text">SimpleNotes</span>
        </router-link>
        <el-button
          class="collapse-btn"
          text
          @click="toggleSidebar"
        >
          <el-icon>
            <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
          </el-icon>
        </el-button>
      </div>

      <nav class="sidebar-nav">
        <el-menu
          :default-active="currentRoute"
          :collapse="sidebarCollapsed"
          :router="true"
          :unique-opened="true"
        >
          <el-menu-item index="/admin">
            <el-icon><DataBoard /></el-icon>
            <span>仪表板</span>
          </el-menu-item>

          <el-sub-menu index="documents">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>文档管理</span>
            </template>
            <el-menu-item index="/admin/documents">
              <el-icon><List /></el-icon>
              <span>文档列表</span>
            </el-menu-item>
            <el-menu-item index="/admin/documents/new">
              <el-icon><Plus /></el-icon>
              <span>新建文档</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>

          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </nav>

      <div class="sidebar-footer">
        <el-dropdown @command="handleUserMenuCommand">
          <div class="user-info">
            <el-avatar :size="sidebarCollapsed ? 32 : 40" :src="authStore.user?.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div v-if="!sidebarCollapsed" class="user-details">
              <div class="username">{{ authStore.user?.username }}</div>
              <div class="user-role">管理员</div>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="frontend" divided>
                <el-icon><Monitor /></el-icon>
                前台首页
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </aside>

    <!-- Main content -->
    <main class="admin-main" :class="{ expanded: sidebarCollapsed }">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              <router-link v-if="item.path" :to="item.path">
                {{ item.title }}
              </router-link>
              <span v-else>{{ item.title }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Dark mode toggle -->
          <el-switch
            v-model="isDark"
            @change="toggleDarkMode"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
          />

          <!-- Notifications -->
          <el-badge :value="12" :max="99" class="notification-badge">
            <el-button text @click="showNotifications = true">
              <el-icon size="18"><Bell /></el-icon>
            </el-button>
          </el-badge>

          <!-- Quick actions -->
          <el-dropdown @command="handleQuickAction">
            <el-button text>
              <el-icon size="18"><Plus /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="new-document">
                  <el-icon><Document /></el-icon>
                  新建文档
                </el-dropdown-item>
                <el-dropdown-item command="upload">
                  <el-icon><Upload /></el-icon>
                  上传文件
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- Content -->
      <div class="admin-content">
        <router-view />
      </div>
    </main>

    <!-- Notifications drawer -->
    <el-drawer
      v-model="showNotifications"
      title="通知"
      direction="rtl"
      size="320px"
    >
      <div class="notifications-content">
        <el-empty description="暂无新通知" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  DataBoard,
  List,
  Plus,
  User,
  Setting,
  Fold,
  Expand,
  Monitor,
  SwitchButton,
  Bell,
  Upload,
  Moon,
  Sunny
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const showNotifications = ref(false)
const isDark = ref(false)

// Computed properties
const currentRoute = computed(() => route.path)

const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const breadcrumbs = [{ title: '管理后台', path: '/admin' }]

  const routeMap = {
    'documents': '文档管理',
    'new': '新建文档',
    'edit': '编辑文档',
    'users': '用户管理',
    'settings': '系统设置'
  }

  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    const title = routeMap[segment] || segment
    
    if (i === pathSegments.length - 1) {
      breadcrumbs.push({ title, path: null })
    } else {
      const path = '/' + pathSegments.slice(0, i + 1).join('/')
      breadcrumbs.push({ title, path })
    }
  }

  return breadcrumbs
})

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('admin-sidebar-collapsed', sidebarCollapsed.value.toString())
}

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

const handleUserMenuCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'frontend':
      window.open('/', '_blank')
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
        router.push('/login')
      } catch (error) {
        // User cancelled
      }
      break
  }
}

const handleQuickAction = (command) => {
  switch (command) {
    case 'new-document':
      router.push('/admin/documents/new')
      break
    case 'upload':
      // Handle file upload
      ElMessage.info('文件上传功能开发中...')
      break
  }
}

// Initialize
const initializeAdmin = () => {
  // Load sidebar state
  const savedCollapsed = localStorage.getItem('admin-sidebar-collapsed')
  if (savedCollapsed !== null) {
    sidebarCollapsed.value = savedCollapsed === 'true'
  }

  // Load theme
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  toggleDarkMode()
}

onMounted(() => {
  initializeAdmin()
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.admin-sidebar {
  width: 260px;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 18px;
}

.logo-text {
  background: linear-gradient(45deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.collapse-btn {
  min-width: auto;
  padding: 8px;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.sidebar-nav .el-menu {
  border: none;
  background: transparent;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background: var(--el-bg-color-page);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.3s ease;
}

.admin-main.expanded {
  margin-left: 0;
}

.admin-header {
  height: 64px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  line-height: 1;
}

.admin-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: var(--el-bg-color-page);
}

.notifications-content {
  padding: 20px;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(0);
  }

  .admin-sidebar.collapsed {
    transform: translateX(-100%);
    width: 260px;
  }

  .admin-main {
    margin-left: 260px;
  }

  .admin-main.expanded {
    margin-left: 0;
  }

  .admin-header {
    padding: 0 16px;
  }

  .admin-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .sidebar-header {
    padding: 16px;
  }

  .sidebar-footer {
    padding: 16px;
  }

  .header-right {
    gap: 8px;
  }
}
</style>
