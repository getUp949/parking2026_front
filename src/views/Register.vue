<template>
  <div class="register-container">
    <div class="register-box">
      <h2>业主自助注册</h2>
      
      <!-- 注册表单 -->
      <form @submit.prevent="handleRegister">
        <!-- 用户名 - 必填，3-20字符 -->
        <div class="form-item">
          <label>用户名 <span class="required">*</span></label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="3-20字符，仅允许英文、数字、下划线"
            required
            minlength="3"
            maxlength="20"
            pattern="^[a-zA-Z0-9_]{3,20}$"
            @input="validateUsername"
          />
          <span v-if="usernameError" class="field-error">{{ usernameError }}</span>
        </div>
        
        <!-- 密码 - 必填，6-20字符 -->
        <div class="form-item">
          <label>密码 <span class="required">*</span></label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="6-20字符"
            required
            minlength="6"
            maxlength="20"
          />
        </div>
        
        <!-- 真实姓名 - 可选 -->
        <div class="form-item">
          <label>真实姓名</label>
          <input 
            v-model="form.realName" 
            type="text" 
            placeholder="请输入真实姓名"
          />
        </div>
        
        <!-- 手机号 - 可选，11位手机号 -->
        <div class="form-item">
          <label>手机号</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            placeholder="11位手机号（可选）"
            maxlength="11"
          />
        </div>
        
        <!-- 身份证号 - 可选 -->
        <div class="form-item">
          <label>身份证号</label>
          <input 
            v-model="form.idCard" 
            type="text" 
            placeholder="身份证号（可选）"
          />
        </div>
        
        <!-- 注册按钮 -->
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        
        <!-- 登录链接 -->
        <div class="form-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </form>
      
      <!-- 错误提示 -->
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      <!-- 成功提示 -->
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
    </div>
  </div>
</template>

<script>
import { register } from '@/utils/api'

export default {
  name: 'RegisterPage',
  data() {
    return {
      // 表单数据
      form: {
        username: '',
        password: '',
        realName: '',
        phone: '',
        idCard: ''
      },
      // 状态管理
      loading: false,
      errorMsg: '',
      successMsg: '',
      usernameError: ''
    }
  },
  methods: {
    // 用户名校验
    validateUsername() {
      const val = this.form.username
      if (!val) {
        this.usernameError = ''
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(val)) {
        this.usernameError = '仅允许使用英文、数字、下划线'
      } else {
        this.usernameError = ''
      }
    },

    // 处理注册提交
    handleRegister() {
      this.errorMsg = ''
      this.successMsg = ''

      // 校验用户名字符范围
      if (this.form.username && !/^[a-zA-Z0-9_]+$/.test(this.form.username)) {
        this.errorMsg = '用户名仅允许使用英文、数字、下划线'
        return
      }
      
      // 验证手机号格式（如果填写了的话）
      if (this.form.phone && !/^1\d{10}$/.test(this.form.phone)) {
        this.errorMsg = '请输入正确的11位手机号'
        return
      }
      
      // 设置加载状态
      this.loading = true
      
      // 调用注册API
      register(this.form)
        .then(res => {
          // code为200表示成功
          if (res.code === 200) {
            this.successMsg = '注册成功，请登录'
            // 1.5秒后自动跳转到登录页
            setTimeout(() => {
              this.$router.push('/login')
            }, 1500)
          } else {
            // 后端返回错误信息
            this.errorMsg = res.message || '注册失败'
          }
        })
        .catch(err => {
          // 请求出错
          this.errorMsg = err.message || '网络错误，请稍后重试'
        })
        .finally(() => {
          // 结束加载状态
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
/* 注册容器 - 全屏居中 */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 注册框样式 */
.register-box {
  width: 350px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.register-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

/* 表单项样式 */
.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

/* 必填星号 */
.required {
  color: #f56c6c;
}

.field-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
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

/* 注册按钮 */
.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
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

/* 错误提示 - 红色 */
.error-msg {
  color: #f56c6c;
  text-align: center;
  margin-top: 15px;
}

/* 成功提示 - 绿色 */
.success-msg {
  color: #67c23a;
  text-align: center;
  margin-top: 15px;
}
</style>
