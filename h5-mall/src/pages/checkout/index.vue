&lt;template&gt;
  &lt;div class="checkout-page"&gt;
    &lt;van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft" /&gt;
    
    &lt;div class="checkout-content"&gt;
      &lt;van-cell-group inset class="address-section"&gt;
        &lt;van-cell is-link @click="goToAddress"&gt;
          &lt;template #title&gt;
            &lt;div v-if="selectedAddress" class="address-info"&gt;
              &lt;div class="address-name"&gt;
                &lt;span class="name"&gt;{{ selectedAddress.name }}&lt;/span&gt;
                &lt;span class="phone"&gt;{{ selectedAddress.phone }}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div class="address-detail"&gt;
                {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}
              &lt;/div&gt;
            &lt;/div&gt;
            &lt;div v-else class="no-address"&gt;
              请选择收货地址
            &lt;/div&gt;
          &lt;/template&gt;
        &lt;/van-cell&gt;
      &lt;/van-cell-group&gt;

      &lt;van-cell-group inset class="products-section"&gt;
        &lt;van-cell title="商品清单" /&gt;
        &lt;div v-for="product in products" :key="product.product_id" class="product-item"&gt;
          &lt;img :src="product.image" :alt="product.product_name" class="product-image" /&gt;
          &lt;div class="product-info"&gt;
            &lt;div class="product-name"&gt;{{ product.product_name }}&lt;/div&gt;
            &lt;div class="product-spec"&gt;{{ product.specification }}&lt;/div&gt;
            &lt;div class="product-bottom"&gt;
              &lt;span class="price"&gt;¥{{ product.price }}&lt;/span&gt;
              &lt;span class="quantity"&gt;x{{ product.quantity }}&lt;/span&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/van-cell-group&gt;

      &lt;van-cell-group inset class="price-section"&gt;
        &lt;van-cell title="商品金额" :value="'¥' + goodsAmount" /&gt;
        &lt;van-cell title="运费" value="¥5.00" /&gt;
        &lt;van-cell title="合计" :value="'¥' + totalAmount" value-class="total-price" /&gt;
      &lt;/van-cell-group&gt;
    &lt;/div&gt;

    &lt;div class="checkout-footer"&gt;
      &lt;div class="total-info"&gt;
        &lt;span class="total-text"&gt;合计：&lt;/span&gt;
        &lt;span class="total-amount"&gt;¥{{ totalAmount }}&lt;/span&gt;
      &lt;/div&gt;
      &lt;van-button type="success" round @click="submitOrder"&gt;提交订单&lt;/van-button&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
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
&lt;/script&gt;

&lt;style scoped lang="scss"&gt;
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
&lt;/style&gt;
