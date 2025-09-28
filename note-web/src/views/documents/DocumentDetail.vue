<template>
  <div class="document-detail">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <el-result
        icon="error"
        title="文档加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="fetchDocument">重试</el-button>
          <el-button @click="$router.go(-1)">返回</el-button>
        </template>
      </el-result>
    </div>

    <!-- Document content -->
    <div v-else-if="document" class="document-container">
      <!-- Document header -->
      <header class="document-header">
        <div class="header-content">
          <!-- Breadcrumb -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>
              <router-link to="/">首页</router-link>
            </el-breadcrumb-item>
            <el-breadcrumb-item>
              <router-link to="/documents">文档</router-link>
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="document.category">
              {{ document.category }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ document.title }}</el-breadcrumb-item>
          </el-breadcrumb>

          <!-- Title -->
          <h1 class="document-title">{{ document.title }}</h1>

          <!-- Meta info -->
          <div class="document-meta">
            <div class="meta-left">
              <div v-if="document.author" class="author-info">
                <el-avatar 
                  :size="32" 
                  :src="document.author.avatar"
                >
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="author-details">
                  <div class="author-name">{{ document.author.username }}</div>
                  <div class="publish-date">
                    发布于 {{ formatDate(document.publishedAt || document.createdAt) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="meta-right">
              <div class="document-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ formatNumber(document.views) }} 次浏览</span>
                </div>
                <div class="stat-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ document.metadata?.readingTime || 1 }} 分钟阅读</span>
                </div>
                <div class="stat-item">
                  <el-button
                    :type="isLiked ? 'danger' : 'default'"
                    :icon="Heart"
                    @click="toggleLike"
                    :loading="likeLoading"
                    text
                  >
                    {{ document.likeCount || 0 }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="document.tags && document.tags.length > 0" class="document-tags">
            <el-tag 
              v-for="tag in document.tags" 
              :key="tag"
              type="primary"
              effect="plain"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </header>

      <!-- Document body -->
      <div class="document-body">
        <!-- Table of contents -->
        <aside v-if="headings.length > 0" class="toc-sidebar">
          <div class="toc-container">
            <h3 class="toc-title">目录</h3>
            <nav class="toc-nav">
              <a 
                v-for="heading in headings" 
                :key="heading.id"
                :href="`#${heading.id}`"
                :class="['toc-link', `toc-level-${heading.level}`]"
                @click="scrollToHeading(heading.id)"
              >
                {{ heading.text }}
              </a>
            </nav>
          </div>
        </aside>

        <!-- Main content -->
        <main class="document-main">
          <!-- Featured image -->
          <div v-if="document.featuredImage" class="featured-image">
            <img :src="document.featuredImage" :alt="document.title" />
          </div>

          <!-- Content -->
          <article 
            class="markdown-content" 
            v-html="htmlContent"
          ></article>

          <!-- Attachments -->
          <div v-if="document.attachments && document.attachments.length > 0" class="attachments-section">
            <h3>附件</h3>
            <div class="attachments-list">
              <div 
                v-for="attachment in document.attachments" 
                :key="attachment._id"
                class="attachment-item"
              >
                <el-icon><Paperclip /></el-icon>
                <a :href="attachment.url" :download="attachment.originalName" target="_blank">
                  {{ attachment.originalName }}
                </a>
                <span class="attachment-size">({{ formatFileSize(attachment.size) }})</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="document-actions">
            <el-button @click="$router.go(-1)">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <el-button 
              type="primary" 
              @click="shareDocument"
            >
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import axios from '../../utils/axios'
import { markdownToHtml, extractHeadings } from '../../utils/markdown'
import { 
  User, 
  View, 
  Clock, 
  Heart, 
  Paperclip, 
  ArrowLeft, 
  Share 
} from '@element-plus/icons-vue'

const route = useRoute()
const authStore = useAuthStore()

const document = ref(null)
const loading = ref(true)
const error = ref('')
const likeLoading = ref(false)
const isLiked = ref(false)

// Computed properties
const htmlContent = computed(() => {
  if (!document.value?.content) return ''
  return markdownToHtml(document.value.content)
})

const headings = computed(() => {
  if (!document.value?.content) return []
  return extractHeadings(document.value.content)
})

// Methods
const fetchDocument = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await axios.get(`/api/documents/${route.params.slug}`)
    document.value = response.data.document
    
    // Check if user has liked this document
    if (authStore.isAuthenticated) {
      checkLikeStatus()
    }
  } catch (err) {
    console.error('Failed to fetch document:', err)
    error.value = err.response?.data?.message || '获取文档失败'
  } finally {
    loading.value = false
  }
}

const checkLikeStatus = async () => {
  if (!document.value || !authStore.isAuthenticated) return
  
  try {
    const response = await axios.get(`/api/documents/${document.value._id}/likes`)
    const userLike = response.data.likes.find(
      like => like.user._id === authStore.user.id
    )
    isLiked.value = !!userLike
  } catch (error) {
    console.error('Failed to check like status:', error)
  }
}

const toggleLike = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再点赞')
    return
  }
  
  try {
    likeLoading.value = true
    const response = await axios.post(`/api/documents/${document.value._id}/like`)
    
    isLiked.value = response.data.isLiked
    document.value.likeCount = response.data.likeCount
    
    ElMessage.success(response.data.message)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    likeLoading.value = false
  }
}

