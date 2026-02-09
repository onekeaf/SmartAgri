// device-selector.js
Page({
  data: {
    deviceList: [
      {
        id: 'fan',
        name: '风扇',
        icon: '🌀'
      },
      {
        id: 'irrigation',
        name: '灌溉设备',
        icon: '💦'
      },
      {
        id: 'traffic-light',
        name: '三色灯',
        icon: '🚦'
      }
    ]
  },

  onLoad(options) {
    // 页面加载时的逻辑
  },

  // 选择设备查看历史记录
  selectDevice(e) {
    const { device } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/device-history/device-history?deviceType=${device}`
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
}); 