<template>
  <div class="checkout-page">
    <van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft" />
    
    <div class="checkout-content">
      <van-cell-group inset class="address-section">
        <van-cell is-link @click="goToAddress">
          <template #title>
            <div v-if="selectedAddress" class="address-info">
              <div class="address-name">
                <span class="name">{{ selectedAddress.name }}</span>
                <span class="phone">{{ selectedAddress.phone }}</span>
              </div>
              <div class="address-detail">
                {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}
              </div>
            </div>
            <div v-else class="no-address">
              请选择收货地址
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset class="products-section">
        <van-cell title="商品清单" />
        <div v-for="product in products" :key="product.product_id" class="product-item">
          <img :src="product.image" :alt="product.product_name" class="product-image" />
          <div class="product-info">
            <div class="product-name">{{ product.product_name }}</div>
            <div class="product-spec">{{ product.specification }}</div>
            <div class="product-bottom">
              <span class="price">¥{{ product.price }}</span>
              <span class="quantity">x{{ product.quantity }}</span>
            </div>
          </div>
        </div>
      </van-cell-group>

      <van-cell-group inset class="price-section">
        <van-cell title="商品金额" :value="'¥' + goodsAmount" />
        <van-cell title="运费" value="¥5.00" />
        <van-cell title="合计" :value="'¥' + totalAmount" value-class="total-price" />
      </van-cell-group>
    </div>

    <div class="checkout-footer">
      <div class="total-info">
        <span class="total-text">合计：</span>
        <span class="total-amount">¥{{ totalAmount }}</span>
      </div>
      <van-button type="success" round @click="submitOrder">提交订单</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCart, saveCart, getAddresses, saveOrders, getProducts } from '@/utils/storage'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const products = ref([])
const selectedAddress = ref(null)
const isBuyNow = ref(false)

const goodsAmount = computed(() => {
  return products.value
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

const totalAmount = computed(() => {
  return (parseFloat(goodsAmount.value) + 5).toFixed(2)
})

const loadProducts = () => {
  const productId = route.query.productId
  const quantity = parseInt(route.query.quantity) || 1

  if (productId) {
    isBuyNow.value = true
    const allProducts = getProducts() || []
    const product = allProducts.find(p => p.product_id === productId)
    if (product) {
      products.value = [{
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
        specification: product.specification
      }]
    }
  } else {
    isBuyNow.value = false
    const cart = getCart() || []
    products.value = cart.filter(item => item.checked)
  }
}

const loadAddress = () => {
  const addresses = getAddresses() || []
  const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0]
  if (defaultAddress) {
    selectedAddress.value = defaultAddress
  }
}

const goToAddress = () => {
  router.push({
    path: '/address',
    query: { from: 'checkout' }
  })
}

const submitOrder = () => {
  if (!selectedAddress.value) {
    showToast('请选择收货地址')
    return
  }

  if (products.value.length === 0) {
    showToast('请选择商品')
    return
  }

  const orderId = 'ORD' + Date.now()
  const order = {
    order_id: orderId,
    products: products.value.map(p => ({
      product_id: p.product_id,
      product_name: p.product_name,
      price: p.price,
      quantity: p.quantity,
      image: p.image
    })),
    total_amount: totalAmount.value,
    shipping_fee: 5,
    address: selectedAddress.value,
    status: 'pending_payment',
    created_at: new Date().toISOString(),
    payment_method: 'wechat'
  }

  const orders = getOrders() || []
  orders.unshift(order)
  saveOrders(orders)

  if (!isBuyNow.value) {
    const cart = getCart() || []
    const checkedItems = cart.filter(item => item.checked)
    const remainingCart = cart.filter(item => !item.checked)
    saveCart(remainingCart)
  }

  router.push({
    path: '/payment',
    query: { orderId: orderId }
  })
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  loadProducts()
  loadAddress()
})
</script>

<style scoped lang="scss">
.checkout-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.checkout-content {
  padding: 46px 12px 12px;
}

.address-section {
  margin-bottom: 12px;
}

.address-info {
  width: 100%;

  .address-name {
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 500;

    .name {
      margin-right: 12px;
      font-size: 16px;
      font-weight: bold;
    }

    .phone {
      color: #666;
    }
  }

  .address-detail {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
  }
}

.no-address {
  padding: 20px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.products-section {
  margin-bottom: 12px;
}

.product-item {
  display: flex;
  padding: 12px;
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

    .product-spec {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    .product-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;

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

.price-section {
  margin-bottom: 12px;
}

.total-price {
  color: #ff4444;
  font-weight: bold;
  font-size: 16px;
}

.checkout-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #eee;
  z-index: 100;

  .total-info {
    display: flex;
    align-items: baseline;

    .total-text {
      font-size: 14px;
      color: #333;
    }

    .total-amount {
      font-size: 20px;
      color: #ff4444;
      font-weight: bold;
    }
  }
}
</style>
