<template>
  <div class="whitelist-manage">
    <h2>黑白名单管理</h2>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <select v-model="queryParams.listType">
        <option value="">全部类型</option>
        <option value="whitelist">白名单</option>
        <option value="blacklist">黑名单</option>
      </select>
      <input
        v-model="queryParams.licensePlate"
        type="text"
        placeholder="输入车牌号搜索"
      />
      <button @click="handleQuery" class="btn-search">查询</button>
      <button @click="handleReset" class="btn-reset">重置</button>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button @click="handleAdd('whitelist')" class="btn-add">新增白名单</button>
      <button @click="handleAdd('blacklist')" class="btn-add btn-add-black">新增黑名单</button>
    </div>

    <!-- 用户列表表格 -->
    <table class="user-table">
      <thead>
        <tr>
          <th>车牌号</th>
          <th>名单类型</th>
          <th>原因</th>
          <th>有效期</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <!-- 加载中 -->
        <tr v-if="loading">
          <td colspan="6" class="loading-cell">加载中...</td>
        </tr>
        <!-- 无数据 -->
        <tr v-else-if="tableData.length === 0">
          <td colspan="6" class="empty-cell">暂无数据</td>
        </tr>
        <!-- 数据行 -->
        <tr v-else v-for="item in tableData" :key="item.id">
          <td><strong>{{ item.licensePlate }}</strong></td>
          <td>
            <span class="role-tag" :class="item.listType === 'whitelist' ? 'role-whitelist' : 'role-blacklist'">
              {{ item.listType === 'whitelist' ? '白名单' : '黑名单' }}
            </span>
          </td>
          <td>{{ item.reason || '-' }}</td>
          <td>{{ item.effectiveDate }} ~ {{ item.expireDate }}</td>
          <td>
            <span class="status-tag" :class="item.status === 1 ? 'status-active' : 'status-inactive'">
              {{ item.status === 1 ? '启用' : '禁用' }}
            </span>
          </td>
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
          <select v-model.number="queryParams.pageSize" @change="handleSizeChange">
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
          :disabled="queryParams.pageNum <= 1"
        >
          首页
        </button>
        <button
          @click="handlePageChange(queryParams.pageNum - 1)"
          :disabled="queryParams.pageNum <= 1"
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
          @click="handlePageChange(queryParams.pageNum + 1)"
          :disabled="queryParams.pageNum >= totalPage"
        >
          下一页
        </button>
        <button
          @click="handlePageChange(totalPage)"
          :disabled="queryParams.pageNum >= totalPage"
        >
          末页
        </button>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="dialogVisible" class="modal" @click.self="dialogVisible = false">
      <div class="modal-content">
        <h3>{{ isEdit ? '编辑黑白名单' : '新增黑白名单' }}</h3>
        <div class="form-item">
          <label>车牌号：</label>
          <input v-model="form.licensePlate" type="text" placeholder="请输入车牌号" />
          <span v-if="formErrors.licensePlate" class="error-msg">{{ formErrors.licensePlate }}</span>
        </div>
        <div class="form-item">
          <label>名单类型：</label>
          <select v-model="form.listType">
            <option value="whitelist">白名单</option>
            <option value="blacklist">黑名单</option>
          </select>
          <span v-if="formErrors.listType" class="error-msg">{{ formErrors.listType }}</span>
        </div>
        <div class="form-item">
          <label>原因：</label>
          <input v-model="form.reason" type="text" placeholder="请输入原因" />
          <span v-if="formErrors.reason" class="error-msg">{{ formErrors.reason }}</span>
        </div>
        <div class="form-item">
          <label>生效日期：</label>
          <input v-model="form.effectiveDate" type="date" />
          <span v-if="formErrors.effectiveDate" class="error-msg">{{ formErrors.effectiveDate }}</span>
        </div>
        <div class="form-item">
          <label>失效日期：</label>
          <input v-model="form.expireDate" type="date" />
          <span v-if="formErrors.expireDate" class="error-msg">{{ formErrors.expireDate }}</span>
        </div>
        <div class="form-item">
          <label>状态：</label>
          <select v-model="form.status">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </div>
        <div class="modal-btns">
          <button @click="dialogVisible = false" class="btn-cancel">取消</button>
          <button @click="handleSubmit" class="btn-confirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getWhitelistList, addWhitelist, updateWhitelist, deleteWhitelist } from '@/utils/api'

