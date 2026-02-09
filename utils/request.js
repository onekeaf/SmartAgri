const { config, requestInterceptor, responseInterceptor } = require('./config');

const request = (options) => {
  // 如果启用了模拟数据模式，则直接返回模拟数据
  if (config.useMockData) {
    console.log('模拟数据模式已启用，检查是否有对应的模拟数据...');
    const { getMockData } = require('./config');
    const mockData = getMockData(options.url, options.method);
    if (mockData) {
      console.log('使用模拟数据:', options.url);
      return Promise.resolve(mockData);
    }
    console.log('未找到对应的模拟数据，继续发起真实请求');
  }

  // 合并配置
  const requestOptions = {
    ...options,
    url: `${config.baseUrl}${options.url}`,
    timeout: config.timeout,
    header: {
      ...config.header,
      ...options.header
    }
  };
  
  console.log(`发起${options.method}请求:`, requestOptions.url);
  if (options.data) {
    console.log('请求数据:', JSON.stringify(options.data));
  }

  // 请求拦截
  const interceptedOptions = requestInterceptor(requestOptions);

  // 发起请求
  return new Promise((resolve, reject) => {
    wx.request({
      ...interceptedOptions,
      success: (res) => {
        console.log(`请求成功, 状态码: ${res.statusCode}`, res.data ? 'has data' : 'no data');
        
        // 将原始请求配置传入响应拦截器
        res.config = {
          url: options.url,
          method: options.method,
          data: options.data
        };
        
        // 如果是404或500等错误，且启用了模拟数据，尝试使用模拟数据
        if (config.useMockData && (res.statusCode >= 400)) {
          console.log('请求失败，尝试使用模拟数据...');
          const { getMockData } = require('./config');
          const mockData = getMockData(options.url, options.method);
          if (mockData) {
            console.log('找到模拟数据，使用模拟数据返回');
            resolve(mockData);
            return;
          }
        }
        
        // 响应拦截
        responseInterceptor(res)
          .then(resolve)
          .catch(reject);
      },
      fail: (err) => {
        console.error('请求失败:', err);
        console.error(`请求URL: ${requestOptions.url}`);
        console.error(`请求方法: ${options.method}`);
        if (options.data) {
          console.error('请求数据:', JSON.stringify(options.data));
        }
        
        // 请求失败时也传入配置信息（用于模拟数据）
        if (config.useMockData) {
          console.log('网络请求失败，使用模拟数据');
          const { getMockData } = require('./config');
          const mockData = getMockData(options.url, options.method);
          if (mockData) {
            console.log('找到模拟数据，使用模拟数据返回');
            resolve(mockData);
            return;
          }
        }
        reject(err);
      }
    });
  });
};

module.exports = request; 