/**
 * API 配置和请求封装
 * 这里封装了所有与后端交互的方法
 */

import axios from 'axios';

// 创建axios实例，设置基础配置
const api = axios.create({
  // 后端API的基础地址，根据实际情况修改
  baseURL: '/api',
  // 请求超时时间
  timeout: 10000
})

// 请求拦截器 - 每次发送请求前执行
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    // 如果有token，在请求头中添加Authorization
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  error => {
    // 请求错误处理
    return Promise.reject(error)
  }
)

// 响应拦截器 - 每次收到响应后执行
api.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      if (status === 401) {
        // 401表示未登录或token过期，清除token并跳转到登录页
        localStorage.removeItem('token')
        // 如果在浏览器环境中，跳转到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      return Promise.reject(data)
    }
    return Promise.reject(error)
  }
)

// ============ 认证模块 API ============

/**
 * 登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} 返回token
 */
export function login(data) {
  return api.post('/auth/login', data)
}

/**
 * 注册（业主自助注册）
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名（必填，3-20字符）
 * @param {string} data.password - 密码（必填，6-20字符）
 * @param {string} data.realName - 真实姓名
 * @param {string} data.phone - 手机号（可选，11位手机号）
 * @param {string} data.idCard - 身份证号（可选）
 * @returns {Promise}
 */
export function register(data) {
  return api.post('/auth/register', data)
}

/**
 * 获取当前用户信息
 * 需要在请求头中携带token
 * @returns {Promise} 返回用户信息对象
 */
export function getUserInfo() {
  return api.get('/auth/info')
}

/**
 * 登出
 * @returns {Promise}
 */
export function logout() {
  return api.post('/auth/logout')
}

// ============ 用户管理模块 API（管理员使用） ============

/**
 * 获取用户列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.username - 用户名关键字（可选）
 * @param {string} params.role - 角色筛选（可选）：admin / security / owner
 * @returns {Promise} 返回用户列表和分页信息
 */
export function getUserList(params) {
  return api.get('/user/list', { params })
}

/**
 * 创建用户（管理员）
 * @param {Object} data - 用户数据
 * @param {string} data.username - 用户名（必填）
 * @param {string} data.password - 密码（必填）
 * @param {string} data.realName - 真实姓名
 * @param {string} data.phone - 手机号
 * @param {string} data.role - 角色：admin / security / owner
 * @returns {Promise}
 */
export function createUser(data) {
  return api.post('/user', data)
}

/**
 * 更新用户信息
 * @param {number} id - 用户ID
 * @param {Object} data - 要更新的数据
 * @param {string} data.realName - 真实姓名
 * @param {string} data.phone - 手机号
 * @param {string} data.role - 角色
 * @returns {Promise}
 */
export function updateUser(id, data) {
  return api.put(`/user/${id}`, data)
}

/**
 * 删除用户
 * @param {number} id - 用户ID
 * @returns {Promise}
 */
export function deleteUser(id) {
  return api.delete(`/user/${id}`)
}

/**
 * 更新用户状态（启用/禁用）
 * @param {number} id - 用户ID
 * @param {number} status - 状态：1启用 0禁用
 * @returns {Promise}
 */
export function updateUserStatus(id, status) {
  return api.put(`/user/${id}/status`, { status })
}

/**
 * 分配角色
 * @param {number} id - 用户ID
 * @param {string} role - 角色：admin / security / owner
 * @returns {Promise}
 */
export function assignRole(id, role) {
  return api.put(`/user/${id}/role`, { role })
}

/**
 * 重置密码
 * @param {number} id - 用户ID
 * @param {string} password - 新密码
 * @returns {Promise}
 */
export function resetPassword(id, password) {
  return api.put(`/user/${id}/password`, { password })
}

// ============ 车辆管理模块 API ============

/**
 * 车辆列表（管理员分页查询）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.licensePlate - 车牌号关键字（可选）
 * @param {number} params.status - 状态筛选（可选）：0待审核 1已通过 2已拒绝
 * @returns {Promise} 返回车辆列表和分页信息
 */
export function getVehicleList(params) {
  return api.get('/owner/vehicle/list', { params })
}

/**
 * 我的车辆（当前用户）
 * @returns {Promise} 返回当前用户的车辆列表
 */
export function getMyVehicles() {
  return api.get('/owner/vehicle/my')
}

