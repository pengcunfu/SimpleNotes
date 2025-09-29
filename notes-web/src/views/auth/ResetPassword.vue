<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <div class="reset-card">
        <!-- Header -->
        <div class="reset-header">
          <el-icon size="48" color="#67C23A">
            <Lock />
          </el-icon>
          <h1>重置密码</h1>
          <p>请输入您的新密码</p>
        </div>

        <!-- Success state -->
        <div v-if="resetSuccess" class="success-content">
          <el-result
            icon="success"
            title="密码重置成功"
            sub-title="您的密码已成功重置，请使用新密码登录"
          >
            <template #extra>
              <el-button type="primary" size="large" @click="goToLogin">
                立即登录
              </el-button>
            </template>
          </el-result>
        </div>

        <!-- Form state -->
        <div v-else>
          <!-- Invalid token state -->
          <div v-if="invalidToken" class="error-content">
            <el-result
              icon="error"
              title="重置链接无效"
              sub-title="重置链接已过期或无效，请重新申请密码重置"
            >
              <template #extra>
                <el-button type="primary" @click="goToForgotPassword">
                  重新申请
                </el-button>
                <el-button @click="goToLogin">
                  返回登录
                </el-button>
              </template>
            </el-result>
          </div>

          <!-- Reset form -->
          <div v-else>
            <el-form
              ref="resetFormRef"
              :model="resetForm"
              :rules="resetRules"
              size="large"
              @submit.prevent="handleSubmit"
            >
              <el-form-item prop="password">
                <el-input
                  v-model="resetForm.password"
                  type="password"
                  placeholder="新密码"
                  :prefix-icon="Lock"
                  show-password
                  autocomplete="new-password"
                />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="resetForm.confirmPassword"
                  type="password"
                  placeholder="确认新密码"
                  :prefix-icon="Lock"
                  show-password
                  autocomplete="new-password"
                  @keyup.enter="handleSubmit"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="authStore.loading"
                  @click="handleSubmit"
                  style="width: 100%"
                >
                  重置密码
                </el-button>
              </el-form-item>
            </el-form>

            <!-- Links -->
            <div class="reset-links">
              <router-link to="/login" class="back-link">
                <el-icon><ArrowLeft /></el-icon>
                返回登录
              </router-link>
            </div>
          </div>
        </div>

        <!-- Password requirements -->
        <div v-if="!resetSuccess && !invalidToken" class="password-requirements">
          <el-alert
            title="密码要求"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul>
                <li>至少6个字符</li>
                <li>包含至少一个大写字母</li>
                <li>包含至少一个小写字母</li>
                <li>包含至少一个数字</li>
              </ul>
            </template>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { Lock, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const resetFormRef = ref()
const resetSuccess = ref(false)
const invalidToken = ref(false)

const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含至少一个大写字母、一个小写字母和一个数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!resetFormRef.value) return

  try {
    const valid = await resetFormRef.value.validate()
    if (!valid) return

    const token = route.query.token
    if (!token) {
      invalidToken.value = true
      return
    }

    const result = await authStore.resetPassword(token, resetForm.password)
    
    if (result.success) {
      resetSuccess.value = true
      ElMessage.success('密码重置成功')
    } else {
      if (result.message.includes('无效') || result.message.includes('过期')) {
        invalidToken.value = true
      }
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Reset password error:', error)
    ElMessage.error('重置失败，请重试')
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

onMounted(() => {
  const token = route.query.token
  if (!token) {
    invalidToken.value = true
  }
})
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.reset-container {
  width: 100%;
  max-width: 450px;
}

.reset-card {
  background: var(--el-bg-color);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.reset-header {
  text-align: center;
  margin-bottom: 32px;
}

.reset-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--el-text-color-primary);
}

.reset-header p {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.success-content,
.error-content {
  text-align: center;
}

.reset-links {
  text-align: center;
  margin-top: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: var(--el-color-primary);
}

.password-requirements {
  margin-top: 30px;
}

.password-requirements ul {
  margin: 0;
  padding-left: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.password-requirements li {
  margin-bottom: 4px;
}

@media (max-width: 480px) {
  .reset-password-page {
    padding: 16px;
  }
  
  .reset-card {
    padding: 24px;
  }
  
  .reset-header h1 {
    font-size: 20px;
  }
}
</style>
