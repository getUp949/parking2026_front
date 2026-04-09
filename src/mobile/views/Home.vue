<script>
export default {
  name: 'MobileHomePage'
}
</script>

<template>
  <div class="mobile-home">
    <div class="home-content">
      <div class="user-welcome">
        <h3>欢迎使用</h3>
        <p class="role-badge">停车场管理系统</p>
      </div>
      <div class="menu-grid">
        <div class="menu-item" @click="$router.push('/mobile/entry')">
          <div class="menu-icon entry-icon">入</div>
          <span>车辆入场</span>
        </div>
        <div class="menu-item" @click="$router.push('/mobile/exit')">
          <div class="menu-icon exit-icon">出</div>
          <span>车辆出场</span>
        </div>
        <div class="menu-item" @click="$router.push('/mobile/reservations')">
          <div class="menu-icon reservation-icon">预</div>
          <span>我的预约</span>
        </div>
        <div class="menu-item" @click="$router.push('/mobile/vehicles')">
          <div class="menu-icon vehicle-icon">车</div>
          <span>我的车辆</span>
        </div>
        <div class="menu-item" @click="$router.push('/mobile/notices')">
          <div class="menu-icon notice-icon">通</div>
          <span>我的通知</span>
        </div>
        <div class="menu-item" @click="$router.push('/mobile/profile')">
          <div class="menu-icon profile-icon">人</div>
          <span>个人信息</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-home {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 60px;
}

.home-content {
  padding: 20px 16px;
}

.user-welcome {
  margin-bottom: 20px;
}

.user-welcome h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  background: #f5f5f5;
  color: #666;
  font-size: 12px;
  margin: 0;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.menu-item {
  border: 1px solid #eee;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.menu-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.entry-icon { background: #2b2b2b; }
.exit-icon { background: #2b2b2b; }
.reservation-icon { background: #2b2b2b; }
.vehicle-icon { background: #2b2b2b; }
.notice-icon { background: #2b2b2b; }
.profile-icon { background: #2b2b2b; }

.menu-item span {
  font-size: 13px;
  color: #333;
}
</style>
