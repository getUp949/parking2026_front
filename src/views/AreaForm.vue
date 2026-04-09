<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? '编辑区域' : '新增区域' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <!-- 所属小区 -->
        <div class="form-item">
          <label>所属小区 <span class="required">*</span></label>
          <select v-model="form.communityId" required>
            <option value="">请选择小区</option>
            <option v-for="community in communityList" :key="community.id" :value="community.id">
              {{ community.name }}
            </option>
          </select>
        </div>
        
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
        
        <!-- 每小时费率 -->
        <div class="form-item">
          <label>每小时费率(元)</label>
          <input 
            v-model.number="form.hourlyRate" 
            type="number" 
            placeholder="请输入每小时费率"
            min="0"
            step="0.01"
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
  // 接收父组件传递的数据
  props: {
    // 要编辑的区域数据，null表示新增
    areaData: {
      type: Object,
      default: null
    },
    // 小区列表（用于下拉选择）
    communityList: {
      type: Array,
      default: () => []
    },
    // 当前选中的小区ID（新增时默认选中）
    selectedCommunityId: {
      type: [String, Number],
      default: ''
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
        communityId: '',
        areaCode: '',
        areaName: '',
        totalSpaces: null,
        hourlyRate: null,
        description: ''
      },
      // 加载状态
      loading: false
    }
  },
  // 监听props变化，初始化表单数据
  watch: {
    areaData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // 编辑模式，填充表单数据
          this.form = {
            communityId: newVal.communityId || '',
            areaCode: newVal.areaCode || '',
            areaName: newVal.areaName || '',
            totalSpaces: newVal.totalSpaces || null,
            hourlyRate: newVal.hourlyRate || null,
            description: newVal.description || ''
          }
        } else {
          // 新增模式，使用父组件传入的默认小区ID
          this.form = {
            communityId: this.selectedCommunityId || (this.communityList.length > 0 ? this.communityList[0].id : ''),
            areaCode: '',
            areaName: '',
            totalSpaces: null,
            hourlyRate: null,
            description: ''
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
      if (!this.form.communityId || !this.form.areaCode || !this.form.areaName || !this.form.totalSpaces) {
        alert('请填写必填字段')
        return
      }
      
      this.loading = true
      
      // 根据是否为编辑模式调用不同的API
      const promise = this.isEdit 
        ? updateArea({
            id: this.areaData.id,
            communityId: this.form.communityId,
            areaCode: this.form.areaCode,
            areaName: this.form.areaName,
            totalSpaces: this.form.totalSpaces,
            hourlyRate: this.form.hourlyRate,
            description: this.form.description
          })
        : createArea({
            communityId: this.form.communityId,
            areaCode: this.form.areaCode,
            areaName: this.form.areaName,
            totalSpaces: this.form.totalSpaces,
            hourlyRate: this.form.hourlyRate,
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
