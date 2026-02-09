// 导入请求模块
const request = require('../../utils/request');
let chart = null;

// 图表库 - 使用简化版处理图表
const uCharts = require('../../utils/u-charts.min.js');

Page({
  data: {
    dataType: '', // 数据类型: soil, air, light
    pageTitle: '环境数据详情',
    dataRecords: [], // 数据记录
    lastUpdateTime: '正在加载...', // 最后更新时间
    avgValue: '--', // 平均值
    maxValue: '--', // 最大值
    minValue: '--', // 最小值
    // 空气湿度相关数据
    humidityAvg: '--', // 湿度平均值
    humidityMax: '--', // 湿度最大值
    humidityMin: '--', // 湿度最小值
    co2Avg: '--',
    co2Max: '--',
    co2Min: '--',
    loading: true, // 加载状态
    hasData: false, // 是否有数据
    unit: '', // 单位
    chartData: null, // 图表数据
    chartTitle: '数据趋势图' // 图表标题
  },

  onLoad: function (options) {
    // 获取传入的数据类型参数
    const dataType = options.type || 'soil';
    this.setData({ dataType });

    // 根据数据类型设置页面标题和单位
    this.setPageInfo(dataType);
    
    // 加载数据
    this.loadData();
  },

  onPullDownRefresh: function () {
    // 下拉刷新时重新加载数据
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReady: function() {
    // 页面渲染完成后获取canvas上下文
    setTimeout(() => {
      this.initCanvasContext();
    }, 500); // 延迟获取，确保DOM已渲染完成
  },

  // 初始化Canvas上下文
  initCanvasContext: function() {
    const query = wx.createSelectorQuery();
    
    // 主图表初始化
    query.select('#dataChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0] && this.data.hasData) {
          const canvas = res[0].node;
          this.initChart(canvas, 'main');
        }
      });
    
    // 如果是空气数据类型，还需要初始化二氧化碳图表
    if (this.data.dataType === 'air') {
      const co2Query = wx.createSelectorQuery();
      co2Query.select('#co2Chart')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0] && this.data.hasData) {
            const canvas = res[0].node;
            this.initChart(canvas, 'co2');
          }
        });
    }
  },

  // 设置页面标题和单位
  setPageInfo: function(dataType) {
    let pageTitle = '环境数据详情';
    let unit = '';
    
    switch(dataType) {
      case 'soil':
        pageTitle = '土壤湿度详情';
        unit = '%';
        break;
      case 'air':
        pageTitle = '空气温湿度与CO₂详情';
        unit = '';
        break;
      case 'light':
        pageTitle = '光照强度详情';
        unit = ' lux';
        break;
    }
    
    this.setData({
      pageTitle,
      unit
    });

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: pageTitle
    });
  },

  // 加载数据
  loadData: function(callback) {
    this.setData({ loading: true });
    
    const { dataType } = this.data;
    let url = '';
    
    switch(dataType) {
      case 'soil':
        url = '/soil-humidity';
        break;
      case 'air':
        url = '/air-condition';
        break;
      case 'light':
        url = '/light-intensity';
        break;
    }
    
    // 临时模拟数据用于展示
    setTimeout(() => {
      const mockData = this.generateMockData(dataType);
      
      // 格式化数据
      const records = this.formatRecords(mockData);
      
      // 计算统计信息
      const stats = this.calculateStats(records);
      
      this.setData({
        dataRecords: records,
        hasData: records.length > 0,
        lastUpdateTime: this.getFormattedTime(),
        avgValue: stats.avg,
        maxValue: stats.max,
        minValue: stats.min,
        humidityAvg: stats.humidityAvg,
        humidityMax: stats.humidityMax,
        humidityMin: stats.humidityMin,
        co2Avg: stats.co2Avg,
        co2Max: stats.co2Max,
        co2Min: stats.co2Min,
        loading: false,
        chartData: this.prepareChartData(records)
      });
      
      // 如果有数据，初始化图表
      if (records.length > 0) {
        setTimeout(() => {
          this.initCanvasContext();
        }, 100);
      }
      
      if (callback) callback();
    }, 1000);

  
  },

  // 生成模拟数据用于展示
  generateMockData: function(dataType) {
    const now = new Date();
    const records = [];
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - (99 - i) * 30 * 60000); // 每30分钟一条记录
      
      if (dataType === 'soil') {
        records.push({
          timestamp: timestamp.toISOString(),
          humidity: 30 + Math.random() * 10, // 30-40% 随机湿度
          status: '正常'
        });
      } else if (dataType === 'air') {
        records.push({
          timestamp: timestamp.toISOString(),
          temperature: 25 + Math.random() * 10, // 25-35°C 随机温度
          humidity: 50 + Math.random() * 20, // 50-70% 随机湿度
          co2: 300 + Math.random() * 200, // 300-500ppm 随机二氧化碳浓度
          status: '正常'
        });
      } else if (dataType === 'light') {
        records.push({
          timestamp: timestamp.toISOString(),
          intensity: 800 + Math.random() * 400, // 800-1200 lux 随机光照强度
          status: '正常'
        });
      }
    }
    
    return records;
  },

  // 格式化数据记录
  formatRecords: function(records) {
    const { dataType } = this.data;
    
    return records.map(record => {
      // 格式化时间
      const date = new Date(record.timestamp);
      const formattedTime = `${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
      
      if (dataType === 'air') {
        return {
          ...record,
          formattedTime,
          temperature: record.temperature.toFixed(1),
          humidity: record.humidity.toFixed(1),
          co2: record.co2.toFixed(0)
        };
      } else if (dataType === 'soil') {
        return {
          ...record,
          formattedTime,
          value: record.humidity.toFixed(1)
        };
      } else { // light
        return {
          ...record,
          formattedTime,
          value: record.intensity.toFixed(1)
        };
      }
    }).reverse(); // 最新的数据排在前面
  },

  // 计算统计信息
  calculateStats: function(records) {
    const { dataType } = this.data;
    
    if (records.length === 0) {
      return { 
        avg: '--', max: '--', min: '--', 
        humidityAvg: '--', humidityMax: '--', humidityMin: '--',
        co2Avg: '--', co2Max: '--', co2Min: '--'  
      };
    }
    
    if (dataType === 'air') {
      // 计算温度统计
      const temps = records.map(r => parseFloat(r.temperature));
      const humids = records.map(r => parseFloat(r.humidity));
      const co2Values = records.map(r => parseFloat(r.co2) || 0); // 确保即使co2值不存在也能处理
      
      const tempAvg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
      const tempMax = Math.max(...temps).toFixed(1);
      const tempMin = Math.min(...temps).toFixed(1);
      
      // 为空气温湿度和二氧化碳返回特殊格式
      return {
        avg: tempAvg,
        max: tempMax,
        min: tempMin,
        humidityAvg: (humids.reduce((a, b) => a + b, 0) / humids.length).toFixed(1),
        humidityMax: Math.max(...humids).toFixed(1),
        humidityMin: Math.min(...humids).toFixed(1),
        co2Avg: Math.round(co2Values.reduce((a, b) => a + b, 0) / co2Values.length),
        co2Max: Math.round(Math.max(...co2Values)),
        co2Min: Math.round(Math.min(...co2Values))
      };
    } else {
      const values = records.map(r => parseFloat(r.value));
      return {
        avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
        max: Math.max(...values).toFixed(1),
        min: Math.min(...values).toFixed(1)
      };
    }
  },

  // 准备图表数据
  prepareChartData: function(records) {
    const { dataType } = this.data;
    
    // 获取最后20条数据用于图表显示
    const chartRecords = records.slice(-20);
    
    const labels = chartRecords.map(r => r.formattedTime);
    
    if (dataType === 'air') {
      // 设置图表标题
      this.setData({
        chartTitle: '空气温湿度变化趋势'
      });
      
      // 将数据分为两个图表数据
      return {
        labels,
        // 主图表数据 - 只包含温度和湿度
        datasets: [
          {
            name: '温度(°C)',
            data: chartRecords.map(r => parseFloat(r.temperature)),
            color: '#2196F3'
          },
          {
            name: '湿度(%)',
            data: chartRecords.map(r => parseFloat(r.humidity)),
            color: '#64B5F6' // 使用较浅的蓝色区分线
          }
        ],
        // 二氧化碳图表数据
        co2Dataset: {
          name: 'CO₂(ppm)',
          data: chartRecords.map(r => parseFloat(r.co2)),
          color: '#4CAF50'
        }
      };
    } else if (dataType === 'soil') {
      // 设置图表标题
      this.setData({
        chartTitle: '土壤湿度变化趋势'
      });
      
      return {
        labels,
        datasets: [
          {
            name: '土壤湿度(%)',
            data: chartRecords.map(r => parseFloat(r.value)),
            color: '#4CAF50'
          }
        ]
      };
    } else { // light
      // 设置图表标题
      this.setData({
        chartTitle: '光照强度变化趋势'
      });
      
      return {
        labels,
        datasets: [
          {
            name: '光照强度(lux)',
            data: chartRecords.map(r => parseFloat(r.value)),
            color: '#FFC107'
          }
        ]
      };
    }
  },

  // 初始化图表
  initChart: function(canvas, type) {
    if (!canvas || !this.data.chartData) return;
    
    try {
      const ctx = canvas.getContext('2d');
      
      // 获取设备像素比
      const dpr = wx.getSystemInfoSync().pixelRatio;
      
      // 设置canvas的实际大小
      const { width, height } = canvas;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      // 缩放绘图上下文以适应设备像素比
      ctx.scale(dpr, dpr);
      
      // 绘制折线图，使用原始尺寸
      this.drawLineChart(ctx, width, height, type);
      
      console.log(`${type}图表初始化成功`);
    } catch (error) {
      console.error(`${type}图表初始化失败:`, error);
    }
  },

  // 绘制折线图
  drawLineChart: function(ctx, width, height, type) {
    const chartData = this.data.chartData;
    
    // 根据图表类型选择数据
    let data;
    if (type === 'co2' && this.data.dataType === 'air' && chartData && chartData.co2Dataset) {
      data = {
        labels: chartData.labels,
        datasets: [chartData.co2Dataset]
      };
    } else if (chartData) {
      data = chartData;
    } else {
      return; // 无数据时退出
    }
    
    if (!data || !data.datasets || data.datasets.length === 0) return;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置边距
    const padding = {
      top: 45,  // 增加顶部空间以容纳标题和图例
      right: 20,
      bottom: 35, // 减少底部留白
      left: 45
    };
    
    // 计算图表区域尺寸
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // 查找所有数据集中的最大值和最小值
    let maxValue = Number.MIN_SAFE_INTEGER;
    let minValue = Number.MAX_SAFE_INTEGER;
    
    data.datasets.forEach(dataset => {
      const datasetMax = Math.max(...dataset.data);
      const datasetMin = Math.min(...dataset.data);
      maxValue = Math.max(maxValue, datasetMax);
      minValue = Math.min(minValue, datasetMin);
    });
    
    // 为了图表美观，略微扩展范围
    const range = maxValue - minValue;
    maxValue = maxValue + range * 0.15; // 增加顶部空间
    minValue = Math.max(0, minValue - range * 0.1);
    
    // 计算刻度尺
    const xStep = chartWidth / (data.labels.length - 1);
    const yScale = chartHeight / (maxValue - minValue);
    
    // 绘制背景网格
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);
    
    // 绘制网格线 - 先画网格线，再画坐标轴
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#BDBDBD';
    ctx.textAlign = 'right';
    
    // 绘制y轴网格线和标签
    const yTickCount = 6; // 减少刻度数量，增加间距
    const yTickStep = (maxValue - minValue) / yTickCount;
    
    for (let i = 0; i <= yTickCount; i++) {
      const y = height - padding.bottom - i * (chartHeight / yTickCount);
      const value = minValue + i * yTickStep;
      
      // 网格线
      ctx.beginPath();
      ctx.strokeStyle = '#F5F5F5';
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // 标签 - 数值格式化，避免小数过长
      let formattedValue;
      if (value >= 100) {
        formattedValue = Math.round(value);
      } else if (value >= 10) {
        formattedValue = value.toFixed(1);
      } else {
        formattedValue = value.toFixed(1);
      }
      
      ctx.fillText(formattedValue, padding.left - 8, y + 3);
    }
    
    // 绘制x轴网格线和标签
    ctx.textAlign = 'center';
    ctx.font = '8px sans-serif';
    
    // 显示更少的标签，避免拥挤 - 最多显示6个
    const displayLabels = 6;
    const step = Math.max(1, Math.ceil(data.labels.length / displayLabels));
    
    for (let i = 0; i < data.labels.length; i += step) {
      const x = padding.left + i * xStep;
      
      // 垂直网格线
      ctx.beginPath();
      ctx.strokeStyle = '#F5F5F5';
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      
      // 标签
      ctx.save();
      ctx.fillStyle = '#BDBDBD';
      ctx.translate(x, height - padding.bottom + 15);
      // 缩短标签文本，只显示时间部分
      const label = data.labels[i].split(' ')[1] || data.labels[i];
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
    
    // 绘制坐标轴
    ctx.beginPath();
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1.5;
    
    // x轴
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    
    // y轴
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    
    ctx.stroke();
    
    // 绘制数据线和区域
    data.datasets.forEach((dataset, index) => {
      // 为每个数据集使用不同透明度的渐变填充
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, dataset.color + '20'); // 20 = 12% 透明度
      gradient.addColorStop(1, dataset.color + '05'); // 05 = 2% 透明度
      
      ctx.beginPath();
      ctx.fillStyle = gradient;
      
      // 绘制填充区域的路径
      const startX = padding.left;
      const startY = height - padding.bottom - (dataset.data[0] - minValue) * yScale;
      ctx.moveTo(startX, height - padding.bottom); // 起点在x轴上
      ctx.lineTo(startX, startY); // 连到第一个数据点
      
      for (let i = 1; i < dataset.data.length; i++) {
        const x = padding.left + i * xStep;
        const y = height - padding.bottom - (dataset.data[i] - minValue) * yScale;
        ctx.lineTo(x, y);
      }
      
      // 闭合路径回到x轴
      ctx.lineTo(padding.left + (dataset.data.length - 1) * xStep, height - padding.bottom);
      ctx.closePath();
      ctx.fill();
    });
    
    // 绘制线条和点
    data.datasets.forEach((dataset, index) => {
      // 绘制折线
      ctx.beginPath();
      ctx.strokeStyle = dataset.color;
      ctx.lineWidth = 1.5; // 稍粗的线条
      ctx.lineJoin = 'round';
      
      // 移动到第一个点
      ctx.moveTo(padding.left, height - padding.bottom - (dataset.data[0] - minValue) * yScale);
      
      // 绘制线条
      for (let i = 1; i < dataset.data.length; i++) {
        const x = padding.left + i * xStep;
        const y = height - padding.bottom - (dataset.data[i] - minValue) * yScale;
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // 绘制数据点 - 只在关键位置绘制点，减少视觉干扰
      ctx.fillStyle = dataset.color;
      
      // 确定在哪些位置绘制点 - 最多显示8个点
      const pointCount = 8;
      const pointInterval = Math.max(1, Math.floor(dataset.data.length / pointCount));
      
      for (let i = 0; i < dataset.data.length; i += pointInterval) {
        const x = padding.left + i * xStep;
        const y = height - padding.bottom - (dataset.data[i] - minValue) * yScale;
        
        // 绘制数据点
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制外圈
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // 确保终点一定有数据点
      const lastIndex = dataset.data.length - 1;
      const lastX = padding.left + lastIndex * xStep;
      const lastY = height - padding.bottom - (dataset.data[lastIndex] - minValue) * yScale;
      
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // 绘制图例
    const legendY = 15; // 调整图例位置，确保标题有足够空间
    let legendX = padding.left + 5;
    
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'left';
    ctx.font = '10px sans-serif';
    
    // 图表标题
    let title = '';
    
    if (type === 'co2') {
      title = '二氧化碳浓度趋势图'; 
    } else {
      const { dataType } = this.data;
      switch(dataType) {
        case 'soil':
          title = '土壤湿度变化趋势图';
          break;
        case 'air':
          title = '温湿度变化趋势图';
          break;
        case 'light':
          title = '光照强度变化趋势图';
          break;
      }
    }
    
    ctx.fillText(title, legendX, legendY);
    
    // 图例
    data.datasets.forEach(dataset => {
      ctx.fillStyle = dataset.color;
      
      // 绘制图例标记
      ctx.beginPath();
      ctx.arc(legendX, legendY + 15, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // 外圈
      ctx.beginPath();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.arc(legendX, legendY + 15, 3, 0, Math.PI * 2);
      ctx.stroke();
      
      // 绘制图例文本
      ctx.fillStyle = '#757575';
      ctx.textAlign = 'left';
      ctx.font = '10px sans-serif';
      ctx.fillText(dataset.name, legendX + 8, legendY + 18);
      
      // 更新下一个图例的位置
      legendX += ctx.measureText(dataset.name).width + 25;
    });
  },

  // 格式化当前时间
  getFormattedTime: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    return `${year}/${this.padZero(month)}/${this.padZero(day)} ${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  },

  // 补零函数
  padZero: function(num) {
    return num < 10 ? '0' + num : num;
  }
}); 