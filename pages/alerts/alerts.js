// alerts.js
Page({
  data: {
    alerts: [], // 所有提醒历史列表
    filteredAlerts: [], // 筛选后的提醒列表
    activeFilter: 'all', // 当前筛选类型
    selectedAlerts: {}, // 已选中的提醒
    isAllSelected: false, // 是否全选
    selectedCount: 0, // 已选中数量
    hasSelected: false, // 是否有选中项
    isDropdownOpen: false, // 下拉菜单是否展开
    filterNames: {
      all: '所有',
      soil: '土壤',
      temperature: '温度',
      humidity: '湿度',
      co2: 'CO₂',
      light: '光照'
    }
  },

  onLoad: function (options) {
    // 加载提醒历史数据
    this.loadAlerts();
  },

  onShow: function () {
    // 每次页面显示时刷新数据
    this.loadAlerts();
  },

  onPullDownRefresh: function () {
    // 下拉刷新时重新加载数据
    this.loadAlerts();
    wx.stopPullDownRefresh();
  },

  // 加载提醒历史
  loadAlerts: function () {
    // 从本地存储获取提醒历史
    const alerts = wx.getStorageSync('alerts') || [];
    
    this.setData({
      alerts,
      filteredAlerts: this.filterAlerts(alerts, this.data.activeFilter),
      selectedAlerts: {},
      isAllSelected: false,
      selectedCount: 0,
      hasSelected: false,
      isDropdownOpen: false
    });
  },
  
  // 切换下拉菜单开关
  toggleDropdown: function() {
    this.setData({
      isDropdownOpen: !this.data.isDropdownOpen
    });
  },

  // 设置过滤条件
  setFilter: function(e) {
    const filterType = e.currentTarget.dataset.type;
    
    this.setData({
      activeFilter: filterType,
      filteredAlerts: this.filterAlerts(this.data.alerts, filterType),
      selectedAlerts: {},
      isAllSelected: false,
      selectedCount: 0,
      hasSelected: false,
      isDropdownOpen: false // 选择后关闭下拉菜单
    });
  },
  
  // 根据类型过滤提醒
  filterAlerts: function(alerts, filterType) {
    if (filterType === 'all') {
      return alerts;
    }
    
    return alerts.filter(alert => alert.type === filterType);
  },
  
  // 切换选中状态
  toggleSelect: function(e) {
    const alertId = e.currentTarget.dataset.id;
    const selectedAlerts = {...this.data.selectedAlerts};
    
    if (selectedAlerts[alertId]) {
      delete selectedAlerts[alertId];
    } else {
      selectedAlerts[alertId] = true;
    }
    
    const selectedCount = Object.keys(selectedAlerts).length;
    const isAllSelected = selectedCount === this.data.filteredAlerts.length && selectedCount > 0;
    
    this.setData({
      selectedAlerts,
      selectedCount,
      isAllSelected,
      hasSelected: selectedCount > 0
    });
  },
  
  // 切换全选状态
  toggleSelectAll: function() {
    const { isAllSelected, filteredAlerts } = this.data;
    let selectedAlerts = {};
    
    if (!isAllSelected) {
      // 全选
      filteredAlerts.forEach(alert => {
        selectedAlerts[alert.id] = true;
      });
    }
    
    this.setData({
      selectedAlerts,
      isAllSelected: !isAllSelected,
      selectedCount: !isAllSelected ? filteredAlerts.length : 0,
      hasSelected: !isAllSelected && filteredAlerts.length > 0
    });
  },
  
  // 删除单个提醒
  deleteAlert: function(e) {
    const alertId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条提醒记录吗？',
      success: (res) => {
        if (res.confirm) {
          let alerts = this.data.alerts.filter(alert => alert.id !== alertId);
          
          // 更新存储和数据
          wx.setStorageSync('alerts', alerts);
          
          this.setData({
            alerts,
            filteredAlerts: this.filterAlerts(alerts, this.data.activeFilter),
            selectedAlerts: {},
            isAllSelected: false,
            selectedCount: 0,
            hasSelected: false
          });
          
          // 同时更新首页的提醒数据
          this.updateIndexPageAlerts(alerts);
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 删除选中的提醒
  deleteSelected: function() {
    const { selectedAlerts, selectedCount } = this.data;
    
    if (selectedCount === 0) {
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的${selectedCount}条提醒记录吗？`,
      success: (res) => {
        if (res.confirm) {
          let alerts = this.data.alerts.filter(alert => !selectedAlerts[alert.id]);
          
          // 更新存储和数据
          wx.setStorageSync('alerts', alerts);
          
          this.setData({
            alerts,
            filteredAlerts: this.filterAlerts(alerts, this.data.activeFilter),
            selectedAlerts: {},
            isAllSelected: false,
            selectedCount: 0,
            hasSelected: false
          });
          
          // 同时更新首页的提醒数据
          this.updateIndexPageAlerts(alerts);
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空提醒历史
  clearAlerts: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有提醒历史吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空本地存储中的提醒历史
          wx.removeStorageSync('alerts');
          
          // 更新页面数据
          this.setData({
            alerts: [],
            filteredAlerts: [],
            selectedAlerts: {},
            isAllSelected: false,
            selectedCount: 0,
            hasSelected: false
          });
          
          // 同时更新首页的提醒数据
          this.updateIndexPageAlerts([]);
          
          // 显示成功提示
          wx.showToast({
            title: '提醒历史已清空',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },
  
  // 更新首页的提醒数据
  updateIndexPageAlerts: function(alerts) {
    const pages = getCurrentPages();
    const indexPage = pages.find(page => page.route === 'pages/index/index');
    
    if (indexPage) {
      indexPage.setData({
        alerts,
        latestAlert: alerts.length > 0 ? alerts[0] : null
      });
    }
  },

  // 一键解决提醒问题
  quickSolveAlert: function(e) {
    const alert = e.currentTarget.dataset.alert;
    if (!alert) {
      return;
    }
    
    console.log('准备解决提醒问题:', alert);
    
    // 构建消息内容
    const messageContent = `我需要解决以下问题: ${alert.title}\n${alert.message}`;
    
    // 将消息存储到全局数据或本地存储中，以便聊天页面获取
    const aiMessage = {
      type: 'problem',
      content: messageContent,
      alertType: alert.type,
      timestamp: new Date().getTime()
    };
    
    // 存储到本地，以便聊天页面获取
    wx.setStorageSync('pending_ai_message', aiMessage);
    
    // 跳转到AI聊天助手页面（使用switchTab因为assistant是tabBar页面）
    wx.switchTab({
      url: '/pages/assistant/assistant',
      success: () => {
        console.log('成功跳转到AI助手页面');
      },
      fail: (err) => {
        console.error('跳转AI助手页面失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  }
}); 