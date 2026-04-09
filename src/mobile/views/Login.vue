<template>
  <div style="padding: 50px 20px; background: #fff;">
    <h2 style="text-align: center; font-size: 20px; margin-bottom: 10px;">停车场管理系统</h2>
    <p style="text-align: center; color: #999; font-size: 13px; margin-bottom: 30px;">移动端登录</p>

    <form @submit.prevent="handleLogin">
      <div style="margin-bottom: 20px;">
        <input
          v-model="loginForm.username"
          type="text"
          placeholder="请输入用户名"
          required
          style="width: 100%; padding: 12px; border: 1px solid #ddd; font-size: 14px;"
        />
      </div>

      <div style="margin-bottom: 20px;">
        <input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          required
          style="width: 100%; padding: 12px; border: 1px solid #ddd; font-size: 14px;"
        />
      </div>

      <button type="submit" style="width: 100%; padding: 12px; background: #000; color: #fff; border: none; font-size: 15px;">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>

<script>
import { login } from '@/utils/api'

export default {
  name: 'MobileLogin',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.loading = true
      login(this.loginForm)
        .then(res => {
          if (res.code === 200) {
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userInfo', JSON.stringify(res.data.user))
            this.$store.commit('SET_USER_INFO', res.data.user)
            this.$store.commit('SET_LOGGED_IN', true)
            // 登录成功，刷新浏览器
            window.location.reload()
          } else {
            alert(res.message || '登录失败')
          }
        })
        .catch(() => {
          alert('登录失败，请检查网络')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.mobile-login {
  padding: 50px 20px;
  background: #fff;
}

.login-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 10px;
}

.login-subtitle {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-bottom: 30px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #000;
  color: #fff;
  border: none;
  font-size: 15px;
}
</style>