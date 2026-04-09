<template>
  <div class="login-container">
    <!-- 登录表单容器 -->
    <div class="login-box">
      <h2>停车场管理系统</h2>
      <h3>登录</h3>
      
      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin">
        <!-- 用户名输入框 -->
        <div class="form-item">
          <label>用户名</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <!-- 密码输入框 -->
        <div class="form-item">
          <label>密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <!-- 登录按钮 -->
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <!-- 注册链接 -->
        <div class="form-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
      </form>
      
      <!-- 错误提示 -->
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script>
import { login, getUserInfo } from '@/utils/api'

export default {
  name: 'LoginPage',
  data() {
    return {
      // 表单数据
      form: {
        username: '',
        password: ''
      },
      // 加载状态
      loading: false,
      // 错误信息
      errorMsg: ''
    }
  },
  methods: {
    // 处理登录提交
    handleLogin() {
      // 清空之前的错误信息
      this.errorMsg = ''
      // 设置加载状态
      this.loading = true
      
      // 调用登录API
      login(this.form)
        .then(res => {
          // 登录成功，res就是后端返回的token
          // code为200表示成功
          if (res.code === 200) {
            // 将token保存到localStorage
            localStorage.setItem('token', res.data)
            // 获取用户信息并保存
            return getUserInfo()
          } else {
            // 后端返回错误信息
            this.errorMsg = res.message || '登录失败'
            return Promise.reject(new Error(res.message))
          }
        })
        .then(res => {
          // 保存用户信息到localStorage
          if (res.code === 200) {
            localStorage.setItem('userInfo', JSON.stringify(res.data))
          }
          // 登录成功，刷新浏览器
          window.location.reload()
        })
        .catch(err => {
          // 请求出错（如果不是因为登录失败导致的）
          if (err.message && !this.errorMsg) {
            this.errorMsg = err.message || '网络错误，请稍后重试'
          }
        })
        .finally(() => {
          // 不管成功还是失败，都结束加载状态
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
/* 登录容器 - 全屏居中 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 登录框样式 */
.login-box {
  width: 350px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.login-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.login-box h3 {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

/* 表单项样式 */
.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.form-item input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-item input:focus {
  outline: none;
  border-color: #409eff;
}

/* 登录按钮 */
.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* 底部链接 */
.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.form-footer a {
  color: #409eff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* 错误提示 */
.error-msg {
  color: #f56c6c;
  text-align: center;
  margin-top: 15px;
}
</style>
