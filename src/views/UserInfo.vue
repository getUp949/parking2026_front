<template>
  <div class="user-info-container">
    <div class="user-info-box">
      <h2>用户信息</h2>
      
      <!-- 加载中显示 -->
      <div v-if="loading" class="loading">加载中...</div>
      
      <!-- 用户信息展示 -->
      <div v-else-if="userInfo" class="user-info">
        <!-- 用户名 -->
        <div class="info-item">
          <label>用户名：</label>
          <span>{{ userInfo.username }}</span>
        </div>
        
        <!-- 真实姓名 -->
        <div class="info-item">
          <label>真实姓名：</label>
          <span>{{ userInfo.realName || '未填写' }}</span>
        </div>
        
        <!-- 手机号 -->
        <div class="info-item">
          <label>手机号：</label>
          <span>{{ userInfo.phone || '未填写' }}</span>
        </div>
        
        <!-- 角色 -->
        <div class="info-item">
          <label>角色：</label>
          <span class="role">{{ getRoleText(userInfo.role) }}</span>
        </div>
        
        <!-- 状态 -->
        <div class="info-item">
          <label>状态：</label>
          <span :class="['status', userInfo.status === 1 ? 'active' : 'inactive']">
            {{ userInfo.status === 1 ? '正常' : '禁用' }}
          </span>
        </div>
        
        <!-- 创建时间 -->
        <div class="info-item">
          <label>注册时间：</label>
          <span>{{ formatTime(userInfo.createTime) }}</span>
        </div>
        
        <!-- 操作按钮 -->
        <div class="actions">
          <button @click="handleLogout" class="btn-logout">退出登录</button>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script>
import { getUserInfo, logout } from '@/utils/api'

export default {
  name: 'UserInfo',
  data() {
    return {
      // 用户信息
      userInfo: null,
      // 加载状态
      loading: false,
      // 错误信息
      errorMsg: ''
    }
  },
  // 组件创建时获取用户信息
  created() {
    this.fetchUserInfo()
  },
  methods: {
    // 获取用户信息
    fetchUserInfo() {
      this.loading = true
      this.errorMsg = ''
      
      getUserInfo()
        .then(res => {
          if (res.code === 200) {
            this.userInfo = res.data
          } else {
            this.errorMsg = res.message || '获取用户信息失败'
          }
        })
        .catch(err => {
          this.errorMsg = err.message || '网络错误'
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 获取角色显示文本
    getRoleText(role) {
      const roleMap = {
        'admin': '管理员',
        'security': '保安',
        'owner': '业主'
      }
      return roleMap[role] || role
    },

    // 格式化时间显示 (2026-04-22T20:50:25 -> 2026-04-22 20:50:25)
    formatTime(timeStr) {
      if (!timeStr) return '-'
      return timeStr.replace('T', ' ')
    },

    // 退出登录
    handleLogout() {
      if (!confirm('确定要退出登录吗？')) {
        return
      }
      
      logout()
        .finally(() => {
          // 无论成功失败都清除token并刷新
          localStorage.removeItem('token')
          window.location.reload()
        })
    }
  }
}
</script>

<style scoped>
/* 用户信息容器 */
.user-info-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 用户信息框 */
.user-info-box {
  width: 400px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.user-info-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

/* 加载中 */
.loading {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* 信息项 */
.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.info-item label {
  color: #666;
  width: 100px;
  flex-shrink: 0;
}

.info-item span {
  color: #333;
}

/* 角色样式 */
.role {
  padding: 2px 8px;
  background-color: #409eff;
  color: white;
  border-radius: 3px;
  font-size: 12px;
}

/* 状态样式 */
.status {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.status.active {
  background-color: #67c23a;
  color: white;
}

.status.inactive {
  background-color: #f56c6c;
  color: white;
}

/* 按钮区域 */
.actions {
  margin-top: 30px;
  text-align: center;
}

/* 退出登录按钮 */
.btn-logout {
  padding: 10px 30px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-logout:hover {
  background-color: #f78989;
}

/* 错误提示 */
.error-msg {
  color: #f56c6c;
  text-align: center;
  margin-top: 15px;
}
</style>
