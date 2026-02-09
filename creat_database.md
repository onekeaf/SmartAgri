# 智慧农业系统数据库设计文档

## 数据库概览

本文档描述了智慧农业系统的数据库设计，包含各表的结构、字段说明及关系。数据库名称为`smart_agriculture`。

## 数据库表设计

### 1. 用户信息表 (users)

存储系统用户信息，包括农业系统工作人员等角色。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| user_id | INT | 用户ID | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(50) | 用户名 | NOT NULL |
| phone_number | VARCHAR(20) | 手机号码 | UNIQUE, NOT NULL |
| password | VARCHAR(255) | 密码（加密存储） | NOT NULL |
| role | VARCHAR(50) | 角色（农业系统工作员等） | NOT NULL |
| email | VARCHAR(100) | 电子邮箱 | |
| avatar_url | VARCHAR(255) | 头像URL | |
| department | VARCHAR(100) | 所属部门 | |
| position | VARCHAR(100) | 职位 | |
| join_date | DATE | 入职日期 | |
| work_status | VARCHAR(20) | 工作状态（在岗/请假/离岗） | DEFAULT '在岗' |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### 2. 传感器设备表 (devices)

存储各类传感器和控制设备信息，每种类型的设备只有一个实例。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| device_type | VARCHAR(50) | 设备类型（temperature/humidity/fan/irrigation等） | PRIMARY KEY |
| device_code | VARCHAR(50) | 设备编码 | UNIQUE, NOT NULL |
| device_name | VARCHAR(100) | 设备名称 | NOT NULL |
| device_category | VARCHAR(50) | 设备类别（传感器/控制设备） | NOT NULL |
| status | VARCHAR(20) | 设备状态（正常/故障/维修中） | DEFAULT '正常' |
| description | TEXT | 设备描述 | |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### 3. 设备控制状态表 (device_status)

记录设备当前的控制状态。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| status_id | INT | 状态ID | PRIMARY KEY, AUTO_INCREMENT |
| device_type | VARCHAR(50) | 关联的设备类型 | FOREIGN KEY REFERENCES devices(device_type) |
| power_status | TINYINT | 开关状态（0-关闭，1-开启） | DEFAULT 0 |
| level | INT | 档位（1-3档，适用于风扇、灌溉） | DEFAULT 0 |
| auto_mode | TINYINT | 是否自动模式（0-手动，1-自动） | DEFAULT 0 |
| operation_time | DATETIME | 操作时间 | DEFAULT CURRENT_TIMESTAMP |
| operation_user | INT | 操作用户 | FOREIGN KEY REFERENCES users(user_id) |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### 4. 土壤湿度数据表 (soil_humidity)

存储土壤湿度传感器采集的数据。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| record_id | INT | 记录ID | PRIMARY KEY, AUTO_INCREMENT |
| humidity | DECIMAL(5,2) | 湿度值（%） | NOT NULL |
| timestamp | DATETIME | 采集时间 | DEFAULT CURRENT_TIMESTAMP |
| status | VARCHAR(20) | 数据状态（正常/异常） | DEFAULT '正常' |
| remarks | TEXT | 备注信息 | |

### 5. 空气温湿度数据表 (air_condition)

存储空气温度和湿度传感器采集的数据。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| record_id | INT | 记录ID | PRIMARY KEY, AUTO_INCREMENT |
| temperature | DECIMAL(5,2) | 温度值（℃） | NOT NULL |
| humidity | DECIMAL(5,2) | 湿度值（%） | NOT NULL |
| timestamp | DATETIME | 采集时间 | DEFAULT CURRENT_TIMESTAMP |
| status | VARCHAR(20) | 数据状态（正常/异常） | DEFAULT '正常' |
| remarks | TEXT | 备注信息 | |

### 6. 设备操作日志表 (device_operation_logs)

记录设备的所有操作历史。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| log_id | INT | 日志ID | PRIMARY KEY, AUTO_INCREMENT |
| device_type | VARCHAR(50) | 关联的设备类型 | FOREIGN KEY REFERENCES devices(device_type) |
| operation_type | VARCHAR(50) | 操作类型（开启/关闭/调节等） | NOT NULL |
| operation_params | JSON | 操作参数 | |
| operator_id | INT | 操作人ID | FOREIGN KEY REFERENCES users(user_id) |
| operator_type | VARCHAR(20) | 操作人类型（用户/系统/自动） | DEFAULT '用户' |
| operation_time | DATETIME | 操作时间 | DEFAULT CURRENT_TIMESTAMP |

### 7. 聊天消息表 (chat_messages)

