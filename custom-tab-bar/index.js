Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页"
      },
      {
        pagePath: "/pages/device/device",
        text: "设备管理"
      },
      {
        pagePath: "/pages/assistant/assistant",
        text: "AI助手"
      },
      {
        pagePath: "/pages/mall/index/index",
        text: "商城"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({
        url
      });
      this.setData({
        selected: data.index
      });
    }
  }
}); 