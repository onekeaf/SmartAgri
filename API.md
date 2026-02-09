# 智慧农业系统API接口文档

## 概述

本文档描述了智慧农业系统的API接口设计，包括用户管理、设备管理、环境数据、设备控制等功能。

## 基础信息

- **基础URL**: `http://122.152.233.112:8000/api/v1`
- **数据格式**: 所有API请求和响应均使用JSON格式
- **认证方式**: JWT令牌认证，在请求头中添加 `Authorization: Bearer {token}`
- **状态码**:
  - 200: 请求成功
  - 201: 创建成功
  - 400: 请求参数错误
  - 401: 未授权
  - 403: 权限不足
  - 404: 资源不存在
  - 500: 服务器错误

## API端点

### 1. 用户管理

#### 1.1 用户登录

- **请求方式**: POST
- **URL**: `/auth/login`
- **请求参数**:

```json
{
  "phone_number": "13800138000",
  "password": "password123"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "username": "管理员",
      "role": "admin",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

#### 1.2 创建用户

- **请求方式**: POST
- **URL**: `/auth/users`
- **请求参数**:

```json
{
  "username": "李四",
  "phone_number": "13900139000",
  "password": "password123",
  "role": "农业系统工作员",
  "email": "lisi@example.com",
  "department": "维护部",
  "position": "技术员",
  "join_date": "2023-01-01"
}
```

- **响应**:

```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "user_id": 2,
    "username": "李四",
    "phone_number": "13900139000"
  }
}
```

#### 1.3 获取用户详情

- **请求方式**: GET
- **URL**: `/users/{user_id}`
- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "user_id": 1,
    "username": "张三",
    "phone_number": "13800138000",
    "role": "农业系统工作员",
    "email": "zhangsan@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "department": "监控部",
    "position": "主管",
    "join_date": "2022-01-01",
    "work_status": "在岗",
    "created_at": "2022-01-01 10:00:00",
    "updated_at": "2022-01-01 10:00:00"
  }
}
```

#### 1.4 更新用户信息

- **请求方式**: PUT
- **URL**: `/users/{user_id}`
- **请求参数**:

```json
{
  "username": "张三(已更新)",
  "email": "zhangsan_new@example.com",
  "avatar_url": "https://example.com/new_avatar.jpg",
  "department": "监控部",
  "position": "高级主管",
  "work_status": "请假"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "user_id": 1,
    "updated_at": "2023-01-01 10:00:00"
  }
}
```

### 2. 设备管理

#### 2.1 获取设备详情

- **请求方式**: GET
- **URL**: `/devices/{device_type}`
- **说明**: device_type可以是 "temperature"(温度), "humidity"(湿度), "irrigation"(灌溉), "fan"(风扇)，"light"(灯光) 类型
- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "device_id": 1,
    "device_code": "TEMP001",
    "device_name": "温度传感器",
    "device_type": "传感器",
    "device_category": "温度",
    "status": "正常",
    "description": "农田A区温度监测设备",
    "created_at": "2022-01-01 10:00:00",
    "updated_at": "2022-01-01 10:00:00"
  }
}
```

#### 2.2 更新设备信息

- **请求方式**: PUT
- **URL**: `/devices/{device_type}`
- **请求参数**:

```json
{
  "device_name": "温度传感器(已更新)",
  "status": "维修中",
  "description": "农田A区温度监测设备(更新描述)"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "device_id": 1,
    "updated_at": "2023-01-01 10:00:00"
  }
}
```

### 3. 设备控制

#### 3.1 获取设备控制状态历史记录

- **请求方式**: GET
- **URL**: `/devices/{device_type}/status/history`
- **请求参数**:
  - `start_time`: 起始时间(可选)
  - `end_time`: 结束时间(可选)
  - `page`: 页码，默认1
  - `limit`: 每页条数，默认20

- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "history": [
      {
        "status_id": 1,
        "device_type": "fan",
        "device_name": "风扇控制器",
        "power_status": 1,
        "level": 2,
        "auto_mode": 0,
        "operation_time": "2023-01-01 10:00:00",
        "operation_user": {
          "user_id": 1,
          "username": "张三"
        }
      },
      {
        "status_id": 2,
        "device_type": "fan",
        "device_name": "风扇控制器",
        "power_status": 0,
        "level": 0,
        "auto_mode": 0,
        "operation_time": "2023-01-01 15:30:00",
        "operation_user": {
          "user_id": 1,
          "username": "张三"
        }
      }
    ]
  }
}
```

