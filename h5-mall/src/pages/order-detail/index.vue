&lt;template&gt;
  &lt;div class="order-detail-page"&gt;
    &lt;van-nav-bar title="订单详情" left-arrow @click-left="onClickLeft" /&gt;
    
    &lt;div v-if="order" class="detail-content"&gt;
      &lt;div class="status-section"&gt;
        &lt;van-icon :name="getStatusIcon(order.status)" size="48" :color="getStatusColor(order.status)" /&gt;
        &lt;div class="status-text"&gt;{{ getStatusText(order.status) }}&lt;/div&gt;
      &lt;/div&gt;

      &lt;van-cell-group inset class="address-section"&gt;
        &lt;van-cell title="收货地址" is-link :value="formattedAddress" /&gt;
      &lt;/van-cell-group&gt;

      &lt;van-cell-group inset class="products-section"&gt;
        &lt;div class="section-title"&gt;商品清单&lt;/div&gt;
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
      &lt;/van-cell-group&gt;

      &lt;van-cell-group inset class="info-section"&gt;
        &lt;van-cell title="订单信息" /&gt;
        &lt;van-cell title="订单号" :value="order.order_id" /&gt;
        &lt;van-cell title="下单时间" :value="formatTime(order.created_at)" /&gt;
        &lt;van-cell title="支付方式" :value="getPaymentMethodText(order.payment_method)" /&gt;
      &lt;/van-cell-group&gt;

      &lt;van-cell-group inset class="price-section"&gt;
        &lt;van-cell title="商品金额" :value="'¥' + goodsAmount" /&gt;
        &lt;van-cell title="运费" value="¥5.00" /&gt;
        &lt;van-cell title="合计" :value="'¥' + order.total_amount" value-class="total-price" /&gt;
      &lt;/van-cell-group&gt;

      &lt;div class="bottom-actions"&gt;
        &lt;van-button 
          v-if="order.status === 'pending_payment'"
          @click="cancelOrder"
        &gt;
          取消订单
        &lt;/van-button&gt;
        &lt;van-button 
          v-if="order.status === 'pending_payment'"
          type="success" 
          @click="payOrder"
        &gt;
          去支付
        &lt;/van-button&gt;
        &lt;van-button 
          v-if="order.status === 'pending_receipt'"
          type="success" 
          @click="confirmReceipt"
        &gt;
          确认收货
        &lt;/van-button&gt;
        &lt;van-button 
          v-if="order.status === 'completed'"
          @click="buyAgain"
        &gt;
          再次购买
        &lt;/van-button&gt;
        &lt;van-button 
          v-if="order.status === 'cancelled'"
          type="danger" 
          @click="deleteOrder"
        &gt;
          删除订单
        &lt;/van-button&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;div v-else class="empty-state"&gt;
      &lt;van-empty description="订单不存在" /&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrders, saveOrders, saveCart } from '@/utils/storage'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const order = ref(null)

const goodsAmount = computed(() => {
  if (!order.value) return '0.00'
  return (parseFloat(order.value.total_amount) - 5).toFixed(2)
})

const formattedAddress = computed(() => {
  if (!order.value || !order.value.address) return ''
  const addr = order.value.address
  return `${addr.province}${addr.city}${addr.district}${addr.detail} ${addr.name} ${addr.phone}`
})

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

const getStatusIcon = (status) => {
  const iconMap = {
    pending_payment: 'clock-o',
    pending_shipment: 'logistics',
    pending_receipt: 'envelop-o',
    completed: 'checked',
    cancelled: 'close'
  }
  return iconMap[status] || 'info-o'
}

const getStatusColor = (status) => {
  const colorMap = {
    pending_payment: '#ff976a',
    pending_shipment: '#1989fa',
    pending_receipt: '#4CAF50',
    completed: '#4CAF50',
    cancelled: '#999'
  }
  return colorMap[status] || '#999'
}

const getPaymentMethodText = (method) => {
  const methodMap = {
    wechat: '微信支付',
    alipay: '支付宝'
  }
  return methodMap[method] || '未知'
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const loadOrder = () => {
  const orderId = route.query.orderId
  if (!orderId) {
    showToast('订单参数错误')
    router.push('/orders')
    return
  }

  const orders = getOrders() || []
  const currentOrder = orders.find(o => o.order_id === orderId)
  
  if (!currentOrder) {
    showToast('订单不存在')
    router.push('/orders')
    return
  }

  order.value = currentOrder
}

const cancelOrder = () => {
  showConfirmDialog({
    title: '确认取消',
    message: '确定要取消该订单吗？'
  }).then(() => {
    const orders = getOrders() || []
    const orderIndex = orders.findIndex(o => o.order_id === order.value.order_id)
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'cancelled'
      saveOrders(orders)
      order.value.status = 'cancelled'
      showToast('订单已取消')
    }
  }).catch(() => {
  })
}

const payOrder = () => {
  router.push({
    path: '/payment',
    query: { orderId: order.value.order_id }
  })
}

const confirmReceipt = () => {
  showConfirmDialog({
    title: '确认收货',
    message: '确定已收到商品吗？'
  }).then(() => {
    const orders = getOrders() || []
    const orderIndex = orders.findIndex(o => o.order_id === order.value.order_id)
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'completed'
      orders[orderIndex].completed_at = new Date().toISOString()
      saveOrders(orders)
      order.value.status = 'completed'
      showToast('确认收货成功')
    }
  }).catch(() => {
  })
}

const buyAgain = () => {
  const cart = saveCart() || []
  
  order.value.products.forEach(product => {
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

const deleteOrder = () => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除该订单吗？'
  }).then(() => {
    const orders = getOrders() || []
    const newOrders = orders.filter(o => o.order_id !== order.value.order_id)
    saveOrders(newOrders)
    showToast('订单已删除')
    router.push('/orders')
  }).catch(() => {
  })
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  loadOrder()
})
&lt;/script&gt;

&lt;style scoped lang="scss"&gt;
.order-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.detail-content {
  padding: 46px 12px 12px;
}

.status-section {
  background-color: #4CAF50;
  padding: 40px 20px;
  text-align: center;
  color: #fff;
  margin-bottom: 12px;
  border-radius: 0 0 16px 16px;

  .status-text {
    font-size: 18px;
    font-weight: bold;
    margin-top: 12px;
  }
}

.address-section {
  margin-bottom: 12px;
}

.products-section {
  margin-bottom: 12px;

  .section-title {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
    border-bottom: 1px solid #f5f5f5;
  }
}

.product-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .product-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    margin-right: 12px;
    object-fit: cover;
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .product-name {
      font-size: 14px;
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
        font-size: 16px;
        color: #ff4444;
        font-weight: bold;
      }

      .quantity {
        font-size: 13px;
        color: #999;
      }
    }
  }
}

.info-section {
  margin-bottom: 12px;
}

.price-section {
  margin-bottom: 12px;
}

.total-price {
  color: #ff4444;
  font-weight: bold;
  font-size: 16px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #eee;
  z-index: 100;
}

.empty-state {
  padding: 60px 20px;
}
&lt;/style&gt;
