import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/home/index.vue')
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../pages/product-detail/index.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../pages/cart/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../pages/checkout/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('../pages/payment/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../pages/orders/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('../pages/order-detail/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('../pages/address/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login/index.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile/index.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory('/mall/'),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = localStorage.getItem('mall_user')
    if (!user) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
