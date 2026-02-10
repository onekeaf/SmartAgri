<template>
  <div class="product-card glass" @click="handleClick">
    <div class="product-image-container">
      <van-image
        :src="product.images?.[0] || '/images/products/default.jpg'"
        fit="cover"
        class="product-image"
      >
        <template #error>
          <div class="image-placeholder">
            {{ product.product_name?.charAt(0) || '农' }}
          </div>
        </template>
      </van-image>
      
      <!-- Tag Overlay -->
      <div class="product-tag" v-if="product.origin">
        {{ product.origin }}
      </div>
    </div>
    
    <div class="product-info">
      <div class="product-name ellipsis-2">{{ product.product_name }}</div>
      
      <div class="product-bottom">
        <div class="price-box">
          <span class="currency">¥</span>
          <span class="amount">{{ product.price.toFixed(2) }}</span>
          <span class="unit">/{{ product.unit || '件' }}</span>
        </div>
        
        <button class="add-btn" @click.stop="onAddToCart">
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showToast } from 'vant';
import { addToCart } from '@/utils/storage';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click', props.product);
};

const onAddToCart = () => {
  addToCart(props.product);
  showToast({
    message: '已加入购物车',
    icon: 'cart-o',
    position: 'bottom',
  });
};
</script>

<style lang="scss" scoped>
.product-card {
  border-radius: 16px; /* Larger border radius */
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: rgba(255, 255, 255, 0.8); /* Slightly more opaque for readability */
  border: 1px solid rgba(255, 255, 255, 0.6);
  
  &:active {
    transform: scale(0.98);
  }
}

.product-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Square aspect ratio */
  background: #f0f0f0;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  color: #fff;
  font-size: 32px;
  font-weight: bold;
}

.product-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 100px;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
  margin-bottom: 8px;
  height: 40px; /* Fixed height for 2 lines */
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-box {
  color: var(--price-color);
  line-height: 1;
  
  .currency {
    font-size: 12px;
    margin-right: 1px;
  }
  
  .amount {
    font-size: 18px;
    font-weight: bold;
  }
  
  .unit {
    font-size: 10px;
    color: #999;
    margin-left: 2px;
  }
}

.add-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 300;
  box-shadow: 0 2px 6px rgba(0, 200, 83, 0.3);
  
  &:active {
    transform: scale(0.9);
  }
}
</style>
