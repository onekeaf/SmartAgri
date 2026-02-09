&lt;template&gt;
  &lt;div class="product-card" @click="handleClick"&gt;
    &lt;div class="product-image-container"&gt;
      &lt;van-image
        :src="product.images?.[0] || '/images/products/default.jpg'"
        fit="cover"
        class="product-image"
      &gt;
        &lt;template #error&gt;
          &lt;div class="image-placeholder"&gt;
            {{ product.product_name?.charAt(0) || '商' }}
          &lt;/div&gt;
        &lt;/template&gt;
      &lt;/van-image&gt;
    &lt;/div&gt;
    
    &lt;div class="product-info"&gt;
      &lt;div class="product-name"&gt;{{ product.product_name }}&lt;/div&gt;
      
      &lt;div class="price-row"&gt;
        &lt;span class="current-price"&gt;¥{{ product.price.toFixed(2) }}&lt;/span&gt;
        &lt;span v-if="product.original_price" class="original-price"&gt;
          ¥{{ product.original_price.toFixed(2) }}
        &lt;/span&gt;
      &lt;/div&gt;
      
      &lt;div class="product-meta"&gt;
        &lt;span class="sales"&gt;已售{{ product.sales }}件&lt;/span&gt;
        &lt;span v-if="product.origin" class="origin"&gt;{{ product.origin }}&lt;/span&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () =&gt; {
  emit('click', props.product);
};
&lt;/script&gt;

&lt;style lang="scss" scoped&gt;
.product-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.product-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f5f5;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 48px;
  font-weight: bold;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
  min-height: 40px;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.current-price {
  font-size: 18px;
  color: #f44336;
  font-weight: bold;
  margin-right: 8px;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.sales {
  flex: 1;
}

.origin {
  background: #f0f9eb;
  color: #67c23a;
  padding: 2px 6px;
  border-radius: 2px;
}
&lt;/style&gt;
