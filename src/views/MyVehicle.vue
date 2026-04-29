<template>
  <div class="my-vehicle-container">
    <h2>我的车辆</h2>
    
    <!-- 添加车辆按钮 - 只有限制：每位业主只能添加一辆车辆 -->
    <div class="toolbar" v-if="vehicleList.length === 0">
      <button @click="handleAdd" class="btn-add">+ 添加车辆</button>
      <span class="vehicle-limit-tip">每位业主最多可登记1辆车辆</span>
    </div>
    
    <!-- 车辆列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="vehicleList.length === 0" class="empty">
      <p>您还没有登记车辆</p>
      <button @click="handleAdd" class="btn-add">添加车辆</button>
      <p class="vehicle-limit-tip">每位业主最多可登记1辆车辆</p>
    </div>
    
    <!-- 车辆卡片列表 -->
    <div v-else class="vehicle-cards">
      <div 
        v-for="item in vehicleList" 
        :key="item.id" 
        class="vehicle-card"
      >
        <div class="card-header">
          <span class="plate-number">{{ item.licensePlate }}</span>
          <span v-if="item.isDefault === 1" class="default-badge">默认</span>
          <span class="status-badge" :class="'status-' + item.status">
            {{ getStatusText(item.status) }}
          </span>
        </div>
        
        <div class="card-body">
          <div class="info-row">
            <span class="label">品牌：</span>
            <span>{{ item.vehicleBrand || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">型号：</span>
            <span>{{ item.vehicleModel || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">颜色：</span>
            <span>{{ item.vehicleColor || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">类型：</span>
            <span>{{ getVehicleTypeText(item.vehicleType) }}</span>
          </div>
        </div>
        
        <div class="card-footer">
          <!-- 审核通过后可以编辑 -->
          <button 
            v-if="item.status === 1" 
            @click="handleEdit(item)"
            class="btn-link"
          >
            编辑
          </button>
          <button @click="handleDelete(item)" class="btn-link btn-danger">删除</button>
        </div>
      </div>
    </div>
    
    <!-- 车辆表单弹窗 -->
    <VehicleForm
      v-if="showForm"
      :vehicleData="currentVehicle"
      :isEdit="isEdit"
      @close="closeForm"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
import { getMyVehicles, deleteVehicle } from '@/utils/api'
import VehicleForm from './VehicleForm.vue'

export default {
  name: 'MyVehiclePage',
  components: {
    VehicleForm
  },
  data() {
    return {
      // 车辆列表
      vehicleList: [],
      // 加载状态
      loading: false,
      // 表单弹窗
      showForm: false,
      currentVehicle: null,
      isEdit: false
    }
  },
  created() {
    this.fetchMyVehicles()
  },
  methods: {
    // 获取我的车辆列表
    fetchMyVehicles() {
      this.loading = true
      getMyVehicles()
        .then(res => {
          if (res.code === 200) {
            this.vehicleList = res.data || []
          }
        })
        .catch(err => {
          alert(err.message || '获取车辆列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    // 获取状态显示文本
    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || status
    },
    
    // 获取车辆类型显示文本
    getVehicleTypeText(type) {
      const typeMap = {
        'car': '轿车',
        'suv': 'SUV',
        'van': '面包车/商务车',
        'other': '其他'
      }
      return typeMap[type] || type || '-'
    },
    
    // 添加车辆 - 每位业主只能添加一辆车辆
    handleAdd() {
      if (this.vehicleList.length >= 1) {
        alert('每位业主最多只能登记1辆车辆')
        return
      }
      this.currentVehicle = null
      this.isEdit = false
      this.showForm = true
    },
    
    // 编辑车辆
    handleEdit(vehicle) {
      this.currentVehicle = { ...vehicle }
      this.isEdit = true
      this.showForm = true
    },
    
    // 关闭表单弹窗
    closeForm() {
      this.showForm = false
      this.currentVehicle = null
    },
    
    // 表单提交成功
    handleFormSuccess() {
      this.closeForm()
      this.fetchMyVehicles()
    },
    
    // 删除车辆
    handleDelete(vehicle) {
      if (!confirm(`确定要删除车牌号为 "${vehicle.licensePlate}" 的车辆吗？`)) {
        return
      }
      
      deleteVehicle(vehicle.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchMyVehicles()
          } else {
            alert(res.message || '删除失败')
          }
        })
        .catch(err => {
          alert(err.message || '删除失败')
        })
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.my-vehicle-container {
  padding: 20px;
}

.my-vehicle-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 工具栏 */
.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.vehicle-limit-tip {
  color: #909399;
  font-size: 13px;
}

.btn-add {
  padding: 10px 20px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:hover {
  background-color: #85ce61;
}

/* 加载中 */
.loading {
  text-align: center;
  color: #999;
  padding: 40px;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
}

.empty p {
  color: #999;
  margin-bottom: 20px;
}

.empty .vehicle-limit-tip {
  color: #909399;
  font-size: 13px;
  margin-top: 10px;
}

/* 车辆卡片列表 */
.vehicle-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

/* 车辆卡片 */
.vehicle-card {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #409eff;
  color: white;
  gap: 10px;
}

.plate-number {
  font-size: 18px;
  font-weight: bold;
}

.default-badge {
  padding: 2px 8px;
  background-color: #67c23a;
  border-radius: 3px;
  font-size: 12px;
}

.status-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.status-0 { background-color: #e6a23c; }
.status-1 { background-color: #67c23a; }
.status-2 { background-color: #f56c6c; }

.card-body {
  padding: 15px;
}

.info-row {
  display: flex;
  padding: 6px 0;
}

.info-row .label {
  color: #666;
  width: 60px;
}

.info-row span:last-child {
  color: #333;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 15px;
  border-top: 1px solid #eee;
  gap: 10px;
}

.card-footer .btn-link {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 13px;
}

.card-footer .btn-link:hover {
  text-decoration: underline;
}

.card-footer .btn-danger {
  color: #f56c6c;
}
</style>
