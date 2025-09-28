import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '../utils/axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEmailVerified = computed(() => user.value?.isEmailVerified)

  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const login = async (credentials) => {
    try {
      loading.value = true
      const response = await axios.post('/api/auth/login', credentials)
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登录失败'
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      const response = await axios.post('/api/auth/register', userData)
      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '注册失败'
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await axios.post('/api/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  const getCurrentUser = async () => {
    if (!token.value) return

    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data.user)
      return { success: true, data: response.data }
    } catch (error) {
      // Token might be invalid, clear it
      setToken(null)
      setUser(null)
      return {
        success: false,
        message: error.response?.data?.message || '获取用户信息失败'
      }
    }
  }

  const verifyEmail = async (token) => {
    try {
      loading.value = true
      const response = await axios.get(`/api/auth/verify-email?token=${token}`)
      
      // Refresh user data
      await getCurrentUser()
      
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '邮箱验证失败'
      }
    } finally {
      loading.value = false
    }
  }

  const resendVerification = async () => {
    try {
      loading.value = true
      const response = await axios.post('/api/auth/resend-verification')
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '发送验证邮件失败'
      }
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email) => {
    try {
      loading.value = true
      const response = await axios.post('/api/auth/forgot-password', { email })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '发送重置邮件失败'
      }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (token, password) => {
    try {
      loading.value = true
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '重置密码失败'
      }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/users/${user.value.id}`, profileData)
      setUser(response.data.user)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新个人资料失败'
      }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      loading.value = true
      const response = await axios.put(`/api/users/${user.value.id}/password`, {
        currentPassword,
        newPassword
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '修改密码失败'
      }
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  const initialize = async () => {
    if (token.value) {
      setToken(token.value) // Set axios header
      await getCurrentUser()
    }
  }

  return {
    // State
    user,
    token,
    loading,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isEmailVerified,
    
    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    initialize,
    setToken,
    setUser
  }
})
