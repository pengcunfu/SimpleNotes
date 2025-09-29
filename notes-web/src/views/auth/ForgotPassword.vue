<template>
  <div class="forgot-password-page">
    <div class="forgot-container">
      <div class="forgot-card">
        <!-- Header -->
        <div class="forgot-header">
          <el-icon size="48" color="#E6A23C">
            <Lock />
          </el-icon>
          <h1>忘记密码</h1>
          <p>输入您的邮箱地址，我们将发送重置密码的链接</p>
        </div>

        <!-- Success state -->
        <div v-if="emailSent" class="success-content">
          <el-result
            icon="success"
            title="邮件已发送"
            sub-title="请检查您的邮箱，按照邮件中的说明重置密码"
          >
            <template #extra>
              <el-button type="primary" @click="goToLogin">
                返回登录
              </el-button>
              <el-button @click="resetForm">
                重新发送
              </el-button>
            </template>
          </el-result>
        </div>

        <!-- Form state -->
        <div v-else>
          <el-form
            ref="forgotFormRef"
            :model="forgotForm"
            :rules="forgotRules"
            size="large"
            @submit.prevent="handleSubmit"
          >
            <el-form-item prop="email">
              <el-input
                v-model="forgotForm.email"
                type="email"
                placeholder="请输入您的邮箱地址"
                :prefix-icon="Message"
                autocomplete="email"
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
                发送重置邮件
              </el-button>
            </el-form-item>
          </el-form>

          <!-- Links -->
          <div class="forgot-links">
            <router-link to="/login" class="back-link">
              <el-icon><ArrowLeft /></el-icon>
              返回登录
            </router-link>
            <router-link to="/register" class="register-link">
              还没有账号？注册
            </router-link>
          </div>
        </div>

        <!-- Tips -->
        <div class="forgot-tips">
          <el-alert
            title="小贴士"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul>
                <li>重置邮件可能需要几分钟才能送达</li>
                <li>请检查您的垃圾邮件文件夹</li>
                <li>重置链接有效期为1小时</li>
              </ul>
            </template>
          </el-alert>
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
import { Lock, Message, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const forgotFormRef = ref()
const emailSent = ref(false)

const forgotForm = reactive({
  email: ''
})

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!forgotFormRef.value) return

  try {
    const valid = await forgotFormRef.value.validate()
    if (!valid) return

    const result = await authStore.forgotPassword(forgotForm.email)
    
    if (result.success) {
      emailSent.value = true
      ElMessage.success('重置邮件已发送')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    ElMessage.error('发送失败，请重试')
  }
}

const resetForm = () => {
  emailSent.value = false
  forgotForm.email = ''
  if (forgotFormRef.value) {
    forgotFormRef.value.resetFields()
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forgot-container {
  width: 100%;
  max-width: 450px;
}

.forgot-card {
  background: var(--el-bg-color);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.forgot-header {
  text-align: center;
  margin-bottom: 32px;
}

.forgot-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--el-text-color-primary);
}

.forgot-header p {
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.success-content {
  text-align: center;
}

.forgot-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  flex-wrap: wrap;
  gap: 12px;
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

.register-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}

.forgot-tips {
  margin-top: 30px;
}

.forgot-tips ul {
  margin: 0;
  padding-left: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.forgot-tips li {
  margin-bottom: 4px;
}

@media (max-width: 480px) {
  .forgot-password-page {
    padding: 16px;
  }
  
  .forgot-card {
    padding: 24px;
  }
  
  .forgot-header h1 {
    font-size: 20px;
  }
  
  .forgot-links {
    flex-direction: column;
    text-align: center;
  }
}
</style>
