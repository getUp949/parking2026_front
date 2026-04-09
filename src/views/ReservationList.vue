<template>
  <div class="reservation-list-container">
    <h2>预约管理</h2>
    
    <!-- 操作栏：搜索条件 -->
    <div class="action-bar">
      <!-- 状态筛选 -->
      <div class="search-item">
        <label>预约状态：</label>
        <select v-model="searchForm.status">
          <option value="">全部</option>
          <option value="0">待生效</option>
          <option value="1">已生效</option>
          <option value="2">已完成</option>
          <option value="3">已取消</option>
        </select>
      </div>
      
      <!-- 车牌号搜索 -->
      <div class="search-item">
        <label>车牌号：</label>
        <input 
          v-model="searchForm.licensePlate" 
          type="text" 
          placeholder="请输入车牌号"
        />
      </div>
      
      <!-- 搜索按钮 -->
      <button @click="handleSearch" class="btn-search">搜索</button>
      <button @click="handleReset" class="btn-reset">重置</button>
    </div>
    
    <!-- 预约列表表格 -->
    <table class="reservation-table" v-if="tableData.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>车牌号</th>
          <th>访客姓名</th>
          <th>访客电话</th>
          <th>业主姓名</th>
          <th>拜访原因</th>
          <th>目标区域</th>
          <th>预计开始时间</th>
          <th>预计结束时间</th>
          <th>审批状态</th>
          <th>预约状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!-- 数据行 -->
        <tr v-for="item in tableData" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.licensePlate }}</td>
          <td>{{ item.visitorName }}</td>
          <td>{{ item.visitorPhone || '-' }}</td>
          <td>{{ item.ownerName || '-' }}</td>
          <td>{{ item.visitReason || '-' }}</td>
          <td>{{ item.targetAreaId }}</td>
          <td>{{ item.expectedStartTime }}</td>
          <td>{{ item.expectedEndTime }}</td>
          <td>
            <span class="status-tag" :class="'auth-status-' + item.authorizationStatus">
              {{ getAuthStatusText(item.authorizationStatus) }}
            </span>
          </td>
          <td>
            <span class="status-tag" :class="'status-' + item.status">
              {{ getStatusText(item.status) }}
            </span>
          </td>
          <td class="actions">
            <!-- 待审批状态下显示审批按钮 -->
            <button 
              v-if="item.authorizationStatus === 'pending'" 
              @click="handleApprove(item)" 
              class="btn-link"
            >审批</button>
            <!-- 待生效状态下显示生效按钮 -->
            <button 
              v-if="item.status === 0" 
              @click="handleActivate(item)" 
              class="btn-link"
            >入场</button>
            <!-- 已生效状态下显示出场按钮 -->
            <button 
              v-if="item.status === 1" 
              @click="handleComplete(item)" 
              class="btn-link"
            >出场</button>
            <!-- 待生效状态下显示取消按钮 -->
            <button 
              v-if="item.status === 0" 
              @click="handleCancel(item)" 
              class="btn-link btn-danger"
            >取消</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- 无数据 -->
    <div v-else class="empty-tip">暂无预约数据</div>
    
    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <span>共 {{ total }} 条，第 {{ searchForm.pageNum }} / {{ Math.ceil(total / searchForm.pageSize) }} 页</span>
      <button 
        @click="handlePageChange(searchForm.pageNum - 1)" 
        :disabled="searchForm.pageNum === 1"
      >上一页</button>
      <button 
        @click="handlePageChange(searchForm.pageNum + 1)" 
        :disabled="searchForm.pageNum * searchForm.pageSize >= total"
      >下一页</button>
    </div>
    
    <!-- 审批弹窗 -->
    <div class="modal" v-if="showApproveModal">
      <div class="modal-content">
        <h3>审批预约</h3>
        <form @submit.prevent="submitApprove">
          <div class="form-item">
            <label>审批结果 <span class="required">*</span></label>
            <select v-model="approveForm.status" required>
              <option value="approved">通过</option>
              <option value="rejected">拒绝</option>
            </select>
          </div>
          <div class="form-item">
            <label>备注</label>
            <textarea 
              v-model="approveForm.remark" 
              placeholder="请输入审批备注"
              rows="3"
            ></textarea>
          </div>
          <div class="form-btns">
            <button type="button" @click="closeApproveModal" class="btn-cancel">取消</button>
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// 引入API方法
import { 
  getReservationList, 
  approveReservation, 
  cancelReservation, 
  activateReservation, 
  completeReservation 
} from '@/utils/api'

