<template>
  <div class="document-card" @click="$emit('click')">
    <!-- Featured image -->
    <div v-if="document.featuredImage" class="document-image">
      <img :src="document.featuredImage" :alt="document.title" />
    </div>
    
    <!-- Content -->
    <div class="document-content">
      <!-- Status badge -->
      <div v-if="showStatus && document.status !== 'published'" class="document-status">
        <el-tag 
          :type="getStatusType(document.status)" 
          size="small"
        >
          {{ getStatusText(document.status) }}
        </el-tag>
      </div>
      
      <!-- Title -->
      <h3 class="document-title">{{ document.title }}</h3>
      
      <!-- Excerpt -->
      <p v-if="document.excerpt" class="document-excerpt">
        {{ document.excerpt }}
      </p>
      
      <!-- Tags -->
      <div v-if="document.tags && document.tags.length > 0" class="document-tags">
        <el-tag 
          v-for="tag in document.tags.slice(0, 3)" 
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
        <span v-if="document.tags.length > 3" class="tags-more">
          +{{ document.tags.length - 3 }}
        </span>
      </div>
      
      <!-- Meta information -->
      <div class="document-meta">
        <div class="meta-left">
          <!-- Author -->
          <div v-if="document.author" class="document-author">
            <el-avatar 
              :size="20" 
              :src="document.author.avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <span>{{ document.author.username }}</span>
          </div>
          
          <!-- Category -->
          <div v-if="document.category" class="document-category">
            <el-icon><Folder /></el-icon>
            <span>{{ document.category }}</span>
          </div>
        </div>
        
        <div class="meta-right">
          <!-- Date -->
          <div class="document-date">
            <el-icon><Calendar /></el-icon>
            <span>{{ formatDate(document.publishedAt || document.createdAt) }}</span>
          </div>
          
          <!-- Stats -->
          <div class="document-stats">
            <div v-if="document.views > 0" class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ formatNumber(document.views) }}</span>
            </div>
            <div v-if="document.likeCount > 0" class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ formatNumber(document.likeCount) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Reading time -->
      <div v-if="document.metadata?.readingTime" class="reading-time">
        <el-icon><Clock /></el-icon>
        <span>{{ document.metadata.readingTime }} 分钟阅读</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  User, 
  Folder, 
  Calendar, 
  View, 
  Star, 
  Clock 
} from '@element-plus/icons-vue'

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  showStatus: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

// Status helpers
const getStatusType = (status) => {
  const types = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return texts[status] || status
}

// Date formatting
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// Number formatting
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.document-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.document-card:hover {
  box-shadow: var(--el-box-shadow);
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-2px);
}

.document-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.document-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.document-card:hover .document-image img {
  transform: scale(1.05);
}

.document-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.document-status {
  margin-bottom: 12px;
}

.document-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-excerpt {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.document-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tags-more {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.document-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.meta-left,
.meta-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-author,
.document-category,
.document-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.document-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.reading-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .document-content {
    padding: 16px;
  }
  
  .document-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .meta-left,
  .meta-right {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .document-stats {
    gap: 8px;
  }
}
</style>
