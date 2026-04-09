<style scoped>
.mobile-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  border-top: 1px solid #eee;
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
}

.tab-item.active {
  color: #000;
}

.tab-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ddd;
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.tab-item.active .tab-icon {
  background: #000;
}

.tab-item span {
  font-size: 10px;
}
</style>
