import Vue from 'vue'
import VueRouter from 'vue-router'

import MobileLogin from '@/mobile/views/Login.vue'
import MobileHome from '@/mobile/views/Home.vue'
import MobileUserInfo from '@/mobile/views/Common/UserInfo.vue'
import VehicleEntry from '@/mobile/views/Security/VehicleEntry.vue'
import VehicleExit from '@/mobile/views/Security/VehicleExit.vue'
import MyReservation from '@/mobile/views/Owner/MyReservation.vue'
import MyVehicle from '@/mobile/views/Owner/MyVehicle.vue'
import MyNotice from '@/mobile/views/Owner/MyNotice.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/mobile/login'
  },
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: MobileLogin
  },
  {
    path: '/mobile',
    name: 'MobileHome',
    component: MobileHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/mobile/profile',
    name: 'MobileUserInfo',
    component: MobileUserInfo,
    meta: { requiresAuth: true }
  },
  {
    path: '/mobile/entry',
    name: 'MobileVehicleEntry',
    component: VehicleEntry,
    meta: { requiresAuth: true, requiresSecurity: true }
  },
  {
    path: '/mobile/exit',
    name: 'MobileVehicleExit',
    component: VehicleExit,
    meta: { requiresAuth: true, requiresSecurity: true }
  },
  {
    path: '/mobile/reservations',
    name: 'MobileMyReservation',
    component: MyReservation,
    meta: { requiresAuth: true, requiresOwner: true }
  },
  {
    path: '/mobile/vehicles',
    name: 'MobileMyVehicle',
    component: MyVehicle,
    meta: { requiresAuth: true, requiresOwner: true }
  },
  {
    path: '/mobile/notices',
    name: 'MobileMyNotice',
    component: MyNotice,
    meta: { requiresAuth: true }
  },
  {
    path: '/mobile/',
    redirect: '/mobile'
  },
  {
    path: '*',
    redirect: '/mobile/login'
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/mobile/login')
  } else if (to.path === '/mobile/login' && token) {
    next('/mobile')
  } else {
    next()
  }
})

export default router