#### 3.2 通用设备控制

- **请求方式**: POST
- **URL**: `/devices/{device_type}/control`
- **说明**: device_type只能是 "fan"(风扇) 或 "irrigation"(灌溉) 类型，三色灯必须使用专用接口
- **特别说明**: 如果系统中不存在指定的设备，会自动创建对应的设备记录
- **请求参数**:

```json
{
  "power_status": 1,  // 1表示开启，0表示关闭
  "level": 3,         // 档位/亮度等级
  "auto_mode": 0      // 自动模式状态
}
```

- **特别说明**:
  - 风扇设备(fan): power_status=1时level值(1-3)表示档位，power_status=0时设备关闭
  - 灌溉系统(irrigation): power_status=1时level值(1-3)表示灌溉强度，power_status=0时设备关闭
  - 若尝试通过此接口控制三色灯，将返回400错误

- **响应**:

```json
{
  "code": 200,
  "message": "控制指令已发送",
  "data": {
    "operation_id": 123,
    "device_type": "fan",
    "operation_time": "2023-01-01 10:05:00"
  }
}
```

#### 3.3 三色灯控制

- **请求方式**: POST
- **URL**: `/devices/traffic-light/control`
- **说明**: 三色灯只能通过该专用接口控制，不能使用通用设备控制接口
- **特别说明**: 如果系统中不存在三色灯设备，会自动创建对应的设备记录
- **请求参数**:

```json
{
  "power_status": 1,      //0表示关闭1表示开启
  "red": 0,
  "yellow": 1,     
  "green": 0
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "三色灯控制指令已发送",
  "data": {
    "device_type": "traffic-light",
    "red": 0,
    "green": 0,
    "yellow": 1,
    "operation_time": "2023-01-01 10:05:00"
  }
}
```

#### 3.4 获取光照与三色灯状态

- **请求方式**: GET
- **URL**: `/devices/light/status`
- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "intensity": 1872,  // 光照强度(lux)
    "l0": 1,  // 红灯状态(0关闭/1开启)
    "l1": 1,  // 绿灯状态(0关闭/1开启)
    "l2": 0   // 黄灯状态(0关闭/1开启)
  }
}
```

### 4. 环境数据

#### 4.1 获取土壤湿度数据

- **请求方式**: GET
- **URL**: `/soil-humidity`
- **请求参数**:
  - `start_time`: 起始时间(可选)
  - `end_time`: 结束时间(可选)
  - `limit`: 返回数据条数，默认100

- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 24,
    "records": [
      {
        "record_id": 1,
        "device_type": "soil_humidity",
        "device_name": "土壤湿度传感器",
        "humidity": 45.5,
        "timestamp": "2023-01-01 10:00:00",
        "status": "正常"
      }
    ]
  }
}
```

#### 4.2 获取空气温湿度数据

- **请求方式**: GET
- **URL**: `/air-condition`
- **请求参数**:
  - `start_time`: 起始时间(可选)
  - `end_time`: 结束时间(可选)
  - `limit`: 返回数据条数，默认100

- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 24,
    "records": [
      {
        "record_id": 1,
        "device_type": "air_sensor",
        "device_name": "空气温湿度传感器",
        "temperature": 28.5,
        "humidity": 65.2,
        "timestamp": "2023-01-01 10:00:00",
        "status": "正常"
      }
    ]
  }
}
```

#### 4.3 获取环境数据统计

- **请求方式**: GET
- **URL**: `/environment/statistics`
- **请求参数**:
  - `type`: 统计类型(daily/weekly/monthly)
  - `start_date`: 起始日期
  - `end_date`: 结束日期

- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "soil_humidity": {
      "avg": 42.5,
      "max": 60.2,
      "min": 30.1,
      "timeline": [
        {"date": "2023-01-01", "value": 42.5},
        {"date": "2023-01-02", "value": 45.3}
      ]
    },
    "air_temperature": {
      "avg": 26.8,
      "max": 32.5,
      "min": 22.1,
      "timeline": [
        {"date": "2023-01-01", "value": 26.5},
        {"date": "2023-01-02", "value": 27.3}
      ]
    },
    "air_humidity": {
      "avg": 65.3,
      "max": 80.1,
      "min": 50.2,
      "timeline": [
        {"date": "2023-01-01", "value": 65.5},
        {"date": "2023-01-02", "value": 62.3}
      ]
    }
  }
}
```

