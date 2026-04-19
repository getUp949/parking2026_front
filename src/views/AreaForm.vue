<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? '编辑区域' : '新增区域' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <!-- 区域代码 -->
        <div class="form-item">
          <label>区域代码 <span class="required">*</span></label>
          <input 
            v-model="form.areaCode" 
            type="text" 
            placeholder="请输入区域代码，如：A"
            required
          />
        </div>
        
        <!-- 区域名称 -->
        <div class="form-item">
          <label>区域名称 <span class="required">*</span></label>
          <input 
            v-model="form.areaName" 
            type="text" 
            placeholder="请输入区域名称，如：A区"
            required
          />
        </div>
        
        <!-- 总车位数 -->
        <div class="form-item">
          <label>总车位数 <span class="required">*</span></label>
          <input 
            v-model.number="form.totalSpaces" 
            type="number" 
            placeholder="请输入总车位数"
            min="1"
            required
          />
        </div>
        
        <!-- 描述 -->
        <div class="form-item">
          <label>描述</label>
          <textarea 
            v-model="form.description" 
            placeholder="请输入描述信息"
            rows="3"
          ></textarea>
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
// 引入API方法
import { createArea, updateArea } from '@/utils/api'

export default {
  name: 'AreaForm',
  props: {
    areaData: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        areaCode: '',
        areaName: '',
        totalSpaces: null,
        description: ''
      },
      loading: false
    }
  },
  watch: {
    areaData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = {
            areaCode: newVal.areaCode || '',
            areaName: newVal.areaName || '',
            totalSpaces: newVal.totalSpaces || null,
            description: newVal.description || ''
          }
        } else {
          this.form = {
            areaCode: '',
            areaName: '',
            totalSpaces: null,
            description: ''
          }
        }
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    
    handleSubmit() {
      if (!this.form.areaCode || !this.form.areaName || !this.form.totalSpaces) {
        alert('请填写必填字段')
        return
      }
      
      this.loading = true
      
      const promise = this.isEdit 
        ? updateArea({
            id: this.areaData.id,
            areaCode: this.form.areaCode,
            areaName: this.form.areaName,
            totalSpaces: this.form.totalSpaces,
            description: this.form.description
          })
        : createArea({
            areaCode: this.form.areaCode,
            areaName: this.form.areaName,
            totalSpaces: this.form.totalSpaces,
            description: this.form.description
          })
      
      promise
        .then(res => {
          if (res.code === 200) {
            alert(this.isEdit ? '更新成功' : '创建成功')
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
  width: 450px;
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

.form-item input,
.form-item textarea,
.form-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-item input:focus,
.form-item textarea:focus,
.form-item select:focus {
  outline: none;
  border-color: #409eff;
}

.form-item textarea {
  resize: vertical;
  font-family: inherit;
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
