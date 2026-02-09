// device-history.js
const request = require('../../utils/request');

Page({
  data: {
    deviceType: '',  // 设备类型: fan, irrigation, light, traffic-light
    deviceName: '',  // 设备名称
    historyList: [], // 历史记录列表
    page: 1,         // 当前页码
    limit: 20,       // 每页数量
    hasMore: true,   // 是否有更多数据
    loading: false,  // 是否正在加载
    deviceTypeMap: {
      'fan': '风扇',
      'irrigation': '灌溉设备',
      'light': '光照设备',
      'temperature': '温度传感器',
      'humidity': '湿度传感器',
      'traffic-light': '三色灯控制器'
    }
  },

  onLoad(options) {
    // 获取设备类型参数
    const { deviceType } = options;
    if (!deviceType) {
      wx.showToast({
        title: '设备类型参数缺失',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    this.setData({
      deviceType,
      deviceName: this.data.deviceTypeMap[deviceType] || deviceType
    });
    
    // 获取设备历史数据
    this.fetchHistoryData();
  },

  // 获取设备历史记录
  fetchHistoryData() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    const { deviceType, page, limit } = this.data;
    
    // 处理不同类型设备的API接口
    let apiUrl = `/devices/${deviceType}/status/history`;
    
    request({
      url: apiUrl,
      method: 'GET',
      data: {
        page,
        limit
      }
    }).then(res => {
      if (res.code >= 200 && res.code < 300) {
        const history = res.data.history || [];
        const total = res.data.total || 0;
        
        // 为每条记录添加显示详情标志，并处理字段不同的问题
        const processedHistory = history.map(item => {
          // 处理light类型设备的字段映射
          if (deviceType === 'light') {
            // 确保既有新接口格式(l0,l1,l2)也有旧接口格式(red,green,yellow)的字段
            return {
              ...item,
              showDetail: false,
              // 确保基本字段存在
              red: item.red !== undefined ? item.red : item.l0,
              green: item.green !== undefined ? item.green : item.l1,
              yellow: item.yellow !== undefined ? item.yellow : item.l2,
              l0: item.l0 !== undefined ? item.l0 : item.red,
              l1: item.l1 !== undefined ? item.l1 : item.green,
              l2: item.l2 !== undefined ? item.l2 : item.yellow
            };
          }
          
          return {
            ...item,
            showDetail: false
          };
        });
        
        // 将新数据添加到列表末尾
        const historyList = page === 1 
          ? processedHistory 
          : [...this.data.historyList, ...processedHistory];
        
        this.setData({
          historyList,
          hasMore: historyList.length < total,
          page: page + 1,
          loading: false
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: res.message || '获取历史记录失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('获取设备历史记录失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '获取历史记录失败',
        icon: 'none'
      });
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      historyList: []
    }, () => {
      this.fetchHistoryData();
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchHistoryData();
    }
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 切换详情显示
  toggleDetail(e) {
    const { index } = e.currentTarget.dataset;
    const historyList = this.data.historyList;
    
    // 切换显示状态
    historyList[index].showDetail = !historyList[index].showDetail;
    
    this.setData({
      historyList
    });
  },
  
  // 获取操作类型
  getOperationType(item) {
    // 根据设备类型判断
    if (this.data.deviceType === 'traffic-light' || this.data.deviceType === 'light') {
      // 三色灯的操作类型判断
      if (item.power_status === 0) {
        return '关闭所有灯';
      }
      
      // 检查各种灯的状态变化
      const changes = [];
      
      // 如果是traffic-light设备，使用之前的字段名
      if (this.data.deviceType === 'traffic-light') {
        if (item.red === 1) {
          changes.push('开启红灯');
        } else if (item.red === 0 && item.prevStatus && item.prevStatus.red === 1) {
          changes.push('关闭红灯');
        }
        
        if (item.yellow === 1) {
          changes.push('开启黄灯');
        } else if (item.yellow === 0 && item.prevStatus && item.prevStatus.yellow === 1) {
          changes.push('关闭黄灯');
        }
        
        if (item.green === 1) {
          changes.push('开启绿灯');
        } else if (item.green === 0 && item.prevStatus && item.prevStatus.green === 1) {
          changes.push('关闭绿灯');
        }
      } 
      // 如果是light设备，使用新的字段名l0, l1, l2
      else if (this.data.deviceType === 'light') {
        if (item.l0 === 1) {
          changes.push('开启红灯');
        } else if (item.l0 === 0 && item.prevStatus && item.prevStatus.l0 === 1) {
          changes.push('关闭红灯');
        }
        
        if (item.l2 === 1) {
          changes.push('开启黄灯');
        } else if (item.l2 === 0 && item.prevStatus && item.prevStatus.l2 === 1) {
          changes.push('关闭黄灯');
        }
        
        if (item.l1 === 1) {
          changes.push('开启绿灯');
        } else if (item.l1 === 0 && item.prevStatus && item.prevStatus.l1 === 1) {
          changes.push('关闭绿灯');
        }
      }
      
      if (changes.length > 0) {
        return changes.join('，');
      }
      
      return '状态更新';
    } else {
      // 其他设备的操作类型判断
      if (item.power_status === 1 && (!item.prevStatus || item.prevStatus.power_status === 0)) {
        return '开启设备';
      } else if (item.power_status === 0 && (!item.prevStatus || item.prevStatus.power_status === 1)) {
        return '关闭设备';
      } else if (item.level && (!item.prevStatus || item.level !== item.prevStatus.level)) {
        return '调整档位';
      } else if (item.auto_mode === 1 && (!item.prevStatus || item.prevStatus.auto_mode === 0)) {
        return '开启自动模式';
      } else if (item.auto_mode === 0 && (!item.prevStatus || item.prevStatus.auto_mode === 1)) {
        return '关闭自动模式';
      }
      return '状态更新';
    }
  },

  // 格式化操作时间
  formatTime(time) {
    if (!time) return '';
    // 简单格式化，如需更复杂处理可使用日期库
    return time.replace('T', ' ').substring(0, 19);
  },
  
  // 格式化设备状态
  formatStatus(status) {
    if (status === 1) return '开启';
    return '关闭';
  },
  
  // 格式化自动模式
  formatAutoMode(mode) {
    if (mode === 1) return '已开启';
    return '已关闭';
  }
}); 