export default {
  name: 'WhitelistManage',
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      dialogVisible: false,
      isEdit: false,
      jumpPage: 1,
      queryParams: {
        listType: '',
        licensePlate: '',
        pageNum: 1,
        pageSize: 10
      },
      form: {
        id: null,
        licensePlate: '',
        listType: 'whitelist',
        reason: '',
        effectiveDate: '',
        expireDate: '',
        status: 1
      },
      formErrors: {
        licensePlate: '',
        listType: '',
        reason: '',
        effectiveDate: '',
        expireDate: ''
      }
    }
  },
  computed: {
    totalPage() {
      return Math.ceil(this.total / this.queryParams.pageSize) || 1
    }
  },
  mounted() {
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const res = await getWhitelistList(this.queryParams)
        if (res.code === 200) {
          this.tableData = res.data?.records || []
          this.total = res.data?.total || 0
        } else {
          console.error('Failed to load list:', res.message)
          this.tableData = []
          this.total = 0
        }
      } catch (error) {
        console.error('Load list error:', error)
        this.tableData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.jumpPage = 1
      this.loadList()
    },
    handleReset() {
      this.queryParams.listType = ''
      this.queryParams.licensePlate = ''
      this.queryParams.pageNum = 1
      this.jumpPage = 1
      this.loadList()
    },
    handlePageChange(page) {
      if (page < 1) page = 1
      if (page > this.totalPage) page = this.totalPage
      this.queryParams.pageNum = page
      this.jumpPage = page
      this.loadList()
    },
    handleSizeChange() {
      this.queryParams.pageNum = 1
      this.jumpPage = 1
      this.loadList()
    },
    handleJumpPage() {
      let page = this.jumpPage
      if (page < 1) page = 1
      if (page > this.totalPage) page = this.totalPage
      this.jumpPage = page
      this.handlePageChange(page)
    },
    handleAdd(type) {
      this.isEdit = false
      this.form = {
        id: null,
        licensePlate: '',
        listType: type,
        reason: '',
        effectiveDate: '',
        expireDate: '',
        status: 1
      }
      this.clearFormErrors()
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.form = {
        id: row.id,
        licensePlate: row.licensePlate,
        listType: row.listType,
        reason: row.reason,
        effectiveDate: row.effectiveDate,
        expireDate: row.expireDate,
        status: row.status
      }
      this.clearFormErrors()
      this.dialogVisible = true
    },
    clearFormErrors() {
      this.formErrors = {
        licensePlate: '',
        listType: '',
        reason: '',
        effectiveDate: '',
        expireDate: ''
      }
    },
    validateForm() {
      this.clearFormErrors()
      let isValid = true

      if (!this.form.licensePlate || this.form.licensePlate.trim() === '') {
        this.formErrors.licensePlate = '请输入车牌号'
        isValid = false
      }

      if (!this.form.listType) {
        this.formErrors.listType = '请选择名单类型'
        isValid = false
      }

      if (!this.form.reason || this.form.reason.trim() === '') {
        this.formErrors.reason = '请输入原因'
        isValid = false
      }

      if (!this.form.effectiveDate) {
        this.formErrors.effectiveDate = '请选择生效日期'
        isValid = false
      }

      if (!this.form.expireDate) {
        this.formErrors.expireDate = '请选择失效日期'
        isValid = false
      }

      if (this.form.effectiveDate && this.form.expireDate && this.form.effectiveDate > this.form.expireDate) {
        this.formErrors.expireDate = '失效日期不能早于生效日期'
        isValid = false
      }

      return isValid
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      try {
        if (this.isEdit) {
          await updateWhitelist(this.form.id, this.form)
          alert('更新成功')
        } else {
          await addWhitelist(this.form)
          alert('新增成功')
        }
        this.dialogVisible = false
        this.loadList()
      } catch (error) {
        alert(error.message || '操作失败')
      }
    },
    handleDelete(row) {
      if (!confirm(`确定要删除车牌号为 "${row.licensePlate}" 的记录吗？此操作不可恢复！`)) {
        return
      }

      deleteWhitelist(row.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.loadList()
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
.whitelist-manage {
  padding: 20px;
}

/* 标题 */
.whitelist-manage h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-bar input,
.search-bar select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar input[type="text"] {
  width: 180px;
}

.search-bar select {
  width: 120px;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
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
}

.btn-add-black {
  background-color: #f56c6c;
}

/* 表格样式 */
.user-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.user-table th,
.user-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.user-table th {
  background-color: #f5f7fa;
  font-weight: bold;
}

/* 角色标签 */
.role-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.role-whitelist {
  background-color: #67c23a;
}

.role-blacklist {
  background-color: #f56c6c;
}

/* 状态标签 */
.status-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.status-active {
  background-color: #409eff;
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
  margin-bottom: 20px;
  color: #333;
}

.form-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.form-item label {
  margin-bottom: 5px;
  color: #333;
  font-weight: normal;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #409eff;
}

.error-msg {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.modal-btns {
  text-align: right;
  margin-top: 25px;
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

.btn-confirm:hover {
  background-color: #66b1ff;
}
</style>