export default {
  name: 'ReservationListPage',
  data() {
    return {
      // 搜索表单
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        status: '',
        licensePlate: ''
      },
      // 表格数据
      tableData: [],
      // 总数据条数
      total: 0,
      // 加载状态
      loading: false,
      // 审批弹窗显示状态
      showApproveModal: false,
      // 当前审批的预约
      currentReservation: null,
      // 审批表单数据
      approveForm: {
        status: 'approved',
        remark: ''
      },
      // 提交加载状态
      submitLoading: false
    }
  },
  created() {
    // 组件创建时获取预约列表
    this.fetchReservationList()
  },
  methods: {
    // 获取预约列表
    fetchReservationList() {
      this.loading = true
      getReservationList(this.searchForm)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
          }
        })
        .catch(err => {
          alert(err.message || '获取预约列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 搜索
    handleSearch() {
      this.searchForm.pageNum = 1
      this.fetchReservationList()
    },
    
    // 重置搜索条件
    handleReset() {
      this.searchForm = {
        pageNum: 1,
        pageSize: 10,
        status: '',
        licensePlate: ''
      }
      this.fetchReservationList()
    },
    
    // 分页变化
    handlePageChange(page) {
      this.searchForm.pageNum = page
      this.fetchReservationList()
    },
    
    // 获取审批状态文本
    getAuthStatusText(status) {
      const statusMap = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || '未知'
    },
    
    // 获取预约状态文本
    getStatusText(status) {
      const statusMap = {
        0: '待生效',
        1: '已生效',
        2: '已完成',
        3: '已取消'
      }
      return statusMap[status] || '未知'
    },
    
    // 打开审批弹窗
    handleApprove(reservation) {
      this.currentReservation = reservation
      this.approveForm = {
        status: 'approved',
        remark: ''
      }
      this.showApproveModal = true
    },
    
    // 关闭审批弹窗
    closeApproveModal() {
      this.showApproveModal = false
      this.currentReservation = null
    },
    
    // 提交审批
    submitApprove() {
      if (!this.currentReservation) return
      
      this.submitLoading = true
      approveReservation(this.currentReservation.id, this.approveForm)
        .then(res => {
          if (res.code === 200) {
            alert('审批成功')
            this.closeApproveModal()
            this.fetchReservationList()
          } else {
            alert(res.message || '审批失败')
          }
        })
        .catch(err => {
          alert(err.message || '审批失败')
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    
    // 预约生效（入场）
    handleActivate(reservation) {
      if (!confirm(`确认让车牌 "${reservation.licensePlate}" 的车辆入场吗？`)) {
        return
      }
      
      activateReservation(reservation.id)
        .then(res => {
          if (res.code === 200) {
            alert('入场成功')
            this.fetchReservationList()
          } else {
            alert(res.message || '操作失败')
          }
        })
        .catch(err => {
          alert(err.message || '操作失败')
        })
    },
    
    // 预约失效（出场）
    handleComplete(reservation) {
      if (!confirm(`确认车牌 "${reservation.licensePlate}" 的车辆出场吗？`)) {
        return
      }
      
      completeReservation(reservation.id)
        .then(res => {
          if (res.code === 200) {
            alert('出场成功')
            this.fetchReservationList()
          } else {
            alert(res.message || '操作失败')
          }
        })
        .catch(err => {
          alert(err.message || '操作失败')
        })
    },
    
    // 取消预约
    handleCancel(reservation) {
      if (!confirm(`确定要取消车牌 "${reservation.licensePlate}" 的预约吗？`)) {
        return
      }
      
      cancelReservation(reservation.id)
        .then(res => {
          if (res.code === 200) {
            alert('取消成功')
            this.fetchReservationList()
          } else {
            alert(res.message || '取消失败')
          }
        })
        .catch(err => {
          alert(err.message || '取消失败')
        })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.reservation-list-container {
  padding: 20px;
}

/* 标题 */
.reservation-list-container h2 {
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
.search-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* 按钮 */
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
.reservation-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 14px;
}

.reservation-table th,
.reservation-table td {
  padding: 10px;
  border: 1px solid #eee;
  text-align: center;
}

.reservation-table th {
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

/* 审批状态 */
.auth-status-pending {
  background-color: #e6a23c;
}

.auth-status-approved {
  background-color: #67c23a;
}

.auth-status-rejected {
  background-color: #f56c6c;
}

/* 预约状态 */
.status-0 {
  background-color: #e6a23c;
}

.status-1 {
  background-color: #409eff;
}

.status-2 {
  background-color: #67c23a;
}

.status-3 {
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

/* 无数据 */
.empty-tip {
  text-align: center;
  color: #999;
  padding: 40px;
  background: white;
  border-radius: 4px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
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
  margin-bottom: 20px;
  color: #333;
}

/* 表单项 */
.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.required {
  color: #f56c6c;
}

.form-item input,
.form-item textarea,
.form-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-item textarea {
  resize: vertical;
  font-family: inherit;
}

/* 按钮区域 */
.form-btns {
  text-align: right;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background-color: #909399;
  color: white;
  margin-right: 10px;
}

.btn-submit {
  background-color: #409eff;
  color: white;
}

.btn-submit:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>