存储会话中的具体消息内容。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| message_id | INT | 消息ID | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | 用户ID | FOREIGN KEY REFERENCES users(user_id) |
| content | TEXT | 消息内容 | NOT NULL |
| response | TEXT | 系统回复 | |
| timestamp | DATETIME | 消息时间 | DEFAULT CURRENT_TIMESTAMP |
| tokens | INT | 消息令牌数 | |
| tool_calls | JSON | 工具调用信息 | |

### 8. 系统告警表 (alerts)

记录系统的各类告警信息。

| 字段名 | 类型 | 描述 | 约束 |
|-------|------|------|------|
| alert_id | INT | 告警ID | PRIMARY KEY, AUTO_INCREMENT |
| alert_type | VARCHAR(50) | 告警类型（设备故障/阈值超限/系统异常等） | NOT NULL |
| source_type | VARCHAR(50) | 来源类型（设备/系统/数据等） | NOT NULL |
| source_id | VARCHAR(50) | 来源ID | |
| alert_message | TEXT | 告警信息 | NOT NULL |
| alert_time | DATETIME | 告警时间 | DEFAULT CURRENT_TIMESTAMP |
| status | VARCHAR(20) | 处理状态（未处理/已处理/已忽略） | DEFAULT '未处理' |
| processed_by | INT | 处理人ID | FOREIGN KEY REFERENCES users(user_id) |
| processed_time | DATETIME | 处理时间 | |
| process_result | TEXT | 处理结果 | |

## 数据库创建SQL语句

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS smart_agriculture DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smart_agriculture;

-- 1. 创建用户信息表
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    avatar_url VARCHAR(255),
    department VARCHAR(100),
    position VARCHAR(100),
    join_date DATE,
    work_status VARCHAR(20) DEFAULT '在岗',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 创建传感器设备表
CREATE TABLE devices (
    device_type VARCHAR(50) PRIMARY KEY,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    device_category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT '正常',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 创建设备控制状态表
CREATE TABLE device_status (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    device_type VARCHAR(50),
    power_status TINYINT DEFAULT 0,
    level INT DEFAULT 0,
    auto_mode TINYINT DEFAULT 0,
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    operation_user INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_type) REFERENCES devices(device_type),
    FOREIGN KEY (operation_user) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 创建土壤湿度数据表
CREATE TABLE soil_humidity (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    humidity DECIMAL(5,2) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT '正常',
    remarks TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. 创建空气温湿度数据表
CREATE TABLE air_condition (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT '正常',
    remarks TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. 创建设备操作日志表
CREATE TABLE device_operation_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    device_type VARCHAR(50),
    operation_type VARCHAR(50) NOT NULL,
    operation_params JSON,
    operator_id INT,
    operator_type VARCHAR(20) DEFAULT '用户',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_type) REFERENCES devices(device_type),
    FOREIGN KEY (operator_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. 创建聊天消息表
CREATE TABLE chat_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    content TEXT NOT NULL,
    response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    tokens INT,
    tool_calls JSON,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. 创建系统告警表
CREATE TABLE alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(50),
    alert_message TEXT NOT NULL,
    alert_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT '未处理',
    processed_by INT,
    processed_time DATETIME,
    process_result TEXT,
    FOREIGN KEY (processed_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建索引
CREATE INDEX idx_device_category ON devices(device_category);
CREATE INDEX idx_soil_humidity_timestamp ON soil_humidity(timestamp);
CREATE INDEX idx_air_condition_timestamp ON air_condition(timestamp);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);

-- 预置设备数据
INSERT INTO devices (device_type, device_code, device_name, device_category, description) VALUES
('temperature', 'TEMP001', '温度传感器', '传感器', '农田温度监测设备'),
('humidity', 'HUM001', '湿度传感器', '传感器', '农田湿度监测设备'),
('fan', 'FAN001', '风扇控制器', '控制设备', '农田通风设备'),
('irrigation', 'IRR001', '灌溉控制器', '控制设备', '农田灌溉设备');
```

## 注意事项

1. 执行SQL语句前请确保：
   - MySQL服务已启动
   - 拥有创建数据库和表的权限
   - 数据库字符集设置为utf8mb4，以支持完整的Unicode字符集

2. 表之间的外键关系：
   - 创建表的顺序需要遵循依赖关系
   - 先创建被引用的表（如users、devices），再创建引用它们的表

3. 索引说明：
   - 主键自动创建索引
   - 创建了常用查询字段的索引以提高查询性能
   - 根据实际使用情况可能需要调整或添加更多索引

4. 字符集和存储引擎：
   - 使用utf8mb4字符集确保支持所有Unicode字符
   - 使用InnoDB存储引擎支持事务和外键

5. 数据库变更说明：
   - 设备表由基于设备ID改为基于设备类型，每种设备类型只有一个实例
   - 移除了设备表和环境数据表之间的直接外键关系
   - 添加了预置设备数据，包含基本的传感器和控制设备