### 5. 聊天消息

#### 5.1 发送消息

- **请求方式**: POST
- **URL**: `/chat/messages`
- **请求参数**:

```json
{
  "user_id": 1,
  "content": "请查询A区温度数据"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "响应成功",
  "data": {
    "message_id": 123,
    "content": "A区当前温度为28.5℃，湿度为65.2%",
    "timestamp": "2023-01-01 10:00:05"
  }
}
```

### 6. 告警管理

#### 6.1 获取告警列表

- **请求方式**: GET
- **URL**: `/alerts`
- **请求参数**:
  - `status`: 处理状态(未处理/已处理/已忽略)
  - `alert_type`: 告警类型(可选)
  - `start_time`: 起始时间(可选)
  - `end_time`: 结束时间(可选)
  - `page`: 页码，默认1
  - `limit`: 每页条数，默认20

- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "alerts": [
      {
        "alert_id": 1,
        "alert_type": "设备故障",
        "source_type": "设备",
        "source_id": 1,
        "source_name": "温度传感器",
        "alert_message": "设备连接中断",
        "alert_time": "2023-01-01 10:00:00",
        "status": "未处理"
      }
    ]
  }
}
```

#### 6.2 处理告警

- **请求方式**: PUT
- **URL**: `/alerts/{alert_id}`
- **请求参数**:

```json
{
  "status": "已处理",
  "process_result": "已重启设备，恢复正常"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "处理成功",
  "data": {
    "alert_id": 1,
    "processed_time": "2023-01-01 11:00:00",
    "processed_by": {
      "user_id": 1,
      "username": "张三"
    }
  }
}
```

### 7. 系统概览

#### 7.1 系统仪表盘数据

- **请求方式**: GET
- **URL**: `/dashboard`
- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "device_stats": {
      "total": 4,
      "online": 4,
      "offline": 0,
      "fault": 0,
      "by_category": {
        "温度": 1,
        "湿度": 1,
        "风扇": 1,
        "灌溉": 1
      }
    },
    "alert_stats": {
      "total_today": 12,
      "unprocessed": 5,
      "critical": 2
    },
    "environment_current": {
      "avg_temperature": 28.5,
      "avg_humidity": 65.2,
      "avg_soil_humidity": 42.5
    },
    "user_stats": {
      "total": 50,
      "online": 10
    }
  }
}
```

### 8. 语音识别

#### 8.1 识别语音文件

- **请求方式**: POST
- **URL**: `/voice/recognize`
- **请求格式**: `multipart/form-data`
- **请求参数**:
  - `audio_file`: 语音文件 (必须)
  - `audio_format`: 音频格式，如wav、pcm、mp3 (可选，默认wav)
  - `sample_rate`: 采样率 (可选，默认16000)

- **响应**:

```json
{
  "success": true,
  "text": "识别的文本内容",
  "error": null
}
```

- **错误响应**:

```json
{
  "success": false,
  "text": "",
  "error": "语音识别失败: 无法访问语音识别服务"
}
```

#### 8.2 语音转文字并获取Agent回复

- **请求方式**: POST
- **URL**: `/voice/chat`
- **请求格式**: `multipart/form-data`
- **请求参数**:
  - `audio_file`: 语音文件 (必须)
  - `audio_format`: 音频格式，如wav、pcm、mp3 (可选，默认wav)
  - `sample_rate`: 采样率 (可选，默认16000)

- **响应**:

```json
{
  "code": 200,
  "message": "语音识别并回复成功",
  "data": {
    "message_id": 123,
    "recognized_text": "识别出的语音内容",
    "agent_response": "Agent的回复内容",
    "timestamp": "2023-01-01 10:00:05"
  }
}
```

- **错误响应**:

```json
{
  "code": 400,
  "message": "语音识别失败: 无法识别的语音内容"
}
```

### 9. SSAA（Super Smart Agriculture Agent）控制

#### 9.1 控制SSAA代理

- **请求方式**: POST
- **URL**: `/ssaa/control`
- **说明**: 启用或禁用SSAA全自动农场管理代理
- **权限要求**: 仅管理员可操作
- **请求参数**:

```json
{
  "enabled": true  // true表示启用，false表示禁用
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "SSAA代理已启动",
  "data": {
    "enabled": true,
    "last_update": "2023-01-01T10:00:00"
  }
}
```

