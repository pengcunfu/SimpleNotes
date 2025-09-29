<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <!-- Logo and title -->
        <div class="register-header">
          <el-icon size="48" color="#409EFF">
            <User />
          </el-icon>
          <h1>注册 SimpleNotes</h1>
          <p>创建您的账号，开始使用 SimpleNotes</p>
        </div>

        <!-- Register form -->
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          size="large"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用户名"
              :prefix-icon="User"
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              type="email"
              placeholder="邮箱地址"
              :prefix-icon="Message"
              autocomplete="email"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              :prefix-icon="Lock"
              show-password
              autocomplete="new-password"
              @keyup.enter="handleRegister"
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="agreeTerms">
              我已阅读并同意
              <a href="#" class="terms-link">服务条款</a>
              和
              <a href="#" class="terms-link">隐私政策</a>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="authStore.loading"
              :disabled="!agreeTerms"
              @click="handleRegister"
              style="width: 100%"
            >
              注册账号
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Divider -->
        <el-divider>
          <span style="color: var(--el-text-color-placeholder)">或者</span>
        </el-divider>

        <!-- Login link -->
        <div class="login-link">
          已有账号？
          <router-link to="/login">立即登录</router-link>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { User, Message, Lock, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const registerFormRef = ref()
const agreeTerms = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度应为3-30个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含至少一个大写字母、一个小写字母和一个数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  if (!agreeTerms.value) {
    ElMessage.warning('请先同意服务条款和隐私政策')
    return
  }

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    const result = await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })
    
    if (result.success) {
      ElMessage.success('注册成功，请查看您的邮箱进行验证')
      router.push('/login')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Register error:', error)
    ElMessage.error('注册失败，请重试')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-card {
  background: var(--el-bg-color);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--el-text-color-primary);
}

.register-header p {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.terms-link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.login-link {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.login-link a {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
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
  .register-page {
    padding: 16px;
  }
  
  .register-card {
    padding: 24px;
  }
  
  .register-header h1 {
    font-size: 20px;
  }
}
</style>
