&lt;template&gt;
  &lt;div class="orders-page"&gt;
    &lt;van-nav-bar title="我的订单" left-arrow @click-left="onClickLeft" /&gt;
    
    &lt;div class="orders-content"&gt;
      &lt;van-tabs v-model:active="activeTab" sticky @change="onTabChange"&gt;
        &lt;van-tab title="全部" name="all" /&gt;
        &lt;van-tab title="待付款" name="pending_payment" /&gt;
        &lt;van-tab title="待发货" name="pending_shipment" /&gt;
        &lt;van-tab title="待收货" name="pending_receipt" /&gt;
        &lt;van-tab title="已完成" name="completed" /&gt;
      &lt;/van-tabs&gt;

      &lt;div class="orders-list"&gt;
        &lt;div v-if="filteredOrders.length === 0" class="empty-orders"&gt;
          &lt;van-empty description="暂无订单" /&gt;
        &lt;/div&gt;

        &lt;div v-else&gt;
          &lt;div 
            v-for="order in filteredOrders" 
            :key="order.order_id" 
            class="order-card"
            @click="goToOrderDetail(order.order_id)"
          &gt;
            &lt;div class="order-header"&gt;
              &lt;span class="order-id"&gt;订单号：{{ order.order_id }}&lt;/span&gt;
              &lt;van-tag :type="getStatusType(order.status)"&gt;
                {{ getStatusText(order.status) }}
              &lt;/van-tag&gt;
            &lt;/div&gt;

            &lt;div class="order-products"&gt;
              &lt;div 
                v-for="product in order.products" 
                :key="product.product_id" 
                class="product-item"
              &gt;
                &lt;img :src="product.image" :alt="product.product_name" class="product-image" /&gt;
                &lt;div class="product-info"&gt;
                  &lt;div class="product-name"&gt;{{ product.product_name }}&lt;/div&gt;
                  &lt;div class="product-bottom"&gt;
                    &lt;span class="price"&gt;¥{{ product.price }}&lt;/span&gt;
                    &lt;span class="quantity"&gt;x{{ product.quantity }}&lt;/span&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;div class="order-footer"&gt;
              &lt;span class="total-amount"&gt;实付款：¥{{ order.total_amount }}&lt;/span&gt;
              &lt;div class="order-actions"&gt;
                &lt;van-button 
                  v-if="order.status === 'pending_payment'"
                  size="small" 
                  @click.stop="cancelOrder(order)"
                &gt;
                  取消订单
                &lt;/van-button&gt;
                &lt;van-button 
                  v-if="order.status === 'pending_payment'"
                  size="small" 
                  type="success"
                  @click.stop="payOrder(order)"
                &gt;
                  去支付
                &lt;/van-button&gt;
                &lt;van-button 
                  v-if="order.status === 'pending_receipt'"
                  size="small" 
                  type="success"
                  @click.stop="confirmReceipt(order)"
                &gt;
                  确认收货
                &lt;/van-button&gt;
                &lt;van-button 
                  v-if="order.status === 'completed'"
                  size="small" 
                  @click.stop="buyAgain(order)"
                &gt;
                  再次购买
                &lt;/van-button&gt;
                &lt;van-button 
                  v-if="order.status === 'cancelled'"
                  size="small" 
                  type="danger"
                  @click.stop="deleteOrder(order)"
                &gt;
                  删除订单
                &lt;/van-button&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrders, saveOrders, saveCart } from '@/utils/storage'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const activeTab = ref('all')
const orders = ref([])

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeTab.value)
})

const loadOrders = () => {
  orders.value = getOrders() || []
}

const getStatusText = (status) => {
  const statusMap = {
    pending_payment: '待付款',
    pending_shipment: '待发货',
    pending_receipt: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    pending_payment: 'warning',
    pending_shipment: 'primary',
    pending_receipt: 'success',
    completed: 'success',
    cancelled: 'default'
  }
  return typeMap[status] || 'default'
}

const onTabChange = () => {
}

const goToOrderDetail = (orderId) => {
  router.push({
    path: '/order-detail',
    query: { orderId }
  })
}

const cancelOrder = (order) => {
  showConfirmDialog({
    title: '确认取消',
    message: '确定要取消该订单吗？'
  }).then(() => {
    const orderIndex = orders.value.findIndex(o => o.order_id === order.order_id)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'cancelled'
      saveOrders(orders.value)
      showToast('订单已取消')
    }
  }).catch(() => {
  })
}

const payOrder = (order) => {
  router.push({
    path: '/payment',
    query: { orderId: order.order_id }
  })
}

const confirmReceipt = (order) => {
  showConfirmDialog({
    title: '确认收货',
    message: '确定已收到商品吗？'
  }).then(() => {
    const orderIndex = orders.value.findIndex(o => o.order_id === order.order_id)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'completed'
      orders.value[orderIndex].completed_at = new Date().toISOString()
      saveOrders(orders.value)
      showToast('确认收货成功')
    }
  }).catch(() => {
  })
}

const buyAgain = (order) => {
  const cart = saveCart() || []
  
  order.products.forEach(product => {
    const existingItem = cart.find(item => item.product_id === product.product_id)
    if (existingItem) {
      existingItem.quantity += product.quantity
    } else {
      cart.push({
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
        image: product.image,
        quantity: product.quantity,
        specification: '',
        stock: 100,
        checked: true
      })
    }
  })
  
  saveCart(cart)
  showToast('已加入购物车')
  router.push('/cart')
}

const deleteOrder = (order) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除该订单吗？'
  }).then(() => {
    orders.value = orders.value.filter(o => o.order_id !== order.order_id)
    saveOrders(orders.value)
    showToast('订单已删除')
  }).catch(() => {
  })
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  loadOrders()
})
&lt;/script&gt;

&lt;style scoped lang="scss"&gt;
.orders-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.orders-content {
  padding-top: 44px;
}

.orders-list {
  padding: 12px;
}

.empty-orders {
  padding: 60px 20px;
}

.order-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;

  .order-id {
    font-size: 12px;
    color: #999;
  }
}

.order-products {
  padding: 12px 0;
}

.product-item {
  display: flex;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  .product-image {
    width: 70px;
    height: 70px;
    border-radius: 4px;
    margin-right: 10px;
    object-fit: cover;
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .product-name {
      font-size: 13px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price {
        font-size: 14px;
        color: #ff4444;
        font-weight: bold;
      }

      .quantity {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;

  .total-amount {
    font-size: 14px;
    color: #333;
  }

  .order-actions {
    display: flex;
    gap: 8px;
  }
}
&lt;/style&gt;
