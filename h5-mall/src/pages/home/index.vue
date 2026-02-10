<template>
  <div class="home-page">
    <!-- Fixed Header (Outside PullRefresh) -->
    <div class="fixed-header">
      <div class="search-bar-container">
        <div class="brand-logo">🌾</div>
        <van-search
          v-model="searchKeyword"
          placeholder="搜索源头好物..."
          shape="round"
          background="#fff"
          @search="onSearch"
          class="custom-search"
        />
      </div>
      
      <!-- Categories as Tabs -->
      <van-tabs 
        v-model:active="activeCategory" 
        @click-tab="onCategoryChange"
        background="#fff"
        color="#00c853"
        title-active-color="#00c853"
        line-width="20px"
        :border="false"
      >
        <van-tab title="全部" name="all" />
        <van-tab title="新鲜蔬菜" name="蔬菜" />
        <van-tab title="时令水果" name="水果" />
        <van-tab title="优质粮油" name="粮食" />
        <van-tab title="其他" name="其他" />
      </van-tabs>
    </div>

    <!-- Scrollable Content -->
    <van-pull-refresh 
      v-model="refreshing" 
      @refresh="onRefresh"
      class="content-scroll"
    >
      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Hero Banner Swiper -->
        <div class="banner-container">
          <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
            <van-swipe-item v-for="(image, index) in banners" :key="index">
              <div class="banner-item">
                <img :src="image" class="banner-img" style="width:100%; height:100%; object-fit:cover;" />
                <div class="banner-text glass" v-if="index === 0">
                  <h3>智慧农业 · 源头直供</h3>
                  <p>全程溯源 / 绿色无公害</p>
                </div>
              </div>
            </van-swipe-item>
          </van-swipe>
        </div>

        <!-- Quick Actions (KingKong Area) -->
        <div class="quick-actions glass">
          <div class="action-item" v-for="item in quickActions" :key="item.text">
            <div class="icon-box" :style="{ background: item.color }">{{ item.icon }}</div>
            <span>{{ item.text }}</span>
          </div>
        </div>

        <!-- Seckill Section (New Feature) -->
        <div class="seckill-section glass">
          <div class="section-header" @click="onMoreClick('限时秒杀')">
            <div class="title-box">
              <span class="title">限时秒杀</span>
              <van-count-down :time="time" class="countdown" />
            </div>
            <span class="more">更多 ></span>
          </div>
          <div class="seckill-list">
            <div class="seckill-item" v-for="i in 4" :key="i" @click="onMoreClick('商品详情')">
              <div class="img-box">
                <img :src="banners[0]" alt="秒杀" />
                <span class="discount-tag">-50%</span>
              </div>
              <div class="price">¥9.9</div>
              <div class="original-price">¥19.9</div>
            </div>
          </div>
        </div>

        <!-- New Arrivals (Horizontal Scroll) -->
        <div class="new-arrivals glass">
          <div class="section-header" @click="onMoreClick('新品尝鲜')">
            <span class="title">新品尝鲜</span>
            <span class="more">更多 ></span>
          </div>
          <div class="horizontal-scroll">
            <div class="new-item" v-for="i in 5" :key="i" @click="onMoreClick('商品详情')">
              <div class="new-img">
                 <img :src="banners[1]" alt="新品" />
              </div>
              <div class="new-name">有机草莓</div>
              <div class="new-price">¥29.9</div>
            </div>
          </div>
        </div>

        <!-- Filter/Sort Bar -->
        <div class="filter-bar">
          <div class="sort-title">当季热卖</div>
          <div class="sort-options">
            <span 
              v-for="item in sortOptions"
              :key="item.value"
              :class="['sort-tag', { active: currentSort === item.value }]"
              @click="onSortChange(item.value)"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
      
        <!-- Product List -->
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
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProducts } from '@/utils/storage';
import ProductCard from '@/components/ProductCard.vue';
import { showToast } from 'vant'; // Import Toast

const router = useRouter();

const searchKeyword = ref('');
const activeCategory = ref('all');
const currentSort = ref('default');
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const allProducts = ref([]);
const time = ref(30 * 60 * 60 * 1000); // 30 hours countdown

// Use local images as requested
const banners = [
  '/images/banners/banner1.jpg',
  '/images/banners/banner2.jpg',
  '/images/banners/banner3.jpg'
];

const quickActions = [
  { text: '领券中心', icon: '🎫', color: '#FF9800' },
  { text: '我的订单', icon: '📦', color: '#2196F3' },
  { text: '会员服务', icon: '👑', color: '#9C27B0' },
  { text: '联系客服', icon: '🎧', color: '#4CAF50' },
];

const onMoreClick = (section) => {
  showToast(`${section}功能开发中`);
};


const sortOptions = [
  { label: '综合推荐', value: 'default' },
  { label: '价格', value: 'price_asc' },
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
  }
  
  return products;
});

