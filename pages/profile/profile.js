const request = require('../../utils/request');

// 使用base64编码的简单默认头像，避免图片资源加载问题
const defaultAvatarBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTEtMDdUMjE6MTU6MTUrMDk6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTExLTA3VDIxOjE4OjMxKzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTExLTA3VDIxOjE4OjMxKzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNhNDkzNGVjLWRk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';

Page({
  data: {
    userInfo: {
      avatar_url: defaultAvatarBase64,
      username: '',
      role: '',
      phone_number: '',
      email: '',
      department: '',
      position: '',
      join_date: '',
      work_status: ''
    },
    userId: null
  },

  onLoad() {
    // 尝试从本地存储中获取用户ID
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userId: userInfo.user_id
      });
    }
    this.getUserInfo();
  },

  onShow() {
    // 每次显示页面时刷新用户信息
    this.getUserInfo();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      });
    }
  },

  // 获取用户信息
  getUserInfo() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    const { userId } = this.data;
    if (!userId) {
      return;
    }

    wx.showLoading({
      title: '加载中...'
    });

    // 获取用户详情
    request({
      url: `/users/${userId}`,
      method: 'GET'
    }).then(res => {
      wx.hideLoading();

      // 确保有头像URL，如果没有则使用默认头像
      if (!res.data.avatar_url) {
        res.data.avatar_url = defaultAvatarBase64;
      }

      this.setData({
        userInfo: res.data
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    });
  },

  // 编辑用户信息
  editUserInfo() {
    const { userInfo, userId } = this.data;

    wx.showLoading({
      title: '提交中...'
    });

    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile',
      success: (res) => {
        res.eventChannel.emit('editUserInfo', { userInfo: userInfo });
      }
    });
  },

  // 修改密码
  changePassword() {
    wx.navigateTo({
      url: '/pages/change-password/change-password'
    });
  },

  // 查看登录记录
  checkLoginRecords() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 更新用户状态
  updateWorkStatus(e) {
    const { status } = e.currentTarget.dataset;
    const { userId } = this.data;

    wx.showLoading({
      title: '更新中...'
    });

    request({
      url: `/users/${userId}`,
      method: 'PUT',
      data: {
        work_status: status
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '状态已更新',
        icon: 'success'
      });

      // 更新本地状态
      this.setData({
        'userInfo.work_status': status
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.clearStorageSync();

          // 跳转到登录页
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});