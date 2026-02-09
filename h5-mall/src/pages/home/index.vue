<template>
  <div class="home-page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="sticky-header">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索商品"
          shape="round"
          @search="onSearch"
        />
        
        <van-tabs v-model:active="activeCategory" @click-tab="onCategoryChange">
          <van-tab title="全部" name="all" />
          <van-tab title="蔬菜" name="蔬菜" />
          <van-tab title="水果" name="水果" />
          <van-tab title="粮食" name="粮食" />
          <van-tab title="其他" name="其他" />
        </van-tabs>
        
        <div class="sort-buttons">
          <div
            v-for="item in sortOptions"
            :key="item.value"
            :class="['sort-button', { active: currentSort === item.value }]"
            @click="onSortChange(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        class="product-list"
      >
        <div class="product-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.product_id"
            :product="product"
            @click="onProductClick"
          />
        </div>
        
        <van-empty v-if="filteredProducts.length === 0 && !loading" description="暂无商品" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProducts } from '@/utils/storage';
import ProductCard from '@/components/ProductCard.vue';

const router = useRouter();

const searchKeyword = ref('');
const activeCategory = ref('all');
const currentSort = ref('default');
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const allProducts = ref([]);

const sortOptions = [
  { label: '综合', value: 'default' },
  { label: '价格↑', value: 'price_asc' },
  { label: '价格↓', value: 'price_desc' },
  { label: '销量', value: 'sales' }
];

const filteredProducts = computed(() => {
  let products = [...allProducts.value];
  
  if (activeCategory.value !== 'all') {
    products = products.filter(p => p.category === activeCategory.value);
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    products = products.filter(p => 
      p.product_name.toLowerCase().includes(keyword)
    );
  }
  
  switch (currentSort.value) {
    case 'price_asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'sales':
      products.sort((a, b) => b.sales - a.sales);
      break;
    default:
      products.sort((a, b) => b.product_id - a.product_id);
  }
  
  return products;
});

const loadProducts = () => {
  const products = getProducts();
  allProducts.value = products.filter(p => p.status === 'on_sale');
};

const onRefresh = () => {
  finished.value = false;
  loadProducts();
  refreshing.value = false;
};

const onLoad = () => {
  if (refreshing.value) {
    return;
  }
  
  loading.value = false;
  finished.value = true;
};

const onSearch = () => {
  loadProducts();
};

const onCategoryChange = () => {
  loadProducts();
};

const onSortChange = (sortType) => {
  currentSort.value = sortType;
};

const onProductClick = (product) => {
  router.push(`/product/${product.product_id}`);
};

onMounted(() => {
  loadProducts();
});
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
