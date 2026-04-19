<template>
  <div id="app">
    <!-- 顶部导航栏（登录后显示） -->
    <nav v-if="$store.state.isLoggedIn" class="navbar">
      <div class="nav-left">
        <span class="app-title">停车场管理系统</span>
      </div>
      <div class="nav-right">
        <!-- 所有用户都有的菜单 -->
        <router-link to="/user">用户信息</router-link>

        <!-- 管理员专属菜单 -->
        <router-link v-if="isAdmin" to="/users">用户管理</router-link>
        <router-link v-if="isAdmin" to="/vehicles">车辆管理</router-link>
        <router-link v-if="isAdmin" to="/parking/areas">区域管理</router-link>
        <router-link v-if="isAdmin" to="/reservations">预约管理</router-link>

        <!-- 保安专属菜单（也包含在管理员的入场出场中） -->
        <router-link v-if="isAdmin || isSecurity" to="/vehicle/entry">车辆入场</router-link>
        <router-link v-if="isAdmin || isSecurity" to="/vehicle/exit">车辆出场</router-link>

        <!-- 管理员专属菜单 - 通知管理 -->
        <router-link v-if="isAdmin" to="/notices">通知管理</router-link>

        <!-- 所有用户都可以查看自己的消息 -->
        <router-link to="/my-notices">
          消息中心
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </router-link>

        <!-- 业主专属菜单 -->
        <router-link v-if="isOwner" to="/my-reservations">我的预约</router-link>
        <router-link v-if="isOwner" to="/my-vehicles">我的车辆</router-link>

        <!-- 退出登录 -->
        <a href="javascript:;" @click="handleLogout">退出登录</a>
      </div>
    </nav>
    
    <!-- 路由视图 - 展示页面内容 -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      // 未读消息数量
      unreadCount: 0
    }
  },
  computed: {
    // 判断是否是管理员
    isAdmin() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
      return userInfo && userInfo.role === 'admin'
    },
    // 判断是否是保安
    isSecurity() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
      return userInfo && userInfo.role === 'security'
    },
    // 判断是否是业主
    isOwner() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
      return userInfo && userInfo.role === 'owner'
    }
  },
  created() {
    this.fetchUnreadCount()
  },
  methods: {
    // 获取未读消息数量
    fetchUnreadCount() {
      const token = localStorage.getItem('token')
      if (!token) return
      // 动态导入API
      import('@/utils/api').then(api => {
        api.getUnreadCount()
          .then(res => {
            if (res.code === 200) {
              this.unreadCount = res.data
            }
          })
          .catch(err => {
            console.error('获取未读消息数失败:', err)
          })
      })
    },
    // 退出登录
    handleLogout() {
      if (!confirm('确定要退出登录吗？')) {
        return
      }
      // 调用vuex的退出登录action
      this.$store.dispatch('handleLogout')
        .then(() => {
          // 清除用户信息
          localStorage.removeItem('userInfo')
          // 退出登录，刷新浏览器
          window.location.reload()
        })
    }
  }
}
</script>

<style>
/* 全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

/* 顶部导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  background-color: #409eff;
  color: white;
}

.nav-left .app-title {
  font-size: 16px;
  font-weight: bold;
}

.nav-right a {
  color: white;
  text-decoration: none;
  margin-left: 20px;
}

.nav-right a:hover {
  text-decoration: underline;
}

/* 未读消息红点 */
.unread-badge {
  display: inline-block;
  background-color: #f56c6c;
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 4px;
  vertical-align: middle;
}
</style>
