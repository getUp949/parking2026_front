import Vue from 'vue'
import MobileApp from './App.vue'
import router from './router'
import store from '../store'
import MobileLayout from './components/MobileLayout.vue'

console.error('MOBILE-DEBUG: Mobile main.js loading NOW')
console.error('MOBILE-DEBUG: mobile-app element:', document.getElementById('mobile-app'))
console.error('MOBILE-DEBUG: Vue version:', Vue.version)

Vue.component('MobileLayout', MobileLayout)

Vue.config.productionTip = false

const vm = new Vue({
  router,
  store,
  render: h => h(MobileApp)
})
console.error('MOBILE-DEBUG: Vue instance created:', vm)
console.error('MOBILE-DEBUG: Mounting to #mobile-app...')
vm.$mount('#mobile-app')
console.error('MOBILE-DEBUG: Vue mounted, $el:', vm.$el)
console.error('MOBILE-DEBUG: document.body.innerHTML:', document.body.innerHTML)