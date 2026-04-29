<template>
  <div class="area-status-container">
    <h2>区域车位状态</h2>
    
    <!-- 刷新按钮 -->
    <div class="action-bar">
      <button @click="fetchData" class="btn-refresh" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
      <span class="last-update" v-if="lastUpdate">
        最后更新：{{ lastUpdate }}
      </span>
    </div>
    
    <!-- 区域卡片列表 -->
    <div class="area-cards" v-if="areaList.length > 0">
      <div class="area-card" v-for="area in areaList" :key="area.id">
        <div class="area-header">
          <h3>{{ area.areaName }}</h3>
          <span class="area-code">{{ area.areaCode }}</span>
        </div>
        
        <div class="area-stats">
          <div class="stat-item">
            <div class="stat-value">{{ area.totalSpaces || 0 }}</div>
            <div class="stat-label">总车位</div>
          </div>
          <div class="stat-item occupied">
            <div class="stat-value">{{ area.occupiedSpaces || 0 }}</div>
            <div class="stat-label">已占用</div>
          </div>
          <div class="stat-item available">
            <div class="stat-value">{{ (area.totalSpaces || 0) - (area.occupiedSpaces || 0) - (area.reservedSpaces || 0) }}</div>
            <div class="stat-label">可用</div>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-bar">
          <div 
            class="progress-occupied" 
            :style="{ width: getOccupiedPercent(area) + '%' }"
          ></div>
          <div 
            class="progress-reserved" 
            :style="{ width: getReservedPercent(area) + '%' }"
          ></div>
        </div>
        
        <!-- 占用比例文字 -->
        <div class="usage-text">
          已占用 {{ area.occupiedSpaces || 0 }} / {{ area.totalSpaces || 0 }} ({{ getOccupiedPercent(area) }}%)
        </div>
      </div>
    </div>
    
    <!-- 无数据 -->
    <div v-else-if="!loading" class="empty-tip">
      暂无区域数据
    </div>
    
    <!-- 加载中 -->
    <div v-else class="loading-tip">
      加载中...
    </div>
  </div>
</template>

<script>
import { getAreaList } from '@/utils/api'

export default {
  name: 'AreaStatusPage',
  data() {
    return {
      areaList: [],
      loading: false,
      lastUpdate: ''
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      getAreaList()
        .then(res => {
          if (res.code === 200) {
            this.areaList = res.data || []
            // 更新时间
            const now = new Date()
            this.lastUpdate = now.toLocaleTimeString()
          }
        })
        .catch(err => {
          console.error('获取区域列表失败', err)
          alert('获取数据失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    getOccupiedPercent(area) {
      const total = area.totalSpaces || 0
      if (total === 0) return 0
      const occupied = area.occupiedSpaces || 0
      return Math.round((occupied / total) * 100)
    },
    
    getReservedPercent(area) {
      const total = area.totalSpaces || 0
      if (total === 0) return 0
      const reserved = area.reservedSpaces || 0
      return Math.round((reserved / total) * 100)
    }
  }
}
</script>

<style scoped>
.area-status-container {
  padding: 20px;
}

.area-status-container h2 {
  margin-bottom: 20px;
  color: #333;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-refresh {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #409eff;
  color: white;
  font-size: 14px;
}

.btn-refresh:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.last-update {
  color: #999;
  font-size: 13px;
}

/* 区域卡片列表 */
.area-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.area-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.area-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.area-code {
  background-color: #f0f0f0;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 统计项 */
.area-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-item.occupied .stat-value {
  color: #f56c6c;
}

.stat-item.available .stat-value {
  color: #67c23a;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 5px;
}

/* 进度条 */
.progress-bar {
  height: 8px;
  background-color: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  margin-bottom: 10px;
}

.progress-occupied {
  background-color: #f56c6c;
  height: 100%;
  transition: width 0.3s ease;
}

.progress-reserved {
  background-color: #e6a23c;
  height: 100%;
  transition: width 0.3s ease;
}

.usage-text {
  text-align: center;
  font-size: 12px;
  color: #999;
}

/* 无数据和加载中 */
.empty-tip,
.loading-tip {
  text-align: center;
  color: #999;
  padding: 60px 40px;
  background: white;
  border-radius: 8px;
}
</style>
