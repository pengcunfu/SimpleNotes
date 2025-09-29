import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import views
import Home from '../views/Home.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import VerifyEmail from '../views/auth/VerifyEmail.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'
import Profile from '../views/user/Profile.vue'
import DocumentDetail from '../views/documents/DocumentDetail.vue'
import DocumentList from '../views/documents/DocumentList.vue'

// Admin views
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
// import AdminDocuments from '../views/admin/Documents.vue'
// import AdminDocumentEditor from '../views/admin/DocumentEditor.vue'
// import AdminUsers from '../views/admin/Users.vue'
// import AdminSettings from '../views/admin/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/documents',
    name: 'DocumentList',
    component: DocumentList,
    meta: { title: '文档列表' }
  },
  {
    path: '/documents/:slug',
    name: 'DocumentDetail',
    component: DocumentDetail,
    meta: { title: '文档详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '登录',
      requiresGuest: true 
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      title: '注册',
      requiresGuest: true 
    }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { title: '邮箱验证' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { 
      title: '忘记密码',
      requiresGuest: true 
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { 
      title: '重置密码',
      requiresGuest: true 
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      title: '个人资料',
      requiresAuth: true 
    }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true 
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { title: '管理后台' }
      },
      // {
      //   path: 'documents',
      //   name: 'AdminDocuments',
      //   component: AdminDocuments,
      //   meta: { title: '文档管理' }
      // },
      // {
      //   path: 'documents/new',
      //   name: 'AdminDocumentNew',
      //   component: AdminDocumentEditor,
      //   meta: { title: '新建文档' }
      // },
      // {
      //   path: 'documents/:id/edit',
      //   name: 'AdminDocumentEdit',
      //   component: AdminDocumentEditor,
      //   meta: { title: '编辑文档' }
      // },
      // {
      //   path: 'users',
      //   name: 'AdminUsers',
      //   component: AdminUsers,
      //   meta: { title: '用户管理' }
      // },
      // {
      //   path: 'settings',
      //   name: 'AdminSettings',
      //   component: AdminSettings,
      //   meta: { title: '系统设置' }
      // }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth store if not already done
  if (!authStore.user && authStore.token) {
    await authStore.getCurrentUser()
  }
  
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - SimpleNotes` : 'SimpleNotes'
  
  // Check authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check admin requirements
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' })
    return
  }
  
  // Check guest requirements (redirect authenticated users)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router
