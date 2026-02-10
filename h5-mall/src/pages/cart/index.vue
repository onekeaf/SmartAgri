<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" left-arrow @click-left="onClickLeft" fixed placeholder />
    
    <div class="cart-content">
      <!-- Empty State -->
      <div v-if="cartList.length === 0" class="empty-cart">
        <div class="empty-icon-box">
          <van-icon name="shopping-cart-o" class="icon" />
        </div>
        <p class="empty-text">购物车还是空的</p>
        <p class="empty-sub">快去挑选心仪的商品吧</p>
        <van-button round color="linear-gradient(to right, #4CAF50, #81C784)" class="go-btn" @click="goToMall">
          去逛逛
        </van-button>
      </div>
      
      <!-- Cart List -->
      <div v-else class="cart-list">
        <van-swipe-cell v-for="item in cartList" :key="item.product_id" class="cart-item-wrapper">
          <div class="cart-item glass">
            <van-checkbox v-model="item.checked" checked-color="#00c853" @change="onItemCheck" class="item-checkbox" />
            
            <div class="item-main">
              <van-image 
                :src="item.image || '/images/banners/banner1.jpg'" 
                class="product-img" 
                fit="cover"
                radius="8px"
              />
              
              <div class="info-col">
                <div class="name ellipsis-2">{{ item.product_name }}</div>
                <div class="spec-tag" v-if="item.specification">{{ item.specification }}</div>
                
                <div class="price-row">
                  <div class="price">
                    <span class="symbol">¥</span>
                    <span class="num">{{ item.price }}</span>
                  </div>
                  
                  <van-stepper 
                    v-model="item.quantity" 
                    :min="1" 
                    :max="item.stock || 99" 
                    button-size="22px"
                    class="custom-stepper"
                    @change="onQuantityChange(item)"
                  />
                </div>
              </div>
            </div>
          </div>
          <template #right>
            <div class="delete-btn-box" @click="deleteItem(item)">
              <div class="delete-btn">删除</div>
            </div>
          </template>
        </van-swipe-cell>
      </div>
    </div>
    
    <!-- Footer Bar -->
    <div v-if="cartList.length > 0" class="cart-footer glass">
      <van-checkbox v-model="selectAll" checked-color="#00c853" @change="onSelectAll">
        全选
      </van-checkbox>
      
      <div class="footer-right">
        <div class="total-info">
          <span class="label">合计:</span>
          <span class="price">¥{{ totalPrice }}</span>
        </div>
        <van-button 
          round 
          color="linear-gradient(to right, #4CAF50, #2E7D32)" 
          class="checkout-btn"
          @click="goToCheckout"
        >
          结算({{ checkedCount }})
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCart, saveCart } from '@/utils/storage'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const cartList = ref([])

const selectAll = computed({
  get: () => {
    return cartList.value.length > 0 && cartList.value.every(item => item.checked)
  },
  set: (value) => {
    cartList.value.forEach(item => {
      item.checked = value
    })
    saveCart(cartList.value)
  }
})

const checkedCount = computed(() => {
  return cartList.value.filter(item => item.checked).length
})

const totalPrice = computed(() => {
  return cartList.value
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)
})

const loadCart = () => {
  cartList.value = getCart() || []
}

const onItemCheck = () => {
  saveCart(cartList.value)
}

const onQuantityChange = (item) => {
  saveCart(cartList.value)
}

const onSelectAll = () => {
  saveCart(cartList.value)
}

const deleteItem = (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除该商品吗？'
  }).then(() => {
    cartList.value = cartList.value.filter(i => i.product_id !== item.product_id)
    saveCart(cartList.value)
    showToast('删除成功')
  }).catch(() => {
  })
}

const goToCheckout = () => {
  if (checkedCount.value === 0) {
    showToast('请选择要结算的商品')
    return
  }
  router.push('/checkout')
}

const goToMall = () => {
  router.push('/')
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 120px;
}

.cart-content {
  padding: 12px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  
  .empty-icon-box {
    width: 100px;
    height: 100px;
    background: #e8f5e9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    
    .icon {
      font-size: 50px;
      color: #4CAF50;
    }
  }
  
  .empty-text {
    font-size: 16px;
    color: #333;
    font-weight: bold;
    margin: 0 0 8px;
  }
  
  .empty-sub {
    font-size: 14px;
    color: #999;
    margin: 0 0 24px;
  }
  
  .go-btn {
    width: 160px;
    height: 40px;
  }
}

.cart-item-wrapper {
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  
  .item-checkbox {
    margin-right: 12px;
  }
  
  .item-main {
    flex: 1;
    display: flex;
    
    .product-img {
      width: 88px;
      height: 88px;
      flex-shrink: 0;
      background: #f5f5f5;
    }
    
    .info-col {
      flex: 1;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .name {
        font-size: 14px;
        color: #333;
        line-height: 1.4;
        font-weight: 500;
      }
      
      .spec-tag {
        align-self: flex-start;
        font-size: 10px;
        color: #666;
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;
      }
      
      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 8px;
        
        .price {
          color: #ff3d00;
          font-weight: bold;
          
          .symbol {
            font-size: 12px;
          }
          .num {
            font-size: 16px;
          }
        }
      }
    }
  }
}

.delete-btn-box {
  height: 100%;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff4444;
  color: white;
  
  .delete-btn {
    font-size: 14px;
  }
}

.cart-footer {
  position: fixed;
  bottom: 50px; /* Above Tabbar */
  left: 12px;
  right: 12px;
  border-radius: 50px;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 99;
  
  .footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .total-info {
      .label {
        font-size: 12px;
        color: #666;
        margin-right: 4px;
      }
      .price {
        font-size: 18px;
        color: #ff3d00;
        font-weight: bold;
      }
    }
    
    .checkout-btn {
      height: 36px;
      padding: 0 20px;
      font-size: 14px;
    }
  }
}
</style>
