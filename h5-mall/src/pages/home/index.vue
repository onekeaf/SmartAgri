&lt;template&gt;
  &lt;div class="home-page"&gt;
    &lt;van-pull-refresh v-model="refreshing" @refresh="onRefresh"&gt;
      &lt;div class="sticky-header"&gt;
        &lt;van-search
          v-model="searchKeyword"
          placeholder="搜索商品"
          shape="round"
          @search="onSearch"
        /&gt;
        
        &lt;van-tabs v-model:active="activeCategory" @click-tab="onCategoryChange"&gt;
          &lt;van-tab title="全部" name="all" /&gt;
          &lt;van-tab title="蔬菜" name="蔬菜" /&gt;
          &lt;van-tab title="水果" name="水果" /&gt;
          &lt;van-tab title="粮食" name="粮食" /&gt;
          &lt;van-tab title="其他" name="其他" /&gt;
        &lt;/van-tabs&gt;
        
        &lt;div class="sort-buttons"&gt;
          &lt;div
            v-for="item in sortOptions"
            :key="item.value"
            :class="['sort-button', { active: currentSort === item.value }]"
            @click="onSortChange(item.value)"
          &gt;
            {{ item.label }}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
      
      &lt;van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        class="product-list"
      &gt;
        &lt;div class="product-grid"&gt;
          &lt;ProductCard
            v-for="product in filteredProducts"
            :key="product.product_id"
            :product="product"
            @click="onProductClick"
          /&gt;
        &lt;/div&gt;
        
        &lt;van-empty v-if="filteredProducts.length === 0 &amp;&amp; !loading" description="暂无商品" /&gt;
      &lt;/van-list&gt;
    &lt;/van-pull-refresh&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
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

const filteredProducts = computed(() =&gt; {
  let products = [...allProducts.value];
  
  if (activeCategory.value !== 'all') {
    products = products.filter(p =&gt; p.category === activeCategory.value);
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    products = products.filter(p =&gt; 
      p.product_name.toLowerCase().includes(keyword)
    );
  }
  
  switch (currentSort.value) {
    case 'price_asc':
      products.sort((a, b) =&gt; a.price - b.price);
      break;
    case 'price_desc':
      products.sort((a, b) =&gt; b.price - a.price);
      break;
    case 'sales':
      products.sort((a, b) =&gt; b.sales - a.sales);
      break;
    default:
      products.sort((a, b) =&gt; b.product_id - a.product_id);
  }
  
  return products;
});

const loadProducts = () =&gt; {
  const products = getProducts();
  allProducts.value = products.filter(p =&gt; p.status === 'on_sale');
};

const onRefresh = () =&gt; {
  finished.value = false;
  loadProducts();
  refreshing.value = false;
};

const onLoad = () =&gt; {
  if (refreshing.value) {
    return;
  }
  
  loading.value = false;
  finished.value = true;
};

const onSearch = () =&gt; {
  loadProducts();
};

const onCategoryChange = () =&gt; {
  loadProducts();
};

const onSortChange = (sortType) =&gt; {
  currentSort.value = sortType;
};

const onProductClick = (product) =&gt; {
  router.push(`/product/${product.product_id}`);
};

onMounted(() =&gt; {
  loadProducts();
});
&lt;/script&gt;

&lt;style lang="scss" scoped&gt;
@import './index.scss';
&lt;/style&gt;
