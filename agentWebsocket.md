# 智能农业 Agent WebSocket API 文档

本文档描述了用于与智能农业Agent进行实时交互的 WebSocket API。

## 1. 端点 URL

```
ws://<your_server_address>/ws/agent-chat
```

**注意:** 请将 `<your_server_address>` 替换为您的实际服务器地址和端口。

## 2. 目的

该 WebSocket 端点提供了一个实时双向通信通道，允许用户通过发送文本查询与智能农业Agent进行交互，并接收Agent的处理结果。

## 3. 连接参数

建立 WebSocket 连接时，可以通过查询参数传递认证信息：

-   `token` (可选, 字符串): 用于用户认证的 JWT (JSON Web Token)。如果提供了有效的 `token`，服务器将识别用户身份；否则，用户将被视为匿名游客。

**示例连接 URL:**

```
ws://<your_server_address>/ws/agent-chat?token=YOUR_JWT_TOKEN
```

## 4. 连接建立

成功建立 WebSocket 连接后，服务器将向客户端发送一条初始 JSON 消息，表明连接已成功建立。

**初始消息格式:**

```json
{
  "type": "connection_established",
  "message": "已连接到智能农业Agent聊天服务",
  "session_id": "session_xxxxxxxxxx_xxxxxxxx", // 唯一的会话ID
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ",     // ISO 8601 格式的时间戳
  "user_info": {                           // 用户信息
    "user_id": 123,                      // 用户ID (如果已认证)
    "username": "用户名",                // 用户名 (如果已认证，否则为 \"游客\")
    "role": "用户角色"                   // 用户角色 (如果已认证，否则为 \"guest\")
  }
}
```

## 5. 客户端消息

客户端应向服务器发送以下格式的消息：

### 5.1 查询消息 (JSON)

用于向 Agent 发送查询。

```json
{
  "query": "你的查询内容"
}
```

-   `query` (必填, 字符串): 用户希望 Agent 处理的自然语言查询。

### 5.2 语音消息 (JSON)

用于向 Agent 发送语音查询。

```json
{
  "type": "voice",
  "audio_data": "BASE64编码的音频数据",
  "audio_format": "wav",
  "sample_rate": 16000
}
```

- `type` (必填, 字符串): 消息类型，必须为 "voice"
- `audio_data` (必填, 字符串): BASE64编码的音频二进制数据
- `audio_format` (可选, 字符串): 音频格式，默认为 "wav"，支持 "wav"、"mp3"、"pcm" 等格式
- `sample_rate` (可选, 整数): 音频采样率，默认为 16000

### 5.3 心跳消息 (Text)

用于保持连接活跃，防止因不活动而被关闭。

```
ping
```

当服务器收到 "ping" 消息时，会回复 "pong"。

## 6. 服务器消息

服务器会向客户端发送不同类型的 JSON 消息来响应客户端请求或通知状态变化。

### 6.1 处理中消息

告知客户端服务器正在处理其查询。

```json
{
  "type": "processing",
  "message": "正在处理您的请求...",
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
}
```

### 6.2 语音识别结果消息

告知客户端语音识别的结果。

```json
{
  "type": "voice_recognition",
  "recognized_text": "识别出的文本内容",
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
}
```

### 6.3 响应消息

包含 Agent 对用户查询的处理结果。

```json
{
  "type": "response",
  "message": "这是Agent对你查询的回复内容...",
  "session_id": "session_xxxxxxxxxx_xxxxxxxx", // 对应的会话ID
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
}
```

### 6.4 流式响应消息

当使用流式响应时，服务器会依次发送以下消息：

```json
{
  "type": "stream_start",
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
}
```

```json
{
  "type": "stream_chunk",
  "chunk": "文本片段...",
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
}
```

```json
{
  "type": "stream_end",
  "message": "完整的回复文本...",
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
}
```

### 6.5 错误消息

当处理过程中发生错误时发送。

