<style scoped>
.mobile-my-reservation {
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

.reservation-list {
  display: flex;
  flex-direction: column;
}

.reservation-item {
  border-bottom: 1px solid #eee;
  padding: 14px 0;
}

.reservation-item:first-child {
  border-top: 1px solid #eee;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-badge {
  padding: 2px 8px;
  font-size: 12px;
  color: #fff;
}

.status-pending { background: #666; }
.status-active { background: #000; }
.status-completed { background: #999; }
.status-cancelled { background: #ccc; }

.date {
  font-size: 12px;
  color: #999;
}

.item-body p {
  margin: 3px 0;
  font-size: 13px;
  color: #333;
}
</style>
