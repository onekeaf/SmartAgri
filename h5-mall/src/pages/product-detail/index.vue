<template>
  <div class="product-detail-page">
    <van-nav-bar
      title="商品详情"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />
    
    <div class="content-wrapper">
      <van-swipe :autoplay="3000" indicator-color="#4CAF50">
        <van-swipe-item v-for="(image, index) in product.images" :key="index">
          <van-image
            :src="image"
            fit="contain"
            class="swipe-image"
          >
            <template #error>
              <div class="image-placeholder">
                {{ product.product_name?.charAt(0) || '商' }}
              </div>
            </template>
          </van-image>
        </van-swipe-item>
      </van-swipe>
      
      <div class="price-section">
        <div class="price-row">
          <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
          <span v-if="product.original_price" class="original-price">
            ¥{{ product.original_price.toFixed(2) }}
          </span>
          <span class="sales">已售{{ product.sales }}件</span>
        </div>
      </div>
      
      <div class="product-name">{{ product.product_name }}</div>
      
      <van-cell-group inset class="info-card">
        <van-cell title="规格" :value="product.specification || '暂无'" />
        <van-cell title="产地" :value="product.origin || '暂无'" />
        <van-cell title="库存" :value="`${product.stock}件`" />
      </van-cell-group>
      
      <div class="description-section">
        <div class="section-title">商品描述</div>
        <div class="description-content">{{ product.description }}</div>
      </div>
      
      <van-cell-group inset class="farmer-card">
        <van-cell center>
          <template #title>
            <div class="farmer-info">
              <van-image
                round
                width="40"
                height="40"
                :src="product.farmer?.farmer_avatar"
                class="farmer-avatar"
              >
                <template #error>
                  <div class="avatar-placeholder">
                    {{ product.farmer?.farmer_name?.charAt(0) || '农' }}
                  </div>
                </template>
              </van-image>
              <div class="farmer-details">
                <div class="farmer-name">
                  {{ product.farmer?.farmer_name || '农民' }}
                  <van-tag v-if="product.farmer?.verified" type="success" size="mini">
                    已认证
                  </van-tag>
                </div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <van-action-bar>
      <van-action-bar-icon
        icon="cart-o"
        text="购物车"
        :badge="cartCount || ''"
        @click="onCartClick"
      />
      <van-action-bar-button
        color="#4CAF50"
        text="加入购物车"
        @click="onAddToCart"
      />
      <van-action-bar-button
        color="#ff6b00"
        text="立即购买"
        @click="onBuyNow"
      />
    </van-action-bar>
    
    <van-popup
      v-model:show="showQuantityPopup"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    >
      <div class="quantity-popup-content">
        <div class="popup-title">选择数量</div>
        <div class="quantity-control">
          <van-stepper v-model="quantity" min="1" :max="product.stock" />
        </div>
        <van-button
          type="primary"
          color="#4CAF50"
          block
          round
          @click="onConfirmQuantity"
        >
          确定
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getProducts, getUser } from '@/utils/storage';

const router = useRouter();
const route = useRoute();

const product = ref({
  product_id: 0,
  product_name: '',
  category: '',
  price: 0,
  original_price: 0,
  images: [],
  description: '',
  specification: '',
  stock: 0,
  sales: 0,
  origin: '',
  farmer: {
    farmer_id: 0,
    farmer_name: '',
    farmer_avatar: '',
    verified: false
  },
  status: 'on_sale'
});

const showQuantityPopup = ref(false);
const quantity = ref(1);
const actionType = ref('');
const cartCount = ref(0);

const loadProduct = () => {
  const productId = parseInt(route.params.id);
  const products = getProducts();
  const found = products.find(p => p.product_id === productId);
  
  if (found) {
    product.value = found;
  } else {
    showToast('商品不存在');
    router.back();
  }
};

const loadCartCount = () => {
  const cart = JSON.parse(localStorage.getItem('mall_cart') || '[]');
  cartCount.value = cart.reduce((total, item) => total + item.quantity, 0);
};

const checkLogin = () => {
  const user = getUser();
  if (!user) {
    showToast('请先登录');
    router.push('/login');
    return false;
  }
  return true;
};

const onBack = () => {
  router.back();
};

const onCartClick = () => {
  router.push('/cart');
};

const onAddToCart = () => {
  if (!checkLogin()) return;
  actionType.value = 'add_to_cart';
  quantity.value = 1;
  showQuantityPopup.value = true;
};

const onBuyNow = () => {
  if (!checkLogin()) return;
  actionType.value = 'buy_now';
  quantity.value = 1;
  showQuantityPopup.value = true;
};

const onConfirmQuantity = () => {
  if (actionType.value === 'add_to_cart') {
    addToCart();
  } else if (actionType.value === 'buy_now') {
    buyNow();
  }
  showQuantityPopup.value = false;
};

const addToCart = () => {
  const cart = JSON.parse(localStorage.getItem('mall_cart') || '[]');
  const existingIndex = cart.findIndex(item => item.product_id === product.value.product_id);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity.value;
  } else {
    cart.push({
      product_id: product.value.product_id,
      product_name: product.value.product_name,
      price: product.value.price,
      image: product.value.images?.[0] || '',
      quantity: quantity.value
    });
  }
  
  localStorage.setItem('mall_cart', JSON.stringify(cart));
  loadCartCount();
  showToast('已加入购物车');
};

const buyNow = () => {
  router.push(`/checkout?productId=${product.value.product_id}&quantity=${quantity.value}`);
};

onMounted(() => {
  loadProduct();
  loadCartCount();
});
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
