<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? '编辑小区' : '新增小区' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <!-- 小区名称 -->
        <div class="form-item">
          <label>小区名称 <span class="required">*</span></label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="请输入小区名称"
            required
          />
        </div>
        
        <!-- 小区地址 -->
        <div class="form-item">
          <label>小区地址</label>
          <input 
            v-model="form.address" 
            type="text" 
            placeholder="请输入小区地址"
          />
        </div>
        
        <!-- 总面积 -->
        <div class="form-item">
          <label>总面积(m²)</label>
          <input 
            v-model.number="form.totalArea" 
            type="number" 
            placeholder="请输入总面积"
            min="0"
            step="0.01"
          />
        </div>
        
        <!-- 楼栋数量 -->
        <div class="form-item">
          <label>楼栋数量</label>
          <input 
            v-model.number="form.buildingCount" 
            type="number" 
            placeholder="请输入楼栋数量"
            min="0"
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
        
        <!-- 状态（仅编辑时显示） -->
        <div class="form-item" v-if="isEdit">
          <label>状态</label>
          <select v-model.number="form.status">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
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
// 引入API方法
import { createCommunity, updateCommunity } from '@/utils/api'

export default {
  name: 'CommunityForm',
  // 接收父组件传递的数据
  props: {
    // 要编辑的小区数据，null表示新增
    communityData: {
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
        name: '',
        address: '',
        totalArea: null,
        buildingCount: null,
        description: '',
        status: 1
      },
      // 加载状态
      loading: false
    }
  },
  // 监听props变化，初始化表单数据
  watch: {
    communityData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // 编辑模式，填充表单数据
          this.form = {
            name: newVal.name || '',
            address: newVal.address || '',
            totalArea: newVal.totalArea || null,
            buildingCount: newVal.buildingCount || null,
            description: newVal.description || '',
            status: newVal.status !== undefined ? newVal.status : 1
          }
        } else {
          // 新增模式，重置表单
          this.form = {
            name: '',
            address: '',
            totalArea: null,
            buildingCount: null,
            description: '',
            status: 1
          }
        }
      }
    }
  },
  methods: {
    // 关闭弹窗
    handleClose() {
      this.$emit('close')
    },
    
    // 提交表单
    handleSubmit() {
      // 验证必填字段
      if (!this.form.name) {
        alert('请填写小区名称')
        return
      }
      
      this.loading = true
      
      // 根据是否为编辑模式调用不同的API
      const promise = this.isEdit
        ? updateCommunity(this.communityData.id, {
            name: this.form.name,
            address: this.form.address,
            totalArea: this.form.totalArea,
            buildingCount: this.form.buildingCount,
            description: this.form.description,
            status: this.form.status
          })
        : createCommunity({
            name: this.form.name,
            address: this.form.address,
            totalArea: this.form.totalArea,
            buildingCount: this.form.buildingCount,
            description: this.form.description
          })
      
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
