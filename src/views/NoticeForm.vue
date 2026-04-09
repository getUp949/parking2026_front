<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? '编辑通知' : '创建通知（保存草稿）' }}</h3>
      <p class="form-tip" v-if="!isEdit">提示：创建后会保存为草稿状态，需在列表中点击"发布"按钮正式发布</p>

      <div class="form-item">
        <label>标题 <span class="required">*</span>：</label>
        <input
          v-model="formData.title"
          type="text"
          placeholder="请输入通知标题"
          maxlength="100"
        />
      </div>

      <div class="form-item">
        <label>通知类型 <span class="required">*</span>：</label>
        <select v-model="formData.noticeType">
          <option value="">请选择类型</option>
          <option value="system">系统公告</option>
          <option value="parking_rule">停车规则</option>
          <option value="maintenance">维护通知</option>
          <option value="emergency">紧急通知</option>
          <option value="event">活动通知</option>
        </select>
      </div>

      <div class="form-item">
        <label>目标类型：</label>
        <select v-model="formData.targetType">
          <option value="all">全部</option>
          <option value="owner">车主</option>
          <option value="security">保安</option>
          <option value="area">区域</option>
        </select>
      </div>

      <div class="form-item" v-if="formData.targetType === 'area'">
        <label>区域ID列表：</label>
        <input
          v-model="formData.targetAreaIds"
          type="text"
          placeholder="请输入区域ID，多个用逗号分隔"
        />
      </div>

      <div class="form-item">
        <label>优先级：</label>
        <select v-model="formData.priority">
          <option :value="1">低优先级</option>
          <option :value="2">中优先级</option>
          <option :value="3">高优先级</option>
        </select>
      </div>

      <div class="form-item">
        <label>过期时间：</label>
        <input
          v-model="formData.expireTime"
          type="datetime-local"
        />
      </div>

      <div class="form-item">
        <label>内容 <span class="required">*</span>：</label>
        <textarea
          v-model="formData.content"
          placeholder="请输入通知内容"
          rows="6"
        ></textarea>
      </div>

      <div class="modal-btns">
        <button @click="handleCancel" class="btn-cancel">取消</button>
        <button @click="handleSubmit" class="btn-confirm" :disabled="submitting">
          {{ submitting ? '提交中...' : (isEdit ? '保存' : '保存草稿') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { createNotice, updateNotice } from '@/utils/api'

export default {
  name: 'NoticeForm',
  props: {
    // 编辑时传入的通知数据
    noticeData: {
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
      formData: {
        title: '',
        content: '',
        noticeType: 'system',
        targetType: 'all',
        targetAreaIds: '',
        priority: 2,
        expireTime: ''
      },
      // 提交状态
      submitting: false
    }
  },
  created() {
    // 如果是编辑模式，填充数据
    if (this.isEdit && this.noticeData) {
      this.formData = {
        title: this.noticeData.title || '',
        content: this.noticeData.content || '',
        noticeType: this.noticeData.noticeType || 'system',
        targetType: this.noticeData.targetType || 'all',
        targetAreaIds: this.noticeData.targetAreaIds || '',
        priority: this.noticeData.priority || 2,
        expireTime: this.noticeData.expireTime ? this.noticeData.expireTime.slice(0, 16) : ''
      }
    }
  },
  methods: {
    // 取消
    handleCancel() {
      this.$emit('close')
    },

    // 提交表单
    handleSubmit() {
      // 表单验证
      if (!this.formData.title || this.formData.title.trim() === '') {
        alert('请输入通知标题')
        return
      }

      if (!this.formData.noticeType) {
        alert('请选择通知类型')
        return
      }

      if (!this.formData.content || this.formData.content.trim() === '') {
        alert('请输入通知内容')
        return
      }

      this.submitting = true

      // 处理过期时间格式
      const submitData = { ...this.formData }
      if (submitData.expireTime) {
        submitData.expireTime = submitData.expireTime.replace('T', ' ') + ':00'
      }

      // 清空区域ID列表（如果目标类型是all）
      if (submitData.targetType === 'all') {
        submitData.targetAreaIds = ''
      }

      // 调用对应的API
      const apiCall = this.isEdit
        ? updateNotice(this.noticeData.id, submitData)
        : createNotice(submitData)

      apiCall
        .then(res => {
          if (res.code === 200) {
            alert(this.isEdit ? '保存成功' : '草稿保存成功')
            this.$emit('success')
          } else {
            alert(res.message || (this.isEdit ? '保存失败' : '草稿保存失败'))
          }
        })
        .catch(err => {
          alert(err.message || (this.isEdit ? '保存失败' : '发布失败'))
        })
        .finally(() => {
          this.submitting = false
        })
    }
  }
}
</script>

<style scoped>
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

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.form-tip {
  color: #e6a23c;
  font-size: 12px;
  margin: -10px 0 15px 0;
  padding: 8px;
  background-color: #fdf6ec;
  border-radius: 4px;
}

.form-item {
  margin: 15px 0;
}

.form-item label {
  display: inline-block;
  width: 110px;
  color: #666;
  vertical-align: top;
}

.form-item .required {
  color: #f56c6c;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 300px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #409eff;
}

.form-item textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.modal-btns {
  text-align: right;
  margin-top: 25px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background-color: #909399;
  color: white;
}

.btn-cancel:hover {
  background-color: #82848a;
}

.btn-confirm {
  background-color: #409eff;
  color: white;
  margin-left: 10px;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-confirm:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>
