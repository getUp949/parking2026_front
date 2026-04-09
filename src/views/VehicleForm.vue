<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ isEdit ? '编辑车辆' : '添加车辆' }}</h3>
      
      <form @submit.prevent="handleSubmit">
        <!-- 车牌号 - 新增时必填 -->
        <div class="form-item">
          <label>车牌号 <span v-if="!isEdit" class="required">*</span></label>
          <input 
            v-model="form.licensePlate" 
            type="text" 
            :placeholder="isEdit ? '不可修改' : '如：京A12345'"
            :disabled="isEdit"
            :required="!isEdit"
          />
        </div>
        
        <!-- 车辆品牌 -->
        <div class="form-item">
          <label>车辆品牌</label>
          <input 
            v-model="form.vehicleBrand" 
            type="text" 
            placeholder="如：宝马"
          />
        </div>
        
        <!-- 车辆型号 -->
        <div class="form-item">
          <label>车辆型号</label>
          <input 
            v-model="form.vehicleModel" 
            type="text" 
            placeholder="如：X5"
          />
        </div>
        
        <!-- 车辆颜色 -->
        <div class="form-item">
          <label>车辆颜色</label>
          <input 
            v-model="form.vehicleColor" 
            type="text" 
            placeholder="如：黑色"
          />
        </div>
        
        <!-- 车辆类型 -->
        <div class="form-item">
          <label>车辆类型</label>
          <select v-model="form.vehicleType">
            <option value="">请选择类型</option>
            <option value="small">小型车</option>
            <option value="medium">中型车</option>
            <option value="large">大型车</option>
            <option value="suv">SUV</option>
            <option value="mpv">MPV</option>
          </select>
        </div>
        
        <!-- 提示信息 -->
        <p v-if="!isEdit" class="tip">
          提交后将进入待审核状态，请耐心等待管理员审核。
        </p>
        
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
import { addVehicle, updateVehicle } from '@/utils/api'

export default {
  name: 'VehicleForm',
  // 接收父组件传递的数据
  props: {
    // 要编辑的车辆数据，null表示新增
    vehicleData: {
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
        licensePlate: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleColor: '',
        vehicleType: ''
      },
      // 加载状态
      loading: false
    }
  },
  // 监听props变化，初始化表单数据
  watch: {
    vehicleData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // 编辑模式，填充表单数据
          this.form = {
            licensePlate: newVal.licensePlate || '',
            vehicleBrand: newVal.vehicleBrand || '',
            vehicleModel: newVal.vehicleModel || '',
            vehicleColor: newVal.vehicleColor || '',
            vehicleType: newVal.vehicleType || ''
          }
        } else {
          // 新增模式，重置表单
          this.form = {
            licensePlate: '',
            vehicleBrand: '',
            vehicleModel: '',
            vehicleColor: '',
            vehicleType: ''
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
      // 验证车牌号
      if (!this.form.licensePlate) {
        alert('请输入车牌号')
        return
      }
      
      this.loading = true
      
      // 根据是否为编辑模式调用不同的API
      const promise = this.isEdit 
        ? updateVehicle(this.vehicleData.id, {
            vehicleBrand: this.form.vehicleBrand,
            vehicleModel: this.form.vehicleModel,
            vehicleColor: this.form.vehicleColor
          })
        : addVehicle(this.form)
      
      promise
        .then(res => {
          if (res.code === 200) {
            alert(this.isEdit ? '更新成功' : '添加成功！请等待审核')
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

/* 提示信息 */
.tip {
  color: #e6a23c;
  font-size: 13px;
  margin: 10px 0;
  padding: 10px;
  background-color: #fdf6ec;
  border-radius: 4px;
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
