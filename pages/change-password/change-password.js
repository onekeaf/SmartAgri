const request = require('../../utils/request');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  onOldPasswordInput(e) {
    this.setData({
      oldPassword: e.detail.value
    });
  },

  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    });
  },

  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  handleChangePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次输入的新密码不一致',
        icon: 'none'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      wx.showToast({
        title: '密码长度不能少于6位',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '修改中...'
    });
    
    // 获取用户ID
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.user_id) {
      wx.hideLoading();
      wx.showToast({
        title: '用户信息不存在，请重新登录',
        icon: 'none'
      });
      return;
    }
    
    // 调用修改密码API
    request({
      url: `/users/${userInfo.user_id}`,
      method: 'PUT',
      data: {
        old_password: oldPassword,
        password: newPassword
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '密码修改成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            // 清除登录信息，返回登录页
            wx.clearStorageSync();
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }, 2000);
        }
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: err.message || '密码修改失败',
        icon: 'none'
      });
    });
  },

  goBack() {
    wx.navigateBack();
  }
}); 