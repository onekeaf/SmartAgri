const request = require('../../utils/request');

Page({
  data: {
    userInfo: {
      username: '',
      email: '',
      avatar_url: '',
      department: '',
      position: ''
    },
    userId: null
  },

  onLoad: function (options) {
    // 获取用户信息
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('editUserInfo', (data) => {
      this.setData({
        userInfo: data.userInfo,
        userId: data.userInfo.user_id
      });
    });
  },

  // 输入事件处理
  onUsernameInput(e) {
    this.setData({
      'userInfo.username': e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      'userInfo.email': e.detail.value
    });
  },

  onAvatarInput(e) {
    this.setData({
      'userInfo.avatar_url': e.detail.value
    });
  },

  onDepartmentInput(e) {
    this.setData({
      'userInfo.department': e.detail.value
    });
  },

  onPositionInput(e) {
    this.setData({
      'userInfo.position': e.detail.value
    });
  },

  // 保存个人信息
  saveUserInfo() {
    const { userInfo, userId } = this.data;
    
    if (!userInfo.username) {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...'
    });
    
    request({
      url: `/users/${userId}`,
      method: 'PUT',
      data: {
        username: userInfo.username,
        email: userInfo.email,
        avatar_url: userInfo.avatar_url,
        department: userInfo.department,
        position: userInfo.position
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      });
    });
  },

  // 取消编辑
  cancelEdit() {
    wx.navigateBack();
  }
}); 