/**
 * 注册车辆（业主添加车辆，待审核）
 * @param {Object} data - 车辆数据
 * @param {string} data.licensePlate - 车牌号（必填）
 * @param {string} data.vehicleBrand - 车辆品牌
 * @param {string} data.vehicleModel - 车辆型号
 * @param {string} data.vehicleColor - 车辆颜色
 * @param {string} data.vehicleType - 车辆类型：small/medium/large/suv/mpv
 * @returns {Promise}
 */
export function addVehicle(data) {
  return api.post('/owner/vehicle', data)
}

/**
 * 获取车辆详情
 * @param {number} id - 车辆ID
 * @returns {Promise}
 */
export function getVehicleDetail(id) {
  return api.get(`/owner/vehicle/${id}`)
}

/**
 * 更新车辆信息
 * @param {number} id - 车辆ID
 * @param {Object} data - 要更新的数据
 * @param {string} data.vehicleBrand - 车辆品牌
 * @param {string} data.vehicleModel - 车辆型号
 * @param {string} data.vehicleColor - 车辆颜色
 * @returns {Promise}
 */
export function updateVehicle(id, data) {
  return api.put(`/owner/vehicle/${id}`, data)
}

/**
 * 删除车辆
 * @param {number} id - 车辆ID
 * @returns {Promise}
 */
export function deleteVehicle(id) {
  return api.delete(`/owner/vehicle/${id}`)
}

/**
 * 审核车辆（管理员操作）
 * @param {number} id - 车辆ID
 * @param {Object} data - 审核数据
 * @param {number} data.status - 审核状态：1通过 2拒绝
 * @param {string} data.remark - 审核备注
 * @returns {Promise}
 */
export function approveVehicle(id, data) {
  return api.put(`/owner/vehicle/${id}/approve`, data)
}

/**
 * 设置默认车辆
 * @param {number} id - 车辆ID
 * @returns {Promise}
 */
export function setDefaultVehicle(id) {
  return api.put(`/owner/vehicle/${id}/default`)
}

// 导出api实例，其他地方也可以直接使用
export default api

// ============ 区域管理模块 API ============

/**
 * 获取区域列表
 * @param {number} communityId - 小区ID
 * @returns {Promise} 返回区域列表
 */
export function getAreaList(communityId) {
  return api.get(`/parking/area/list/${communityId}`)
}

/**
 * 获取区域统计信息
 * @param {number} communityId - 小区ID
 * @returns {Promise} 返回区域统计数据
 */
export function getAreaStatistics(communityId) {
  return api.get(`/parking/area/statistics/${communityId}`)
}

/**
 * 获取区域详情
 * @param {number} id - 区域ID
 * @returns {Promise}
 */
export function getAreaDetail(id) {
  return api.get(`/parking/area/${id}`)
}

/**
 * 添加区域
 * @param {Object} data - 区域数据
 * @param {string} data.areaCode - 区域代码（必填）
 * @param {string} data.areaName - 区域名称（必填）
 * @param {number} data.totalSpaces - 总车位数（必填）
 * @param {number} data.hourlyRate - 每小时费率
 * @param {string} data.description - 描述
 * @returns {Promise}
 */
export function createArea(data) {
  return api.post('/parking/area', data)
}

/**
 * 更新区域
 * @param {Object} data - 区域数据
 * @param {number} data.id - 区域ID（必填）
 * @param {string} data.areaCode - 区域代码
 * @param {string} data.areaName - 区域名称
 * @param {number} data.totalSpaces - 总车位数
 * @param {number} data.hourlyRate - 每小时费率
 * @param {string} data.description - 描述
 * @returns {Promise}
 */
export function updateArea(data) {
  return api.put('/parking/area', data)
}

/**
 * 删除区域
 * @param {number} id - 区域ID
 * @returns {Promise}
 */
export function deleteArea(id) {
  return api.delete(`/parking/area/${id}`)
}

// ============ 车位管理模块 API ============

/**
 * 获取车位列表
 * @param {Object} params - 查询参数
 * @param {number} params.areaId - 区域ID（可选）
 * @returns {Promise} 返回车位列表
 */
export function getSpaceList(params) {
  return api.get('/parking/space/list', { params })
}

/**
 * 获取可用车位列表
 * @param {number} areaId - 区域ID（可选）
 * @returns {Promise} 返回可用车位列表
 */
export function getAvailableSpaces(areaId) {
  return api.get('/parking/space/available', { params: { areaId } })
}

