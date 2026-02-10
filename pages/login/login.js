const request = require('../../utils/request');

Page({
  data: {
    phoneNumber: '',
    password: '',
    rememberPassword: false,
    isLoading: false
  },

  onLoad() {
    // 尝试从本地存储获取账号密码
    try {
      const savedPhone = wx.getStorageSync('savedPhoneNumber');
      const savedPassword = wx.getStorageSync('savedPassword');
      const rememberPassword = wx.getStorageSync('rememberPassword');
      
      if (savedPhone && savedPassword && rememberPassword) {
        this.setData({
          phoneNumber: savedPhone,
          password: savedPassword,
          rememberPassword: true
        });
      }
    } catch (e) {
      console.error('读取本地存储失败:', e);
    }
  },

  onPhoneInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  toggleRememberPassword(e) {
    this.setData({
      rememberPassword: e.detail.value
    });
  },

  handleLogin() {
    const { phoneNumber, password, rememberPassword } = this.data;
    if (!phoneNumber || !password) {
      wx.showToast({
        title: '请输入手机号和密码',
        icon: 'none'
      });
      return;
    }
    
    // 设置登录中状态
    this.setData({ isLoading: true });
    
    wx.showLoading({
      title: '登录中...'
    });
    
    console.log('开始登录请求，手机号:', phoneNumber);
    
    const requestData = { 
      phone_number: phoneNumber, 
      password: password 
    };
    
    console.log('发送登录请求数据:', JSON.stringify(requestData));
    
    // 调用登录API
    request({
      url: '/auth/login',
      method: 'POST',
      data: requestData
    }).then(res => {
      console.log('登录成功，完整响应:', JSON.stringify(res));
      wx.hideLoading();
      this.setData({ isLoading: false });
      
      if (!res.data || !res.data.token) {
        console.error('登录响应缺少token:', res);
        wx.showToast({
          title: '登录成功但数据异常',
          icon: 'none'
        });
        return;
      }
      
      // 如果勾选了记住密码，保存账号密码
      if (rememberPassword) {
        wx.setStorageSync('savedPhoneNumber', phoneNumber);
        wx.setStorageSync('savedPassword', password);
        wx.setStorageSync('rememberPassword', true);
      } else {
        // 如果未勾选，则清除之前保存的账号密码
        wx.removeStorageSync('savedPhoneNumber');
        wx.removeStorageSync('savedPassword');
        wx.removeStorageSync('rememberPassword');
      }
      
      // 保存token和用户信息
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.user);
      console.log('用户信息已保存到本地');
      
      // 显示登录成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 2秒后跳转到订阅套餐页
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/subscription/package/package',
              success: () => console.log('打开订阅页成功'),
              fail: (err) => console.error('打开订阅页失败:', err)
            });
          }, 2000);
        }
      });
    }).catch(err => {
      console.error('登录失败, 错误详情:', JSON.stringify(err));
      wx.hideLoading();
      this.setData({ isLoading: false });
      wx.showToast({
        title: (err && err.message) ? err.message : '登录失败，请重试',
        icon: 'none'
      });
    });
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },
  
  forgotPassword() {
    wx.showToast({
      title: '请联系管理员重置密码',
      icon: 'none',
      duration: 2000
    });
  }
}); 