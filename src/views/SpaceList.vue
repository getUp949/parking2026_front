<template>
  <div class="space-list-container">
    <h2>车位管理</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-item">
        <label>选择区域：</label>
        <select v-model="searchForm.areaId" @change="handleAreaChange">
          <option value="">请选择区域</option>
          <option v-for="area in areaList" :key="area.id" :value="area.id">
            {{ area.areaName }}
          </option>
        </select>
      </div>
      
      <button @click="handleAdd" class="btn-add" :disabled="!searchForm.areaId">新增车位</button>
    </div>
    
    <!-- 统计信息 -->
    <div class="info-bar" v-if="searchForm.areaId">
      <span>区域：{{ currentAreaName }}</span>
      <span>可用车位：{{ availableCount }}</span>
    </div>
    
    <!-- 未选择提示 -->
    <div v-if="!searchForm.areaId && areaList.length === 0" class="empty-tip">暂无区域，请先添加区域</div>
    <div v-else-if="!searchForm.areaId" class="empty-tip">请先选择区域</div>
    
    <!-- 车位列表表格 -->
    <div v-else-if="searchForm.areaId">
      <table class="space-table" v-if="tableData.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>车位编号</th>
            <th>所属区域</th>
            <th>位置</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.spaceNumber }}</td>
            <td>{{ currentAreaName }}</td>
            <td>{{ item.position || '-' }}</td>
            <td>
              <span class="status-tag" :class="'status-' + item.status">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td class="actions">
              <button @click="handleEdit(item)" class="btn-link">编辑</button>
              <button @click="handleDelete(item)" class="btn-link btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-tip">暂无车位数据</div>
    </div>
    
    <!-- 车位表单弹窗 -->
    <SpaceForm
      v-if="showSpaceForm"
      :spaceData="currentSpace"
      :areaList="areaList"
      :isEdit="isEdit"
      @close="closeSpaceForm"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
// 引入API方法
import { getSpaceList, getAreaList, getAvailableCount, deleteSpace } from '@/utils/api'
// 引入车位表单组件
import SpaceForm from './SpaceForm.vue'

export default {
  name: 'SpaceListPage',
  components: {
    SpaceForm
  },
  data() {
    return {
      searchForm: {
        areaId: ''
      },
      tableData: [],
      areaList: [],
      availableCount: 0,
      loading: false,
      showSpaceForm: false,
      currentSpace: null,
      isEdit: false
    }
  },
  computed: {
    currentAreaName() {
      const area = this.areaList.find(a => a.id === this.searchForm.areaId)
      return area ? area.areaName : ''
    }
  },
  created() {
    this.fetchAreaList()
  },
  methods: {
    // 获取区域列表
    fetchAreaList() {
      getAreaList()
        .then(res => {
          if (res.code === 200) {
            this.areaList = res.data || []
            if (this.areaList.length > 0 && !this.searchForm.areaId) {
              this.searchForm.areaId = this.areaList[0].id
              this.fetchSpaceList()
              this.fetchAvailableCount()
            }
          }
        })
        .catch(err => {
          console.error('获取区域列表失败', err)
        })
    },
    
    // 获取车位列表
    fetchSpaceList() {
      if (!this.searchForm.areaId) return
      this.loading = true
      getSpaceList({ areaId: this.searchForm.areaId })
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data || []
          }
        })
        .catch(err => {
          alert(err.message || '获取车位列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 获取可用车位数量
    fetchAvailableCount() {
      if (!this.searchForm.areaId) return
      getAvailableCount(this.searchForm.areaId)
        .then(res => {
          if (res.code === 200) {
            this.availableCount = res.data || 0
          }
        })
        .catch(err => {
          console.error('获取可用车位数量失败', err)
        })
    },
    
    // 区域切换事件
    handleAreaChange() {
      this.fetchSpaceList()
      this.fetchAvailableCount()
    },
    
    // 获取状态显示文本
    getStatusText(status) {
      const statusMap = {
        0: '空闲',
        1: '已占用',
        2: '预留'
      }
      return statusMap[status] || '未知'
    },
    
    // 新增车位
    handleAdd() {
      this.currentSpace = null
      this.isEdit = false
      this.showSpaceForm = true
    },
    
    // 编辑车位
    handleEdit(space) {
      this.currentSpace = { ...space }
      this.isEdit = true
      this.showSpaceForm = true
    },
    
    // 关闭车位表单弹窗
    closeSpaceForm() {
      this.showSpaceForm = false
      this.currentSpace = null
    },
    
    // 表单提交成功
    handleFormSuccess() {
      this.closeSpaceForm()
      this.fetchSpaceList()
      this.fetchAvailableCount()
    },
    
    // 删除车位
    handleDelete(space) {
      if (!confirm(`确定要删除车位 "${space.spaceNumber}" 吗？`)) {
        return
      }
      
      deleteSpace(space.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchSpaceList()
            this.fetchAvailableCount()
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
.space-list-container {
  padding: 20px;
}

/* 标题 */
.space-list-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 搜索项 */
.search-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-item label {
  color: #333;
}

.search-item select,
.action-bar select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 按钮 */
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

/* 统计信息栏 */
.info-bar {
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  color: #666;
}

.info-bar span {
  margin-right: 20px;
}

/* 表格样式 */
.space-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.space-table th,
.space-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.space-table th {
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

.status-0 {
  background-color: #67c23a;
}

.status-1 {
  background-color: #f56c6c;
}

.status-2 {
  background-color: #e6a23c;
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
