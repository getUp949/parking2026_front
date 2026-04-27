<template>
  <div class="entry-container">
    <h2>车辆入场管理</h2>

    <!-- 第一部分：入场登记表单 -->
    <div class="section">
      <h3>车辆入场登记</h3>
      
      <form @submit.prevent="handleEntry" class="entry-form">
        <!-- 选择区域 -->
        <div class="form-row">
          <div class="form-item">
            <label>选择区域 <span class="required">*</span></label>
            <select v-model="form.areaId" required>
              <option value="">请选择区域</option>
              <option v-for="a in areaList" :key="a.id" :value="a.id">{{ a.areaName }} ({{ a.areaCode }})</option>
            </select>
          </div>
        </div>

        <!-- 车牌号 -->
        <div class="form-row">
          <div class="form-item">
            <label>车牌号 <span class="required">*</span></label>
            <input 
              v-model="form.licensePlate" 
              type="text" 
              placeholder="请输入车牌号，如：京A12345"
              required
              @blur="handleRecognize"
            />
          </div>
          
          <!-- 入场类型 -->
          <div class="form-item">
            <label>入场类型 <span class="required">*</span></label>
            <select v-model="form.entryType" required>
              <option value="owner">业主车</option>
              <option value="temp">临时车</option>
              <option value="reservation">预约车</option>
            </select>
          </div>
        </div>

        <!-- 业主车辆信息（自动识别后显示） -->
        <div v-if="recognizedVehicle" class="vehicle-info">
          <h4>识别到的业主车辆信息：</h4>
          <p>车牌号：{{ recognizedVehicle.licensePlate }}</p>
          <p>品牌：{{ recognizedVehicle.vehicleBrand || '-' }}</p>
          <p>型号：{{ recognizedVehicle.vehicleModel || '-' }}</p>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? '提交中...' : '确认入场' }}
          </button>
          <button type="button" @click="handleReset" class="btn-reset">重置</button>
        </div>
      </form>
    </div>

    <!-- 第二部分：入场记录列表 -->
    <div class="section">
      <h3>入场记录列表</h3>
      
      <!-- 搜索条件 -->
      <div class="search-bar">
        <input 
          v-model="searchParams.licensePlate" 
          type="text" 
          placeholder="请输入车牌号搜索"
          @keyup.enter="handleSearch"
        />
        <select v-model="searchParams.entryType">
          <option value="">全部类型</option>
          <option value="owner">业主车</option>
          <option value="temp">临时车</option>
          <option value="reservation">预约车</option>
        </select>
        <button @click="handleSearch" class="btn-search">搜索</button>
      </div>

      <!-- 记录表格 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>车牌号</th>
            <th>区域</th>
            <th>入场时间</th>
            <th>入场类型</th>
            <th>来源</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.licensePlate }}</td>
            <td>{{ item.areaId }}</td>
            <td>{{ formatTime(item.entryTime) }}</td>
            <td>
              <span class="type-tag" :class="'type-' + item.entryType" style="color: #333;">
                {{ getEntryTypeText(item.entryType) }}
              </span>
            </td>
            <td>{{ item.entrySource === 'manual' ? '手动' : '自动' }}</td>
            <td class="actions">
              <button @click="handleViewDetail(item)" class="btn-link">详情</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <span>共 {{ total }} 条记录，第 {{ searchParams.pageNum }} / {{ totalPages }} 页</span>
        <div class="page-btns">
          <button @click="handlePageChange(1)" :disabled="searchParams.pageNum === 1">首页</button>
          <button @click="handlePageChange(searchParams.pageNum - 1)" :disabled="searchParams.pageNum === 1">上一页</button>
          <button @click="handlePageChange(searchParams.pageNum + 1)" :disabled="searchParams.pageNum >= totalPages">下一页</button>
          <button @click="handlePageChange(totalPages)" :disabled="searchParams.pageNum >= totalPages">末页</button>
        </div>
      </div>

      <!-- 无数据 -->
      <div v-if="tableData.length === 0 && !loading" class="empty-tip">暂无入场记录</div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal">
      <div class="modal-content">
        <h3>入场记录详情</h3>
        <div class="detail-info">
          <p><strong>ID：</strong>{{ currentDetail.id }}</p>
          <p><strong>车牌号：</strong>{{ currentDetail.licensePlate }}</p>
          <p><strong>区域：</strong>{{ currentDetail.areaName || currentDetail.areaId }}</p>
          <p><strong>入场时间：</strong>{{ formatTime(currentDetail.entryTime) }}</p>
          <p><strong>入场类型：</strong>{{ getEntryTypeText(currentDetail.entryType) }}</p>
        </div>
        <div class="form-btns">
          <button @click="showDetailModal = false" class="btn-cancel">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 引入API方法
import { 
  vehicleEntry, 
  getEntryList, 
  getEntryDetail, 
  recognizePlate, 
  getAreaList
} from '@/utils/api'

