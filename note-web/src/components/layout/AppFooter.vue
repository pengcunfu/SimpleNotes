<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>SimpleNotes</h4>
          <p>简单易用的 Markdown 文档管理系统</p>
          <div class="footer-links">
            <a href="#" class="footer-link">关于我们</a>
            <a href="#" class="footer-link">联系我们</a>
            <a href="#" class="footer-link">使用条款</a>
            <a href="#" class="footer-link">隐私政策</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>快速链接</h4>
          <div class="footer-links">
            <router-link to="/" class="footer-link">首页</router-link>
            <router-link to="/documents" class="footer-link">文档列表</router-link>
            <a href="#" class="footer-link">帮助中心</a>
            <a href="#" class="footer-link">API 文档</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>技术栈</h4>
          <div class="footer-links">
            <span class="footer-tech">Vue 3</span>
            <span class="footer-tech">Node.js</span>
            <span class="footer-tech">MongoDB</span>
            <span class="footer-tech">Minio</span>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; {{ currentYear }} SimpleNotes. All rights reserved.</p>
        </div>
        <div class="footer-social">
          <a href="#" class="social-link" title="GitHub">
            <el-icon size="18"><Link /></el-icon>
          </a>
          <a href="#" class="social-link" title="邮箱">
            <el-icon size="18"><Message /></el-icon>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { Link, Message } from '@element-plus/icons-vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h4 {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.footer-section p {
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--el-color-primary);
}

.footer-tech {
  color: var(--el-text-color-regular);
  font-size: 14px;
  background: var(--el-bg-color);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.footer-copyright p {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin: 0;
}

.footer-social {
  display: flex;
  gap: 16px;
}

.social-link {
  color: var(--el-text-color-regular);
  transition: color 0.3s ease;
}

.social-link:hover {
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .footer-container {
    padding: 30px 16px 20px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
