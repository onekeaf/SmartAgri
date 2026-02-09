// pages/ssaa/ssaa.js
const request = require('../../utils/request');

// 格式化日期的辅助函数
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化时间的辅助函数
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return formatDate(date) + ' ' + hours + ':' + minutes;
};

// 格式化标准时间为YYYY-MM-DD HH:MM:SS格式
const formatFullDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  
  return formatDate(date) + ' ' + 
    String(date.getHours()).padStart(2, '0') + ':' + 
    String(date.getMinutes()).padStart(2, '0') + ':' + 
    String(date.getSeconds()).padStart(2, '0');
};

// 操作类型英文到中文的映射
const actionTypeMap = {
  'turn_on_device': '开启设备',
  'turn_off_device': '关闭设备',
  'adjust_device': '调整设备',
  'control_traffic_light': '控制三色灯',
  'turn_on_device_fan': '开启风扇',
  'turn_off_device_fan': '关闭风扇',
  'adjust_device_fan': '调整风扇',
  'turn_on_device_irrigation': '开启灌溉',
  'turn_off_device_irrigation': '关闭灌溉',
  'adjust_device_irrigation': '调整灌溉',
  'turn_on_device_light': '开启光照',
  'turn_off_device_light': '关闭光照',
  'adjust_device_light': '调整光照'
};

// 设备类型英文到中文的映射
const deviceTypeMap = {
  'fan': '风扇',
  'irrigation': '灌溉设备',
  'light': '光照设备',
  'traffic-light': '三色灯'
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 选项卡控制
    activeTab: 'inspections',
    
    // 日期筛选
    startDate: '',
    endDate: '',
    currentDate: formatDate(new Date()),
    
    // 分页控制
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0,
    
    // 数据
    inspections: [],
    actionLogs: [],
    
    // 状态控制
    isLoading: false,
    showDetailModal: false,
    selectedInspection: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 计算过去7天的日期作为默认开始日期
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.setData({
      startDate: formatDate(sevenDaysAgo),
      endDate: formatDate(new Date())
    });
    
    // 加载初始数据
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 加载数据
   */
  loadData() {
    if (this.data.activeTab === 'inspections') {
      this.fetchInspections();
    } else {
      this.fetchActionLogs();
    }
  },

  /**
   * 获取检查记录
   */
  fetchInspections() {
    const { startDate, endDate, currentPage, pageSize } = this.data;
    
    this.setData({ isLoading: true });
    
    // 构建请求参数
    let params = {
      page: currentPage,
      limit: pageSize
    };
    
    if (startDate) {
      params.start_time = startDate + ' 00:00:00';
    }
    
    if (endDate) {
      params.end_time = endDate + ' 23:59:59';
    }
    
    // 发起请求
    request({
      url: '/ssaa/inspections',
      method: 'GET',
      data: params
    })
      .then(res => {
        if (res.code === 200 && res.data) {
          // 处理时间格式
          const inspections = res.data.records.map(item => {
            return {
              ...item,
              inspection_time: formatTime(item.inspection_time),
              next_inspection_time: formatTime(item.next_inspection_time),
              created_at: formatTime(item.created_at),
              updated_at: formatTime(item.updated_at)
            };
          });
          
          // 计算总页数
          const totalPages = Math.ceil(res.data.total / pageSize) || 1;
          
          this.setData({
            inspections,
            totalPages,
            totalRecords: res.data.total
          });
        } else {
          wx.showToast({
            title: '获取检查记录失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取检查记录失败:', err);
        wx.showToast({
          title: '获取检查记录失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ isLoading: false });
        wx.stopPullDownRefresh();
      });
  },

  /**
   * 获取操作日志
   */
  fetchActionLogs() {
    const { startDate, endDate, currentPage, pageSize } = this.data;
    
    this.setData({ isLoading: true });
    
    // 构建请求参数
    let params = {
      page: currentPage,
      limit: pageSize
    };
    
    if (startDate) {
      params.start_time = startDate + ' 00:00:00';
    }
    
    if (endDate) {
      params.end_time = endDate + ' 23:59:59';
    }
    
    // 发起请求
    request({
      url: '/ssaa/action-logs',
      method: 'GET',
      data: params
    })
      .then(res => {
        if (res.code === 200 && res.data) {
          // 处理时间格式和操作类型中文转换
          const actionLogs = res.data.logs.map(item => {
            // 解析操作结果JSON
            let actionDetails = item.action_details;
            let resultMessage = '';
            let deviceType = '';
            
            try {
              // 尝试解析action_details
              if (typeof actionDetails === 'string') {
                actionDetails = JSON.parse(actionDetails);
              }
              
              // 获取设备类型
              deviceType = actionDetails.device_type || '';
              
              // 尝试解析result
              if (actionDetails.result && typeof actionDetails.result === 'string') {
                try {
                  const resultObj = JSON.parse(actionDetails.result);
                  resultMessage = resultObj.message || '';
                } catch (e) {
                  resultMessage = actionDetails.result;
                }
              }
            } catch (e) {
              console.error('解析操作详情失败', e);
            }
            
            // 转换设备类型为中文
            const deviceTypeCN = deviceTypeMap[deviceType] || deviceType;
            
            return {
              ...item,
              // 转换操作类型为中文
              action_type_cn: actionTypeMap[item.action_type] || item.action_type,
              action_time: formatTime(item.action_time),
              created_at: formatTime(item.created_at),
              // 美化操作详情
              action_details: {
                device_type: deviceTypeCN,
                result: resultMessage
              }
            };
          });
          
          // 计算总页数
          const totalPages = Math.ceil(res.data.total / pageSize) || 1;
          
          this.setData({
            actionLogs,
            totalPages,
            totalRecords: res.data.total
          });
        } else {
          wx.showToast({
            title: '获取操作日志失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取操作日志失败:', err);
        wx.showToast({
          title: '获取操作日志失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ isLoading: false });
        wx.stopPullDownRefresh();
      });
  },

  /**
   * 切换选项卡
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab,
      currentPage: 1,
      totalPages: 1
    }, () => {
      this.loadData();
    });
  },

  /**
   * 开始日期变更
   */
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    });
  },

  /**
   * 结束日期变更
   */
  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    });
  },

  /**
   * 应用筛选
   */
  applyFilter() {
    this.setData({ currentPage: 1 }, () => {
      this.loadData();
    });
  },

  /**
   * 重置筛选
   */
  resetFilter() {
    // 计算过去7天的日期
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.setData({
      startDate: formatDate(sevenDaysAgo),
      endDate: formatDate(new Date()),
      currentPage: 1
    }, () => {
      this.loadData();
    });
  },

  /**
   * 上一页
   */
  prevPage() {
    if (this.data.currentPage <= 1) return;
    
    this.setData({
      currentPage: this.data.currentPage - 1
    }, () => {
      this.loadData();
    });
  },

  /**
   * 下一页
   */
  nextPage() {
    if (this.data.currentPage >= this.data.totalPages) return;
    
    this.setData({
      currentPage: this.data.currentPage + 1
    }, () => {
      this.loadData();
    });
  },

  /**
   * 显示检查详情
   */
  showInspectionDetail(e) {
    const record = e.currentTarget.dataset.record;
    
    this.setData({
      selectedInspection: record,
      showDetailModal: true
    });
  },

  /**
   * 隐藏详情弹窗
   */
  hideDetailModal() {
    this.setData({
      showDetailModal: false
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({ currentPage: 1 }, () => {
      this.loadData();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.loadData();
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})