- **特别说明**:
  - 启用SSAA后，系统将全自动监控和管理农场环境和设备
  - SSAA代理会定期检查农场状态，并根据分析结果自动调整设备
  - SSAA代理会自动决定下一次检查的时间间隔
  - 禁用SSAA后，系统将停止自动管理

#### 9.2 获取SSAA状态

- **请求方式**: GET
- **URL**: `/ssaa/status`
- **响应**:

```json
{
  "code": 200,
  "message": "获取SSAA状态成功",
  "data": {
    "enabled": true,
    "running": true,
    "last_update": "2023-01-01T10:00:00"
  }
}
```

- **状态说明**:
  - enabled: 设置中是否启用SSAA
  - running: SSAA代理当前是否正在运行
  - last_update: 最后一次状态更新时间

#### 9.3 获取SSAA检查记录

- **请求方式**: GET
- **URL**: `/ssaa/inspections`
- **请求参数**:
  - `start_time`: 开始时间，格式 YYYY-MM-DD HH:MM:SS (可选)
  - `end_time`: 结束时间，格式 YYYY-MM-DD HH:MM:SS (可选)
  - `days`: 当未指定start_time时，获取最近几天的记录，默认7天
  - `page`: 页码，从1开始，默认1
  - `limit`: 每页记录数，默认20
- **权限要求**: 仅管理员和操作员可访问
- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 24,
    "records": [
      {
        "record_id": 1,
        "inspection_time": "2023-01-01T10:00:00",
        "next_inspection_time": "2023-01-01T10:30:00",
        "devices_analysis": "设备状态正常，风扇运行正常，灌溉系统待机中...",
        "environment_analysis": "室内温度28.5℃，湿度65%，光照强度适中...",
        "weather_analysis": "晴朗，室外温度30℃，无降水...",
        "comprehensive_analysis": "整体环境适宜作物生长，建议维持当前状态...",
        "actions_taken": [
          {
            "action": "_turn_on_device",
            "device_type": "fan",
            "params": "{\"level\": 2}",
            "success": true,
            "result": "风扇已开启，档位设置为2"
          }
        ],
        "created_at": "2023-01-01T10:00:00",
        "updated_at": "2023-01-01T10:00:05"
      }
    ]
  }
}
```

#### 9.4 获取SSAA操作日志

- **请求方式**: GET
- **URL**: `/ssaa/action-logs`
- **请求参数**:
  - `start_time`: 开始时间，格式 YYYY-MM-DD HH:MM:SS (可选)
  - `end_time`: 结束时间，格式 YYYY-MM-DD HH:MM:SS (可选)
  - `action_type`: 操作类型过滤 (可选)
  - `success`: 是否成功的过滤条件 (可选)
  - `page`: 页码，从1开始，默认1
  - `limit`: 每页记录数，默认20
- **权限要求**: 仅管理员和操作员可访问
- **响应**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": 86,
    "logs": [
      {
        "log_id": 1,
        "action_type": "_turn_on_device_fan",
        "action_details": {
          "device_type": "fan",
          "params": "{\"level\": 2}",
          "result": "风扇已开启，档位设置为2"
        },
        "success": true,
        "inspection_record_id": 1,
        "action_time": "2023-01-01T10:00:00",
        "created_at": "2023-01-01T10:00:05"
      },
      {
        "log_id": 2,
        "action_type": "_control_traffic_light",
        "action_details": {
          "device_type": "traffic-light",
          "params": "{\"red\": 0, \"green\": 1, \"yellow\": 0, \"power_status\": 1}",
          "result": "三色灯状态已更新：红灯关闭，黄灯关闭，绿灯开启"
        },
        "success": true,
        "inspection_record_id": 1,
        "action_time": "2023-01-01T10:00:10",
        "created_at": "2023-01-01T10:00:15"
      }
    ]
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|-------|------|
| 400001 | 请求参数错误 |
| 401001 | 未登录或token已过期 |
| 401002 | 用户名或密码错误 |
| 403001 | 无操作权限 |
| 403002 | 账号已被禁用 |
| 404001 | 用户不存在 |
| 404002 | 设备不存在 |
| 500001 | 服务器内部错误 |
| 500002 | 数据库操作失败 |

## 版本历史

| 版本号 | 日期 | 说明 |
|-------|------|------|
| 1.0 | 2023-01-01 | 初始版本 |