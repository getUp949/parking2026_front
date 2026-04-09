<style scoped>
.mobile-my-vehicle {
  min-height: 100vh;
  background-color: #fff;
}

.list-content {
  padding: 16px;
}

.add-btn {
  background: #fff;
  border: 1px solid #000;
  color: #000;
  text-align: center;
  padding: 12px;
  font-size: 14px;
  margin-bottom: 16px;
  cursor: pointer;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.vehicle-list {
  display: flex;
  flex-direction: column;
}

.vehicle-item {
  border-bottom: 1px solid #eee;
  padding: 14px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-item:first-child {
  border-top: 1px solid #eee;
}

.vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.plate-number {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.vehicle-type {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  padding: 6px 12px;
  background: #fff;
  color: #000;
  border: 1px solid #000;
  font-size: 12px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  width: 85%;
  max-width: 320px;
  padding: 24px;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 1px solid #ddd;
  font-size: 15px;
  background: transparent;
  outline: none;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 10px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
}

.confirm-btn {
  background: #000;
  color: #fff;
}
</style>
