&lt;template&gt;
  &lt;div class="payment-page"&gt;
    &lt;van-nav-bar title="支付" left-arrow @click-left="onClickLeft" /&gt;
    
    &lt;div class="payment-content"&gt;
      &lt;div v-if="!paymentSuccess" class="payment-form"&gt;
        &lt;div class="amount-section"&gt;
          &lt;div class="amount-label"&gt;支付金额&lt;/div&gt;
          &lt;div class="amount-value"&gt;¥{{ orderAmount }}&lt;/div&gt;
        &lt;/div&gt;

        &lt;van-cell-group inset class="payment-methods"&gt;
          &lt;van-cell title="支付方式" /&gt;
          &lt;van-radio-group v-model="paymentMethod"&gt;
            &lt;van-cell clickable @click="paymentMethod = 'wechat'"&gt;
              &lt;template #title&gt;
                &lt;div class="method-item"&gt;
                  &lt;van-icon name="wechat-pay" size="24" color="#07C160" /&gt;
                  &lt;span class="method-name"&gt;微信支付&lt;/span&gt;
                &lt;/div&gt;
              &lt;/template&gt;
              &lt;template #right-icon&gt;
                &lt;van-radio name="wechat" /&gt;
              &lt;/template&gt;
            &lt;/van-cell&gt;
            &lt;van-cell clickable @click="paymentMethod = 'alipay'"&gt;
              &lt;template #title&gt;
                &lt;div class="method-item"&gt;
                  &lt;van-icon name="alipay" size="24" color="#1677FF" /&gt;
                  &lt;span class="method-name"&gt;支付宝&lt;/span&gt;
                &lt;/div&gt;
              &lt;/template&gt;
              &lt;template #right-icon&gt;
                &lt;van-radio name="alipay" /&gt;
              &lt;/template&gt;
            &lt;/van-cell&gt;
          &lt;/van-radio-group&gt;
        &lt;/van-cell-group&gt;

        &lt;div class="payment-button-wrapper"&gt;
          &lt;van-button 
            type="success" 
            block 
            round 
            size="large"
            :loading="paying"
            loading-text="支付中..."
            @click="handlePayment"
          &gt;
            立即支付
          &lt;/van-button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div v-else class="payment-success"&gt;
        &lt;van-result 
          icon="success" 
          title="支付成功" 
          sub-title="订单已提交，等待发货"
        &gt;
          &lt;template #footer&gt;
            &lt;van-button type="success" round @click="viewOrders"&gt;
              查看订单
            &lt;/van-button&gt;
          &lt;/template&gt;
        &lt;/van-result&gt;
      &lt;/div&gt;
    &lt;/div&gt;

    &lt;van-overlay :show="paying"&gt;
      &lt;div class="loading-wrapper"&gt;
        &lt;van-loading size="24px" vertical&gt;支付中...&lt;/van-loading&gt;
      &lt;/div&gt;
    &lt;/van-overlay&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrders, saveOrders } from '@/utils/storage'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const order = ref(null)
const paymentMethod = ref('wechat')
const paying = ref(false)
const paymentSuccess = ref(false)

const orderAmount = computed(() => {
  return order.value ? order.value.total_amount : '0.00'
})

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
  
  if (currentOrder.status === 'pending_shipment' || currentOrder.status === 'pending_receipt' || currentOrder.status === 'completed') {
    paymentSuccess.value = true
  }
}

const handlePayment = () => {
  if (!order.value) {
    showToast('订单信息错误')
    return
  }

  paying.value = true

  setTimeout(() => {
    paying.value = false
    paymentSuccess.value = true
    
    const orders = getOrders() || []
    const orderIndex = orders.findIndex(o => o.order_id === order.value.order_id)
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'pending_shipment'
      orders[orderIndex].payment_method = paymentMethod.value
      orders[orderIndex].paid_at = new Date().toISOString()
      saveOrders(orders)
    }

    setTimeout(() => {
      router.replace('/orders')
    }, 3000)
  }, 1500)
}

const viewOrders = () => {
  router.push('/orders')
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  loadOrder()
})
&lt;/script&gt;

&lt;style scoped lang="scss"&gt;
.payment-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.payment-content {
  padding-top: 46px;
}

.payment-form {
  padding: 20px 12px;
}

.amount-section {
  background-color: #fff;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 12px;

  .amount-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
  }

  .amount-value {
    font-size: 36px;
    color: #ff4444;
    font-weight: bold;
  }
}

.payment-methods {
  margin-bottom: 20px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .method-name {
    font-size: 15px;
    color: #333;
  }
}

.payment-button-wrapper {
  padding: 0 12px;
}

.payment-success {
  padding-top: 60px;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
&lt;/style&gt;
