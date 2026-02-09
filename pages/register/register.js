const request = require('../../utils/request');

Page({
  data: {
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: '农业系统工作员',
    email: '',
    department: '',
    position: ''
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

  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },

  onDepartmentInput(e) {
    this.setData({
      department: e.detail.value
    });
  },

  onPositionInput(e) {
    this.setData({
      position: e.detail.value
    });
  },

  handleRegister() {
    const { 
      phoneNumber, 
      password, 
      confirmPassword, 
      username, 
      role, 
      email, 
      department, 
      position 
    } = this.data;
    
    console.log('准备注册用户:', username, phoneNumber);
    
    if (!phoneNumber || !password || !confirmPassword || !username) {
      wx.showToast({
        title: '请填写必要信息',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '注册中...'
    });
    
    const registerData = {
      username: username,
      phone_number: phoneNumber,
      password: password,
      role: role,
      email: email || undefined,
      department: department || undefined,
      position: position || undefined,
      join_date: new Date().toISOString().split('T')[0]
    };
    
    console.log('发送注册请求:', registerData);
    
    // 调用注册API
    request({
      url: '/auth/users',
      method: 'POST',
      data: registerData
    }).then(res => {
      console.log('注册成功:', res);
      wx.hideLoading();
      wx.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            // 注册成功后跳转到登录页
            wx.navigateBack();
          }, 2000);
        }
      });
    }).catch(err => {
      console.error('注册失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: err.message || '注册失败，请重试',
        icon: 'none'
      });
    });
  },

  goToLogin() {
    wx.navigateBack();
  }
}); 