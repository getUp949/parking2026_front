<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? '编辑车位' : '新增车位' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <!-- 所属区域 -->
        <div class="form-item">
          <label>所属区域 <span class="required">*</span></label>
          <select v-model="form.areaId" required :disabled="isEdit">
            <option value="">请选择区域</option>
            <option v-for="area in areaList" :key="area.id" :value="area.id">
              {{ area.areaName }}
            </option>
          </select>
        </div>
        
        <!-- 车位编号 -->
        <div class="form-item">
          <label>车位编号 <span class="required">*</span></label>
          <input 
            v-model="form.spaceNumber" 
            type="text" 
            placeholder="请输入车位编号，如：A001"
            required
          />
        </div>
        
        <!-- 位置 -->
        <div class="form-item">
          <label>位置</label>
          <select v-model="form.position">
            <option value="">请选择位置</option>
            <option value="地上">地上</option>
            <option value="地下">地下</option>
          </select>
        </div>
        
        <!-- 状态（仅编辑时显示） -->
        <div class="form-item" v-if="isEdit">
          <label>状态</label>
          <select v-model.number="form.status">
            <option :value="0">空闲</option>
            <option :value="1">已占用</option>
            <option :value="2">预留</option>
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
import { createSpace, updateSpace } from '@/utils/api'

export default {
  name: 'SpaceForm',
  props: {
    spaceData: {
      type: Object,
      default: null
    },
    areaList: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        areaId: '',
        spaceNumber: '',
        position: '',
        status: 0
      },
      loading: false
    }
  },
  watch: {
    spaceData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = {
            areaId: newVal.areaId || '',
            spaceNumber: newVal.spaceNumber || '',
            position: newVal.position || '',
            status: newVal.status !== undefined ? newVal.status : 0
          }
        } else {
          this.form = {
            areaId: this.areaList.length > 0 ? this.areaList[0].id : '',
            spaceNumber: '',
            position: '',
            status: 0
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
      if (!this.form.areaId || !this.form.spaceNumber) {
        alert('请填写必填字段')
        return
      }
      
      this.loading = true
      
      const promise = this.isEdit
        ? updateSpace({
            id: this.spaceData.id,
            spaceNumber: this.form.spaceNumber,
            position: this.form.position,
            status: this.form.status
          })
        : createSpace({
            areaId: this.form.areaId,
            spaceNumber: this.form.spaceNumber,
            position: this.form.position
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