/**
 * 获取可用车位数量
 * @param {number} areaId - 区域ID（可选）
 * @returns {Promise} 返回可用车位数量
 */
export function getAvailableCount(areaId) {
  return api.get('/parking/space/available/count', { params: { areaId } })
}

/**
 * 获取车位详情
 * @param {number} id - 车位ID
 * @returns {Promise}
 */
export function getSpaceDetail(id) {
  return api.get(`/parking/space/${id}`)
}

/**
 * 添加车位
 * @param {Object} data - 车位数据
 * @param {number} data.areaId - 区域ID（必填）
 * @param {string} data.spaceNumber - 车位编号（必填）
 * @param {string} data.position - 位置：地上/地下
 * @returns {Promise}
 */
export function createSpace(data) {
  return api.post('/parking/space', data)
}

/**
 * 更新车位
 * @param {Object} data - 车位数据
 * @param {number} data.id - 车位ID（必填）
 * @param {string} data.spaceNumber - 车位编号
 * @param {number} data.status - 状态：0空闲 1已占用 2预留
 * @param {string} data.position - 位置
 * @returns {Promise}
 */
export function updateSpace(data) {
  return api.put('/parking/space', data)
}

/**
 * 删除车位
 * @param {number} id - 车位ID
 * @returns {Promise}
 */
export function deleteSpace(id) {
  return api.delete(`/parking/space/${id}`)
}

// ============ 小区管理模块 API ============

/**
 * 获取小区列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.name - 小区名称关键字（可选）
 * @param {string} params.address - 地址关键字（可选）
 * @param {number} params.status - 状态筛选（可选）：1启用 0禁用
 * @returns {Promise} 返回小区列表和分页信息
 */
export function getCommunityList(params) {
  return api.get('/community/list', { params })
}

/**
 * 获取全部小区（下拉选择用）
 * @returns {Promise} 返回全部小区列表
 */
export function getCommunityAll() {
  return api.get('/community/all')
}

/**
 * 获取小区详情
 * @param {number} id - 小区ID
 * @returns {Promise}
 */
export function getCommunityDetail(id) {
  return api.get(`/community/${id}`)
}

/**
 * 新增小区
 * @param {Object} data - 小区数据
 * @param {string} data.name - 小区名称（必填）
 * @param {string} data.address - 小区地址
 * @param {number} data.totalArea - 总面积（平方米）
 * @param {number} data.buildingCount - 楼栋数量
 * @param {string} data.description - 描述信息
 * @returns {Promise}
 */
export function createCommunity(data) {
  return api.post('/community', data)
}

/**
 * 更新小区
 * @param {number} id - 小区ID
 * @param {Object} data - 小区数据
 * @param {string} data.name - 小区名称
 * @param {string} data.address - 小区地址
 * @param {number} data.totalArea - 总面积
 * @param {number} data.buildingCount - 楼栋数量
 * @param {string} data.description - 描述信息
 * @param {number} data.status - 状态：1启用 0禁用
 * @returns {Promise}
 */
export function updateCommunity(id, data) {
  return api.put(`/community/${id}`, data)
}

/**
 * 删除小区
 * @param {number} id - 小区ID
 * @returns {Promise}
 */
export function deleteCommunity(id) {
  return api.delete(`/community/${id}`)
}

// ============ 预约管理模块 API ============

/**
 * 获取预约列表（管理员分页查询）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.status - 预约状态筛选（可选）：0待生效 1已生效 2已完成 3已取消
 * @param {string} params.licensePlate - 车牌号关键字（可选）
 * @returns {Promise} 返回预约列表和分页信息
 */
export function getReservationList(params) {
  return api.get('/reservation/temp/list', { params })
}

/**
 * 获取我的预约（当前用户）
 * @returns {Promise} 返回当前用户的预约列表
 */
export function getMyReservations() {
  return api.get('/reservation/temp/my')
}

/**
 * 创建预约
 * @param {Object} data - 预约数据
 * @param {string} data.licensePlate - 车牌号（必填）
 * @param {string} data.visitorName - 访客姓名（必填）
 * @param {string} data.visitorPhone - 访客手机号（可选）
 * @param {number} data.ownerUserId - 业主ID（可选，不填则当前用户）
 * @param {string} data.visitReason - 拜访原因（可选）
 * @param {number} data.targetAreaId - 目标区域ID（必填）
 * @param {string} data.expectedStartTime - 预计开始时间（必填），格式：YYYY-MM-DD HH:mm:ss
 * @param {string} data.expectedEndTime - 预计结束时间（必填），格式：YYYY-MM-DD HH:mm:ss
 * @returns {Promise}
 */
