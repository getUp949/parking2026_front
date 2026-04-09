<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? '编辑用户' : '新增用户' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <!-- 用户名 - 新增时必填 -->
        <div class="form-item">
          <label>用户名 <span v-if="!isEdit" class="required">*</span></label>
          <input 
            v-model="form.username" 
            type="text" 
            :placeholder="isEdit ? '不可修改' : '仅允许英文、数字、下划线'"
            :disabled="isEdit"
            :required="!isEdit"
            pattern="^[a-zA-Z0-9_]{3,20}$"
            @input="validateUsername"
          />
          <span v-if="usernameError" class="field-error">{{ usernameError }}</span>
        </div>
        
        <!-- 密码 - 新增时必填 -->
        <div class="form-item" v-if="!isEdit">
          <label>密码 <span class="required">*</span></label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
          </div>
               <!-- 真实 </div>
        
姓名 -->
        <div class="form-item">
          <label>真实姓名</label>
          <input 
            v-model="form.realName" 
            type="text" 
            placeholder="请输入真实姓名"
          />
        </div>
        
        <!-- 手机号 -->
        <div class="form-item">
          <label>手机号</label>
          <input 
            v-model="form.phone" 
            type="text" 
            placeholder="请输入手机号"
            maxlength="11"
          />
        </div>
        
        <!-- 角色 -->
        <div class="form-item">
          <label>角色 <span class="required">*</span></label>
          <select v-model="form.role" required>
            <option value="">请选择角色</option>
            <option value="admin">管理员</option>
            <option value="security">保安</option>
            <option value="owner">业主</option>
          </select>
        </div>
        
        <!-- 按钮 -->
        <div class="form-btns">
          <button type="button" @click="handleClose" class="btn-cancel">取消</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? '提交中...' : '提交' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { createUser, updateUser } from '@/utils/api'

export default {
  name: 'UserForm',
  // 接收父组件传递的数据
  props: {
    // 要编辑的用户数据，null表示新增
    userData: {
      type: Object,
      default: null
    },
    // 是否是编辑模式
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 表单数据
      form: {
        username: '',
        password: '',
        realName: '',
        phone: '',
        role: ''
      },
      // 用户名校验错误信息
      usernameError: '',
      // 加载状态
      loading: false
    }
  },
  // 监听props变化，初始化表单数据
  watch: {
    userData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // 编辑模式，填充表单数据
          this.form = {
            username: newVal.username || '',
            password: '',
            realName: newVal.realName || '',
            phone: newVal.phone || '',
            role: newVal.role || ''
          }
        } else {
          // 新增模式，重置表单
          this.form = {
            username: '',
            password: '',
            realName: '',
            phone: '',
            role: ''
          }
        }
      }
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

    // 关闭弹窗
    handleClose() {
      this.$emit('close')
    },
    
    // 提交表单
    handleSubmit() {
      // 校验用户名字符范围
      if (this.form.username && !/^[a-zA-Z0-9_]+$/.test(this.form.username)) {
        alert('用户名仅允许使用英文、数字、下划线')
        return
      }
      
      // 验证手机号格式
      if (this.form.phone && !/^1\d{10}$/.test(this.form.phone)) {
        alert('请输入正确的11位手机号')
        return
      }
      
      this.loading = true
      
      // 根据是否为编辑模式调用不同的API
      const promise = this.isEdit 
        ? updateUser(this.userData.id, {
            realName: this.form.realName,
            phone: this.form.phone,
            role: this.form.role
          })
        : createUser(this.form)
      
      promise
        .then(res => {
          if (res.code === 200) {
            alert(this.isEdit ? '更新成功' : '创建成功')
            // 通知父组件提交成功
            this.$emit('success')
          } else {
            alert(res.message || '操作失败')
          }
        })
        .catch(err => {
          alert(err.message || '操作失败')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
/* 弹窗遮罩 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 弹窗内容 */
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 400px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

/* 表单项 */
.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.required {
  color: #f56c6c;
}

.field-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-item input:focus,
.form-item select:focus {
  outline: none;
  border-color: #409eff;
}

.form-item input:disabled {
  background-color: #f5f7fa;
  color: #999;
}

/* 按钮区域 */
.form-btns {
  text-align: right;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background-color: #909399;
  color: white;
  margin-right: 10px;
}

.btn-submit {
  background-color: #409eff;
  color: white;
}

.btn-submit:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>
