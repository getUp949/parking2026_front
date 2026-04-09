/**
 * Vuex 状态管理 - 用户认证模块
 * 用于管理全局的用户登录状态
 */

import Vue from 'vue'
import Vuex from 'vuex'
import { getUserInfo, logout } from '@/utils/api'

// 使用Vuex插件
Vue.use(Vuex)

export default new Vuex.Store({
  // 状态 - 就是数据
  state: {
    // 用户信息
    userInfo: null,
    // 是否已登录
    isLoggedIn: !!localStorage.getItem('token')
  },
  
  // mutations - 用来修改state中的数据（唯一修改数据的地方）
  mutations: {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    // 设置登录状态
    SET_LOGGED_IN(state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn
    },
    // 清除用户信息（退出登录时调用）
    CLEAR_USER_INFO(state) {
      state.userInfo = null
      state.isLoggedIn = false
    }
  },
  
  // actions - 用来处理异步操作和业务逻辑
  actions: {
    // 获取用户信息
    fetchUserInfo({ commit }) {
      return getUserInfo()
        .then(res => {
          if (res.code === 200) {
            commit('SET_USER_INFO', res.data)
            commit('SET_LOGGED_IN', true)
            return res.data
          }
          return null
        })
        .catch(() => {
          // 获取失败，可能是token过期
          commit('CLEAR_USER_INFO')
          localStorage.removeItem('token')
          return null
        })
    },
    
    // 退出登录
    handleLogout({ commit }) {
      return logout()
        .finally(() => {
          // 清除本地存储的token
          localStorage.removeItem('token')
          // 清除vuex中的用户信息
          commit('CLEAR_USER_INFO')
        })
    }
  },
  
  // getters - 类似于计算属性，从state中派生出一些数据
  getters: {
    // 获取用户名
    username: state => state.userInfo ? state.userInfo.username : '',
    // 获取用户角色
    userRole: state => state.userInfo ? state.userInfo.role : '',
    // 判断是否是管理员
    isAdmin: state => state.userInfo && state.userInfo.role === 'admin',
    // 判断是否是保安
    isSecurity: state => state.userInfo && state.userInfo.role === 'security',
    // 判断是否是业主
    isOwner: state => state.userInfo && state.userInfo.role === 'owner'
  }
})
