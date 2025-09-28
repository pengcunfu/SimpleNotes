<template>
  <div class="admin-dashboard">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">仪表板</h1>
      <p class="page-subtitle">欢迎回来，{{ authStore.user?.username }}！</p>
    </div>

    <!-- Stats cards -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.title">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
          <el-icon size="24">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-change" :class="stat.changeType">
            <el-icon size="12">
              <component :is="stat.changeType === 'increase' ? 'TrendCharts' : 'Bottom'" />
            </el-icon>
            <span>{{ stat.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and recent activity -->
    <div class="dashboard-content">
      <div class="content-left">
        <!-- Recent documents -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>最近文档</h3>
            <el-button type="primary" text @click="$router.push('/admin/documents')">
              查看全部
            </el-button>
          </div>
          <div class="card-content">
            <div v-if="recentDocuments.length === 0" class="empty-state">
              <el-empty description="暂无文档" />
            </div>
            <div v-else class="documents-list">
              <div 
                v-for="doc in recentDocuments" 
                :key="doc._id"
                class="document-item"
                @click="$router.push(`/admin/documents/${doc._id}/edit`)"
              >
                <div class="document-info">
                  <div class="document-title">{{ doc.title }}</div>
                  <div class="document-meta">
                    <el-tag :type="getStatusType(doc.status)" size="small">
                      {{ getStatusText(doc.status) }}
                    </el-tag>
                    <span class="document-date">
                      {{ formatDate(doc.updatedAt) }}
                    </span>
                  </div>
                </div>
                <div class="document-stats">
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span>{{ doc.views || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Heart /></el-icon>
                    <span>{{ doc.likeCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity chart -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>文档发布趋势</h3>
            <el-select v-model="chartPeriod" size="small" style="width: 120px">
              <el-option label="最近7天" value="7d" />
              <el-option label="最近30天" value="30d" />
              <el-option label="最近90天" value="90d" />
            </el-select>
          </div>
          <div class="card-content">
            <div class="chart-placeholder">
              <el-icon size="64" color="#909399"><TrendCharts /></el-icon>
              <p>图表功能开发中...</p>
            </div>
          </div>
        </div>
      </div>

      <div class="content-right">
        <!-- Quick actions -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>快速操作</h3>
          </div>
          <div class="card-content">
            <div class="quick-actions">
              <el-button 
                type="primary" 
                size="large"
                @click="$router.push('/admin/documents/new')"
                style="width: 100%"
              >
                <el-icon><Plus /></el-icon>
                新建文档
              </el-button>
              <el-button 
                size="large"
                @click="showUploadDialog = true"
                style="width: 100%"
              >
                <el-icon><Upload /></el-icon>
                上传文档
              </el-button>
              <el-button 
                size="large"
                @click="$router.push('/admin/users')"
                style="width: 100%"
              >
                <el-icon><User /></el-icon>
                用户管理
              </el-button>
            </div>
          </div>
        </div>

        <!-- System info -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>系统信息</h3>
          </div>
          <div class="card-content">
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">服务器状态</span>
                <el-tag type="success" size="small">正常</el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">数据库状态</span>
                <el-tag type="success" size="small">连接正常</el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">存储状态</span>
                <el-tag type="success" size="small">正常</el-tag>
              </div>
              <div class="info-item">
                <span class="info-label">系统版本</span>
                <span class="info-value">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent users -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>新用户</h3>
            <el-button type="primary" text @click="$router.push('/admin/users')">
              查看全部
            </el-button>
          </div>
          <div class="card-content">
            <div v-if="recentUsers.length === 0" class="empty-state">
              <el-empty description="暂无新用户" />
            </div>
            <div v-else class="users-list">
              <div 
                v-for="user in recentUsers" 
                :key="user._id"
                class="user-item"
              >
                <el-avatar :size="32" :src="user.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="user-info">
                  <div class="user-name">{{ user.username }}</div>
                  <div class="user-date">{{ formatDate(user.createdAt) }}</div>
                </div>
                <el-tag 
                  :type="user.isEmailVerified ? 'success' : 'warning'" 
                  size="small"
                >
                  {{ user.isEmailVerified ? '已验证' : '未验证' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload dialog -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文档"
      width="500px"
    >
      <UploadDocument @success="handleUploadSuccess" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from '../../utils/axios'
import { ElMessage } from 'element-plus'
import {
  Document,
  User,
  View,
  Heart,
  Plus,
  Upload,
  TrendCharts,
  Bottom
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

const stats = ref([
  {
    title: '总文档数',
    value: '0',
    change: '+12%',
    changeType: 'increase',
    color: '#409EFF',
    icon: Document
  },
  {
    title: '总用户数',
    value: '0',
    change: '+8%',
    changeType: 'increase',
    color: '#67C23A',
    icon: User
  },
  {
    title: '总浏览量',
    value: '0',
    change: '+23%',
    changeType: 'increase',
    color: '#E6A23C',
    icon: View
  },
  {
    title: '总点赞数',
    value: '0',
    change: '+15%',
    changeType: 'increase',
    color: '#F56C6C',
    icon: Heart
  }
])

const recentDocuments = ref([])
const recentUsers = ref([])
const chartPeriod = ref('7d')
const showUploadDialog = ref(false)

// Methods
const fetchDashboardData = async () => {
  try {
    // Fetch document stats
    const docStatsResponse = await axios.get('/api/documents/admin/stats')
    const docStats = docStatsResponse.data.stats

    // Update stats
    stats.value[0].value = docStats.total.toString()
    stats.value[2].value = docStats.totalViews.toString()
    stats.value[3].value = docStats.totalLikes.toString()

    // Fetch user stats
    const userStatsResponse = await axios.get('/api/users/admin/stats')
    const userStats = userStatsResponse.data.stats
    stats.value[1].value = userStats.total.toString()

    // Fetch recent documents
    const docsResponse = await axios.get('/api/documents?limit=5')
    recentDocuments.value = docsResponse.data.documents

    // Fetch recent users
    const usersResponse = await axios.get('/api/users?limit=5')
    recentUsers.value = usersResponse.data.users

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    ElMessage.error('获取仪表板数据失败')
  }
}

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
      month: 'short',
      day: 'numeric'
    })
  }
}

const handleUploadSuccess = () => {
  showUploadDialog.value = false
  fetchDashboardData()
  ElMessage.success('文档上传成功')
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--el-bg-color);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: var(--el-box-shadow);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-title {
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-change.increase {
  color: var(--el-color-success);
}

.stat-change.decrease {
  color: var(--el-color-danger);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.content-left,
.content-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card-content {
  padding: 24px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.documents-list,
.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.document-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-item:hover {
  background: var(--el-color-primary-light-9);
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.document-date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.document-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.info-value {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}

.chart-placeholder {
  text-align: center;
  padding: 60px 20px;
  color: var(--el-text-color-placeholder);
}

.chart-placeholder p {
  margin-top: 16px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .card-header {
    padding: 16px;
  }
}
</style>
