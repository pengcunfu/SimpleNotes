<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Logo and title -->
        <div class="login-header">
          <el-icon size="48" color="#409EFF">
            <Document />
          </el-icon>
          <h1>登录 SimpleNotes</h1>
          <p>欢迎回来，请登录您的账号</p>
        </div>

        <!-- Login form -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          size="large"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              type="email"
              placeholder="邮箱地址"
              :prefix-icon="Message"
              autocomplete="email"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <router-link to="/forgot-password" class="forgot-link">
                忘记密码？
              </router-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="authStore.loading"
              @click="handleLogin"
              style="width: 100%"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Divider -->
        <el-divider>
          <span style="color: var(--el-text-color-placeholder)">或者</span>
        </el-divider>

        <!-- Register link -->
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>

        <!-- Back to home -->
        <div class="back-home">
          <router-link to="/">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { Document, Message, Lock, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginFormRef = ref()
const rememberMe = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    const result = await authStore.login(loginForm)
    
    if (result.success) {
      ElMessage.success('登录成功')
      
      // Redirect to intended page or home
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('登录失败，请重试')
  }
}

// Auto-fill demo credentials in development
onMounted(() => {
  if (import.meta.env.DEV) {
    // You can pre-fill demo credentials here if needed
    // loginForm.email = 'admin@example.com'
    // loginForm.password = 'password123'
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: var(--el-bg-color);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--el-text-color-primary);
}

.login-header p {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.login-options {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.register-link {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.register-link a {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.back-home {
  text-align: center;
  margin-top: 24px;
}

.back-home a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.back-home a:hover {
  color: var(--el-color-primary);
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .login-card {
    padding: 24px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
}
</style>
