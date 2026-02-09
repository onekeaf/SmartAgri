&lt;template&gt;
  &lt;div class="login-page"&gt;
    &lt;div class="login-header"&gt;
      &lt;van-icon name="flower-o" size="64" color="#4CAF50" /&gt;
      &lt;h1 class="app-title"&gt;智慧农业商城&lt;/h1&gt;
      &lt;p class="app-subtitle"&gt;绿色健康  品质生活&lt;/p&gt;
    &lt;/div&gt;

    &lt;div class="login-form"&gt;
      &lt;van-field
        v-model="phone"
        type="tel"
        label="手机号"
        placeholder="请输入手机号"
        maxlength="11"
        :rules="[{ required: true, message: '请输入手机号' }]"
      /&gt;
      
      &lt;van-field
        v-model="code"
        type="digit"
        label="验证码"
        placeholder="请输入验证码"
        maxlength="4"
        :rules="[{ required: true, message: '请输入验证码' }]"
      &gt;
        &lt;template #button&gt;
          &lt;van-button 
            size="small" 
            type="success" 
            :disabled="countdown > 0"
            @click="sendCode"
          &gt;
            {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
          &lt;/van-button&gt;
        &lt;/template&gt;
      &lt;/van-field&gt;

      &lt;van-button 
        type="success" 
        block 
        round 
        size="large"
        :loading="loading"
        loading-text="登录中..."
        class="login-button"
        @click="handleLogin"
      &gt;
        登录
      &lt;/van-button&gt;
    &lt;/div&gt;

    &lt;div class="login-tips"&gt;
      &lt;p&gt;测试账号：任意手机号&lt;/p&gt;
      &lt;p&gt;测试验证码：1234&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { saveUser, getUser } from '@/utils/storage'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const phone = ref('')
const code = ref('')
const loading = ref(false)
const countdown = ref(0)
let countdownTimer = null

const sendCode = () => {
  if (!phone.value) {
    showToast('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }

  showToast('验证码已发送：1234')
  countdown.value = 60
  
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

const handleLogin = () => {
  if (!phone.value) {
    showToast('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }

  if (!code.value) {
    showToast('请输入验证码')
    return
  }

  if (code.value !== '1234') {
    showToast('验证码错误')
    return
  }

  loading.value = true

  setTimeout(() => {
    const user = {
      userId: 'USER' + Date.now(),
      phone: phone.value,
      nickname: '用户' + phone.value.slice(-4),
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
    }

    saveUser(user)
    loading.value = false
    showToast('登录成功')

    const redirect = route.query.redirect || '/profile'
    router.replace(redirect)
  }, 1000)
}

onMounted(() => {
  const user = getUser()
  if (user) {
    router.replace('/profile')
  }
})
&lt;/script&gt;

&lt;style scoped lang="scss"&gt;
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 60px;

  .app-title {
    font-size: 28px;
    color: #333;
    margin: 20px 0 8px;
    font-weight: bold;
  }

  .app-subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.login-form {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 16px;
  padding: 30px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .van-field {
    margin-bottom: 16px;
  }

  .login-button {
    margin-top: 20px;
  }
}

.login-tips {
  margin-top: 30px;
  text-align: center;
  color: #999;
  font-size: 12px;

  p {
    margin: 4px 0;
  }
}
&lt;/style&gt;