const loadData = () => {
  try {
    // Simulate loading delay
    setTimeout(() => {
      const products = getProducts();
      // Safety check: ensure products is an array
      if (Array.isArray(products)) {
        // Map products to use local banner images as placeholders if needed
        const safeProducts = products.map(p => ({
          ...p,
          // If image is missing or web url, fallback to banner1
          images: p.images && p.images.length > 0 ? p.images : ['/images/banners/banner1.jpg']
        }));
        
        if (refreshing.value) {
          allProducts.value = safeProducts;
          refreshing.value = false;
        } else {
          allProducts.value = safeProducts;
        }
      } else {
        allProducts.value = [];
      }
      
      loading.value = false;
      finished.value = true;
    }, 500);
  } catch (e) {
    console.error('Error loading products:', e);
    loading.value = false;
    finished.value = true;
  }
};

const onLoad = () => {
  loadData();
};

const onRefresh = () => {
  finished.value = false;
  loading.value = true;
  onLoad();
};

const onSearch = () => {
  // Filter is automatic via computed
};

const onCategoryChange = () => {
  // Filter is automatic via computed
};

const onSortChange = (value) => {
  if (value === 'price_asc' && currentSort.value === 'price_asc') {
    currentSort.value = 'price_desc';
  } else {
    currentSort.value = value;
  }
};

const onProductClick = (product) => {
  router.push(`/product/${product.product_id}`);
};

onMounted(() => {
  // Initial load happens via onLoad automatically triggered by van-list
});
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 60px;
  background: #f7f8fa;
  min-height: 100vh;
}

/* Fixed Header Styles */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding-top: 10px;
}

/* Scroll Content */
.content-scroll {
  padding-top: 108px; /* Height of header (Search + Tabs) */
}

.search-bar-container {
  display: flex;
  align-items: center;
  padding: 0 16px;
  
  .brand-logo {
    font-size: 24px;
    margin-right: 8px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  
  .custom-search {
    flex: 1;
    padding: 0;
    
    :deep(.van-search__content) {
      background-color: #f7f8fa;
    }
  }
}

.content-area {
  padding: 16px;
  /* Add padding to bottom to prevent tabbar overlap */
  padding-bottom: 80px; 
}

/* Banner */
.banner-container {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  margin-bottom: 20px;
  height: 180px; /* Fix height to prevent CLS flicker */
  background-color: #f0f0f0;
}

.my-swipe .van-swipe-item {
  height: 180px;
}

.banner-item {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  position: relative;
  
  .banner-text {
    position: absolute;
    bottom: 20px;
    left: 20px;
    padding: 10px 16px;
    border-radius: 12px;
    color: #1d1d1f;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    p {
      margin: 4px 0 0;
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  background: #fff; /* Force solid background on mobile */
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    
    span {
      font-size: 12px;
      color: #333;
      font-weight: 500;
    }
  }
}

/* Seckill Section */
.seckill-section {
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  margin-bottom: 20px;
  min-height: 160px; /* Prevent layout shift */

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .title-box {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .title {
        font-size: 16px;
        font-weight: bold;
        color: #1d1d1f;
      }
      
      .countdown {
        font-weight: bold;
        color: #ff3d00;
      }
    }
    
    .more {
      font-size: 12px;
      color: #999;
    }
  }

  .seckill-list {
    display: flex;
    justify-content: space-between;
  }

  .seckill-item {
    width: 23%;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .img-box {
      position: relative;
      width: 100%;
      padding-top: 100%;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 6px;
      background: #f5f5f5;
      
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .discount-tag {
        position: absolute;
        top: 0;
        right: 0;
        background: #ff3d00;
        color: white;
        font-size: 10px;
        padding: 1px 4px;
        border-bottom-left-radius: 6px;
      }
    }
    
    .price {
      color: #ff3d00;
      font-weight: bold;
      font-size: 14px;
    }
    
    .original-price {
      color: #999;
      text-decoration: line-through;
      font-size: 10px;
    }
  }
}

/* New Arrivals */
.new-arrivals {
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  margin-bottom: 20px;
  min-height: 180px; /* Prevent layout shift */
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #1d1d1f;
    }
    
    .more {
      font-size: 12px;
      color: #999;
    }
  }
  
  .horizontal-scroll {
    display: flex;
    overflow-x: auto;
    gap: 12px;
    padding-bottom: 8px; /* Hide scrollbar visual */
    
    /* Hide scrollbar */
    &::-webkit-scrollbar {
      display: none;
    }
    
    .new-item {
      flex-shrink: 0;
      width: 100px;
      
      .new-img {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 6px;
        background: #f5f5f5;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .new-name {
        font-size: 13px;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .new-price {
        font-size: 14px;
        color: #00c853;
        font-weight: bold;
      }
    }
  }
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
  
  .sort-title {
    font-size: 18px;
    font-weight: bold;
    color: #1d1d1f;
  }
  
  .sort-options {
    display: flex;
    gap: 12px;
  }
  
  .sort-tag {
    font-size: 13px;
    color: #86868b;
    padding: 4px 10px;
    border-radius: 100px;
    transition: all 0.3s;
    
    &.active {
      background: #1d1d1f;
      color: white;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
</style>
