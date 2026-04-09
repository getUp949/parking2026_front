<style scoped>
.mobile-my-notice {
  min-height: 100vh;
  background-color: #fff;
}

.list-content {
  padding: 16px;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.notice-list {
  display: flex;
  flex-direction: column;
}

.notice-item {
  border-bottom: 1px solid #eee;
  padding: 14px 0;
  cursor: pointer;
}

.notice-item:first-child {
  border-top: 1px solid #eee;
}

.notice-item.unread .notice-title {
  font-weight: 600;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.notice-title {
  font-size: 15px;
  color: #000;
  flex: 1;
  margin-right: 12px;
}

.notice-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.notice-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
