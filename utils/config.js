const config = {
  // API基础URL
  baseUrl: 'http://122.152.233.112:8000/api/v1',
  
  // 请求超时时间（毫秒）
  timeout: 10000,
  
  // 请求头
  header: {
    'content-type': 'application/json'
  },
  
  // 是否使用模拟数据模式（当后端API未就绪时）
  useMockData: true
};

// 请求拦截器
const requestInterceptor = (options) => {
  const token = wx.getStorageSync('token');
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    };
  }
  return options;
};

// 响应拦截器
const responseInterceptor = (response) => {
  // 处理响应
  return new Promise((resolve, reject) => {
    const { statusCode, data } = response;
    
    console.log(`响应拦截器: 状态码 ${statusCode}`);
    if (data) {
      console.log('响应数据:', typeof data === 'object' ? JSON.stringify(data) : data);
    }
    
    // 如果是模拟数据模式且服务器返回错误，使用模拟数据
    if (config.useMockData && (statusCode >= 500 || statusCode === 0)) {
      console.log('使用模拟数据模式');
      const mockData = getMockData(response.config.url, response.config.method);
      if (mockData) {
        resolve(mockData);
        return;
      }
    }
    
    // 处理HTTP状态码
    if (statusCode >= 200 && statusCode < 300) {
      // 检查数据是否有效
      if (!data) {
        console.error('请求成功但无数据返回');
        reject({
          message: '服务器返回数据为空'
        });
        return;
      }
      
      // 检查是否有业务状态码
      if (data.code !== undefined) {
        // 有业务状态码，按业务状态码处理
        if (data.code >= 200 && data.code < 300) {
          console.log('业务状态码正常:', data.code);
          resolve(data);
        } else {
          console.error('业务状态码错误:', data.code, data.message);
          wx.showToast({
            title: data.message || '请求失败',
            icon: 'none'
          });
          reject(data);
        }
      } else {
        // 没有业务状态码，直接返回响应数据
        console.log('响应数据没有业务状态码，直接返回');
        
        // 包装成与API约定格式一致的数据
        const wrappedData = {
          code: 200,
          message: 'OK',
          data: data
        };
        resolve(wrappedData);
      }
    } else if (statusCode === 401) {
      // token过期，跳转到登录页
      console.error('未授权 (401)，准备跳转到登录页');
      wx.clearStorageSync();
      wx.reLaunch({
        url: '/pages/login/login'
      });
      reject({
        message: '未授权，请重新登录'
      });
    } else if (statusCode === 404) {
      console.error('API接口不存在 (404)');
      wx.showToast({
        title: 'API接口不存在',
        icon: 'none'
      });
      reject({
        message: 'API接口不存在'
      });
    } else {
      console.error(`服务器错误 (${statusCode})`);
      wx.showToast({
        title: `服务器错误 (${statusCode})`,
        icon: 'none'
      });
      reject({
        message: `服务器错误 (${statusCode})`
      });
    }
  });
};

