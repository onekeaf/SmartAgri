<template>
  <div class="address-page">
    <van-nav-bar title="收货地址" left-arrow @click-left="onClickLeft" />
    
    <div class="address-content">
      <div v-if="addressList.length === 0" class="empty-address">
        <van-empty description="暂无收货地址" />
      </div>

      <div v-else class="address-list">
        <van-swipe-cell v-for="address in addressList" :key="address.id" class="address-item">
          <div class="address-card" @click="selectAddress(address)">
            <div class="address-header">
              <span class="address-name">{{ address.name }}</span>
              <span class="address-phone">{{ address.phone }}</span>
              <van-tag v-if="address.is_default" type="success" size="small">默认</van-tag>
            </div>
            <div class="address-detail">
              {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
            </div>
            <div class="address-actions">
              <van-button size="small" type="primary" plain @click.stop="editAddress(address)">
                编辑
              </van-button>
            </div>
          </div>
          <template #right>
            <van-button square text="删除" type="danger" class="delete-button" @click="deleteAddress(address)" />
          </template>
        </van-swipe-cell>
      </div>
    </div>

    <div class="address-footer">
      <van-button type="success" block round @click="showAddForm">
        新增地址
      </van-button>
    </div>

    <van-popup v-model:show="showForm" position="bottom" round :style="{ height: '80%' }">
      <div class="form-header">
        <van-button type="primary" plain size="small" @click="closeForm">取消</van-button>
        <span class="form-title">{{ isEdit ? '编辑地址' : '新增地址' }}</span>
        <van-button type="primary" size="small" @click="saveAddress">保存</van-button>
      </div>
      <van-form @submit="saveAddress">
        <van-cell-group inset>
          <van-field
            v-model="formData.name"
            name="name"
            label="收货人"
            placeholder="请输入收货人姓名"
            :rules="[{ required: true, message: '请输入收货人姓名' }]"
          />
          <van-field
            v-model="formData.phone"
            name="phone"
            label="手机号"
            type="tel"
            placeholder="请输入手机号"
            maxlength="11"
            :rules="[{ required: true, message: '请输入手机号' }]"
          />
          <van-field
            v-model="formData.province"
            name="province"
            label="省份"
            placeholder="请输入省份"
            :rules="[{ required: true, message: '请输入省份' }]"
          />
          <van-field
            v-model="formData.city"
            name="city"
            label="城市"
            placeholder="请输入城市"
            :rules="[{ required: true, message: '请输入城市' }]"
          />
          <van-field
            v-model="formData.district"
            name="district"
            label="区县"
            placeholder="请输入区县"
            :rules="[{ required: true, message: '请输入区县' }]"
          />
          <van-field
            v-model="formData.detail"
            name="detail"
            label="详细地址"
            type="textarea"
            placeholder="请输入详细地址"
            rows="2"
            :rules="[{ required: true, message: '请输入详细地址' }]"
          />
          <van-cell center title="设为默认地址">
            <template #right-icon>
              <van-switch v-model="formData.is_default" size="20" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAddresses, saveAddresses } from '@/utils/storage'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const addressList = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const editingAddress = ref(null)

const formData = reactive({
  id: '',
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  is_default: false
})

const loadAddresses = () => {
  addressList.value = getAddresses() || []
}

const showAddForm = () => {
  isEdit.value = false
  editingAddress.value = null
  Object.assign(formData, {
    id: '',
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    is_default: false
  })
  showForm.value = true
}

const editAddress = (address) => {
  isEdit.value = true
  editingAddress.value = address
  Object.assign(formData, {
    ...address
  })
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
}

const saveAddress = () => {
  if (!formData.name) {
    showToast('请输入收货人姓名')
    return
  }
  if (!formData.phone) {
    showToast('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!formData.province) {
    showToast('请输入省份')
    return
  }
  if (!formData.city) {
    showToast('请输入城市')
    return
  }
  if (!formData.district) {
    showToast('请输入区县')
    return
  }
  if (!formData.detail) {
    showToast('请输入详细地址')
    return
  }

  let addresses = getAddresses() || []

  if (formData.is_default) {
    addresses = addresses.map(addr => ({
      ...addr,
      is_default: false
    }))
  }

  if (isEdit.value) {
    const index = addresses.findIndex(addr => addr.id === editingAddress.value.id)
    if (index !== -1) {
      addresses[index] = { ...formData }
    }
  } else {
    const newAddress = {
      ...formData,
      id: 'ADDR' + Date.now()
    }
    addresses.push(newAddress)
  }

  saveAddresses(addresses)
  loadAddresses()
  showForm.value = false
  showToast('保存成功')
}

const deleteAddress = (address) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除该地址吗？'
  }).then(() => {
    let addresses = getAddresses() || []
    
    if (address.is_default && addresses.length > 1) {
      addresses[1].is_default = true
    }
    
    addresses = addresses.filter(addr => addr.id !== address.id)
    saveAddresses(addresses)
    loadAddresses()
    showToast('删除成功')
  }).catch(() => {
  })
}

const selectAddress = (address) => {
  const from = route.query.from
  if (from === 'checkout') {
    router.back()
  }
}

const onClickLeft = () => {
  router.back()
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped lang="scss">
.address-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
}

.address-content {
  padding-top: 46px;
}

.empty-address {
  padding: 60px 20px;
}

.address-list {
  padding: 12px;
}

.address-item {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.address-card {
  padding: 16px;
  background-color: #fff;

  .address-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .address-name {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin-right: 12px;
    }

    .address-phone {
      font-size: 14px;
      color: #666;
      margin-right: 8px;
    }
  }

  .address-detail {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .address-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.delete-button {
  height: 100%;
}

.address-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #eee;
  z-index: 100;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;

  .form-title {
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
