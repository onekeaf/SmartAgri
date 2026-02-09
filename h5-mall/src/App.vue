<template>
  <div id="app">
    <router-view />
    <van-tabbar v-model="active" v-show="showTabbar" route>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
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
  background-color: #f5f5f5;
}
</style>
