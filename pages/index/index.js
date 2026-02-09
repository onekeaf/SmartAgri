// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const request = require('../../utils/request');
const wsService = require('../../utils/websocket');

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    soilHumidity: 0,
    airHumidity: 0,
    airTemperature: 0,
    lightIntensity: 0,
    co2Level: 0,
    wsConnected: false,
    lastUpdateTime: '暂无更新',
    isRefreshing: false,
    // SSAA相关数据
    ssaaEnabled: false,
    ssaaRunning: false,
    ssaaLastUpdate: '',
    // 消息提醒相关数据
    alerts: [], // 所有提醒消息
    latestAlert: null, // 最新提醒消息
    // 环境参数阈值设置
    thresholds: {
      soilHumidity: { min: 20, max: 60 },  // 土壤湿度阈值 (%)
      airTemperature: { min: 15, max: 35 }, // 空气温度阈值 (°C)
      airHumidity: { min: 30, max: 60 },    // 空气湿度阈值 (%)
      co2Level: { min: 300, max: 800 },     // 二氧化碳浓度阈值 (ppm)
      lightIntensity: { min: 200, max: 2000 } // 光照强度阈值 (lux)
    }
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad() {
    // 初始化最后更新时间为当前时间
    this.setData({
      lastUpdateTime: this.getFormattedTime()
    });
    this.setupWebSocket();
    
    // 加载历史提醒消息
    this.loadAlertHistory();
    
    // 设置定时器，定期检查环境参数
    this.startEnvironmentMonitoring();
    
    // 获取SSAA状态
    this.getSsaaStatus();
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }

    // 如果WebSocket未连接，尝试连接
    if (!wsService.isConnected()) {
      this.setupWebSocket();
    }
  },
  onHide() {
    // 页面隐藏时不断开WebSocket连接，保持后台数据更新
  },
  onUnload() {
    // 页面销毁时关闭WebSocket连接
    wsService.closeWebSocket();
    
    // 清除定时器
    if (this.environmentCheckTimer) {
      clearInterval(this.environmentCheckTimer);
    }
  },
  // 设置WebSocket连接和回调
  setupWebSocket() {
    // 设置WebSocket回调
    wsService.setCallback('onOpen', () => {
      this.setData({ wsConnected: true });
      wx.showToast({
        title: '实时数据已连接',
        icon: 'success',
        duration: 2000
      });
    });
    
    wsService.setCallback('onClose', () => {
      this.setData({ wsConnected: false });
      wx.showToast({
        title: '实时数据已断开',
        icon: 'none',
        duration: 2000
      });
    });
    
    wsService.setCallback('onError', (error) => {
      this.setData({ wsConnected: false });
      wx.showToast({
        title: '连接错误',
        icon: 'error',
        duration: 2000
      });
    });
    
    wsService.setCallback('onReconnect', (reconnectCount) => {
      wx.showToast({
        title: '正在重新连接...',
        icon: 'loading',
        duration: 2000
      });
    });
    
    // 设置不同传感器数据的回调
    wsService.setCallback('onAirSensorData', (data) => {
      if (data && typeof data === 'object') {
        // 检查数据中是否包含所需字段
        let updateData = {};
        if (data.humidity !== undefined) {
          updateData.airHumidity = data.humidity;
        }
        if (data.temperature !== undefined) {
          updateData.airTemperature = data.temperature;
        }
        if (data.gas !== undefined) {
          updateData.co2Level = data.gas;
        }
        
        // 只有当有更新数据时才调用setData
        if (Object.keys(updateData).length > 0) {
          updateData.lastUpdateTime = this.getFormattedTime();
          this.setData(updateData, () => {
            // 数据更新后检查环境参数
            this.checkEnvironmentParameters();
          });
        }
      }
    });
    
    wsService.setCallback('onSoilSensorData', (data) => {
      if (data && typeof data === 'object' && data.humidity !== undefined) {
        this.setData({
          soilHumidity: data.humidity,
          lastUpdateTime: this.getFormattedTime()
        }, () => {
          // 数据更新后检查环境参数
          this.checkEnvironmentParameters();
        });
      }
    });
    
    wsService.setCallback('onLightSensorData', (data) => {
      if (data && data.intensity !== undefined) {
        this.setData({
          lightIntensity: data.intensity,
          lastUpdateTime: this.getFormattedTime()
        }, () => {
          // 数据更新后检查环境参数
          this.checkEnvironmentParameters();
        });
      }
    });
    
    // 连接WebSocket
    wsService.connectWebSocket('all');
  },
  
  // 更新最后更新时间的函数
  updateLastUpdateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // 格式化时间
    const formattedTime = `${year}年${this.padZero(month)}月${this.padZero(day)}日 ${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    
    this.setData({
      lastUpdateTime: formattedTime
    });
  },
  // 补零函数
  padZero(num) {
    return num < 10 ? '0' + num : num;
  },
  getFormattedTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // 格式化时间
    const formattedTime = `${year}年${this.padZero(month)}月${this.padZero(day)}日 ${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    
    return formattedTime;
  },
  
  // 手动刷新数据
  refreshData() {
    // 如果已经在刷新中，则不重复执行
    if (this.data.isRefreshing) {
      return;
    }
    
    // 显示加载动画
    this.setData({
      isRefreshing: true
    });
    
    wx.showLoading({
      title: '正在更新数据...',
      mask: true
    });
    
    // 如果WebSocket连接断开，尝试重新连接
    if (!wsService.isConnected()) {
      this.setupWebSocket();
    }
    
    // 延迟关闭加载提示，给予足够时间完成数据获取
    setTimeout(() => {
      // 主动检查所有环境参数，触发智能提醒
      this.checkEnvironmentParameters();
      
      wx.hideLoading();
      
      // 关闭刷新动画
      this.setData({
        isRefreshing: false,
        lastUpdateTime: this.getFormattedTime()
      });
      
      wx.showToast({
        title: '数据已更新',
        icon: 'success',
        duration: 2000
      });
    }, 1500);
  },
  
  // 查看土壤湿度详情
  viewSoilDetails() {
    wx.navigateTo({
      url: '/pages/data-details/data-details?type=soil'
    });
  },
  
  // 查看空气温湿度详情
  viewAirDetails() {
    wx.navigateTo({
      url: '/pages/data-details/data-details?type=air'
    });
  },
  
  // 查看光照强度详情
  viewLightDetails() {
    wx.navigateTo({
      url: '/pages/data-details/data-details?type=light'
    });
  },

  // 加载历史提醒消息
  loadAlertHistory() {
    // 这里可以从本地存储或服务器加载历史消息
    // 本示例使用本地存储
    const alerts = wx.getStorageSync('alerts') || [];
    
    this.setData({
      alerts,
      latestAlert: alerts.length > 0 ? alerts[0] : null
    });
  },
  
  // 开始环境监测定时任务
  startEnvironmentMonitoring() {
    // 清除可能存在的旧定时器
    if (this.environmentCheckTimer) {
      clearInterval(this.environmentCheckTimer);
    }
    
    // 设置定时器，每分钟检查一次环境参数
    this.environmentCheckTimer = setInterval(() => {
      this.checkEnvironmentParameters();
    }, 60000); // 60秒检查一次
    
    // 立即执行一次检查
    this.checkEnvironmentParameters();
  },
  
  // 检查环境参数是否超出阈值
  checkEnvironmentParameters() {
    const { 
      soilHumidity, 
      airTemperature, 
      airHumidity, 
      co2Level, 
      lightIntensity,
      thresholds
    } = this.data;
    
    let alertTriggered = false;
    
    // 检查土壤湿度
    if (soilHumidity < thresholds.soilHumidity.min) {
      this.addAlert('soil', '土壤湿度过低', 
        `当前土壤湿度 ${soilHumidity}%，低于推荐值 ${thresholds.soilHumidity.min}%，建议采取措施增加土壤湿度。`, '💧');
      alertTriggered = true;
    } else if (soilHumidity > thresholds.soilHumidity.max) {
      this.addAlert('soil', '土壤湿度过高',
        `当前土壤湿度 ${soilHumidity}%，高于推荐值 ${thresholds.soilHumidity.max}%，建议采取措施降低土壤湿度。`, '💧');
      alertTriggered = true;
    }
    
    // 检查空气温度
    if (airTemperature < thresholds.airTemperature.min) {
      this.addAlert('temperature', '空气温度过低',
        `当前温度 ${airTemperature}°C，低于推荐值 ${thresholds.airTemperature.min}°C，建议采取措施调高温度。`, '🌡️');
      alertTriggered = true;
    } else if (airTemperature > thresholds.airTemperature.max) {
      this.addAlert('temperature', '空气温度过高',
        `当前温度 ${airTemperature}°C，高于推荐值 ${thresholds.airTemperature.max}°C，建议采取措施降低温度。`, '🌡️');
      alertTriggered = true;
    }
    
    // 检查空气湿度
    if (airHumidity < thresholds.airHumidity.min) {
      this.addAlert('humidity', '空气湿度过低',
        `当前空气湿度 ${airHumidity}%，低于推荐值 ${thresholds.airHumidity.min}%，建议采取措施增加空气湿度。`, '💨');
      alertTriggered = true;
    } else if (airHumidity > thresholds.airHumidity.max) {
      this.addAlert('humidity', '空气湿度过高',
        `当前空气湿度 ${airHumidity}%，高于推荐值 ${thresholds.airHumidity.max}%，建议采取措施降低空气湿度。`, '💨');
      alertTriggered = true;
    }
    
    // 检查二氧化碳浓度
    if (co2Level < thresholds.co2Level.min) {
      this.addAlert('co2', '二氧化碳浓度过低',
        `当前CO₂浓度 ${co2Level}ppm，低于推荐值 ${thresholds.co2Level.min}ppm，植物光合作用可能受限。`, '🌿');
      alertTriggered = true;
    } else if (co2Level > thresholds.co2Level.max) {
      this.addAlert('co2', '二氧化碳浓度过高',
        `当前CO₂浓度 ${co2Level}ppm，高于推荐值 ${thresholds.co2Level.max}ppm，建议采取措施降低浓度。`, '🌿');
      alertTriggered = true;
    }
    
    // 检查光照强度
    if (lightIntensity < thresholds.lightIntensity.min) {
      this.addAlert('light', '光照强度不足',
        `当前光照强度 ${lightIntensity} lux，低于推荐值 ${thresholds.lightIntensity.min} lux，建议采取措施增加光照强度。`, '☀️');
      alertTriggered = true;
    } else if (lightIntensity > thresholds.lightIntensity.max) {
      this.addAlert('light', '光照强度过高',
        `当前光照强度 ${lightIntensity} lux，高于推荐值 ${thresholds.lightIntensity.max} lux，建议适当遮阳。`, '☀️');
      alertTriggered = true;
    }
  },
  
  // 添加新提醒
  addAlert(type, title, message, icon) {
    const now = new Date();
    const time = this.getFormattedTime();
    
    // 创建新提醒对象
    const newAlert = {
      id: now.getTime(), // 使用时间戳作为ID
      type,
      title,
      message,
      icon,
      time
    };
    
    // 检查是否已经有相同类型的提醒
    // 如果有，仅在值变化较大时才添加新提醒
    const { alerts } = this.data;
    const existingAlertIndex = alerts.findIndex(alert => alert.type === type);
    
    if (existingAlertIndex !== -1) {
      // 存在相同类型的提醒，判断是否需要更新
      const existingAlert = alerts[existingAlertIndex];
      const timeDiff = now.getTime() - existingAlert.id;
      
      // 如果相同类型的提醒发生在5分钟内，则不添加新提醒
      if (timeDiff < 5 * 60 * 1000) {
        return;
      }
      
      // 移除旧的相同类型提醒
      alerts.splice(existingAlertIndex, 1);
    }
    
    // 添加新提醒到列表开头
    const updatedAlerts = [newAlert, ...alerts];
    
    // 限制提醒列表最多保存20条
    if (updatedAlerts.length > 20) {
      updatedAlerts.pop();
    }
    
    // 更新提醒列表
    this.setData({
      alerts: updatedAlerts,
      latestAlert: newAlert
    });
    
    // 保存到本地存储
    wx.setStorageSync('alerts', updatedAlerts);
  },
  
  // 查看所有提醒
  viewAllAlerts() {
    // 跳转到提醒历史页面
    wx.navigateTo({
      url: '/pages/alerts/alerts'
    });
  },
  
  // 一键解决提醒问题
  quickSolveAlert(e) {
    const alert = e.currentTarget.dataset.alert;
    if (!alert) {
      return;
    }
    
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
      success: () => {},
      fail: (err) => {
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取SSAA状态
  getSsaaStatus() {
    wx.showLoading({ 
      title: '加载中...',
      mask: true
    });
    
    request({
      url: '/ssaa/status',
      method: 'GET'
    })
      .then(res => {
        if (res.code === 200 && res.data) {
          // 格式化最后更新时间
          let lastUpdate = '';
          if (res.data.last_update) {
            const updateDate = new Date(res.data.last_update);
            lastUpdate = this.formatDate(updateDate);
          }
          
          this.setData({
            ssaaEnabled: res.data.enabled || false,
            ssaaRunning: res.data.running || false,
            ssaaLastUpdate: lastUpdate
          });
        }
      })
      .catch(err => {
        console.error('获取SSAA状态失败：', err);
        wx.showToast({
          title: '获取SSAA状态失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },
  
  // 切换SSAA开关
  toggleSsaa(e) {
    const enabled = e.detail.value;
    
    wx.showLoading({ 
      title: enabled ? '正在启用SSAA...' : '正在禁用SSAA...',
      mask: true
    });
    
    request({
      url: '/ssaa/control',
      method: 'POST',
      data: { enabled }
    })
      .then(res => {
        if (res.code === 200) {
          // 操作成功
          this.setData({ 
            ssaaEnabled: enabled,
            ssaaLastUpdate: this.formatDate(new Date())
          });
          
          wx.showToast({
            title: enabled ? 'SSAA已启用' : 'SSAA已禁用',
            icon: 'success'
          });
        } else {
          // 操作失败
          this.setData({ ssaaEnabled: !enabled }); // 恢复开关状态
          wx.showToast({
            title: '操作失败: ' + (res.message || '未知错误'),
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('控制SSAA失败：', err);
        this.setData({ ssaaEnabled: !enabled }); // 恢复开关状态
        wx.showToast({
          title: '控制SSAA失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },
  
  // 查看SSAA详情
  viewSsaaDetails() {
    wx.navigateTo({
      url: '/pages/ssaa/ssaa'
    });
  },
  
  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },
})
