/**
 * 路由配置
 * 定义了应用的页面路由规则
 */

import Vue from 'vue'
import VueRouter from 'vue-router'

// 引入页面组件
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import UserInfo from '@/views/UserInfo.vue'
import UserList from '@/views/UserList.vue'
import VehicleList from '@/views/VehicleList.vue'
import MyVehicle from '@/views/MyVehicle.vue'
import AreaList from '@/views/AreaList.vue'
import SpaceList from '@/views/SpaceList.vue'
import CommunityList from '@/views/CommunityList.vue'
import ReservationList from '@/views/ReservationList.vue'
import MyReservation from '@/views/MyReservation.vue'
import VehicleEntry from '@/views/VehicleEntry.vue'
import VehicleExit from '@/views/VehicleExit.vue'
import NoticeList from '@/views/NoticeList.vue'
import MyNotice from '@/views/MyNotice.vue'

// 使用VueRouter插件
Vue.use(VueRouter)

// 创建路由实例
const router = new VueRouter({
  // 路由模式 - 使用HTML5 History模式，去掉URL中的#号
  mode: 'history',
  // 路由规则
  routes: [
    // 登录页
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    // 注册页
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    // 用户信息页（需要登录才能访问）
    {
      path: '/user',
      name: 'UserInfo',
      component: UserInfo,
      meta: { requiresAuth: true }  // 标记需要登录
    },
    // 用户列表页（需要管理员权限）
    {
      path: '/users',
      name: 'UserList',
      component: UserList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 车辆列表（管理员）
    {
      path: '/vehicles',
      name: 'VehicleList',
      component: VehicleList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 我的车辆（业主）
    {
      path: '/my-vehicles',
      name: 'MyVehicle',
      component: MyVehicle,
      meta: { requiresAuth: true }
    },
    // 区域管理（管理员）
    {
      path: '/parking/areas',
      name: 'AreaList',
      component: AreaList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 车位管理（管理员）
    {
      path: '/parking/spaces',
      name: 'SpaceList',
      component: SpaceList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 小区管理（管理员）
    {
      path: '/communities',
      name: 'CommunityList',
      component: CommunityList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 预约管理（管理员）
    {
      path: '/reservations',
      name: 'ReservationList',
      component: ReservationList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 我的预约（普通用户）
    {
      path: '/my-reservations',
      name: 'MyReservation',
      component: MyReservation,
      meta: { requiresAuth: true }
    },
    // 车辆入场管理（保安/管理员）
    {
      path: '/vehicle/entry',
      name: 'VehicleEntry',
      component: VehicleEntry,
      meta: { requiresAuth: true }
    },
    // 车辆出场管理（保安/管理员）
    {
      path: '/vehicle/exit',
      name: 'VehicleExit',
      component: VehicleExit,
      meta: { requiresAuth: true }
    },
    // 通知管理（管理员）
    {
      path: '/notices',
      name: 'NoticeList',
      component: NoticeList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 我的消息（所有用户）
    {
      path: '/my-notices',
      name: 'MyNotice',
      component: MyNotice,
      meta: { requiresAuth: true }
    },
    // 首页 - 重定向到用户信息页
    {
      path: '/',
      redirect: '/user'
    }
  ]
})

// 全局守卫 - 每次路由跳转前检查
router.beforeEach(async (to, from, next) => {
  // 获取token
  const token = localStorage.getItem('token')
  
  // 如果要去的页面需要登录但没有token
  if (to.meta.requiresAuth && !token) {
    // 跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录的用户访问登录页，跳转到首页
    next('/user')
  } else if (to.meta.requiresAdmin) {
    // 需要管理员权限的页面
    // 如果还没获取用户信息，先获取
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
    if (!userInfo) {
      // 获取用户信息
      try {
        const { getUserInfo } = await import('@/utils/api')
        const res = await getUserInfo()
        if (res.code === 200) {
          localStorage.setItem('userInfo', JSON.stringify(res.data))
          // 检查是否是管理员
          if (res.data.role !== 'admin') {
            alert('您没有权限访问该页面')
            next('/user')
            return
          }
        }
      } catch (e) {
        // 获取用户信息失败
        next('/login')
        return
      }
    } else if (userInfo.role !== 'admin') {
      alert('您没有权限访问该页面')
      next('/user')
      return
    }
    next()
  } else {
    // 放行
    next()
  }
})

export default router
