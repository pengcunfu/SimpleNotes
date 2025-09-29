<template>
  <div class="verify-email-page">
    <div class="verify-container">
      <div class="verify-card">
        <!-- Loading state -->
        <div v-if="loading" class="verify-content">
          <el-icon size="64" color="#409EFF" class="rotating">
            <Loading />
          </el-icon>
          <h2>正在验证邮箱...</h2>
          <p>请稍候，我们正在验证您的邮箱地址</p>
        </div>

        <!-- Success state -->
        <div v-else-if="verified" class="verify-content success">
          <el-icon size="64" color="#67C23A">
            <SuccessFilled />
          </el-icon>
          <h2>邮箱验证成功！</h2>
          <p>您的邮箱已成功验证，现在可以使用所有功能了</p>
          <div class="verify-actions">
            <el-button type="primary" size="large" @click="goToLogin">
              立即登录
            </el-button>
            <el-button size="large" @click="goHome">
              返回首页
            </el-button>
          </div>
        </div>

        <!-- Error state -->
        <div v-else class="verify-content error">
          <el-icon size="64" color="#F56C6C">
            <CircleClose />
          </el-icon>
          <h2>验证失败</h2>
          <p>{{ errorMessage }}</p>
          <div class="verify-actions">
            <el-button 
              type="primary" 
              size="large" 
              :loading="resending"
              @click="resendVerification"
            >
              重新发送验证邮件
            </el-button>
            <el-button size="large" @click="goToLogin">
              去登录
            </el-button>
          </div>
        </div>

        <!-- Tips -->
        <div class="verify-tips">
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>如果您没有收到验证邮件，请检查垃圾邮件文件夹，或者点击重新发送</p>
            </template>
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { 
  Loading, 
  SuccessFilled, 
  CircleClose 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const verified = ref(false)
const resending = ref(false)
const errorMessage = ref('')

const verifyEmail = async () => {
  const token = route.query.token

  if (!token) {
    loading.value = false
    errorMessage.value = '验证链接无效，缺少验证令牌'
    return
  }

  try {
    const result = await authStore.verifyEmail(token)
    
    if (result.success) {
      verified.value = true
      ElMessage.success('邮箱验证成功')
    } else {
      errorMessage.value = result.message || '验证失败，请重试'
    }
  } catch (error) {
    console.error('Email verification error:', error)
    errorMessage.value = '验证过程中出现错误，请重试'
  } finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再重新发送验证邮件')
    goToLogin()
    return
  }

  try {
    resending.value = true
    const result = await authStore.resendVerification()
    
    if (result.success) {
      ElMessage.success('验证邮件已重新发送，请检查您的邮箱')
    } else {
      ElMessage.error(result.message || '发送失败，请重试')
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    resending.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  verifyEmail()
})
</script>

<style scoped>
.verify-email-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.verify-container {
  width: 100%;
  max-width: 500px;
}

.verify-card {
  background: var(--el-bg-color);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.verify-content {
  text-align: center;
  margin-bottom: 30px;
}

.verify-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 20px 0 12px;
  color: var(--el-text-color-primary);
}

.verify-content p {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 30px;
}

.verify-content.success h2 {
  color: var(--el-color-success);
}

.verify-content.error h2 {
  color: var(--el-color-danger);
}

.verify-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.verify-tips {
  margin-top: 30px;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .verify-email-page {
    padding: 16px;
  }
  
  .verify-card {
    padding: 24px;
  }
  
  .verify-content h2 {
    font-size: 20px;
  }
  
  .verify-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
