# 智慧农业系统项目文档

## 项目概述

智慧农业系统是一个集环境监测、设备控制、数据分析于一体的综合性农业管理平台。系统通过物联网传感器采集农田环境数据，结合人工智能技术进行分析处理，为农业生产提供智能化决策支持和自动化控制服务。

## 系统架构

### 整体架构

采用分层设计架构，所有模块在一个Python程序中实现，通过接口调用实现模块间通信：

```
┌───────────────────────────────────────────────────────────────────────────┐
│                            Python应用程序                                  │
│                                                                           │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐                   │
│  │  API服务层  │────│  Agent服务层  │────│ 数据服务层 │───┐               │
│  └──────┬──────┘    └──────────────┘    └────────────┘   │               │
│         │                  │                  │           │               │
│         │                  │                  │           │               │
│         │                  │                  │           │               │
│  ┌──────▼──────┐    ┌─────▼─────┐      ┌─────▼────┐      │               │
│  │ 硬件控制模块 │    │ 大模型接口 │      │ 数据模型 │      │               │
│  └──────┬──────┘    └───────────┘      └──────────┘      │               │
│         │                                                │               │
│         │           ┌─────────────────┐                  │               │
│         │           │   数据采集模块   │◄─────MQTT订阅────┘               │
│         │           └────────┬────────┘                                  │
│         │                    │                                           │
│         │                    │                                           │
│         │                    │                                           │
└─────────┼────────────────────┼───────────────────────────────────────────┘
          │                    │
          ▼                    │
┌─────────────────────┐        │
│    MQTT服务器       │        │
└─────────┬───────────┘        │
          │                    │
          │                    ▼
          │         ┌─────────────────────┐
          ▼         │       数据库        │
┌─────────────────┐            ▲
│   硬件设备      │            │
└─────────────────┘────────────┘
```

### 主要模块

1. **API服务层**: 负责与小程序的WebSocket通信
2. **Agent服务层**: 封装大模型API调用逻辑
3. **数据服务层**: 封装数据库操作
4. **数据采集模块**: 通过MQTT协议订阅传感器数据
5. **硬件控制模块**: 提供硬件控制接口

## 数据库设计

### 数据库概览

数据库名称为`smart_agriculture`，采用MySQL作为数据库管理系统。

### 主要数据表

1. **用户信息表(users)**: 存储系统用户信息
2. **传感器设备表(devices)**: 存储各类传感器和控制设备信息
3. **设备控制状态表(device_status)**: 记录设备当前的控制状态
4. **土壤湿度数据表(soil_humidity)**: 存储土壤湿度传感器采集的数据
5. **空气温湿度数据表(air_condition)**: 存储空气温度和湿度传感器采集的数据
6. **设备操作日志表(device_operation_logs)**: 记录设备的所有操作历史
7. **聊天消息表(chat_messages)**: 存储会话中的具体消息内容
8. **系统告警表(alerts)**: 记录系统的各类告警信息

### 表关系图

```
users ──┬─── device_status (operation_user)
        ├─── device_operation_logs (operator_id)
        ├─── chat_messages (user_id)
        └─── alerts (processed_by)

devices ─┬── device_status (device_type)
         └── device_operation_logs (device_type)
```

## API接口设计

### 基础信息

- **基础URL**: `http://122.152.233.112:8000/api/v1`
- **数据格式**: 所有API请求和响应均使用JSON格式
- **认证方式**: JWT令牌认证

### 主要接口分类

1. **用户管理接口**: 用户登录、创建用户等
2. **设备管理接口**: 获取设备详情、更新设备信息等
3. **设备控制接口**: 设备状态获取、设备控制操作等
4. **环境数据接口**: 获取土壤湿度、空气温湿度等数据
5. **聊天消息接口**: 发送消息、获取回复等
6. **告警管理接口**: 获取告警列表、处理告警等
7. **系统概览接口**: 获取系统仪表盘数据等

## WebSocket实时数据传输

### 传输架构

```
┌─────────────┐      ┌───────────────┐      ┌─────────────┐      ┌─────────────┐
│  传感器设备  │───►  │  MQTT服务器   │───►  │ MQTT采集器  │───►  │ 数据服务层  │
└─────────────┘      └───────────────┘      └──────┬──────┘      └──────┬──────┘
                                                    │                    │
                                                    │                    │
                                                    ▼                    ▼
                                            ┌──────────────────────────────────┐
                                            │         消息代理层               │
                                            │  (在MQTT采集器中实现)            │
                                            └──────────────┬───────────────────┘
                                                           │
                                                           │
                                                           ▼
                                            ┌──────────────────────────────────┐
                                            │       WebSocket服务              │
                                            └──────────────┬───────────────────┘
                                                           │
                                                           │
                                                           ▼
                     ┌─────────────────────────────────────────────────────────────┐
                     │                        小程序前端                            │
                     └─────────────────────────────────────────────────────────────┘
```

### 数据流程

1. **数据采集阶段**: 传感器设备采集数据并通过MQTT发布
2. **数据处理阶段**: MQTT采集器接收数据并处理
3. **数据传输阶段**: WebSocket服务将数据推送给前端

## 智能问答流程

### 主要流程

1. **用户提问**: 小程序端通过WebSocket发送用户提问
2. **后端处理**: 后端接收请求并转发给Agent模块
3. **Agent处理**: Agent调用大模型API选择合适的工具
4. **数据查询**: 通过选定的工具查询数据库获取信息
5. **生成回复**: Agent再次调用大模型生成回复内容
6. **流式响应**: 通过SSE流式将响应传输到小程序端

