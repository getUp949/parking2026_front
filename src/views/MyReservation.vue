<template>
  <div class="my-reservation-container">
    <h2>我的预约</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <button @click="handleAdd" class="btn-add">新增预约</button>
    </div>
    
    <!-- 预约列表表格 -->
    <table class="reservation-table" v-if="tableData.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>车牌号</th>
          <th>访客姓名</th>
          <th>访客电话</th>
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
            <!-- 待生效状态下显示取消按钮 -->
            <button 
              v-if="item.status === 0" 
              @click="handleCancel(item)" 
              class="btn-link btn-danger"
            >取消预约</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- 无数据 -->
    <div v-else class="empty-tip">暂无预约记录</div>
    
    <!-- 新增预约弹窗 -->
    <div class="modal" v-if="showFormModal">
      <div class="modal-content">
        <h3>{{ isEdit ? '编辑预约' : '新增预约' }}</h3>
        
        <form @submit.prevent="handleSubmit">
          <!-- 车牌号 -->
          <div class="form-item">
            <label>车牌号 <span class="required">*</span></label>
            <input 
              v-model="form.licensePlate" 
              type="text" 
              placeholder="请输入车牌号，如：京A12345"
              required
            />
          </div>
          
          <!-- 访客姓名 -->
          <div class="form-item">
            <label>访客姓名 <span class="required">*</span></label>
            <input 
              v-model="form.visitorName" 
              type="text" 
              placeholder="请输入访客姓名"
              required
            />
          </div>
          
          <!-- 访客电话 -->
          <div class="form-item">
            <label>访客电话</label>
            <input 
              v-model="form.visitorPhone" 
              type="text" 
              placeholder="请输入访客电话"
            />
          </div>
          
          <!-- 目标区域 -->
          <div class="form-item">
            <label>目标区域 <span class="required">*</span></label>
            <select v-model="form.targetAreaId" required>
              <option value="">请选择区域</option>
              <option v-for="area in areaList" :key="area.id" :value="area.id">
                {{ area.areaName }}
              </option>
            </select>
          </div>
          
          <!-- 预计开始时间 -->
          <div class="form-item">
            <label>预计开始时间 <span class="required">*</span></label>
            <input 
              v-model="form.expectedStartTime" 
              type="datetime-local" 
              required
            />
          </div>
          
          <!-- 预计结束时间 -->
          <div class="form-item">
            <label>预计结束时间 <span class="required">*</span></label>
            <input 
              v-model="form.expectedEndTime" 
              type="datetime-local" 
              required
            />
          </div>
          
          <!-- 拜访原因 -->
          <div class="form-item">
            <label>拜访原因</label>
            <textarea 
              v-model="form.visitReason" 
              placeholder="请输入拜访原因"
              rows="2"
            ></textarea>
          </div>
          
          <!-- 按钮 -->
          <div class="form-btns">
            <button type="button" @click="closeForm" class="btn-cancel">取消</button>
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
  getMyReservations, 
  createReservation, 
  cancelReservation,
  getCommunityAll,
  getAreaList
} from '@/utils/api'

export default {
  name: 'MyReservationPage',
  data() {
    return {
      // 表格数据
      tableData: [],
      // 区域列表
      areaList: [],
      // 弹窗显示状态
      showFormModal: false,
      // 是否是编辑模式
      isEdit: false,
      // 表单数据
      form: {
        licensePlate: '',
        visitorName: '',
        visitorPhone: '',
        targetAreaId: '',
        expectedStartTime: '',
        expectedEndTime: '',
        visitReason: ''
      },
      // 加载状态
      loading: false,
      // 当前选中的小区ID
      selectedCommunityId: ''
    }
  },
  created() {
    // 组件创建时获取数据
    this.fetchCommunityAndArea()
  },
  methods: {
    // 获取小区和区域数据
    fetchCommunityAndArea() {
      // 先获取小区列表
      getCommunityAll()
        .then(res => {
          if (res.code === 200 && res.data.length > 0) {
            // 默认选中第一个小区
            this.selectedCommunityId = res.data[0].id
            // 获取该小区的区域列表
            this.fetchAreaList()
          }
        })
        .catch(err => {
          console.error('获取小区列表失败', err)
        })
      
      // 获取我的预约列表
      this.fetchMyReservations()
    },
    
    // 获取区域列表
    fetchAreaList() {
      if (!this.selectedCommunityId) return
      getAreaList(this.selectedCommunityId)
        .then(res => {
          if (res.code === 200) {
            this.areaList = res.data || []
          }
        })
        .catch(err => {
          console.error('获取区域列表失败', err)
        })
    },
    
    // 获取我的预约列表
    fetchMyReservations() {
      getMyReservations()
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data || []
          }
        })
        .catch(err => {
          alert(err.message || '获取预约列表失败')
        })
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
    
    // 打开新增弹窗
    handleAdd() {
      this.isEdit = false
      this.form = {
        licensePlate: '',
        visitorName: '',
        visitorPhone: '',
        targetAreaId: '',
        expectedStartTime: '',
        expectedEndTime: '',
        visitReason: ''
      }
      this.showFormModal = true
    },
    
    // 关闭弹窗
    closeForm() {
      this.showFormModal = false
      this.form = {
        licensePlate: '',
        visitorName: '',
        visitorPhone: '',
        targetAreaId: '',
        expectedStartTime: '',
        expectedEndTime: '',
        visitReason: ''
      }
    },
    
    // 提交表单
    handleSubmit() {
      // 验证必填字段
      if (!this.form.licensePlate || !this.form.visitorName || !this.form.targetAreaId) {
        alert('请填写必填字段')
        return
      }
      
      // 验证时间
      if (!this.form.expectedStartTime || !this.form.expectedEndTime) {
        alert('请选择预约时间')
        return
      }
      
      // 转换时间格式为后端需要的格式
      const startTime = this.form.expectedStartTime.replace('T', ' ') + ':00'
      const endTime = this.form.expectedEndTime.replace('T', ' ') + ':00'
      
      this.loading = true
      
      createReservation({
        licensePlate: this.form.licensePlate,
        visitorName: this.form.visitorName,
        visitorPhone: this.form.visitorPhone || undefined,
        targetAreaId: this.form.targetAreaId,
        expectedStartTime: startTime,
        expectedEndTime: endTime,
        visitReason: this.form.visitReason || undefined
      })
        .then(res => {
          if (res.code === 200) {
            alert('预约成功')
            this.closeForm()
            this.fetchMyReservations()
          } else {
            alert(res.message || '预约失败')
          }
        })
        .catch(err => {
          alert(err.message || '预约失败')
        })
        .finally(() => {
          this.loading = false
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
            this.fetchMyReservations()
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
.my-reservation-container {
  padding: 20px;
}

/* 标题 */
.my-reservation-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 20px;
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
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
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
