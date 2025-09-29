<template>
  <div class="document-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">文档列表</h1>
      <p class="page-subtitle">浏览所有已发布的文档</p>
    </div>

    <!-- Search and Filter -->
    <div class="search-section">
      <el-row :gutter="16">
        <el-col :span="24" :md="12">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文档标题或内容..."
            :prefix-icon="Search"
            size="large"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="12" :md="6">
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            size="large"
            clearable
            @change="handleFilter"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-col>
        <el-col :span="12" :md="6">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            size="large"
            @change="handleSort"
          >
            <el-option label="最新发布" value="publishedAt" />
            <el-option label="最多浏览" value="views" />
            <el-option label="最多点赞" value="likes" />
            <el-option label="标题排序" value="title" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- Document Grid -->
    <div class="documents-section">
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-container">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="fetchDocuments">重试</el-button>
          </template>
        </el-result>
      </div>

      <!-- Empty -->
      <div v-else-if="documents.length === 0" class="empty-container">
        <el-empty
          description="暂无文档"
          :image-size="120"
        >
          <template #description>
            <p>{{ searchQuery ? '没有找到匹配的文档' : '暂时还没有发布的文档' }}</p>
          </template>
        </el-empty>
      </div>

      <!-- Document List -->
      <div v-else class="documents-grid">
        <DocumentCard
          v-for="document in documents"
          :key="document._id"
          :document="document"
          @click="viewDocument(document.slug)"
        />
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Tags Cloud -->
    <div class="tags-section">
      <h3>热门标签</h3>
      <div class="tags-cloud">
        <el-tag
          v-for="tag in popularTags"
          :key="tag"
          type="info"
          effect="plain"
          class="tag-item"
          @click="searchByTag(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import axios from '../../utils/axios'
import DocumentCard from '../../components/documents/DocumentCard.vue'

const router = useRouter()

// Reactive data
const loading = ref(true)
const error = ref('')
const documents = ref([])
const categories = ref([])
const popularTags = ref([])

const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('publishedAt')
const currentPage = ref(1)
const pageSize = ref(20)

const pagination = reactive({
  total: 0,
  pages: 0,
  current: 1,
  limit: 20
})

// Methods
const fetchDocuments = async () => {
  try {
    loading.value = true
    error.value = ''

    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort: sortBy.value
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }

    const response = await axios.get('/api/documents', { params })
    
    documents.value = response.data.documents
    Object.assign(pagination, response.data.pagination)

    // Extract categories and tags
    extractCategoriesAndTags()

  } catch (err) {
    console.error('Failed to fetch documents:', err)
    error.value = err.response?.data?.message || '获取文档列表失败'
  } finally {
    loading.value = false
  }
}

const extractCategoriesAndTags = () => {
  const categorySet = new Set()
  const tagSet = new Set()

  documents.value.forEach(doc => {
    if (doc.category) {
      categorySet.add(doc.category)
    }
    if (doc.tags) {
      doc.tags.forEach(tag => tagSet.add(tag))
    }
  })

  categories.value = Array.from(categorySet).sort()
  popularTags.value = Array.from(tagSet).slice(0, 20) // Show top 20 tags
}

const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchDocuments()
}, 300)

const handleFilter = () => {
  currentPage.value = 1
  fetchDocuments()
}

const handleSort = () => {
  currentPage.value = 1
  fetchDocuments()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchDocuments()
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchDocuments()
}

const viewDocument = (slug) => {
  router.push(`/documents/${slug}`)
}

const searchByTag = (tag) => {
  searchQuery.value = tag
  handleSearch()
}

// Debounce utility
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Watch for route query changes
watch(() => router.currentRoute.value.query, (newQuery) => {
  if (newQuery.search) {
    searchQuery.value = newQuery.search
  }
  if (newQuery.category) {
    selectedCategory.value = newQuery.category
  }
}, { immediate: true })

onMounted(() => {
  fetchDocuments()
})
</script>

<style scoped>
.document-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.search-section {
  margin-bottom: 32px;
}

.documents-section {
  margin-bottom: 40px;
}

.loading-container {
  padding: 40px 0;
}

.error-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.tags-section {
  background: var(--el-bg-color-page);
  padding: 24px;
  border-radius: 12px;
}

.tags-section h3 {
  margin: 0 0 16px;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 500;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .document-list-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .documents-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .search-section .el-row .el-col {
    margin-bottom: 12px;
  }
}
</style>