export function createReservation(data) {
  return api.post('/reservation/temp', data)
}

/**
 * 获取预约详情
 * @param {number} id - 预约ID
 * @returns {Promise}
 */
export function getReservationDetail(id) {
  return api.get(`/reservation/temp/${id}`)
}

/**
 * 审批预约（管理员/保安操作）
 * @param {number} id - 预约ID
 * @param {Object} data - 审批数据
 * @param {string} data.status - 审批状态：approved通过 / rejected拒绝
 * @param {string} data.remark - 审批备注
 * @returns {Promise}
 */
export function approveReservation(id, data) {
  return api.put(`/reservation/temp/${id}/approve`, data)
}

/**
 * 取消预约
 * @param {number} id - 预约ID
 * @returns {Promise}
 */
export function cancelReservation(id) {
  return api.put(`/reservation/temp/${id}/cancel`)
}

/**
 * 预约生效（入场）
 * @param {number} id - 预约ID
 * @returns {Promise}
 */
export function activateReservation(id) {
  return api.put(`/reservation/temp/${id}/activate`)
}

/**
 * 预约失效（出场）
 * @param {number} id - 预约ID
 * @returns {Promise}
 */
export function completeReservation(id) {
  return api.put(`/reservation/temp/${id}/complete`)
}

// ============ 车辆入场模块 API ============

/**
 * 车辆入场登记
 * @param {Object} data - 入场数据
 * @param {string} data.licensePlate - 车牌号（必填）
 * @param {number} data.vehicleId - 业主车辆ID（可选）
 * @param {number} data.reservationId - 预约ID（可选）
 * @param {number} data.spaceId - 车位ID（必填）
 * @param {number} data.areaId - 区域ID（必填）
 * @param {string} data.entryType - 入场类型：normal/reservation/temp（必填）
 * @param {string} data.entrySource - 入场来源：manual手动/auto自动（必填）
 * @returns {Promise}
 */
export function vehicleEntry(data) {
  return api.post('/vehicle/entry', data)
}

/**
 * 入场记录列表（分页查询）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.licensePlate - 车牌号关键字（可选）
 * @param {string} params.entryType - 入场类型筛选（可选）：normal/reservation/temp
 * @returns {Promise} 返回入场记录列表和分页信息
 */
export function getEntryList(params) {
  return api.get('/vehicle/entry/list', { params })
}

/**
 * 获取入场记录详情
 * @param {number} id - 入场记录ID
 * @returns {Promise}
 */
export function getEntryDetail(id) {
  return api.get(`/vehicle/entry/${id}`)
}

/**
 * 根据车牌号查询当前在场记录
 * @param {string} licensePlate - 车牌号
 * @returns {Promise} 返回当前在场车辆的入场记录，如果不在场则返回null
 */
export function getActiveEntry(licensePlate) {
  return api.get(`/vehicle/entry/active/${licensePlate}`)
}

/**
 * 车牌识别（自动识别业主车辆）
 * @param {string} licensePlate - 车牌号
 * @returns {Promise} 返回匹配的业主车辆信息
 */
export function recognizePlate(licensePlate) {
  return api.get(`/vehicle/entry/recognize/${licensePlate}`)
}

/**
 * 更新入场记录验证状态
 * @param {number} id - 入场记录ID
 * @param {Object} data - 验证数据
 * @param {number} data.isVerified - 验证状态：1已验证 0未验证
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export function updateEntryVerify(id, data) {
  return api.put(`/vehicle/entry/${id}/verify`, data)
}

// ============ 车辆出场模块 API ============

/**
 * 车辆出场登记
 * @param {Object} data - 出场数据
 * @param {number} data.entryRecordId - 入场记录ID（必填）
 * @param {string} data.licensePlate - 车牌号（必填）
 * @param {string} data.exitType - 出场类型：normal正常/early提前（必填）
 * @returns {Promise} 返回出场记录，包含停车时长和费用信息
 */
export function vehicleExit(data) {
  return api.post('/vehicle/exit', data)
}

/**
 * 出场记录列表（分页查询）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.licensePlate - 车牌号关键字（可选）
 * @returns {Promise} 返回出场记录列表和分页信息
 */