const shareDocument = async () => {
  try {
    const url = window.location.href
    
    if (navigator.share) {
      await navigator.share({
        title: document.value.title,
        text: document.value.excerpt,
        url: url
      })
    } else {
      await navigator.clipboard.writeText(url)
      ElMessage.success('链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('Share failed:', error)
    ElMessage.error('分享失败')
  }
}

const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num || 0
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watch for route changes
watch(() => route.params.slug, () => {
  if (route.params.slug) {
    fetchDocument()
  }
})

onMounted(() => {
  fetchDocument()
})
</script>

<style scoped>
.document-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.document-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.document-header {
  padding: 40px 40px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.document-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 20px 0;
  line-height: 1.3;
}

.document-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.publish-date {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.document-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.document-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.document-body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  padding: 40px;
}

.toc-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.toc-container {
  background: var(--el-bg-color-page);
  padding: 20px;
  border-radius: 8px;
}

.toc-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-link {
  color: var(--el-text-color-secondary);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  padding: 4px 0;
  transition: color 0.3s ease;
}

.toc-link:hover {
  color: var(--el-color-primary);
}

.toc-level-1 {
  font-weight: 500;
}

.toc-level-2 {
  padding-left: 16px;
}

.toc-level-3 {
  padding-left: 32px;
}

.toc-level-4 {
  padding-left: 48px;
}

.document-main {
  min-width: 0;
}

.featured-image {
  margin-bottom: 32px;
  text-align: center;
}

.featured-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.attachments-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.attachments-section h3 {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
}

.attachment-item a {
  color: var(--el-color-primary);
  text-decoration: none;
  flex: 1;
}

.attachment-item a:hover {
  text-decoration: underline;
}

.attachment-size {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.document-actions {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .document-detail {
    padding: 16px;
  }
  
  .document-header {
    padding: 24px 24px 0;
  }
  
  .document-title {
    font-size: 24px;
  }
  
  .document-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .document-stats {
    gap: 16px;
  }
  
  .document-body {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 24px;
  }
  
  .toc-sidebar {
    order: 2;
    position: static;
  }
  
  .document-main {
    order: 1;
  }
}

@media (max-width: 480px) {
  .document-header {
    padding: 16px 16px 0;
  }
  
  .document-body {
    padding: 16px;
  }
  
  .document-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .document-actions {
    flex-direction: column;
  }
}
</style>
