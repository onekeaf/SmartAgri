// device.js
const request = require('../../utils/request');
const wsService = require('../../utils/websocket');

Page({
  data: {
    soilHumidity: 0,
    airHumidity: 0,
    airTemperature: 0,
    lightIntensity: 0,
    co2Level: 0,
    fanStatus: 0,
    fanLevel: 1,
    fanAutoMode: 0,
    irrigationStatus: 0,
    irrigationLevel: 1,
    irrigationAutoMode: 0,
    redLight: 0,
    yellowLight: 0,
    greenLight: 0,
    wsConnected: false,
    lastUpdateTime: '暂无更新',
    isRefreshing: false
  },
  onLoad() {
    // 初始化最后更新时间为当前时间
    this.setData({
      lastUpdateTime: this.getFormattedTime()
    });
    this.setupWebSocket();
    this.getDeviceStatus();
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1  // 设备管理在tabBar中的索引
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
  },
  
  // 设置WebSocket连接和回调
  setupWebSocket() {
    // 设置WebSocket回调
    wsService.setCallback('onOpen', () => {
      console.log('WebSocket连接已建立');
      this.setData({ wsConnected: true });
    });
    
    wsService.setCallback('onClose', () => {
      console.log('WebSocket连接已关闭');
      this.setData({ wsConnected: false });
    });
    
    wsService.setCallback('onError', (error) => {
      console.error('WebSocket连接错误:', error);
      this.setData({ wsConnected: false });
    });
    
    wsService.setCallback('onReconnect', (reconnectCount) => {
      console.log(`WebSocket正在进行第${reconnectCount}次重连`);
    });
    
    // 设置不同传感器数据的回调
    wsService.setCallback('onAirSensorData', (data) => {
      console.log('收到空气传感器数据:', data);
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
          console.log('更新空气传感器数据到界面:', updateData);
          updateData.lastUpdateTime = this.getFormattedTime();
          this.setData(updateData);
        }
      }
    });
    
    wsService.setCallback('onSoilSensorData', (data) => {
      console.log('收到土壤传感器数据:', data);
      if (data && typeof data === 'object' && data.humidity !== undefined) {
        console.log('更新土壤湿度数据到界面:', data.humidity);
        this.setData({
          soilHumidity: data.humidity,
          lastUpdateTime: this.getFormattedTime()
        });
      }
    });
    
    wsService.setCallback('onLightSensorData', (data) => {
      console.log('收到光照传感器数据:', data);
      if (data && data.intensity !== undefined) {
        console.log('光照强度:', data.intensity);
        this.setData({
          lightIntensity: data.intensity,
          lastUpdateTime: this.getFormattedTime()
        });
      }
    });
    
    // 添加三色灯状态数据处理
    wsService.setCallback('onTrafficLightData', (data) => {
      console.log('收到三色灯状态数据:', data);
      if (data && typeof data === 'object') {
        // 可能同时存在两种格式的数据，需要处理所有可能的字段
        let updateData = {
          lastUpdateTime: this.getFormattedTime()
        };
        
        // 处理新接口的字段 (l0, l1, l2)
        if (data.l0 !== undefined) {
          updateData.redLight = data.l0;
        }
        if (data.l1 !== undefined) {
          updateData.greenLight = data.l1;
        }
        if (data.l2 !== undefined) {
          updateData.yellowLight = data.l2;
        }
        
        // 同时兼容旧接口的字段 (red, green, yellow)
        if (data.red !== undefined) {
          updateData.redLight = data.red;
        }
        if (data.green !== undefined) {
          updateData.greenLight = data.green;
        }
        if (data.yellow !== undefined) {
          updateData.yellowLight = data.yellow;
        }
        
        // 处理光照强度数据
        if (data.intensity !== undefined) {
          updateData.lightIntensity = data.intensity;
        }
        
        console.log('更新三色灯状态 - 红灯:', updateData.redLight, 
          '绿灯:', updateData.greenLight, 
          '黄灯:', updateData.yellowLight,
          '光照强度:', updateData.lightIntensity);
        
        this.setData(updateData);
      }
    });
    
    // 添加消息通用回调，用于调试
    wsService.setCallback('onMessage', (data) => {
      console.log('收到WebSocket消息:', data);
    });
    
    // 连接WebSocket
    wsService.connectWebSocket('all');
  },
  
  // 获取设备状态
  getDeviceStatus() {
    // 获取风扇状态
    request({
      url: '/devices/fan',
      method: 'GET'
    }).then(res => {
      if (res.code >= 200 && res.code < 300) {
        console.log('获取风扇设备信息成功:', res.data);
      }
    }).catch(err => {
      console.error('获取风扇设备信息失败:', err);
    });

    // 获取灌溉设备状态
    request({
      url: '/devices/irrigation',
      method: 'GET'
    }).then(res => {
      if (res.code >= 200 && res.code < 300) {
        console.log('获取灌溉设备信息成功:', res.data);
      }
    }).catch(err => {
      console.error('获取灌溉设备信息失败:', err);
    });
    
    // 获取三色灯状态
    this.getTrafficLightStatus();

    // 获取最新控制状态
    this.getDeviceControlStatus('fan');
    this.getDeviceControlStatus('irrigation');
  },
  
  // 获取三色灯控制状态
  getTrafficLightStatus() {
    // 使用API文档中的正确接口获取三色灯状态
    request({
      url: '/devices/light/status',
      method: 'GET'
    }).then(res => {
      if (res.code >= 200 && res.code < 300 && res.data) {
        // 根据API文档，直接使用l0(红灯)、l1(绿灯)、l2(黄灯)字段
        const data = res.data;
        
        this.setData({
          redLight: data.l0 || 0,
          greenLight: data.l1 || 0,
          yellowLight: data.l2 || 0,
          lightIntensity: data.intensity || 0
        });
        
        console.log('获取三色灯状态成功:', 
          '红灯:', data.l0, 
          '绿灯:', data.l1, 
          '黄灯:', data.l2, 
          '光照强度:', data.intensity);
      } else {
        // 如果新接口失败，尝试旧接口
        console.log('新接口获取三色灯状态失败，尝试旧接口');
        this.getFallbackTrafficLightStatus();
      }
    }).catch(err => {
      console.error('获取三色灯状态失败:', err);
      // 尝试使用旧接口作为备选
      this.getFallbackTrafficLightStatus();
    });
  },
  
  // 获取三色灯状态的备选方法（使用旧接口）
  getFallbackTrafficLightStatus() {
    request({
      url: '/devices/traffic-light/status/history',
      method: 'GET',
      data: {
        limit: 1
      }
    }).then(res => {
      if (res.code >= 200 && res.code < 300 && res.data.history && res.data.history.length > 0) {
        const latestStatus = res.data.history[0];
        
        this.setData({
          redLight: latestStatus.red || 0,
          yellowLight: latestStatus.yellow || 0,
          greenLight: latestStatus.green || 0
        });
        
        console.log('使用旧接口获取三色灯状态成功:',
          '红灯:', latestStatus.red,
          '绿灯:', latestStatus.green,
          '黄灯:', latestStatus.yellow);
      }
    }).catch(err => {
      console.error('使用旧接口获取三色灯状态也失败:', err);
    });
  },
  
  // 获取设备控制状态
  getDeviceControlStatus(deviceType) {
    request({
      url: `/devices/${deviceType}/status/history`,
      method: 'GET',
      data: {
        limit: 1  // 只获取最新的一条记录
      }
    }).then(res => {
      if (res.code >= 200 && res.code < 300 && res.data.history && res.data.history.length > 0) {
        const latestStatus = res.data.history[0];
        
        if (deviceType === 'fan') {
          this.setData({
            fanStatus: latestStatus.power_status,
            fanLevel: latestStatus.level || 1,
            fanAutoMode: latestStatus.auto_mode || 0
          });
        } else if (deviceType === 'irrigation') {
          this.setData({
            irrigationStatus: latestStatus.power_status,
            irrigationLevel: latestStatus.level || 1,
            irrigationAutoMode: latestStatus.auto_mode || 0
          });
        }
      }
    }).catch(err => {
      console.error(`获取${deviceType}控制状态失败:`, err);
    });
  },
  
  // 风扇控制
  toggleFan(e) {
    const status = e.detail.value ? 1 : 0;
    this.updateDeviceStatus('fanStatus', status);
  },
  
  changeFanLevel(e) {
    this.updateDeviceStatus('fanLevel', e.detail.value);
  },
  
  toggleFanAutoMode(e) {
    const autoMode = e.detail.value ? 1 : 0;
    this.updateDeviceStatus('fanAutoMode', autoMode);
  },
  
  // 灌溉设备控制
  toggleIrrigation(e) {
    const status = e.detail.value ? 1 : 0;
    this.updateDeviceStatus('irrigationStatus', status);
  },
  
  changeIrrigationLevel(e) {
    this.updateDeviceStatus('irrigationLevel', e.detail.value);
  },
  
  toggleIrrigationAutoMode(e) {
    const autoMode = e.detail.value ? 1 : 0;
    this.updateDeviceStatus('irrigationAutoMode', autoMode);
  },
  
  // 三色灯控制
  toggleRedLight(e) {
    const status = e.detail.value ? 1 : 0;
    
    // 更新界面状态
    this.setData({
      redLight: status
    });
    
    // 发送控制请求
    this.sendTrafficLightControl();
  },
  
  toggleYellowLight(e) {
    const status = e.detail.value ? 1 : 0;
    
    // 更新界面状态
    this.setData({
      yellowLight: status
    });
    
    // 发送控制请求
    this.sendTrafficLightControl();
  },
  
  toggleGreenLight(e) {
    const status = e.detail.value ? 1 : 0;
    
    // 更新界面状态
    this.setData({
      greenLight: status
    });
    
    // 发送控制请求
    this.sendTrafficLightControl();
  },
  
  // 发送三色灯控制请求
  sendTrafficLightControl() {
    // 判断是否所有灯都关闭了
    const allLightsOff = this.data.redLight === 0 && this.data.yellowLight === 0 && this.data.greenLight === 0;
    
    // 注意：控制接口使用与查询接口不同的格式
    const controlData = {
      // 控制接口可能仍使用旧格式的字段名
      power_status: allLightsOff ? 0 : 1,
      red: this.data.redLight,
      yellow: this.data.yellowLight,
      green: this.data.greenLight
    };
    
    request({
      url: '/devices/traffic-light/control',
      method: 'POST',
      data: controlData
    }).then(res => {
      if (res.code >= 200 && res.code < 300) {
        wx.showToast({
          title: '操作成功',
          icon: 'success'
        });
        
        // 操作成功后立即重新获取状态，确保显示正确
        setTimeout(() => {
          this.getTrafficLightStatus();
        }, 500);
      } else {
        // 操作失败，回滚状态
        wx.showToast({
          title: res.message || '操作失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('控制三色灯失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    });
  },
  
  // 查看设备历史记录
  viewDeviceHistory(e) {
    const { device } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/device-history/device-history?deviceType=${device}`
    });
  },
  
  // 更新设备状态
  updateDeviceStatus(field, value) {
    const data = {};
    data[field] = value;
    
    // 判断是哪个设备
    let deviceType = '';
    let controlData = {};
    
    if (field === 'fanStatus') {
      deviceType = 'fan';
      controlData.power_status = value;
      controlData.auto_mode = this.data.fanAutoMode;
      if (value === 1) controlData.level = this.data.fanLevel;
    } else if (field === 'fanLevel') {
      deviceType = 'fan';
      controlData.power_status = this.data.fanStatus;
      controlData.level = value;
      controlData.auto_mode = this.data.fanAutoMode;
    } else if (field === 'fanAutoMode') {
      deviceType = 'fan';
      controlData.power_status = this.data.fanStatus;
      controlData.level = this.data.fanLevel;
      controlData.auto_mode = value;
    } else if (field === 'irrigationStatus') {
      deviceType = 'irrigation';
      controlData.power_status = value;
      controlData.auto_mode = this.data.irrigationAutoMode;
      if (value === 1) controlData.level = this.data.irrigationLevel;
    } else if (field === 'irrigationLevel') {
      deviceType = 'irrigation';
      controlData.power_status = this.data.irrigationStatus;
      controlData.level = value;
      controlData.auto_mode = this.data.irrigationAutoMode;
    } else if (field === 'irrigationAutoMode') {
      deviceType = 'irrigation';
      controlData.power_status = this.data.irrigationStatus;
      controlData.level = this.data.irrigationLevel;
      controlData.auto_mode = value;
    }
    
    // 只更新界面
    this.setData(data);
    
    // 发送控制请求
    let url = '';
    
    if (deviceType === 'light' || deviceType === 'traffic-light') {
      // 三色灯使用特定的控制接口
      url = '/devices/traffic-light/control';
    } else {
      // 风扇和灌溉设备使用通用接口
      url = `/devices/${deviceType}/control`;
    }
    
    request({
      url: url,
      method: 'POST',
      data: controlData
    }).then(res => {
      if (res.code >= 200 && res.code < 300) {
        wx.showToast({
          title: '操作成功',
          icon: 'success'
        });
        
        // 如果是三色灯，操作成功后立即重新获取状态
        if (deviceType === 'light' || deviceType === 'traffic-light') {
          setTimeout(() => {
            this.getTrafficLightStatus();
          }, 500);
        }
      } else {
        // 操作失败，回滚状态
        this.setData({
          [field]: field === 'fanStatus' || field === 'irrigationStatus' 
            ? (value === 1 ? 0 : 1) 
            : (field === 'fanAutoMode' || field === 'irrigationAutoMode' 
              ? (value === 1 ? 0 : 1) 
              : (field === 'fanLevel' || field === 'irrigationLevel' ? 1 : 0))
        });
        wx.showToast({
          title: res.message || '操作失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error(`控制${deviceType}失败:`, err);
      // 操作失败，回滚状态
      this.setData({
        [field]: field === 'fanStatus' || field === 'irrigationStatus' 
          ? (value === 1 ? 0 : 1) 
          : (field === 'fanAutoMode' || field === 'irrigationAutoMode' 
            ? (value === 1 ? 0 : 1) 
            : (field === 'fanLevel' || field === 'irrigationLevel' ? 1 : 0))
      });
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    });
  },
  
  // 更新最后更新时间的函数
  updateLastUpdateTime() {
    this.setData({
      lastUpdateTime: this.getFormattedTime()
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
    
    // 获取设备状态
    this.getDeviceStatus();
    
    // 如果WebSocket连接断开，尝试重新连接
    if (!wsService.isConnected()) {
      console.log('WebSocket已断开，正在重新连接...');
      this.setupWebSocket();
    } else {
      console.log('WebSocket连接正常，继续使用现有连接接收实时数据');
    }
    
    // 延迟关闭加载提示，给予足够时间完成数据获取
    setTimeout(() => {
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
  }
}) 