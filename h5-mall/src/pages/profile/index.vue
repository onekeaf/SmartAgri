<template>
  <div class="profile-page">
    <!-- User Header Card -->
    <div class="header-section">
      <div class="user-card glass" @click="handleUserInfoClick">
        <div class="user-info">
          <van-image
            round
            width="70"
            height="70"
            :src="user ? user.avatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            class="avatar"
            fit="cover"
          />
          <div class="info-content">
            <div class="name-row">
              <span class="user-name">{{ user ? (user.nickname || '微信用户') : '点击登录/注册' }}</span>
              <van-tag v-if="user" type="warning" round class="vip-tag">
                <van-icon name="gem" /> SVIP
              </van-tag>
            </div>
            <div class="user-desc">{{ user ? '智慧农业让生活更美好' : '登录体验更多功能' }}</div>
          </div>
          <van-icon name="arrow" class="arrow-icon" />
        </div>
        
        <!-- Stats Row -->
        <div class="stats-row" v-if="user">
          <div class="stat-item">
            <span class="num">0.00</span>
            <span class="label">余额</span>
          </div>
          <div class="stat-item">
            <span class="num">12</span>
            <span class="label">优惠券</span>
          </div>
          <div class="stat-item">
            <span class="num">520</span>
            <span class="label">积分</span>
          </div>
          <div class="stat-item">
            <span class="num">8</span>
            <span class="label">关注店铺</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <!-- My Orders -->
      <div class="section-card glass">
        <div class="card-header">
          <span class="title">我的订单</span>
          <div class="more" @click="goToOrders('all')">
            全部订单 <van-icon name="arrow" />
          </div>
        </div>
        <van-grid :column-num="5" :border="false" class="order-grid">
          <van-grid-item icon="pending-payment" text="待付款" :badge="orderCounts.pending_payment || null" @click="goToOrders('pending_payment')" />
          <van-grid-item icon="logistics" text="待发货" :badge="orderCounts.pending_shipment || null" @click="goToOrders('pending_shipment')" />
          <van-grid-item icon="sign" text="待收货" :badge="orderCounts.pending_receipt || null" @click="goToOrders('pending_receipt')" />
          <van-grid-item icon="comment-o" text="待评价" @click="showToast('功能开发中')" />
          <van-grid-item icon="after-sale" text="退款/售后" @click="showToast('功能开发中')" />
        </van-grid>
      </div>

      <!-- Services -->
      <div class="section-card glass">
        <div class="card-header">
          <span class="title">我的服务</span>
        </div>
        <van-grid :column-num="4" :border="false" class="service-grid">
          <van-grid-item icon="location-o" text="收货地址" @click="goToAddress" />
          <van-grid-item icon="star-o" text="我的收藏" @click="showToast('收藏列表空空如也')" />
          <van-grid-item icon="shop-o" text="关注店铺" @click="showToast('您还没有关注店铺')" />
          <van-grid-item icon="browsing-history-o" text="浏览足迹" @click="showToast('功能开发中')" />
          <van-grid-item icon="service-o" text="联系客服" @click="showToast('客服忙线中')" />
          <van-grid-item icon="question-o" text="帮助中心" @click="showToast('功能开发中')" />
          <van-grid-item icon="setting-o" text="设置" @click="showToast('功能开发中')" />
          <van-grid-item icon="manager-o" text="关于我们" @click="showAbout" />
        </van-grid>
      </div>

      <!-- Logout Button -->
      <div class="logout-section" v-if="user">
        <van-button class="logout-btn" block round @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUser, saveUser, getOrders } from '@/utils/storage'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const user = ref(null)
const orders = ref([])

const orderCounts = computed(() => {
  const counts = {
    pending_payment: 0,
    pending_shipment: 0,
    pending_receipt: 0,
    completed: 0
  }

  orders.value.forEach(order => {
    if (counts[order.status] !== undefined) {
      counts[order.status]++
    }
  })

  return counts
})

const loadUserInfo = () => {
  user.value = getUser()
}

const loadOrders = () => {
  orders.value = getOrders() || []
}

const handleUserInfoClick = () => {
  if (!user.value) {
    router.push({
      path: '/login',
      query: { redirect: '/profile' }
    })
  } else {
    showToast('个人信息编辑功能开发中')
  }
}

const goToOrders = (status) => {
  if (!user.value) {
    router.push({
      path: '/login',
      query: { redirect: '/orders' }
    })
    return
  }
  router.push({
    path: '/orders',
    query: { status }
  })
}

const goToAddress = () => {
  if (!user.value) {
    router.push({
      path: '/login',
      query: { redirect: '/address' }
    })
    return
  }
  router.push('/address')
}

const showAbout = () => {
  showToast('智慧农业商城 V2.0\n让农业更智慧')
}

const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出登录吗？'
  }).then(() => {
    saveUser(null)
    user.value = null
    orders.value = []
    showToast('已退出登录')
    router.push('/login')
  }).catch(() => {
  })
}

onMounted(() => {
  loadUserInfo()
  loadOrders()
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.header-section {
  padding: 20px 16px;
  background: linear-gradient(180deg, #e8f5e9 0%, #f7f8fa 100%);
}

.user-card {
  padding: 20px;
  border-radius: 16px;
  /* Glass effect handled by global .glass class, but we add white bg fallback */
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  .avatar {
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .info-content {
    flex: 1;
    margin-left: 16px;
    
    .name-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      
      .user-name {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-right: 8px;
      }
      
      .vip-tag {
        font-size: 10px;
        padding: 2px 6px;
      }
    }
    
    .user-desc {
      font-size: 12px;
      color: #999;
    }
  }
  
  .arrow-icon {
    color: #ccc;
    font-size: 16px;
  }
}

.stats-row {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .num {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }
    
    .label {
      font-size: 12px;
      color: #999;
    }
  }
}

.content-section {
  padding: 0 16px;
}

.section-card {
  margin-bottom: 16px;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f9f9f9;
    
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .more {
      font-size: 12px;
      color: #999;
      display: flex;
      align-items: center;
    }
  }
}

.order-grid, .service-grid {
  :deep(.van-grid-item__content) {
    background-color: transparent;
  }
  
  :deep(.van-grid-item__text) {
    color: #666;
  }
}

.logout-section {
  margin-top: 32px;
  
  .logout-btn {
    color: #ff4444;
    border-color: #fff;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
}
</style>