```json
{
  "type": "error",
  "message": "具体的错误信息描述",
  "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
}
```

常见的错误信息包括：

-   "查询内容不能为空"
-   "语音数据不能为空"
-   "语音识别失败: [具体错误详情]"
-   "消息格式不正确，请发送JSON格式的消息"
-   "处理消息时出错: [具体错误详情]"

### 6.6 心跳响应 (Text)

响应客户端的 "ping" 消息。

```
pong
```

## 7. 错误处理

-   **连接错误:** WebSocket 连接可能因网络问题或服务器端问题而失败。
-   **认证错误:** 如果提供的 `token` 无效或过期，用户将被视为游客。
-   **消息格式错误:** 如果客户端发送非 JSON 格式的消息（除了 \"ping\"），服务器将返回错误消息。
-   **处理错误:** 如果 Agent 在处理查询时遇到内部错误，服务器将返回错误消息。

## 8. 断开连接

-   客户端可以主动关闭 WebSocket 连接。
-   服务器可能因超时或其他原因关闭连接。
-   当连接断开时，服务器会记录日志，并清理相关资源。

## 9. 示例交互

1.  **客户端连接:** `ws://<your_server_address>/ws/agent-chat`
2.  **服务器响应 (连接建立):**
    ```json
    {
      "type": "connection_established",
      "message": "已连接到智能农业Agent聊天服务", ...
    }
    ```
3.  **客户端发送查询:**
    ```json
    {
      "query": "最近的土壤湿度怎么样？"
    }
    ```
4.  **服务器响应 (处理中):**
    ```json
    {
      "type": "processing",
      "message": "正在处理您的请求...", ...
    }
    ```
5.  **服务器响应 (回复):**
    ```json
    {
      "type": "response",
      "message": "根据最新数据，土壤湿度为 55%，处于正常范围。", ...
    }
    ```
6.  **客户端发送心跳:** `ping`
7.  **服务器响应 (心跳):** `pong`
8.  **客户端断开连接**

## 10. HTTP语音识别接口

除了WebSocket接口外，系统还提供了一个基于HTTP的语音识别接口。

### 请求格式

- **请求方式**: POST
- **URL**: `/api/voice/agent`
- **内容类型**: `multipart/form-data`
- **参数**:
  - `audio_file`: (必填) 音频文件
  - `audio_format`: (可选) 音频格式，默认为 "wav"
  - `sample_rate`: (可选) 采样率，默认为 16000
  - `token`: (可选) JWT认证令牌

### 响应格式

```json
{
  "success": true,
  "text": "识别出的文本内容",
  "agent_response": "Agent的回复内容",
  "error": ""
}
```

或者，在出错的情况下:

```json
{
  "success": false,
  "text": "",
  "error": "错误详情"
}
```

### 示例使用

```javascript
// 使用FormData发送语音文件
const formData = new FormData();
formData.append('audio_file', audioBlob, 'recording.wav');
formData.append('audio_format', 'wav');
formData.append('sample_rate', '16000');
formData.append('token', 'YOUR_JWT_TOKEN'); // 可选的认证令牌

const response = await fetch('/api/voice/agent', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('识别文本:', result.text);
  console.log('Agent回复:', result.agent_response);
} else {
  console.error('处理失败:', result.error);
}
```

## 11. 语音识别使用场景

### WebSocket语音识别流程

1. 客户端使用WebSocket连接发送语音数据（Base64编码）
2. 服务器接收语音数据并进行识别
3. 服务器返回识别结果（`voice_recognition`消息）
4. 服务器自动将识别的文本传给Agent处理
5. 服务器返回Agent的处理结果（与文本查询的流程相同）

### HTTP语音识别流程

1. 客户端通过HTTP POST请求发送音频文件
2. 服务器接收音频文件并进行识别
3. 服务器将识别的文本传给Agent处理
4. 服务器在HTTP响应中返回识别文本和Agent回复