// 模拟数据处理
const getMockData = (url, method) => {
  console.log('尝试获取模拟数据: ', url, method);
  
  // 登录接口模拟
  if (url.includes('/auth/login') && method === 'POST') {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock_token_12345',
        user: {
          user_id: 1,
          username: '测试用户',
          role: 'admin',
          avatar_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTEtMDdUMjE6MTU6MTUrMDk6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTExLTA3VDIxOjE4OjMxKzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTExLTA3VDIxOjE4OjMxKzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNhNDkzNGVjLWRk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'
        }
      }
    };
  }
  
  // 用户注册接口模拟
  if ((url.includes('/auth/users') || url.includes('/users')) && method === 'POST') {
    return {
      code: 201,
      message: '创建成功',
      data: {
        user_id: new Date().getTime(),
        username: '新用户',
        phone_number: '13800138000'
      }
    };
  }
  
  // 用户详情接口模拟
  if (url.match(/\/users\/\d+$/) && method === 'GET') {
    return {
      code: 200,
      message: '获取成功',
      data: {
        user_id: 1,
        username: '测试用户',
        phone_number: '13800138000',
        role: '农业系统工作员',
        email: 'test@example.com',
        avatar_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTEtMDdUMjE6MTU6MTUrMDk6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTExLTA3VDIxOjE4OjMxKzA5OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTExLTA3VDIxOjE4OjMxKzA5OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNhNDkzNGVjLWRk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',
        department: '监控部',
        position: '主管',
        join_date: '2022-01-01',
        work_status: '在岗',
        created_at: '2022-01-01 10:00:00',
        updated_at: '2022-01-01 10:00:00'
      }
    };
  }
  
  // 更新用户信息接口模拟
  if (url.match(/\/users\/\d+$/) && method === 'PUT') {
    return {
      code: 200,
      message: '更新成功',
      data: {
        user_id: 1,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    };
  }
  
  // 设备详情接口模拟
  if (url.match(/\/devices\/\w+$/) && method === 'GET') {
    const deviceType = url.split('/').pop();
    return {
      code: 200,
      message: '获取成功',
      data: {
        device_id: deviceType === 'fan' ? 1 : 2,
        device_code: deviceType === 'fan' ? 'FAN001' : 'IRR001',
        device_name: deviceType === 'fan' ? '风扇控制器' : '灌溉控制器',
        device_type: '控制设备',
        device_category: deviceType === 'fan' ? '风扇' : '灌溉',
        status: '正常',
        description: `农田${deviceType === 'fan' ? '通风' : '灌溉'}设备`,
        created_at: '2022-01-01 10:00:00',
        updated_at: '2022-01-01 10:00:00'
      }
    };
  }
  
  // 设备控制状态历史接口模拟
  if (url.match(/\/devices\/\w+\/status\/history/) && method === 'GET') {
    const deviceType = url.split('/')[2];
    return {
      code: 200,
      message: '获取成功',
      data: {
        total: 50,
        page: 1,
        limit: 20,
        history: [
          {
            status_id: 1,
            device_type: deviceType,
            device_name: deviceType === 'fan' ? '风扇控制器' : '灌溉控制器',
            power_status: 1,
            level: 2,
            auto_mode: 0,
            operation_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
            operation_user: {
              user_id: 1,
              username: '测试用户'
            }
          }
        ]
      }
    };
  }
  
  // 设备控制接口模拟
  if (url.match(/\/devices\/\w+\/control/) && method === 'POST') {
    const deviceType = url.split('/')[2];
    return {
      code: 200,
      message: '控制指令已发送',
      data: {
        operation_id: new Date().getTime(),
        device_type: deviceType,
        operation_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    };
  }
  
  // 土壤湿度数据接口模拟
  if (url.includes('/soil-humidity') && method === 'GET') {
    return {
      code: 200,
      message: '获取成功',
      data: {
        total: 24,
        records: [
          {
            record_id: 1,
            device_type: 'soil_humidity',
            device_name: '土壤湿度传感器',
            humidity: Math.floor(Math.random() * 30) + 40, // 随机 40-70
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: '正常'
          }
        ]
      }
    };
  }
  
  // 空气温湿度数据接口模拟
  if (url.includes('/air-condition') && method === 'GET') {
    return {
      code: 200,
      message: '获取成功',
      data: {
        total: 24,
        records: [
          {
            record_id: 1,
            device_type: 'air_sensor',
            device_name: '空气温湿度传感器',
            temperature: Math.floor(Math.random() * 10) + 20, // 随机 20-30
            humidity: Math.floor(Math.random() * 20) + 60, // 随机 60-80
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: '正常'
          }
        ]
      }
    };
  }
  
  console.log('未找到匹配的模拟数据: ', url, method);
  return null;
};

module.exports = {
  config,
  requestInterceptor,
  responseInterceptor,
  getMockData
}; 