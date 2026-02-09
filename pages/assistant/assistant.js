// 导入请求模块
const request = require('../../utils/request');
// 导入配置信息
const { config } = require('../../utils/config');
const app = getApp();

// WebSocket服务器地址
const WS_URL = 'ws://122.152.233.112:8000/api/v1/ws/agent-chat';

Page({
  data: {
    messageList: [],
    inputValue: '',
    loading: false,
    scrollToMessage: '',
    messageId: 0,
    suggestions: [
      '最近土壤湿度如何？',
      '适合种植什么作物？',
      '如何预防常见病虫害？',
      '灌溉设备使用技巧'
    ],
    wsConnected: false,
    streamingMessageId: null,
    streamingContent: '',
    // 语音输入相关数据
    isVoiceMode: false,  // 是否为语音输入模式
    isRecording: false,  // 是否正在录音
    recordingStartTime: null, // 录音开始时间
    showCancelTip: false, // 显示取消录音提示
    touchStartY: 0, // 触摸开始位置的Y坐标
    recorder: null, // 录音管理器
    tempFilePath: '', // 临时录音文件路径
    recognizedText: '', // 语音识别的文本内容
    streamingStarted: false,
    // 处理消息的动画提示
    showProcessingIndicator: false,
    processingTexts: [
      "已收到您的消息......",
      "正在分析您的问题......",
      "正在针对您的问题给出回答......"
    ],
    currentProcessingTextIndex: 0,
    processingTimer: null
  },

  onLoad() {
    // 页面加载后自动滚动到欢迎消息
    this.setData({
      scrollToMessage: 'welcome-msg'
    });
    
    // 连接WebSocket
    this.connectWebSocket();
    
    // 初始化录音管理器
    this.initRecorder();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
    
    // 如果WebSocket未连接，尝试重新连接
    if (!this.data.wsConnected) {
      this.connectWebSocket();
    }
    
    // 检查是否有待发送的消息（从其他页面跳转过来的）
    const pendingMessage = wx.getStorageSync('pending_ai_message');
    if (pendingMessage) {
      console.log('发现待发送的消息:', pendingMessage);
      
      // 构建输入内容
      let inputContent = '';
      if (pendingMessage.content) {
        inputContent = pendingMessage.content;
      }
      
      // 清除存储的消息，避免重复发送
      wx.removeStorageSync('pending_ai_message');
      
      if (inputContent) {
        // 设置输入框的值
        this.setData({
          inputValue: inputContent
        }, () => {
          // 自动发送消息
          setTimeout(() => {
            this.sendMessage();
          }, 500); // 延迟发送，确保页面和WebSocket已准备好
        });
      }
    }
  },
  
  onUnload() {
    // 页面卸载时关闭WebSocket连接
    this.closeWebSocket();
    
    // 释放录音资源
    if (this.data.recorder) {
      this.data.recorder.stop();
    }
    
    // 清除处理动画定时器
    this.stopProcessingAnimation();
  },
  
  onHide() {
    // 页面隐藏时不主动关闭连接
  },

  // 初始化录音管理器
  initRecorder() {
    const recorderManager = wx.getRecorderManager();
    
    // 监听录音开始事件
    recorderManager.onStart(() => {
      console.log('录音开始');
      this.setData({
        isRecording: true,
        recordingStartTime: Date.now(),
        tempFilePath: ''
      });
    });
    
    // 监听录音结束事件
    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      
      // 如果没有取消录音，处理录音文件
      if (this.data.isRecording) {
        const { tempFilePath } = res;
        
        // 计算录音时长
        const duration = Date.now() - this.data.recordingStartTime;
        
        // 如果录音时间太短，提示用户
        if (duration < 1000) {
          wx.showToast({
            title: '录音时间太短',
            icon: 'none'
          });
        } else {
          // 保存录音文件路径
          this.setData({
            tempFilePath: tempFilePath
          }, () => {
            // 通过WebSocket发送语音消息
            this.sendVoiceMessageViaWebSocket(tempFilePath);
          });
        }
      }
      
      // 重置录音状态
      this.setData({
        isRecording: false,
        showCancelTip: false
      });
    });
    
    // 监听录音错误事件
    recorderManager.onError((err) => {
      console.error('录音错误', err);
      wx.showToast({
        title: '录音失败: ' + err.errMsg,
        icon: 'none'
      });
      this.setData({
        isRecording: false,
        showCancelTip: false
      });
    });
    
    // 保存录音管理器到data
    this.setData({
      recorder: recorderManager
    });
  },
  
  // 通过WebSocket发送语音消息
  sendVoiceMessageViaWebSocket(filePath) {
    // 获取当前时间
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 添加用户消息（语音输入中）
    const newMessageId = this.data.messageId + 1;
    const userMessage = {
      id: newMessageId,
      type: 'user',
      content: '正在识别语音...',
      time
    };
    
    const updatedMessageList = [...this.data.messageList, userMessage];
    
    this.setData({
      messageList: updatedMessageList,
      loading: true,
      scrollToMessage: `msg-${newMessageId}`,
      messageId: newMessageId
    }, () => {
      // 在更新完数据后确保滚动到底部
      this.scrollToBottom();
    });
    
    // 开始显示处理动画
    this.startProcessingAnimation();
    
    // 判断WebSocket是否连接
    if (!this.socketTask || !this.data.wsConnected) {
      console.error('WebSocket未连接，无法发送语音');
      this.updateVoiceMessageStatus(newMessageId, '语音发送失败：未连接到服务器');
      // 只有在发送失败时才停止处理动画
      this.stopProcessingAnimation();
      return;
    }
    
    // 读取文件内容
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: res => {
        // 构造语音消息
        const voiceMessage = {
          type: 'voice',
          audio_data: res.data,
          audio_format: 'wav',
          sample_rate: 16000
        };
        
        // 通过WebSocket发送语音数据
        this.socketTask.send({
          data: JSON.stringify(voiceMessage),
          success: () => {
            console.log('语音数据已发送到WebSocket');
          },
          fail: err => {
            console.error('发送语音数据失败', err);
            this.updateVoiceMessageStatus(newMessageId, '语音发送失败');
          }
        });
      },
      fail: err => {
        console.error('读取语音文件失败', err);
        this.updateVoiceMessageStatus(newMessageId, '读取语音文件失败');
      }
    });
  },
  
  // 更新语音消息状态
  updateVoiceMessageStatus(messageId, content) {
    const updatedMessageList = this.data.messageList.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, content: content };
      }
      return msg;
    });
    
    this.setData({
      messageList: updatedMessageList,
      loading: false
    });
    
    // 只有在消息发送失败时才停止处理动画
    if (content.includes('失败')) {
      this.stopProcessingAnimation();
      wx.showToast({
        title: content,
        icon: 'none'
      });
    }
    // 如果是语音识别成功，则保持动画继续显示，等待流式输出
  },
  
  // 切换输入模式（语音/文字）
  toggleInputMode() {
    this.setData({
      isVoiceMode: !this.data.isVoiceMode
    });
  },
  
  // 开始录音
  startRecording(e) {
    // 保存触摸开始的Y坐标
    this.setData({
      touchStartY: e.touches[0].clientY
    });
    
    // 检查录音权限并开始录音
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        const options = {
          duration: 60000, // 最长录音时长，单位ms
          sampleRate: 16000, // 采样率
          numberOfChannels: 1, // 录音通道数
          encodeBitRate: 48000, // 编码码率
          format: 'wav', // 音频格式
          frameSize: 50 // 指定帧大小
        };
        
        // 开始录音
        this.data.recorder.start(options);
      },
      fail: () => {
        wx.showToast({
          title: '请允许录音权限',
          icon: 'none'
        });
      }
    });
  },
  
  // 停止录音
  stopRecording() {
    // 如果正在录音，停止录音
    if (this.data.isRecording) {
      this.data.recorder.stop();
    }
  },
  
  // 移动手指处理（上滑取消）
  moveRecording(e) {
    if (!this.data.isRecording) return;
    
    // 获取当前触摸的Y坐标
    const touchY = e.touches[0].clientY;
    // 计算移动的距离
    const moveY = this.data.touchStartY - touchY;
    
    // 如果上滑距离超过50，显示取消提示
    if (moveY > 50) {
      if (!this.data.showCancelTip) {
        this.setData({
          showCancelTip: true
        });
      }
    } else {
      if (this.data.showCancelTip) {
        this.setData({
          showCancelTip: false
        });
      }
    }
    
    // 如果上滑距离超过100，取消录音
    if (moveY > 100) {
      console.log('上滑取消录音');
      
      // 标记为已取消，避免在onStop中处理
      this.setData({
        isRecording: false
      });
      
      // 停止录音
      this.data.recorder.stop();
      
      // 显示提示
      wx.showToast({
        title: '已取消录音',
        icon: 'none'
      });
    }
  },
  
  // 监听输入框变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 点击建议问题
  tapSuggestion(e) {
    const query = e.currentTarget.dataset.query;
    this.setData({
      inputValue: query
    });
    this.sendMessage();
  },

  // 连接WebSocket
  connectWebSocket() {
    const that = this;
    
    // 获取用户Token
    const token = wx.getStorageSync('token') || '';
    const wsUrl = token ? `${WS_URL}?token=${token}` : WS_URL;
    
    // 创建WebSocket连接
    this.socketTask = wx.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket连接创建成功');
      },
      fail: (err) => {
        console.error('WebSocket连接创建失败', err);
        this.handleWebSocketError();
      }
    });
    
    // 监听WebSocket打开
    this.socketTask.onOpen(() => {
      console.log('WebSocket连接已打开');
      this.setData({ wsConnected: true });
      
      // 开始发送心跳
      this.startHeartbeat();
    });
    
    // 监听WebSocket消息
    this.socketTask.onMessage((res) => {
      try {
        // 检查是否为心跳应答
        if (res.data === 'pong') {
          console.log('收到心跳应答');
          return;
        }
        
        // 尝试解析JSON消息
        const data = JSON.parse(res.data);
        this.handleWebSocketMessage(data);
      } catch (e) {
        console.error('解析WebSocket消息失败', e, res.data);
      }
    });
    
    // 监听WebSocket关闭
    this.socketTask.onClose(() => {
      console.log('WebSocket连接已关闭');
      this.setData({ wsConnected: false });
      this.stopHeartbeat();
    });
    
    // 监听WebSocket错误
    this.socketTask.onError((err) => {
      console.error('WebSocket连接错误', err);
      this.setData({ wsConnected: false });
      this.handleWebSocketError();
    });
  },
  
  // 关闭WebSocket连接
  closeWebSocket() {
    if (this.socketTask) {
      this.socketTask.close({
        success: () => {
          console.log('WebSocket连接已关闭');
          this.setData({ wsConnected: false });
        },
        fail: (err) => {
          console.error('关闭WebSocket连接失败', err);
        }
      });
      
      this.stopHeartbeat();
    }
  },
  
  // 处理WebSocket消息
  handleWebSocketMessage(data) {
    const { type, message, timestamp, chunk, recognized_text } = data;
    
    switch (type) {
      case 'connection_established':
        console.log('连接已建立', data);
        break;
        
      case 'processing':
        console.log('正在处理查询', data);
        // 只设置loading状态，不创建新消息
        this.setData({ loading: true });
        break;
        
      case 'voice_recognition':
        console.log('收到语音识别结果', data);
        // 找到最后一条用户消息并更新内容
        this.updateLastUserMessage(recognized_text || '语音识别失败');
        break;
        
      case 'response':
        console.log('收到响应', data);
        // 停止处理动画
        this.stopProcessingAnimation();
        // 如果消息内容为空，不创建新消息
        if (message) {
          this.addAssistantMessage(message);
        }
        this.setData({ loading: false });
        break;
        
      case 'error':
        console.error('收到错误', data);
        // 停止处理动画
        this.stopProcessingAnimation();
        // 如果是语音识别错误，更新最后一条用户消息
        if (message && message.includes('语音识别')) {
          this.updateLastUserMessage('语音识别失败: ' + message);
        } else {
          wx.showToast({
            title: message || '请求失败',
            icon: 'none'
          });
        }
        this.setData({ loading: false });
        break;
      
      case 'stream_start':
        console.log('开始流式响应', data);
        // 注意：不再在stream_start时停止处理动画，而是等到收到第一个chunk时才停止
        // 只记录流式响应开始，但不创建消息气泡
        this.setData({
          // 标记为流式响应开始，但streamingMessageId保持为null
          streamingStarted: true,
          streamingContent: ''
        });
        break;
        
      case 'stream_chunk':
        console.log('接收流式内容片段', data);
        const chunkContent = data.chunk || '';
        
        // 停止处理动画（确保不会继续显示）
        this.stopProcessingAnimation();
        
        // 如果是第一个chunk，创建新的消息气泡
        if (this.data.streamingMessageId === null && this.data.streamingStarted) {
          this.beginStreamResponse(chunkContent);
        } else if (this.data.streamingMessageId !== null) {
          // 否则添加内容到现有消息
          this.appendStreamChunk(chunkContent);
        }
        break;
        
      case 'stream_end':
        console.log('流式响应结束', data);
        // 停止处理动画
        this.stopProcessingAnimation();
        // 完成流式消息，并确保最终内容是完整的
        if (this.data.streamingMessageId !== null) {
          if (data.message) {
            // 如果stream_end有完整的message，使用它来确保内容完整
            this.setFinalStreamContent(data.message);
          } else {
            // 否则直接结束流式响应
            this.finalizeStreamResponse();
          }
        } else {
          // 如果没有创建过流式消息（没有收到过chunk），但收到了stream_end
          if (data.message) {
            // 直接创建一个完整的消息
            this.addAssistantMessage(data.message);
          }
          
          // 重置流式状态
          this.setData({
            streamingStarted: false,
            loading: false
          });
        }
        break;
        
      default:
        console.log('未知消息类型', data);
    }
  },
  
  // 处理WebSocket错误
  handleWebSocketError() {
    wx.showToast({
      title: 'AI助手连接失败，请稍后重试',
      icon: 'none',
      duration: 2000
    });
  },
  
  // 开始心跳
  startHeartbeat() {
    // 清除可能存在的旧定时器
    this.stopHeartbeat();
    
    // 创建新的心跳定时器，每30秒发送一次
    this.heartbeatTimer = setInterval(() => {
      if (this.data.wsConnected && this.socketTask) {
        this.socketTask.send({
          data: 'ping',
          fail: (err) => {
            console.error('发送心跳失败', err);
            this.reconnectWebSocket();
          }
        });
      }
    }, 30000);
  },
  
  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  },
  
  // 重连WebSocket
  reconnectWebSocket() {
    // 先关闭现有连接
    this.closeWebSocket();
    
    // 延迟1秒后重新连接
    setTimeout(() => {
      this.connectWebSocket();
    }, 1000);
  },

  // 发送消息
  sendMessage() {
    const { inputValue, messageList, messageId, wsConnected } = this.data;
    
    // 检查输入是否为空
    if (!inputValue.trim()) return;
    
    // 获取当前时间
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 添加用户消息
    const newMessageId = messageId + 1;
    const userMessage = {
      id: newMessageId,
      type: 'user',
      content: inputValue,
      time
    };
    
    const updatedMessageList = [...messageList, userMessage];
    
    this.setData({
      messageList: updatedMessageList,
      inputValue: '',
      loading: true, // 设置loading状态
      scrollToMessage: `msg-${newMessageId}`,
      messageId: newMessageId,
      streamingStarted: false, // 重置流式状态
      streamingMessageId: null
    }, () => {
      // 在更新完数据后确保滚动到底部
      this.scrollToBottom();
    });
    
    // 开始显示处理动画
    this.startProcessingAnimation();
    
    // 检查WebSocket连接
    if (!wsConnected) {
      console.log('WebSocket未连接，尝试重连');
      this.connectWebSocket();
      setTimeout(() => {
        this.sendQueryToWebSocket(inputValue);
      }, 1000);
    } else {
      // 发送查询到WebSocket
      this.sendQueryToWebSocket(inputValue);
    }
  },
  
  // 通过WebSocket发送查询
  sendQueryToWebSocket(query) {
    if (!this.socketTask || !this.data.wsConnected) {
      console.error('WebSocket未连接，无法发送查询');
      this.handleLocalFallback(query);
      return;
    }
    
    const queryData = {
      query: query
    };
    
    this.socketTask.send({
      data: JSON.stringify(queryData),
      success: () => {
        console.log('查询已发送到WebSocket');
      },
      fail: (err) => {
        console.error('发送查询失败', err);
        this.handleLocalFallback(query);
      }
    });
  },
  
  // WebSocket不可用时的本地回退处理
  handleLocalFallback(query) {
    console.log('使用本地回退处理查询');
    this.setData({ loading: false });
    
    // 注意：不再立即停止处理动画
    // 显示生成中的提示
    wx.showToast({
      title: '网络连接不稳定，使用本地回答',
      icon: 'none',
      duration: 2000
    });
    
    // 使用本地生成回复
    setTimeout(() => {
      const reply = this.generateLocalReply(query);
      // 只有在生成回复后才停止动画
      this.stopProcessingAnimation();
      this.addAssistantMessage(reply);
    }, 1000);
  },
  
  // 添加助手消息
  addAssistantMessage(content) {
    const { messageList, messageId } = this.data;
    
    // 获取当前时间
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 添加AI回复消息
    const newMessageId = messageId + 1;
    const aiMessage = {
      id: newMessageId,
      type: 'assistant',
      content: content,
      time
    };
    
    const updatedMessageList = [...messageList, aiMessage];
    
    this.setData({
      messageList: updatedMessageList,
      loading: false,
      scrollToMessage: `msg-${newMessageId}`,
      messageId: newMessageId
    }, () => {
      // 在更新完数据后确保滚动到底部
      this.scrollToBottom();
    });
  },
  
  // 开始流式响应 - 收到第一个chunk时调用
  beginStreamResponse(initialChunk = '') {
    // 获取当前时间
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 创建新的助手消息用于流式输出
    const newMessageId = this.data.messageId + 1;
    
    this.setData({
      // 将streamingMessageId设为新消息ID
      streamingMessageId: newMessageId,
      streamingContent: initialChunk,
      // 添加一个带有初始内容的助手消息到列表中
      messageList: [...this.data.messageList, {
        id: newMessageId,
        type: 'assistant',
        content: initialChunk,
        time
      }],
      messageId: newMessageId,
      scrollToMessage: `msg-${newMessageId}`,
      loading: false // 关闭loading状态
    }, () => {
      // 在更新完数据后确保滚动到底部
      this.scrollToBottom();
    });
  },
  
  // 添加流式内容片段
  appendStreamChunk(chunk) {
    if (this.data.streamingMessageId === null) {
      console.error('收到流式内容片段，但没有活跃的流式消息');
      return;
    }
    
    // 更新流式内容
    const newContent = this.data.streamingContent + chunk;
    
    // 更新消息列表中对应消息的内容
    const updatedMessageList = this.data.messageList.map(msg => {
      if (msg.id === this.data.streamingMessageId) {
        return { ...msg, content: newContent };
      }
      return msg;
    });
    
    // 更新状态，触发视图更新
    this.setData({
      streamingContent: newContent,
      messageList: updatedMessageList,
      scrollToMessage: `msg-${this.data.streamingMessageId}`
    }, () => {
      // 在更新完数据后确保滚动到底部
      this.scrollToBottom();
    });
  },
  
  // 设置流式消息的最终完整内容
  setFinalStreamContent(finalContent) {
    if (this.data.streamingMessageId === null) {
      console.error('尝试设置最终内容，但没有活跃的流式消息');
      return;
    }
    
    // 更新消息列表中对应消息的内容
    const updatedMessageList = this.data.messageList.map(msg => {
      if (msg.id === this.data.streamingMessageId) {
        return { 
          ...msg, 
          content: finalContent
        };
      }
      return msg;
    });
    
    this.setData({
      messageList: updatedMessageList,
      scrollToMessage: `msg-${this.data.streamingMessageId}`
    }, () => {
      // 内容设置完成后结束流式响应
      this.finalizeStreamResponse();
    });
  },
  
  // 完成流式响应
  finalizeStreamResponse() {
    this.setData({
      streamingMessageId: null,
      streamingContent: '',
      streamingStarted: false,
      loading: false
    });
  },
  
  // 停止生成回复
  stopGeneration() {
    // 停止处理动画 - 无论处于什么状态，用户手动停止都应该停止动画
    this.stopProcessingAnimation();
    
    // 如果正在流式输出中
    if (this.data.streamingMessageId !== null) {
      // 获取当前内容并添加中断标记
      const { streamingContent } = this.data;
      const interruptedContent = streamingContent + ' [已中断]';
      
      // 更新消息列表，标记流式消息已完成
      const updatedMessageList = this.data.messageList.map(msg => {
        if (msg.id === this.data.streamingMessageId) {
          return { 
            ...msg, 
            content: interruptedContent
          };
        }
        return msg;
      });
      
      this.setData({
        streamingMessageId: null,
        streamingContent: '',
        messageList: updatedMessageList,
        loading: false
      });
    }
    
    // 如果正在加载中但还没有开始流式输出
    if (this.data.loading && this.data.streamingMessageId === null) {
      this.setData({ loading: false });
    }
    
    // 如果WebSocket连接存在，发送取消生成的消息
    if (this.socketTask && this.data.wsConnected) {
      try {
        this.socketTask.send({
          data: JSON.stringify({ action: "cancel_generation" }),
          success: () => {
            console.log('已发送取消生成指令');
          },
          fail: (err) => {
            console.error('发送取消生成指令失败', err);
          }
        });
      } catch (error) {
        console.error('取消生成出错', error);
      }
    }
    
    // 显示提示
    wx.showToast({
      title: '已停止生成',
      icon: 'none',
      duration: 1500
    });
  },
  // 更新最后一条用户消息
  updateLastUserMessage(content) {
    const messageList = this.data.messageList;
    
    // 找到最后一条用户消息
    for (let i = messageList.length - 1; i >= 0; i--) {
      if (messageList[i].type === 'user') {
        // 创建新的消息列表，更新该消息
        const updatedMessageList = [...messageList];
        updatedMessageList[i] = {
          ...updatedMessageList[i],
          content: content
        };
        
        this.setData({
          messageList: updatedMessageList
        });
        break;
      }
    }
  },

  // 开始处理动画
  startProcessingAnimation() {
    // 先停止已有的动画
    this.stopProcessingAnimation();
    
    // 显示处理指示器并从第一条文字开始
    this.setData({
      showProcessingIndicator: true,
      currentProcessingTextIndex: 0
    });
    
    // 不再设置总体的动画时间限制，而是让动画持续到收到回复
    
    // 设置第一段文字显示5秒，然后切换到第二段
    setTimeout(() => {
      // 如果动画已停止，不执行后续操作
      if (!this.data.showProcessingIndicator) return;
      
      // 切换到第二段文字
      this.setData({
        currentProcessingTextIndex: 1
      });
      
      // 再过5秒切换到第三段文字，并保持显示直到收到回复
      setTimeout(() => {
        // 如果动画已停止，不执行后续操作
        if (!this.data.showProcessingIndicator) return;
        
        // 切换到第三段文字并保持显示
        this.setData({
          currentProcessingTextIndex: 2
        });
        
        // 不再设置自动轮播，第三段文字保持显示直到收到回复
      }, 5000);
    }, 5000);
  },
  
  // 停止处理动画
  stopProcessingAnimation() {
    // 清除所有可能的定时器
    if (this.data.processingTimer) {
      clearInterval(this.data.processingTimer);
    }
    
    // 隐藏处理指示器
    this.setData({
      showProcessingIndicator: false,
      processingTimer: null
    });
  },

  // 滚动到底部的辅助方法
  scrollToBottom() {
    // 如果messageList为空，无需滚动
    if (this.data.messageList.length === 0) return;
    
    // 获取最后一条消息的ID
    const lastMsgId = this.data.messageList[this.data.messageList.length - 1].id;
    
    this.setData({
      scrollToMessage: `msg-${lastMsgId}`
    });
  },
}); 