### 流程图

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ 小程序端 │────►│ 后端模块 │────►│ Agent端 │────►│ 大模型API│────►│ Agent端 │
└─────────┘     └─────────┘     └────┬────┘     └─────────┘     └────┬────┘
                                     │                                │
                                     ▼                                │
                               ┌─────────┐                           │
                               │ 数据服务 │                           │
                               └────┬────┘                           │
                                    │                                │
                                    ▼                                ▼
                               ┌─────────┐                     ┌─────────┐
                               │ 后端模块 │◄────────────────────┤ 后端模块 │
                               └────┬────┘                     └─────────┘
                                    │
                                    ▼
                               ┌─────────┐
                               │ 小程序端 │
                               └─────────┘
```

## 开发指南

### 环境配置

1. **Python环境**: Python 3.8+
2. **数据库**: MySQL 5.7+
3. **消息队列**: MQTT服务器（如Mosquitto）
4. **依赖库**: 详见requirements.txt

### 项目结构

```
smart_agriculture/
├── app/
│   ├── __init__.py
│   ├── api/           # API路由
│   ├── agent/         # 大模型Agent服务
│   ├── models/        # 数据模型
│   ├── services/      # 业务逻辑服务
│   ├── config.py      # 配置文件
│   └── utils/         # 工具函数
├── data/              # 数据文件
├── tests/             # 测试代码
├── requirements.txt   # 依赖库
├── main.py            # 主程序入口
└── README.md          # 项目文档
```

### 运行步骤

1. 克隆项目并安装依赖:
```bash
git clone [项目仓库URL]
cd smart_agriculture
pip install -r requirements.txt
```

2. 配置环境变量:
```bash
cp .env.example .env
# 编辑.env文件，设置必要的环境变量
```

3. 初始化数据库:
```bash
python scripts/init_db.py
```

4. 启动应用:
```bash
python main.py
```

### 接口调用示例

#### 用户登录

```python
import requests
import json

url = "http://122.152.233.112:8000/api/v1/auth/login"
payload = {
    "phone_number": "13800138000",
    "password": "password123"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, data=json.dumps(payload), headers=headers)
print(response.json())
```

#### WebSocket连接

```javascript
// 小程序前端WebSocket连接示例
const wsUrl = `wss://122.152.233.112:8000/api/v1/ws/sensor-data/air_sensor`;
const ws = wx.connectSocket({
  url: wsUrl
});

wx.onSocketOpen(() => {
  console.log('WebSocket连接已打开');
});

wx.onSocketMessage((res) => {
  const data = JSON.parse(res.data);
  console.log('收到服务器消息:', data);
  // 更新UI显示
});
```

## 部署指南

### 服务器要求

- **操作系统**: Ubuntu 18.04 LTS或更高版本
- **CPU**: 4核或更高
- **内存**: 8GB或更高
- **存储**: 50GB或更高

### 部署步骤

1. 安装依赖:
```bash
sudo apt update
sudo apt install -y python3 python3-pip mysql-server mosquitto mosquitto-clients
```

2. 配置MySQL:
```bash
sudo mysql_secure_installation
# 按照提示完成安全配置
```

3. 创建数据库:
```bash
mysql -u root -p
# 在MySQL提示符中执行:
CREATE DATABASE smart_agriculture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. 创建系统用户:
```bash
sudo useradd -m -s /bin/bash smart_agri
sudo passwd smart_agri
```

5. 部署应用:
```bash
cd /home/smart_agri
git clone [项目仓库URL]
cd smart_agriculture
pip3 install -r requirements.txt
```

6. 配置服务:
```bash
sudo cp deployment/smart_agri.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable smart_agri
sudo systemctl start smart_agri
```

7. 配置反向代理(Nginx):
```bash
sudo apt install -y nginx
sudo cp deployment/nginx_config /etc/nginx/sites-available/smart_agri
sudo ln -s /etc/nginx/sites-available/smart_agri /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 开发计划

### 阶段一：基础功能开发

- [ ] 用户认证系统
- [ ] 基础数据采集模块
- [ ] 设备控制接口
- [ ] 小程序前端基础页面

### 阶段二：智能化功能开发

- [ ] 大模型集成
- [ ] 智能问答系统
- [ ] 数据可视化
- [ ] 智能预警系统

### 阶段三：系统优化与扩展

- [ ] 性能优化
- [ ] 多设备类型支持
- [ ] 系统安全加固
- [ ] API文档完善

## 常见问题

### 1. 如何添加新的传感器设备?

在数据库中添加新设备记录，然后在代码中实现相应的数据处理逻辑。

```sql
INSERT INTO devices (device_type, device_code, device_name, device_category, description) 
VALUES ('light', 'LIGHT001', '光照传感器', '传感器', '农田光照监测设备');
```

### 2. WebSocket连接断开怎么办?

前端实现自动重连机制:

```javascript
function setupWebSocket() {
  // 创建WebSocket连接
  const ws = wx.connectSocket({
    url: wsUrl
  });
  
  // 监听连接关闭
  wx.onSocketClose(() => {
    console.log('连接已关闭，尝试重新连接...');
    setTimeout(setupWebSocket, 3000);  // 3秒后重连
  });
}
```

## 参考资料

- [Python FastAPI文档](https://fastapi.tiangolo.com/)
- [MySQL官方文档](https://dev.mysql.com/doc/)
- [MQTT协议规范](https://mqtt.org/mqtt-specification/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 贡献者

- 开发团队成员列表
- 联系方式

## 许可证

本项目采用MIT许可证。详见LICENSE文件。