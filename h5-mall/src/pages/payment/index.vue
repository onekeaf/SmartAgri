<template>
  <div class="payment-page">
    <van-nav-bar title="支付" left-arrow @click-left="onClickLeft" />
    
    <div class="payment-content">
      <div v-if="!paymentSuccess" class="payment-form">
        <div class="amount-section">
          <div class="amount-label">支付金额</div>
          <div class="amount-value">¥{{ orderAmount }}</div>
        </div>

        <van-cell-group inset class="payment-methods">
          <van-cell title="支付方式" />
          <van-radio-group v-model="paymentMethod">
            <van-cell clickable @click="paymentMethod = 'wechat'">
              <template #title>
                <div class="method-item">
                  <van-icon name="wechat-pay" size="24" color="#07C160" />
                  <span class="method-name">微信支付</span>
                </div>
              </template>
              <template #right-icon>
                <van-radio name="wechat" />
              </template>
            </van-cell>
            <van-cell clickable @click="paymentMethod = 'alipay'">
              <template #title>
                <div class="method-item">
                  <van-icon name="alipay" size="24" color="#1677FF" />
                  <span class="method-name">支付宝</span>
                </div>
              </template>
              <template #right-icon>
                <van-radio name="alipay" />
              </template>
            </van-cell>
          </van-radio-group>
        </van-cell-group>

        <div class="payment-button-wrapper">
          <van-button 
            type="success" 
            block 
            round 
            size="large"
            :loading="paying"
            loading-text="支付中..."
            @click="handlePayment"
          >
            立即支付
          </van-button>
        </div>
      </div>

      <div v-else class="payment-success">
        <van-result 
          icon="success" 
          title="支付成功" 
          sub-title="订单已提交，等待发货"
        >
          <template #footer>
            <van-button type="success" round @click="viewOrders">
              查看订单
            </van-button>
          </template>
        </van-result>
      </div>
    </div>

    <van-overlay :show="paying">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical>支付中...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
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
</script>

<style scoped lang="scss">
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
</style>
