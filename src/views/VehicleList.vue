<template>
  <div class="vehicle-list-container">
    <h2>车辆管理</h2>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="searchForm.licensePlate" 
        type="text" 
        placeholder="输入车牌号搜索"
      />
      <select v-model="searchForm.status">
        <option value="">全部状态</option>
        <option :value="0">待审核</option>
        <option :value="1">已通过</option>
        <option :value="2">已拒绝</option>
      </select>
      <button @click="handleSearch" class="btn-search">搜索</button>
      <button @click="handleReset" class="btn-reset">重置</button>
    </div>
    
    <!-- 车辆列表表格 -->
    <table class="vehicle-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>车牌号</th>
          <th>品牌</th>
          <th>型号</th>
          <th>颜色</th>
          <th>类型</th>
          <th>状态</th>
          <th>注册时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!-- 加载中 -->
        <tr v-if="loading">
          <td colspan="10" class="loading-cell">加载中...</td>
        </tr>
        <!-- 无数据 -->
        <tr v-else-if="tableData.length === 0">
          <td colspan="10" class="empty-cell">暂无数据</td>
        </tr>
        <!-- 数据行 -->
        <tr v-else v-for="item in tableData" :key="item.id">
          <td>{{ item.id }}</td>
          <td>
            <strong>{{ item.licensePlate }}</strong>
          </td>
          <td>{{ item.vehicleBrand || '-' }}</td>
          <td>{{ item.vehicleModel || '-' }}</td>
          <td>{{ item.vehicleColor || '-' }}</td>
          <td>{{ getVehicleTypeText(item.vehicleType) }}</td>
          <td>
            <span class="status-tag" :class="'status-' + item.status">
              {{ getStatusText(item.status) }}
            </span>
          </td>
          <td>{{ formatTime(item.createTime) }}</td>
          <td class="actions">
            <button @click="handleView(item)" class="btn-link">查看</button>
            <!-- 待审核的车辆可以审核 -->
            <button 
              v-if="item.status === 0" 
              @click="handleApprove(item, 1)" 
              class="btn-link btn-success"
            >
              通过
            </button>
            <button 
              v-if="item.status === 0" 
              @click="handleApprove(item, 2)" 
              class="btn-link btn-danger"
            >
              拒绝
            </button>
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
    
    <!-- 车辆详情弹窗 -->
    <div v-if="showDetail" class="modal" @click.self="showDetail = false">
      <div class="modal-content">
        <h3>车辆详情</h3>
        <div class="detail-info">
          <div class="detail-item">
            <label>车牌号：</label>
            <span>{{ currentVehicle.licensePlate }}</span>
          </div>
          <div class="detail-item">
            <label>车辆品牌：</label>
            <span>{{ currentVehicle.vehicleBrand || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>车辆型号：</label>
            <span>{{ currentVehicle.vehicleModel || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>车辆颜色：</label>
            <span>{{ currentVehicle.vehicleColor || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>车辆类型：</label>
            <span>{{ getVehicleTypeText(currentVehicle.vehicleType) }}</span>
          </div>
          <div class="detail-item">
            <label>状态：</label>
            <span class="status-tag" :class="'status-' + currentVehicle.status">
              {{ getStatusText(currentVehicle.status) }}
            </span>
          </div>
          <div class="detail-item">
            <label>注册时间：</label>
            <span>{{ formatTime(currentVehicle.createTime) }}</span>
          </div>
        </div>
        <div class="modal-btns">
          <button @click="showDetail = false" class="btn-cancel">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 审核弹窗 -->
    <div v-if="showApprove" class="modal" @click.self="showApprove = false">
      <div class="modal-content">
        <h3>审核车辆</h3>
        <p>车牌号：<strong>{{ currentVehicle.licensePlate }}</strong></p>
        <div class="form-item">
          <label>审核结果：</label>
          <select v-model="approveForm.status">
            <option :value="1">通过</option>
            <option :value="2">拒绝</option>
          </select>
        </div>
        <div class="form-item">
          <label>备注：</label>
          <textarea v-model="approveForm.remark" placeholder="请输入审核备注"></textarea>
        </div>
        <div class="modal-btns">
          <button @click="showApprove = false" class="btn-cancel">取消</button>
          <button @click="confirmApprove" class="btn-confirm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getVehicleList, approveVehicle, deleteVehicle } from '@/utils/api'

export default {
  name: 'VehicleListPage',
  data() {
    return {
      // 搜索表单
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        licensePlate: '',
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
      // 详情弹窗
      showDetail: false,
      currentVehicle: {},
      // 审核弹窗
      showApprove: false,
      approveForm: {
        status: 1,
        remark: ''
      }
    }
  },
  computed: {
    // 计算总页数
    totalPage() {
      return Math.ceil(this.total / this.searchForm.pageSize) || 1
    }
  },
  created() {
    this.fetchVehicleList()
  },
  methods: {
    // 获取车辆列表
    fetchVehicleList() {
      this.loading = true
      getVehicleList(this.searchForm)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
          }
        })
        .catch(err => {
          alert(err.message || '获取车辆列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 搜索
    handleSearch() {
      this.searchForm.pageNum = 1
      this.jumpPage = 1
      this.fetchVehicleList()
    },
    
    // 重置搜索条件
    handleReset() {
      this.searchForm = {
        pageNum: 1,
        pageSize: 10,
        licensePlate: '',
        status: ''
      }
      this.jumpPage = 1
      this.fetchVehicleList()
    },
    
    // 翻页
    handlePageChange(page) {
      this.searchForm.pageNum = page
      this.jumpPage = page
      this.fetchVehicleList()
    },
    
    // 改变每页条数
    handlePageSizeChange() {
      this.searchForm.pageNum = 1
      this.jumpPage = 1
      this.fetchVehicleList()
    },
    
    // 跳转到指定页
    handleJumpPage() {
      let page = this.jumpPage
      if (page < 1) page = 1
      if (page > this.totalPage) page = this.totalPage
      this.jumpPage = page
      this.handlePageChange(page)
    },
    
    // 获取车辆类型显示文本
    getVehicleTypeText(type) {
      const typeMap = {
        'car': '轿车',
        'suv': 'SUV',
        'van': '面包车/商务车',
        'other': '其他'
      }
      return typeMap[type] || type || '-'
    },
    
    // 获取状态显示文本
    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || status
    },

    // 格式化时间显示 (2026-04-22T20:50:25 -> 2026-04-22 20:50:25)
    formatTime(timeStr) {
      if (!timeStr) return '-'
      return timeStr.replace('T', ' ')
    },
    
    // 查看详情
    handleView(vehicle) {
      this.currentVehicle = { ...vehicle }
      this.showDetail = true
    },
    
    // 审核车辆
    handleApprove(vehicle, status) {
      this.currentVehicle = vehicle
      this.approveForm = {
        status: status,
        remark: ''
      }
      this.showApprove = true
    },
    
    // 确认审核
    confirmApprove() {
      approveVehicle(this.currentVehicle.id, this.approveForm)
        .then(res => {
          if (res.code === 200) {
            alert('审核成功')
            this.showApprove = false
            this.fetchVehicleList()
          } else {
            alert(res.message || '审核失败')
          }
        })
        .catch(err => {
          alert(err.message || '审核失败')
        })
    },
    
    // 删除车辆
    handleDelete(vehicle) {
      if (!confirm(`确定要删除车牌号为 "${vehicle.licensePlate}" 的车辆吗？`)) {
        return
      }
      
      deleteVehicle(vehicle.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchVehicleList()
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
.vehicle-list-container {
  padding: 20px;
}

.vehicle-list-container h2 {
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

.btn-search,
.btn-reset {
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

/* 表格样式 */
.vehicle-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.vehicle-table th,
.vehicle-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.vehicle-table th {
  background-color: #f5f7fa;
  font-weight: bold;
}

/* 默认标签 */
.default-tag {
  padding: 2px 8px;
  background-color: #67c23a;
  color: white;
  border-radius: 3px;
  font-size: 12px;
}

/* 状态标签 */
.status-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.status-0 { background-color: #e6a23c; }
.status-1 { background-color: #67c23a; }
.status-2 { background-color: #f56c6c; }

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

.actions .btn-success {
  color: #67c23a;
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

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 450px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.detail-info .detail-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.detail-info .detail-item label {
  width: 100px;
  color: #666;
}

.detail-info .detail-item span {
  color: #333;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-item textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-btns {
  text-align: right;
  margin-top: 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #909399;
  color: white;
}

.btn-confirm {
  background-color: #409eff;
  color: white;
  margin-left: 10px;
}
</style>