export default {
  name: 'VehicleEntryPage',
  data() {
    return {
      form: {
        areaId: '',
        licensePlate: '',
        entryType: 'owner'
      },
      areaList: [],
      recognizedVehicle: null,
      loading: false,
      
      searchParams: {
        pageNum: 1,
        pageSize: 10,
        licensePlate: '',
        entryType: ''
      },
      tableData: [],
      total: 0,
      
      showDetailModal: false,
      currentDetail: {}
    }
  },
  computed: {
    // 计算总页数
    totalPages() {
      return Math.ceil(this.total / this.searchParams.pageSize) || 1
    }
  },
  created() {
    this.fetchAreaList()
    this.fetchEntryList()
  },
  methods: {
    // 获取区域列表
    fetchAreaList() {
      getAreaList()
        .then(res => {
          if (res.code === 200) {
            this.areaList = res.data || []
          }
        })
        .catch(err => {
          console.error('获取区域列表失败', err)
        })
    },

    // 车牌识别（失去焦点时自动识别）
    handleRecognize() {
      if (!this.form.licensePlate) {
        this.recognizedVehicle = null
        return
      }
      
      recognizePlate(this.form.licensePlate)
        .then(res => {
          if (res.code === 200 && res.data) {
            this.recognizedVehicle = res.data
            // 如果识别到业主车辆，自动填充相关信息
            if (res.data.vehicleId) {
              this.form.vehicleId = res.data.vehicleId
            }
          } else {
            this.recognizedVehicle = null
          }
        })
        .catch(err => {
          console.error('车牌识别失败', err)
          this.recognizedVehicle = null
        })
    },

    // 提交入场登记
    handleEntry() {
      // 验证必填字段
      if (!this.form.areaId || !this.form.licensePlate || !this.form.entryType) {
        alert('请填写所有必填字段')
        return
      }

      this.loading = true

      vehicleEntry({
        licensePlate: this.form.licensePlate,
        vehicleId: this.form.vehicleId || null,
        reservationId: this.form.reservationId || null,
        areaId: this.form.areaId,
        entryType: this.form.entryType
      })
        .then(res => {
          if (res.code === 200) {
            alert('入场登记成功')
            this.handleReset()
            this.fetchEntryList()
          } else {
            alert(res.message || '入场登记失败')
          }
        })
        .catch(err => {
          alert(err.message || '入场登记失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 重置表单
    handleReset() {
      this.form = {
        areaId: '',
        licensePlate: '',
        entryType: 'owner'
      }
      this.recognizedVehicle = null
    },

    // 获取入场记录列表
    fetchEntryList() {
      getEntryList(this.searchParams)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
          }
        })
        .catch(err => {
          console.error('获取入场记录失败', err)
        })
    },

    // 搜索
    handleSearch() {
      this.searchParams.pageNum = 1
      this.fetchEntryList()
    },

    // 分页
    handlePageChange(page) {
      if (page < 1 || page > this.totalPages) return
      this.searchParams.pageNum = page
      this.fetchEntryList()
    },

    // 获取入场类型文本
    getEntryTypeText(type) {
      const map = {
        owner: '业主车',
        temp: '临时车',
        reservation: '预约车'
      }
      return map[type] || type
    },

    // 格式化时间显示 (2026-04-22T20:50:25 -> 2026-04-22 20:50:25)
    formatTime(timeStr) {
      if (!timeStr) return '-'
      return timeStr.replace('T', ' ')
    },

    // 查看详情
    handleViewDetail(item) {
      getEntryDetail(item.id)
        .then(res => {
          if (res.code === 200) {
            this.currentDetail = res.data || {}
            this.showDetailModal = true
          } else {
            alert(res.message || '获取详情失败')
          }
        })
        .catch(err => {
          alert(err.message || '获取详情失败')
        })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.entry-container {
  padding: 20px;
}

.entry-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 区块样式 */
.section {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

/* 表单样式 */
.entry-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-item label {
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
}

.required {
  color: #f56c6c;
}

.form-item input,
.form-item select,
.form-item textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #409eff;
}

/* 业主车辆信息 */
.vehicle-info {
  background: #f0f9eb;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e1f3d8;
}

.vehicle-info h4 {
  margin: 0 0 10px 0;
  color: #67c23a;
  font-size: 14px;
}

.vehicle-info p {
  margin: 5px 0;
  color: #333;
  font-size: 14px;
}

/* 表单按钮 */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-submit,
.btn-reset {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-submit {
  background-color: #409eff;
  color: white;
}

.btn-submit:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-reset {
  background-color: #909399;
  color: white;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-search {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  background-color: #409eff;
  color: white;
  cursor: pointer;
}

/* 表格样式 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.data-table th,
.data-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: center;
  font-size: 14px;
}

.data-table th {
  background-color: #f5f7fa;
  font-weight: bold;
}

/* 类型标签 */
.type-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: #333 !important;
  display: inline-block;
}

.type-owner {
  background-color: #409eff !important;
}

.type-reservation {
  background-color: #e6a23c !important;
}

.type-temp {
  background-color: #909399 !important;
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

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.page-btns {
  display: flex;
  gap: 5px;
}

.page-btns button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-btns button:disabled {
  background: #f5f7fa;
  cursor: not-allowed;
}

/* 无数据 */
.empty-tip {
  text-align: center;
  color: #999;
  padding: 40px;
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

/* 详情信息 */
.detail-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.detail-info p {
  margin: 10px 0;
  color: #333;
  font-size: 14px;
}
</style>
