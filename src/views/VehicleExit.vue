<template>
  <div class="exit-container">
    <h2>车辆出场管理</h2>

    <!-- 第一部分：出场登记 -->
    <div class="section">
      <h3>车辆出场登记</h3>
      
      <form @submit.prevent="handleExit" class="exit-form">
        <!-- 车牌号 -->
        <div class="form-row">
          <div class="form-item">
            <label>车牌号 <span class="required">*</span></label>
            <input 
              v-model="form.licensePlate" 
              type="text" 
              placeholder="请输入车牌号，如：京A12345"
              required
              @blur="handleCheck"
            />
          </div>
          
          <!-- 出场方式 -->
          <div class="form-item">
            <label>出场方式 <span class="required">*</span></label>
            <select v-model="form.exitType" required>
              <option value="manual">保安手动登记</option>
              <option value="auto">自动识别出场</option>
            </select>
          </div>
        </div>

        <!-- 在场记录信息（查询后显示） -->
        <div v-if="activeEntry" class="entry-info">
          <h4>当前在场记录：</h4>
          <p><strong>入场记录ID：</strong>{{ activeEntry.id }}</p>
          <p><strong>车牌号：</strong>{{ activeEntry.licensePlate }}</p>
          <p><strong>入场时间：</strong>{{ activeEntry.entryTime }}</p>
          <p><strong>入场类型：</strong>{{ getEntryTypeText(activeEntry.entryType) }}</p>
          <p><strong>区域ID：</strong>{{ activeEntry.areaId }}</p>
          <p><strong>车位ID：</strong>{{ activeEntry.spaceId }}</p>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="loading || !activeEntry">
            {{ loading ? '提交中...' : '确认出场' }}
          </button>
          <button type="button" @click="handleReset" class="btn-reset">重置</button>
        </div>
      </form>
    </div>

    <!-- 第二部分：出场记录列表 -->
    <div class="section">
      <h3>出场记录列表</h3>
      
      <!-- 搜索条件 -->
      <div class="search-bar">
        <input 
          v-model="searchParams.licensePlate" 
          type="text" 
          placeholder="请输入车牌号搜索"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="btn-search">搜索</button>
      </div>

      <!-- 记录表格 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>车牌号</th>
            <th>入场记录ID</th>
            <th>出场时间</th>
            <th>停车时长(分钟)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.licensePlate }}</td>
            <td>{{ item.entryRecordId }}</td>
            <td>{{ item.exitTime }}</td>
            <td>{{ item.parkingDuration }}</td>
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
      <div v-if="tableData.length === 0 && !loading" class="empty-tip">暂无出场记录</div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetailModal" class="modal">
      <div class="modal-content">
        <h3>出场记录详情</h3>
        <div class="detail-info">
          <p><strong>ID：</strong>{{ currentDetail.id }}</p>
          <p><strong>车牌号：</strong>{{ currentDetail.licensePlate }}</p>
          <p><strong>入场记录ID：</strong>{{ currentDetail.entryRecordId }}</p>
          <p><strong>出场时间：</strong>{{ currentDetail.exitTime }}</p>
          <p><strong>出场方式：</strong>{{ currentDetail.exitType === 'manual' ? '保安手动登记' : '自动识别出场' }}</p>
          <p><strong>停车时长：</strong>{{ currentDetail.parkingDuration }} 分钟</p>
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
  vehicleExit, 
  getExitList, 
  getExitDetail, 
  checkExit 
} from '@/utils/api'

export default {
  name: 'VehicleExitPage',
  data() {
    return {
      // 登记表单数据
      form: {
        licensePlate: '',
        exitType: 'manual'
      },
      // 当前在场记录
      activeEntry: null,
      // 加载状态
      loading: false,
      
      // 搜索参数
      searchParams: {
        pageNum: 1,
        pageSize: 10,
        licensePlate: ''
      },
      // 表格数据
      tableData: [],
      // 总记录数
      total: 0,
      
      // 详情弹窗
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
    // 页面加载时获取出场记录列表
    this.fetchExitList()
  },
  methods: {
    // 出场前检查（查询在场记录）
    handleCheck() {
      if (!this.form.licensePlate) {
        this.activeEntry = null
        return
      }

      checkExit(this.form.licensePlate)
        .then(res => {
          if (res.code === 200 && res.data) {
            this.activeEntry = res.data
          } else {
            this.activeEntry = null
            alert(res.message || '该车辆不在场')
          }
        })
        .catch(err => {
          this.activeEntry = null
          console.error('检查在场记录失败', err)
        })
    },

    // 提交出场登记
    handleExit() {
      // 验证必填字段
      if (!this.form.licensePlate || !this.form.exitType) {
        alert('请填写所有必填字段')
        return
      }

      if (!this.activeEntry) {
        alert('请先输入车牌号查询在场记录')
        return
      }

      this.loading = true

      vehicleExit({
        entryRecordId: this.activeEntry.id,
        licensePlate: this.form.licensePlate,
        exitType: this.form.exitType
      })
        .then(res => {
          if (res.code === 200) {
            alert('出场登记成功')
            this.handleReset()
            // 刷新列表
            this.fetchExitList()
          } else {
            alert(res.message || '出场登记失败')
          }
        })
        .catch(err => {
          alert(err.message || '出场登记失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 重置表单
    handleReset() {
      this.form = {
        licensePlate: '',
        exitType: 'manual'
      }
      this.activeEntry = null
    },

    // 获取出场记录列表
    fetchExitList() {
      getExitList(this.searchParams)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
          }
        })
        .catch(err => {
          console.error('获取出场记录失败', err)
        })
    },

    // 搜索
    handleSearch() {
      this.searchParams.pageNum = 1
      this.fetchExitList()
    },

    // 分页
    handlePageChange(page) {
      if (page < 1 || page > this.totalPages) return
      this.searchParams.pageNum = page
      this.fetchExitList()
    },

    // 获取入场类型文本
    getEntryTypeText(type) {
      const map = {
        normal: '普通入场',
        reservation: '预约入场',
        temp: '临时入场'
      }
      return map[type] || type
    },

    // 查看详情
    handleViewDetail(item) {
      getExitDetail(item.id)
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
.exit-container {
  padding: 20px;
}

.exit-container h2 {
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
.exit-form {
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
.form-item select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #409eff;
}

/* 在场记录信息 */
.entry-info {
  background: #f0f9eb;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e1f3d8;
}

.entry-info h4 {
  margin: 0 0 10px 0;
  color: #67c23a;
  font-size: 14px;
}

.entry-info p {
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

.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: #909399;
  color: white;
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
