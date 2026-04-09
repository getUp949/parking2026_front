<template>
  <div class="community-list-container">
    <h2>小区管理</h2>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="searchForm.name" 
        type="text" 
        placeholder="输入小区名称搜索"
      />
      <input 
        v-model="searchForm.address" 
        type="text" 
        placeholder="输入地址搜索"
      />
      <select v-model="searchForm.status">
        <option value="">全部状态</option>
        <option :value="1">启用</option>
        <option :value="0">禁用</option>
      </select>
      <button @click="handleSearch" class="btn-search">搜索</button>
      <button @click="handleReset" class="btn-reset">重置</button>
      <button @click="handleAdd" class="btn-add">新增小区</button>
    </div>
    
    <!-- 小区列表表格 -->
    <table class="community-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>小区名称</th>
          <th>地址</th>
          <th>总面积(m²)</th>
          <th>楼栋数量</th>
          <th>状态</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!-- 加载中 -->
        <tr v-if="loading">
          <td colspan="8" class="loading-cell">加载中...</td>
        </tr>
        <!-- 无数据 -->
        <tr v-else-if="tableData.length === 0">
          <td colspan="8" class="empty-cell">暂无数据</td>
        </tr>
        <!-- 数据行 -->
        <tr v-else v-for="item in tableData" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.address || '-' }}</td>
          <td>{{ item.totalArea || '-' }}</td>
          <td>{{ item.buildingCount || '-' }}</td>
          <td>
            <span 
              class="status-tag" 
              :class="item.status === 1 ? 'status-active' : 'status-inactive'"
              @click="handleToggleStatus(item)"
            >
              {{ item.status === 1 ? '启用' : '禁用' }}
            </span>
          </td>
          <td>{{ item.createTime }}</td>
          <td class="actions">
            <button @click="handleEdit(item)" class="btn-link">编辑</button>
            <button @click="handleDelete(item)" class="btn-link btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- 分页 -->
    <div class="pagination">
      <div class="pagination-info">
        <span>共 {{ total }} 条</span>
        <span class="page-size-select">
          每页
          <select v-model.number="searchForm.pageSize" @change="handlePageSizeChange">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          条
        </span>
      </div>
      
      <div class="pagination-center">
        <button 
          @click="handlePageChange(1)" 
          :disabled="searchForm.pageNum <= 1"
        >
          首页
        </button>
        <button 
          @click="handlePageChange(searchForm.pageNum - 1)" 
          :disabled="searchForm.pageNum <= 1"
        >
          上一页
        </button>
        
        <span class="page-info">
          第
          <input 
            v-model.number="jumpPage" 
            type="number" 
            min="1" 
            :max="totalPage"
            @keyup.enter="handleJumpPage"
          />
          / {{ totalPage }} 页
        </span>
        
        <button 
          @click="handlePageChange(searchForm.pageNum + 1)" 
          :disabled="searchForm.pageNum >= totalPage"
        >
          下一页
        </button>
        <button 
          @click="handlePageChange(totalPage)" 
          :disabled="searchForm.pageNum >= totalPage"
        >
          末页
        </button>
      </div>
    </div>
    
    <!-- 小区表单弹窗 -->
    <CommunityForm
      v-if="showCommunityForm"
      :communityData="currentCommunity"
      :isEdit="isEdit"
      @close="closeCommunityForm"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
// 引入API方法
import { getCommunityList, updateCommunity, deleteCommunity } from '@/utils/api'
// 引入小区表单组件
import CommunityForm from './CommunityForm.vue'

