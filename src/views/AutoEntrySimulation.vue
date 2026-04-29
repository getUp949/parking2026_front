<template>
  <div class="auto-entry-container">
    <h2>自动入场模拟</h2>

    <div class="entry-content">
      <!-- 左侧：图片上传区域 -->
      <div class="upload-section">
        <h3>车牌识别区域</h3>
        
        <!-- 拖拽上传区域 -->
        <div 
          class="drop-zone"
          :class="{ 'drag-over': isDragOver, 'has-image': previewUrl }"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            @change="handleFileChange"
            style="display: none"
          />
          
          <div v-if="!previewUrl" class="drop-placeholder">
            <div class="upload-icon"></div>
            <p class="main-text">拖拽图片到此处</p>
            <p class="sub-text">或点击选择文件</p>
            <p class="hint">支持 JPG、PNG 格式</p>
          </div>
          
          <div v-else class="image-preview">
            <img :src="previewUrl" alt="预览图片" />
            <button class="remove-btn" @click.stop="removeImage">×</button>
          </div>
        </div>

        <!-- 识别结果 -->
        <div v-if="lastResult" class="result-panel" :class="lastResult.success ? 'success' : 'fail'">
          <div class="result-header">
            <span class="result-icon">{{ lastResult.success ? '✅' : '❌' }}</span>
            <span class="result-title">{{ lastResult.success ? '入场成功' : '入场失败' }}</span>
          </div>
          <div class="result-info">
            <div class="result-item">
              <span class="label">车牌号：</span>
              <span class="value plate">{{ lastResult.licensePlate }}</span>
            </div>
            <div class="result-item" v-if="lastResult.confidence">
              <span class="label">置信度：</span>
              <span class="value">{{ (lastResult.confidence * 100).toFixed(1) }}%</span>
            </div>
            <div class="result-item" v-if="lastResult.entryType">
              <span class="label">入场类型：</span>
              <span class="value">{{ getTypeText(lastResult.entryType) }}</span>
            </div>
            <div class="result-item" v-if="lastResult.color">
              <span class="label">车辆颜色：</span>
              <span class="value">{{ lastResult.color }}</span>
            </div>
            <div class="result-item" v-if="!lastResult.success && lastResult.reason">
              <span class="label">原因：</span>
              <span class="value reason">{{ lastResult.reason }}</span>
            </div>
          </div>
        </div>

        <!-- 选择区域 -->
        <div class="form-item">
          <label>选择区域 <span class="required">*</span></label>
          <select v-model="form.areaId" required>
            <option value="">请选择区域</option>
            <option v-for="area in areaList" :key="area.id" :value="area.id">
              {{ area.areaName }} ({{ area.areaCode }})
            </option>
          </select>
        </div>

        <!-- 选择道闸 -->
        <div class="form-item">
          <label>选择道闸 <span class="required">*</span></label>
          <select v-model="form.gateId" required>
            <option value="">请选择道闸</option>
            <option v-for="gate in gateList" :key="gate.id" :value="gate.gateCode">
              {{ gate.gateName }} - {{ gate.gateLocation }}
            </option>
          </select>
        </div>

        <!-- 确认入场按钮 -->
        <button 
          @click="handleEntry" 
          class="btn-entry"
          :disabled="loading || !canSubmit"
        >
          {{ loading ? '处理中...' : '确认入场' }}
        </button>
      </div>

      <!-- 右侧：入场记录列表 -->
      <div class="records-section">
        <h3>入场记录</h3>
        
        <!-- 搜索和刷新 -->
        <div class="toolbar">
          <input 
            v-model="searchParams.licensePlate" 
            type="text" 
            placeholder="搜索车牌号"
            @keyup.enter="fetchRecords"
          />
          <button @click="fetchRecords" class="btn-search">搜索</button>
          <button @click="refreshRecords" class="btn-refresh">刷新</button>
        </div>

        <!-- 记录表格 -->
        <table class="data-table" v-if="records.length > 0">
          <thead>
            <tr>
              <th>车牌号</th>
              <th>区域</th>
              <th>入场时间</th>
              <th>类型</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td class="plate-cell">{{ record.licensePlate }}</td>
              <td>{{ record.areaName || '-' }}</td>
              <td>{{ formatTime(record.entryTime) }}</td>
              <td>
                <span class="type-badge" :class="'type-' + record.entryType">
                  {{ getTypeText(record.entryType) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="empty-state">
          <p>暂无入场记录</p>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <span class="total">共 {{ total }} 条</span>
          <div class="page-btns">
            <button @click="goPage(1)" :disabled="searchParams.pageNum === 1">首页</button>
            <button @click="goPage(searchParams.pageNum - 1)" :disabled="searchParams.pageNum === 1">上一页</button>
            <span class="page-info">{{ searchParams.pageNum }} / {{ totalPages }}</span>
            <button @click="goPage(searchParams.pageNum + 1)" :disabled="searchParams.pageNum >= totalPages">下一页</button>
            <button @click="goPage(totalPages)" :disabled="searchParams.pageNum >= totalPages">末页</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作日志 -->
    <div class="log-panel">
      <h4>操作日志</h4>
      <div class="log-content">
        <div v-for="(log, i) in logs" :key="i" class="log-item" :class="'log-' + log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-msg">{{ log.msg }}</span>
        </div>
        <div v-if="logs.length === 0" class="log-empty">暂无日志</div>
      </div>
    </div>

    <!-- 道闸状态 -->
    <div class="gate-status" :class="{ open: gateOpen }">
      <span class="gate-icon">🚧</span>
      <span class="gate-text">{{ gateOpen ? '道闸开启中' : '道闸关闭' }}</span>
    </div>
  </div>
</template>

<script>
import { autoEntry, getAreaList, getEntryList } from '@/utils/api'

export default {
  name: 'AutoEntrySimulation',
  data() {
    return {
      isDragOver: false,
      previewUrl: '',
      selectedFile: null,
      form: {
        areaId: '',
        gateId: ''
      },
      areaList: [],
      gateList: [
        { id: 1, gateCode: 'GATE_001', gateName: '入口1号', gateLocation: '东门' },
        { id: 2, gateCode: 'GATE_002', gateName: '入口2号', gateLocation: '西门' },
        { id: 3, gateCode: 'GATE_003', gateName: '入口3号', gateLocation: '南门' }
      ],
      loading: false,
      gateOpen: false,
      lastResult: null,  // 上次识别结果
      records: [],
      total: 0,
      searchParams: {
        pageNum: 1,
        pageSize: 10,
        licensePlate: ''
      },
      logs: []
    }
  },
  computed: {
    canSubmit() {
      return this.form.areaId && this.form.gateId && this.selectedFile
    },
    totalPages() {
      return Math.ceil(this.total / this.searchParams.pageSize) || 1
    }
  },
  created() {
    this.fetchAreas()
    this.fetchRecords()
    this.log('info', '自动入场模拟系统已就绪')
  },
  methods: {
    // 获取区域列表
    fetchAreas() {
      getAreaList().then(res => {
        if (res.code === 200) {
          this.areaList = res.data || []
        }
      }).catch(() => {
        this.log('error', '获取区域列表失败')
      })
    },

    // 获取入场记录
    fetchRecords() {
      getEntryList(this.searchParams).then(res => {
        if (res.code === 200) {
          this.records = res.data.records || []
          this.total = res.data.total || 0
        }
      }).catch(() => {
        this.log('error', '获取入场记录失败')
      })
    },

    refreshRecords() {
      this.searchParams.pageNum = 1
      this.searchParams.licensePlate = ''
      this.fetchRecords()
      this.log('info', '已刷新记录')
    },

    goPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.searchParams.pageNum = page
      this.fetchRecords()
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleDrop(e) {
      this.isDragOver = false
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.processFile(file)
      }
    },

    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },

    processFile(file) {
      this.selectedFile = file
      const reader = new FileReader()
      reader.onload = e => {
        this.previewUrl = e.target.result
        this.log('info', `已选择图片: ${file.name}`)
      }
      reader.readAsDataURL(file)
    },

    removeImage() {
      this.selectedFile = null
      this.previewUrl = ''
      this.$refs.fileInput.value = ''
      this.log('info', '已移除图片')
    },

    handleEntry() {
      if (!this.canSubmit) {
        this.log('error', '请选择图片、区域和道闸')
        return
      }

      this.loading = true
      this.lastResult = null
      this.log('info', '正在提交入场请求...')

      const formData = new FormData()
      formData.append('image', this.selectedFile)
      formData.append('areaId', this.form.areaId)
      formData.append('gateId', this.form.gateId)

      autoEntry(formData)
        .then(res => {
          if (res.code === 200 && res.data && res.data.length > 0) {
            // 处理识别结果
            const result = res.data[0]
            this.lastResult = result
            
            if (result.success) {
              this.log('success', `入场成功: ${result.licensePlate} (置信度: ${(result.confidence * 100).toFixed(1)}%)`)
              this.log('info', `入场类型: ${this.getTypeText(result.entryType)}`)
              
              // 模拟道闸开启
              setTimeout(() => {
                this.gateOpen = true
                this.log('success', '道闸已开启')
                
                setTimeout(() => {
                  this.gateOpen = false
                  this.log('info', '道闸已关闭')
                  this.resetForm()
                }, 3000)
              }, 500)
            } else {
              this.log('error', `入场失败: ${result.licensePlate || '未知'}`)
              if (result.reason) {
                this.log('error', `原因: ${result.reason}`)
              }
            }
            
            // 更新记录列表
            this.fetchRecords()
          } else {
            this.log('error', '入场请求失败: ' + (res.message || '未知错误'))
          }
        })
        .catch(err => {
          this.log('error', '请求失败: ' + (err.message || '网络错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    resetForm() {
      this.selectedFile = null
      this.previewUrl = ''
      this.form.areaId = ''
      this.form.gateId = ''
      this.lastResult = null
      this.$refs.fileInput.value = ''
      this.fetchRecords()
    },

    formatTime(timeStr) {
      if (!timeStr) return '-'
      return timeStr.replace('T', ' ').substring(0, 19)
    },

    getTypeText(type) {
      const map = {
        owner: '业主车',
        temp: '临时车',
        reservation: '预约车'
      }
      return map[type] || type || '-'
    },

    log(type, msg) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      this.logs.unshift({ type, time, msg })
      if (this.logs.length > 20) this.logs.pop()
    }
  }
}
</script>

<style scoped>
.auto-entry-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.entry-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

/* 上传区域 */
.upload-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.drop-zone {
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
  background: #fafafa;
  overflow: hidden;
}

.drop-zone:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.drop-zone.drag-over {
  border-color: #409eff;
  background: #ecf5ff;
  transform: scale(1.02);
}

.drop-zone.has-image {
  border-style: solid;
  border-color: #67c23a;
}

.drop-placeholder {
  text-align: center;
  color: #999;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.main-text {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
}

.sub-text {
  font-size: 14px;
  margin: 5px 0;
}

.hint {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 10px;
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #f56c6c;
}

/* 识别结果面板 */
.result-panel {
  background: #f4f4f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #e4e4e7;
}

.result-panel.success {
  background: #f0f9eb;
  border-color: #c2e7b0;
}

.result-panel.fail {
  background: #fef0f0;
  border-color: #fbc4c4;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.result-icon {
  font-size: 20px;
}

.result-title {
  font-weight: bold;
  font-size: 14px;
}

.result-panel.success .result-title {
  color: #67c23a;
}

.result-panel.fail .result-title {
  color: #f56c6c;
}

.result-info {
  font-size: 13px;
}

.result-item {
  display: flex;
  margin-bottom: 4px;
}

.result-item .label {
  color: #666;
  width: 70px;
}

.result-item .value {
  color: #333;
  flex: 1;
}

.result-item .value.plate {
  font-weight: bold;
  color: #409eff;
}

.result-item .value.reason {
  color: #f56c6c;
}

/* 表单 */
.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.required {
  color: #f56c6c;
}

.form-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-item select:focus {
  outline: none;
  border-color: #409eff;
}

.btn-entry {
  width: 100%;
  padding: 12px;
  background: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-entry:hover:not(:disabled) {
  background: #85ce61;
}

.btn-entry:disabled {
  background: #c8e6c3;
  cursor: not-allowed;
}

/* 记录区域 */
.records-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.toolbar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-search, .btn-refresh {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.btn-search {
  background: #409eff;
  color: white;
}

.btn-refresh {
  background: #67c23a;
  color: white;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-bottom: 15px;
}

.data-table th,
.data-table td {
  padding: 10px 8px;
  border: 1px solid #eee;
  text-align: center;
}

.data-table th {
  background: #f5f7fa;
  font-weight: bold;
}

.plate-cell {
  font-weight: bold;
  color: #409eff;
}

.type-badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: white;
}

.type-owner { background: #409eff; }
.type-temp { background: #909399; }
.type-reservation { background: #e6a23c; }

.status-badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.status-inactive {
  background: #f4f4f5;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total {
  color: #666;
  font-size: 13px;
}

.page-btns {
  display: flex;
  gap: 5px;
  align-items: center;
}

.page-btns button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.page-btns button:disabled {
  background: #f5f7fa;
  cursor: not-allowed;
}

.page-info {
  padding: 0 10px;
  color: #666;
  font-size: 13px;
}

/* 日志面板 */
.log-panel {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Consolas', monospace;
}

.log-panel h4 {
  margin: 0 0 10px;
  color: #fff;
  font-size: 14px;
}

.log-content {
  max-height: 150px;
  overflow-y: auto;
  font-size: 12px;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid #333;
}

.log-time {
  color: #858585;
  flex-shrink: 0;
}

.log-empty {
  color: #666;
  text-align: center;
  padding: 20px;
}

.log-info .log-msg { color: #d4d4d4; }
.log-success .log-msg { color: #6a9955; }
.log-warning .log-msg { color: #dcdcaa; }
.log-error .log-msg { color: #f48771; }

/* 道闸状态 */
.gate-status {
  position: fixed;
  bottom: 80px;
  right: 30px;
  background: white;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.gate-status.open {
  background: #f0f9eb;
  border: 2px solid #67c23a;
}

.gate-icon {
  font-size: 28px;
}

.gate-text {
  font-size: 14px;
  color: #666;
}

.gate-status.open .gate-text {
  color: #67c23a;
  font-weight: bold;
}
</style>
