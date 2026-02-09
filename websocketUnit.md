# WebSocket 实时传感器数据接入文档

## 概述

本文档介绍如何通过 WebSocket 连接实时获取智慧农业系统的传感器数据。WebSocket 提供了低延迟的双向通信通道，非常适合实时数据的推送和接收。

## WebSocket 端点

```
ws://{服务器地址}/ws/sensor-data/{data_type}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| data_type | string | 是 | 数据类型，可选值: `all`、`air_sensor`、`soil_sensor` |
| token | string | 否 | JWT 认证令牌，可选，即使认证失败也能连接 |

### 数据类型说明

- `all`: 获取所有类型传感器数据
- `air_sensor`: 只获取空气温湿度传感器数据
- `soil_sensor`: 只获取土壤湿度传感器数据

## 认证方式

WebSocket 连接支持通过查询参数提供 JWT 令牌进行认证：

```
ws://{服务器地址}/ws/sensor-data/all?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

注意：即使认证失败，连接仍然会被接受，因为某些数据可能不需要认证。

## 消息格式

### 连接建立消息

当 WebSocket 连接成功建立时，服务器会发送一条确认消息：

```json
{
  "type": "connection_established",
  "message": "已连接到{data_type}数据流",
  "data_type": "数据类型"
}
```

### 传感器数据消息

#### 空气传感器数据格式

```json
{
  "device_type": "air_sensor",
  "device_name": "空气温湿度传感器",
  "temperature": 25.5,
  "humidity": 60.2,
  "timestamp": "2023-05-15T14:30:45.123456",
  "status": "正常"
}
```

#### 土壤湿度传感器数据格式

```json
{
  "device_type": "soil_sensor",
  "device_name": "土壤湿度传感器",
  "humidity": 42.5,
  "timestamp": "2023-05-15T14:30:45.123456",
  "status": "正常"
}
```

#### 光照传感器数据格式

```json
{
  "device_type": "light_sensor",
  "device_name": "光照传感器",
  "intensity": 8500,
  "timestamp": "2023-05-15T14:30:45.123456",
  "status": "正常"
}
```

#### 三色灯状态数据格式

```json
{
  "device_type": "traffic_light",
  "device_name": "三色灯控制器",
  "l0": 1,  // 红灯状态，0-关闭，1-打开
  "l1": 0,  // 绿灯状态，0-关闭，1-打开
  "l2": 0,  // 黄灯状态，0-关闭，1-打开
  "timestamp": "2023-05-15T14:30:45.123456"
}
```

### 心跳机制

客户端可以发送文本消息 `"ping"` 来检测连接是否仍然活跃，服务器将回复文本消息 `"pong"`。

## 前端实现示例

### JavaScript 原生实现

```javascript
// 创建 WebSocket 连接
function connectToSensorData(dataType, token) {
  // 构建 WebSocket URL
  let wsUrl = `ws://服务器地址/ws/sensor-data/${dataType}`;
  if (token) {
    wsUrl += `?token=${token}`;
  }
  
  const ws = new WebSocket(wsUrl);
  
  // 连接建立时的处理
  ws.onopen = function() {
    console.log(`已连接到${dataType}数据流`);
    
    // 设置定时发送心跳的机制
    setInterval(function() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 30000); // 每30秒发送一次心跳
  };
  
  // 接收消息的处理
  ws.onmessage = function(event) {
    if (event.data === "pong") {
      console.log("收到心跳响应");
      return;
    }
    
    // 解析JSON数据
    try {
      const data = JSON.parse(event.data);
      console.log("收到传感器数据:", data);
      
      // 根据数据类型处理不同的传感器数据
      if (data.device_type === "air_sensor") {
        updateAirSensorDisplay(data);
      } else if (data.device_type === "soil_sensor") {
        updateSoilSensorDisplay(data);
      } else if (data.device_type === "light_sensor") {
        updateLightSensorDisplay(data);
      } else if (data.device_type === "traffic_light") {
        updateTrafficLightDisplay(data);
      } else if (data.type === "connection_established") {
        console.log("连接已建立:", data.message);
      }
    } catch (e) {
      console.error("解析消息失败:", e);
    }
  };
  
  // 连接关闭时的处理
  ws.onclose = function(event) {
    console.log(`WebSocket连接已关闭，代码: ${event.code}，原因: ${event.reason}`);
    
    // 可以在这里添加重连逻辑
    setTimeout(function() {
      console.log("尝试重新连接...");
      connectToSensorData(dataType, token);
    }, 5000); // 5秒后重连
  };
  
  // 连接错误的处理
  ws.onerror = function(error) {
    console.error("WebSocket连接错误:", error);
  };
  
  return ws;
}

