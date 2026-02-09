/**
 * WebSocket 服务 - 用于实时接收传感器数据
 */

const { config } = require('./config');

// WebSocket 连接实例
let wsConnection = null;
// 心跳定时器
let heartbeatTimer = null;
// 重连定时器
let reconnectTimer = null;
// 是否正在重连
let isReconnecting = false;
// 重连计数
let reconnectCount = 0;
// 最大重连次数
const MAX_RECONNECT = 10;
// 重连间隔 (毫秒)
const RECONNECT_INTERVAL = 5000;
// 心跳间隔 (毫秒)
const HEARTBEAT_INTERVAL = 30000;
// 当前数据类型
let currentDataType = 'all';

// 回调函数集合
const callbacks = {
  onOpen: null,
  onClose: null,
  onError: null,
  onMessage: null,
  onReconnect: null,
  onAirSensorData: null, 
  onSoilSensorData: null,
  onLightSensorData: null,
  onTrafficLightData: null,
};

/**
 * 初始化WebSocket连接
 * @param {string} dataType 数据类型，可选值: all、air_sensor、soil_sensor
 * @returns {WebSocket} WebSocket实例
 */
function connectWebSocket(dataType = 'all') {
  if (isReconnecting) return;
  
  // 存储当前数据类型
  currentDataType = dataType;
  
  // 关闭现有连接
  if (wsConnection) {
    cleanUp();
  }
  
  // 获取token
  const token = wx.getStorageSync('token');
  
  // 构建WebSocket URL
  const wsUrl = `${config.baseUrl.replace('http', 'ws')}/ws/sensor-data/${dataType}${token ? `?token=${token}` : ''}`;

  console.log(`正在连接WebSocket: ${wsUrl}`);

  try {
    wsConnection = wx.connectSocket({
      url: wsUrl,
      success: () => console.log('WebSocket连接请求已发送'),
      fail: (error) => console.error('WebSocket连接请求发送失败:', error)
    });
    
    // 监听连接打开
    wsConnection.onOpen(() => {
      console.log('WebSocket连接已建立');
      reconnectCount = 0;
      startHeartbeat();
      
      if (callbacks.onOpen) {
        callbacks.onOpen();
      }
    });
    
    // 监听连接关闭
    wsConnection.onClose((event) => {
      console.log('WebSocket连接已关闭', event);
      
      // 检查是否是正常关闭 (code 1000)
      const isNormalClosure = event && event.code === 1000;
      
      // 只有在非正常关闭的情况下才重连
      if (!isNormalClosure) {
        handleReconnect();
      }
      
      if (callbacks.onClose) {
        callbacks.onClose(event);
      }
    });
    
    // 监听连接错误
    wsConnection.onError((error) => {
      console.error('WebSocket连接错误:', error);
      
      if (callbacks.onError) {
        callbacks.onError(error);
      }
      
      // 错误发生时也触发重连
      handleReconnect();
    });
    
    // 监听接收到的消息
    wsConnection.onMessage((result) => {
      const { data } = result;
      
      // 处理心跳回应
      if (data === 'pong') {
        console.log('收到心跳响应');
        // 更新最后接收到响应的时间
        if (wsConnection._lastPongTime !== undefined) {
          wsConnection._lastPongTime = Date.now();
        }
        return;
      }
      
      try {
        let message;
        // 尝试解析JSON
        try {
          message = JSON.parse(data);
        } catch (e) {
          console.log('收到非JSON格式数据:', data);
          message = data;
        }
        
        // 处理连接建立消息
        if (message.type === 'connection_established') {
          console.log('WebSocket连接已确认:', message.message);
          return;
        }
        
        // 调用消息回调
        if (callbacks.onMessage) {
          callbacks.onMessage(message);
        }
        
        // 根据设备类型分发数据
        if (message.device_type) {
          switch (message.device_type) {
            case 'air_sensor':
              if (callbacks.onAirSensorData) {
                callbacks.onAirSensorData(message);
              }
              break;
            case 'soil_sensor':
              if (callbacks.onSoilSensorData) {
                callbacks.onSoilSensorData(message);
              }
              break;
            case 'light_sensor':
              if (callbacks.onLightSensorData) {
                callbacks.onLightSensorData(message);
              }
              break;
            case 'traffic_light':
              if (callbacks.onTrafficLightData) {
                callbacks.onTrafficLightData(message);
              }
              break;
          }
        }
      } catch (e) {
        console.error('处理WebSocket消息失败:', e, data);
      }
    });
    
    return wsConnection;
  } catch (e) {
    console.error('创建WebSocket连接失败:', e);
    return null;
  }
}

/**
 * 开始心跳
 */
function startHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
  
  // 初始化最后心跳响应时间
  wsConnection._lastPongTime = Date.now();
  
  heartbeatTimer = setInterval(() => {
    if (wsConnection && wsConnection.readyState === 1) {
      // 检查上次心跳响应时间，如果超过2倍心跳间隔没有响应，认为连接异常
      const currentTime = Date.now();
      if (currentTime - wsConnection._lastPongTime > HEARTBEAT_INTERVAL * 2) {
        console.log('心跳检测超时，连接可能已断开，尝试重连...');
        cleanUp();
        handleReconnect();
        return;
      }
      
      // 正常发送心跳
      wsConnection.send('ping');
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * 处理重连
 */
function handleReconnect() {
  // 检查是否达到最大重连次数或者已经在重连过程中
  if (reconnectCount >= MAX_RECONNECT || isReconnecting) return;
  
  isReconnecting = true;
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  
  // 渐进式增加重连时间间隔
  const currentInterval = Math.min(RECONNECT_INTERVAL * Math.pow(1.5, reconnectCount), 30000);
  
  console.log(`将在 ${currentInterval/1000} 秒后尝试重连...`);
  
  reconnectTimer = setTimeout(() => {
    console.log(`尝试WebSocket重连 (${reconnectCount + 1}/${MAX_RECONNECT})...`);
    
    reconnectCount++;
    isReconnecting = false;
    
    // 调用重连回调
    if (callbacks.onReconnect) {
      callbacks.onReconnect(reconnectCount);
    }
    
    // 实际执行重连
    connectWebSocket(currentDataType);
  }, currentInterval);
}

/**
 * 清理资源
 */
function cleanUp() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (wsConnection) {
    try {
      wsConnection.close();
    } catch (e) {
      console.error('关闭WebSocket连接失败:', e);
    }
    wsConnection = null;
  }
}

/**
 * 关闭WebSocket连接
 */
function closeWebSocket() {
  cleanUp();
  reconnectCount = MAX_RECONNECT; // 防止重连
  isReconnecting = false;
}

/**
 * 检查WebSocket连接状态
 * @returns {boolean} 连接是否打开
 */
function isConnected() {
  return wsConnection && wsConnection.readyState === 1;
}

/**
 * 设置回调函数
 * @param {string} type 回调类型
 * @param {Function} callback 回调函数
 */
function setCallback(type, callback) {
  if (callbacks.hasOwnProperty(type)) {
    callbacks[type] = callback;
  } else {
    console.error('无效的回调类型:', type);
  }
}

module.exports = {
  connectWebSocket,
  closeWebSocket,
  isConnected,
  setCallback,
}; 