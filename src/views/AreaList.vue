<template>
  <div class="area-list-container">
    <h2>区域管理</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <button @click="handleAdd" class="btn-add">新增区域</button>
    </div>
    
    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <div class="stat-card">
        <div class="stat-label">总车位数</div>
        <div class="stat-value">{{ statistics.totalSpaces || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已占用</div>
        <div class="stat-value">{{ statistics.occupiedSpaces || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">可用</div>
        <div class="stat-value">{{ statistics.availableSpaces || 0 }}</div>
      </div>
    </div>
    
    <!-- 区域列表表格 -->
    <div>
      <table class="area-table" v-if="tableData.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>区域代码</th>
            <th>区域名称</th>
            <th>总车位数</th>
            <th>已占用</th>
            <th>预留</th>
            <th>状态</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.areaCode }}</td>
            <td>{{ item.areaName }}</td>
            <td>{{ item.totalSpaces }}</td>
            <td>{{ item.occupiedSpaces }}</td>
            <td>{{ item.reservedSpaces }}</td>
            <td>
              <span class="status-tag" :class="item.status === 1 ? 'status-active' : 'status-inactive'">
                {{ item.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ item.description || '-' }}</td>
            <td class="actions">
              <button @click="handleEdit(item)" class="btn-link">编辑</button>
              <button @click="handleDelete(item)" class="btn-link btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-tip">暂无区域数据</div>
    </div>
    
    <!-- 区域表单弹窗 -->
    <AreaForm
      v-if="showAreaForm"
      :areaData="currentArea"
      :isEdit="isEdit"
      @close="closeAreaForm"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
// 引入API方法
import { getAreaList, getAreaStatistics, deleteArea } from '@/utils/api'
// 引入区域表单组件
import AreaForm from './AreaForm.vue'

export default {
  name: 'AreaListPage',
  components: {
    AreaForm
  },
  data() {
    return {
      tableData: [],
      statistics: {},
      loading: false,
      showAreaForm: false,
      currentArea: null,
      isEdit: false
    }
  },
  created() {
    this.fetchAreaList()
    this.fetchStatistics()
  },
  methods: {
    // 获取区域列表
    fetchAreaList() {
      this.loading = true
      getAreaList()
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data || []
          }
        })
        .catch(err => {
          alert(err.message || '获取区域列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 获取统计数据
    fetchStatistics() {
      getAreaStatistics()
        .then(res => {
          if (res.code === 200) {
            this.statistics = res.data || {}
          }
        })
        .catch(err => {
          console.error('获取统计数据失败', err)
        })
    },
    
    // 新增区域
    handleAdd() {
      this.currentArea = null
      this.isEdit = false
      this.showAreaForm = true
    },
    
    // 编辑区域
    handleEdit(area) {
      this.currentArea = { ...area }
      this.isEdit = true
      this.showAreaForm = true
    },
    
    // 关闭区域表单弹窗
    closeAreaForm() {
      this.showAreaForm = false
      this.currentArea = null
    },
    
    // 表单提交成功
    handleFormSuccess() {
      this.closeAreaForm()
      this.fetchAreaList()
      this.fetchStatistics()
    },
    
    // 删除区域
    handleDelete(area) {
      if (!confirm(`确定要删除区域 "${area.areaName}" 吗？`)) {
        return
      }
      
      deleteArea(area.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchAreaList()
            this.fetchStatistics()
          } else {
            alert(res.message || '删除失败')
          }
        })
        .catch(err => {
          alert(err.message || '删除失败')
        })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.area-list-container {
  padding: 20px;
}

/* 标题 */
.area-list-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 统计卡片 */
.statistics-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  text-align: center;
}

.stat-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-item label {
  color: #333;
}

.search-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-add {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #67c23a;
  color: white;
}

.btn-add:disabled {
  background-color: #c8e6c9;
  cursor: not-allowed;
}

/* 表格样式 */
.area-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.area-table th,
.area-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.area-table th {
  background-color: #f5f7fa;
  font-weight: bold;
}

/* 状态标签 */
.status-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.status-active {
  background-color: #67c23a;
}

.status-inactive {
  background-color: #909399;
}

/* 操作按钮 */
.actions .btn-link {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  margin: 0 4px;
}

.actions .btn-link:hover {
  text-decoration: underline;
}

.actions .btn-danger {
  color: #f56c6c;
}

/* 加载和无数据 */
.loading-cell,
.empty-cell {
  text-align: center;
  color: #999;
  padding: 30px !important;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 40px;
  background: white;
  border-radius: 4px;
}
</style>
