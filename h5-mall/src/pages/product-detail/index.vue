&lt;template&gt;
  &lt;div class="product-detail-page"&gt;
    &lt;van-nav-bar
      title="商品详情"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    /&gt;
    
    &lt;div class="content-wrapper"&gt;
      &lt;van-swipe :autoplay="3000" indicator-color="#4CAF50"&gt;
        &lt;van-swipe-item v-for="(image, index) in product.images" :key="index"&gt;
          &lt;van-image
            :src="image"
            fit="contain"
            class="swipe-image"
          &gt;
            &lt;template #error&gt;
              &lt;div class="image-placeholder"&gt;
                {{ product.product_name?.charAt(0) || '商' }}
              &lt;/div&gt;
            &lt;/template&gt;
          &lt;/van-image&gt;
        &lt;/van-swipe-item&gt;
      &lt;/van-swipe&gt;
      
      &lt;div class="price-section"&gt;
        &lt;div class="price-row"&gt;
          &lt;span class="current-price"&gt;¥{{ product.price.toFixed(2) }}&lt;/span&gt;
          &lt;span v-if="product.original_price" class="original-price"&gt;
            ¥{{ product.original_price.toFixed(2) }}
          &lt;/span&gt;
          &lt;span class="sales"&gt;已售{{ product.sales }}件&lt;/span&gt;
        &lt;/div&gt;
      &lt;/div&gt;
      
      &lt;div class="product-name"&gt;{{ product.product_name }}&lt;/div&gt;
      
      &lt;van-cell-group inset class="info-card"&gt;
        &lt;van-cell title="规格" :value="product.specification || '暂无'" /&gt;
        &lt;van-cell title="产地" :value="product.origin || '暂无'" /&gt;
        &lt;van-cell title="库存" :value="`${product.stock}件`" /&gt;
      &lt;/van-cell-group&gt;
      
      &lt;div class="description-section"&gt;
        &lt;div class="section-title"&gt;商品描述&lt;/div&gt;
        &lt;div class="description-content"&gt;{{ product.description }}&lt;/div&gt;
      &lt;/div&gt;
      
      &lt;van-cell-group inset class="farmer-card"&gt;
        &lt;van-cell center&gt;
          &lt;template #title&gt;
            &lt;div class="farmer-info"&gt;
              &lt;van-image
                round
                width="40"
                height="40"
                :src="product.farmer?.farmer_avatar"
                class="farmer-avatar"
              &gt;
                &lt;template #error&gt;
                  &lt;div class="avatar-placeholder"&gt;
                    {{ product.farmer?.farmer_name?.charAt(0) || '农' }}
                  &lt;/div&gt;
                &lt;/template&gt;
              &lt;/van-image&gt;
              &lt;div class="farmer-details"&gt;
                &lt;div class="farmer-name"&gt;
                  {{ product.farmer?.farmer_name || '农民' }}
                  &lt;van-tag v-if="product.farmer?.verified" type="success" size="mini"&gt;
                    已认证
                  &lt;/van-tag&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/template&gt;
        &lt;/van-cell&gt;
      &lt;/van-cell-group&gt;
    &lt;/div&gt;
    
    &lt;van-action-bar&gt;
      &lt;van-action-bar-icon
        icon="cart-o"
        text="购物车"
        :badge="cartCount || ''"
        @click="onCartClick"
      /&gt;
      &lt;van-action-bar-button
        color="#4CAF50"
        text="加入购物车"
        @click="onAddToCart"
      /&gt;
      &lt;van-action-bar-button
        color="#ff6b00"
        text="立即购买"
        @click="onBuyNow"
      /&gt;
    &lt;/van-action-bar&gt;
    
    &lt;van-popup
      v-model:show="showQuantityPopup"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    &gt;
      &lt;div class="quantity-popup-content"&gt;
        &lt;div class="popup-title"&gt;选择数量&lt;/div&gt;
        &lt;div class="quantity-control"&gt;
          &lt;van-stepper v-model="quantity" min="1" :max="product.stock" /&gt;
        &lt;/div&gt;
        &lt;van-button
          type="primary"
          color="#4CAF50"
          block
          round
          @click="onConfirmQuantity"
        &gt;
          确定
        &lt;/van-button&gt;
      &lt;/div&gt;
    &lt;/van-popup&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { getProducts } from '@/utils/storage';

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

const loadProduct = () =&gt; {
  const productId = parseInt(route.params.id);
  const products = getProducts();
  const found = products.find(p =&gt; p.product_id === productId);
  
  if (found) {
    product.value = found;
  } else {
    showToast('商品不存在');
    router.back();
  }
};

const loadCartCount = () =&gt; {
  const cart = JSON.parse(localStorage.getItem('mall_cart') || '[]');
  cartCount.value = cart.reduce((total, item) =&gt; total + item.quantity, 0);
};

const checkLogin = () =&gt; {
  const token = localStorage.getItem('mall_token');
  if (!token) {
    showToast('请先登录');
    router.push('/login');
    return false;
  }
  return true;
};

const onBack = () =&gt; {
  router.back();
};

const onCartClick = () =&gt; {
  router.push('/cart');
};

const onAddToCart = () =&gt; {
  if (!checkLogin()) return;
  actionType.value = 'add_to_cart';
  quantity.value = 1;
  showQuantityPopup.value = true;
};

const onBuyNow = () =&gt; {
  if (!checkLogin()) return;
  actionType.value = 'buy_now';
  quantity.value = 1;
  showQuantityPopup.value = true;
};

const onConfirmQuantity = () =&gt; {
  if (actionType.value === 'add_to_cart') {
    addToCart();
  } else if (actionType.value === 'buy_now') {
    buyNow();
  }
  showQuantityPopup.value = false;
};

const addToCart = () =&gt; {
  const cart = JSON.parse(localStorage.getItem('mall_cart') || '[]');
  const existingIndex = cart.findIndex(item =&gt; item.product_id === product.value.product_id);
  
  if (existingIndex &gt;= 0) {
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

const buyNow = () =&gt; {
  router.push(`/checkout?productId=${product.value.product_id}&amp;quantity=${quantity.value}`);
};

onMounted(() =&gt; {
  loadProduct();
  loadCartCount();
});
&lt;/script&gt;

&lt;style lang="scss" scoped&gt;
@import './index.scss';
&lt;/style&gt;
