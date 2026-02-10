<template>
  <div class="orders-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="onClickLeft" fixed placeholder z-index="999" />
    
    <van-tabs v-model:active="activeTab" sticky offset-top="46" background="#f7f8fa" color="#00c853" title-active-color="#00c853">
      <van-tab title="全部" name="all" />
      <van-tab title="待付款" name="pending_payment" />
      <van-tab title="待发货" name="pending_shipment" />
      <van-tab title="待收货" name="pending_receipt" />
      <van-tab title="已完成" name="completed" />
    </van-tabs>

    <div class="orders-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="filteredOrders.length === 0" class="empty-orders">
          <van-empty description="暂无相关订单" />
        </div>
        
        <div v-else class="order-card glass" v-for="order in filteredOrders" :key="order.order_id" @click="goToDetail(order)">
          <div class="card-header">
            <span class="shop-name">
              <van-icon name="shop-o" /> 智慧农业自营店 <van-icon name="arrow" />
            </span>
            <span class="status-text" :style="{ color: getStatusColor(order.status) }">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          
          <div class="card-body">
            <div class="product-item" v-for="(product, index) in order.products.slice(0, 3)" :key="index">
              <van-image 
                :src="product.image || '/images/banners/banner1.jpg'" 
                class="product-img" 
                radius="4px" 
                fit="cover"
              />
              <div class="product-info" v-if="order.products.length === 1">
                <div class="name ellipsis-2">{{ product.product_name }}</div>
                <div class="spec">{{ product.specification || '标准规格' }}</div>
              </div>
            </div>
            <div class="more-products" v-if="order.products.length > 3">
              See more...
            </div>
            <div class="single-price" v-if="order.products.length === 1">
              <span class="price-symbol">¥</span>{{ order.products[0].price }}
              <span class="quantity">x{{ order.products[0].quantity }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="total-row">
              <span class="count">共{{ getTotalCount(order) }}件商品</span>
              <span class="total-label">合计:</span>
              <span class="total-price">¥{{ order.total_amount }}</span>
            </div>
            
            <div class="action-buttons">
              <van-button 
                v-if="order.status === 'pending_payment'" 
                round size="small" plain type="warning" 
                @click.stop="cancelOrder(order)"
              >
                取消订单
              </van-button>
              <van-button 
                v-if="order.status === 'pending_payment'" 
                round size="small" color="#00c853" 
                @click.stop="payOrder(order)"
              >
                去支付
              </van-button>
              <van-button 
                v-if="order.status === 'pending_shipment'" 
                round size="small" plain 
                @click.stop="remindShipment"
              >
                提醒发货
              </van-button>
              <van-button 
                v-if="order.status === 'pending_receipt'" 
                round size="small" color="#00c853" 
                @click.stop="confirmReceipt(order)"
              >
                确认收货
              </van-button>
              <van-button 
                v-if="order.status === 'completed' || order.status === 'cancelled'" 
                round size="small" plain type="danger" 
                @click.stop="deleteOrder(order)"
              >
                删除订单
              </van-button>
              <van-button 
                v-if="order.status === 'completed'" 
                round size="small" plain color="#00c853" 
                @click.stop="buyAgain(order)"
              >
                再次购买
              </van-button>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrders, saveOrders, saveCart } from '@/utils/storage'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const activeTab = ref('all')
const orders = ref([])
const refreshing = ref(false)

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === activeTab.value)
})

const loadOrders = () => {
  orders.value = getOrders() || []
}

const onRefresh = () => {
  setTimeout(() => {
    loadOrders()
    refreshing.value = false
  }, 500)
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

const getStatusColor = (status) => {
  const colorMap = {
    pending_payment: '#ff976a',
    pending_shipment: '#1989fa',
    pending_receipt: '#00c853',
    completed: '#333',
    cancelled: '#999'
  }
  return colorMap[status] || '#333'
}

const getTotalCount = (order) => {
  return order.products.reduce((sum, p) => sum + p.quantity, 0)
}

const goToDetail = (order) => {
  router.push(`/order/${order.order_id}`)
}

const cancelOrder = (order) => {
  showConfirmDialog({
    title: '取消订单',
    message: '确定要取消该订单吗？'
  }).then(() => {
    order.status = 'cancelled'
    saveOrders(orders.value)
    showToast('订单已取消')
  }).catch(() => {})
}

const payOrder = (order) => {
  router.push({
    path: '/payment',
    query: { orderId: order.order_id }
  })
}

const remindShipment = () => {
  showToast('已提醒商家发货')
}

const confirmReceipt = (order) => {
  showConfirmDialog({
    title: '确认收货',
    message: '确认已收到商品？'
  }).then(() => {
    order.status = 'completed'
    saveOrders(orders.value)
    showToast('交易完成')
  }).catch(() => {})
}

const buyAgain = (order) => {
  const cart = getCart() || [] // Use getCart, not saveCart
  
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
  }).catch(() => {})
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  if (route.query.status) {
    activeTab.value = route.query.status
  }
  loadOrders()
})
</script>

<style scoped lang="scss">
.orders-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.orders-list {
  padding: 12px;
}

.empty-orders {
  padding-top: 100px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #f9f9f9;
    
    .shop-name {
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .status-text {
      font-size: 14px;
    }
  }
  
  .card-body {
    padding: 12px 0;
    
    .product-item {
      display: flex;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .product-img {
        width: 70px;
        height: 70px;
        background: #f5f5f5;
        margin-right: 10px;
      }
      
      .product-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .name {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }
        
        .spec {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .single-price {
      text-align: right;
      font-size: 14px;
      
      .price-symbol {
        font-size: 12px;
      }
      
      .quantity {
        color: #999;
        font-size: 12px;
        margin-left: 4px;
      }
    }
  }
  
  .card-footer {
    border-top: 1px solid #f9f9f9;
    padding-top: 12px;
    
    .total-row {
      text-align: right;
      margin-bottom: 12px;
      font-size: 12px;
      color: #333;
      
      .count {
        color: #999;
        margin-right: 8px;
      }
      
      .total-price {
        font-size: 16px;
        font-weight: bold;
        margin-left: 4px;
      }
    }
    
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  }
}
</style>
