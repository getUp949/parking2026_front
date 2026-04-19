<template>
  <div class="notice-list-container">
    <h2>通知管理</h2>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="searchForm.title"
        type="text"
        placeholder="输入标题搜索"
      />
      <select v-model="searchForm.noticeType">
        <option value="">全部类型</option>
        <option value="system">系统公告</option>
        <option value="parking_rule">停车规则</option>
        <option value="maintenance">维护通知</option>
        <option value="emergency">紧急通知</option>
        <option value="event">活动通知</option>
      </select>
      <select v-model="searchForm.publishStatus">
        <option value="">全部状态</option>
        <option value="DRAFT">草稿</option>
        <option value="PUBLISHED">已发布</option>
        <option value="WITHDRAWN">已撤回</option>
      </select>
      <select v-model="searchForm.priority">
        <option value="">全部优先级</option>
        <option value="1">低优先级</option>
        <option value="2">中优先级</option>
        <option value="3">高优先级</option>
      </select>
      <select v-model="searchForm.orderBy">
        <option value="publishTime">按发布时间</option>
        <option value="createTime">按创建时间</option>
        <option value="priority">按优先级</option>
      </select>
      <select v-model="searchForm.sortDirection">
        <option value="desc">降序</option>
        <option value="asc">升序</option>
      </select>
      <button @click="handleSearch" class="btn-search">搜索</button>
      <button @click="handleReset" class="btn-reset">重置</button>
      <button @click="handleAdd" class="btn-add">创建通知</button>
    </div>

    <!-- 通知列表表格 -->
    <table class="notice-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>标题</th>
          <th>类型</th>
          <th>优先级</th>
          <th>状态</th>
          <th>浏览量</th>
          <th>发布时间</th>
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
          <td class="notice-title">
            <span v-if="getIsUnread(item.id)" class="unread-dot"></span>
            {{ item.title }}
          </td>
          <td>
            <span class="type-tag" :class="'type-' + item.noticeType.toLowerCase()">
              {{ getNoticeTypeText(item.noticeType) }}
            </span>
          </td>
          <td>
            <span class="priority-tag" :class="'priority-' + item.priority">
              {{ getPriorityText(item.priority) }}
            </span>
          </td>
          <td>
            <span class="status-tag" :class="'status-' + getStatusKey(item.publishStatus).toLowerCase()">
              {{ getStatusText(item.publishStatus) }}
            </span>
          </td>
          <td>{{ item.viewCount || 0 }}</td>
          <td>{{ formatTime(item.publishTime) }}</td>
          <td class="actions">
            <button @click="handleView(item)" class="btn-link">查看</button>
            <button v-if="getStatusKey(item.publishStatus) === 'DRAFT' || getStatusKey(item.publishStatus) === 'CANCELLED'" @click="handleEdit(item)" class="btn-link">编辑</button>
            <button v-if="getStatusKey(item.publishStatus) === 'DRAFT'" @click="handlePublish(item)" class="btn-link btn-publish">发布</button>
            <button v-if="getStatusKey(item.publishStatus) === 'PUBLISHED'" @click="handleWithdraw(item)" class="btn-link btn-warning">撤回</button>
            <button v-if="getStatusKey(item.publishStatus) === 'DRAFT' || getStatusKey(item.publishStatus) === 'CANCELLED'" @click="handleDelete(item)" class="btn-link btn-danger">删除</button>
            <button v-if="getStatusKey(item.publishStatus) === 'CANCELLED'" @click="handleRepublish(item)" class="btn-link btn-publish">重新发布</button>
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

    <!-- 通知表单弹窗 -->
    <NoticeForm
      v-if="showNoticeForm"
      :noticeData="currentNotice"
      :isEdit="isEdit"
      @close="closeNoticeForm"
      @success="handleFormSuccess"
    />

    <!-- 通知详情弹窗 -->
    <div v-if="showDetail" class="modal">
      <div class="modal-content modal-large">
        <h3>通知详情</h3>
        <div class="detail-info">
          <div class="detail-row">
            <span class="detail-label">标题：</span>
            <span class="detail-value">{{ currentNotice.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">类型：</span>
            <span class="detail-value">
              <span class="type-tag" :class="'type-' + currentNotice.noticeType.toLowerCase()">
                {{ getNoticeTypeText(currentNotice.noticeType) }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">优先级：</span>
            <span class="detail-value">
              <span class="priority-tag" :class="'priority-' + currentNotice.priority">
                {{ getPriorityText(currentNotice.priority) }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">状态：</span>
            <span class="detail-value">
              <span class="status-tag" :class="'status-' + getStatusKey(currentNotice.publishStatus).toLowerCase()">
                {{ getStatusText(currentNotice.publishStatus) }}
              </span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">发布时间：</span>
            <span class="detail-value">{{ formatTime(currentNotice.publishTime) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">浏览量：</span>
            <span class="detail-value">{{ currentNotice.viewCount || 0 }}</span>
          </div>
          <div class="detail-row detail-content">
            <span class="detail-label">内容：</span>
            <div class="detail-value content-box">{{ currentNotice.content }}</div>
          </div>
        </div>
        <div class="modal-btns">
          <button @click="showDetail = false" class="btn-cancel">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getNoticeList, publishNotice, withdrawNotice, deleteNotice, getNoticeDetail } from '@/utils/api'
import NoticeForm from './NoticeForm.vue'

export default {
  name: 'NoticeListPage',
  components: {
    NoticeForm
  },
  data() {
    return {
      // 搜索表单
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        title: '',
        noticeType: '',
        publishStatus: '',
        priority: '',
        orderBy: 'publishTime',
        sortDirection: 'desc'
      },
      // 跳转页码
      jumpPage: 1,
      // 表格数据
      tableData: [],
      // 总数据条数
      total: 0,
      // 加载状态
      loading: false,
      // 已读通知ID集合
      readNoticeIds: new Set(),
      // 弹窗显示状态
      showNoticeForm: false,
      // 当前操作的公告
      currentNotice: null,
      // 是否是编辑模式
      isEdit: false,
      // 详情弹窗
      showDetail: false
    }
  },
  computed: {
    // 计算总页数
    totalPage() {
      return Math.ceil(this.total / this.searchForm.pageSize)
    }
  },
  created() {
    this.fetchNoticeList()
  },
  methods: {
    // 获取通知列表
    fetchNoticeList() {
      this.loading = true
      getNoticeList(this.searchForm)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
          }
        })
        .catch(err => {
          alert(err.message || '获取通知列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 判断通知是否未读
    getIsUnread(noticeId) {
      return !this.readNoticeIds.has(noticeId)
    },

    // 搜索
    handleSearch() {
      this.searchForm.pageNum = 1
      this.fetchNoticeList()
    },

    // 重置搜索条件
    handleReset() {
      this.searchForm = {
        pageNum: 1,
        pageSize: 10,
        title: '',
        noticeType: '',
        publishStatus: '',
        priority: '',
        orderBy: 'publishTime',
        sortDirection: 'desc'
      }
      this.fetchNoticeList()
    },

    // 翻页
    handlePageChange(page) {
      this.searchForm.pageNum = page
      this.jumpPage = page
      this.fetchNoticeList()
    },

    // 改变每页条数
    handlePageSizeChange() {
      this.searchForm.pageNum = 1
      this.jumpPage = 1
      this.fetchNoticeList()
    },

    // 跳转到指定页
    handleJumpPage() {
      let page = this.jumpPage
      if (page < 1) page = 1
      if (page > this.totalPage) page = this.totalPage
      this.jumpPage = page
      this.handlePageChange(page)
    },

    // 获取通知类型显示文本
    getNoticeTypeText(type) {
      const typeMap = {
        'system': '系统公告',
        'parking_rule': '停车规则',
        'maintenance': '维护通知',
        'emergency': '紧急通知',
        'event': '活动通知',
        'timeout_reminder': '超时提醒',
        'reservation_reminder': '预约提醒',
        'entry_exit_notice': '进出场通知',
        'approval_result': '审批结果'
      }
      return typeMap[type] || type
    },

    // 格式化时间显示
    formatTime(timeStr) {
      if (!timeStr) return '-'
      return timeStr.replace('T', ' ')
    },

    // 获取优先级显示文本
    getPriorityText(priority) {
      const priorityMap = {
        1: '低',
        2: '中',
        3: '高'
      }
      return priorityMap[priority] || priority
    },

    // 获取状态显示文本
    getStatusText(status) {
      const statusMap = {
        'DRAFT': '草稿',
        'PUBLISHED': '已发布',
        'WITHDRAWN': '已撤回',
        'CANCELLED': '已取消',
        'draft': '草稿',
        'published': '已发布',
        'withdrawn': '已撤回',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    },

    // 获取状态键名（统一转为大写）
    getStatusKey(status) {
      if (!status) return ''
      return status.toString().toUpperCase()
    },

    // 新增通知
    handleAdd() {
      this.currentNotice = null
      this.isEdit = false
      this.showNoticeForm = true
    },

    // 编辑通知
    handleEdit(notice) {
      this.currentNotice = { ...notice }
      this.isEdit = true
      this.showNoticeForm = true
    },

    // 关闭通知表单弹窗
    closeNoticeForm() {
      this.showNoticeForm = false
      this.currentNotice = null
    },

    // 表单提交成功
    handleFormSuccess() {
      this.closeNoticeForm()
      this.fetchNoticeList()
    },

    // 查看通知详情
    handleView(notice) {
      getNoticeDetail(notice.id)
        .then(res => {
          if (res.code === 200) {
            this.currentNotice = res.data
            this.showDetail = true
          }
        })
        .catch(err => {
          alert(err.message || '获取通知详情失败')
        })
    },

    // 发布通知
    handlePublish(notice) {
      if (!confirm(`确定要发布通知 "${notice.title}" 吗？`)) {
        return
      }

      publishNotice(notice.id)
        .then(res => {
          if (res.code === 200) {
            alert('发布成功')
            this.fetchNoticeList()
          } else {
            alert(res.message || '发布失败')
          }
        })
        .catch(err => {
          alert(err.message || '发布失败')
        })
    },

    // 重新发布通知
    handleRepublish(notice) {
      if (!confirm(`确定要重新发布通知 "${notice.title}" 吗？`)) {
        return
      }

      publishNotice(notice.id)
        .then(res => {
          if (res.code === 200) {
            alert('重新发布成功')
            this.fetchNoticeList()
          } else {
            alert(res.message || '重新发布失败')
          }
        })
        .catch(err => {
          alert(err.message || '重新发布失败')
        })
    },

    // 撤回通知
    handleWithdraw(notice) {
      if (!confirm(`确定要撤回通知 "${notice.title}" 吗？`)) {
        return
      }

      withdrawNotice(notice.id)
        .then(res => {
          if (res.code === 200) {
            alert('撤回成功')
            this.fetchNoticeList()
          } else {
            alert(res.message || '撤回失败')
          }
        })
        .catch(err => {
          alert(err.message || '撤回失败')
        })
    },

    // 删除通知
    handleDelete(notice) {
      if (!confirm(`确定要删除通知 "${notice.title}" 吗？此操作不可恢复！`)) {
        return
      }

      deleteNotice(notice.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchNoticeList()
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
.notice-list-container {
  padding: 20px;
}

/* 标题 */
.notice-list-container h2 {
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
}

/* 表格样式 */
.notice-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.notice-table th,
.notice-table td {
  padding: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.notice-table th {
  background-color: #f5f7fa;
  font-weight: bold;
}

/* 通知标题 */
.notice-title {
  text-align: left;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 未读标记 */
.unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

/* 类型标签 */
.type-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.type-system { background-color: #409eff; }
.type-parking_rule { background-color: #909399; }
.type-maintenance { background-color: #e6a23c; }
.type-emergency { background-color: #f56c6c; }
.type-event { background-color: #67c23a; }
.type-timeout_reminder { background-color: #f78959; }
.type-reservation_reminder { background-color: #85ce61; }
.type-entry_exit_notice { background-color: #909399; }
.type-approval_result { background-color: #b37feb; }

/* 优先级标签 */
.priority-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.priority-1 { background-color: #909399; }
.priority-2 { background-color: #409eff; }
.priority-3 { background-color: #f56c6c; }

/* 状态标签 */
.status-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.status-draft { background-color: #909399; }
.status-published { background-color: #67c23a; }
.status-withdrawn { background-color: #e6a23c; }
.status-cancelled { background-color: #f56c6c; }

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

.actions .btn-publish {
  color: #67c23a;
}

.actions .btn-warning {
  color: #e6a23c;
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

.modal-large {
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
}

.modal-content .form-item {
  margin: 15px 0;
}

.modal-content .form-item label {
  display: inline-block;
  width: 100px;
}

.modal-content .form-item input,
.modal-content .form-item select,
.modal-content .form-item textarea {
  width: 220px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-content .form-item textarea {
  width: 220px;
  height: 100px;
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

/* 详情样式 */
.detail-info {
  margin-top: 15px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.detail-label {
  width: 100px;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
}

.detail-content {
  align-items: flex-start;
}

.content-box {
  flex: 1;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
