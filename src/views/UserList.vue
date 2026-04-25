<template>
  <div class="user-list-container">
    <h2>用户管理</h2>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        v-model="searchForm.username" 
        type="text" 
        placeholder="输入用户名搜索"
      />
      <select v-model="searchForm.role">
        <option value="">全部角色</option>
        <option value="admin">管理员</option>
        <option value="security">保安</option>
        <option value="owner">业主</option>
        <option value="visitor">访客</option>
      </select>
      <button @click="handleSearch" class="btn-search">搜索</button>
      <button @click="handleReset" class="btn-reset">重置</button>
      <button @click="handleAdd" class="btn-add">新增用户</button>
    </div>
    
    <!-- 用户列表表格 -->
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>真实姓名</th>
          <th>手机号</th>
          <th>角色</th>
          <th>状态</th>
          <th>注册时间</th>
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
          <td>{{ item.username }}</td>
          <td>{{ item.realName || '-' }}</td>
          <td>{{ item.phone || '-' }}</td>
          <td>
            <span class="role-tag" :class="'role-' + item.role">
              {{ getRoleText(item.role) }}
            </span>
          </td>
          <td>
            <span 
              class="status-tag" 
              :class="item.status === 1 ? 'status-active' : 'status-inactive'"
              @click="handleToggleStatus(item)"
            >
              {{ item.status === 1 ? '正常' : '禁用' }}
            </span>
          </td>
          <td>{{ formatTime(item.createTime) }}</td>
          <td class="actions">
            <button @click="handleEdit(item)" class="btn-link">编辑</button>
            <button @click="handleToggleStatus(item)" class="btn-link">启用/禁用</button>
            <button @click="handleResetPassword(item)" class="btn-link">重置密码</button>
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
    
    <!-- 用户表单弹窗 -->
    <UserForm
      v-if="showUserForm"
      :userData="currentUser"
      :isEdit="isEdit"
      @close="closeUserForm"
      @success="handleFormSuccess"
    />
    
    <!-- 重置密码弹窗 -->
    <div v-if="showResetPwd" class="modal">
      <div class="modal-content">
        <h3>重置密码</h3>
        <p>用户：{{ currentUser.username }}</p>
        <div class="form-item">
          <label>新密码：</label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码" />
        </div>
        <div class="modal-btns">
          <button @click="showResetPwd = false" class="btn-cancel">取消</button>
          <button @click="confirmResetPassword" class="btn-confirm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserList, updateUserStatus, deleteUser, resetPassword } from '@/utils/api'
import UserForm from './UserForm.vue'

export default {
  name: 'UserListPage',
  components: {
    UserForm
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        username: '',
        role: ''
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
      showUserForm: false,
      // 当前操作的用户
      currentUser: null,
      // 是否是编辑模式
      isEdit: false,
      // 重置密码弹窗
      showResetPwd: false,
      // 新密码
      newPassword: ''
    }
  },
  computed: {
    // 计算总页数
    totalPage() {
      return Math.ceil(this.total / this.searchForm.pageSize)
    }
  },
  created() {
    // 组件创建时获取用户列表
    this.fetchUserList()
  },
  methods: {
    // 获取用户列表
    fetchUserList() {
      this.loading = true
      getUserList(this.searchForm)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
          }
        })
        .catch(err => {
          alert(err.message || '获取用户列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 搜索
    handleSearch() {
      this.searchForm.pageNum = 1
      this.fetchUserList()
    },
    
    // 重置搜索条件
    handleReset() {
      this.searchForm = {
        pageNum: 1,
        pageSize: 10,
        username: '',
        role: ''
      }
      this.fetchUserList()
    },
    
    // 翻页
    handlePageChange(page) {
      this.searchForm.pageNum = page
      this.jumpPage = page
      this.fetchUserList()
    },
    
    // 改变每页条数
    handlePageSizeChange() {
      this.searchForm.pageNum = 1
      this.jumpPage = 1
      this.fetchUserList()
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
    
    // 获取角色显示文本
    getRoleText(role) {
      const roleMap = {
        'admin': '管理员',
        'security': '保安',
        'owner': '业主',
        'visitor': '访客'
      }
      return roleMap[role] || role
    },

    // 格式化时间显示 (2026-04-22T20:50:25 -> 2026-04-22 20:50:25)
    formatTime(timeStr) {
      if (!timeStr) return '-'
      return timeStr.replace('T', ' ')
    },

    // 新增用户
    handleAdd() {
      this.currentUser = null
      this.isEdit = false
      this.showUserForm = true
    },
    
    // 编辑用户
    handleEdit(user) {
      this.currentUser = { ...user }
      this.isEdit = true
      this.showUserForm = true
    },
    
    // 关闭用户表单弹窗
    closeUserForm() {
      this.showUserForm = false
      this.currentUser = null
    },
    
    // 表单提交成功
    handleFormSuccess() {
      this.closeUserForm()
      this.fetchUserList()
    },
    
    // 切换用户状态（启用/禁用）
    handleToggleStatus(user) {
      const newStatus = user.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      
      if (!confirm(`确定要${statusText}用户 "${user.username}" 吗？`)) {
        return
      }
      
      updateUserStatus(user.id, newStatus)
        .then(res => {
          if (res.code === 200) {
            alert('状态更新成功')
            this.fetchUserList()
          } else {
            alert(res.message || '操作失败')
          }
        })
        .catch(err => {
          alert(err.message || '操作失败')
        })
    },
    
    // 重置密码
    handleResetPassword(user) {
      this.currentUser = user
      this.newPassword = ''
      this.showResetPwd = true
    },
    
    // 确认重置密码
    confirmResetPassword() {
      if (!this.newPassword || this.newPassword.length < 6) {
        alert('密码长度至少6位')
        return
      }
      
      resetPassword(this.currentUser.id, this.newPassword)
        .then(res => {
          if (res.code === 200) {
            alert('密码重置成功')
            this.showResetPwd = false
          } else {
            alert(res.message || '操作失败')
          }
        })
        .catch(err => {
          alert(err.message || '操作失败')
        })
    },
    
    // 删除用户
    handleDelete(user) {
      if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复！`)) {
        return
      }
      
      deleteUser(user.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchUserList()
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
.user-list-container {
  padding: 20px;
}

/* 标题 */
.user-list-container h2 {
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

.role-admin { background-color: #f56c6c; }
.role-security { background-color: #e6a23c; }
.role-owner { background-color: #409eff; }
.role-visitor { background-color: #909399; }

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
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.modal-content h3 {
  margin-top: 0;
}

.modal-content .form-item {
  margin: 15px 0;
}

.modal-content .form-item label {
  display: inline-block;
  width: 80px;
}

.modal-content .form-item input {
  width: 200px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
  margin-left: 10px;
}

.btn-cancel {
  background-color: #909399;
  color: white;
}

.btn-confirm {
  background-color: #409eff;
  color: white;
}
</style>