export function getExitList(params) {
  return api.get('/vehicle/exit/list', { params })
}

/**
 * 获取出场记录详情
 * @param {number} id - 出场记录ID
 * @returns {Promise}
 */
export function getExitDetail(id) {
  return api.get(`/vehicle/exit/${id}`)
}

/**
 * 出场前检查（根据车牌号查询在场记录）
 * @param {string} licensePlate - 车牌号
 * @returns {Promise} 返回当前在场记录，如果不在场返回错误
 */
export function checkExit(licensePlate) {
  return api.get(`/vehicle/exit/check/${licensePlate}`)
}

// ============ 消息通知模块 API ============

/**
 * 获取我的通知列表（当前用户）
 * @param {Object} params - 查询参数
 * @param {string} params.noticeType - 通知类型筛选（可选）：SYSTEM/OVERDUE/RESERVATION/ENTRY_EXIT/APPROVAL
 * @returns {Promise} 返回当前用户的通知列表
 */
export function getMyNotices(params) {
  return api.get('/notice/my', { params })
}

/**
 * 获取未读通知数量
 * @returns {Promise} 返回未读消息数
 */
export function getUnreadCount() {
  return api.get('/notice/unread-count')
}

/**
 * 标记单条通知已读
 * @param {number} id - 通知ID
 * @returns {Promise}
 */
export function markNoticeRead(id) {
  return api.put(`/notice/${id}/read`)
}

/**
 * 标记全部通知已读
 * @returns {Promise}
 */
export function markAllNoticeRead() {
  return api.put('/notice/read-all')
}

/**
 * 获取通知详情
 * @param {number} id - 通知ID
 * @returns {Promise}
 */
export function getNoticeDetail(id) {
  return api.get(`/notice/${id}`)
}

// ============ 管理员通知管理 API ============

/**
 * 获取通知列表（管理员分页查询）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认1
 * @param {number} params.pageSize - 每页条数，默认10
 * @param {string} params.title - 标题关键字（可选）
 * @param {string} params.noticeType - 通知类型筛选（可选）
 * @param {string} params.publishStatus - 发布状态筛选（可选）：DRAFT/PUBLISHED/WITHDRAWN
 * @param {number} params.priority - 优先级筛选（可选）
 * @returns {Promise} 返回通知列表和分页信息
 */
export function getNoticeList(params) {
  return api.get('/notice/list', { params })
}

/**
 * 创建通知
 * @param {Object} data - 通知数据
 * @param {string} data.title - 通知标题（必填）
 * @param {string} data.content - 通知内容（必填）
 * @param {string} data.noticeType - 通知类型（必填）：SYSTEM/OVERDUE/RESERVATION/ENTRY_EXIT/APPROVAL
 * @param {string} data.targetType - 目标类型（默认ALL）：ALL/USER/AREA/COMMUNITY
 * @param {string} data.targetAreaIds - 目标用户/区域ID列表，逗号分隔
 * @param {number} data.priority - 优先级，默认2
 * @param {string} data.expireTime - 过期时间，可选
 * @returns {Promise} 返回新创建的noticeId
 */
export function createNotice(data) {
  return api.post('/notice', data)
}

/**
 * 更新通知（仅草稿状态）
 * @param {number} id - 通知ID
 * @param {Object} data - 通知数据
 * @param {string} data.title - 通知标题
 * @param {string} data.content - 通知内容
 * @param {string} data.noticeType - 通知类型
 * @param {string} data.targetType - 目标类型
 * @param {string} data.targetAreaIds - 目标用户/区域ID列表
 * @param {number} data.priority - 优先级
 * @param {string} data.expireTime - 过期时间
 * @returns {Promise}
 */
export function updateNotice(id, data) {
  return api.put(`/notice/${id}`, data)
}

/**
 * 删除通知（仅草稿状态）
 * @param {number} id - 通知ID
 * @returns {Promise}
 */
export function deleteNotice(id) {
  return api.delete(`/notice/${id}`)
}

/**
 * 发布通知
 * @param {number} id - 通知ID
 * @returns {Promise}
 */
export function publishNotice(id) {
  return api.put(`/notice/${id}/publish`)
}

/**
 * 撤回通知
 * @param {number} id - 通知ID
 * @returns {Promise}
 */
export function withdrawNotice(id) {
  return api.put(`/notice/${id}/withdraw`)
}
