<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" left-arrow @click-left="onClickLeft" />
    
    <div class="cart-content">
      <div v-if="cartList.length === 0" class="empty-cart">
        <van-empty description="购物车空空如也">
          <van-button round type="success" class="bottom-button" @click="goToMall">
            去逛逛
          </van-button>
        </van-empty>
      </div>
      
      <div v-else class="cart-list">
        <van-swipe-cell v-for="item in cartList" :key="item.product_id" class="cart-item">
          <van-checkbox-group v-model="item.checked" @change="onItemCheck">
            <div class="item-content">
              <van-checkbox :name="item.checked" shape="square" />
              <img :src="item.image" :alt="item.product_name" class="product-image" />
              <div class="product-info">
                <div class="product-name">{{ item.product_name }}</div>
                <div class="product-spec">{{ item.specification }}</div>
                <div class="product-bottom">
                  <span class="price">¥{{ item.price }}</span>
                  <van-stepper 
                    v-model="item.quantity" 
                    :min="1" 
                    :max="item.stock" 
                    @change="onQuantityChange(item)"
                  />
                </div>
              </div>
            </div>
          </van-checkbox-group>
          <template #right>
            <van-button square text="删除" type="danger" class="delete-button" @click="deleteItem(item)" />
          </template>
        </van-swipe-cell>
      </div>
    </div>
    
    <div v-if="cartList.length > 0" class="cart-footer">
      <van-checkbox v-model="selectAll" shape="square" @change="onSelectAll">
        全选
      </van-checkbox>
      <div class="footer-right">
        <div class="total-price">
          合计：<span class="price">¥{{ totalPrice }}</span>
        </div>
        <van-button type="success" round @click="goToCheckout">
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
  background-color: #f5f5f5;
  padding-bottom: 100px;
}

.cart-content {
  padding-top: 46px;
}

.empty-cart {
  padding: 60px 20px;

  .bottom-button {
    margin-top: 20px;
  }
}

.cart-list {
  padding: 10px;
}

.cart-item {
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;

  .item-content {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: #fff;
  }

  .product-image {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    margin: 0 10px;
    object-fit: cover;
  }

  .product-info {
    flex: 1;
    min-width: 0;

    .product-name {
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-spec {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
    }

    .product-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price {
        font-size: 16px;
        color: #ff4444;
        font-weight: bold;
      }
    }
  }

  .delete-button {
    height: 100%;
  }
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #fff;
  border-top: 1px solid #eee;
  z-index: 100;

  .footer-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .total-price {
      font-size: 14px;
      color: #333;

      .price {
        font-size: 18px;
        color: #ff4444;
        font-weight: bold;
      }
    }
  }
}
</style>
