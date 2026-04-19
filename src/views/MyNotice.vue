<template>
  <div class="my-notice-container">
    <h2>消息中心</h2>

    <!-- 顶部未读数量显示 -->
    <div class="notice-header">
      <div class="unread-info" v-if="unreadCount > 0">
        <span class="unread-badge">{{ unreadCount }}</span>
        <span>条未读消息</span>
        <button @click="handleMarkAllRead" class="btn-mark-all">全部标记已读</button>
      </div>
      <div class="unread-info" v-else>
        <span>暂无未读消息</span>
      </div>
    </div>

    <!-- 通知类型筛选Tab -->
    <div class="filter-tabs">
      <button
        :class="{ active: filterType === '' }"
        @click="handleFilterChange('')"
      >
        全部
      </button>
      <button
        :class="{ active: filterType === 'system' }"
        @click="handleFilterChange('system')"
      >
        系统公告
      </button>
      <button
        :class="{ active: filterType === 'parking_rule' }"
        @click="handleFilterChange('parking_rule')"
      >
        停车规则
      </button>
      <button
        :class="{ active: filterType === 'maintenance' }"
        @click="handleFilterChange('maintenance')"
      >
        维护通知
      </button>
      <button
        :class="{ active: filterType === 'emergency' }"
        @click="handleFilterChange('emergency')"
      >
        紧急通知
      </button>
      <button
        :class="{ active: filterType === 'event' }"
        @click="handleFilterChange('event')"
      >
        活动通知
      </button>
      <button
        :class="{ active: filterType === 'timeout_reminder' }"
        @click="handleFilterChange('timeout_reminder')"
      >
        超时提醒
      </button>
      <button
        :class="{ active: filterType === 'reservation_reminder' }"
        @click="handleFilterChange('reservation_reminder')"
      >
        预约提醒
      </button>
      <button
        :class="{ active: filterType === 'entry_exit_notice' }"
        @click="handleFilterChange('entry_exit_notice')"
      >
        进出场通知
      </button>
      <button
        :class="{ active: filterType === 'approval_result' }"
        @click="handleFilterChange('approval_result')"
      >
        审批结果
      </button>
    </div>

    <!-- 通知列表 -->
    <div class="notice-list">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        加载中...
      </div>
      <!-- 无数据 -->
      <div v-else-if="noticeList.length === 0" class="empty-state">
        暂无消息
      </div>
      <!-- 通知项 -->
      <div
        v-else
        v-for="item in noticeList"
        :key="item.id"
        class="notice-item"
        :class="{ unread: !item.isRead }"
        @click="handleNoticeClick(item)"
      >
        <div class="notice-icon">
          <span class="type-tag" :class="'type-' + item.noticeType.toLowerCase()">
            {{ getNoticeTypeText(item.noticeType) }}
          </span>
        </div>
        <div class="notice-content">
          <div class="notice-title">
            <span v-if="!item.isRead" class="unread-dot"></span>
            {{ item.title }}
          </div>
          <div class="notice-summary">
            {{ getSummary(item.content) }}
          </div>
          <div class="notice-meta">
            <span class="priority-tag" :class="'priority-' + item.priority">
              {{ getPriorityText(item.priority) }}
            </span>
            <span class="notice-time">{{ formatTime(item.publishTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知详情弹窗 -->
    <div v-if="showDetail" class="modal">
      <div class="modal-content">
        <h3>{{ currentNotice.title }}</h3>
        <div class="detail-meta">
          <span class="type-tag" :class="'type-' + currentNotice.noticeType.toLowerCase()">
            {{ getNoticeTypeText(currentNotice.noticeType) }}
          </span>
          <span class="priority-tag" :class="'priority-' + currentNotice.priority">
            {{ getPriorityText(currentNotice.priority) }}
          </span>
          <span class="notice-time">{{ formatTime(currentNotice.publishTime) }}</span>
        </div>
        <div class="detail-content">
          {{ currentNotice.content }}
        </div>
        <div class="modal-btns">
          <button @click="showDetail = false" class="btn-close">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMyNotices, getUnreadCount, markNoticeRead, markAllNoticeRead, getNoticeDetail } from '@/utils/api'

export default {
  name: 'MyNoticePage',
  data() {
    return {
      // 通知列表
      noticeList: [],
      // 未读数量
      unreadCount: 0,
      // 已读通知ID集合
      readNoticeIds: new Set(),
      // 筛选类型
      filterType: '',
      // 加载状态
      loading: false,
      // 详情弹窗
      showDetail: false,
      // 当前查看的通知
      currentNotice: null
    }
  },
  created() {
    this.fetchUnreadCount()
    this.fetchNotices()
  },
  methods: {
    // 获取未读数量
    fetchUnreadCount() {
      getUnreadCount()
        .then(res => {
          if (res.code === 200) {
            this.unreadCount = res.data
          }
        })
        .catch(err => {
          console.error('获取未读数量失败:', err)
        })
    },

    // 获取通知列表
    fetchNotices() {
      this.loading = true
      const params = { noticeType: this.filterType || undefined }
      getMyNotices(params)
        .then(res => {
          if (res.code === 200) {
            let data = res.data || []
            // 前端根据 noticeType 过滤，防止后端返回多余数据
            if (this.filterType) {
              data = data.filter(item => item.noticeType === this.filterType)
            }
            this.noticeList = data
          }
        })
        .catch(err => {
          console.error('获取通知列表失败:', err)
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 判断通知是否已读
    isRead(noticeId) {
      return this.readNoticeIds.has(noticeId)
    },

    // 切换筛选类型
    handleFilterChange(type) {
      this.filterType = type
      this.fetchNotices()
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

    // 获取优先级显示文本
    getPriorityText(priority) {
      const priorityMap = {
        1: '低优先级',
        2: '中优先级',
        3: '高优先级'
      }
      return priorityMap[priority] || priority
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      return timeStr.replace('T', ' ')
    },

    // 获取内容摘要
    getSummary(content) {
      if (!content) return ''
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    },

    // 点击通知项
    handleNoticeClick(notice) {
      this.fetchNoticeDetail(notice.id, notice.isRead)
    },

    // 获取通知详情
    fetchNoticeDetail(id, isRead) {
      getNoticeDetail(id)
        .then(res => {
          if (res.code === 200) {
            this.currentNotice = res.data
            this.showDetail = true
            // 如果未读，标记为已读
            if (!isRead) {
              this.markAsRead(id)
            }
          }
        })
        .catch(err => {
          console.error('获取通知详情失败:', err)
        })
    },

    // 标记单条已读
    markAsRead(id) {
      markNoticeRead(id)
        .then(res => {
          if (res.code === 200) {
            // 更新列表中的 isRead 状态
            const notice = this.noticeList.find(n => n.id === id)
            if (notice) {
              notice.isRead = true
            }
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
        })
        .catch(err => {
          console.error('标记已读失败:', err)
        })
    },

    // 全部标记已读
    handleMarkAllRead() {
      if (!confirm('确定要标记全部消息为已读吗？')) {
        return
      }

      markAllNoticeRead()
        .then(res => {
          if (res.code === 200) {
            // 更新列表中的 isRead 状态
            this.noticeList.forEach(n => n.isRead = true)
            this.unreadCount = 0
            alert('已全部标记为已读')
          } else {
            alert(res.message || '操作失败')
          }
        })
        .catch(err => {
          alert(err.message || '操作失败')
        })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.my-notice-container {
  padding: 20px;
}

/* 标题 */
.my-notice-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 顶部未读信息 */
.notice-header {
  margin-bottom: 15px;
}

.unread-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
}

.unread-badge {
  background-color: #f56c6c;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.btn-mark-all {
  padding: 5px 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
}

.btn-mark-all:hover {
  background-color: #66b1ff;
}

/* 筛选Tab */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.filter-tabs button {
  padding: 6px 14px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.filter-tabs button:hover {
  background-color: #f5f7fa;
}

.filter-tabs button.active {
  background-color: #409eff;
  color: white;
}

/* 通知列表 */
.notice-list {
  background: white;
  border-radius: 4px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 通知项 */
.notice-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notice-item:hover {
  background-color: #f5f7fa;
}

.notice-item.unread {
  background-color: #f0f9ff;
}

.notice-item.unread:hover {
  background-color: #e6f0ff;
}

.notice-icon {
  margin-right: 12px;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 5px;
}

.notice-title .unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.notice-item:not(.unread) .notice-title {
  font-weight: normal;
}

.notice-summary {
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #999;
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.priority-tag::before {
  font-size: 10px;
}

.priority-1 { background-color: #909399; }
.priority-1::before { content: '↓'; }
.priority-2 { background-color: #409eff; }
.priority-2::before { content: '→'; }
.priority-3 { background-color: #f56c6c; }
.priority-3::before { content: '!'; }

.notice-time {
  color: #999;
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
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-content {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}

.modal-btns {
  text-align: right;
  margin-top: 20px;
}

.btn-close {
  padding: 8px 20px;
  background-color: #909399;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-close:hover {
  background-color: #82848a;
}
</style>
