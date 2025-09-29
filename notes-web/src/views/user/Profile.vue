<template>
  <div class="profile-page">
    <div class="profile-container">
      <el-row :gutter="24">
        <!-- User Info Card -->
        <el-col :span="24" :lg="8">
          <el-card class="profile-card">
            <div class="user-avatar">
              <el-avatar :size="80" :src="authStore.user?.avatar">
                <el-icon size="40"><User /></el-icon>
              </el-avatar>
              <el-button type="primary" text class="upload-btn">
                <el-icon><Upload /></el-icon>
                更换头像
              </el-button>
            </div>
            <div class="user-info">
              <h3>{{ authStore.user?.username }}</h3>
              <p>{{ authStore.user?.email }}</p>
              <el-tag :type="authStore.isEmailVerified ? 'success' : 'warning'" size="small">
                {{ authStore.isEmailVerified ? '已验证' : '未验证' }}
              </el-tag>
              <el-tag v-if="authStore.isAdmin" type="primary" size="small">
                管理员
              </el-tag>
            </div>
          </el-card>
        </el-col>

        <!-- Profile Form -->
        <el-col :span="24" :lg="16">
          <el-card class="profile-form-card">
            <template #header>
              <span>个人资料</span>
            </template>

            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              size="large"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="profileForm.username" />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" type="email" />
                <div v-if="!authStore.isEmailVerified" class="email-verification">
                  <el-text type="warning" size="small">
                    邮箱未验证
                  </el-text>
                  <el-button 
                    type="primary" 
                    text 
                    size="small"
                    :loading="resendingVerification"
                    @click="resendVerification"
                  >
                    重新发送验证邮件
                  </el-button>
                </div>
              </el-form-item>

              <el-form-item label="姓名" prop="firstName">
                <el-input v-model="profileForm.firstName" placeholder="名" />
              </el-form-item>

              <el-form-item label="姓氏" prop="lastName">
                <el-input v-model="profileForm.lastName" placeholder="姓" />
              </el-form-item>

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下自己..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  :loading="updateLoading"
                  @click="updateProfile"
                >
                  保存更改
                </el-button>
                <el-button @click="resetForm">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <!-- Change Password Section -->
      <el-row :gutter="24" style="margin-top: 24px;">
        <el-col :span="24">
          <el-card>
            <template #header>
              <span>修改密码</span>
            </template>

            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              size="large"
              style="max-width: 500px;"
            >
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  show-password
                />
              </el-form-item>

              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  show-password
                />
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  :loading="passwordLoading"
                  @click="changePassword"
                >
                  修改密码
                </el-button>
                <el-button @click="resetPasswordForm">
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { User, Upload } from '@element-plus/icons-vue'

const authStore = useAuthStore()

const profileFormRef = ref()
const passwordFormRef = ref()
const updateLoading = ref(false)
const passwordLoading = ref(false)
const resendingVerification = ref(false)

const profileForm = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  bio: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度应为3-30个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  firstName: [
    { max: 50, message: '姓名长度不能超过50个字符', trigger: 'blur' }
  ],
  lastName: [
    { max: 50, message: '姓氏长度不能超过50个字符', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含至少一个大写字母、一个小写字母和一个数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const loadProfile = () => {
  const user = authStore.user
  if (user) {
    profileForm.username = user.username || ''
    profileForm.email = user.email || ''
    profileForm.firstName = user.profile?.firstName || ''
    profileForm.lastName = user.profile?.lastName || ''
    profileForm.bio = user.profile?.bio || ''
  }
}

const updateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    updateLoading.value = true

    const result = await authStore.updateProfile({
      username: profileForm.username,
      email: profileForm.email,
      profile: {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        bio: profileForm.bio
      }
    })

    if (result.success) {
      ElMessage.success('个人资料更新成功')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Update profile error:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    updateLoading.value = false
  }
}

const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    passwordLoading.value = true

    const result = await authStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )

    if (result.success) {
      ElMessage.success('密码修改成功')
      resetPasswordForm()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Change password error:', error)
    ElMessage.error('修改失败，请重试')
  } finally {
    passwordLoading.value = false
  }
}

const resendVerification = async () => {
  try {
    resendingVerification.value = true
    const result = await authStore.resendVerification()

    if (result.success) {
      ElMessage.success('验证邮件已发送，请检查您的邮箱')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    resendingVerification.value = false
  }
}

const resetForm = () => {
  loadProfile()
  if (profileFormRef.value) {
    profileFormRef.value.clearValidate()
  }
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  text-align: center;
  height: fit-content;
}

.user-avatar {
  margin-bottom: 20px;
}

.upload-btn {
  display: block;
  margin: 12px auto 0;
}

.user-info h3 {
  margin: 12px 0 8px;
  color: var(--el-text-color-primary);
}

.user-info p {
  margin: 0 0 12px;
  color: var(--el-text-color-secondary);
}

.user-info .el-tag {
  margin: 4px;
}

.email-verification {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
}
</style>
