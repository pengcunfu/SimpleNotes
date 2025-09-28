<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          欢迎使用 
          <span class="gradient-text">SimpleNotes</span>
        </h1>
        <p class="hero-subtitle">
          简单易用的 Markdown 文档管理系统，让您的知识管理更高效
        </p>
        <div class="hero-actions">
          <el-button 
            type="primary" 
            size="large"
            @click="$router.push('/documents')"
          >
            <el-icon><Document /></el-icon>
            浏览文档
          </el-button>
          <el-button 
            v-if="!authStore.isAuthenticated"
            size="large"
            @click="$router.push('/register')"
          >
            开始使用
          </el-button>
        </div>
      </div>
      <div class="hero-image">
        <el-icon size="200" color="#409EFF"><DocumentCopy /></el-icon>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">功能特色</h2>
        <p class="section-subtitle">为您的文档管理提供全方位的解决方案</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.id">
          <div class="feature-icon">
            <el-icon size="48" :color="feature.color">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Recent Documents Section -->
    <section v-if="recentDocuments.length > 0" class="recent-section">
      <div class="section-header">
        <h2 class="section-title">最新文档</h2>
        <el-button 
          type="primary" 
          text
          @click="$router.push('/documents')"
        >
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      
      <div class="documents-grid">
        <DocumentCard 
          v-for="document in recentDocuments" 
          :key="document._id"
          :document="document"
          @click="$router.push(`/documents/${document.slug}`)"
        />
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-if="!authStore.isAuthenticated" class="cta-section">
      <div class="cta-content">
        <h2>开始您的知识管理之旅</h2>
        <p>加入我们，体验更好的文档管理方式</p>
        <div class="cta-actions">
          <el-button 
            type="primary" 
            size="large"
            @click="$router.push('/register')"
          >
            立即注册
          </el-button>
          <el-button 
            size="large"
            @click="$router.push('/login')"
          >
            已有账号？登录
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from '../utils/axios'
import DocumentCard from '../components/documents/DocumentCard.vue'
import { 
  Document, 
  DocumentCopy, 
  ArrowRight,
  Edit,
  Upload,
  View,
  Share,
  Lock,
  CloudUpload
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

const recentDocuments = ref([])
const stats = ref([
  { label: '总文档数', value: '0' },
  { label: '总浏览量', value: '0' },
  { label: '注册用户', value: '0' }
])

const features = ref([
  {
    id: 1,
    icon: Edit,
    color: '#409EFF',
    title: 'Markdown 编辑',
    description: '支持完整的 Markdown 语法，提供实时预览功能'
  },
  {
    id: 2,
    icon: Upload,
    color: '#67C23A',
    title: '文件上传',
    description: '支持多种文件格式上传，包括图片、文档和附件'
  },
  {
    id: 3,
    icon: View,
    color: '#E6A23C',
    title: '文档管理',
    description: '强大的文档分类、标签和搜索功能'
  },
  {
    id: 4,
    icon: Share,
    color: '#F56C6C',
    title: '内容分享',
    description: '轻松分享您的文档，支持多种权限控制'
  },
  {
    id: 5,
    icon: Lock,
    color: '#909399',
    title: '安全可靠',
    description: '完善的用户认证和权限管理系统'
  },
  {
    id: 6,
    icon: CloudUpload,
    color: '#606266',
    title: '云端存储',
    description: '基于 Minio 的分布式文件存储系统'
  }
])

// 获取最新文档
const fetchRecentDocuments = async () => {
  try {
    const response = await axios.get('/api/documents?limit=6')
    recentDocuments.value = response.data.documents
  } catch (error) {
    console.error('获取最新文档失败:', error)
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取文档统计
    const docsResponse = await axios.get('/api/documents?limit=1')
    stats.value[0].value = docsResponse.data.pagination.total.toString()
    
    // 获取总浏览量（如果有相关API）
    // 这里可以添加更多统计数据的获取
    
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    fetchRecentDocuments(),
    fetchStats()
  ])
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  min-height: 600px;
  margin-bottom: 100px;
}

.hero-content {
  text-align: left;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  color: var(--el-text-color-primary);
}

.gradient-text {
  background: linear-gradient(45deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-image {
  text-align: center;
  opacity: 0.8;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.section-subtitle {
  font-size: 18px;
  color: var(--el-text-color-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.features-section {
  margin-bottom: 100px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 40px 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.feature-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-4px);
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.feature-description {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.recent-section {
  margin-bottom: 100px;
}

.recent-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.stats-section {
  margin-bottom: 100px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
}

.stat-card {
  text-align: center;
  padding: 40px 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
}

.stat-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.cta-section {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-success-light-9));
  border-radius: 16px;
  margin-bottom: 60px;
}

.cta-content h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.cta-content p {
  font-size: 18px;
  color: var(--el-text-color-secondary);
  margin-bottom: 40px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .home-page {
    padding: 0 16px;
  }
  
  .hero-section {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
    min-height: auto;
    margin-bottom: 60px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .recent-section .section-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .cta-section {
    padding: 60px 24px;
  }
  
  .cta-content h2 {
    font-size: 24px;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