export default {
  name: 'CommunityListPage',
  components: {
    CommunityForm
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        address: '',
        status: ''
      },
      // 跳转页码
      jumpPage: 1,
      // 表格数据
      tableData: [],
      // 总数据条数
      total: 0,
      // 加载状态
      loading: false,
      // 弹窗显示状态
      showCommunityForm: false,
      // 当前操作的小区
      currentCommunity: null,
      // 是否是编辑模式
      isEdit: false
    }
  },
  computed: {
    // 计算总页数
    totalPage() {
      return Math.ceil(this.total / this.searchForm.pageSize) || 1
    }
  },
  created() {
    // 组件创建时获取小区列表
    this.fetchCommunityList()
  },
  methods: {
    // 获取小区列表
    fetchCommunityList() {
      this.loading = true
      getCommunityList(this.searchForm)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
          }
        })
        .catch(err => {
          alert(err.message || '获取小区列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 搜索
    handleSearch() {
      this.searchForm.pageNum = 1
      this.jumpPage = 1
      this.fetchCommunityList()
    },
    
    // 重置搜索条件
    handleReset() {
      this.searchForm = {
        pageNum: 1,
        pageSize: 10,
        name: '',
        address: '',
        status: ''
      }
      this.jumpPage = 1
      this.fetchCommunityList()
    },
    
    // 翻页
    handlePageChange(page) {
      this.searchForm.pageNum = page
      this.jumpPage = page
      this.fetchCommunityList()
    },
    
    // 改变每页条数
    handlePageSizeChange() {
      this.searchForm.pageNum = 1
      this.jumpPage = 1
      this.fetchCommunityList()
    },
    
    // 跳转到指定页
    handleJumpPage() {
      let page = this.jumpPage
      // 校验输入的页码
      if (page < 1) page = 1
      if (page > this.totalPage) page = this.totalPage
      this.jumpPage = page
      this.handlePageChange(page)
    },
    
    // 新增小区
    handleAdd() {
      this.currentCommunity = null
      this.isEdit = false
      this.showCommunityForm = true
    },
    
    // 编辑小区
    handleEdit(community) {
      this.currentCommunity = { ...community }
      this.isEdit = true
      this.showCommunityForm = true
    },
    
    // 关闭小区表单弹窗
    closeCommunityForm() {
      this.showCommunityForm = false
      this.currentCommunity = null
    },
    
    // 表单提交成功
    handleFormSuccess() {
      this.closeCommunityForm()
      this.fetchCommunityList()
    },
    
    // 切换小区状态（启用/禁用）
    handleToggleStatus(community) {
      const newStatus = community.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      
      if (!confirm(`确定要${statusText}小区 "${community.name}" 吗？`)) {
        return
      }
      
      updateCommunity(community.id, { status: newStatus })
        .then(res => {
          if (res.code === 200) {
            alert('状态更新成功')
            this.fetchCommunityList()
          } else {
            alert(res.message || '操作失败')
          }
        })
        .catch(err => {
          alert(err.message || '操作失败')
        })
    },
    
    // 删除小区
    handleDelete(community) {
      if (!confirm(`确定要删除小区 "${community.name}" 吗？此操作不可恢复！`)) {
        return
      }
      
      deleteCommunity(community.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchCommunityList()
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
.community-list-container {
  padding: 20px;
}

/* 标题 */
.community-list-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-bar input,
.search-bar select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar input {
  width: 200px;
}

.search-bar select {
  width: 120px;
}

/* 按钮样式 */
.btn-search,
.btn-reset,
.btn-add {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-search {
  background-color: #409eff;
  color: white;
}

.btn-reset {
  background-color: #909399;
  color: white;
}

.btn-add {
  background-color: #67c23a;
  color: white;
  margin-left: auto;
}

/* 表格样式 */
.community-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.community-table th,
.community-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.community-table th {
  background-color: #f5f7fa;
  font-weight: bold;
}

/* 状态标签 */
.status-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  color: white;
}

.status-active { background-color: #67c23a; }
.status-inactive { background-color: #909399; }

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

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.pagination-info {
  color: #666;
}

.page-size-select {
  margin-left: 15px;
}

.page-size-select select {
  width: 60px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pagination-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-center button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination-center button:hover:not(:disabled) {
  background-color: #f5f7fa;
}

.pagination-center button:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
}

.page-info input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}
</style>