// 更新界面显示的函数（示例）
function updateAirSensorDisplay(data) {
  document.getElementById('temperature').textContent = `${data.temperature} °C`;
  document.getElementById('airHumidity').textContent = `${data.humidity} %`;
  document.getElementById('airStatus').textContent = data.status;
  document.getElementById('airTimestamp').textContent = new Date(data.timestamp).toLocaleString();
}

function updateSoilSensorDisplay(data) {
  document.getElementById('soilHumidity').textContent = `${data.humidity} %`;
  document.getElementById('soilStatus').textContent = data.status;
  document.getElementById('soilTimestamp').textContent = new Date(data.timestamp).toLocaleString();
}

// 使用示例
const token = localStorage.getItem('authToken'); // 从本地存储获取认证令牌
const wsConnection = connectToSensorData('all', token);
```

### Vue.js 实现示例

```javascript
// 在 Vue 组件中使用

export default {
  data() {
    return {
      ws: null,
      airSensorData: null,
      soilSensorData: null,
      lightSensorData: null,
      trafficLightData: null,
      heartbeatTimer: null
    }
  },
  methods: {
    connectWebSocket() {
      const token = this.$store.state.auth.token;
      const wsUrl = `ws://服务器地址/ws/sensor-data/all${token ? `?token=${token}` : ''}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket连接已建立');
        this.startHeartbeat();
      };
      
      this.ws.onmessage = (event) => {
        if (event.data === "pong") return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "connection_established") {
            console.log("连接已建立:", data.message);
            return;
          }
          
          switch (data.device_type) {
            case 'air_sensor':
              this.airSensorData = data;
              break;
            case 'soil_sensor':
              this.soilSensorData = data;
              break;
            case 'light_sensor':
              this.lightSensorData = data;
              break;
            case 'traffic_light':
              this.trafficLightData = data;
              break;
          }
        } catch (e) {
          console.error('解析消息失败:', e);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log(`WebSocket连接已关闭，代码: ${event.code}`);
        clearInterval(this.heartbeatTimer);
        
        // 自动重连
        setTimeout(this.connectWebSocket, 5000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
      };
    },
    startHeartbeat() {
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send('ping');
        }
      }, 30000);
    }
  },
  mounted() {
    this.connectWebSocket();
  },
  beforeDestroy() {
    if (this.ws) {
      this.ws.close();
      clearInterval(this.heartbeatTimer);
    }
  }
}
```

### React 实现示例

```javascript
import React, { useState, useEffect, useRef } from 'react';

function SensorDataComponent() {
  const [airSensorData, setAirSensorData] = useState(null);
  const [soilSensorData, setSoilSensorData] = useState(null);
  const [lightSensorData, setLightSensorData] = useState(null);
  const [trafficLightData, setTrafficLightData] = useState(null);
  
  const wsRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  
  // 连接WebSocket
  useEffect(() => {
    function connectWebSocket() {
      const token = localStorage.getItem('authToken');
      const wsUrl = `ws://服务器地址/ws/sensor-data/all${token ? `?token=${token}` : ''}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket连接已建立');
        
        // 启动心跳
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
      };
      
      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "connection_established") {
            console.log("连接已建立:", data.message);
            return;
          }
          
          switch (data.device_type) {
            case 'air_sensor':
              setAirSensorData(data);
              break;
            case 'soil_sensor':
              setSoilSensorData(data);
              break;
            case 'light_sensor':
              setLightSensorData(data);
              break;
            case 'traffic_light':
              setTrafficLightData(data);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('解析消息失败:', e);
        }
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket连接已关闭，代码: ${event.code}`);
        clearInterval(heartbeatTimerRef.current);
        
        // 自动重连
        setTimeout(connectWebSocket, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
      };
    }
    
    connectWebSocket();
    
    // 组件卸载时清理
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="sensor-data-container">
      {airSensorData && (
        <div className="sensor-card">
          <h3>空气温湿度传感器</h3>
          <p>温度: {airSensorData.temperature} °C</p>
          <p>湿度: {airSensorData.humidity} %</p>
          <p>状态: {airSensorData.status}</p>
          <p>更新时间: {new Date(airSensorData.timestamp).toLocaleString()}</p>
        </div>
      )}
      
      {soilSensorData && (
        <div className="sensor-card">
          <h3>土壤湿度传感器</h3>
          <p>湿度: {soilSensorData.humidity} %</p>
          <p>状态: {soilSensorData.status}</p>
          <p>更新时间: {new Date(soilSensorData.timestamp).toLocaleString()}</p>
        </div>
      )}
      
      {/* 其他传感器数据显示 */}
    </div>
  );
}

export default SensorDataComponent;
```