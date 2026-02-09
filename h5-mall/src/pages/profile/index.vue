&lt;template&gt;
  &lt;div class="profile-page"&gt;
    &lt;div class="profile-header"&gt;
      &lt;div class="user-info" @click="handleUserInfoClick"&gt;
        &lt;van-image
          round
          width="64"
          height="64"
          :src="user ? user.avatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          class="avatar"
        /&gt;
        &lt;div class="user-details"&gt;
          &lt;div class="user-name"&gt;{{ user ? user.nickname : '点击登录' }}&lt;/div&gt;
          &lt;div class="user-phone"&gt;{{ user ? user.phone : '' }}&lt;/div&gt;
        &lt;/div&gt;
        &lt;van-icon name="arrow" class="arrow-icon" /&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;div v-if="user" class="profile-content"&gt;
      &lt;van-cell-group inset class="order-section"&gt;
        &lt;div class="section-header"&gt;
          &lt;span class="section-title"&gt;我的订单&lt;/span&gt;
          &lt;van-cell is-link title="全部订单" value="查看全部" @click="goToOrders('all')" /&gt;
        &lt;/div&gt;
        &lt;van-grid :column-num="4" :border="false" class="order-grid"&gt;
          &lt;van-grid-item icon="pending-payment" text="待付款" :badge="orderCounts.pending_payment || null" @click="goToOrders('pending_payment')" /&gt;
          &lt;van-grid-item icon="logistics" text="待发货" :badge="orderCounts.pending_shipment || null" @click="goToOrders('pending_shipment')" /&gt;
          &lt;van-grid-item icon="sign" text="待收货" :badge="orderCounts.pending_receipt || null" @click="goToOrders('pending_receipt')" /&gt;
          &lt;van-grid-item icon="completed" text="已完成" :badge="orderCounts.completed || null" @click="goToOrders('completed')" /&gt;
        &lt;/van-grid&gt;
      &lt;/van-cell-group&gt;

      &lt;van-cell-group inset class="menu-section"&gt;
        &lt;van-cell title="收货地址" is-link @click="goToAddress" /&gt;
        &lt;van-cell title="关于我们" is-link @click="showAbout" /&gt;
      &lt;/van-cell-group&gt;

      &lt;div class="logout-section"&gt;
        &lt;van-button type="danger" block round @click="handleLogout"&gt;
          退出登录
        &lt;/van-button&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
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
  showToast('智慧农业商城 V1.0')
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
  }).catch(() => {
  })
}

onMounted(() => {
  loadUserInfo()
  loadOrders()
})
&lt;/script&gt;

&lt;style scoped lang="scss"&gt;
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-header {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 40px 20px 30px;

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;

    .avatar {
      margin-right: 16px;
    }

    .user-details {
      flex: 1;

      .user-name {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
        margin-bottom: 4px;
      }

      .user-phone {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .arrow-icon {
      color: #fff;
      font-size: 16px;
    }
  }
}

.profile-content {
  padding: 12px;
}

.order-section {
  margin-bottom: 12px;

  .section-header {
    padding: 16px 16px 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  .order-grid {
    padding: 16px 0;
  }
}

.menu-section {
  margin-bottom: 12px;
}

.logout-section {
  padding: 20px 12px;
}
&lt;/style&gt;
