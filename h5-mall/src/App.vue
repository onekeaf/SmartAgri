<template>
  <div id="app">
    <!-- Debug Info -->
    <div style="position: fixed; top: 0; left: 0; z-index: 9999; background: red; color: white; padding: 4px; font-size: 12px; opacity: 0.8;" v-if="false">
      Route: {{ $route.path }}
    </div>

    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
    
    <van-tabbar 
      v-model="active" 
      v-show="showTabbar" 
      route 
      class="glass-tabbar"
      active-color="#00c853"
      inactive-color="#86868b"
      :border="false"
      z-index="1000"
    >
      <van-tabbar-item to="/" icon="wap-home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/cart" icon="shopping-cart-o">购物车</van-tabbar-item>
      <van-tabbar-item to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)
const showTabbar = ref(false)

const tabbarRoutes = ['/', '/cart', '/orders', '/profile']

watch(() => route.path, (newPath) => {
  showTabbar.value = tabbarRoutes.includes(newPath)
  
  const pathMap = {
    '/': 0,
    '/cart': 1,
    '/orders': 2,
    '/profile': 3
  }
  active.value = pathMap[newPath] ?? 0
}, { immediate: true })
</script>

<style scoped>
#app {
  min-height: 100vh;
  /* Background handled in global.scss */
}

/* Page Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Glass Tabbar */
.glass-tabbar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

:deep(.van-tabbar-item--active) {
  background: transparent;
  font-weight: 600;
}
</style>
